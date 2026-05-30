from __future__ import annotations

import html
import zipfile
from pathlib import Path


OUT = Path(__file__).with_name("FundSwap_UX_Portfolio_Presentation.pptx")
EMU = 914400
W = 13.333333 * EMU
H = 7.5 * EMU


def emu(inch: float) -> int:
    return int(inch * EMU)


def esc(text: str) -> str:
    return html.escape(text, quote=False)


class Slide:
    def __init__(self, title: str = ""):
        self.title = title
        self.items: list[str] = []
        self._id = 1
        self.bg("#F5F5F5")

    def next_id(self) -> int:
        self._id += 1
        return self._id

    def bg(self, color: str) -> None:
        self.rect(0, 0, 13.333333, 7.5, color, color, name="bg")

    def rect(self, x, y, w, h, fill="#FFFFFF", line="#EBEBEB", radius=False, name="shape", opacity=None):
        sid = self.next_id()
        fill = fill.replace("#", "")
        line = line.replace("#", "")
        alpha = f'<a:alpha val="{int(opacity * 100000)}"/>' if opacity is not None else ""
        self.items.append(
            f"""
            <p:sp>
              <p:nvSpPr><p:cNvPr id="{sid}" name="{name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
              <p:spPr>
                <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
                <a:prstGeom prst="{'roundRect' if radius else 'rect'}"><a:avLst/></a:prstGeom>
                <a:solidFill><a:srgbClr val="{fill}">{alpha}</a:srgbClr></a:solidFill>
                <a:ln w="9525"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>
              </p:spPr>
              <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
            </p:sp>
            """
        )

    def line(self, x1, y1, x2, y2, color="#CCCCCC", width=1.1):
        sid = self.next_id()
        self.items.append(
            f"""
            <p:cxnSp>
              <p:nvCxnSpPr><p:cNvPr id="{sid}" name="line"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr>
              <p:spPr>
                <a:xfrm><a:off x="{emu(min(x1,x2))}" y="{emu(min(y1,y2))}"/><a:ext cx="{emu(abs(x2-x1))}" cy="{emu(abs(y2-y1))}"/></a:xfrm>
                <a:prstGeom prst="line"><a:avLst/></a:prstGeom>
                <a:ln w="{int(width*12700)}"><a:solidFill><a:srgbClr val="{color.replace('#','')}"/></a:solidFill></a:ln>
              </p:spPr>
            </p:cxnSp>
            """
        )

    def ellipse(self, x, y, w, h, fill="#FF9664", line="#FF9664"):
        sid = self.next_id()
        self.items.append(
            f"""
            <p:sp>
              <p:nvSpPr><p:cNvPr id="{sid}" name="ellipse"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
              <p:spPr>
                <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
                <a:prstGeom prst="ellipse"><a:avLst/></a:prstGeom>
                <a:solidFill><a:srgbClr val="{fill.replace('#','')}"/></a:solidFill>
                <a:ln w="9525"><a:solidFill><a:srgbClr val="{line.replace('#','')}"/></a:solidFill></a:ln>
              </p:spPr>
              <p:txBody><a:bodyPr/><a:lstStyle/><a:p/></p:txBody>
            </p:sp>
            """
        )

    def text(self, x, y, w, h, text, size=22, color="#333333", bold=False, align="l", valign="top", name="text"):
        sid = self.next_id()
        color = color.replace("#", "")
        body_anchor = {"top": "t", "mid": "ctr", "bottom": "b"}.get(valign, "t")
        paragraphs = []
        for para in str(text).split("\n"):
            paragraphs.append(
                f"""
                <a:p>
                  <a:pPr algn="{align}"/>
                  <a:r>
                    <a:rPr lang="zh-TW" sz="{int(size*100)}" {'b="1"' if bold else ''}>
                      <a:solidFill><a:srgbClr val="{color}"/></a:solidFill>
                      <a:latin typeface="Noto Sans TC"/>
                      <a:ea typeface="Noto Sans TC"/>
                    </a:rPr>
                    <a:t>{esc(para)}</a:t>
                  </a:r>
                </a:p>
                """
            )
        self.items.append(
            f"""
            <p:sp>
              <p:nvSpPr><p:cNvPr id="{sid}" name="{name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
              <p:spPr>
                <a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                <a:noFill/><a:ln><a:noFill/></a:ln>
              </p:spPr>
              <p:txBody>
                <a:bodyPr wrap="square" anchor="{body_anchor}" lIns="0" tIns="0" rIns="0" bIns="0"/>
                <a:lstStyle/>
                {''.join(paragraphs)}
              </p:txBody>
            </p:sp>
            """
        )

    def chip(self, x, y, text, w=1.05, color="#FF9664"):
        self.rect(x, y, w, 0.28, "#FFF3EE", "#FFD4C0", radius=True)
        self.text(x + 0.07, y + 0.055, w - 0.14, 0.17, text, 8.5, color, True, "ctr", "mid")

    def bar(self, x, y, w, label, pct, color="#FF9664"):
        self.text(x, y - 0.02, 1.65, 0.18, label, 10, "#666666", True)
        self.rect(x + 1.72, y, w, 0.13, "#EBEBEB", "#EBEBEB", radius=True)
        self.rect(x + 1.72, y, w * pct, 0.13, color, color, radius=True)
        self.text(x + 1.72 + w + 0.08, y - 0.06, 0.5, 0.22, f"{int(pct*100)}", 10, "#262626", True)

    def footer(self, num: int):
        self.line(0.62, 7.08, 12.72, 7.08, "#E0E0E0")
        self.text(0.62, 7.18, 4, 0.16, "FundSwap UX Demo Portfolio", 8.5, "#999999", True)
        self.text(12.1, 7.18, 0.6, 0.16, f"{num:02d}", 8.5, "#999999", True, "r")

    def xml(self):
        return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      {''.join(self.items)}
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""


