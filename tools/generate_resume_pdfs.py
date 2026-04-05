from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "output" / "pdf"
ZH_FONT_NAME = "MicrosoftJhengHei"
ZH_FONT_PATH = Path("C:/Windows/Fonts/msjh.ttc")


def register_fonts() -> None:
    if ZH_FONT_PATH.exists():
        pdfmetrics.registerFont(TTFont(ZH_FONT_NAME, str(ZH_FONT_PATH)))


def build_styles(font_name: str):
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="ResumeTitle",
            parent=styles["Title"],
            fontName=font_name,
            fontSize=20,
            leading=24,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#16324f"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ResumeHeadline",
            parent=styles["Heading2"],
            fontName=font_name,
            fontSize=12,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#2563a6"),
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ResumeBody",
            parent=styles["BodyText"],
            fontName=font_name,
            fontSize=10,
            leading=15,
            textColor=colors.HexColor("#243746"),
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading3"],
            fontName=font_name,
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#16324f"),
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ItemTitle",
            parent=styles["BodyText"],
            fontName=font_name,
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#16324f"),
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallNote",
            parent=styles["BodyText"],
            fontName=font_name,
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#5c6b78"),
            spaceAfter=5,
        )
    )
    return styles


def para(text: str, style):
    return Paragraph(escape(text), style)


def add_heading(story, styles, text: str):
    story.append(Paragraph(escape(text), styles["SectionHeading"]))
    story.append(Spacer(1, 2))


def add_bullets(story, styles, items):
    for item in items:
        story.append(para(f"- {item}", styles["ResumeBody"]))


def add_snapshot(story, styles, items):
    rows = []
    for label, value in items:
        rows.append(
            [
                Paragraph(f"<b>{escape(label)}</b>", styles["ResumeBody"]),
                Paragraph(escape(value), styles["ResumeBody"]),
            ]
        )

    table = Table(rows, colWidths=[40 * mm, 135 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fbff")),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#d6e1ec")),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#d6e1ec")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 8))


def add_items(story, styles, items):
    for item in items:
        story.append(
            Paragraph(
                f"<b>{escape(item['title'])}</b> | {escape(item['meta'])}",
                styles["ItemTitle"],
            )
        )
        if item.get("summary"):
            story.append(para(item["summary"], styles["ResumeBody"]))
        add_bullets(story, styles, item["bullets"])
        story.append(Spacer(1, 4))


def build_pdf(filename: str, spec: dict):
    styles = build_styles(spec["font"])
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT_DIR / filename),
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title=spec["title"],
        author="Jay Wu",
    )

    story = [
        Paragraph(escape(spec["name"]), styles["ResumeTitle"]),
        Paragraph(escape(spec["title"]), styles["ResumeHeadline"]),
        para(spec["summary"], styles["ResumeBody"]),
        Spacer(1, 6),
    ]

    add_heading(story, styles, spec["labels"]["proof"])
    add_bullets(story, styles, spec["proof"])
    story.append(Spacer(1, 6))

    add_heading(story, styles, spec["labels"]["snapshot"])
    add_snapshot(story, styles, spec["snapshot"])

    add_heading(story, styles, spec["labels"]["experience"])
    add_items(story, styles, spec["experience"])

    add_heading(story, styles, spec["labels"]["projects"])
    add_items(story, styles, spec["projects"])

    add_heading(story, styles, spec["labels"]["skills"])
    for label, value in spec["skills"]:
        story.append(Paragraph(f"<b>{escape(label)}</b>: {escape(value)}", styles["ResumeBody"]))
    story.append(Spacer(1, 4))

    add_heading(story, styles, spec["labels"]["contact"])
    add_bullets(story, styles, spec["contact"])
    story.append(Spacer(1, 2))
    story.append(para(spec["note"], styles["SmallNote"]))

    doc.build(story)


COMMON_CONTACT_EN = [
    "Email: dan40912@gmail.com",
    "LinkedIn: www.linkedin.com/in/新捷-吳-630779107",
    "Medium: medium.com/@dan40912",
]

COMMON_CONTACT_ZH = [
    "Email：dan40912@gmail.com",
    "LinkedIn：www.linkedin.com/in/新捷-吳-630779107",
    "Medium：medium.com/@dan40912",
]


