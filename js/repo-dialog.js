import { state } from "./state.js";
import { icon } from "./icons.js";
import { fetchReadme, renderMarkdown } from "./readme.js";
import { $, escapeHTML, toUrl, relativeDate } from "./utils.js";

const nf = new Intl.NumberFormat("tr-TR");
let token = 0;   // Hızlı art arda açılışlarda eski README yanıtlarını yok saymak için

const formatSize = kb => kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${nf.format(kb)} KB`;
const formatDate = d => new Date(d).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });
const stat = (label, value) => value ? `<div><dt>${label}</dt><dd>${value}</dd></div>` : "";

function body(repo) {
  const license = repo.license && repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION"
    ? escapeHTML(repo.license.spdx_id) : "";
  const clone = `git clone ${repo.clone_url}`;

  return `
    ${repo.description ? `<p class="description">${escapeHTML(repo.description)}</p>` : ""}
    ${repo.topics && repo.topics.length
      ? `<div class="topics">${repo.topics.map(t => `<span>${escapeHTML(t)}</span>`).join("")}</div>` : ""}

    <div class="rd-actions">
      <a class="button" href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer">GitHub'da aç</a>
      ${repo.homepage ? `<a class="button" href="${escapeHTML(toUrl(repo.homepage))}" target="_blank" rel="noopener noreferrer">Siteyi aç</a>` : ""}
    </div>

    <dl class="rd-stats">
      ${stat("Dil", repo.language ? escapeHTML(repo.language) : "")}
      ${stat("Yıldız", nf.format(repo.stargazers_count))}
      ${stat("Fork", nf.format(repo.forks_count))}
      ${stat("İzleyen", nf.format(repo.watchers_count))}
      ${stat("Açık issue", nf.format(repo.open_issues_count))}
      ${stat("Lisans", license)}
      ${stat("Varsayılan dal", escapeHTML(repo.default_branch))}
      ${stat("Boyut", formatSize(repo.size))}
      ${stat("Oluşturulma", formatDate(repo.created_at))}
      ${stat("Son güncelleme", `${formatDate(repo.pushed_at)} (${relativeDate(new Date(repo.pushed_at))})`)}
    </dl>

    <div class="rd-clone">
      <code>${escapeHTML(clone)}</code>
      <button class="button" type="button" data-copy="${escapeHTML(clone)}">Kopyala</button>
    </div>

    <section class="readme rd-readme">
      <div class="readme-title"><span>README.md</span></div>
      <article class="readme-content" id="rd-readme">
        <div class="rd-loading"><span class="spinner"></span>README yükleniyor…</div>
      </article>
    </section>`;
}

export function openRepo(name) {
  const repo = state.repos.find(r => r.name === name);
  if (!repo) return;

  const dialog = $("repo-dialog");
  const mine = ++token;

  $("rd-title").textContent = repo.name;
  $("rd-label").textContent = repo.archived ? "Arşivlendi" : repo.fork ? "Fork" : "Herkese açık";
  $("rd-body").innerHTML = body(repo);
  $("rd-body").scrollTop = 0;

  if (!dialog.open) dialog.showModal();
  history.replaceState(null, "", `#repo-${encodeURIComponent(repo.name)}`);

  fetchReadme(repo.name)
    .then(readme => { if (mine === token) renderMarkdown($("rd-readme"), readme.markdown, readme.base); })
    .catch(() => {
      if (mine === token) $("rd-readme").innerHTML = `<p class="status">Bu depoda gösterilecek bir README yok.</p>`;
    });
}

// Adres çubuğundaki #repo-ad bağlantısını açar (paylaşılabilir bağlantı).
export function openFromHash() {
  const match = location.hash.match(/^#repo-(.+)$/);
  if (match) openRepo(decodeURIComponent(match[1]));
}

export function initRepoDialog() {
  const dialog = $("repo-dialog");
  $("rd-close").innerHTML = icon("x");
  $("rd-close").addEventListener("click", () => dialog.close());

  // Pencere dışına (arka plana) tıklayınca kapat
  dialog.addEventListener("click", e => {
    if (e.target === dialog) dialog.close();

    const copy = e.target.closest("[data-copy]");
    if (copy) {
      navigator.clipboard.writeText(copy.dataset.copy).then(() => {
        copy.textContent = "Kopyalandı";
        setTimeout(() => { copy.textContent = "Kopyala"; }, 1500);
      }).catch(() => {});
    }
  });

  dialog.addEventListener("close", () => {
    token++;
    if (location.hash.startsWith("#repo-")) {
      history.replaceState(null, "", location.pathname + location.search + "#repositories");
    }
  });

  addEventListener("hashchange", openFromHash);
}
