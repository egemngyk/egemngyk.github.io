import { USER } from "./config.js";
import { fetchJSON } from "./api.js";
import { $ } from "./utils.js";

// Göreli görsel ve bağlantıları GitHub adreslerine çevirir.
function absolutize(root, base) {
  const fix = (el, attr, prefix) => {
    const value = el.getAttribute(attr);
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return;
    el.setAttribute(attr, new URL(value, prefix).href);
  };

  root.querySelectorAll("img[src], source[src]").forEach(el => fix(el, "src", base.raw));
  root.querySelectorAll("a[href]").forEach(el => {
    fix(el, "href", base.blob);
    const href = el.getAttribute("href");
    if (/^https?:/i.test(href)) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
}

// Markdown'ı temizleyip hedef öğeye yazar.
export function renderMarkdown(target, markdown, base) {
  if (window.marked && window.DOMPurify) {
    const html = DOMPurify.sanitize(marked.parse(markdown, { gfm: true, breaks: false }), {
      USE_PROFILES: { html: true }
    });
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    absolutize(tpl.content, base);
    target.replaceChildren(tpl.content);
  } else {
    // Kütüphaneler yüklenemezse düz metin göster.
    const pre = document.createElement("pre");
    pre.textContent = markdown;
    target.replaceChildren(pre);
  }
}

// GitHub'ın base64 içeriğini metne çevirir (fatal: geçersiz UTF-8'de hata verir).
export function decodeBase64(content, fatal = false) {
  const bytes = Uint8Array.from(atob(content.replace(/\s/g, "")), c => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal }).decode(bytes);
}

// Bir deponun README'sini getirir (profil README'si için repo = USER).
export async function fetchReadme(repo) {
  const data = await fetchJSON(`/repos/${USER}/${repo}/readme`);
  const markdown = decodeBase64(data.content);

  const dir = data.path.includes("/") ? data.path.replace(/[^/]+$/, "") : "";
  const ref = new URL(data.html_url).pathname.split("/")[4] || "HEAD";

  return {
    markdown,
    name: data.name,
    url: data.html_url,
    base: {
      raw: `https://raw.githubusercontent.com/${USER}/${repo}/${ref}/${dir}`,
      blob: `https://github.com/${USER}/${repo}/blob/${ref}/${dir}`
    }
  };
}

export async function loadReadme() {
  try {
    const readme = await fetchReadme(USER);
    renderMarkdown($("readme-content"), readme.markdown, readme.base);
    $("readme-path").textContent = readme.name;
    $("readme-edit").href = readme.url;
    $("readme").hidden = false;
  } catch {
    // Profil README'si isteğe bağlıdır; yoksa bölüm ve menü bağlantısı gizlenir.
    document.querySelector('nav a[href="#readme"]').hidden = true;
  }
}
