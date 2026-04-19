# Entity Relationship Diagram (ERD)

Berikut adalah diagram hubungan antar entitas (ERD) untuk proyek **Subscribe**. Diagram ini mencerminkan struktur database terbaru termasuk dukungan **Soft Delete** (`deletedAt`) dan relasi **Foreign Key**.

```mermaid
erDiagram
    USERS ||--o{ SUBSCRIPTIONS : "has"
    USERS ||--o{ PAYMENTS : "makes"
    USERS ||--o{ MEMBERS : "is a"
    USERS ||--o{ SEASONS : "has login"
    
    PLANS ||--o{ SUBSCRIPTIONS : "offered in"
    
    SUBSCRIPTIONS ||--o{ PAYMENTS : "generated"
    SUBSCRIPTIONS ||--o{ MEMBERS : "grants"

    USERS {
        int id PK
        string name
        string email UK
        string password
        string phone
        string role
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    PLANS {
        int id PK
        string name
        decimal price
        int durationDays
        string description
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    SUBSCRIPTIONS {
        int id PK
        int userId FK
        int planId FK
        enum status
        datetime startedAt
        datetime expiredAt
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    PAYMENTS {
        int id PK
        int subscriptionId FK
        int userId FK
        string midtransOrderId
        string midtransTransactionId
        decimal grossAmount
        string paymentType
        string paymentStatus
        string paymentUrl
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    MEMBERS {
        int id PK
        int userId FK
        int subscriptionId FK
        string status
        datetime startedAt
        datetime expiredAt
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    SEASONS {
        int id PK
        int userId FK
        string refreshToken
        datetime expiresAt
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
```

## Penjelasan Relasi:
1.  **User**: Entitas pusat. Satu user bisa memiliki banyak subscription, banyak history payment, dan banyak session login (seasons).
2.  **Plan**: Daftar paket yang tersedia. Hubungan ke `Subscription` bersifat *one-to-many* (satu plan bisa diambil banyak user).
3.  **Subscription**: Menghubungkan User dengan Plan. Statusnya (`pending`, `active`, dll) menentukan akses user.
4.  **Payment**: Setiap transaksi pembayaran dicatat di sini dan terhubung ke `Subscription` terkait.
5.  **Member**: Representasi keanggotaan aktif hasil dari subscription yang sudah dibayar.
6.  **Season**: Digunakan untuk manajemen sistem login (Refresh Token).

## Catatan Teknis:
- Semua tabel sekarang memiliki kolom `deletedAt` untuk mendukung fiture **Soft Delete**.
- Semua relasi menggunakan **Foreign Key** dengan aturan `ON DELETE RESTRICT` untuk menjaga integritas data transaksi.
