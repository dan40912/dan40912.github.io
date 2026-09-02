// JSON 匯入/匯出(PRD §6.11)。匯入內容視為不可信資料,僅解析與驗證,不執行任何程式碼。
import { validateImportedState } from "../domain/validators.js";

export function downloadStateAsJSON(state) {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `badminton-${state.event?.name || "event"}-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function readImportedFile(file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return { valid: false, errors: ["JSON 格式錯誤,無法解析"], data: null };
  }
  const result = validateImportedState(data);
  return { ...result, data: result.valid ? data : null };
}
