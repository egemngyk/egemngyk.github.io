import { STATUS } from "./config.js";
import { $ } from "./utils.js";

// Durumu data/status.json'dan okur (GitHub Actions her saat günceller).
// Dosya yoksa veya okunamazsa config.js'teki STATUS yedek olarak kullanılır.
async function readStatus() {
  try {
    const response = await fetch("data/status.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`status.json: ${response.status}`);

    const data = await response.json();
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) return null;   // Süresi dolmuş
    return { emoji: data.emoji || "", text: data.text || "" };
  } catch {
    return STATUS;
  }
}

// GitHub'daki durum (emoji + yazı) menünün sağında gösterilir.
export async function loadStatus() {
  const el = $("status");
  const status = await readStatus();
  if (!el || !status || !(status.emoji || status.text)) return;

  if (status.emoji) {
    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.textContent = status.emoji;
    el.append(emoji);
  }
  if (status.text) {
    const text = document.createElement("span");
    text.className = "text";
    text.textContent = status.text;
    el.append(text);
  }

  el.title = [status.emoji, status.text].filter(Boolean).join(" ");
  el.hidden = false;
}