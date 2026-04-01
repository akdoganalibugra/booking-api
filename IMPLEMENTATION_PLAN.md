# Booking API Uygulama Planı

## Amaç

Bu proje, etkinlik bileti rezervasyonu için geliştirilen bir backend uygulamasıdır. Sistem; kullanıcı kayıt/giriş işlemlerini, rol bazlı yetkilendirmeyi, etkinlik yönetimini, rezervasyon oluşturma ve iptal etme akışlarını ve ödeme alınmayan rezervasyonların belirli süre sonunda otomatik olarak düşürülmesini destekleyecektir.

Proje, temiz ve modüler bir monolith yapı ile geliştirilecektir. Öncelik; iş kurallarını doğru modellemek, okunabilir bir kod tabanı oluşturmak ve çözümü kolay takip edilebilir şekilde dokümante etmektir.

## Hedefler

- Brief'teki tüm zorunlu gereksinimleri karşılamak
- Temiz, modüler ve test edilebilir bir backend mimarisi kurmak
- Rezervasyon kapasitesi ve zaman aşımı gibi kritik iş kurallarını güvenli şekilde uygulamak
- Türkçe ve sade dokümantasyon hazırlamak
- Mermaid diyagramlar ile büyük resmi hızlıca anlaşılır hale getirmek
- Süre yeterliyse auth ve deployment tarafında kontrollü ek değer üretmek

## Teknik Yığın

- Runtime: `Node.js`
- Dil: `TypeScript`
- Framework: `Express`
- Veritabanı: `MySQL`
- ORM: `Prisma`
- Kimlik Doğrulama: `JWT`
- API Dokümantasyonu: `Swagger / OpenAPI`
- Konteynerizasyon: `Docker` ve `docker compose`
- Deploy hedefi: `AWS EC2`

## Ana Tasarım Kararları

### Mimari yaklaşım

- Uygulama mikroservis değil, modüler monolith olarak geliştirilecektir.
- Kod tabanı domain odaklı modüllere ayrılacaktır.
- HTTP katmanı, servis katmanı ve veri erişim katmanı net biçimde ayrılacaktır.

### Framework tercihi

- `Express`, gereksinimlerle daha doğal uyumlu ve daha düşük framework karmaşıklığı sunduğu için tercih edilmiştir.
- Hedef, framework gösterisi değil; iş kurallarını temiz ve güvenilir şekilde uygulamaktır.

### Veritabanı yaklaşımı

- `MySQL` ana veritabanı olarak kullanılacaktır.
- `Prisma` ile şema yönetimi, migration ve veri erişimi yapılacaktır.
- Üretim benzeri dağıtımda bile ilk hedef düşük operasyonel karmaşıklık olduğundan, uygulama ve veritabanı tek sunucuda çalışabilecek şekilde tasarlanacaktır.

### Auth yaklaşımı

- İlk fazda `access token` tabanlı JWT akışı kurulacaktır.
- `refresh token` desteği çekirdek iş akışları tamamlandıktan sonra ek faz olarak ele alınacaktır.

### Rezervasyon yaklaşımı

- İlk sürümde `1 booking = 1 bilet / 1 koltuk` varsayımı kullanılacaktır.
- Bu tercih, kapasite yönetimini sadeleştirir ve iş kuralı güvenliğini artırır.

### Silme yaklaşımı

- Etkinliklerde hard delete yerine soft delete uygulanacaktır.
- Böylece geçmiş booking kayıtları ve veri tutarlılığı korunacaktır.

## Fonksiyonel Kapsam

### Zorunlu özellikler

- Kullanıcı kayıt olabilmeli
- Kullanıcı giriş yapabilmeli
- `CUSTOMER` ve `ADMIN` rollerine göre yetki ayrımı olmalı
- `ADMIN` etkinlik oluşturabilmeli
- `ADMIN` etkinlik güncelleyebilmeli
- `ADMIN` etkinliği pasife alabilmeli
- Tüm etkinlikler listelenebilmeli
- `CUSTOMER` etkinlik için rezervasyon oluşturabilmeli
- `CUSTOMER` rezervasyonunu iptal edebilmeli
- `CUSTOMER` kendi rezervasyonlarını listeleyebilmeli
- Ödeme alınmayan rezervasyonlar 30 dakika sonunda otomatik düşmeli

### Kontrollü ek özellikler

