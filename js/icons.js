const PATHS = {
  pin: `<path d="M8 14.5s5-4.3 5-8.2a5 5 0 0 0-10 0c0 3.9 5 8.2 5 8.2z"/><circle cx="8" cy="6.3" r="1.8"/>`,
  clock: `<circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.4 1.6"/>`,
  link: `<path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 0 0-3.7-3.7l-.6.6"/><path d="M9.2 6.8a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 0 0 3.7 3.7l.6-.6"/>`,
  mail: `<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2.5 5l5.5 4 5.5-4"/>`,
  building: `<rect x="3" y="2" width="10" height="12" rx="1"/><path d="M6 5h1M9 5h1M6 8h1M9 8h1M7 14v-3h2v3"/>`,
  calendar: `<rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/>`,
  check: `<circle cx="8" cy="8" r="6"/><path d="M5.5 8.2l1.8 1.8 3.3-3.6"/>`,
  instagram: `<rect x="2.5" y="2.5" width="11" height="11" rx="3.5"/><circle cx="8" cy="8" r="2.5"/><circle cx="11.2" cy="4.8" r=".4"/>`,
  x: `<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>`,
  linkedin: `<rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="M5.5 7v4M5.5 5.2v.1M8 11V7M8 8.6C8 7.6 8.8 7 9.6 7S11 7.6 11 8.6V11"/>`,
  youtube: `<rect x="1.5" y="3.5" width="13" height="9" rx="3"/><path d="M6.8 6v4l3.4-2z"/>`,
  list: `<path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.1M2.5 8h.1M2.5 12h.1"/>`,
  grid: `<rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="9" y="2.5" width="4.5" height="4.5" rx="1"/><rect x="2.5" y="9" width="4.5" height="4.5" rx="1"/><rect x="9" y="9" width="4.5" height="4.5" rx="1"/>`,
  folder: `<path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.4 1.6h5A1.5 1.5 0 0 1 14 6.1v5.4a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5z"/>`,
  file: `<path d="M4 2h5l3 3v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-11A.5.5 0 0 1 4 2z"/><path d="M9 2v3h3"/>`,
  branch: `<circle cx="4.5" cy="3.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="11.5" cy="5.5" r="1.5"/><path d="M4.5 5v6M11.5 7c0 2-2 2.5-7 3.5"/>`,
  star: `<path d="M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4L2.2 6.3l4-.6z"/>`,
  fork: `<circle cx="4.5" cy="3.5" r="1.5"/><circle cx="11.5" cy="3.5" r="1.5"/><circle cx="8" cy="12.5" r="1.5"/><path d="M4.5 5v1.5A1.5 1.5 0 0 0 6 8h4a1.5 1.5 0 0 0 1.5-1.5V5M8 8v3"/>`,
  eye: `<path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>`
};

export const icon = name =>
  `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" ` +
  `stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name]}</svg>`;
