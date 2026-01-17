const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const [
      totalSiswa,
      totalGuru,
      totalKelas,
      recentPoints,
      // DATA BARU UNTUK CHART:
      statsJurusan, // Hitung siswa per jurusan
      statsPoin, // Hitung total pelanggaran vs prestasi
    ] = await Promise.all([
      db.query("SELECT COUNT(*) as total FROM siswa"),
      db.query("SELECT COUNT(*) as total FROM users WHERE role='guru'"),
      db.query("SELECT COUNT(*) as total FROM kelas"),

      // Feed Aktivitas
      db.query(`
                SELECT p.*, s.nama_lengkap, k.nama_kelas 
                FROM points p 
                JOIN siswa s ON p.student_id = s.id 
                LEFT JOIN kelas k ON s.kelas_id = k.id 
                ORDER BY p.created_at DESC LIMIT 5
            `),

      // Query Chart 1: Siswa per Jurusan (Group By Jurusan di tabel Kelas)
      db.query(`
                SELECT k.nama_kelas, COUNT(s.id) as total 
                FROM siswa s 
                JOIN kelas k ON s.kelas_id = k.id 
                GROUP BY k.nama_kelas
            `),

      // Query Chart 2: Poin (Group By Type)
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
      // Kirim data chart ke frontend
      charts: {
        jurusan: statsJurusan[0],
        poin: statsPoin[0],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
