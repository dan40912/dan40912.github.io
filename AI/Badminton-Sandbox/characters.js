import { racketOf } from "./abilities.js";
export const TEAM_COLORS = ["#4782a5", "#4782a5", "#c56b57", "#c56b57"];
export const escapeHTML = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function portrait(p, index, opts = {}) {
  const { expression = "ready", faceOnly = false } = opts;
  const skin =
      { light: "#f4d2ba", warm: "#dca77f", deep: "#a66c4d" }[p.skin] ||
      "#dca77f",
    hair = ["#253b38", "#403b32", "#273d36", "#594236"][index],
    jersey = TEAM_COLORS[index],
    outline = "#243b35",
    [frame, accent] = racketOf(p).colors;
  const face =
    p.face === "angular"
      ? "M53 70Q50 36 100 35Q150 36 147 70L143 112 124 138 100 148 76 138 57 112Z"
      : p.face === "oval"
        ? "M53 73Q50 32 100 33Q150 32 147 73L145 104Q139 146 100 150Q61 146 55 104Z"
        : "M50 73Q49 33 100 33Q151 33 150 73L149 105Q144 145 100 145Q56 145 51 105Z";
  const back =
    p.hair === "pony"
      ? `<path d="M143 60Q193 61 164 144Q170 111 139 106Z" fill="${hair}" stroke="${outline}" stroke-width="2"/>`
      : p.hair === "bob"
        ? `<path d="M48 55Q100 7 152 55L158 124Q149 139 127 133L74 133Q47 144 42 124Z" fill="${hair}" stroke="${outline}" stroke-width="2"/>`
        : "";
  const fringe =
    {
      crop: "M51 77Q43 40 63 25L65 36 82 17 85 31 108 13 108 28 127 23 139 37Q157 53 149 77L134 62 122 65 109 52 88 66 76 60 62 79Z",
      sweep:
        "M50 81Q38 41 74 24Q117 9 145 39Q158 59 149 82L133 59Q107 48 69 69L61 86Z",
      bob: "M51 85Q43 40 78 27Q113 14 138 38Q155 58 149 87L133 63 124 72 119 59 89 62 68 57 60 87Z",
      pony: "M50 81Q39 43 69 28Q103 13 132 29Q161 46 149 85L136 57Q120 70 91 57L68 69 60 88Z",
    }[p.hair] || "";
  const happy = expression === "happy",
    sad = expression === "sad",
    focused = expression === "focus";
  const eyes = happy
    ? '<path d="M69 97q10-13 20 0M111 97q10-13 20 0" fill="none" stroke="#243b35" stroke-width="3.5" stroke-linecap="round"/>'
    : `<g fill="#fffefa" stroke="${outline}" stroke-width="2"><path d="M67 93q11-10 24 0v12q-11 8-22-1Z"/><path d="M109 93q12-10 24 0l-2 11q-11 9-22 1Z"/></g><g fill="${outline}"><ellipse cx="81" cy="99" rx="5.3" ry="8"/><ellipse cx="119" cy="99" rx="5.3" ry="8"/></g><g fill="white"><circle cx="79" cy="96" r="2.5"/><circle cx="117" cy="96" r="2.5"/><circle cx="83" cy="103" r="1"/><circle cx="121" cy="103" r="1"/></g>`;
  const brows = focused
    ? "M68 80l21 6M111 86l21-6"
    : sad
      ? "M68 85l20-5M112 80l20 5"
      : "M68 83q10-5 20-1M112 82q10-4 20 1";
  const mouth = happy
    ? '<path d="M87 120q13 18 26 0Z" fill="#fffefa" stroke="#243b35" stroke-width="2"/>'
    : sad
      ? '<path d="M90 126q10-8 20 0" fill="none" stroke="#243b35" stroke-width="2.2" stroke-linecap="round"/>'
      : '<path d="M91 121q9 6 18 0" fill="none" stroke="#243b35" stroke-width="2.2" stroke-linecap="round"/>';
  const accessory =
    p.accessory === "band"
      ? `<path d="M53 71q47-15 94 0l-1 10q-46-13-92 0Z" fill="#eef2dd" stroke="${outline}" stroke-width="1.5"/><path d="m93 66 13 10" stroke="${jersey}" stroke-width="3"/>`
      : p.accessory === "glasses"
        ? '<g fill="none" stroke="#304f44" stroke-width="2.5"><rect x="63" y="89" width="32" height="23" rx="8"/><rect x="105" y="89" width="32" height="23" rx="8"/><path d="M95 97h10M54 95h9M137 95h9"/></g>'
        : "";
  const head = `${back}<ellipse cx="51" cy="94" rx="9" ry="13" fill="${skin}" stroke="${outline}" stroke-width="2"/><ellipse cx="149" cy="94" rx="9" ry="13" fill="${skin}" stroke="${outline}" stroke-width="2"/><path d="${face}" fill="${skin}" stroke="${outline}" stroke-width="2.5"/><ellipse cx="67" cy="114" rx="9" ry="4" fill="#d4777540"/><ellipse cx="133" cy="114" rx="9" ry="4" fill="#d4777540"/><path d="${fringe}" fill="${hair}" stroke="${outline}" stroke-width="2.3"/><path d="M72 43q10-11 25-11" fill="none" stroke="#fffefa18" stroke-width="4" stroke-linecap="round"/><path d="${brows}" fill="none" stroke="${outline}" stroke-width="3" stroke-linecap="round"/>${eyes}<path d="m100 105-3 8h5" fill="none" stroke="#99624b" stroke-width="1.5" stroke-linecap="round"/>${mouth}${accessory}${focused ? '<path d="M142 80q-5 8 0 11q5-3 0-11Z" fill="#b9dce6" stroke="#507e8b" stroke-width="1"/>' : ""}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${faceOnly ? "35 17 130 140" : "0 0 200 240"}" aria-hidden="true"><g stroke-linejoin="round">${!faceOnly ? `<ellipse cx="100" cy="225" rx="57" ry="7" fill="#183d310b"/><path d="M57 173Q43 183 40 215L65 219 73 182M143 173q14 10 17 42l-25 4-8-37" fill="${skin}" stroke="${outline}" stroke-width="2.3"/><path d="M61 161 82 152h36l21 9 8 59H53Z" fill="${jersey}" stroke="${outline}" stroke-width="2.5"/><path d="m61 167 17 8M139 167l-17 8" stroke="#fffefa" stroke-width="7"/><path d="M86 144v15q14 17 28 0v-15" fill="${skin}" stroke="${outline}" stroke-width="2"/><path d="M82 156q18 28 36 0" fill="none" stroke="#fffefa" stroke-width="4"/><path d="m87 194 19-15M95 180h12v12" fill="none" stroke="#eef2dd" stroke-width="3"/><path d="M150 183l12-35" stroke="${outline}" stroke-width="4.5" stroke-linecap="round"/><path d="M150 183l12-35" stroke="${accent}" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="166" cy="133" rx="13" ry="19" transform="rotate(20 166 133)" fill="#fffefa55" stroke="${outline}" stroke-width="4.6"/><ellipse cx="166" cy="133" rx="13" ry="19" transform="rotate(20 166 133)" fill="none" stroke="${frame}" stroke-width="2.8"/><path d="M159 119l12 27M155 128l21 7" stroke="#869d8c" stroke-width="1"/>` : ""}${head}</g></svg>`;
}
export function describe(p) {
  const descriptions = {
    attack: "偏好後場下壓，與隊友創造前後配合。",
    net: "善用網前小球，為隊友創造進攻機會。",
    defense: "優先穩住防守，等待轉守為攻的時機。",
    drive: "用平抽與快壓，搶下中場的主動權。",
    allround: "依球的位置，在攻守之間靈活切換。",
  };
  return descriptions[p.style];
}

