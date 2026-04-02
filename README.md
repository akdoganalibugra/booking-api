# Booking API

Node.js, Express, TypeScript, Prisma ve MySQL ile geliştirilmiş etkinlik bileti rezervasyon backend uygulamasıdır.

## Özellikler

- JWT tabanlı kayıt ve giriş akışı
- `ADMIN` / `CUSTOMER` rol bazlı yetkilendirme
- Admin için etkinlik oluşturma, güncelleme ve soft delete
- Customer için rezervasyon oluşturma, iptal etme ve kendi rezervasyonlarını listeleme
- Transaction ve satır kilidi ile kapasite tutarlılığı
- Deterministik mock payment adapter
- Ayrı worker process ile rezervasyon onaylama ve süre aşımı işleme
- Vitest ve Supertest ile route ve servis testleri

## Kullanılan Teknolojiler

- `Node.js`
- `Express`
- `TypeScript`
- `Prisma`
- `MySQL`
- `JWT`
- `Vitest`
- `Supertest`

## Başlangıç

### Gereksinimler

- `Node.js 22+`
- `npm`
- `MySQL 8+`

### Kurulum

```bash
npm install
cp .env.example .env
```

`.env` dosyasını kendi ortamına göre güncelle:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:root@localhost:3306/booking_api"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="1h"
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

## Uygulamayı Çalıştırma

API:

```bash
npm run dev
```

Expiry worker:

```bash
npm run dev:worker
```

Production build:

```bash
npm run build
npm run start
```

Worker build:

```bash
npm run start:worker
```

## Docker ile Çalıştırma

Önce ortam dosyasını oluştur:

```bash
cp .env.example .env
```

Ardından `.env` içindeki `JWT_SECRET` değerini kendi ortamın için güncelle.

Tüm servisleri birlikte ayağa kaldırmak için:

```bash
docker compose up --build
```

Arka planda çalıştırmak için:

```bash
docker compose up --build -d
```

Servisleri durdurmak için:

```bash
docker compose down
```

Veritabanı volume'unu da silmek için:

```bash
docker compose down -v
```

## Testler

```bash
npm test
```

```bash
npm run build
```

## Swagger

Uygulama çalışırken Swagger arayüzü:

```text
http://localhost:3000/docs
```

Ham OpenAPI JSON çıktısı:

```text
http://localhost:3000/docs.json
```

Docker ile ayağa kaldırdıktan sonra Swagger üstünden tüm akışları buradan test edebilirsin:

```text
http://localhost:3000/docs
```

## Temel Akış

1. Customer giriş yapar ve etkinlikleri listeler.
2. Uygun bir etkinlik için rezervasyon oluşturur.
3. Sistem event satırını kilitleyip kapasiteyi düşürür ve booking'i `PENDING` açar.
4. Worker bekleyen rezervasyonları periyodik olarak tarar.
5. Mock payment sonucu başarılıysa booking `CONFIRMED` olur.
6. Süre dolmuş ve ödeme tamamlanmamışsa booking `EXPIRED` olur, kapasite geri eklenir.

## Dökümanlar

- [IMPLEMENTATION_PLAN.md](/Users/akdoganalibugra/Depo/booking-api/IMPLEMENTATION_PLAN.md)
- [ARCHITECTURE.md](/Users/akdoganalibugra/Depo/booking-api/ARCHITECTURE.md)
- [API.md](/Users/akdoganalibugra/Depo/booking-api/API.md)

## Mevcut Durum

Tamamlanan çekirdek kapsam:

- Auth ve RBAC
- Event CRUD ve soft delete
- Booking oluşturma, iptal etme ve listeleme
- Mock payment adapter
- Expiry worker
- Temel test kapsamı

Planlanan sonraki adımlar:

- Swagger / OpenAPI
- Docker ve tek sunuculu dağıtım dosyaları
- Gerekirse refresh token bonus fazı
