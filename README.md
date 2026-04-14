# Subscribe Backend

Backend sederhana untuk demonstrasi integrasi:
- `express`
- `typeorm`
- `midtrans-client`

## Installasi

1. Salin `.env.example` menjadi `.env`
2. Isi konfigurasi Midtrans dan database di `.env`
3. Jalankan:

```bash
npm install
npm start
```

## Migrasi Database

- `npm run migration:run`
  - Menjalankan semua migrasi yang belum dieksekusi.
- `npm run migration:create`
  - Membuat file migrasi baru di `src/migrations/`.

## Endpoint

- `GET /health`
  - Mengecek status server.

### User
- `GET /api/users`
  - Mengambil semua user.
- `GET /api/users/:id`
  - Mengambil user berdasarkan ID.
- `POST /api/users`
  - Membuat user baru.
  - Body JSON contoh:
    ```json
    {
      "name": "Budi",
      "email": "budi@example.com",
      "phone": "081234567890"
    }
    ```

### Subscription
- `GET /api/subscriptions`
  - Mengambil daftar subscription.
- `GET /api/subscriptions/:id`
  - Mengambil subscription berdasarkan ID.
- `POST /api/subscriptions`
  - Membuat subscription baru.
  - Body JSON contoh:
    ```json
    {
      "userId": 1,
      "planName": "Basic Plan",
      "price": 50000
    }
    ```
- `PUT /api/subscriptions/:id`
  - Memperbarui data subscription.

### Payment
- `POST /api/payments/create`
  - Membuat transaksi Midtrans dan menyimpan record payment.
  - Body JSON contoh:
    ```json
    {
      "orderId": "order-123",
      "grossAmount": 50000,
      "userId": 1,
      "subscriptionId": 1,
      "customerDetails": {
        "first_name": "Budi",
        "email": "budi@example.com"
      }
    }
    ```
- `POST /api/payments/notification`
  - Endpoint callback / notifikasi Midtrans.
  - Body JSON contoh mengikuti payload Midtrans.

## Dokumentasi Swagger
- `GET /api/docs`
  - Menampilkan Swagger UI untuk dokumentasi API.
  - File JSON terdapat di `doc/swagger.json`.

## Konfigurasi Environment

Contoh variables di `.env`:

```text
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=subscribe
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_IS_PRODUCTION=false
```

> Pastikan database MySQL `subscribe` sudah dibuat sebelum menjalankan migrasi.
