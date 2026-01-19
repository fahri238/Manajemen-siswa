const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =======================================================================
// 1. GET: Ambil Semua Siswa (ADMIN VIEW)
// =======================================================================
router.get("/", async (req, res) => {
  try {
    const sql = `
            SELECT 
                s.id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin AS gender, s.status, s.kelas_id,
                k.nama_kelas,
                -- Hitung Total Prestasi (type = 'achievement')
                COALESCE(SUM(CASE WHEN p.type = 'achievement' THEN p.point_amount ELSE 0 END), 0) as total_prestasi,
                -- Hitung Total Pelanggaran (type = 'violation')
                COALESCE(SUM(CASE WHEN p.type = 'violation' THEN p.point_amount ELSE 0 END), 0) as total_pelanggaran
            FROM siswa s 
            LEFT JOIN kelas k ON s.kelas_id = k.id 
            LEFT JOIN points p ON s.id = p.student_id
            GROUP BY s.id, s.nis, s.nama_lengkap, k.nama_kelas
            ORDER BY s.nama_lengkap ASC
        `;

    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 2. GET: Ambil Siswa Binaan Wali Kelas (TEACHER VIEW)
// =======================================================================
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const sql = `
      SELECT 
        s.id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin AS gender, s.status,
        k.nama_kelas,
        COALESCE(SUM(CASE WHEN p.type = 'achievement' THEN p.point_amount ELSE 0 END), 0) as total_prestasi,
        COALESCE(SUM(CASE WHEN p.type = 'violation' THEN p.point_amount ELSE 0 END), 0) as total_pelanggaran
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN points p ON s.id = p.student_id
      WHERE k.wali_kelas_id = ?
      GROUP BY s.id, k.nama_kelas
      ORDER BY k.nama_kelas ASC, s.nama_lengkap ASC
    `;

    const [rows] = await db.query(sql, [teacherId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error Teacher Students:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 3. GET SINGLE: Ambil Detail 1 Siswa
// =======================================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID Siswa tidak valid" });
    }

    const sql = `
        SELECT 
            s.id, s.nis, s.nisn, s.nama_lengkap, 
            s.jenis_kelamin AS gender, 
            s.kelas_id, s.status,
            COALESCE(SUM(p.point_amount), 0) as poin
        FROM siswa s
        LEFT JOIN points p ON s.id = p.student_id
        WHERE s.id = ?
        GROUP BY s.id
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Siswa tidak ditemukan" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 4. POST: Tambah Siswa Baru (FIXED)
// =======================================================================
router.post("/", async (req, res) => {
  try {
    const { nis, nisn, nama_lengkap, gender, kelas_id, status } = req.body;

    if (!nis || !nama_lengkap || !kelas_id) {
      return res.status(400).json({
        success: false,
        message: "NIS, Nama, dan Kelas wajib diisi!",
      });
    }

    const finalNisn = nisn && nisn.trim() !== "" ? nisn : null;

    // --- PERBAIKAN DI SINI ---
    // Hapus kolom 'poin' dan value '0' karena tabel siswa tidak punya kolom poin.
    const sql = `
            INSERT INTO siswa (nis, nisn, nama_lengkap, jenis_kelamin, kelas_id, status) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

    await db.execute(sql, [
      nis,
      finalNisn,
      nama_lengkap,
      gender,
      kelas_id,
      status || "aktif",
    ]);

    res.json({
      success: true,
      message: "Siswa berhasil ditambahkan!",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const msg = error.sqlMessage.includes("nisn")
        ? "NISN sudah digunakan siswa lain!"
        : "NIS sudah terdaftar!";
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 5. PUT: Update Data Siswa
// =======================================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, nisn, nama_lengkap, gender, kelas_id, status } = req.body;
    const finalNisn = nisn && nisn.trim() !== "" ? nisn : null;

    const sql = `
            UPDATE siswa 
            SET nis = ?, nisn = ?, nama_lengkap = ?, jenis_kelamin = ?, kelas_id = ?, status = ?
            WHERE id = ?
        `;

    await db.query(sql, [
      nis,
      finalNisn,
      nama_lengkap,
      gender,
      kelas_id,
      status || "aktif",
      id,
    ]);

    res.json({ success: true, message: "Data siswa berhasil diperbarui!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const msg = error.sqlMessage.includes("nisn")
        ? "NISN sudah digunakan siswa lain!"
        : "NIS sudah terdaftar!";
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 6. DELETE: Hapus Siswa
// =======================================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM siswa WHERE id = ?", [id]);
    res.json({ success: true, message: "Data siswa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
