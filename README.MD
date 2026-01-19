# Aplikasi Manajemen Siswa - Laporan PKL

Aplikasi ini dirancang untuk memudahkan pengelolaan data siswa, jadwal pelajaran, pengumuman, serta pemantauan poin kedisiplinan (prestasi & pelanggaran) secara digital.

## 📋 Fitur Utama

- **Dashboard Siswa**: Statistik poin, kehadiran, dan pengumuman terbaru.
- **Jadwal Pelajaran**: Tampilan jadwal mingguan dinamis berdasarkan kelas masing-masing.
- **Poin & Prestasi**: Riwayat mutasi poin kedisiplinan yang transparan bagi siswa.
- **Multi-Role**: Dukungan akses untuk Admin, Guru, dan Siswa.

## 🚀 Cara Menjalankan Aplikasi

### 1. Persiapan Database (MySQL)

1. Pastikan **XAMPP** (Apache & MySQL) sudah aktif.
2. Buka **phpMyAdmin** di browser, lalu buat database baru bernama `siswa_manager`.
3. Pilih database tersebut, klik tab **Import**, pilih file `db_siswa_manager.sql` dari folder proyek, lalu klik **Go/Import**.
4. Jika diperlukan, sesuaikan konfigurasi database pada file `api/config/db.js` (sesuaikan `host`, `user`, dan `password`).

### 2. Menjalankan Backend (Node.js)

1. Buka terminal/CMD, arahkan ke folder `api` di dalam proyek.
2. Jalankan perintah `npm install` untuk mengunduh library yang dibutuhkan.
3. Jalankan server dengan perintah: node server.js

4. Pastikan muncul pesan: `Server backend running at http://localhost:5000`.

### 3. Menjalankan Frontend

1. Buka folder proyek menggunakan **VS Code**.
2. Cari file `index.html` di folder utama atau folder frontend.
3. Klik kanan pada file `index.html` dan pilih **Open with Live Server**.
4. **Catatan:** Harus menggunakan Live Server agar fitur JavaScript Module (`type="module"`) berjalan dengan normal.

---

## 🔑 Akun Uji Coba (Demo)

Gunakan akun di bawah ini untuk menguji berbagai akses role:

### 1. Role Admin

- **Username:** `admin`
- **Password:** `123`

### 2. Role Guru

- **Guru 1:** Username `guru01` | Password `123`
- **Guru 2:** Username `guru02` | Password `123`

### 3. Role Siswa

- **Zahida:** Username `zahida` | Password `password123`
- **Abdullah:** Username `abdullah` | Password `password123`

---

_Dibuat sebagai bagian dari Tugas Praktikum - Sistem Informasi Siswa._
