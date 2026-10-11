import { PAGE } from "./config.js";

const VIEW_KEY = "view";

export function readView() {
  try { return localStorage.getItem(VIEW_KEY) === "grid" ? "grid" : "list"; } catch { return "list"; }
}
export function saveView(view) {
  try { localStorage.setItem(VIEW_KEY, view); } catch {}
}

// Modüller arasında paylaşılan tek durum nesnesi.
export const state = {
  user: null,
  socials: [],
  repos: [],
  shown: PAGE,
  view: readView()   // "list" | "grid" (tarayıcıda hatırlanır)
};
