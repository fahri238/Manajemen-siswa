const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET JADWAL (Bisa Filter per Kelas)
router.get("/", async (req, res) => {
  try {
    const { kelas_id } = req.query; // Ambil filter ?kelas_id=1

    let sql = `
            SELECT 
                j.id, j.hari, j.jam_mulai, j.jam_selesai,
                k.nama_kelas,
                m.nama_mapel, m.kode_mapel,
                u.nama_lengkap as nama_guru
            FROM jadwal_pelajaran j
            JOIN kelas k ON j.kelas_id = k.id
            JOIN mata_pelajaran m ON j.mapel_id = m.id
            JOIN users u ON j.guru_id = u.id
        `;

    const params = [];
    if (kelas_id) {
      sql += " WHERE j.kelas_id = ? ";
      params.push(kelas_id);
    }

    // Urutkan berdasarkan Hari (Senin-Sabtu) dan Jam
    sql += ` ORDER BY FIELD(j.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'), j.jam_mulai ASC`;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/teacher/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Query Join: Jadwal -> Kelas -> Mapel
    // Diurutkan berdasarkan Hari (Senin->Sabtu) dan Jam Mulai
    const sql = `
            SELECT 
                j.id, j.hari, j.jam_mulai, j.jam_selesai,
                k.nama_kelas,
                m.nama_mapel, m.kode_mapel
            FROM jadwal_pelajaran j
            JOIN kelas k ON j.kelas_id = k.id
            JOIN mata_pelajaran m ON j.mapel_id = m.id
            WHERE j.guru_id = ?
            ORDER BY 
                FIELD(j.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'),
                j.jam_mulai ASC
        `;

    const [rows] = await db.query(sql, [id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST (Tambah Jadwal)
router.post("/", async (req, res) => {
  try {
    const { kelas_id, mapel_id, guru_id, hari, jam_mulai, jam_selesai } =
      req.body;

    // Validasi Bentrok (Opsional: Cek apakah guru mengajar di jam yang sama di kelas lain?)
    // Untuk sekarang kita skip validasi bentrok biar tidak pusing dulu.

    const sql = `INSERT INTO jadwal_pelajaran (kelas_id, mapel_id, guru_id, hari, jam_mulai, jam_selesai) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      kelas_id,
      mapel_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
    ]);

    res.json({
      success: true,
      message: "Jadwal berhasil disimpan",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    // Kita butuh ID-nya (kelas_id, mapel_id, dll) untuk mengisi form, bukan Namanya.
    const sql = "SELECT * FROM jadwal_pelajaran WHERE id = ?";
    const [rows] = await db.query(sql, [req.params.id]);

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Jadwal tidak ditemukan" });

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// [TAMBAHAN BARU] PUT (Update Jadwal)
router.put("/:id", async (req, res) => {
  try {
    const { kelas_id, mapel_id, guru_id, hari, jam_mulai, jam_selesai } =
      req.body;
    const { id } = req.params;

    const sql = `UPDATE jadwal_pelajaran SET kelas_id=?, mapel_id=?, guru_id=?, hari=?, jam_mulai=?, jam_selesai=? WHERE id=?`;
    await db.query(sql, [
      kelas_id,
      mapel_id,
      guru_id,
      hari,
      jam_mulai,
      jam_selesai,
      id,
    ]);

    res.json({ success: true, message: "Jadwal berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DELETE (Hapus Jadwal)
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM jadwal_pelajaran WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ success: true, message: "Jadwal berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Perbaikan Query: Filter berdasarkan guru_id yang sedang login
    const sql = `
      SELECT 
        j.id, j.hari, j.jam_mulai, j.jam_selesai,
        k.nama_kelas,
        m.nama_mapel as nama_pelajaran -- Sesuaikan nama kolom mapel Anda
      FROM jadwal_pelajaran j
      JOIN kelas k ON j.kelas_id = k.id
      JOIN mata_pelajaran m ON j.mapel_id = m.id
      WHERE j.guru_id = ?
      ORDER BY FIELD(j.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'), j.jam_mulai ASC
    `;

    const [rows] = await db.query(sql, [teacherId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error Fetch Teacher Schedule:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
