import { USER, LANGUAGE_COLORS } from "./config.js";
import { icon } from "./icons.js";
import { $, escapeHTML, toUrl, cleanUrl, formatBytes, formatDate } from "./utils.js";

const nf = new Intl.NumberFormat("tr-TR");
const external = (href, text) =>
  `<a href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">${escapeHTML(text)}</a>`;

// Üst başlık: kullanıcı / depo, yıldız ve fork sayısı
export function renderHead(info) {
  const state = info.archived ? "Arşivlendi" : info.fork ? "Fork" : "Herkese açık";

  $("repo-head").innerHTML = `
    <div>
      <h1 class="rv-title">
        <a href="index.html#repositories" title="Depolara dön">${escapeHTML(USER)}</a>
        <span class="sep">/</span><strong>${escapeHTML(info.name)}</strong>
        <span class="label">${state}</span>
      </h1>
      ${info.fork && info.parent ? `<p class="rv-sub">Fork: ${external(info.parent.html_url, info.parent.full_name)}</p>` : ""}
      ${info.archived ? `<p class="rv-sub">Bu depo arşivlendi ve salt okunur.</p>` : ""}
    </div>
    <div class="rv-head-right">
      <span class="chip" title="Yıldız">${icon("star")}${nf.format(info.stargazers_count)}</span>
      <span class="chip" title="Fork">${icon("fork")}${nf.format(info.forks_count)}</span>
      <a class="button rv-btn" href="${escapeHTML(info.html_url)}" target="_blank" rel="noopener noreferrer">GitHub'da aç</a>
    </div>`;
}

// Sağ sütun: hakkında, diller, klonlama
export function renderSide(info, langs) {
  const rows = [];
  const add = (name, html) => rows.push(`<li>${icon(name)}<span>${html}</span></li>`);

  if (info.homepage) add("link", external(toUrl(info.homepage), cleanUrl(info.homepage)));
  const license = info.license && info.license.spdx_id && info.license.spdx_id !== "NOASSERTION"
    ? info.license.name || info.license.spdx_id : "";
  if (license) add("file", escapeHTML(license));
  add("star", `${nf.format(info.stargazers_count)} yıldız`);
  add("eye", `${nf.format(info.subscribers_count ?? info.watchers_count)} izleyen`);
  add("fork", `${nf.format(info.forks_count)} fork`);
  add("branch", `Varsayılan dal: ${escapeHTML(info.default_branch)}`);
  add("calendar", `Oluşturulma: ${formatDate(info.created_at)}`);
  add("clock", `Son push: ${formatDate(info.pushed_at)}`);
  add("folder", `Boyut: ${formatBytes(info.size * 1024)}`);

  const topics = info.topics && info.topics.length
    ? `<div class="topics">${info.topics.map(t => `<span>${escapeHTML(t)}</span>`).join("")}</div>` : "";

  const total = Object.values(langs).reduce((a, b) => a + b, 0);
  const entries = Object.entries(langs).sort((a, b) => b[1] - a[1]);
  const color = l => LANGUAGE_COLORS[l] || "var(--muted)";
  const pct = v => v / total * 100;
  const pctText = v => pct(v) < 0.1 ? "<0,1" : pct(v).toLocaleString("tr-TR", { maximumFractionDigits: 1 });

  const languages = total ? `
    <section>
      <h2>Diller</h2>
      <div class="langbar" role="img" aria-label="Dil dağılımı">
        ${entries.map(([l, v]) => `<i title="${escapeHTML(l)}" style="width:${pct(v)}%;background:${color(l)}"></i>`).join("")}
      </div>
      <ul class="langlist">
        ${entries.map(([l, v]) => `<li><i class="dot" style="background:${color(l)}"></i><b>${escapeHTML(l)}</b>${pctText(v)}%</li>`).join("")}
      </ul>
    </section>` : "";

  const clone = `git clone ${info.clone_url}`;

  $("rv-side").innerHTML = `
    <section>
      <h2>Hakkında</h2>
      <p class="description">${info.description ? escapeHTML(info.description) : "Açıklama yok."}</p>
      ${topics}
      <ul class="details">${rows.join("")}</ul>
    </section>
    ${languages}
    <section>
      <h2>Klonla</h2>
      <div class="clone">
        <code>${escapeHTML(clone)}</code>
        <button class="button rv-btn" type="button" data-copy="${escapeHTML(clone)}">Kopyala</button>
      </div>
    </section>`;
}
