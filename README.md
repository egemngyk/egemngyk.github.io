# egemngyk · GitHub profil sayfası

GitHub profilini, profil README'ni ve depolarını tek bir sade sayfada gösteren, **tek dosyalık** statik bir site. Derleme adımı, bağımlılık kurulumu veya sunucu gerektirmez; veriler tarayıcıdan doğrudan GitHub API'sinden çekilir.

## Özellikler

- **README üstte:** Profil deposundaki (`kullanici/kullanici`) README, gerçek Markdown olarak (tablolar, listeler, kod blokları, görevler, görseller) sayfanın en üstünde gösterilir.
- **Güvenli render:** Markdown, [marked](https://github.com/markedjs/marked) ile çevrilir ve [DOMPurify](https://github.com/cure53/DOMPurify) ile temizlenir. README içindeki göreli görsel ve bağlantılar otomatik olarak GitHub adreslerine çevrilir.
- **Zengin profil bilgisi:** Şirket, konum, yerel saat, web sitesi, e-posta, katılım tarihi, kurumlar ve profilde eklediğin sosyal hesaplar (Instagram, X, LinkedIn, YouTube ve diğerleri).
- **Temiz bağlantılar:** Uzun adresler `site.com/yol` biçiminde, sosyal hesaplar ikon ve `@kullanici` olarak görünür.
- **Depolar:** Arama, dile göre filtre, sıralama (yıldız, güncelleme, en yeni, ada göre), konu etiketleri, dil rengi, fork sayısı, lisans ve göreli tarih. Fork'lar da listelenir.
- **Hızlı:** Yanıtlar 10 dakika tarayıcıda önbelleğe alınır; profil, README ve depolar paralel yüklenir.
- **Uyumlu:** Mobil düzen, sistem temasını (açık/koyu) izleme, klavye odağı ve azaltılmış hareket desteği.

## Kurulum

1. Bu depoyu fork'la veya klonla.
2. `index.html` dosyasını depo kökünde tut.
3. GitHub'da **Settings → Pages** bölümünden dalı (`main`) ve kök klasörü seç.
4. Sayfa `https://kullanici.github.io/depo-adi/` adresinde yayına girer.

Yerelde denemek için dosyayı tarayıcıda açman yeterli.

## Ayarlar

`index.html` içindeki `<script>` bölümünün başında iki sabit var:

```js
const USER = "egemngyk";            // Gösterilecek GitHub kullanıcı adı
const TIMEZONE = "Europe/Istanbul"; // Yerel saat için IANA saat dilimi ("" = gizle)
```

> GitHub API, profildeki saat dilimini herkese açık olarak sunmaz. Bu yüzden yerel saat `TIMEZONE` sabitinden hesaplanır.

Sayfanın alt kısmındaki `egemngyk` imzası bilerek sabittir; `USER` değişse bile değişmez.

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
├── index.html   # Sayfanın tamamı (HTML, CSS ve JS)
└── README.md
```

## Yapan

[egemngyk](https://github.com/egemngyk)