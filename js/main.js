import { loadProfile } from "./profile.js";
import { loadReadme } from "./readme.js";
import { loadRepositories } from "./repos.js";
import { initRepoDialog, openFromHash } from "./repo-dialog.js";
import { startLoader, progress, finishLoader } from "./loader.js";
import { trackNav } from "./nav.js";
import { $ } from "./utils.js";

// Avatar yüklenmeden sayfa açılmasın (en fazla 1,5 sn beklenir).
async function waitForAvatar() {
  const img = $("avatar");
  if (!img || img.complete) return;
  await Promise.race([
    img.decode().catch(() => {}),
    new Promise(resolve => setTimeout(resolve, 1500))
  ]);
}

startLoader();
trackNav();
initRepoDialog();

try {
  // Profil, README ve depolar paralel yüklenir; hepsi bitince sayfa tek seferde açılır.
  const tasks = [loadProfile(), loadReadme(), loadRepositories()];
  let done = 0;
  tasks.forEach(task => task.finally(() => progress(++done, tasks.length)));

  await Promise.allSettled(tasks);
  await waitForAvatar();
} finally {
  await finishLoader();
  openFromHash();
}
