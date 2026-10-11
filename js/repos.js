import { USER, PAGE, LANGUAGE_COLORS } from "./config.js";
import { state } from "./state.js";
import { fetchJSON, errorText } from "./api.js";
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

function repoCard(repo) {
  const homepage = repo.homepage
    ? `<a href="${escapeHTML(/^https?:\/\//i.test(repo.homepage) ? repo.homepage : "https://" + repo.homepage)}" rel="noopener noreferrer">Site</a>`
    : "";
  const license = repo.license && repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION"
    ? `<span>${escapeHTML(repo.license.spdx_id)}</span>`
    : "";

  return `
    <article class="repo">
      <a class="repo-name" href="${escapeHTML(repo.html_url)}">${escapeHTML(repo.name)}</a>
      <span class="label">${repo.archived ? "Arşivlendi" : repo.fork ? "Fork" : "Herkese açık"}</span>

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

function renderRepositories() {
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

  list.className = "";
  list.innerHTML = visible.map(repoCard).join("");
}

function setupToolbar() {
  const languages = [...new Set(state.repos.map(r => r.language).filter(Boolean))].sort();
  $("lang").innerHTML = `<option value="">Tüm diller</option>` +
    languages.map(l => `<option>${escapeHTML(l)}</option>`).join("");

  const update = () => { state.shown = PAGE; renderRepositories(); };
  ["q", "lang", "sort"].forEach(id => $(id).addEventListener("input", update));
  $("more").addEventListener("click", () => { state.shown += PAGE; renderRepositories(); });
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
    renderRepositories();
  } catch (error) {
    const list = $("repo-list");
    list.className = "status";
    list.textContent = errorText(error, "Depolar yüklenemedi. GitHub'ı doğrudan ziyaret edin.");
    console.error(error);
  }
}
