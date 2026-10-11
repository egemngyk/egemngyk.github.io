export const $ = id => document.getElementById(id);

export const escapeHTML = value =>
  String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);

export const toUrl = raw => /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

// https://www.site.com/yol/ -> site.com/yol
export function cleanUrl(raw) {
  try {
    const u = new URL(toUrl(raw));
    return (u.hostname.replace(/^www\./, "") + u.pathname + u.search).replace(/\/$/, "");
  } catch {
    return raw;
  }
}

export function relativeDate(date) {
  const days = Math.round((date - Date.now()) / 864e5);
  const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });
  if (Math.abs(days) < 30) return rtf.format(days, "day");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

export const formatBytes = n =>
  n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`;

export const formatDate = d =>
  new Date(d).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });

// Düğmenin yazısını kısa süre "Kopyalandı" yapar.
export function copyText(button, text) {
  const label = button.dataset.label ||= button.textContent;
  return navigator.clipboard.writeText(text).then(() => {
    button.textContent = "Kopyalandı";
    setTimeout(() => { button.textContent = label; }, 1500);
  }).catch(() => {});
}
