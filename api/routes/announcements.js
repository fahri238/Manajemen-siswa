const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Ini adalah pool.promise()

// 1. Ambil semua pengumuman (Gaya Async/Await)
router.get("/", async (req, res) => {
  try {
    const query =
      "SELECT id, title, content, category, created_at FROM announcements ORDER BY created_at DESC";
    // Di mysql2/promise, hasilnya berupa array [rows, fields]
    const [rows] = await db.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ success: false, message: "Kesalahan Database" });
  }
});

// 2. Tambah pengumuman baru
router.post("/", async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const query =
      "INSERT INTO announcements (title, content, category) VALUES (?, ?, ?)";
    await db.query(query, [title, content, category]);
    res.json({ success: true, message: "Berhasil disimpan" });
  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Hapus pengumuman
router.delete("/:id", async (req, res) => {
  try {
    const query = "DELETE FROM announcements WHERE id = ?";
    await db.query(query, [req.params.id]);
    res.json({ success: true, message: "Pengumuman dihapus" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
