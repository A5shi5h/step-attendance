const router = require('express').Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// POST /api/attendance — teacher marks attendance (public)
router.post('/', async (req, res) => {
  const { teacher_id, session_id } = req.body;
  if (!teacher_id || !session_id) {
    return res.status(400).json({ error: 'teacher_id and session_id are required' });
  }
  try {
    // Verify session is active
    const sessResult = await pool.query(
      `SELECT * FROM sessions WHERE id=$1 AND status='Active'`, [session_id]
    );
    if (!sessResult.rows[0]) {
      return res.status(400).json({ error: 'Session is not active' });
    }
    // Insert attendance
    const result = await pool.query(
      `INSERT INTO attendance (teacher_id, session_id, status, timestamp)
       VALUES ($1, $2, 'Present', NOW()) RETURNING *`,
      [teacher_id, session_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Attendance already submitted for this session' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance — all records (admin)
router.get('/', auth, async (req, res) => {
  try {
    const { session_id, day, search } = req.query;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (session_id) {
      conditions.push(`a.session_id = $${idx++}`);
      params.push(session_id);
    }
    if (day) {
      conditions.push(`s.day_number = $${idx++}`);
      params.push(day);
    }
    if (search) {
      conditions.push(`(t.roll_number ILIKE $${idx} OR t.full_name ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT a.id, t.roll_number, t.full_name, t.school_name, t.phone_number,
              s.day_number, s.session_number, s.session_topic,
              a.status, a.timestamp, a.session_id, a.teacher_id
       FROM attendance a
       JOIN teachers t ON t.id = a.teacher_id
       JOIN sessions s ON s.id = a.session_id
       ${where}
       ORDER BY a.timestamp DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/attendance/:id/status — admin changes status
router.put('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Present', 'Late', 'Absent'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Present, Late, or Absent' });
  }
  try {
    const current = await pool.query('SELECT status FROM attendance WHERE id=$1', [req.params.id]);
    if (!current.rows[0]) return res.status(404).json({ error: 'Attendance record not found' });

    const result = await pool.query(
      `UPDATE attendance SET status=$1 WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    // Log the change
    await pool.query(
      `INSERT INTO attendance_log (attendance_id, old_status, new_status, changed_by, changed_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [req.params.id, current.rows[0].status, status, req.admin.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/attendance/:id — admin deletes one record
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM attendance WHERE id=$1 RETURNING id`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance/analytics — dashboard stats (admin)
router.get('/analytics', auth, async (req, res) => {
  try {
    const totalTeachers = await pool.query('SELECT COUNT(*) FROM teachers');
    const activeSession = await pool.query(`SELECT * FROM sessions WHERE status='Active' LIMIT 1`);
    const submitted = await pool.query(`SELECT COUNT(*) FROM attendance WHERE session_id = (SELECT id FROM sessions WHERE status='Active' LIMIT 1)`);
    const totalSessions = await pool.query(`SELECT COUNT(*) FROM sessions WHERE status != 'Pending' OR status = 'Active'`);

    const teachers = parseInt(totalTeachers.rows[0].count);
    const submittedCount = parseInt(submitted.rows[0].count);
    const pending = teachers - submittedCount;
    const pct = teachers > 0 ? Math.round((submittedCount / teachers) * 100) : 0;

    res.json({
      total_teachers: teachers,
      active_session: activeSession.rows[0] || null,
      attendance_submitted: submittedCount,
      attendance_pending: pending,
      attendance_percentage: pct,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance/eligibility — certificate eligibility (admin)
router.get('/eligibility', auth, async (req, res) => {
  try {
    const totalSessions = await pool.query(`SELECT COUNT(*) FROM sessions`);
    const total = parseInt(totalSessions.rows[0].count);

    const result = await pool.query(
      `SELECT t.id, t.roll_number, t.full_name, t.school_name, t.phone_number,
              COUNT(a.id) AS attended_sessions,
              ROUND(COUNT(a.id)::numeric / $1 * 100, 1) AS attendance_percentage,
              CASE WHEN COUNT(a.id)::numeric / $1 * 100 >= 75 THEN true ELSE false END AS eligible
       FROM teachers t
       LEFT JOIN attendance a ON a.teacher_id = t.id AND a.status != 'Absent'
       GROUP BY t.id
       ORDER BY attendance_percentage DESC`,
      [total]
    );
    res.json({ total_sessions: total, teachers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/attendance/export — Excel export (admin)
router.get('/export', auth, async (req, res) => {
  const ExcelJS = require('exceljs');
  try {
    const result = await pool.query(
      `SELECT t.roll_number, t.full_name, t.phone_number, t.school_name,
              s.day_number, s.session_number, s.session_topic,
              a.status, a.timestamp
       FROM attendance a
       JOIN teachers t ON t.id = a.teacher_id
       JOIN sessions s ON s.id = a.session_id
       ORDER BY t.roll_number, s.day_number, s.session_number`
    );

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Attendance Records');
    ws.columns = [
      { header: 'Roll Number', key: 'roll_number', width: 15 },
      { header: 'Teacher Name', key: 'full_name', width: 30 },
      { header: 'Phone Number', key: 'phone_number', width: 15 },
      { header: 'School Name', key: 'school_name', width: 35 },
      { header: 'Day', key: 'day_number', width: 8 },
      { header: 'Session', key: 'session_number', width: 10 },
      { header: 'Session Topic', key: 'session_topic', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Timestamp', key: 'timestamp', width: 22 },
    ];
    ws.getRow(1).font = { bold: true };
    result.rows.forEach(r => ws.addRow({
      ...r,
      timestamp: r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN') : '',
    }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_records.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// GET /api/attendance/export/eligibility — Eligibility Excel export (admin)
router.get('/export/eligibility', auth, async (req, res) => {
  const ExcelJS = require('exceljs');
  try {
    const totalSessions = await pool.query('SELECT COUNT(*) FROM sessions');
    const total = parseInt(totalSessions.rows[0].count);

    const result = await pool.query(
      `SELECT t.roll_number, t.full_name, t.phone_number, t.school_name,
              COUNT(a.id) AS attended_sessions,
              ROUND(COUNT(a.id)::numeric / $1 * 100, 1) AS attendance_percentage,
              CASE WHEN COUNT(a.id)::numeric / $1 * 100 >= 75 THEN 'Eligible' ELSE 'Not Eligible' END AS eligible
       FROM teachers t
       LEFT JOIN attendance a ON a.teacher_id = t.id AND a.status != 'Absent'
       GROUP BY t.id
       ORDER BY attendance_percentage DESC`,
      [total]
    );

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Certificate Eligibility');
    ws.columns = [
      { header: 'Roll Number', key: 'roll_number', width: 15 },
      { header: 'Teacher Name', key: 'full_name', width: 30 },
      { header: 'Phone Number', key: 'phone_number', width: 15 },
      { header: 'School Name', key: 'school_name', width: 35 },
      { header: 'Sessions Attended', key: 'attended_sessions', width: 18 },
      { header: 'Attendance %', key: 'attendance_percentage', width: 15 },
      { header: 'Certificate Eligible', key: 'eligible', width: 18 },
    ];
    ws.getRow(1).font = { bold: true };
    result.rows.forEach(r => ws.addRow(r));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="certificate_eligibility.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
