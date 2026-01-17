const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  try {
    const { type, month } = req.query; // Mengambil filter dari Frontend

    // Validasi input minimal
    if (!type) {
      return res
        .status(400)
        .json({ success: false, message: "Tipe laporan harus dipilih!" });
    }

    // QUERY COMPLEX:
    // 1. Ambil nama siswa & kelas.
    // 2. Hitung jumlah kasus (COUNT).
    // 3. Hitung total poin (SUM).
    // 4. Filter berdasarkan Tipe (Pelanggaran/Prestasi).
    // 5. Filter berdasarkan Bulan (Opsional).
    // 6. Urutkan dari poin terbanyak.

    let sql = `
            SELECT 
                s.nama_lengkap, 
                k.nama_kelas,
                COUNT(p.id) as total_kasus,
                SUM(p.point_amount) as total_poin
            FROM points p
            JOIN siswa s ON p.student_id = s.id
            JOIN kelas k ON s.kelas_id = k.id
            WHERE p.type = ?
        `;

    const params = [type];

    // Jika ada filter bulan (Format: YYYY-MM)
    if (month) {
      sql += ` AND DATE_FORMAT(p.incident_date, '%Y-%m') = ?`;
      params.push(month);
    }

    // Grouping & Sorting
    sql += ` GROUP BY s.id ORDER BY total_poin DESC, total_kasus DESC`;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
