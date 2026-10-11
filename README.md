# egemngyk · GitHub profil sayfası

GitHub profilini, profil README'ni ve depolarını sade bir arayüzde gösteren **modüler** statik site (saf HTML, CSS ve ES modülleri). Derleme adımı veya bağımlılık kurulumu gerektirmez; veriler tarayıcıdan doğrudan GitHub API'sinden çekilir.

## Özellikler

### Profil sayfası (`index.html`)

- **README üstte:** Profil deposundaki (`kullanici/kullanici`) README, gerçek Markdown olarak gösterilir. Tablolar, listeler, kod blokları, görevler ve görseller desteklenir.
- **Güvenli render:** Markdown, [marked](https://github.com/markedjs/marked) ile çevrilir ve [DOMPurify](https://github.com/cure53/DOMPurify) ile temizlenir. Göreli görsel ve bağlantılar GitHub adreslerine çevrilir.
- **Zengin profil bilgisi:** Şirket, konum, yerel saat, web sitesi, e-posta, katılım tarihi, kurumlar ve profilde eklediğin sosyal hesaplar (Instagram, X, LinkedIn, YouTube ve diğerleri).
- **Temiz bağlantılar:** Uzun adresler `site.com/yol` biçiminde, sosyal hesaplar ikon ve `@kullanici` olarak görünür.
- **Depolar:** Varsayılan **grid** görünümü; istersen **liste** görünümüne geçebilirsin (seçimin hatırlanır). Arama, dile göre filtre, sıralama, konu etiketleri, dil rengi, fork sayısı, lisans ve göreli tarih.

### Depo sayfası (`repo.html`)

Bir depo kartına tıkladığında, normal GitHub depo sayfasının minimal hali açılır:

- **Dosya gezgini:** Klasörlere girip çıkabilir, yol çubuğundan (breadcrumb) geri dönebilirsin. Sayfa yenilenmeden çalışır, geri/ileri düğmeleri de çalışır.
- **Dal seçici:** Depodaki tüm dallar arasında geçiş yapabilirsin.
- **Son commit:** Mesaj, yazar, tarih ve kısa SHA; klasör veya dosya bazında.
- **Dosya görüntüleyici:** Satır numaralı kod görünümü, kopyalama ve ham dosya bağlantısı. Markdown dosyaları için Önizleme / Kod geçişi, görseller için önizleme. Çok büyük veya ikili dosyalarda GitHub'a yönlendirir.
- **README:** Bulunduğun klasörde README varsa altında Markdown olarak gösterilir.
- **Yan sütun:** Açıklama, konu etiketleri, yıldız / izleyen / fork sayıları, lisans, tarihler, boyut, dil dağılımı çubuğu ve `git clone` komutu (kopyala butonuyla).
- **Paylaşılabilir adresler:** `repo.html?repo=depo&path=src/index.js&ref=main` biçiminde.

### Genel

- **Yükleme ekranı:** Üstte ince bir ilerleme çubuğu; içerik hazır olunca sayfa tek seferde, sırayla yükselen bölümlerle açılır.
- **Minimal animasyonlar:** Açılış, kart ve geçiş animasyonları; sistem "hareketi azalt" ayarına saygı duyar.
- **Favicon:** SVG, ICO ve Apple dokunma simgesi.
- **Hızlı:** Yanıtlar 10 dakika tarayıcıda önbelleğe alınır, istekler paralel yapılır.
- **Uyumlu:** Mobil düzen, sistem temasını (açık/koyu) izleme, klavye odağı.

## Kurulum

1. Bu depoyu fork'la veya klonla.
2. Tüm dosyaları (`index.html`, `repo.html`, `css/`, `js/`, favicon dosyaları) depo kökünde tut.
3. GitHub'da **Settings → Pages** bölümünden dalı (`main`) ve kök klasörü seç.
4. Sayfa `https://kullanici.github.io/depo-adi/` adresinde yayına girer.

### Yerelde çalıştırma

Tarayıcılar ES modüllerini `file://` ile yüklemez, bu yüzden küçük bir yerel sunucu kullan:

```bash
python3 -m http.server 8000
# ardından http://localhost:8000 adresini aç
```

## Ayarlar

Tüm ayarlar `js/config.js` içinde:

```js
export const USER = "egemngyk";            // Gösterilecek GitHub kullanıcı adı
export const TIMEZONE = "Europe/Istanbul"; // Yerel saat için IANA saat dilimi ("" = gizle)
export const PAGE = 10;                    // Bir seferde gösterilecek depo sayısı
export const CACHE_TTL = 10 * 60 * 1000;   // Önbellek süresi (ms)
```

> GitHub API, profildeki saat dilimini herkese açık olarak sunmaz. Bu yüzden yerel saat `TIMEZONE` sabitinden hesaplanır.

Sayfaların alt kısmındaki `egemngyk` imzası HTML içinde bilerek sabittir; `USER` değişse bile değişmez.

## Nasıl çalışır?

| Veri | API uç noktası |
| --- | --- |
| Profil | `GET /users/{user}` |
| Sosyal hesaplar | `GET /users/{user}/social_accounts` |
| Kurumlar | `GET /users/{user}/orgs` |
| Depolar | `GET /users/{user}/repos` |
| Profil README | `GET /repos/{user}/{user}/readme` |
| Depo bilgisi, diller, dallar | `GET /repos/{user}/{repo}`, `/languages`, `/branches` |
| Dosyalar ve içerik | `GET /repos/{user}/{repo}/contents/{path}` |
| Son commit | `GET /repos/{user}/{repo}/commits` |

## Sınırlar

- Kimlik doğrulamasız GitHub API, IP başına saatte **60 istek** ile sınırlıdır. Önbellek bunu büyük ölçüde azaltır; sınır dolarsa sayfa ne zaman tekrar deneyeceğini söyler.
- Dosya içeriği API'den en fazla 1 MB'a kadar gelir; daha büyük dosyalar için GitHub'a bağlantı verilir.
- Kod görünümünde sözdizimi renklendirme yoktur (minimal tasarım gereği) ve en fazla 4000 satır gösterilir.
- Yalnızca herkese açık veriler gösterilir. Depo sayfası yalnızca `USER`'a ait depoları açar.

## Yapı

```text
.
├── index.html          # Profil sayfası iskeleti
├── repo.html           # Depo sayfası iskeleti
├── favicon.svg / favicon.ico / apple-touch-icon.png
├── css/
│   ├── base.css        # Değişkenler, sıfırlama, temel öğeler
│   ├── layout.css      # Üst bar, gezinme, ana yerleşim, alt bilgi
│   ├── profile.css     # Profil kartı, detay listesi, kurumlar
│   ├── readme.css      # README kartı ve Markdown içeriği
│   ├── repos.css       # Araç çubuğu, grid/liste, depo kartları
│   ├── repo-page.css   # Depo sayfası: dosya listesi, görüntüleyici, yan sütun
│   ├── motion.css      # Yükleme çubuğu, animasyonlar, geçişler
│   └── responsive.css  # Mobil düzen
├── js/
│   ├── main.js         # Profil sayfası giriş noktası
│   ├── repo-page.js    # Depo sayfası giriş noktası ve gezinme
│   ├── repo-context.js # Depo sayfası durumu (repo, dal, yol)
│   ├── repo-files.js   # Dosya listesi, dosya görüntüleyici, README
│   ├── repo-side.js    # Depo başlığı ve yan sütun
│   ├── config.js       # Ayarlar
│   ├── state.js        # Paylaşılan durum
│   ├── api.js          # GitHub API istekleri ve önbellek
│   ├── utils.js        # Yardımcı fonksiyonlar
│   ├── icons.js        # SVG ikonlar
│   ├── loader.js       # Yükleme çubuğu
│   ├── profile.js      # Profil, sosyal hesaplar, saat, kurumlar
│   ├── readme.js       # Markdown ve README
│   ├── repos.js        # Depo listesi, arama, filtre, sıralama, grid/liste
│   └── nav.js          # Menüde aktif bölüm takibi
└── README.md
```

## Yapan

[egemngyk](https://github.com/egemngyk)
