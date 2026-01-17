const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET KELAS AJAR GURU (Tetap sama)
router.get("/classes/:teacherId", async (req, res) => {
  try {
    const sql = `
            SELECT DISTINCT k.id, k.nama_kelas 
            FROM jadwal_pelajaran j
            JOIN kelas k ON j.kelas_id = k.id
            WHERE j.guru_id = ?
            ORDER BY k.nama_kelas ASC
        `;
    const [rows] = await db.query(sql, [req.params.teacherId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET SISWA + ABSENSI HARI INI (REVISI: Sesuaikan tabel absensi)
router.get("/list", async (req, res) => {
  try {
    const { class_id, date } = req.query;

    // Kita JOIN tabel 'siswa' dengan 'absensi'
    // Mencocokkan siswa_id dan tanggal
    const sql = `
            SELECT 
                s.id as student_id, s.nis, s.nama_lengkap,
                a.id as attendance_id, a.status, a.keterangan as note
            FROM siswa s
            LEFT JOIN absensi a ON s.id = a.siswa_id AND a.tanggal = ?
            WHERE s.kelas_id = ?
            ORDER BY s.nama_lengkap ASC
        `;

    const [rows] = await db.query(sql, [date, class_id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST: SIMPAN ABSENSI (REVISI: Sesuaikan tabel absensi)
router.post("/save", async (req, res) => {
  try {
    const { teacher_id, date, students } = req.body;
    // Note: class_id tidak disimpan di tabel absensi, jadi tidak perlu diambil dari body untuk insert

    if (!students || students.length === 0)
      return res.status(400).json({ message: "Data kosong" });

    for (let s of students) {
      // Cek apakah data sudah ada?
      const [cek] = await db.query(
        "SELECT id FROM absensi WHERE siswa_id = ? AND tanggal = ?",
        [s.student_id, date]
      );

      if (cek.length > 0) {
        // UPDATE (Gunakan nama kolom 'status', 'keterangan', 'guru_id')
        await db.query(
          "UPDATE absensi SET status = ?, keterangan = ?, guru_id = ? WHERE id = ?",
          [s.status, s.note, teacher_id, cek[0].id]
        );
      } else {
        // INSERT (Gunakan nama kolom sesuai DB Anda)
        // mapel_id kita biarkan NULL dulu (asumsi ini absensi harian wali kelas/umum)
        // metode_absen default 'manual'
        await db.query(
          "INSERT INTO absensi (siswa_id, guru_id, tanggal, status, keterangan, metode_absen) VALUES (?, ?, ?, ?, ?, 'manual')",
          [s.student_id, teacher_id, date, s.status, s.note]
        );
      }
    }

    res.json({ success: true, message: "Absensi berhasil disimpan!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
