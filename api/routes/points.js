const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET: Ambil Riwayat Poin (Join ke Siswa & Kelas)
router.get("/", async (req, res) => {
  try {
    const sql = `
            SELECT 
                p.id, p.type, p.description, p.point_amount, p.incident_date,
                s.nama_lengkap, s.nis,
                k.nama_kelas
            FROM points p
            JOIN siswa s ON p.student_id = s.id
            JOIN kelas k ON s.kelas_id = k.id
            ORDER BY p.incident_date DESC, p.created_at DESC
        `;
    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST: Simpan Poin Baru
router.post("/", async (req, res) => {
  try {
    const { student_id, type, description, point_amount, incident_date } =
      req.body;

    if (!student_id || !description || !point_amount) {
      return res
        .status(400)
        .json({ success: false, message: "Data tidak lengkap!" });
    }

    const sql = `INSERT INTO points (student_id, type, description, point_amount, incident_date) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      student_id,
      type,
      description,
      point_amount,
      incident_date,
    ]);

    res.json({
      success: true,
      message: "Poin berhasil disimpan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DELETE: Hapus Poin
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM points WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Data poin dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ambil riwayat poin khusus untuk siswa binaan guru tertentu
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const sql = `
      SELECT p.*, s.nama_lengkap, k.nama_kelas 
      FROM points p 
      JOIN siswa s ON p.student_id = s.id 
      JOIN kelas k ON s.kelas_id = k.id 
      WHERE k.wali_kelas_id = ?
      ORDER BY p.incident_date DESC, p.created_at DESC
    `;
    const [rows] = await db.query(sql, [teacherId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SISWA
router.get("/student/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Ini ID dari tabel 'users'

    // 1. Cari ID Siswa yang asli dengan mencocokkan username (users) dan nis (siswa)
    const sqlGetStudent = `
      SELECT s.id 
      FROM siswa s 
      JOIN users u ON s.nis = u.username 
      WHERE u.id = ?
    `;
    const [siswa] = await db.query(sqlGetStudent, [userId]);

    // Jika tidak ada data siswa yang cocok dengan akun user ini
    if (siswa.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const realStudentId = siswa[0].id;

    // 2. Sekarang ambil poin menggunakan ID siswa yang asli
    const [points] = await db.query(
      `SELECT 
                type, 
                description AS name, 
                point_amount, 
                incident_date AS created_at 
             FROM points 
             WHERE student_id = ? 
             ORDER BY incident_date DESC`,
      [realStudentId],
    );

    res.json({ success: true, data: points });
  } catch (error) {
    console.error("Error Points:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
