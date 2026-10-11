import { USER } from "./config.js";
import { fetchJSON, errorText } from "./api.js";
import { icon } from "./icons.js";
import { ctx, encodePath, repoUrl } from "./repo-context.js";
import { decodeBase64, renderMarkdown } from "./readme.js";
import { $, escapeHTML, formatBytes, relativeDate } from "./utils.js";

const IMAGE = /\.(png|jpe?g|gif|webp|svg|ico|bmp|avif)$/i;
const MARKDOWN = /\.(md|markdown)$/i;
const README = /^readme(\.(md|markdown|txt|rst))?$/i;
const MAX_LINES = 4000;

const apiBase = () => `/repos/${USER}/${ctx.name}`;
const currentRef = () => ctx.ref || ctx.info.default_branch;
const refQuery = () => ctx.ref ? `?ref=${encodeURIComponent(ctx.ref)}` : "";

/* ---- Ortak parçalar ---- */

// Dal seçici + dosya yolu (breadcrumb)
function bar() {
  const parts = ctx.path ? ctx.path.split("/") : [];
  const crumbs = [parts.length
    ? `<a data-nav href="${repoUrl("")}">${escapeHTML(ctx.name)}</a>`
    : `<strong>${escapeHTML(ctx.name)}</strong>`];

  parts.forEach((part, i) => {
    const to = parts.slice(0, i + 1).join("/");
    crumbs.push(i === parts.length - 1
      ? `<strong>${escapeHTML(part)}</strong>`
      : `<a data-nav href="${repoUrl(to)}">${escapeHTML(part)}</a>`);
  });

  const names = new Set(ctx.branches);
  names.add(currentRef());
  const options = [...names].map(n =>
    `<option${n === currentRef() ? " selected" : ""}>${escapeHTML(n)}</option>`).join("");

  return `
    <div class="rv-bar">
      <label class="rv-branch">${icon("branch")}<select data-branch aria-label="Dal">${options}</select></label>
      <nav class="crumbs" aria-label="Yol">${crumbs.join('<span class="sep">/</span>')}</nav>
    </div>`;
}

// Son commit satırı
function commitRow(list) {
  const commit = Array.isArray(list) && list[0];
  if (!commit) return "";
  const message = commit.commit.message.split("\n")[0];
  const who = (commit.author && commit.author.login) || commit.commit.author.name || "";

  return `
    <div class="rv-commit">
      <strong>${escapeHTML(message)}</strong>
      <span>${escapeHTML(who)}</span>
      <span>${relativeDate(new Date(commit.commit.author.date))}</span>
      <a href="${escapeHTML(commit.html_url)}" target="_blank" rel="noopener noreferrer"><code>${commit.sha.slice(0, 7)}</code></a>
    </div>`;
}

/* ---- Klasör görünümü ---- */

function row(type, name, href, size, i) {
  const folder = type === "folder";
  return `<a class="row${folder ? " dir" : ""}" data-nav href="${escapeHTML(href)}" style="--i:${Math.min(i, 12)}">` +
    `${icon(type)}<span class="name">${escapeHTML(name)}</span><span class="size">${size}</span></a>`;
}

async function loadDirReadme(item, target) {
  try {
    const data = await fetchJSON(`${apiBase()}/contents/${encodePath(item.path)}${refQuery()}`);
    const text = decodeBase64(data.content);
    const dir = item.path.includes("/") ? item.path.replace(/[^/]+$/, "") : "";
    const base = {
      raw: `https://raw.githubusercontent.com/${USER}/${ctx.name}/${currentRef()}/${dir}`,
      blob: `https://github.com/${USER}/${ctx.name}/blob/${currentRef()}/${dir}`
    };
    if (MARKDOWN.test(item.name)) renderMarkdown(target, text, base);
    else target.innerHTML = `<pre>${escapeHTML(text)}</pre>`;
  } catch {
    target.closest(".readme").remove();
  }
}

async function renderDir(items, commit) {
  const sorted = [...items].sort((a, b) =>
    (a.type === "dir" ? 0 : 1) - (b.type === "dir" ? 0 : 1) || a.name.localeCompare(b.name));

  const rows = [];
  if (ctx.path) rows.push(row("folder", "..", repoUrl(ctx.path.replace(/\/?[^/]+$/, "")), "", 0));

  sorted.forEach((item, i) => {
    if (item.type === "dir") rows.push(row("folder", item.name, repoUrl(item.path), "", i + 1));
    else if (item.type === "submodule") rows.push(`<span class="row">${icon("folder")}<span class="name">${escapeHTML(item.name)}</span><span class="size">submodule</span></span>`);
    else rows.push(row("file", item.name, repoUrl(item.path), formatBytes(item.size), i + 1));
  });

  const readme = sorted.find(i => i.type === "file" && README.test(i.name));

  $("rv-main").innerHTML = bar() + commitRow(commit) +
    (rows.length ? `<div class="files">${rows.join("")}</div>` : `<div class="notice">Bu klasör boş.</div>`) +
    (readme ? `
      <section class="readme">
        <div class="readme-title"><span>${escapeHTML(readme.name)}</span></div>
        <article class="readme-content" id="dir-readme"></article>
      </section>` : "");

  if (readme) await loadDirReadme(readme, $("dir-readme"));
}

