const router = require('express').Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/teachers — list all (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { search = '' } = req.query;
    const q = `%${search}%`;
    const result = await pool.query(
      `SELECT id, roll_number, full_name, phone_number, school_name, created_at
       FROM teachers
       WHERE roll_number ILIKE $1 OR full_name ILIKE $1 OR school_name ILIKE $1
       ORDER BY roll_number ASC`,
      [q]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teachers/:roll — lookup by roll number (public, for attendance page)
router.get('/roll/:roll', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, roll_number, full_name, phone_number, school_name FROM teachers WHERE roll_number = $1`,
      [req.params.roll.toUpperCase()]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Teacher not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers — add single teacher (admin)
router.post('/', auth, async (req, res) => {
  const { roll_number, full_name, phone_number, school_name } = req.body;
  if (!roll_number || !full_name || !phone_number || !school_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO teachers (roll_number, full_name, phone_number, school_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [roll_number.toUpperCase(), full_name.trim(), phone_number.trim(), school_name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Roll number already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/teachers/:id — edit teacher (admin)
router.put('/:id', auth, async (req, res) => {
  const { roll_number, full_name, phone_number, school_name } = req.body;
  if (!roll_number || !full_name || !phone_number || !school_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      `UPDATE teachers SET roll_number=$1, full_name=$2, phone_number=$3, school_name=$4
       WHERE id=$5 RETURNING *`,
      [roll_number.toUpperCase(), full_name.trim(), phone_number.trim(), school_name.trim(), req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Teacher not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Roll number already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/teachers/:id (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM teachers WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teachers/upload — Excel bulk import (admin)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(req.file.buffer);
    const ws = workbook.worksheets[0];
    if (!ws) return res.status(400).json({ error: 'No worksheet found in file' });

    const rows = [];
    const errors = [];
    const seen = new Set();

    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // skip header
      const [, roll, name, phone, school] = row.values;
      const r = String(roll || '').trim().toUpperCase();
      const n = String(name || '').trim();
      const p = String(phone || '').trim();
      const s = String(school || '').trim();

      if (!r || !n || !p || !s) {
        errors.push(`Row ${rowNum}: Missing required fields`);
        return;
      }
      if (seen.has(r)) {
        errors.push(`Row ${rowNum}: Duplicate roll number ${r} in file`);
        return;
      }
      seen.add(r);
      rows.push([r, n, p, s]);
    });

    if (rows.length === 0 && errors.length > 0) {
      return res.status(400).json({ error: 'No valid rows found', errors });
    }

    let inserted = 0, skipped = 0;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [r, n, p, s] of rows) {
        try {
          await client.query(
            `INSERT INTO teachers (roll_number, full_name, phone_number, school_name)
             VALUES ($1,$2,$3,$4) ON CONFLICT (roll_number) DO NOTHING`,
            [r, n, p, s]
          );
          inserted++;
        } catch {
          skipped++;
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ message: `Import complete`, inserted, skipped, errors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

module.exports = router;
