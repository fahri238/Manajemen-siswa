const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- API LOGIN (POST /api/auth/login) ---
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    /**
     * PERBAIKAN: 
     * Menggunakan COALESCE untuk mengambil nama dari tabel users (u.nama_lengkap)
     * jika data di tabel siswa (s.nama_lengkap) kosong.
     */
    const sql = `
      SELECT 
        u.id, 
        u.username, 
        u.role, 
        u.student_id, 
        COALESCE(s.nama_lengkap, u.nama_lengkap, u.username) AS nama_tampilan,
        s.kelas_id, 
        k.nama_kelas
      FROM users u
      LEFT JOIN siswa s ON u.student_id = s.id
      LEFT JOIN kelas k ON s.kelas_id = k.id
      WHERE u.username = ? AND u.password = ?
    `;

    const [rows] = await db.query(sql, [username, password]);

    if (rows.length > 0) {
      const user = rows[0];
      res.json({
        success: true,
        data: {
          id: user.student_id || user.id, 
          userId: user.id,
          username: user.username,
          role: user.role,
          nama_lengkap: user.nama_tampilan, // Sekarang berisi nama Guru atau Siswa
          nama_kelas: user.nama_kelas || null,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Username atau Password salah!" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logout berhasil" });
});

module.exports = router;