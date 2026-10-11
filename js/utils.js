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
