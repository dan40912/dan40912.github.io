// SpeechSynthesis 封裝(PRD §6.9)。純瀏覽器 API,無外部服務。

export const RATE_MAP = { slow: 0.8, normal: 1.0, fast: 1.2 };

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice() {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "zh-TW") ||
    voices.find((v) => v.lang && v.lang.startsWith("zh")) ||
    null
  );
}

export function speak(text, { rate = "normal", volume = 100 } = {}) {
  if (!isSpeechSupported()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "zh-TW";
  }
  utterance.rate = RATE_MAP[rate] ?? 1.0;
  utterance.volume = Math.min(1, Math.max(0, volume / 100));
  window.speechSynthesis.speak(utterance);
  return true;
}

export function testVoice() {
  return speak("語音測試,現在可以聽到播報聲音。", { rate: "normal", volume: 100 });
}

// PRD §6.9 文案:「第 2 場地，王小明、陳大華、Amy、Peter，請儘快上場打球。」
export function buildAnnouncement(courtName, playerNames) {
  return `${courtName}，${playerNames.join("、")}，請儘快上場打球。`;
}
