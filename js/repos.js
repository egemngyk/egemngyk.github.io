import { USER, PAGE, LANGUAGE_COLORS } from "./config.js";
import { state, saveView } from "./state.js";
import { fetchJSON, errorText } from "./api.js";
import { icon } from "./icons.js";
import { $, escapeHTML, relativeDate } from "./utils.js";

function filteredRepos() {
  const q = $("q").value.trim().toLowerCase();
  const lang = $("lang").value;
  const sort = $("sort").value;

  return state.repos
    .filter(r => (!lang || r.language === lang) &&
      (!q || `${r.name} ${r.description || ""} ${(r.topics || []).join(" ")}`.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "updated") return new Date(b.pushed_at) - new Date(a.pushed_at);
      if (sort === "created") return new Date(b.created_at) - new Date(a.created_at);
      return b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at);
    });
}

// delay: null ise animasyon yok, sayı ise kart sırayla belirir.
function repoCard(repo, delay) {
  const homepage = repo.homepage
    ? `<a href="${escapeHTML(/^https?:\/\//i.test(repo.homepage) ? repo.homepage : "https://" + repo.homepage)}" rel="noopener noreferrer">Site</a>`
    : "";
  const license = repo.license && repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION"
    ? `<span>${escapeHTML(repo.license.spdx_id)}</span>`
    : "";

  return `
    <article class="repo${delay === null ? "" : " enter"}" data-repo="${escapeHTML(repo.name)}"${delay === null ? "" : ` style="--i:${delay}"`}>
      <div>
        <a class="repo-name" href="repo.html?repo=${encodeURIComponent(repo.name)}">${escapeHTML(repo.name)}</a>
        <span class="label">${repo.archived ? "Arşivlendi" : repo.fork ? "Fork" : "Herkese açık"}</span>
      </div>

      ${repo.description ? `<p class="description">${escapeHTML(repo.description)}</p>` : ""}

      ${repo.topics && repo.topics.length ? `
        <div class="topics">${repo.topics.slice(0, 6).map(t => `<span>${escapeHTML(t)}</span>`).join("")}</div>` : ""}

      <div class="meta">
        ${repo.language ? `<span><i class="dot" style="background:${LANGUAGE_COLORS[repo.language] || "var(--muted)"}"></i>${escapeHTML(repo.language)}</span>` : ""}
        <span>☆ ${repo.stargazers_count}</span>
        ${repo.forks_count ? `<span>⑂ ${repo.forks_count}</span>` : ""}
        ${license}
        ${homepage}
        <span title="${escapeHTML(new Date(repo.pushed_at).toLocaleString("tr-TR"))}">Güncellendi ${relativeDate(new Date(repo.pushed_at))}</span>
      </div>
    </article>`;
}

// from: bu sıradan itibaren kartlar animasyonla gelir (varsayılan: hiçbiri).
// base: animasyon gecikmesine eklenecek başlangıç sırası.
function renderRepositories({ from = Infinity, base = 0 } = {}) {
  const list = $("repo-list");
  const all = filteredRepos();
  const visible = all.slice(0, state.shown);

  $("count").textContent = all.length ? `(${all.length})` : "";
  $("more").hidden = all.length <= state.shown;

  if (!visible.length) {
    list.className = "status";
    list.textContent = state.repos.length
      ? "Filtreyle eşleşen depo yok."
      : "Herkese açık depo bulunamadı.";
    return;
  }

  list.className = "repos" + (state.view === "grid" ? " is-grid" : "");
  list.innerHTML = visible
    .map((repo, i) => repoCard(repo, i >= from ? Math.min(i - from, 10) + base : null))
    .join("");
}

function renderViewToggle() {
  $("view").innerHTML = [["grid", "Grid"], ["list", "Liste"]].map(([view, label]) =>
    `<button type="button" data-view="${view}" aria-pressed="${state.view === view}" title="${label} görünümü">` +
    `${icon(view)}<span>${label}</span></button>`
  ).join("");
}

function setView(view) {
  state.view = view;
  saveView(view);
  renderViewToggle();
  renderRepositories({ from: 0 });
}

function setupToolbar() {
  const languages = [...new Set(state.repos.map(r => r.language).filter(Boolean))].sort();
  $("lang").innerHTML = `<option value="">Tüm diller</option>` +
    languages.map(l => `<option>${escapeHTML(l)}</option>`).join("");

  const update = () => { state.shown = PAGE; renderRepositories(); };
  ["q", "lang", "sort"].forEach(id => $(id).addEventListener("input", update));

  $("more").addEventListener("click", () => {
    const from = state.shown;
    state.shown += PAGE;
    renderRepositories({ from });
  });

  renderViewToggle();
  $("view").addEventListener("click", e => {
    const button = e.target.closest("button");
    if (button && button.dataset.view !== state.view) setView(button.dataset.view);
  });

  // Kartın herhangi bir yerine tıklamak depo sayfasını açar (Ctrl/Cmd+tık yeni sekmede).
  $("repo-list").addEventListener("click", e => {
    const card = e.target.closest(".repo");
    if (!card || e.target.closest("a")) return;   // bağlantılar kendi işini yapar
    const href = card.querySelector(".repo-name").href;
    if (e.metaKey || e.ctrlKey) window.open(href, "_blank", "noopener");
    else location.href = href;
  });

  $("toolbar").hidden = false;
}

export async function loadRepositories() {
  try {
    let page = 1, batch;
    do {
      batch = await fetchJSON(`/users/${USER}/repos?type=owner&sort=updated&per_page=100&page=${page++}`);
      state.repos.push(...batch);
    } while (batch.length === 100 && page <= 5);

    setupToolbar();
    renderRepositories({ from: 0, base: 6 });
  } catch (error) {
    const list = $("repo-list");
    list.className = "status";
    list.textContent = errorText(error, "Depolar yüklenemedi. GitHub'ı doğrudan ziyaret edin.");
    console.error(error);
  }
}