DATA = {}

DATA.update(
    {
        "jay-wu-overview-en.pdf": {
            "font": "Helvetica",
            "name": "Jay Wu",
            "title": "Product Manager | Finance, Retail Tech, and Growth Systems",
            "summary": "9 years of cross-industry product and operations integration, turning complex workflows into executable specs and measurable outcomes across engineering, operations, support, finance, marketing, and external partners.",
            "labels": {
                "proof": "Key Proof",
                "snapshot": "Resume Snapshot",
                "experience": "Selected Experience",
                "projects": "Selected Projects",
                "skills": "Skills",
                "contact": "Contact",
            },
            "proof": [
                "3x SEO performance improvement on a finance site",
                "USD 10K+ monthly fee savings through payment-flow optimization",
                "20+ SEO programs managed across brands and regions",
                "POS and website launch completed in 1 month",
            ],
            "snapshot": [
                ("Role fit", "Product Manager / System Integration PM / Growth-oriented PM"),
                ("Education", "Bachelor's Degree, University of Taipei"),
                ("Languages", "Native Chinese | English for professional use (Intermediate)"),
                ("Work preference", "Taipei, Hsinchu, Kaohsiung | On-site, Hybrid, Fully Remote"),
                ("Collaboration", "Engineering, operations, support, finance, compliance, marketing, and external vendors; 10-15 people"),
            ],
            "experience": [
                {
                    "title": "Product Manager",
                    "meta": "Australian CFD brokerage | Aug 2024 - Present | Taiwan",
                    "bullets": [
                        "Own coordination across MT4/MT5, in-house platforms, payment flow, KYC, and CRM.",
                        "Improved finance-site SEO by 3x and supported acquisition plus conversion.",
                        "Optimized deposit and withdrawal workflows and saved more than USD 10K per month in fees.",
                    ],
                },
                {
                    "title": "SEO Program Manager",
                    "meta": "Cross-region | 2023 - 2024",
                    "bullets": [
                        "Managed 20+ B2B SEO programs across machine-tool brands.",
                        "Introduced AI content workflow and Zoho CRM funnel tracking.",
                    ],
                },
                {
                    "title": "Product Manager / System Integration PM",
                    "meta": "Custom POS and information systems | 2019 - 2021 | Taichung",
                    "bullets": [
                        "Planned POS, membership, API, and e-invoice integrations for live retail operations.",
                        "Supported launch in a live retail environment within 1 month.",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "Trading Platform Operations",
                    "meta": "Finance infrastructure",
                    "summary": "Owned workflow priorities, cross-team coordination, and KPI governance around trading-platform operations.",
                    "bullets": ["MT4/MT5 and in-house platform coordination", "Payment-flow redesign and issue handling"],
                },
                {
                    "title": "Shopping Mall POS Integration",
                    "meta": "Retail technology",
                    "summary": "Bridged business, development, and API partners to deliver POS and OMO workflow rollout.",
                    "bullets": ["POS, membership, CRM, and invoice integration", "Launch planning for a live mall environment"],
                },
                {
                    "title": "SEO Growth Programs",
                    "meta": "Growth systems",
                    "summary": "Defined governance, content rhythm, and CRM integration across 20+ SEO programs.",
                    "bullets": ["Multi-brand SEO operating system", "AI workflow and CRM-enabled funnel management"],
                },
            ],
            "skills": [
                ("Product Strategy", "Roadmap, PRD, prioritization, go-to-market"),
                ("System Integration", "POS, API, CRM, ERP, payment gateway, e-invoice"),
                ("Growth Systems", "SEO, CRM funnel, content ops, AI workflow"),
                ("Cross-functional Delivery", "Vendor management, stakeholder alignment, launch execution"),
            ],
            "contact": COMMON_CONTACT_EN,
            "note": "Some 2019-2021 experience was delivered in parallel, project-based roles across different business models.",
        },
        "jay-wu-overview-zh.pdf": {
            "font": ZH_FONT_NAME,
            "name": "吳新捷 Jay Wu",
            "title": "產品經理｜金融、零售科技與成長系統",
            "summary": "9 年跨產業產品與營運整合經驗，擅長把複雜流程拆成可執行規格，串接工程、營運、客服、財務、行銷與外部夥伴，落地成可量化成果。",
            "labels": {
                "proof": "關鍵成果",
                "snapshot": "履歷摘要",
                "experience": "精選經歷",
                "projects": "精選專案",
                "skills": "技能",
                "contact": "聯絡方式",
            },
            "proof": [
                "金融站點 SEO 成效提升 3 倍",
                "支付流程優化帶來 USD 10K+ 月節省",
                "管理 20+ SEO 專案，橫跨品牌與區域",
                "POS 與網站在 1 個月內完成上線",
            ],
            "snapshot": [
                ("定位", "產品經理 / 系統整合 PM / 成長導向 PM"),
                ("學歷", "臺北市立大學學士"),
                ("語言", "中文母語｜英文工作使用（Intermediate）"),
                ("工作偏好", "台北、新竹、高雄｜實體、混合、全遠端"),
                ("協作範圍", "工程、營運、客服、財務、法遵、行銷與外部供應商；10-15 人"),
            ],
            "experience": [
                {
                    "title": "產品經理",
                    "meta": "澳商 CFD 證券公司｜2024-08 至今｜台灣",
                    "bullets": [
                        "直接參與 MT4/MT5、自有平台、出入金、KYC、CRM 與營運問題的需求協調。",
                        "推動金融站點 SEO 成效提升 3 倍。",
                        "重整支付流程並達成 USD 10K+ 月節省。",
                    ],
                },
                {
                    "title": "SEO 專案經理",
                    "meta": "跨區域｜2023 - 2024",
                    "bullets": [
                        "管理 20+ B2B SEO 專案，建立持續性的治理節奏。",
                        "導入 AI 內容 workflow 與 Zoho CRM 漏斗追蹤。",
                    ],
                },
                {
                    "title": "產品經理 / 系統整合 PM",
                    "meta": "客製 POS 與資訊系統｜2019 - 2021｜台中",
                    "bullets": [
                        "規劃 POS、會員、API 與電子發票整合。",
                        "在 1 個月內支援 POS 與網站上線。",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "交易平台營運",
                    "meta": "金融基礎設施",
                    "summary": "負責交易平台營運節點、跨部門協作與 KPI 治理。",
                    "bullets": ["MT4/MT5 與自有平台協作", "支付流程重整與異常處理"],
                },
                {
                    "title": "商場 POS 整合",
                    "meta": "零售科技",
                    "summary": "串接商務、開發與 API 夥伴，完成 POS 與 OMO 流程交付。",
                    "bullets": ["POS、會員、CRM 與發票整合", "支援實體零售場域上線"],
                },
                {
                    "title": "SEO 成長專案",
                    "meta": "成長系統",
                    "summary": "建立 SEO 治理、內容節奏與 CRM 對接機制，支撐多專案穩定成長。",
                    "bullets": ["多品牌 SEO 營運系統", "AI workflow 與 CRM 漏斗整合"],
                },
            ],
            "skills": [
                ("產品策略", "Roadmap、PRD、需求排序、上市策略"),
                ("系統整合", "POS、API、CRM、ERP、金流閘道、電子發票"),
                ("成長系統", "SEO、CRM Funnel、內容營運、AI Workflow"),
                ("跨部門交付", "Vendor Management、Stakeholder Alignment、Launch Execution"),
            ],
            "contact": COMMON_CONTACT_ZH,
            "note": "2019 - 2021 部分經歷屬於專案型並行交付，對應不同產業與商業模式。",
        },
    }
)

DATA.update(
    {
        "jay-wu-retail-pos-en.pdf": {
            "font": "Helvetica",
            "name": "Jay Wu",
            "title": "Retail and POS Product Manager | OMO, Membership, and Ecommerce Delivery",
            "summary": "Product Manager for POS, membership, ecommerce, API integration, and OMO delivery, with experience turning store-side and business-side requirements into launch-ready workflows.",
            "labels": {
                "proof": "Key Proof",
                "snapshot": "Resume Snapshot",
                "experience": "Selected Experience",
                "projects": "Selected Projects",
                "skills": "Skills",
                "contact": "Contact",
            },
            "proof": [
                "POS and website launch completed in 1 month",
                "POS, CRM, ERP, and API integration experience",
                "Ecommerce and O2O operating flow design",
                "Taobao and new-channel launch support",
            ],
            "snapshot": [
                ("Role fit", "Retail Product Manager / POS PM / System Integration PM"),
                ("Education", "Bachelor's Degree, University of Taipei"),
                ("Languages", "Native Chinese | English for professional use (Intermediate)"),
                ("Direct scope", "POS, membership, ecommerce, CRM, e-invoice, API integration"),
                ("Work preference", "Taipei, Hsinchu, Kaohsiung | On-site, Hybrid, Fully Remote"),
            ],
            "experience": [
                {
                    "title": "Product Manager / System Integration PM",
                    "meta": "Custom POS and information systems | 2019 - 2021 | Taichung",
                    "bullets": [
                        "Planned POS, membership, invoice, and API-linked workflows for live retail operations.",
                        "Coordinated delivery across developers, vendors, and business operators.",
                        "Supported a rollout in a live retail environment within 1 month.",
                    ],
                },
                {
                    "title": "Marketing Manager",
                    "meta": "Group-buying business | 2019 - 2021 | Banqiao",
                    "bullets": [
                        "Built ecommerce foundations and O2O flow to support demand and conversion.",
                        "Worked across site setup, operating model design, and web coordination.",
                    ],
                },
                {
                    "title": "Frontend Developer / Product Manager",
                    "meta": "Shanghai | 2017 - 2018",
                    "bullets": [
                        "Coordinated hardware, software, product assets, and channel-launch timing.",
                        "Improved ecommerce sales and launched new channels including Taobao.",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "Shopping Mall POS Integration",
                    "meta": "Retail technology",
                    "summary": "Bridged business, development, and external API partners to deliver POS and OMO workflow rollout.",
                    "bullets": ["POS, membership, CRM, and invoice integration", "Real-world launch planning and field coordination"],
                },
                {
                    "title": "Group-buying Ecommerce and O2O Operations",
                    "meta": "Ecommerce operations",
                    "summary": "Worked across system setup, operating model design, and online-to-offline flow planning.",
                    "bullets": ["Conversion-oriented ecommerce setup", "O2O process design linked to business execution"],
                },
            ],
            "skills": [
                ("Retail Systems", "POS, membership, CRM, e-invoice"),
                ("Ecommerce Ops", "Ecommerce, O2O, conversion, channel launch"),
                ("Integration Delivery", "API, ERP, migration, vendor coordination"),
                ("Product Management", "Roadmap, PRD, launch planning, stakeholder alignment"),
            ],
            "contact": COMMON_CONTACT_EN,
            "note": "Some 2019-2021 experience was delivered in parallel, project-based roles across different business models.",
        },
        "jay-wu-retail-pos-zh.pdf": {
            "font": ZH_FONT_NAME,
            "name": "吳新捷 Jay Wu",
            "title": "零售 / POS 產品經理｜OMO、會員與電商交付",
            "summary": "聚焦 POS、會員、電商、API 與 OMO 交付，擅長把門市端與商務端需求整理成可上線的流程、欄位與例外處理規格。",
            "labels": {
                "proof": "關鍵成果",
                "snapshot": "履歷摘要",
                "experience": "精選經歷",
                "projects": "精選專案",
                "skills": "技能",
                "contact": "聯絡方式",
            },
            "proof": [
                "POS 與網站在 1 個月內完成上線",
                "具 POS、CRM、ERP、API 整合交付經驗",
                "能設計電商與 O2O 營運流程",
                "具淘寶與新通路開設經驗",
            ],
            "snapshot": [
                ("定位", "零售產品經理 / POS PM / 系統整合 PM"),
                ("學歷", "臺北市立大學學士"),
                ("語言", "中文母語｜英文工作使用（Intermediate）"),
                ("直接範圍", "POS、會員、電商、CRM、電子發票、API 串接"),
                ("工作偏好", "台北、新竹、高雄｜實體、混合、全遠端"),
            ],
            "experience": [
                {
                    "title": "產品經理 / 系統整合 PM",
                    "meta": "客製 POS 與資訊系統｜2019 - 2021｜台中",
                    "bullets": [
                        "規劃 POS、會員、發票與 API 流程，支援實際零售場域營運。",
                        "協調開發、供應商與商務窗口完成交付。",
                        "在 1 個月內支援 POS 與網站上線。",
                    ],
                },
                {
                    "title": "行銷經理",
                    "meta": "團購事業｜2019 - 2021｜板橋",
                    "bullets": [
                        "建置電商基礎與 O2O 流程，承接需求與轉化。",
                        "參與網站建置、營運模式與內容展示協作。",
                    ],
                },
                {
                    "title": "前端開發 / 產品經理",
                    "meta": "上海｜2017 - 2018",
                    "bullets": [
                        "協調軟硬體交付、產品素材與通路上架節奏。",
                        "帶動電商銷售與新通路開設，包括淘寶上架。",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "商場 POS 整合",
                    "meta": "零售科技",
                    "summary": "串接商務、開發與外部 API 夥伴，完成 POS 與 OMO 流程交付。",
                    "bullets": ["POS、會員、CRM 與發票整合", "實體場域上線與流程驗證"],
                },
                {
                    "title": "團購電商與 O2O 營運",
                    "meta": "電商營運",
                    "summary": "參與系統建置、營運設計與線上到線下流程規劃。",
                    "bullets": ["支援轉化導向的電商建置", "連動商務執行的 O2O 流程設計"],
                },
            ],
            "skills": [
                ("零售系統", "POS、Membership、CRM、E-Invoice"),
                ("電商營運", "Ecommerce、O2O、Conversion、Channel Launch"),
                ("整合交付", "API、ERP、Migration、Vendor Coordination"),
                ("產品管理", "Roadmap、PRD、Launch Planning、Stakeholder Alignment"),
            ],
            "contact": COMMON_CONTACT_ZH,
            "note": "2019 - 2021 部分經歷屬於專案型並行交付，對應不同商業模式。",
        },
        "jay-wu-growth-en.pdf": {
            "font": "Helvetica",
            "name": "Jay Wu",
            "title": "Growth Product Manager | SEO, CRM Funnel, and Content Systems",
            "summary": "Product Manager for SEO, content operations, CRM funnel design, and conversion optimization, with a systems approach to traffic, pipeline quality, and workflow scalability.",
            "labels": {
                "proof": "Key Proof",
                "snapshot": "Resume Snapshot",
                "experience": "Selected Experience",
                "projects": "Selected Projects",
                "skills": "Skills",
                "contact": "Contact",
            },
            "proof": [
                "Managed 20+ SEO programs across brands and regions",
                "Improved finance-site SEO performance by 3x",
                "Integrated Zoho CRM funnel tracking",
                "Built AI content workflow for scalable operations",
            ],
            "snapshot": [
                ("Role fit", "Growth Product Manager / SEO PM / CRM Funnel PM"),
                ("Education", "Bachelor's Degree, University of Taipei"),
                ("Languages", "Native Chinese | English for professional use (Intermediate)"),
                ("Direct scope", "SEO governance, content ops, CRM funnel, inquiry quality, conversion"),
                ("Work preference", "Taipei, Hsinchu, Kaohsiung | On-site, Hybrid, Fully Remote"),
            ],
            "experience": [
                {
                    "title": "SEO Program Manager",
                    "meta": "Cross-region | 2023 - 2024",
                    "bullets": [
                        "Managed SEO strategy and operating rhythm across 20+ machine-tool brands.",
                        "Introduced AI content workflow and Zoho CRM lead operations.",
                        "Built growth governance around ranking, inquiry quality, and operating cadence.",
                    ],
                },
                {
                    "title": "Marketing Manager",
                    "meta": "Group-buying business | 2019 - 2021 | Banqiao",
                    "bullets": [
                        "Built ecommerce support and O2O conversion flow.",
                        "Worked across site presentation, inquiry flow, and operating rhythm.",
                    ],
                },
                {
                    "title": "Product Manager",
                    "meta": "Australian CFD brokerage | Aug 2024 - Present | Taiwan",
                    "bullets": [
                        "Improved finance-site SEO by 3x and aligned KYC and journey flow to improve conversion.",
                        "Introduced AI workflow into daily operations to shorten response cycles.",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "SEO Growth Programs",
                    "meta": "Growth and B2B",
                    "summary": "Aligned content, technical SEO, CRM, and stakeholder needs into a repeatable operating model.",
                    "bullets": ["20+ active SEO programs", "AI workflow and CRM-enabled funnel management"],
                },
                {
                    "title": "Finance Site SEO and Conversion Improvement",
                    "meta": "SEO and conversion",
                    "summary": "Worked across SEO performance, KYC flow, and journey friction to improve both traffic value and conversion quality.",
                    "bullets": ["3x SEO performance improvement", "KYC and user-journey optimization"],
                },
            ],
            "skills": [
                ("SEO and Content", "SEO, content ops, AI workflow, keyword strategy"),
                ("CRM and Funnel", "Zoho CRM, lead tracking, funnel analysis, conversion"),
                ("Product Management", "Roadmap, prioritization, workflow design, stakeholder alignment"),
                ("Data and Optimization", "Ranking tracking, reporting, experimentation, user journey"),
            ],
            "contact": COMMON_CONTACT_EN,
            "note": "This version emphasizes systems thinking, funnel ownership, and repeatable operating process instead of one-off campaign execution.",
        },
        "jay-wu-growth-zh.pdf": {
            "font": ZH_FONT_NAME,
            "name": "吳新捷 Jay Wu",
            "title": "成長產品經理｜SEO、CRM Funnel 與內容系統",
            "summary": "聚焦 SEO、內容營運、CRM 漏斗與轉化優化，以系統化方式管理流量、詢盤品質、內容產能與可擴張的 workflow。",
            "labels": {
                "proof": "關鍵成果",
                "snapshot": "履歷摘要",
                "experience": "精選經歷",
                "projects": "精選專案",
                "skills": "技能",
                "contact": "聯絡方式",
            },
            "proof": [
                "管理 20+ SEO 專案，橫跨品牌與區域",
                "金融站點 SEO 成效提升 3 倍",
                "整合 Zoho CRM 漏斗追蹤",
                "建立 AI 內容 workflow 提升產能",
            ],
            "snapshot": [
                ("定位", "成長產品經理 / SEO PM / CRM Funnel PM"),
                ("學歷", "臺北市立大學學士"),
                ("語言", "中文母語｜英文工作使用（Intermediate）"),
                ("直接範圍", "SEO 治理、內容營運、CRM Funnel、詢盤品質、轉化優化"),
                ("工作偏好", "台北、新竹、高雄｜實體、混合、全遠端"),
            ],
            "experience": [
                {
                    "title": "SEO 專案經理",
                    "meta": "跨區域｜2023 - 2024",
                    "bullets": [
                        "管理 20+ SEO 專案的策略與營運節奏。",
                        "導入 AI 內容 workflow 與 Zoho CRM 線索流程。",
                        "把成長工作做成有節奏、可追蹤的營運系統。",
                    ],
                },
                {
                    "title": "行銷經理",
                    "meta": "團購事業｜2019 - 2021｜板橋",
                    "bullets": [
                        "支援電商建置與 O2O 轉化流程。",
                        "參與網站內容、詢盤與營運節奏設計。",
                    ],
                },
                {
                    "title": "產品經理",
                    "meta": "澳商 CFD 證券公司｜2024-08 至今｜台灣",
                    "bullets": [
                        "推動金融站點 SEO 成效提升 3 倍，並優化 KYC 與轉化流程。",
                        "將 AI workflow 帶入日常營運，縮短回應與產出週期。",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "SEO 成長專案",
                    "meta": "成長與 B2B",
                    "summary": "整合內容、技術 SEO、CRM 與利害關係人需求，建立可複製的營運模型。",
                    "bullets": ["20+ 活躍 SEO 專案", "AI workflow 與 CRM 漏斗整合"],
                },
                {
                    "title": "金融站點 SEO 與轉化優化",
                    "meta": "SEO 與轉化",
                    "summary": "從 SEO 表現、KYC 流程與用戶旅程一起切入，提升流量價值與轉化品質。",
                    "bullets": ["SEO 成效提升 3 倍", "KYC 與用戶旅程優化"],
                },
            ],
            "skills": [
                ("SEO 與內容", "SEO、Content Ops、AI Workflow、Keyword Strategy"),
                ("CRM 與漏斗", "Zoho CRM、Lead Tracking、Funnel Analysis、Conversion"),
                ("產品管理", "Roadmap、Prioritization、Workflow Design、Stakeholder Alignment"),
                ("數據與優化", "Ranking Tracking、Reporting、Experimentation、User Journey"),
            ],
            "contact": COMMON_CONTACT_ZH,
            "note": "本版本強調系統化節奏、漏斗 ownership 與可複製流程，而不是單次 campaign 執行。",
        },
    }
)

DATA.update(
    {
        "jay-wu-finance-en.pdf": {
            "font": "Helvetica",
            "name": "Jay Wu",
            "title": "Finance Product Manager | Trading Platforms, Payments, and Compliance Workflow",
            "summary": "Hands-on product ownership across MT4/MT5, payment routing, KYC, CRM, and cross-team operational delivery in regulated trading environments.",
            "labels": {
                "proof": "Key Proof",
                "snapshot": "Resume Snapshot",
                "experience": "Selected Experience",
                "projects": "Selected Projects",
                "skills": "Skills",
                "contact": "Contact",
            },
            "proof": [
                "USD 10K+ monthly fee savings from payment-flow optimization",
                "MT4/MT5 plus in-house platform operations",
                "KYC and onboarding flow optimization",
                "Cross-functional coordination across 10-15 stakeholders",
            ],
            "snapshot": [
                ("Role fit", "Finance Product Manager / Platform Operations PM / System Integration PM"),
                ("Education", "Bachelor's Degree, University of Taipei"),
                ("Languages", "Native Chinese | English for professional use (Intermediate)"),
                ("Direct scope", "MT4/MT5, in-house platforms, payment flow, KYC, CRM, KPI governance"),
                ("Work preference", "Taipei, Hsinchu, Kaohsiung | On-site, Hybrid, Fully Remote"),
            ],
            "experience": [
                {
                    "title": "Product Manager",
                    "meta": "Australian CFD brokerage | Aug 2024 - Present | Taiwan",
                    "bullets": [
                        "Own coordination across MT4/MT5, in-house platforms, payment flow, KYC, CRM, and issue handling.",
                        "Translate regulated operational problems into product priorities and delivery cadence.",
                        "Improved finance-site SEO by 3x while reducing payment costs by USD 10K+ per month.",
                    ],
                },
                {
                    "title": "Product Manager / System Integration PM",
                    "meta": "Custom POS and information systems | 2019 - 2021 | Taichung",
                    "bullets": [
                        "Built strong process-design and exception-handling habits through live-system integration work.",
                        "Planned POS, API, invoice, and CRM-related workflows for production rollout.",
                    ],
                },
                {
                    "title": "SEO Program Manager",
                    "meta": "Cross-region | 2023 - 2024",
                    "bullets": [
                        "Managed 20+ SEO programs and Zoho CRM funnel processes that strengthened acquisition thinking.",
                        "Introduced AI workflow to improve content and operating efficiency.",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "Trading Platform Operations",
                    "meta": "2024 - Present",
                    "summary": "Coordinated engineering, finance, operations, support, and payment partners around platform workflow and KPI governance.",
                    "bullets": ["Payment-flow redesign and issue handling", "Saved more than USD 10K per month in fees"],
                },
                {
                    "title": "Payment Flow and Compliance Optimization",
                    "meta": "2024 - Present",
                    "summary": "Clarified checkpoints and priorities so compliance requirements and conversion goals could both improve.",
                    "bullets": ["KYC and onboarding checkpoint design", "Process stability and conversion improvement"],
                },
            ],
            "skills": [
                ("Platform and Flow", "MT4/MT5, payment flow, KYC, CRM"),
                ("Product Management", "Roadmap, PRD, KPI governance, prioritization"),
                ("System Integration", "API, payment gateway, data flow, exception handling"),
                ("Execution", "Cross-functional, vendor management, AI ops, issue handling"),
            ],
            "contact": COMMON_CONTACT_EN,
            "note": "Some 2019-2021 experience was delivered in parallel, project-based roles across different business models.",
        },
        "jay-wu-finance-zh.pdf": {
            "font": ZH_FONT_NAME,
            "name": "吳新捷 Jay Wu",
            "title": "金融產品經理｜交易平台、金流與合規流程",
            "summary": "具金融平台、MT4/MT5、出入金、KYC、CRM 與跨部門營運交付經驗，能把監管與營運問題拆成可執行的產品規格與流程優先序。",
            "labels": {
                "proof": "關鍵成果",
                "snapshot": "履歷摘要",
                "experience": "精選經歷",
                "projects": "精選專案",
                "skills": "技能",
                "contact": "聯絡方式",
            },
            "proof": [
                "支付流程優化帶來 USD 10K+ 月節省",
                "具 MT4/MT5 與自有平台的直接協作範圍",
                "KYC 與 onboarding 流程優化經驗",
                "10-15 人跨工程、營運、客服、財務與外部夥伴協作",
            ],
            "snapshot": [
                ("定位", "金融產品經理 / 平台營運 PM / 系統整合 PM"),
                ("學歷", "臺北市立大學學士"),
                ("語言", "中文母語｜英文工作使用（Intermediate）"),
                ("直接範圍", "MT4/MT5、自有平台、出入金、KYC、CRM、KPI 治理"),
                ("工作偏好", "台北、新竹、高雄｜實體、混合、全遠端"),
            ],
            "experience": [
                {
                    "title": "產品經理",
                    "meta": "澳商 CFD 證券公司｜2024-08 至今｜台灣",
                    "bullets": [
                        "直接參與 MT4/MT5、自有平台、出入金、KYC、CRM 與營運問題的需求協調。",
                        "把受監管的營運問題拆成優先序、規則與交付節奏。",
                        "同時推動金融站點 SEO 提升 3 倍與支付流程節省 USD 10K+。",
                    ],
                },
                {
                    "title": "產品經理 / 系統整合 PM",
                    "meta": "客製 POS 與資訊系統｜2019 - 2021｜台中",
                    "bullets": [
                        "透過 live system integration 累積流程設計與例外處理能力。",
                        "規劃 POS、API、發票與 CRM 相關流程並支援上線。",
                    ],
                },
                {
                    "title": "SEO 專案經理",
                    "meta": "跨區域｜2023 - 2024",
                    "bullets": [
                        "管理 20+ SEO 專案與 Zoho CRM 漏斗流程，補強獲客與轉化思維。",
                        "導入 AI workflow 提升內容與營運效率。",
                    ],
                },
            ],
            "projects": [
                {
                    "title": "交易平台營運",
                    "meta": "2024 - 至今",
                    "summary": "協調工程、財務、營運、客服與金流夥伴，優化平台流程與 KPI 治理。",
                    "bullets": ["出入金流程重整與異常處理", "手續費月節省超過 USD 10K"],
                },
                {
                    "title": "支付流程與合規優化",
                    "meta": "2024 - 至今",
                    "summary": "釐清流程節點與優先序，讓合規要求與轉化表現可以同時成立。",
                    "bullets": ["KYC / onboarding 節點設計", "流程穩定性與轉化率同步提升"],
                },
            ],
            "skills": [
                ("平台與流程", "MT4/MT5、Payment Flow、KYC、CRM"),
                ("產品管理", "Roadmap、PRD、KPI 治理、需求排序"),
                ("系統整合", "API、金流閘道、資料流、例外處理"),
                ("協作與效率", "Cross-functional、Vendor Management、AI Ops、問題排除"),
            ],
            "contact": COMMON_CONTACT_ZH,
            "note": "2019 - 2021 部分經歷屬於專案型並行交付，對應不同商業模式。",
        },
    }
)


def main():
    register_fonts()
    for filename, spec in DATA.items():
        build_pdf(filename, spec)
        print(f"Generated {filename}")


if __name__ == "__main__":
    main()
