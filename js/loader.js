import { $ } from "./utils.js";

let value = 0;
let timer;

function set(v) {
  value = Math.max(value, Math.min(v, 100));
  $("loadbar").style.transform = `scaleX(${value / 100})`;
}

// Çubuk kendiliğinden yavaşça ilerler, gerçek adımlar tamamlandıkça öne geçer.
export function startLoader() {
  set(8);
  timer = setInterval(() => set(value + (88 - value) * 0.08), 200);
}

export function progress(done, total) {
  set(90 * done / total);
}

// Çubuğu tamamlar, sayfayı yumuşakça gösterir.
export async function finishLoader() {
  clearInterval(timer);
  set(100);
  await new Promise(r => setTimeout(r, 250));
  document.documentElement.classList.remove("loading");
  $("loadbar").classList.add("done");
}
