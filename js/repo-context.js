// Depo sayfasının paylaşılan durumu: adres çubuğundaki repo, dal ve yol.

const params = new URLSearchParams(location.search);

const clean = path => (path || "").replace(/^\/+|\/+$/g, "");

export const ctx = {
  name: params.get("repo") || "",
  ref: params.get("ref") || "",
  path: clean(params.get("path")),
  info: null,        // GitHub'dan gelen depo bilgisi
  branches: [],
  fileText: ""       // Açık dosyanın metni (kopyalama için)
};

// Geri/ileri düğmeleriyle adres değişince durumu günceller.
export function syncFromUrl() {
  const p = new URLSearchParams(location.search);
  ctx.ref = p.get("ref") || "";
  ctx.path = clean(p.get("path"));
}

export const encodePath = path => path.split("/").map(encodeURIComponent).join("/");

export function repoUrl(path = "", ref = ctx.ref) {
  const q = new URLSearchParams({ repo: ctx.name });
  if (ref) q.set("ref", ref);
  if (path) q.set("path", path);
  return `repo.html?${q}`;
}
