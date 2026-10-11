import { loadProfile } from "./profile.js";
import { loadReadme } from "./readme.js";
import { loadRepositories } from "./repos.js";
import { trackNav } from "./nav.js";

// Profil, README ve depolar birbirini beklemeden paralel yüklenir.
trackNav();
await Promise.all([loadProfile(), loadReadme(), loadRepositories()]);
