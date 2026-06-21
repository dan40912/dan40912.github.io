from __future__ import annotations

import base64
import sys
from pathlib import Path

from PIL import Image


LABELS = [
    "master-policy-agent",
    "safety-agent",
    "authorization-agent",
    "market-scan-agent",
    "risk-manager-agent",
    "tp-sl-agent",
    "position-manager-agent",
    "execution-agent",
    "heartbeat-reporter-agent",
]


def extract(source: Path, output_dir: Path) -> list[tuple[str, int, int]]:
    output_dir.mkdir(parents=True, exist_ok=True)
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    results: list[tuple[str, int, int]] = []

    for index, name in enumerate(LABELS):
        row, col = divmod(index, 3)
        x0 = round(col * width / 3)
        x1 = round((col + 1) * width / 3)
        y0 = round(row * height / 3)
        y1 = round((row + 1) * height / 3)
        cell_height = y1 - y0

        crop = image.crop((x0, y0, x1, y1))
        gray = crop.convert("L")
        gray_pixels = gray.load()
        crop_width, crop_height = crop.size

        dark = [
            [gray_pixels[x, y] < 90 for x in range(crop_width)]
            for y in range(crop_height)
        ]
        seen = [[False for _ in range(crop_width)] for _ in range(crop_height)]
        kept_points: list[tuple[int, int]] = []

        for start_y in range(crop_height):
            for start_x in range(crop_width):
                if seen[start_y][start_x] or not dark[start_y][start_x]:
                    continue

                stack = [(start_x, start_y)]
                seen[start_y][start_x] = True
                component: list[tuple[int, int]] = []

                while stack:
                    x, y = stack.pop()
                    component.append((x, y))
                    for ny in range(max(0, y - 1), min(crop_height, y + 2)):
                        for nx in range(max(0, x - 1), min(crop_width, x + 2)):
                            if seen[ny][nx] or not dark[ny][nx]:
                                continue
                            seen[ny][nx] = True
                            stack.append((nx, ny))

                comp_width = max(point[0] for point in component) - min(point[0] for point in component) + 1
                comp_height = max(point[1] for point in component) - min(point[1] for point in component) + 1
                area = len(component)

                # Label glyphs are short components. Figures are tall, dense silhouettes.
                if (comp_height >= 42 and area >= 420) or area >= 1500:
                    kept_points.extend(component)

        dark_points = kept_points
        if not dark_points:
            continue

        min_x = max(0, min(point[0] for point in dark_points) - 10)
        max_x = min(crop_width - 1, max(point[0] for point in dark_points) + 10)
        min_y = max(0, min(point[1] for point in dark_points) - 10)
        max_y = min(crop_height - 1, max(point[1] for point in dark_points) + 10)

        crop = crop.crop((min_x, min_y, max_x + 1, max_y + 1))
        gray = crop.convert("L")
        transparent = Image.new("RGBA", crop.size, (0, 0, 0, 0))
        gray_pixels = gray.load()
        out_pixels = transparent.load()

        keep = set((x - min_x, y - min_y) for x, y in kept_points)
        expanded_keep = set(keep)
        for x, y in keep:
            for ny in range(max(0, y - 1), min(crop.size[1], y + 2)):
                for nx in range(max(0, x - 1), min(crop.size[0], x + 2)):
                    expanded_keep.add((nx, ny))

        for y in range(crop.size[1]):
            for x in range(crop.size[0]):
                if (x, y) not in expanded_keep:
                    continue
                luminance = gray_pixels[x, y]
                if luminance < 170:
                    alpha = max(0, min(255, int((170 - luminance) * 2.1)))
                    if luminance < 80:
                        alpha = 255
                    out_pixels[x, y] = (0, 0, 0, alpha)

        png_path = output_dir / f"{name}.png"
        svg_path = output_dir / f"{name}.svg"
        transparent.save(png_path)

        encoded = base64.b64encode(png_path.read_bytes()).decode("ascii")
        svg_path.write_text(
            (
                f'<svg xmlns="http://www.w3.org/2000/svg" width="{transparent.size[0]}" '
                f'height="{transparent.size[1]}" viewBox="0 0 {transparent.size[0]} {transparent.size[1]}">'
                f'<image width="{transparent.size[0]}" height="{transparent.size[1]}" '
                f'href="data:image/png;base64,{encoded}"/></svg>\n'
            ),
            encoding="utf-8",
        )
        results.append((name, transparent.size[0], transparent.size[1]))

    return results


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: extract_agent_assets.py <source-image> <output-dir>", file=sys.stderr)
        return 2

    source = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    for name, width, height in extract(source, output_dir):
        print(f"{name}: {width}x{height}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
