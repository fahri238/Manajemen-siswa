const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET: Ambil Semua Guru
router.get("/", async (req, res) => {
  try {
    // Filter hanya yang role-nya 'guru'
    const sql =
      "SELECT id, username, nama_lengkap, status FROM users WHERE role = 'guru' ORDER BY nama_lengkap ASC";
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
    const [rows] = await db.query(
      "SELECT id, username, nama_lengkap, status FROM users WHERE id = ? AND role = 'guru'",
      [id]
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Guru tidak ditemukan" });

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST: Tambah Guru Baru
router.post("/", async (req, res) => {
  try {
    const { username, password, nama_lengkap } = req.body;

    if (!username || !password || !nama_lengkap) {
      return res
        .status(400)
        .json({ success: false, message: "Semua data wajib diisi!" });
    }

    // Cek username kembar
    const [cek] = await db.query("SELECT id FROM users WHERE username = ?", [
      username,
    ]);
    if (cek.length > 0)
      return res
        .status(400)
        .json({ success: false, message: "NIP/Username sudah digunakan!" });

    const sql =
      "INSERT INTO users (username, password, nama_lengkap, role, status) VALUES (?, ?, ?, 'guru', 'aktif')";
    const [result] = await db.execute(sql, [username, password, nama_lengkap]);

    res.json({
      success: true,
      message: "Guru berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PUT: Update Data Guru
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, nama_lengkap, status } = req.body;

    // Logic Password: Jika kosong, jangan diupdate. Jika isi, update.
    let sql, params;
    if (password && password.trim() !== "") {
      sql =
        "UPDATE users SET username=?, password=?, nama_lengkap=?, status=? WHERE id=? AND role='guru'";
      params = [username, password, nama_lengkap, status, id];
    } else {
      sql =
        "UPDATE users SET username=?, nama_lengkap=?, status=? WHERE id=? AND role='guru'";
      params = [username, nama_lengkap, status, id];
    }

    await db.query(sql, params);
    res.json({ success: true, message: "Data guru berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. DELETE: Hapus Guru
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Opsional: Cek dulu apakah dia Wali Kelas? (Biar aman)
    const [cekKelas] = await db.query(
      "SELECT COUNT(*) as total FROM kelas WHERE wali_kelas_id = ?",
      [id]
    );
    if (cekKelas[0].total > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Gagal! Guru ini adalah Wali Kelas. Ganti dulu wali kelasnya.",
        });
    }

    await db.query("DELETE FROM users WHERE id = ? AND role = 'guru'", [id]);
    res.json({ success: true, message: "Data guru berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
