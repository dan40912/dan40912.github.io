/* ==========================================================================
   Cloudflare Worker：elevator-pitch 的 AI 代理端點
   API Key 只存在 Worker 的 Secret（ANTHROPIC_API_KEY），不會出現在前端。

   前端請求：POST { system, messages: [{ role, content }], images: [{ media_type, data }], task: "pitch-deck" }
             images 是 0–5 張 base64 圖片，會附在第一則 user 訊息前面
   回應：    { text: "<模型輸出的 JSON 字串>" } 或 { error }
   ========================================================================== */
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";
const MAX_SYSTEM_CHARS = 20000;
const MAX_MESSAGE_CHARS = 60000;
const MAX_MESSAGES = 4; // 一次生成 + 一次品質修正
const MAX_IMAGES = 5;
const MAX_IMAGE_B64 = 3_000_000; // 前端已縮到長邊 1024px，正常遠小於此
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function validate(body) {
  if (!body || typeof body !== "object") return "請求內容必須是 JSON";
  const { system, messages } = body;
  if (typeof system !== "string" || !system || system.length > MAX_SYSTEM_CHARS) return "system 格式錯誤";
  if (!Array.isArray(messages) || !messages.length || messages.length > MAX_MESSAGES) return "messages 數量錯誤";
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const role = i % 2 === 0 ? "user" : "assistant";
    if (!m || m.role !== role || typeof m.content !== "string" || !m.content) return "messages 必須是 user / assistant 交替的文字";
    if (m.content.length > MAX_MESSAGE_CHARS) return "內容太長";
  }
  if (messages[messages.length - 1].role !== "user") return "最後一則訊息必須來自 user";
  const images = body.images == null ? [] : body.images;
  if (!Array.isArray(images) || images.length > MAX_IMAGES) return "最多 5 張圖片";
  for (const img of images) {
    if (!img || !IMAGE_TYPES.includes(img.media_type)) return "不支援的圖片格式";
    if (typeof img.data !== "string" || !img.data || img.data.length > MAX_IMAGE_B64) return "圖片太大";
  }
  return null;
}

/* 圖片放在第一則 user 訊息的開頭，文字在後 */
function withImages(messages, images) {
  if (!images || !images.length) return messages;
  const [first, ...rest] = messages;
  const content = [
    ...images.map((img) => ({ type: "image", source: { type: "base64", media_type: img.media_type, data: img.data } })),
    { type: "text", text: first.content },
  ];
  return [{ role: "user", content }, ...rest];
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const okOrigin = allowed.includes(origin);
    const headers = corsHeaders(okOrigin ? origin : "");
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ error: "只接受 POST" }, 405);
    if (!okOrigin) return json({ error: "這個網域未被允許，請在 ALLOWED_ORIGINS 加入它" }, 403);
    if (!env.ANTHROPIC_API_KEY) return json({ error: "伺服器尚未設定 ANTHROPIC_API_KEY" }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: "請求內容不是有效的 JSON" }, 400); }
    const problem = validate(body);
    if (problem) return json({ error: problem }, 400);

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      // 生成內容較長，使用串流避免逾時；finalMessage() 取回完整結果
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 32000,
        output_config: { effort: "medium" },
        // 若模型因安全分類拒答，自動改由合適的模型接手
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        // 系統提示詞固定，開啟快取可降低修正回合的成本
        system: [{ type: "text", text: body.system, cache_control: { type: "ephemeral" } }],
        messages: withImages(body.messages, body.images),
      });
      const message = await stream.finalMessage();

      if (message.stop_reason === "refusal") return json({ error: "模型拒絕處理這段內容" }, 422);
      if (message.stop_reason === "max_tokens") return json({ error: "輸出過長被截斷，請縮短內容或演講時間" }, 422);

      const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      return json({ text, model: message.model });
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) return json({ error: "API Key 無效" }, 502);
      if (err instanceof Anthropic.RateLimitError) return json({ error: "請求太頻繁，請稍後再試" }, 429);
      if (err instanceof Anthropic.BadRequestError) return json({ error: "AI 服務拒絕了這個請求：" + err.message }, 400);
      if (err instanceof Anthropic.APIError) return json({ error: `AI 服務錯誤（${err.status}）` }, 502);
      return json({ error: "代理發生錯誤" }, 500);
    }
  },
};
