const router = require('express').Router();
const { pool } = require('../db');
const auth = require('../middleware/auth');

// GET /api/sessions — all sessions
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sessions ORDER BY day_number, session_number`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sessions/active — active session (public)
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sessions WHERE status = 'Active' LIMIT 1`
    );
    if (!result.rows[0]) return res.json({ session: null });
    res.json({ session: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sessions/:id/activate (admin)
router.put('/:id/activate', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query(
      `SELECT * FROM sessions WHERE id=$1 LIMIT 1`,
      [req.params.id]
    );
    const session = existing.rows[0];
    if (!session) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.status === 'Active') {
      await client.query('ROLLBACK');
      return res.json(session);
    }
    // Close any currently active session
    await client.query(
      `UPDATE sessions SET status='Closed', closed_at=NOW() WHERE status='Active' AND id <> $1`,
      [req.params.id]
    );
    // Activate the requested session
    const result = await client.query(
      `UPDATE sessions
       SET status='Active', activated_at=NOW(), closed_at=NULL
       WHERE id=$1 AND status IN ('Pending', 'Closed')
       RETURNING *`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Session cannot be activated' });
    }
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// PUT /api/sessions/:id/close (admin)
router.put('/:id/close', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE sessions SET status='Closed', closed_at=NOW() WHERE id=$1 AND status='Active' RETURNING *`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(400).json({ error: 'Session not found or not active' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sessions/:id/topic (admin)
router.put('/:id/topic', auth, async (req, res) => {
  const { session_topic } = req.body;
  try {
    const result = await pool.query(
      `UPDATE sessions SET session_topic=$1 WHERE id=$2 RETURNING *`,
      [session_topic || '', req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Session not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
