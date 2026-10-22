import express from 'express';
import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const formatAnnouncement = (row) => {
  const d = new Date(row.scheduled_at || row.created_at || Date.now());
  const dateFormatted = `${d.getDate()} Oct, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type || 'General',
    status: row.status || 'Published',
    date: dateFormatted,
    createdAt: row.created_at
  };
};

// GET /api/announcements
router.get('/', async (req, res) => {
  const { q, type, status } = req.query;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      let query = supabaseAdmin
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (type && type !== 'All Categories') {
        query = query.eq('type', type);
      }

      if (status && status !== 'All Status') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      let items = data.map(formatAnnouncement);

      if (q) {
        const search = q.toLowerCase();
        items = items.filter(
          (a) => a.title.toLowerCase().includes(search) || a.message.toLowerCase().includes(search)
        );
      }

      return res.json({
        total: items.length,
        announcements: items
      });
    } catch (err) {
      console.error('Announcements fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch announcements from database' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// POST /api/announcements
router.post('/', async (req, res) => {
  const { title, message, type, date, status } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        type: type || 'General',
        status: status || 'Published',
        scheduled_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        message: 'Announcement published successfully',
        announcement: formatAnnouncement(data)
      });
    } catch (err) {
      console.error('Announcements insert error:', err);
      return res.status(500).json({ error: 'Failed to publish announcement' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// PATCH /api/announcements/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, message, type, status } = req.body;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const updatePayload = {};
      if (title) updatePayload.title = title.trim();
      if (message) updatePayload.message = message.trim();
      if (type) updatePayload.type = type;
      if (status) updatePayload.status = status;

      const { data, error } = await supabaseAdmin
        .from('announcements')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        message: 'Announcement updated successfully',
        announcement: formatAnnouncement(data)
      });
    } catch (err) {
      console.error('Announcements update error:', err);
      return res.status(500).json({ error: 'Failed to update announcement' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('announcements')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        message: 'Announcement deleted',
        announcement: formatAnnouncement(data)
      });
    } catch (err) {
      console.error('Announcements delete error:', err);
      return res.status(500).json({ error: 'Failed to delete announcement' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

export default router;
