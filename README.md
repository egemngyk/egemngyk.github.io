# egemngyk · GitHub profil sayfası

GitHub profilini, profil README'ni ve depolarını tek bir sade sayfada gösteren, **modüler** statik bir site (saf HTML, CSS ve ES modülleri). Derleme adımı veya bağımlılık kurulumu gerektirmez; veriler tarayıcıdan doğrudan GitHub API'sinden çekilir.

## Özellikler

- **README üstte:** Profil deposundaki (`kullanici/kullanici`) README, gerçek Markdown olarak (tablolar, listeler, kod blokları, görevler, görseller) sayfanın en üstünde gösterilir.
- **Güvenli render:** Markdown, [marked](https://github.com/markedjs/marked) ile çevrilir ve [DOMPurify](https://github.com/cure53/DOMPurify) ile temizlenir. README içindeki göreli görsel ve bağlantılar otomatik olarak GitHub adreslerine çevrilir.
- **Zengin profil bilgisi:** Şirket, konum, yerel saat, web sitesi, e-posta, katılım tarihi, kurumlar ve profilde eklediğin sosyal hesaplar (Instagram, X, LinkedIn, YouTube ve diğerleri).
- **Temiz bağlantılar:** Uzun adresler `site.com/yol` biçiminde, sosyal hesaplar ikon ve `@kullanici` olarak görünür.
- **Depolar:** Arama, dile göre filtre, sıralama (yıldız, güncelleme, en yeni, ada göre), konu etiketleri, dil rengi, fork sayısı, lisans ve göreli tarih. Fork'lar da listelenir.
- **Yükleme ekranı:** Üstte ince bir ilerleme çubuğu çıkar; profil, README ve depolar hazır olunca sayfa parça parça düşmek yerine tek seferde, sırayla yükselen bölümlerle açılır.
- **Liste / Grid:** Depolar iki görünümde izlenebilir; seçimin tarayıcıda hatırlanır.
- **Sayfa içi depo detayı:** Bir depo kartına tıklayınca site içinde pencere açılır: istatistikler, konu etiketleri, `git clone` komutu (kopyala butonuyla) ve deponun README'si. Ctrl/Cmd+tık GitHub'a götürür. Adres `#repo-depo-adi` olur ve paylaşılabilir.
- **Minimal animasyonlar:** Açılış, kart ve geçiş animasyonları; sistem "hareketi azalt" ayarına saygı duyar.
- **Favicon:** SVG, ICO ve Apple dokunma simgesi.
- **Hızlı:** Yanıtlar 10 dakika tarayıcıda önbelleğe alınır; profil, README ve depolar paralel yüklenir.
- **Uyumlu:** Mobil düzen, sistem temasını (açık/koyu) izleme, klavye odağı ve azaltılmış hareket desteği.

## Kurulum

1. Bu depoyu fork'la veya klonla.
2. `index.html`, `css/` ve `js/` klasörlerini depo kökünde tut.
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

Sayfanın alt kısmındaki `egemngyk` imzası `index.html` içinde bilerek sabittir; `USER` değişse bile değişmez.

## Nasıl çalışır?

| Veri | API uç noktası |
| --- | --- |
| Profil | `GET /users/{user}` |
| Sosyal hesaplar | `GET /users/{user}/social_accounts` |
| Kurumlar | `GET /users/{user}/orgs` |
| Depolar | `GET /users/{user}/repos` |
| Profil README | `GET /repos/{user}/{user}/readme` |

## Sınırlar

- Kimlik doğrulamasız GitHub API, IP başına saatte **60 istek** ile sınırlıdır. Önbellek bunu büyük ölçüde azaltır; sınır dolarsa sayfa ne zaman tekrar deneyeceğini söyler.
- Profil README'si yoksa README bölümü ve menü bağlantısı otomatik gizlenir.
- Sosyal hesaplar ve kurumlar yüklenemezse sayfa bunları sessizce atlar.
- Yalnızca herkese açık veriler gösterilir.

## Yapı

```text
.
├── index.html          # Sayfa iskeleti
├── favicon.svg / favicon.ico / apple-touch-icon.png
├── css/
│   ├── base.css        # Değişkenler, sıfırlama, temel öğeler
│   ├── layout.css      # Üst bar, gezinme, ana yerleşim, alt bilgi
│   ├── profile.css     # Profil kartı, detay listesi, kurumlar
│   ├── readme.css      # README kartı ve Markdown içeriği
│   ├── repos.css       # Araç çubuğu, liste/grid ve depo kartları
│   ├── motion.css      # Yükleme çubuğu, animasyonlar, geçişler
│   ├── dialog.css      # Depo detay penceresi
│   └── responsive.css  # Mobil düzen
├── js/
│   ├── main.js         # Giriş noktası
│   ├── config.js       # Ayarlar
│   ├── state.js        # Paylaşılan durum
│   ├── api.js          # GitHub API istekleri ve önbellek
│   ├── utils.js        # Yardımcı fonksiyonlar
│   ├── icons.js        # SVG ikonlar
│   ├── profile.js      # Profil, sosyal hesaplar, saat, kurumlar
│   ├── readme.js       # Markdown README
│   ├── repos.js        # Depo listesi, arama, filtre, sıralama, liste/grid
│   ├── repo-dialog.js  # Sayfa içi depo detayı
│   ├── loader.js       # Yükleme çubuğu
│   └── nav.js          # Menüde aktif bölüm takibi
└── README.md
```

## Yapan

[egemngyk](https://github.com/egemngyk)
