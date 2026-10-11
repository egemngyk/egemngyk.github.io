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

function renderMarkdown(markdown, base) {
  const target = $("readme-content");

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

export async function loadReadme() {
  try {
    const data = await fetchJSON(`/repos/${USER}/${USER}/readme`);
    const bytes = Uint8Array.from(atob(data.content.replace(/\s/g, "")), c => c.charCodeAt(0));
    const markdown = new TextDecoder().decode(bytes);

    const dir = data.path.includes("/") ? data.path.replace(/[^/]+$/, "") : "";
    const ref = new URL(data.html_url).pathname.split("/")[4] || "HEAD";
    const base = {
      raw: `https://raw.githubusercontent.com/${USER}/${USER}/${ref}/${dir}`,
      blob: `https://github.com/${USER}/${USER}/blob/${ref}/${dir}`
    };

    renderMarkdown(markdown, base);
    $("readme-path").textContent = data.name;
    $("readme-edit").href = data.html_url;
    $("readme").hidden = false;
  } catch {
    // Profil README'si isteğe bağlıdır; yoksa bölüm ve menü bağlantısı gizlenir.
    document.querySelector('nav a[href="#readme"]').hidden = true;
  }
}
