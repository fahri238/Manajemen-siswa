const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET ALL
router.get('/', async (req, res) => {
    try {
        const sql = "SELECT * FROM mata_pelajaran ORDER BY kategori ASC, nama_mapel ASC";
        const [rows] = await db.query(sql);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET SINGLE
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM mata_pelajaran WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Mapel tidak ditemukan' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. POST (Tambah)
router.post('/', async (req, res) => {
    try {
        const { kode_mapel, nama_mapel, kategori, keterangan } = req.body;

        if (!kode_mapel || !nama_mapel) {
            return res.status(400).json({ success: false, message: 'Kode dan Nama Mapel wajib diisi!' });
        }

        // Cek duplikat Kode
        const [cek] = await db.query("SELECT id FROM mata_pelajaran WHERE kode_mapel = ?", [kode_mapel]);
        if (cek.length > 0) return res.status(400).json({ success: false, message: 'Kode Mapel sudah ada!' });

        const sql = "INSERT INTO mata_pelajaran (kode_mapel, nama_mapel, kategori, keterangan) VALUES (?, ?, ?, ?)";
        const [result] = await db.execute(sql, [kode_mapel, nama_mapel, kategori || 'Umum', keterangan]);

        res.json({ success: true, message: 'Mapel berhasil ditambahkan', id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. PUT (Edit)
router.put('/:id', async (req, res) => {
    try {
        const { kode_mapel, nama_mapel, kategori, keterangan } = req.body;
        const { id } = req.params;

        const sql = "UPDATE mata_pelajaran SET kode_mapel=?, nama_mapel=?, kategori=?, keterangan=? WHERE id=?";
        await db.query(sql, [kode_mapel, nama_mapel, kategori, keterangan, id]);

        res.json({ success: true, message: 'Mapel berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. DELETE
router.delete('/:id', async (req, res) => {
    try {
        await db.query("DELETE FROM mata_pelajaran WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Mapel berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;