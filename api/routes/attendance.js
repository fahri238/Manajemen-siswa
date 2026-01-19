const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =======================================================================
// 1. GET: Ambil Daftar Kelas Perwalian (DROPDOWN) - [FIXED]
// =======================================================================
router.get("/classes/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // LOGIKA BENAR: Ambil kelas berdasarkan 'wali_kelas_id'
    const sql = `
        SELECT id, nama_kelas 
        FROM kelas 
        WHERE wali_kelas_id = ? 
        ORDER BY nama_kelas ASC
    `;

    const [rows] = await db.query(sql, [teacherId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error Get Classes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 2. GET: Ambil Data Absensi Siswa pada Tanggal Tertentu
// =======================================================================
router.get("/list", async (req, res) => {
  try {
    const { kelasId, date } = req.query;

    if (!kelasId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Kelas dan Tanggal wajib dipilih!" });
    }

    // Ambil semua siswa di kelas tersebut
    // Lalu JOIN dengan tabel absensi untuk melihat status pada tanggal itu
    const sql = `
        SELECT 
            s.id as siswa_id, 
            s.nis, 
            s.nama_lengkap, 
            s.jenis_kelamin,
            COALESCE(a.status, 'hadir') as status, -- Default Hadir jika belum diabsen
            a.keterangan
        FROM siswa s
        LEFT JOIN absensi a ON s.id = a.siswa_id AND a.tanggal = ?
        WHERE s.kelas_id = ?
        ORDER BY s.nama_lengkap ASC
    `;

    const [rows] = await db.query(sql, [date, kelasId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error Get Attendance List:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 3. POST: Simpan Absensi (Bulk Insert/Update)
// =======================================================================
router.post("/save", async (req, res) => {
  try {
    const { kelasId, date, attendanceData } = req.body;
    // attendanceData bentuknya array: [{ siswa_id: 1, status: 'sakit', keterangan: '' }, ...]

    if (!attendanceData || attendanceData.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada data absensi." });
    }

    // Kita gunakan LOOP untuk UPSERT (Insert or Update)
    // Cara paling aman dan mudah dibaca:
    for (const item of attendanceData) {
      // Cek apakah sudah ada data absensi untuk siswa ini di tanggal ini?
      const checkSql = `SELECT id FROM absensi WHERE siswa_id = ? AND tanggal = ?`;
      const [existing] = await db.query(checkSql, [item.siswa_id, date]);

      if (existing.length > 0) {
        // UPDATE jika sudah ada
        await db.query(
          `UPDATE absensi SET status = ?, keterangan = ? WHERE id = ?`,
          [item.status, item.keterangan || "", existing[0].id],
        );
      } else {
        // INSERT jika belum ada (hanya jika status BUKAN hadir, untuk menghemat db)
        // ATAU Insert semua status termasuk hadir (sesuai kebutuhan).
        // Di sini kita simpan semua agar tercatat "Hadir".
        await db.query(
          `INSERT INTO absensi (siswa_id, tanggal, status, keterangan) VALUES (?, ?, ?, ?)`,
          [item.siswa_id, date, item.status, item.keterangan || ""],
        );
      }
    }

    res.json({ success: true, message: "Absensi berhasil disimpan!" });
  } catch (error) {
    console.error("Error Save Attendance:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
