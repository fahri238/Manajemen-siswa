const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET: Ambil Riwayat Poin (Join ke Siswa & Kelas)
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
    try {
        const { student_id, type, description, point_amount, incident_date } = req.body;

        if (!student_id || !description || !point_amount) {
            return res.status(400).json({ success: false, message: 'Data tidak lengkap!' });
        }

        const sql = `INSERT INTO points (student_id, type, description, point_amount, incident_date) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [student_id, type, description, point_amount, incident_date]);

        res.json({ success: true, message: 'Poin berhasil disimpan', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. DELETE: Hapus Poin
router.delete('/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM points WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Data poin dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;