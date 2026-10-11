import { USER, TIMEZONE } from "./config.js";
import { state } from "./state.js";
import { fetchJSON, errorText } from "./api.js";
import { icon } from "./icons.js";
import { $, escapeHTML, toUrl, cleanUrl } from "./utils.js";

/* ---- Sosyal hesaplar ---- */

const PROVIDERS = [
  { test: /(^|\.)instagram\.com$/, key: "instagram", name: "Instagram", at: true },
  { test: /(^|\.)(x|twitter)\.com$/, key: "x", name: "X", at: true },
  { test: /(^|\.)linkedin\.com$/, key: "linkedin", name: "LinkedIn", at: false },
  { test: /(^|\.)(youtube\.com|youtu\.be)$/, key: "youtube", name: "YouTube", at: false }
];

function socialInfo(account) {
  const href = toUrl(account.url);
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "");
    const provider = PROVIDERS.find(p => p.test.test(host));
    if (!provider) return { href, icon: "link", text: cleanUrl(href), name: host };

    const parts = u.pathname.split("/").filter(Boolean);
    if (["in", "company", "channel", "c", "user"].includes(parts[0])) parts.shift();
    const handle = decodeURIComponent(parts[0] || "").replace(/^@/, "");
    if (!handle) return { href, icon: provider.key, text: provider.name, name: provider.name };

    return {
      href, icon: provider.key, name: provider.name,
      text: provider.at || provider.key === "youtube" ? `@${handle}` : handle
    };
  } catch {
    return { href, icon: "link", text: cleanUrl(href), name: "Bağlantı" };
  }
}

/* ---- Yerel saat ---- */

function updateClock() {
  const el = $("clock");
  if (!el || !TIMEZONE) return;
  try {
    const now = new Date();
    const time = new Intl.DateTimeFormat("tr-TR", {
      timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit"
    }).format(now);
    const offset = new Intl.DateTimeFormat("en", { timeZone: TIMEZONE, timeZoneName: "shortOffset" })
      .formatToParts(now).find(p => p.type === "timeZoneName").value.replace("GMT", "UTC");
    el.textContent = `Yerel saat ${time} (${offset === "UTC" ? "UTC+0" : offset})`;
  } catch {
    el.closest("li").remove();
  }
}
setInterval(updateClock, 30000);

/* ---- Görünüm ---- */

function renderDetails() {
  const user = state.user;
  if (!user) return;

  const rows = [];
  const add = (name, html) => rows.push(`<li>${icon(name)}<span>${html}</span></li>`);
  const external = (href, text, title) =>
    `<a href="${escapeHTML(href)}" title="${escapeHTML(title || text)}" rel="noopener noreferrer" target="_blank">${escapeHTML(text)}</a>`;

  if (user.company) add("building", escapeHTML(user.company));
  if (user.location) add("pin", escapeHTML(user.location));
  if (TIMEZONE) add("clock", `<time id="clock"></time>`);
  if (user.hireable) add("check", "İşe alıma açık");
  if (user.blog) add("link", external(toUrl(user.blog), cleanUrl(user.blog), user.blog));
  if (user.email) add("mail", `<a href="mailto:${escapeHTML(user.email)}">${escapeHTML(user.email)}</a>`);

  const seen = new Set([cleanUrl(user.blog || "")]);
  const socials = [...state.socials];
  if (user.twitter_username && !socials.some(a => /(x|twitter)\.com/.test(a.url))) {
    socials.push({ url: `https://x.com/${user.twitter_username}` });
  }
  socials.forEach(account => {
    const info = socialInfo(account);
    const key = cleanUrl(info.href);
    if (seen.has(key)) return;
    seen.add(key);
    add(info.icon, external(info.href, info.text, `${info.name}: ${key}`));
  });

  add("calendar", `Katılım: ${new Date(user.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long" })}`);

  $("details").innerHTML = rows.join("");
  updateClock();
}

function renderProfile(user) {
  $("avatar").src = user.avatar_url;
  $("avatar").alt = `${user.login} profil fotoğrafı`;
  $("name").textContent = user.name || user.login;
  $("username").textContent = `@${user.login}`;
  $("bio").textContent = user.bio || "";
  $("bio").hidden = !user.bio;
  $("stats").innerHTML =
    `<a href="${escapeHTML(user.html_url)}?tab=followers">${user.followers} takipçi</a> · ` +
    `<a href="${escapeHTML(user.html_url)}?tab=following">${user.following} takip</a> · ` +
    `${user.public_repos} depo`;

  document.title = `${user.name || user.login} (@${user.login}) · GitHub`;

  state.user = user;
  renderDetails();
}

function renderOrgs(orgs) {
  $("orgs").innerHTML = orgs.map(o =>
    `<a href="https://github.com/${escapeHTML(o.login)}" title="${escapeHTML(o.login)}" rel="noopener noreferrer">` +
    `<img src="${escapeHTML(o.avatar_url)}&s=64" alt="${escapeHTML(o.login)}" loading="lazy"></a>`
  ).join("");
}

/* ---- Veri yükleme ---- */

// Profil, sosyal hesaplar ve kurumlar paralel yüklenir.
// Sosyal hesap veya kurum hatası sayfayı bozmaz, sessizce atlanır.
export async function loadProfile() {
  await Promise.all([
    fetchJSON(`/users/${USER}`)
      .then(renderProfile)
      .catch(error => {
        $("bio").textContent = errorText(error, "GitHub profili yüklenemedi.");
        console.error(error);
      }),

    fetchJSON(`/users/${USER}/social_accounts`)
      .then(list => { state.socials = list; renderDetails(); })
      .catch(() => {}),

    fetchJSON(`/users/${USER}/orgs`)
      .then(renderOrgs)
      .catch(() => {})
  ]);
}
