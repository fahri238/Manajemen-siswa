-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 22 Jan 2026 pada 15.00
-- Versi server: 8.0.30
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_siswa_manager`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `absensi`
--

CREATE TABLE `absensi` (
  `id` int NOT NULL,
  `siswa_id` int NOT NULL,
  `mapel_id` int DEFAULT NULL,
  `tanggal` date NOT NULL,
  `sesi` int DEFAULT NULL,
  `status` enum('hadir','sakit','izin','alfa','terlambat','dinas','cuti') DEFAULT 'alfa',
  `keterangan` text,
  `waktu_absen` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `guru_id` int DEFAULT NULL,
  `metode_absen` enum('manual','qr_code','fingerprint','face_recognition') DEFAULT 'manual',
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `bukti_izin` varchar(255) DEFAULT NULL,
  `verified_by` int DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `absensi`
--

INSERT INTO `absensi` (`id`, `siswa_id`, `mapel_id`, `tanggal`, `sesi`, `status`, `keterangan`, `waktu_absen`, `guru_id`, `metode_absen`, `latitude`, `longitude`, `bukti_izin`, `verified_by`, `verified_at`, `created_at`, `updated_at`) VALUES
(1, 14, NULL, '2026-01-18', NULL, 'izin', '', '2026-01-18 05:26:09', NULL, 'manual', NULL, NULL, NULL, NULL, NULL, '2026-01-18 05:26:09', '2026-01-18 05:43:07'),
(2, 14, NULL, '2026-01-19', NULL, 'hadir', '', '2026-01-18 05:36:24', NULL, 'manual', NULL, NULL, NULL, NULL, NULL, '2026-01-18 05:36:24', '2026-01-18 05:36:24'),
(3, 11, NULL, '2026-01-19', NULL, 'hadir', '', '2026-01-19 18:17:32', NULL, 'manual', NULL, NULL, NULL, NULL, NULL, '2026-01-19 18:17:32', '2026-01-19 18:17:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `activity` varchar(255) NOT NULL,
  `module` varchar(50) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `referrer` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `aktivitas_siswa`
--

CREATE TABLE `aktivitas_siswa` (
  `id` int NOT NULL,
  `siswa_id` int NOT NULL,
  `jenis_aktivitas` enum('absensi','prestasi','pelanggaran','perubahan_data','lainnya') NOT NULL,
  `deskripsi` text NOT NULL,
  `tanggal` date NOT NULL,
  `waktu` time NOT NULL,
  `created_by` int DEFAULT NULL,
  `referensi_id` int DEFAULT NULL,
  `referensi_tabel` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `announcements`
--

CREATE TABLE `announcements` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum('Akademik','Keuangan','Kegiatan','Umum') DEFAULT 'Umum',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `category`, `created_at`) VALUES
(1, 'Ujian Tengah Semester', 'UTS dimulai tanggal 20 Oktober. Siapkan kartu ujian.', 'Akademik', '2026-01-19 18:24:18'),
(4, 'Pembayaran SPP', 'Pembayaran SPP tiap awal bulan', 'Keuangan', '2026-01-21 16:51:27'),
(6, 'Senam pagi', 'Senam pagi tiap hari jumat', 'Kegiatan', '2026-01-21 17:03:19');

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal_kelas`
--

