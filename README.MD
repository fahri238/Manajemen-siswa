# Aplikasi Manajemen Siswa - Praktikum

Aplikasi ini dirancang untuk memudahkan pengelolaan data siswa, jadwal pelajaran, pengumuman, serta pemantauan poin kedisiplinan (prestasi & pelanggaran) secara digital.

## 📋 Fitur Utama

- **Dashboard Admin**: Pengelolaan penuh data Guru, Siswa (termasuk pembuatan akun), Kelas, dan Jadwal.
- **Dashboard Siswa**: Statistik poin, jadwal pelajaran hari ini, dan pengumuman terbaru.
- **Jadwal Pelajaran**: Tampilan jadwal mingguan dinamis berdasarkan kelas masing-masing.
- **Poin & Prestasi**: Riwayat mutasi poin kedisiplinan yang transparan bagi siswa dan guru.
- **Multi-Role**: Dukungan akses terintegrasi untuk Admin, Guru, dan Siswa.

## 🚀 Cara Menjalankan Aplikasi

### 1. Persiapan Database (MySQL)

1. Pastikan **XAMPP** (Apache & MySQL) sudah aktif.
2. Buka **phpMyAdmin** di browser, lalu buat database baru bernama `siswa_manager`.
3. Pilih database tersebut, klik tab **Import**, pilih file `db_siswa_manager.sql` dari folder proyek, lalu klik **Go/Import**.
4. Jika diperlukan, sesuaikan konfigurasi database pada file `api/config/db.js`.

### 2. Menjalankan Backend (Node.js)

1. Buka terminal/CMD, arahkan ke folder `api` di dalam proyek.
2. Jalankan perintah `npm install` untuk mengunduh library yang dibutuhkan.
3. Jalankan server dengan perintah: `node server.js` atau `nodemon server.js`.
4. Pastikan muncul pesan: `Server backend running at http://localhost:5000`.

### 3. Menjalankan Frontend

1. Buka folder proyek menggunakan **VS Code**.
2. Cari file `index.html` (halaman Login).
3. Klik kanan pada file `index.html` dan pilih **Open with Live Server**.
4. **Catatan:** Harus menggunakan Live Server agar fitur JavaScript Module (`type="module"`) berjalan normal.

---

## 🔑 Sistem Akses Login

Pada sistem ini, akun untuk **Guru** dan **Siswa** dibuat sepenuhnya oleh **Admin** melalui panel manajemen. Berikut adalah ketentuan kredensialnya:

### 1. Role Admin (SuperUser)
Akun utama untuk mengelola seluruh data sistem.
- **Username:** `admin`
- **Password:** `123`

### 2. Role Guru
Dibuat oleh Admin di menu "Data Guru".
- **Username:** Menggunakan **NIP** atau **Username Kustom** yang didaftarkan Admin.
- **Password:** Ditentukan oleh Admin saat pembuatan akun.

### 3. Role Siswa
Dibuat oleh Admin di menu "Data Siswa". Akun ini otomatis sinkron dengan tabel users.
- **Username:** Menggunakan **NIS (Nomor Induk Siswa)**.
- **Password:** Ditentukan oleh Admin (Default bisa diset sama dengan NIS jika tidak diubah).

---

_Dibuat sebagai bagian dari Tugas Praktikum - Sistem Informasi Siswa._