/* ---- Dosya görünümü ---- */

function codeHTML(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  const shown = lines.slice(0, MAX_LINES);
  return {
    html: shown.map(l => `<span class="line">${escapeHTML(l)}</span>`).join("\n"),
    total: lines.length,
    truncated: lines.length > shown.length
  };
}

async function renderFile(data, commit) {
  const main = $("rv-main");
  const raw = data.download_url;

  let kind = "text", text = "";
  if (IMAGE.test(data.name)) kind = "image";
  else if (!data.content) kind = "large";
  else {
    try {
      text = decodeBase64(data.content, true);
      if (text.includes("\u0000")) kind = "binary";
    } catch { kind = "binary"; }
  }
  ctx.fileText = text;

  const isMarkdown = kind === "text" && MARKDOWN.test(data.name);
  const code = kind === "text" ? codeHTML(text) : null;

  const notices = {
    large: "Bu dosya görüntülenemeyecek kadar büyük (1 MB üzeri).",
    binary: "İkili dosya, burada görüntülenemiyor."
  };

  let body = "";
  if (kind === "image") body = `<div class="fv-img"><img src="${escapeHTML(raw)}" alt="${escapeHTML(data.name)}"></div>`;
  else if (kind === "text") {
    body = `<pre class="code" data-pane="code"${isMarkdown ? " hidden" : ""}><code>${code.html}</code></pre>` +
      (isMarkdown ? `<article class="readme-content" data-pane="preview"></article>` : "") +
      (code.truncated ? `<div class="fv-note">İlk ${MAX_LINES} satır gösteriliyor. Tamamı için GitHub'da aç.</div>` : "");
  } else body = `<div class="fv-note">${notices[kind]}</div>`;

  main.innerHTML = bar() + commitRow(commit) + `
    <div class="fileview">
      <div class="fv-head">
        <span>${code ? `${code.total} satır · ` : ""}${formatBytes(data.size)}</span>
        <div class="fv-actions">
          ${isMarkdown ? `<div class="view-toggle">
            <button type="button" data-fv="preview" aria-pressed="true">Önizleme</button>
            <button type="button" data-fv="code" aria-pressed="false">Kod</button></div>` : ""}
          ${kind === "text" ? `<button class="button rv-btn" type="button" data-copy-file>Kopyala</button>` : ""}
          ${raw ? `<a class="button rv-btn" href="${escapeHTML(raw)}" target="_blank" rel="noopener noreferrer">Ham</a>` : ""}
          <a class="button rv-btn" href="${escapeHTML(data.html_url)}" target="_blank" rel="noopener noreferrer">GitHub'da aç</a>
        </div>
      </div>
      ${body}
    </div>`;

  if (isMarkdown) {
    const dir = data.path.includes("/") ? data.path.replace(/[^/]+$/, "") : "";
    renderMarkdown(main.querySelector('[data-pane="preview"]'), text, {
      raw: `https://raw.githubusercontent.com/${USER}/${ctx.name}/${currentRef()}/${dir}`,
      blob: `https://github.com/${USER}/${ctx.name}/blob/${currentRef()}/${dir}`
    });

    main.querySelectorAll("[data-fv]").forEach(button => button.addEventListener("click", () => {
      main.querySelectorAll("[data-fv]").forEach(b => b.setAttribute("aria-pressed", b === button));
      main.querySelector('[data-pane="preview"]').hidden = button.dataset.fv !== "preview";
      main.querySelector('[data-pane="code"]').hidden = button.dataset.fv !== "code";
    }));
  }
}

/* ---- Giriş ---- */

// Adres çubuğundaki yola göre klasör veya dosyayı çizer.
export async function renderPath() {
  const commitUrl = `${apiBase()}/commits?per_page=1&sha=${encodeURIComponent(currentRef())}` +
    (ctx.path ? `&path=${encodeURIComponent(ctx.path)}` : "");

  try {
    const [data, commit] = await Promise.all([
      fetchJSON(`${apiBase()}/contents${ctx.path ? "/" + encodePath(ctx.path) : ""}${refQuery()}`),
      fetchJSON(commitUrl).catch(() => null)
    ]);
    if (Array.isArray(data)) await renderDir(data, commit);
    else await renderFile(data, commit);
  } catch (error) {
    const message = error.status === 404
      ? (ctx.path ? "Bu yol bulunamadı." : "Bu depo boş veya dal bulunamadı.")
      : errorText(error, "Dosyalar yüklenemedi.");
    $("rv-main").innerHTML = bar() + `<div class="notice">${escapeHTML(message)}</div>`;
  }
}
