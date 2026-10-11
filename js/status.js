import { STATUS } from "./config.js";
import { $ } from "./utils.js";

// GitHub'daki durum (emoji + yazı) menünün sağında gösterilir.
export function renderStatus() {
  const el = $("status");
  if (!el || !STATUS || !(STATUS.emoji || STATUS.text)) return;

  if (STATUS.emoji) {
    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.textContent = STATUS.emoji;
    el.append(emoji);
  }
  if (STATUS.text) {
    const text = document.createElement("span");
    text.className = "text";
    text.textContent = STATUS.text;
    el.append(text);
  }

  el.title = [STATUS.emoji, STATUS.text].filter(Boolean).join(" ");
  el.hidden = false;
}