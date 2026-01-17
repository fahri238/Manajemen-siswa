const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET: Ambil Semua Kelas (Join dengan Nama Wali Kelas)
router.get("/", async (req, res) => {
  try {
    // Kita join ke tabel users untuk dapat nama wali kelas
    const sql = `
            SELECT kelas.*, users.nama_lengkap as nama_wali_kelas 
            FROM kelas 
            LEFT JOIN users ON kelas.wali_kelas_id = users.id 
            ORDER BY kelas.nama_kelas ASC
        `;
    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET SINGLE (Untuk Edit)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM kelas WHERE id = ?", [id]);
    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Kelas tidak ditemukan" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST: Tambah Kelas
router.post("/", async (req, res) => {
  try {
    // Sesuaikan dengan ID di HTML Anda
    const { nama_kelas, wali_kelas_id, tahun_ajaran, kapasitas } = req.body;

    const sql = `INSERT INTO kelas (nama_kelas, wali_kelas_id, tahun_ajaran, kapasitas) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      nama_kelas,
      wali_kelas_id || null,
      tahun_ajaran,
      kapasitas,
    ]);

    res.json({
      success: true,
      message: "Kelas berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PUT: Update Kelas
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_kelas, wali_kelas_id, tahun_ajaran, kapasitas } = req.body;

    const sql = `UPDATE kelas SET nama_kelas=?, wali_kelas_id=?, tahun_ajaran=?, kapasitas=? WHERE id=?`;
    await db.query(sql, [
      nama_kelas,
      wali_kelas_id || null,
      tahun_ajaran,
      kapasitas,
      id,
    ]);

    res.json({ success: true, message: "Data kelas berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. DELETE: Hapus Kelas
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM kelas WHERE id = ?", [id]);
    res.json({ success: true, message: "Kelas berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. ROUTE BARU: Ambil Daftar Guru (Untuk Dropdown Wali Kelas)
router.get("/teachers/list", async (req, res) => {
  try {
    // Ambil user yang role-nya 'guru'
    const [rows] = await db.query(
      "SELECT id, nama_lengkap FROM users WHERE role = 'guru' AND status='aktif'"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
