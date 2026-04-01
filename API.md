# API Kullanım Notları

Bu doküman, API sözleşmesinin tam dökümü değil; uygulamayı hızlı denemek için pratik örnek akışlar içerir.

Tam endpoint sözleşmesi ileride Swagger / OpenAPI üzerinden yayınlanacaktır.

## Base URL

```text
http://localhost:3000
```

## Health Check

```bash
curl http://localhost:3000/health
```

Beklenen cevap:

```json
{
  "status": "ok",
  "service": "booking-api"
}
```

## Auth Akışı

### Kayıt

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

### Giriş

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

Örnek cevap:

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "expiresIn": "1h"
}
```

Sonraki isteklerde token şu şekilde kullanılmalıdır:

```text
Authorization: Bearer <accessToken>
```

## Event Akışı

### Etkinlik Listeleme

```bash
curl http://localhost:3000/events
```

### Etkinlik Detayı

```bash
curl http://localhost:3000/events/<eventId>
```

### Admin Olarak Etkinlik Oluşturma

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{
    "title": "Konser Gecesi",
    "description": "Açık hava performansı",
    "location": "Istanbul",
    "startsAt": "2026-04-10T18:00:00.000Z",
    "endsAt": "2026-04-10T21:00:00.000Z",
    "totalCapacity": 250
  }'
```

### Admin Olarak Etkinlik Güncelleme

```bash
curl -X PATCH http://localhost:3000/events/<eventId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <adminToken>" \
  -d '{
    "location": "Ankara",
    "totalCapacity": 300
  }'
```

### Admin Olarak Etkinliği Pasife Alma

```bash
curl -X DELETE http://localhost:3000/events/<eventId> \
  -H "Authorization: Bearer <adminToken>"
```

Bu istek fiziksel silme yapmaz; içeride soft delete çalışır.

## Booking Akışı

### Rezervasyon Oluşturma

```bash
curl -X POST http://localhost:3000/events/<eventId>/bookings \
  -H "Authorization: Bearer <customerToken>"
```

Örnek cevap:

```json
{
  "data": {
    "id": "booking-id",
    "userId": "user-id",
    "eventId": "event-id",
    "status": "PENDING",
    "reservedAt": "2026-04-02T10:00:00.000Z",
    "expiresAt": "2026-04-02T10:30:00.000Z",
    "confirmedAt": null,
    "cancelledAt": null,
    "createdAt": "2026-04-02T10:00:00.000Z",
    "updatedAt": "2026-04-02T10:00:00.000Z"
  }
}
```

### Kendi Rezervasyonlarını Listeleme

```bash
curl http://localhost:3000/me/bookings \
  -H "Authorization: Bearer <customerToken>"
```

### Rezervasyon İptali

```bash
curl -X PATCH http://localhost:3000/bookings/<bookingId>/cancel \
  -H "Authorization: Bearer <customerToken>"
```

## Mock Payment Akışı

Worker aynı payment adapter'ını kullanır. İstenirse aynı sonucu dışarıdan da görebilirsin:

```bash
curl http://localhost:3000/mock-payments/<bookingId>
```

Örnek cevap:

```json
{
  "data": {
    "bookingId": "booking-id",
    "provider": "MOCK",
    "status": "SUCCESS",
    "providerReference": "mock-booking-id",
    "checkedAt": "2026-04-02T10:05:00.000Z"
  }
}
```

## Hata Davranışları

Genel hata formatı:

```json
{
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "İnsan okunabilir açıklama"
  }
}
```

Sık görülen hata kodları:

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `INVALID_TOKEN`
- `FORBIDDEN`
- `EVENT_NOT_FOUND`
- `EVENT_NOT_AVAILABLE`
- `BOOKING_NOT_FOUND`
- `BOOKING_NOT_CANCELABLE`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`

## Worker Çalıştırma

Rezervasyonların onaylanması veya süre aşımına düşmesi için worker process'in de çalışması gerekir:

```bash
npm run dev:worker
```

Build sonrası:

```bash
npm run start:worker
```
