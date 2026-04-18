import express from 'express';
import cors from 'cors';
import {
  insertSession,
  getSessions,
  getSessionCount,
  getDailyStats,
  getAggregateStats,
  getAllSessionsForExport
} from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// POST /api/sessions - Log completed session
app.post('/api/sessions', (req, res) => {
  try {
    const { mode, duration_seconds, started_at, completed_at, completed } = req.body;
    
    if (!mode || !duration_seconds || !started_at) {
      return res.status(400).json({ success: false, error: 'Missing required fields: mode, duration_seconds, started_at' });
    }

    const id = insertSession(mode, duration_seconds, started_at, completed_at, completed);
    res.json({ success: true, data: { id } });
  } catch (err) {
    console.error('Error inserting session:', err);
    res.status(500).json({ success: false, error: 'Failed to save session' });
  }
});

// GET /api/sessions - Paginated history
app.get('/api/sessions', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ success: false, error: 'Limit must be between 1 and 100' });
    }

    const sessions = getSessions(limit, offset);
    const total = getSessionCount();
    
    res.json({ success: true, data: { sessions, total } });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// GET /api/stats - Aggregated productivity stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = getAggregateStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// GET /api/stats/daily - Daily breakdown for charts
app.get('/api/stats/daily', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    
    if (days < 1 || days > 365) {
      return res.status(400).json({ success: false, error: 'Days must be between 1 and 365' });
    }

    const stats = getDailyStats(days);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching daily stats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch daily stats' });
  }
});

// GET /api/export/csv - Download session data
app.get('/api/export/csv', (req, res) => {
  try {
    const sessions = getAllSessionsForExport();
    
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ success: false, error: 'No session data to export' });
    }

    const headers = ['id', 'mode', 'duration_seconds', 'started_at', 'completed_at', 'completed', 'created_at'];
    const csvRows = [headers.join(',')];
    
    sessions.forEach(row => {
      const values = headers.map(header => {
        let val = row[header];
        if (typeof val === 'number' && header === 'completed') {
          val = val === 1 ? 'true' : 'false';
        }
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    });
    
    const csvString = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="zenpomodoro_sessions.csv"');
    res.send(csvString);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    res.status(500).json({ success: false, error: 'Failed to export data' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`ZenPomodoro server running on http://localhost:${PORT}`);
});