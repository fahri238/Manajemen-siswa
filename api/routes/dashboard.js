const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =======================================================================
// 1. DASHBOARD ADMIN (Route: /api/dashboard/)
// =======================================================================
router.get("/", async (req, res) => {
  try {
    const [
      totalSiswa,
      totalGuru,
      totalKelas,
      recentPoints,
      statsJurusan,
      statsPoin,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) as total FROM siswa"),
      db.query("SELECT COUNT(*) as total FROM users WHERE role='guru'"),
      db.query("SELECT COUNT(*) as total FROM kelas"),

      // Feed Aktivitas (5 Terakhir)
      db.query(`
                SELECT p.*, s.nama_lengkap, k.nama_kelas 
                FROM points p 
                JOIN siswa s ON p.student_id = s.id 
                LEFT JOIN kelas k ON s.kelas_id = k.id 
                ORDER BY p.created_at DESC LIMIT 5
            `),

      // Chart Jurusan
      db.query(`
                SELECT k.nama_kelas, COUNT(s.id) as total 
                FROM siswa s 
                JOIN kelas k ON s.kelas_id = k.id 
                GROUP BY k.nama_kelas
            `),

      // Chart Poin
      db.query(`SELECT type, COUNT(*) as total FROM points GROUP BY type`),
    ]);

    res.json({
      success: true,
      stats: {
        siswa: totalSiswa[0][0].total,
        guru: totalGuru[0][0].total,
        kelas: totalKelas[0][0].total,
      },
      recent_activities: recentPoints[0],
      charts: {
        jurusan: statsJurusan[0],
        poin: statsPoin[0],
      },
    });
  } catch (error) {
    console.error("Error Admin Dashboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 2. DASHBOARD GURU (Route: /api/dashboard/teacher-stats/:teacherId)
// =======================================================================
router.get("/teacher-stats/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // A. TENTUKAN HARI INI
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const todayName = days[new Date().getDay()];

    // B. AMBIL JADWAL MENGAJAR HARI INI
    const [schedules] = await db.query(
      `SELECT j.*, k.nama_kelas, m.nama_mapel as nama_pelajaran 
       FROM jadwal_pelajaran j
       JOIN kelas k ON j.kelas_id = k.id
       JOIN mata_pelajaran m ON j.mapel_id = m.id
       WHERE j.guru_id = ? AND j.hari = ?
       ORDER BY j.jam_mulai ASC`,
      [teacherId, todayName],
    );

    // C. AMBIL SEMUA KELAS BINAAN (Wali Kelas)
    const [waliKelas] = await db.query(
      `SELECT id, nama_kelas FROM kelas WHERE wali_kelas_id = ?`,
      [teacherId],
    );

    let stats = {
      is_wali_kelas: waliKelas.length > 0,
      total_kelas: waliKelas.length,
      total_siswa: 0,
      pelanggaran_hari_ini: 0,
      nama_kelas: "Bukan Wali Kelas",
    };

    if (waliKelas.length > 0) {
      const kelasIds = waliKelas.map((k) => k.id);

      // Nama Tampilan (Satu kelas atau banyak kelas)
      const namaKelasDisplay =
        waliKelas.length > 1
          ? `${waliKelas.length} Kelas Binaan`
          : waliKelas[0].nama_kelas;

      // 1. Hitung Total Siswa dari semua kelas binaan
      const [countSiswa] = await db.query(
        `SELECT COUNT(*) as total FROM siswa WHERE kelas_id IN (?)`,
        [kelasIds],
      );

      // 2. Hitung Pelanggaran Hari Ini dari kelas binaan
      const [countKasus] = await db.query(
        `SELECT COUNT(*) as total FROM points 
         WHERE student_id IN (SELECT id FROM siswa WHERE kelas_id IN (?)) 
         AND DATE(created_at) = CURDATE() 
         AND type = 'violation'`,
        [kelasIds],
      );

      stats.nama_kelas = namaKelasDisplay;
      stats.total_siswa = countSiswa[0].total;
      stats.pelanggaran_hari_ini = countKasus[0].total;
    }

    res.json({
      success: true,
      data: {
        today: todayName,
        schedules: schedules,
        stats: stats,
      },
    });
  } catch (error) {
    console.error("Error Teacher Dashboard:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 3. DASHBOARD SISWA (Route: /api/dashboard/student/:studentId)
// =======================================================================
router.get("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Ambil NIS berdasarkan ID User login
    const [user] = await db.query("SELECT username FROM users WHERE id = ?", [
      id,
    ]);
    if (user.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });

    const nis = user[0].username;

    // 2. Ambil data profil siswa dan kelas
    const sql = `
      SELECT s.id as student_id, s.nama_lengkap, k.nama_kelas, s.kelas_id
      FROM siswa s
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE s.nis = ?
    `;
    const [profile] = await db.query(sql, [nis]);
    if (profile.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Profil siswa tidak ditemukan" });

    const p = profile[0];

    // 3. Logika Hari Ini (Bahasa Indonesia)
    const hariIndo = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const namaHariIni = hariIndo[new Date().getDay()];

    // 4. Ambil Jadwal Hari Ini (SEBELUMNYA KOSONG, SEKARANG DIISI)
    const [schedules] = await db.query(
      `
      SELECT 
        j.jam_mulai, j.jam_selesai, 
        m.nama_mapel 
      FROM jadwal_pelajaran j
      JOIN mata_pelajaran m ON j.mapel_id = m.id
      WHERE j.kelas_id = ? AND j.hari = ?
      ORDER BY j.jam_mulai ASC`,
      [p.kelas_id, namaHariIni],
    );

    // 5. Ambil data Poin
    const [points] = await db.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'achievement' THEN point_amount ELSE 0 END), 0) as total_prestasi,
        COALESCE(SUM(CASE WHEN type = 'violation' THEN point_amount ELSE 0 END), 0) as total_pelanggaran
      FROM points WHERE student_id = ?`,
      [p.student_id],
    );

    // 6. Ambil Pengumuman
    const [announcements] = await db.query(
      "SELECT title, content, category, DATE_FORMAT(created_at, '%d %b') as tanggal FROM announcements ORDER BY created_at DESC LIMIT 5",
    );

    // Kirim hasil gabungan ke frontend
    res.json({
      success: true,
      data: {
        profile: p,
        points: points[0],
        announcements: announcements,
        schedules: schedules, // SEKARANG BERISI DATA HASIL QUERY
        attendance: 100,
        today: namaHariIni,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// api/routes/schedules.js (atau tambahkan di dashboard.js)
router.get("/student-full-by-id/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Cari kelas_id siswa ini di database
    const [siswa] = await db.query("SELECT kelas_id FROM siswa WHERE id = ?", [
      studentId,
    ]);

    if (siswa.length === 0 || !siswa[0].kelas_id) {
      return res.json({
        success: false,
        message: "Siswa belum terdaftar di kelas manapun",
      });
    }

    const kelasId = siswa[0].kelas_id;

    // 2. Ambil jadwal lengkap untuk kelas tersebut
    const [jadwal] = await db.query(
      `SELECT j.*, m.nama_mapel, u.nama_lengkap as nama_guru
       FROM jadwal_pelajaran j
       JOIN mata_pelajaran m ON j.mapel_id = m.id
       LEFT JOIN users u ON j.guru_id = u.id
       WHERE j.kelas_id = ?
       ORDER BY FIELD(hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'), jam_mulai ASC`,
      [kelasId],
    );

    res.json({ success: true, data: jadwal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
