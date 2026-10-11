import { USER } from "./config.js";
import { fetchJSON, errorText } from "./api.js";
import { startLoader, restartLoader, progress, finishLoader } from "./loader.js";
import { ctx, syncFromUrl, repoUrl } from "./repo-context.js";
import { renderHead, renderSide } from "./repo-side.js";
import { renderPath } from "./repo-files.js";
import { $, escapeHTML, copyText } from "./utils.js";

function showError(message) {
  $("repo-head").innerHTML = `<h1 class="rv-title"><a href="index.html#repositories">${escapeHTML(USER)}</a></h1>`;
  $("rv-main").innerHTML = `<div class="notice">${escapeHTML(message)} <a href="index.html#repositories">Depolara dön</a></div>`;
  $("rv-side").hidden = true;
}

// Klasör, dosya veya dal değişince sayfa yenilenmeden içerik güncellenir.
async function navigate(href, push = true) {
  const main = $("rv-main");
  if (push) history.pushState(null, "", href);
  syncFromUrl();

  restartLoader();
  main.classList.add("is-busy");
  await renderPath();
  main.classList.remove("is-busy");
  await finishLoader();

  if (push) window.scrollTo({ top: 0 });
}

document.addEventListener("click", e => {
  const link = e.target.closest("a[data-nav]");
  if (link && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    e.preventDefault();
    navigate(link.href);
    return;
  }

  const copy = e.target.closest("[data-copy]");
  if (copy) copyText(copy, copy.dataset.copy);

  const copyFile = e.target.closest("[data-copy-file]");
  if (copyFile) copyText(copyFile, ctx.fileText);
});

document.addEventListener("change", e => {
  const select = e.target.closest("select[data-branch]");
  if (!select) return;
  navigate(repoUrl("", select.value === ctx.info.default_branch ? "" : select.value));
});

addEventListener("popstate", () => navigate(location.href, false));

startLoader();

try {
  if (!ctx.name) throw Object.assign(new Error("Depo adı yok"), { status: 404 });

  const base = `/repos/${USER}/${ctx.name}`;
  const [info, languages, branches] = await Promise.all([
    fetchJSON(base),
    fetchJSON(`${base}/languages`).catch(() => ({})),
    fetchJSON(`${base}/branches?per_page=100`).catch(() => [])
  ]);

  ctx.info = info;
  ctx.branches = branches.map(b => b.name);
  document.title = `${info.name} · ${USER}`;

  renderHead(info);
  renderSide(info, languages);
  progress(1, 2);

  await renderPath();
} catch (error) {
  showError(error.status === 404 ? "Depo bulunamadı." : errorText(error, "Depo yüklenemedi."));
} finally {
  await finishLoader();
}
