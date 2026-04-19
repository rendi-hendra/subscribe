# Activity Diagram: Alur Berlangganan

Diagram ini menunjukkan alur aktivitas dari saat pengguna memilih paket hingga menjadi member aktif melalui integrasi Midtrans.

```mermaid
activityDiagram
    start
    :User Login & Pilih Paket (Plan);
    :Buat Subscription (Status: Pending);
    :Inisialisasi Pembayaran (Snap Token);
    
    partition "Proses Pembayaran (Midtrans Snap)" {
        :User Pilih Metode Pembayaran;
        :User Selesaikan Transaksi;
    }

    if (Pembayaran Berhasil?) then (Ya)
        :Midtrans Kirim Notifikasi (Webhook);
        :Update Payment Status (Settlement);
        :Update Subscription Status (Active);
        :Buat atau Update Data Member;
        :User Mendapatkan Akses Premium;
    else (Tidak/Gagal)
        :Midtrans Kirim Notifikasi (Failure/Expired);
        :Update Payment Status (Failed);
        :Update Subscription Status (Cancelled);
        :Akses Dibatalkan/Tetap Non-Aktif;
    endif
    
    stop
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
activityDiagram
    start
    :User Klik Logout;
    :Kirim Refresh Token ke /auth/logout;
    :Sistem Mencari Data Season/Sesi;
    if (Sesi Ditemukan?) then (Ya)
        :Update deletedAt pada Tabel SEASONS;
        :Sesi Dianggap Tidak Valid;
    else (Tidak)
        :Kembalikan Pesan Sukses (Stateless);
    endif
    :Hapus Token di Sisi Client;
    stop
```