- Mock payment entegrasyonu
- Swagger/OpenAPI dokümantasyonu
- Health check endpoint'i
- Docker ile lokal kurulum
- EC2 deploy
- Refresh token akışı

## Domain Modeli

### Users

- `id`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

### Events

- `id`
- `title`
- `description`
- `location`
- `startsAt`
- `endsAt`
- `totalCapacity`
- `availableCapacity`
- `status`
- `deletedAt`
- `createdAt`
- `updatedAt`

### Bookings

- `id`
- `userId`
- `eventId`
- `status`
- `reservedAt`
- `expiresAt`
- `confirmedAt`
- `cancelledAt`
- `createdAt`
- `updatedAt`

### PaymentAttempts

- `id`
- `bookingId`
- `provider`
- `providerReference`
- `status`
- `payload`
- `checkedAt`
- `createdAt`
- `updatedAt`

### RefreshTokens

Bu tablo sadece bonus fazında eklenecektir.

- `id`
- `userId`
- `tokenHash`
- `expiresAt`
- `revokedAt`
- `createdAt`

## Rezervasyon Yaşam Döngüsü

Rezervasyon statüleri:

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `EXPIRED`

Temel akış:

1. Kullanıcı rezervasyon oluşturur.
2. Sistem etkinlik kapasitesini kontrol eder.
3. Uygun kapasite varsa booking `PENDING` olarak açılır.
4. `expiresAt = reservedAt + 30 dakika` olarak atanır.
5. Arka plan worker'ı bekleyen rezervasyonları periyodik olarak kontrol eder.
6. Worker, mock payment servisinden deterministik ödeme durumunu alır.
7. Ödeme başarılıysa booking `CONFIRMED` olur.
8. Süre dolmuş ve ödeme alınmamışsa booking `EXPIRED` olur, kapasite geri eklenir.
9. Kullanıcı isterse süre dolmadan önce rezervasyonu iptal edebilir.

## Mock Payment Stratejisi

Mock payment servisi, manuel müdahaleye ihtiyaç duymadan önceden tanımlı kurallarla cevap verecektir.

Önerilen yaklaşım:

- Payment sonucunu üreten ortak bir payment service / adapter bulunur.
- Bu adapter, gelen booking için deterministik bir sonuç döndürür.
- Aynı booking için her zaman aynı ödeme sonucu üretilir.
- Gerekirse aynı davranış dışarı açılan bir mock payment endpoint'i ile de sunulabilir.
- Böylece akış hem tekrar edilebilir hem de harici servis entegrasyonu hissi korunur.

Örnek akış:

- Payment adapter sonucu, `bookingId` veya türetilmiş sabit bir kurala göre hesaplar
- Worker ödeme kontrolü için adapter'ı doğrudan kullanır
- Gerekirse `GET /mock-payments/:bookingId` endpoint'i aynı logic'i dışarı açar

Bu yaklaşımın amacı:

- Test edilebilirlik sağlamak
- İş akışını dış sistem benzeri bir sınırla modellemek
- Manuel tetiklemeye bağımlı kalmamak

## Yarış Durumu ve Tutarlılık Önlemleri

Bu projedeki en kritik risklerden biri aynı etkinliğe eşzamanlı rezervasyon istekleridir.

Bu nedenle:

- Booking oluşturma işlemi transaction içinde yürütülecektir
- İlgili event satırı kilitlenerek etkinlik kapasitesi güvenli biçimde azaltılacaktır
- Aynı anda kapasitenin aşılmaması garanti altına alınacaktır
- İptal ve expire akışlarında kapasite geri kazanımı idempotent hale getirilecektir
- Soft delete edilmiş etkinlikler için yeni booking oluşturulamayacaktır

## API Taslağı

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Events

- `GET /events`
- `GET /events/:id`
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`

### Bookings

- `POST /events/:id/bookings`
- `GET /me/bookings`
- `PATCH /bookings/:id/cancel`

### Operations

- `GET /health`

### Bonus API

- `POST /auth/refresh`
- `POST /auth/logout`

Not:

- `refresh` ve `logout` endpoint'leri bonus kapsamdır.
- `DELETE /events/:id` dışarıya silme endpoint'i olarak sunulacak, içeride soft delete davranışı işleyecektir.

## Önerilen Klasör Yapısı

```text
src/
  app.ts
  server.ts
  config/
  common/
    errors/
    middleware/
    utils/
    types/
  modules/
    auth/
    events/
    bookings/
    payments/
  jobs/
  docs/
