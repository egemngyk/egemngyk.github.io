// Sayfanın tüm ayarları burada.

export const USER = "egemngyk";

// GitHub API saat dilimini vermez; yerel saat için IANA adı yaz ("" = gizle).
export const TIMEZONE = "Europe/Istanbul";

export const API = "https://api.github.com";
export const PAGE = 10;                    // Bir seferde gösterilecek depo sayısı
export const CACHE_TTL = 10 * 60 * 1000;   // Önbellek süresi (ms)

export const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572a5", HTML: "#e34c26",
  CSS: "#663399", Java: "#b07219", "C#": "#178600", "C++": "#f34b7d", C: "#555555",
  Go: "#00add8", Rust: "#dea584", PHP: "#4f5d95", Kotlin: "#a97bff", Swift: "#f05138",
  Dart: "#00b4ab", Shell: "#89e051", Ruby: "#701516", Vue: "#41b883", Lua: "#000080"
};
