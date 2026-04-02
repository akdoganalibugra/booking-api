# Canli Test Notlari

Bu dokuman, uygulamanin AWS EC2 uzerindeki canli ortami icin yapilan temel dogrulama adimlarini ozetler.

## Canli Ortam

- Swagger: `http://3.238.86.172:3000/docs`
- Health: `http://3.238.86.172:3000/health`

## Canli QA Kapsami

Dogrunan akislari:

- `GET /health` endpoint'i `200 OK` dondu
- Swagger arayuzu acildi
- customer kayit akisi calisti
- customer login akisi calisti
- customer rolunun admin event create uzerinde dogru sekilde `403 FORBIDDEN` aldigi dogrulandi
- admin bootstrap sonrasi admin login calisti
- admin event create akisi calisti
- admin event update akisi calisti
- customer booking create akisi calisti
- mock payment endpoint'i booking icin sonuc dondu
- customer booking cancel akisi calisti
- admin event soft delete akisi calisti
- silinen event'in public event listesinde gorunmedigi dogrulandi
- iptal edilen booking'in kullanicinin kendi booking listesinde `CANCELLED` durumda kaldigi dogrulandi

## Canli Ortam Notlari

- Canli ortamda admin kullanicisi varsayilan olarak bulunmaz.
- Bu nedenle canli ortamda admin endpoint'lerini test etmek icin once admin bootstrap calistirildi.

EC2 icinde kullanilan komut:

```bash
docker-compose exec api node dist/scripts/seed-admin.js --email=admin@example.com --password=password123
```

## Gozlem

- Booking create endpoint'i bos body ile gonderildiginde `VALIDATION_ERROR` dondu.
- Ayni endpoint `Content-Type: application/json` ve bos JSON body (`{}`) ile beklendigi gibi calisti.
- Bu durum kritik bir islev hatasi degil, ancak API ergonomisi acisindan iyilestirilebilir.