CREATE TABLE `jadwal_kelas` (
  `id` int NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `sesi` int NOT NULL,
  `mapel_id` int DEFAULT NULL,
  `kelas_id` int DEFAULT NULL,
  `guru_id` int DEFAULT NULL,
  `ruangan` varchar(20) DEFAULT NULL,
  `tahun_ajaran` varchar(9) DEFAULT NULL,
  `semester` enum('ganjil','genap') DEFAULT 'ganjil',
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal_pelajaran`
--

CREATE TABLE `jadwal_pelajaran` (
  `id` int NOT NULL,
  `kelas_id` int NOT NULL,
  `mapel_id` int NOT NULL,
  `guru_id` int NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `jadwal_pelajaran`
--

INSERT INTO `jadwal_pelajaran` (`id`, `kelas_id`, `mapel_id`, `guru_id`, `hari`, `jam_mulai`, `jam_selesai`, `created_at`) VALUES
(5, 8, 3, 2, 'Selasa', '00:12:00', '14:12:00', '2026-01-17 13:43:44'),
(6, 6, 2, 3, 'Selasa', '07:00:00', '10:00:00', '2026-01-17 13:44:05'),
(7, 11, 3, 2, 'Kamis', '22:10:00', '01:01:00', '2026-01-17 15:00:44'),
(8, 12, 3, 2, 'Jumat', '00:21:00', '00:12:00', '2026-01-17 15:01:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `jam_pelajaran`
--

CREATE TABLE `jam_pelajaran` (
  `id` int NOT NULL,
  `sesi` int NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `keterangan` varchar(50) DEFAULT NULL,
  `jenis` enum('normal','istirahat','upacara','khusus') DEFAULT 'normal',
  `hari` enum('senin','selasa','rabu','kamis','jumat','sabtu','minggu','semua') DEFAULT 'semua',
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kelas`
--

CREATE TABLE `kelas` (
  `id` int NOT NULL,
  `nama_kelas` varchar(50) NOT NULL,
  `tingkat` enum('X','XI','XII') NOT NULL,
  `jurusan` varchar(50) DEFAULT NULL,
  `wali_kelas_id` int DEFAULT NULL,
  `kapasitas` int DEFAULT '30',
  `ruangan` varchar(20) DEFAULT NULL,
  `tahun_ajaran` varchar(9) DEFAULT NULL,
  `semester` enum('ganjil','genap') DEFAULT 'ganjil',
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `kelas`
--

INSERT INTO `kelas` (`id`, `nama_kelas`, `tingkat`, `jurusan`, `wali_kelas_id`, `kapasitas`, `ruangan`, `tahun_ajaran`, `semester`, `status`, `created_at`, `updated_at`) VALUES
(6, 'XI TKJ 2', 'X', 'TKJ', 2, 36, NULL, '2025/2026', 'ganjil', 'aktif', '2026-01-15 16:34:39', '2026-01-17 13:50:04'),
(8, 'X RPL 1', 'X', 'RPL', 2, 36, NULL, '2025/2026', 'ganjil', 'aktif', '2026-01-17 13:39:25', '2026-01-17 13:50:03'),
(11, 'OTKP 1', 'X', NULL, 2, 36, NULL, '2025/2026', 'ganjil', 'aktif', '2026-01-17 14:00:31', '2026-01-17 14:00:31'),
(12, 'X MM 1', 'X', NULL, 3, 36, NULL, '2025/2026', 'ganjil', 'aktif', '2026-01-17 14:03:41', '2026-01-17 14:03:41');

-- --------------------------------------------------------

--
-- Struktur dari tabel `mata_pelajaran`
--

CREATE TABLE `mata_pelajaran` (
  `id` int NOT NULL,
  `kode_mapel` varchar(10) NOT NULL,
  `nama_mapel` varchar(100) NOT NULL,
  `kategori` varchar(50) DEFAULT 'Umum',
  `tingkat` enum('X','XI','XII','semua') DEFAULT 'semua',
  `jurusan` varchar(50) DEFAULT NULL,
  `guru_id` int DEFAULT NULL,
  `kelas_id` int DEFAULT NULL,
  `semester` enum('ganjil','genap','tahunan') DEFAULT 'tahunan',
  `tahun_ajaran` varchar(9) DEFAULT NULL,
  `jam_per_minggu` int DEFAULT '2',
  `deskripsi` text,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `keterangan` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `mata_pelajaran`
--

INSERT INTO `mata_pelajaran` (`id`, `kode_mapel`, `nama_mapel`, `kategori`, `tingkat`, `jurusan`, `guru_id`, `kelas_id`, `semester`, `tahun_ajaran`, `jam_per_minggu`, `deskripsi`, `status`, `created_at`, `updated_at`, `keterangan`) VALUES
(2, 'mtk01', 'Matematika Baru', 'Muatan Nasional', 'semua', NULL, NULL, NULL, 'tahunan', NULL, 2, NULL, 'aktif', '2026-01-17 08:05:49', '2026-01-18 05:17:01', 'Matematika tingkat lanjut\n'),
(3, 'mtk02', 'Matematika Lama', 'Muatan Kewilayahan', 'semua', NULL, NULL, NULL, 'tahunan', NULL, 2, NULL, 'aktif', '2026-01-17 13:42:17', '2026-01-17 13:42:17', 'Matematika tingkat dasar\n');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','danger') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `link` varchar(255) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `points`
--

CREATE TABLE `points` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `type` enum('violation','achievement') NOT NULL,
  `description` varchar(255) NOT NULL,
  `point_amount` int NOT NULL,
  `incident_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `points`
--

INSERT INTO `points` (`id`, `student_id`, `type`, `description`, `point_amount`, `incident_date`, `created_at`) VALUES
(4, 2, 'achievement', 'juara olimpiade', 10, '2026-01-18', '2026-01-17 08:42:32'),
(5, 1, 'violation', 'terlambat', 5, '2026-01-17', '2026-01-17 08:44:59'),
(6, 7, 'achievement', 'Menang Lomba IT', 7, '2026-01-18', '2026-01-17 13:42:59'),
(7, 9, 'violation', 'ranking 2', 5, '2026-01-17', '2026-01-17 14:54:08'),
(8, 14, 'violation', 'terlambat', 5, '2026-01-18', '2026-01-18 04:58:22'),
(9, 11, 'achievement', 'ranking 1', 8, '2026-01-18', '2026-01-18 07:57:46'),
(10, 11, 'violation', 'terlambat', 3, '2026-01-18', '2026-01-18 07:58:20'),
(11, 23, 'achievement', 'ranking 1', 8, '2026-01-22', '2026-01-22 13:06:15'),
(12, 23, 'violation', 'Atribut tidak lengkap', 5, '2026-01-22', '2026-01-22 13:07:15');

-- --------------------------------------------------------

--
-- Struktur dari tabel `poin_kategori`
--

CREATE TABLE `poin_kategori` (
  `id` int NOT NULL,
  `jenis` enum('prestasi','pelanggaran') NOT NULL,
  `nama_kategori` varchar(100) NOT NULL,
  `deskripsi` text,
  `poin_min` int DEFAULT '0',
  `poin_max` int DEFAULT '0',
  `sanksi` text,
  `penghargaan` text,
  `status` enum('aktif','nonaktif') DEFAULT 'aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `poin_pelanggaran`
--

CREATE TABLE `poin_pelanggaran` (
  `id` int NOT NULL,
  `siswa_id` int NOT NULL,
  `jenis_pelanggaran` enum('ringan','sedang','berat') NOT NULL,
  `kategori_pelanggaran` varchar(100) DEFAULT NULL,
  `deskripsi` text NOT NULL,
  `poin` int NOT NULL,
  `tanggal` date NOT NULL,
  `sanksi` text,
  `lokasi` varchar(100) DEFAULT NULL,
  `saksi` varchar(100) DEFAULT NULL,
  `ditindak_oleh` int DEFAULT NULL,
  `status` enum('pending','ditindak','selesai') DEFAULT 'pending',
  `tindak_lanjut` text,
  `follow_up_by` int DEFAULT NULL,
  `follow_up_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `poin_prestasi`
--

CREATE TABLE `poin_prestasi` (
  `id` int NOT NULL,
  `siswa_id` int NOT NULL,
  `jenis_prestasi` enum('akademik','non-akademik','sosial','olahraga','seni','lainnya') DEFAULT 'akademik',
  `kategori` enum('prestasi','penghargaan','lomba','kejuaraan') DEFAULT 'prestasi',
  `nama_prestasi` varchar(200) NOT NULL,
  `deskripsi` text,
  `tingkat` enum('sekolah','kecamatan','kabupaten','provinsi','nasional','internasional') NOT NULL,
  `peringkat` enum('juara_1','juara_2','juara_3','harapan','partisipasi') DEFAULT 'partisipasi',
  `poin` int NOT NULL,
  `tanggal` date NOT NULL,
  `penyelenggara` varchar(100) DEFAULT NULL,
  `lokasi` varchar(100) DEFAULT NULL,
  `keterangan` text,
  `dokumen` varchar(255) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `semester`
--

CREATE TABLE `semester` (
  `id` int NOT NULL,
  `tahun_ajaran` varchar(9) NOT NULL,
  `semester` enum('ganjil','genap') NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `status` enum('aktif','selesai','akan_datang') DEFAULT 'akan_datang',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_group` varchar(50) DEFAULT 'general',
  `setting_type` enum('text','number','boolean','json','date','time') DEFAULT 'text',
  `label` varchar(100) DEFAULT NULL,
  `description` text,
  `options` text,
  `is_public` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `siswa`
--

CREATE TABLE `siswa` (
  `id` int NOT NULL,
  `nis` varchar(20) NOT NULL,
  `nisn` varchar(20) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `jenis_kelamin` enum('L','P') NOT NULL,
  `tempat_lahir` varchar(50) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `agama` varchar(20) DEFAULT NULL,
  `alamat` text,
  `rt_rw` varchar(10) DEFAULT NULL,
  `kelurahan` varchar(50) DEFAULT NULL,
  `kecamatan` varchar(50) DEFAULT NULL,
  `kota` varchar(50) DEFAULT NULL,
  `provinsi` varchar(50) DEFAULT NULL,
  `kode_pos` varchar(10) DEFAULT NULL,
  `no_telepon` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nama_ayah` varchar(100) DEFAULT NULL,
  `nama_ibu` varchar(100) DEFAULT NULL,
  `pekerjaan_ayah` varchar(100) DEFAULT NULL,
  `pekerjaan_ibu` varchar(100) DEFAULT NULL,
  `no_telepon_ortu` varchar(15) DEFAULT NULL,
  `kelas_id` int DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `status` enum('aktif','alumni','pindah','keluar','dropout') DEFAULT 'aktif',
  `tahun_masuk` year DEFAULT NULL,
  `tahun_keluar` year DEFAULT NULL,
  `total_poin_prestasi` int DEFAULT '0',
  `total_poin_pelanggaran` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `siswa`
--

INSERT INTO `siswa` (`id`, `nis`, `nisn`, `nama_lengkap`, `jenis_kelamin`, `tempat_lahir`, `tanggal_lahir`, `agama`, `alamat`, `rt_rw`, `kelurahan`, `kecamatan`, `kota`, `provinsi`, `kode_pos`, `no_telepon`, `email`, `nama_ayah`, `nama_ibu`, `pekerjaan_ayah`, `pekerjaan_ibu`, `no_telepon_ortu`, `kelas_id`, `foto`, `status`, `tahun_masuk`, `tahun_keluar`, `total_poin_prestasi`, `total_poin_pelanggaran`, `created_at`, `updated_at`) VALUES
(1, '1001', '0012345678', 'Budi Santoso', 'L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, NULL, 'aktif', NULL, NULL, 0, 0, '2026-01-15 15:09:51', '2026-01-17 13:39:45'),
(2, '1002', '0087654321', 'Siti Aminanto', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, NULL, 'aktif', NULL, NULL, 0, 0, '2026-01-15 15:09:51', '2026-01-17 13:39:48'),
(7, '423', '23423423', 'Muhammad Fahri Ilmi', 'L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, NULL, 'aktif', NULL, NULL, 0, 0, '2026-01-15 15:51:58', '2026-01-17 13:39:41'),
(9, '1334', '242332', 'Dimas Antariksa', 'L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, NULL, 'aktif', NULL, NULL, 0, 0, '2026-01-17 13:44:41', '2026-01-17 13:50:31'),
(11, '1111', '2331', 'Zahida', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 11, NULL, 'aktif', NULL, NULL, 0, 0, '2026-01-17 14:00:45', '2026-01-22 13:49:39'),
(14, '4545', '1231', 'Abdullah', 'L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 12, NULL, 'aktif', NULL, NULL, 0, 0, '2026-01-17 14:04:07', '2026-01-22 13:56:18'),
(23, '1213', '1231231', 'Bejirlah', 'P', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 11, NULL, 'aktif', NULL, NULL, 0, 0, '2026-01-22 12:58:06', '2026-01-22 13:50:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tahun_ajaran`
--

CREATE TABLE `tahun_ajaran` (
  `id` int NOT NULL,
  `tahun_ajaran` varchar(9) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `status` enum('aktif','selesai','akan_datang') DEFAULT 'akan_datang',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `jenis_kelamin` enum('L','P') DEFAULT 'L',
  `nip` varchar(30) DEFAULT NULL,
  `tempat_lahir` varchar(50) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `alamat` text,
  `no_telepon` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','guru','siswa') NOT NULL,
  `student_id` int DEFAULT NULL,
  `jabatan` varchar(100) DEFAULT NULL,
  `bidang_studi` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `status` enum('aktif','nonaktif','pensiun','pindah') DEFAULT 'aktif',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `jenis_kelamin`, `nip`, `tempat_lahir`, `tanggal_lahir`, `alamat`, `no_telepon`, `email`, `role`, `student_id`, `jabatan`, `bidang_studi`, `foto`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', '123', 'Administrator Utama', 'L', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NULL, NULL, NULL, NULL, 'aktif', '2026-01-18 05:46:20', '2026-01-15 15:08:26', '2026-01-18 05:46:20'),
(2, 'guru01', '123', 'Budi Raharjo, S.Pd.', 'L', NULL, NULL, NULL, NULL, NULL, NULL, 'guru', NULL, NULL, NULL, NULL, 'aktif', '2026-01-18 07:12:17', '2026-01-15 16:25:05', '2026-01-18 07:12:17'),
(3, 'guru02', '123', 'Siti Aminah, M.Pd.', 'L', NULL, NULL, NULL, NULL, NULL, NULL, 'guru', NULL, NULL, NULL, NULL, 'aktif', '2026-01-18 06:13:45', '2026-01-15 16:25:05', '2026-01-18 06:13:45'),
(12, '1213', '123', 'Bejirlah', 'L', NULL, NULL, NULL, NULL, NULL, NULL, 'siswa', NULL, NULL, NULL, NULL, 'aktif', NULL, '2026-01-22 12:58:06', '2026-01-22 13:50:26'),
(14, '1111', '123', 'Zahida', 'L', NULL, NULL, NULL, NULL, NULL, NULL, 'siswa', NULL, NULL, NULL, NULL, 'aktif', NULL, '2026-01-22 13:48:53', '2026-01-22 13:49:39'),
(15, '4545', '123', 'Abdullah', 'L', NULL, NULL, NULL, NULL, NULL, NULL, 'siswa', NULL, NULL, NULL, NULL, 'aktif', NULL, '2026-01-22 13:56:18', '2026-01-22 13:56:18');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `absensi`
--
ALTER TABLE `absensi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `siswa_id` (`siswa_id`,`mapel_id`,`tanggal`,`sesi`),
  ADD KEY `mapel_id` (`mapel_id`),
  ADD KEY `guru_id` (`guru_id`),
  ADD KEY `verified_by` (`verified_by`);

--
-- Indeks untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `aktivitas_siswa`
--
ALTER TABLE `aktivitas_siswa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `siswa_id` (`siswa_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `jadwal_kelas`
--
ALTER TABLE `jadwal_kelas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hari` (`hari`,`sesi`,`kelas_id`,`tahun_ajaran`,`semester`),
  ADD KEY `mapel_id` (`mapel_id`),
  ADD KEY `kelas_id` (`kelas_id`),
  ADD KEY `guru_id` (`guru_id`);

--
-- Indeks untuk tabel `jadwal_pelajaran`
--
ALTER TABLE `jadwal_pelajaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `kelas_id` (`kelas_id`),
  ADD KEY `mapel_id` (`mapel_id`),
  ADD KEY `guru_id` (`guru_id`);

--
-- Indeks untuk tabel `jam_pelajaran`
--
ALTER TABLE `jam_pelajaran`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wali_kelas_id` (`wali_kelas_id`);

--
-- Indeks untuk tabel `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_mapel` (`kode_mapel`),
  ADD KEY `guru_id` (`guru_id`),
  ADD KEY `kelas_id` (`kelas_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indeks untuk tabel `poin_kategori`
--
ALTER TABLE `poin_kategori`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `poin_pelanggaran`
--
ALTER TABLE `poin_pelanggaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `siswa_id` (`siswa_id`),
  ADD KEY `ditindak_oleh` (`ditindak_oleh`),
  ADD KEY `follow_up_by` (`follow_up_by`);

--
-- Indeks untuk tabel `poin_prestasi`
--
ALTER TABLE `poin_prestasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `siswa_id` (`siswa_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indeks untuk tabel `semester`
--
ALTER TABLE `semester`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tahun_ajaran` (`tahun_ajaran`,`semester`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indeks untuk tabel `siswa`
--
ALTER TABLE `siswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nis` (`nis`),
  ADD UNIQUE KEY `nisn` (`nisn`),
  ADD KEY `kelas_id` (`kelas_id`);

--
-- Indeks untuk tabel `tahun_ajaran`
--
ALTER TABLE `tahun_ajaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tahun_ajaran` (`tahun_ajaran`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_user_student` (`student_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `absensi`
--
ALTER TABLE `absensi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `aktivitas_siswa`
--
ALTER TABLE `aktivitas_siswa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `jadwal_kelas`
--
ALTER TABLE `jadwal_kelas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `jadwal_pelajaran`
--
ALTER TABLE `jadwal_pelajaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `jam_pelajaran`
--
ALTER TABLE `jam_pelajaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `points`
--
ALTER TABLE `points`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `poin_kategori`
--
ALTER TABLE `poin_kategori`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `poin_pelanggaran`
--
ALTER TABLE `poin_pelanggaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `poin_prestasi`
--
ALTER TABLE `poin_prestasi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `semester`
--
ALTER TABLE `semester`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `siswa`
--
ALTER TABLE `siswa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT untuk tabel `tahun_ajaran`
--
ALTER TABLE `tahun_ajaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `absensi`
--
ALTER TABLE `absensi`
  ADD CONSTRAINT `absensi_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `absensi_ibfk_2` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `absensi_ibfk_3` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `absensi_ibfk_4` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `aktivitas_siswa`
--
ALTER TABLE `aktivitas_siswa`
  ADD CONSTRAINT `aktivitas_siswa_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `aktivitas_siswa_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `jadwal_kelas`
--
ALTER TABLE `jadwal_kelas`
  ADD CONSTRAINT `jadwal_kelas_ibfk_1` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jadwal_kelas_ibfk_2` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jadwal_kelas_ibfk_3` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `jadwal_pelajaran`
--
ALTER TABLE `jadwal_pelajaran`
  ADD CONSTRAINT `jadwal_pelajaran_ibfk_1` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jadwal_pelajaran_ibfk_2` FOREIGN KEY (`mapel_id`) REFERENCES `mata_pelajaran` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jadwal_pelajaran_ibfk_3` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kelas`
--
ALTER TABLE `kelas`
  ADD CONSTRAINT `kelas_ibfk_1` FOREIGN KEY (`wali_kelas_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `mata_pelajaran`
--
ALTER TABLE `mata_pelajaran`
  ADD CONSTRAINT `mata_pelajaran_ibfk_1` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `mata_pelajaran_ibfk_2` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `points`
--
ALTER TABLE `points`
  ADD CONSTRAINT `points_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `poin_pelanggaran`
--
ALTER TABLE `poin_pelanggaran`
  ADD CONSTRAINT `poin_pelanggaran_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `poin_pelanggaran_ibfk_2` FOREIGN KEY (`ditindak_oleh`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `poin_pelanggaran_ibfk_3` FOREIGN KEY (`follow_up_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `poin_prestasi`
--
ALTER TABLE `poin_prestasi`
  ADD CONSTRAINT `poin_prestasi_ibfk_1` FOREIGN KEY (`siswa_id`) REFERENCES `siswa` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `poin_prestasi_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `poin_prestasi_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `siswa`
--
ALTER TABLE `siswa`
  ADD CONSTRAINT `siswa_ibfk_1` FOREIGN KEY (`kelas_id`) REFERENCES `kelas` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_student` FOREIGN KEY (`student_id`) REFERENCES `siswa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
