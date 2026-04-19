# Activity Diagram: Alur Berlangganan

Diagram ini menunjukkan alur aktivitas dari saat pengguna memilih paket hingga menjadi member aktif melalui integrasi Midtrans.

```mermaid
flowchart TD
    Start([Start]) --> SelectPlan[User Login & Pilih Paket Plan]
    SelectPlan --> CreateSub[Buat Subscription Status: Pending]
    CreateSub --> InitPayment[Inisialisasi Pembayaran Snap Token]
    
    subgraph PaymentProcess [Proses Pembayaran Midtrans Snap]
        SelectMethod[User Pilih Metode Pembayaran]
        CompleteTransaction[User Selesaikan Transaksi]
        SelectMethod --> CompleteTransaction
    end

    InitPayment --> SelectMethod
    CompleteTransaction --> PaymentCheck{Pembayaran Berhasil?}

    PaymentCheck -- Ya --> Webhook[Midtrans Kirim Notifikasi Webhook]
    Webhook --> UpdatePayment[Update Payment Status Settlement]
    UpdatePayment --> UpdateSub[Update Subscription Status Active]
    UpdateSub --> UpdateMember[Buat atau Update Data Member]
    UpdateMember --> GrantAccess[User Mendapatkan Akses Premium]
    GrantAccess --> End([Stop])

    PaymentCheck -- Tidak/Gagal --> WebhookFail[Midtrans Kirim Notifikasi Failure/Expired]
    WebhookFail --> UpdatePaymentFail[Update Payment Status Failed]
    UpdatePaymentFail --> UpdateSubFail[Update Subscription Status Cancelled]
    UpdateSubFail --> AccessDenied[Akses Dibatalkan/Tetap Non-Aktif]
    AccessDenied --> End
```

## Detail Tahapan:
1.  **Pilih Paket**: User mengakses endpoint `/plans` untuk melihat daftar paket.
2.  **Buat Subscription**: User mengirim `planId` ke `/subscriptions`. Sistem mencatat niat langganan.
3.  **Bayar**: Sistem mengarahkan user ke antarmuka Snap Midtrans.
4.  **Webhook**: Bagian terpenting di mana server Anda menerima konfirmasi dari Midtrans secara asinkron.
5.  **Akses Member**: Hanya setelah pembayaran `settlement`, data user di tabel `Member` akan diaktifkan.

---

# Activity Diagram: Logout & Session Cleanup

Diagram ini menunjukkan apa yang terjadi ketika user melakukan logout dengan sistem **Soft Delete**.

```mermaid
flowchart TD
    Start([Start]) --> UserLogout[User Klik Logout]
    UserLogout --> RequestLogout[Kirim Refresh Token ke /auth/logout]
    RequestLogout --> FindSession[Sistem Mencari Data Season/Sesi]
    
    FindSession --> SessionFound{Sesi Ditemukan?}
    
    SessionFound -- Ya --> SoftDelete[Update deletedAt pada Tabel SEASONS]
    SoftDelete --> InvalidSession[Sesi Dianggap Tidak Valid]
    InvalidSession --> ClientCleanup[Hapus Token di Sisi Client]
    
    SessionFound -- Tidak --> SuccessResp[Kembalikan Pesan Sukses Stateless]
    SuccessResp --> ClientCleanup
    
    ClientCleanup --> End([Stop])
```