def add_header(s: Slide, kicker: str, title: str, num: int):
    s.text(0.62, 0.36, 3.5, 0.2, kicker.upper(), 9.5, "#666666", True)
    s.text(0.62, 0.66, 8.9, 0.68, title, 24, "#262626", True)
    s.text(11.1, 0.42, 1.6, 0.24, "好好證券 UX", 10, "#333333", True, "r")
    s.footer(num)


def make_deck() -> list[Slide]:
    slides: list[Slide] = []

    # 1 Cover
    s = Slide()
    s.rect(0.45, 0.45, 12.45, 6.58, "#FFFFFF", "#EBEBEB", radius=True)
    s.text(0.8, 0.86, 3, 0.24, "FUNDSWAP INTERVIEW PORTFOLIO", 10, "#666666", True)
    s.text(0.8, 1.26, 7.2, 1.82, "從基金資料網站，\n改成能幫使用者做判斷的基金探索體驗", 32, "#262626", True)
    s.text(0.84, 3.38, 6.1, 0.65, "核心觀點：FundSwap 的問題不是基金資料不夠，而是使用者缺少把資料轉成投資決策的路徑。", 15, "#666666")
    s.rect(7.6, 1.45, 4.65, 2.15, "#FFF3EE", "#FFD4C0", radius=True)
    s.text(7.95, 1.82, 3.9, 0.35, "設計取捨", 13, "#FF661D", True)
    s.text(7.95, 2.25, 3.8, 0.82, "保留品牌與金融信任感，\n只重構入口、篩選、比較與決策輔助層。", 17, "#262626", True)
    for i, (v, l) in enumerate([("10", "頁簡報"), ("7", "Demo 頁面"), ("5-8", "分鐘展示")]):
        x = 0.85 + i * 2.1
        s.text(x, 5.6, 1.2, 0.36, v, 24, "#FF7E40", True)
        s.text(x, 6.02, 1.5, 0.18, l, 10, "#666666", True)
    s.footer(1)
    slides.append(s)

    # 2 Outline
    s = Slide()
    add_header(s, "OUTLINE", "PPT 與 Demo 網站一一對應，5-8 分鐘可講完", 2)
    outline = [
        ("01", "封面 / 核心觀點", "對應 index.html：問題不是資料不夠，而是缺少決策路徑。"),
        ("02", "現況診斷", "對應 01-audit-report.html：找基金像資料庫，照妖鏡缺少解讀。"),
        ("03", "核心改版", "對應 03-new-fund-mirror.html：先選需求，再看四象限。"),
        ("04", "列表與新手入口", "對應 04 / 05：用篩選與問答降低選擇焦慮。"),
        ("05", "資深比較與要求對照", "對應 06 / 07：Arena 深度比較，mapping 證明題目已回應。"),
    ]
    for i, (n, h, p) in enumerate(outline):
        y = 1.62 + i * 0.9
        s.ellipse(0.75, y, 0.38, 0.38, "#FF9664")
        s.text(0.82, y + 0.1, 0.24, 0.14, n, 7, "#FFFFFF", True, "ctr")
        s.text(1.35, y - 0.01, 2.5, 0.22, h, 16, "#262626", True)
        s.text(3.4, y, 7.8, 0.25, p, 13.5, "#666666")
    slides.append(s)

    # 3 Assignment framing
    s = Slide()
    add_header(s, "TASK READ", "我把題目拆成三個交付，不平均用力", 3)
    cards = [
        ("任務 1", "找基金 / 基金照妖鏡優劣分析", "用 UI、資訊效率、操作路徑、視覺化與決策輔助五個維度拆解。"),
        ("任務 2", "基金照妖鏡 0 到 1 複盤", "保留散點圖，但不讓它成為第一步；先問投資需求。"),
        ("任務 3", "創新基金篩選方案", "用問答精靈降低新手焦慮，用 Arena 滿足資深比較。"),
    ]
    for i, (k, h, p) in enumerate(cards):
        x = 0.7 + i * 4.05
        s.rect(x, 1.55, 3.55, 3.95, "#FFFFFF", "#EBEBEB", radius=True)
        s.chip(x + 0.25, 1.85, k, 0.82)
        s.text(x + 0.25, 2.35, 2.85, 0.58, h, 20, "#262626", True)
        s.text(x + 0.25, 3.25, 2.85, 0.88, p, 13.5, "#666666")
        s.bar(x + 0.25, 4.75, 1.55, "完成度", [0.9, 0.92, 0.96][i])
    s.text(0.7, 6.15, 11.2, 0.3, "判斷：這不是品牌重設案，而是基金探索流程升級案。", 16, "#262626", True)
    slides.append(s)

    # 4 Current diagnosis
    s = Slide()
    add_header(s, "DIAGNOSIS", "現在最大的落差：資料很多，但使用者不知道該怎麼判斷", 4)
    s.rect(0.72, 1.58, 5.35, 4.4, "#FFFFFF", "#EBEBEB", radius=True)
    s.text(1.05, 1.9, 2.8, 0.28, "找基金頁", 20, "#262626", True)
    for i, txt in enumerate(["像資料庫，沒有先問使用者要解決什麼", "排序對進階用戶有效，對新手缺少引導", "基金名稱與報酬率很多，卻沒有回答適不適合我"]):
        s.ellipse(1.05, 2.52 + i * 0.74, 0.16, 0.16, "#FF9664")
        s.text(1.35, 2.45 + i * 0.74, 4.1, 0.3, txt, 13.5, "#666666")
    s.rect(7.05, 1.58, 5.35, 4.4, "#FFFFFF", "#EBEBEB", radius=True)
    s.text(7.38, 1.9, 2.8, 0.28, "基金照妖鏡", 20, "#262626", True)
    for i, txt in enumerate(["散點圖方向正確，嘗試把報酬與風險視覺化", "CP 值需要被翻譯，不然只是另一個數字", "同一張圖對不同投資者講同一套話"]):
        s.ellipse(7.38, 2.52 + i * 0.74, 0.16, 0.16, "#0EB9B5")
        s.text(7.68, 2.45 + i * 0.74, 4.1, 0.3, txt, 13.5, "#666666")
    s.text(0.78, 6.32, 11.8, 0.3, "Demo 對應：01-audit-report.html。結論是補決策路徑，不是再堆欄位。", 15, "#262626", True, "ctr")
    slides.append(s)

    # 5 Multi-agent logic
    s = Slide()
    add_header(s, "MULTI-AGENT LOGIC", "多 Agent 不是角色扮演，而是讓每個取捨都有審查角度", 5)
    agents = [
        ("UX Research", "找出新手焦慮與資深比較需求"),
        ("Finance Product", "確認報酬、波動、CP、配息語意"),
        ("CRO / Growth", "讓 CTA 承接猶豫，不急著推交易"),
        ("Compliance", "避免推薦語氣，改成篩選輔助"),
        ("UI / Frontend", "保留品牌色，完成可互動 Demo"),
    ]
    for i, (h, p) in enumerate(agents):
        x = 0.72 + (i % 3) * 4.05
        y = 1.55 + (i // 3) * 2.05
        s.rect(x, y, 3.55, 1.55, "#FFFFFF", "#EBEBEB", radius=True)
        s.chip(x + 0.22, y + 0.2, f"Agent {i+1}", 0.95, "#FF661D")
        s.text(x + 0.22, y + 0.58, 2.9, 0.25, h, 16, "#262626", True)
        s.text(x + 0.22, y + 0.95, 2.95, 0.32, p, 11.5, "#666666")
    s.rect(8.83, 3.6, 3.5, 1.8, "#FFF3EE", "#FFD4C0", radius=True)
    s.text(9.12, 3.94, 2.9, 0.3, "共同決策", 18, "#262626", True)
    s.text(9.12, 4.38, 2.65, 0.48, "保留品牌，重構流程；不做投資推薦，做決策輔助。", 13, "#666666")
    s.text(0.76, 6.26, 10.8, 0.24, "Demo 對應：index.html、07-requirement-mapping.html。", 12, "#666666", True)
    slides.append(s)

    # 6 Fund mirror
    s = Slide()
    add_header(s, "CORE REDESIGN", "新版基金照妖鏡：散點圖保留，但不再是第一步", 6)
    steps = [("1", "選投資需求", "新手 / 穩健 / 積極 / 配息"), ("2", "切換依據", "風險、波動、CP、配息"), ("3", "看四象限", "報酬率 × 波動度"), ("4", "展開基金卡", "適合誰、風險、下一步")]
    for i, (n, h, p) in enumerate(steps):
        x = 0.78 + i * 3.08
        s.rect(x, 1.55, 2.62, 1.45, "#FFFFFF", "#EBEBEB", radius=True)
        s.ellipse(x + 0.22, 1.87, 0.36, 0.36, "#FF9664")
        s.text(x + 0.33, 1.96, 0.12, 0.1, n, 8, "#FFFFFF", True, "ctr")
        s.text(x + 0.72, 1.78, 1.55, 0.24, h, 14, "#262626", True)
        s.text(x + 0.72, 2.18, 1.55, 0.25, p, 10.5, "#666666")
        if i < 3:
            s.line(x + 2.67, 2.25, x + 3.0, 2.25, "#FF9664", 2)
    # quadrant mock
    s.rect(1.1, 3.55, 5.2, 2.35, "#FFFFFF", "#EBEBEB", radius=True)
    s.line(3.7, 3.75, 3.7, 5.65, "#E0E0E0")
    s.line(1.35, 4.7, 6.05, 4.7, "#E0E0E0")
    for x, y, c in [(2.2,5.1,"#FF9664"),(3.1,4.95,"#FF9664"),(4.8,4.3,"#0EB9B5"),(5.35,3.95,"#CCCCCC"),(4.4,5.2,"#CCCCCC")]:
        s.ellipse(x, y, 0.14, 0.14, c)
    s.text(1.4, 3.85, 1.7, 0.18, "高報酬 / 低波動", 9, "#0EB9B5", True)
    s.rect(7.15, 3.55, 4.6, 2.35, "#FFF3EE", "#FFD4C0", radius=True)
    s.text(7.5, 3.9, 3.7, 0.26, "右側基金卡回答", 18, "#262626", True)
    for i, txt in enumerate(["為什麼符合目前需求", "可能承受的最大風險", "加入比較 / 查看風險說明"]):
        s.text(7.55, 4.38 + i * 0.42, 3.6, 0.22, f"• {txt}", 12.5, "#666666")
    slides.append(s)

    # 7 Find funds
    s = Slide()
    add_header(s, "LIST EXPERIENCE", "新版找基金：把大量基金收斂成可以判斷的候選清單", 7)
    s.rect(0.72, 1.42, 11.9, 1.15, "#FFFFFF", "#EBEBEB", radius=True)
    s.text(1.05, 1.76, 4.5, 0.26, "搜尋：科技、配息、TISA、債券", 16, "#999999")
    for i, chip in enumerate(["配息", "低波動", "科技", "AI", "債券", "TISA", "退休"]):
        s.chip(1.05 + i * 1.05, 2.14, chip, 0.82)
    columns = [("搜尋 / Chips", "先把 1000+ 檔基金縮成可看清單"), ("進階篩選", "基金類型、區域、風險、幣別、配息"), ("決策卡片", "為什麼適合你 + 主要風險"), ("比較上限", "最多 3 檔，避免比較焦慮")]
    for i, (h, p) in enumerate(columns):
        x = 0.75 + i * 3.05
        s.rect(x, 3.25, 2.65, 2.35, "#FFFFFF", "#EBEBEB", radius=True)
        s.text(x + 0.23, 3.58, 2, 0.25, h, 16, "#262626", True)
        s.text(x + 0.23, 4.0, 2.0, 0.48, p, 12.5, "#666666")
        s.bar(x + 0.23, 5.0, 1.35, "效率", [0.82, 0.76, 0.88, 0.8][i])
    slides.append(s)

    # 8 innovation
    s = Slide()
    add_header(s, "INNOVATION", "兩個創新功能：一個降焦慮，一個做深度比較", 8)
    s.rect(0.75, 1.55, 5.55, 4.65, "#FFFFFF", "#EBEBEB", radius=True)
    s.chip(1.05, 1.86, "新手 / 半熟手", 1.25)
    s.text(1.05, 2.3, 3.8, 0.35, "基金適配問答精靈", 22, "#262626", True)
    for i, txt in enumerate(["投資目標", "可接受波動", "投資期間", "基金偏好", "是否重視配息"]):
        s.rect(1.05, 2.95 + i * 0.45, 2.3, 0.3, "#F5F5F5", "#EBEBEB", radius=True)
        s.text(1.22, 3.02 + i * 0.45, 1.8, 0.1, txt, 9.5, "#666666", True)
    s.text(3.85, 3.15, 1.6, 0.8, "輸出：\n使用者風格\n基金類型\n候選基金", 13, "#FF661D", True)
    s.rect(7.05, 1.55, 5.55, 4.65, "#FFFFFF", "#EBEBEB", radius=True)
    s.chip(7.35, 1.86, "資深投資者", 1.25)
    s.text(7.35, 2.3, 3.8, 0.35, "Fund Arena 基金比較場", 22, "#262626", True)
    for i, (lab, pct) in enumerate([("報酬", .86), ("波動控制", .72), ("CP值", .78), ("費用", .63), ("配息", .82), ("風險等級", .76)]):
        s.bar(7.35, 3.0 + i * 0.37, 2.3, lab, pct, ["#FF9664", "#0EB9B5", "#2F80ED"][i % 3])
    slides.append(s)

    # 9 compliance and value
    s = Slide()
    add_header(s, "BUSINESS & RISK", "商業價值要建立在合規語氣上：先輔助篩選，再承接轉換", 9)
    left = [("停留時間", "更多情境解釋與比較工具"), ("基金點擊率", "卡片回答適合原因與主要風險"), ("比較使用率", "限制 3 檔，讓決策可完成"), ("開戶轉化", "CTA 接在理解與比較之後")]
    for i, (h, p) in enumerate(left):
        y = 1.55 + i * 0.95
        s.rect(0.8, y, 5.05, 0.68, "#FFFFFF", "#EBEBEB", radius=True)
        s.text(1.05, y + 0.16, 1.25, 0.2, h, 13.5, "#262626", True)
        s.text(2.55, y + 0.16, 2.85, 0.2, p, 12, "#666666")
    s.rect(6.8, 1.55, 5.45, 4.45, "#FFF3EE", "#FFD4C0", radius=True)
    s.text(7.15, 1.9, 2.8, 0.28, "合規語氣規則", 19, "#262626", True)
    for i, txt in enumerate(["不說：推薦你買、必買、保證收益", "改說：適合觀察、篩選輔助、情境比較", "每頁 footer 補：非投資建議 / mock data", "配息提醒：配息不等於總報酬"]):
        s.text(7.2, 2.48 + i * 0.55, 4.2, 0.25, f"• {txt}", 13, "#666666")
    s.text(0.85, 6.28, 10.8, 0.25, "Demo 對應：全站 footer 與各互動頁。成效指標看問答完成率、比較使用率、詳情點擊率。", 13.5, "#262626", True)
    slides.append(s)

    # 10 closing
    s = Slide()
    add_header(s, "CLOSING", "最終交付不是一張圖，而是一條可以展示的產品路徑", 10)
    pages = [("01", "頁面優劣分析"), ("03", "新版基金照妖鏡"), ("04", "新版找基金"), ("05", "問答精靈"), ("06", "Fund Arena"), ("07", "要求對照檢查")]
    for i, (n, h) in enumerate(pages):
        x = 0.82 + (i % 3) * 3.95
        y = 1.65 + (i // 3) * 1.35
        s.rect(x, y, 3.35, 0.86, "#FFFFFF", "#EBEBEB", radius=True)
        s.text(x + 0.25, y + 0.24, 0.48, 0.18, n, 13, "#FF661D", True)
        s.text(x + 0.82, y + 0.24, 2.15, 0.18, h, 13.5, "#262626", True)
    s.rect(0.82, 5.0, 11.55, 0.95, "#FFF3EE", "#FFD4C0", radius=True)
    s.text(1.15, 5.25, 10.8, 0.28, "一句話總結：保留 FundSwap 原有信任感，把基金探索從資料查詢升級為決策輔助。", 17, "#262626", True, "ctr")
    s.text(1.15, 6.25, 10.8, 0.24, "本 Demo 僅為基金篩選體驗設計展示，非投資建議。", 12, "#666666", True, "ctr")
    slides.append(s)

    return slides


def content_types(slide_count: int) -> str:
    overrides = "\n".join(
        f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, slide_count + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  {overrides}
</Types>"""


def presentation_xml(slide_count: int) -> str:
    ids = "\n".join(f'<p:sldId id="{255+i}" r:id="rId{i}"/>' for i in range(1, slide_count + 1))
    master_rel_id = f"rId{slide_count + 1}"
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="{master_rel_id}"/></p:sldMasterIdLst>
  <p:sldIdLst>{ids}</p:sldIdLst>
  <p:sldSz cx="{int(W)}" cy="{int(H)}" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>"""


def presentation_rels(slide_count: int) -> str:
    rels = "\n".join(
        f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, slide_count + 1)
    )
    rels += f'\n  <Relationship Id="rId{slide_count + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  {rels}
</Relationships>"""


def root_rels() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""


def docprops() -> tuple[str, str]:
    core = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>FundSwap UX Portfolio Presentation</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
</cp:coreProperties>"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>PowerPoint</Application>
  <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
</Properties>"""
    return core, app


def theme_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="FundSwap UX Theme">
  <a:themeElements>
    <a:clrScheme name="FundSwap">
      <a:dk1><a:srgbClr val="262626"/></a:dk1>
      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="333333"/></a:dk2>
      <a:lt2><a:srgbClr val="F5F5F5"/></a:lt2>
      <a:accent1><a:srgbClr val="FF9664"/></a:accent1>
      <a:accent2><a:srgbClr val="0EB9B5"/></a:accent2>
      <a:accent3><a:srgbClr val="2F80ED"/></a:accent3>
      <a:accent4><a:srgbClr val="2BAB52"/></a:accent4>
      <a:accent5><a:srgbClr val="722ED1"/></a:accent5>
      <a:accent6><a:srgbClr val="FA3130"/></a:accent6>
      <a:hlink><a:srgbClr val="FF7E40"/></a:hlink>
      <a:folHlink><a:srgbClr val="FF7E40"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="FundSwap Fonts">
      <a:majorFont><a:latin typeface="Noto Sans TC"/><a:ea typeface="Noto Sans TC"/><a:cs typeface="Noto Sans TC"/></a:majorFont>
      <a:minorFont><a:latin typeface="Noto Sans TC"/><a:ea typeface="Noto Sans TC"/><a:cs typeface="Noto Sans TC"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="FundSwap Format">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>"""


def slide_master_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
  </p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>"""


def slide_master_rels() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>"""


def slide_layout_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
  </p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>"""


def slide_layout_rels() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>"""


def build():
    slides = make_deck()
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types(len(slides)))
        z.writestr("_rels/.rels", root_rels())
        z.writestr("ppt/presentation.xml", presentation_xml(len(slides)))
        z.writestr("ppt/_rels/presentation.xml.rels", presentation_rels(len(slides)))
        z.writestr("ppt/theme/theme1.xml", theme_xml())
        z.writestr("ppt/slideMasters/slideMaster1.xml", slide_master_xml())
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", slide_master_rels())
        z.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout_xml())
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", slide_layout_rels())
        core, app = docprops()
        z.writestr("docProps/core.xml", core)
        z.writestr("docProps/app.xml", app)
        for i, slide in enumerate(slides, 1):
            z.writestr(f"ppt/slides/slide{i}.xml", slide.xml())
            z.writestr(
                f"ppt/slides/_rels/slide{i}.xml.rels",
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>',
            )
    print(OUT)


if __name__ == "__main__":
    build()
