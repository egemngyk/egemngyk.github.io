import { API, CACHE_TTL } from "./config.js";

// Önbellek: depolama hata verirse sessizce atlanır.
const cache = {
  get(key) {
    try {
      const item = JSON.parse(localStorage.getItem("gh:" + key));
      return item && Date.now() - item.t < CACHE_TTL ? item.v : null;
    } catch { return null; }
  },
  set(key, v) {
    try {
      const text = JSON.stringify({ t: Date.now(), v });
      if (text.length < 200000) localStorage.setItem("gh:" + key, text);   // büyük dosyalar önbelleğe alınmaz
    } catch {}
  }
};

// path örneği: "/users/egemngyk"
export async function fetchJSON(path) {
  const cached = cache.get(path);
  if (cached) return cached;

  const response = await fetch(API + path, {
    headers: { Accept: "application/vnd.github+json" }
  });

  if (!response.ok) {
    const error = new Error(`GitHub API: ${response.status}`);
    error.status = response.status;
    if (response.status === 403 || response.status === 429) {
      const reset = response.headers.get("x-ratelimit-reset");
      if (reset) error.reset = new Date(reset * 1000);
    }
    throw error;
  }

  const data = await response.json();
  cache.set(path, data);
  return data;
}

export const errorText = (error, fallback) =>
  error.reset
    ? `GitHub API sınırına ulaşıldı. ${error.reset.toLocaleTimeString("tr-TR")} sonrasında tekrar deneyin.`
    : fallback;