prisma/
  schema.prisma
  migrations/
  seed.ts
docker/
```

## Faz Planı

### Faz 0: Kurulum ve iskelet

- Proje iskeletini oluştur
- TypeScript ve Express kurulumunu tamamla
- Prisma ve MySQL bağlantısını kur
- Temel klasör yapısını oluştur
- Ortak error handling ve config yapısını ekle

### Faz 1: Auth ve yetkilendirme

- Register ve login endpoint'lerini geliştir
- Password hash akışını kur
- JWT access token üretimini ekle
- Auth middleware ve role guard yapısını yaz

### Faz 2: Event yönetimi

- Event veri modelini tamamla
- Admin event CRUD akışını geliştir
- Soft delete davranışını uygula
- Event listeleme ve detay endpoint'lerini tamamla

### Faz 3: Booking akışı

- Booking veri modelini tamamla
- Rezervasyon oluşturma akışını geliştir
- Kapasite kontrolünü transaction ile güvenli hale getir
- Rezervasyon iptal ve listeleme akışlarını ekle

### Faz 4: Payment ve expiry

- Mock payment endpoint'ini ekle
- Ayrı entrypoint olarak çalışan expiry worker'ını geliştir
- PENDING rezervasyonların ödeme/timeout durumunu yöneten akışı tamamla
- Kapasite geri kazanımı senaryolarını test et

### Faz 5: Kalite ve dokümantasyon

- Swagger/OpenAPI ekle
- Unit ve integration testleri yaz
- SQL dump hazırla
- README ve mimari dokümanları tamamla
- Mermaid diyagramları ekle

### Faz 6: Bonuslar

- Refresh token desteği
- Docker setup
- EC2 deploy
- Basit operasyonel notlar ve deploy rehberi

## Dokümantasyon Planı

Hazırlanacak belgeler:

- `README.md`
- `ARCHITECTURE.md`
- `API.md`
- `IMPLEMENTATION_PLAN.md`

Doküman ilkeleri:

- Türkçe yazım
- Kısa ve net başlıklar
- Gereksiz süs ve yoğun emoji kullanımından kaçınma
- Review eden kişinin önce büyük resmi, sonra detayları görebilmesi
- Endpoint sözleşmelerinin tek kaynağı Swagger/OpenAPI olacaktır
- `API.md`, endpoint listesini tekrar etmeyecek; örnek kullanım akışlarını ve kritik notları özetleyecektir

Mermaid diyagramları:

- Sistem bileşen diyagramı
- Booking yaşam döngüsü
- Auth akışı
- Tek sunuculu deploy şeması

## Dağıtım Yaklaşımı

İlk hedef düşük maliyetli ve sade bir dağıtım modelidir.

Önerilen yaklaşım:

- Uygulama ve MySQL aynı EC2 üzerinde çalışır
- Servisler `docker compose` ile ayağa kaldırılır
- Veri kalıcılığı volume ile korunur
- Daha ileri ortamlar için ayrı veritabanı, yedekleme, gözlemlenebilirlik ve ağ ayrımı değerlendirilebilir

## Mimari Netleştirmeler

Çekirdek implementasyon kapsamı:

- auth + RBAC
- event CRUD
- booking transaction güvenliği
- mock payment + expiry worker
- Swagger, testler ve temel dokümantasyon

Bonus kapsam:

- refresh token
- Docker
- EC2 deploy

Expiry worker yaklaşımı:

- Worker, API'den ayrı bir entrypoint olarak çalışacaktır
- Aynı kod tabanını paylaşacak, fakat bağımsız process olarak ayağa kalkacaktır
- Böylece zamanlanmış işler ile HTTP request yükü birbirinden ayrılacaktır

Kapasite güvenliği:

- Booking oluşturma tek transaction içinde yürütülecektir
- İlgili event satırı kilitlenerek `availableCapacity` doğrulanacak ve azaltılacaktır
- Bu yaklaşım oversell riskini önleyecektir

Payment entegrasyon sınırı:

- Payment sonucu üreten ortak bir payment service / adapter olacaktır
- Worker bu adapter'ı doğrudan kullanacaktır
- Gerekirse aynı davranışı dışarı açan bir mock endpoint bulunacaktır
- Worker'ın uygulamanın kendi endpoint'ine HTTP isteği atması tercih edilmeyecektir

## Test Stratejisi

Öncelikli test alanları:

- Auth akışları
- Role-based authorization
- Event CRUD kuralları
- Booking oluşturma
- Aynı anda çoklu booking isteğinde kapasite güvenliği
- Cancel ve expire akışlarında kapasite iadesi
- Soft delete edilmiş event için booking engeli

Test katmanları:

- Unit testler
  - auth servis doğrulamaları
  - password hash ve token üretim mantığı
  - payment adapter'ın deterministik sonuç üretimi
  - booking durum geçiş kuralları
- Route / integration testler
  - auth endpoint akışları
  - event CRUD yetki ve validation kuralları
  - booking oluşturma, iptal ve listeleme davranışları
  - soft delete sonrası görünürlük kuralları
- Worker / concurrency testleri
  - expiry worker'ın timeout ve confirm davranışı
  - aynı booking'in tekrar işlenmesinde idempotency
  - son kapasite için eşzamanlı booking isteğinde yalnız bir başarının garanti edilmesi

ASCII test diyagramı gerektiren alanlar:

- booking oluşturma transaction akışı
- booking durum geçişleri
- expiry worker işlem sırası

## Performans Notları

- Expiry worker tüm booking kayıtlarını taramayacaktır
- Worker yalnızca ilgili kayıtları sorgulayacaktır:
  - `status = PENDING`
  - ödeme kontrolü veya timeout değerlendirmesi gereken kayıtlar
- Bu sorgular uygun indekslerle desteklenecektir

Okuma tarafı için:

- Liste endpoint'leri yalnız gerekli alanları döndürecektir
- Detay endpoint'leri ayrı response şekli kullanacaktır
- Prisma sorgularında `select` / `include` kullanımı bilinçli ve sınırlı tutulacaktır

Önerilen indeks alanları:

- `events.deletedAt`
- `events.status`
- `bookings.status`
- `bookings.expiresAt`
- `bookings.eventId`
- `bookings.userId`

## What Already Exists

Şu anda tekrar kullanılacak uygulama kodu bulunmuyor. Bu nedenle mevcut plan:

- sıfırdan proje iskeleti kurmayı
- domain ve veri modeli kararlarını baştan vermeyi
- test ve dokümantasyon disiplinini ilk günden dahil etmeyi

hedeflemektedir.

Bu projede yeniden kullanım, koddan çok karar seviyesinde olacaktır:

- design doc içindeki problem çerçevesi korunacak
- `IMPLEMENTATION_PLAN.md` implementasyonun ana referans planı olacak
- API sözleşmesinin tek kaynağı Swagger olacaktır

## Geliştirilebilir Özellikler

- Çoklu bilet satın alma desteği
- Gerçek ödeme sağlayıcısı entegrasyonu
- Webhook tabanlı ödeme onayı
- Reservation hold ve seat map desteği
- Rate limiting
- Audit log
- E-posta bildirimleri
- Admin dashboard metrikleri
- Ayrı worker süreci
- Managed veritabanı ve gözlemlenebilirlik katmanı

## NOT in scope

- Refresh token
  - Çekirdek auth akışını tamamlamadan ek karmaşıklık getirmemek için bonus faza bırakıldı
- Docker
  - Lokal geliştirme ve çekirdek backend tamamlandıktan sonra ele alınacak
- EC2 deploy
  - Operasyonel bonus olarak değerlidir, fakat iş kuralı doğruluğunun önüne geçmeyecek
- Managed veritabanı
  - Düşük maliyet ve sade dağıtım hedefi nedeniyle ilk aşamada düşünülmeyecek
- Cache katmanı
  - Mevcut kapsam için erken optimizasyon olur
- Çoklu bilet / koltuk desteği
  - İlk sürümde `1 booking = 1 bilet` kapsamı korunacak

## Başarı Ölçütleri

- Rezervasyon sırasında kapasite aşımı yaşanmamalı
- Süresi dolan bekleyen rezervasyonlar otomatik düşmeli
- `ADMIN` ve `CUSTOMER` yetkileri net ayrılmalı
- Proje lokal ortamda kolayca ayağa kalkmalı
- Kod tabanı okunabilir ve modüler olmalı
- Dokümantasyon, sistemi birkaç dakikada anlaşılır hale getirmeli
