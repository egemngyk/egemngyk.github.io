import { PAGE } from "./config.js";

// Modüller arasında paylaşılan tek durum nesnesi.
export const state = {
  user: null,
  socials: [],
  repos: [],
  shown: PAGE
};
