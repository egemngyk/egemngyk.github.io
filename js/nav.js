import { $ } from "./utils.js";

// Kaydırdıkça menüde aktif bölümü işaretler.
export function trackNav() {
  const links = [...document.querySelectorAll("nav a")];
  const sections = ["overview", "readme", "repositories"].map($);

  const onScroll = () => {
    let current = "overview";
    sections.forEach(s => {
      if (!s.hidden && s.getBoundingClientRect().top < 120) current = s.id;
    });
    links.forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#" + current));
  };

  addEventListener("scroll", onScroll, { passive: true });
}
