import express from 'express';
import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const parseTime = (timeStr) => {
  if (!timeStr) return { start: 'TBD', end: 'TBD' };
  const parts = timeStr.split(/[-–—]/).map((s) => s.trim());
  return {
    start: parts[0] || 'TBD',
    end: parts[1] || parts[0] || 'TBD'
  };
};

const formatSession = (row) => ({
  id: row.id,
  stage: row.sequence_number || row.id,
  title: row.title,
  time: row.start_time && row.end_time ? `${row.start_time} – ${row.end_time}` : (row.start_time || 'TBD'),
  startTime: row.start_time,
  endTime: row.end_time,
  description: row.description || '',
  activities: Array.isArray(row.key_activities) ? row.key_activities : []
});

const STATIC_METADATA = {
  theme: "IDEA → AI → IMPACT",
  tagline: "A HALF-DAY, HANDS-ON INNOVATION LAB BY AU-QUASAR, ALLIANCE UNIVERSITY",
  date: "Sat, 24 Oct 2026",
  time: "10:00 AM – 1:00 PM",
  venue: "AU-QUASAR, Alliance University, Bengaluru",
  organizations: [
    { name: "Alliance University", count: 74, role: "Academic Host" },
    { name: "Infosys", count: 26, role: "Corporate Partner" },
    { name: "TechNova", count: 18, role: "Startup Accelerator" },
    { name: "IISc Bengaluru", count: 14, role: "Research Partner" },
    { name: "DataDice Technologies", count: 12, role: "Ecosystem Partner" }
  ],
  resources: [
    { name: "Event Schedule (PDF)", link: "#schedule", type: "pdf", size: "1.2 MB" },
    { name: "Campus & Venue Map", link: "#venue-map", type: "map", size: "3.4 MB" },
    { name: "Code of Conduct & Safety", link: "#conduct", type: "doc", size: "450 KB" },
    { name: "Participant FAQs & Guidelines", link: "#faqs", type: "faq", size: "280 KB" }
  ]
};

// GET /api/eventflow
router.get('/', async (req, res) => {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('event_sessions')
        .select('*')
        .order('sequence_number', { ascending: true });

      if (error) throw error;

      return res.json({
        ...STATIC_METADATA,
        stages: data.map(formatSession)
      });
    } catch (err) {
      console.error('Event sessions fetch error:', err);
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// POST /api/eventflow (Admin only)
router.post('/', async (req, res) => {
  const { title, time, description, activities } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // Get current max sequence_number
      const { data: existing } = await supabaseAdmin
        .from('event_sessions')
        .select('sequence_number')
        .order('sequence_number', { ascending: false })
        .limit(1);

      const nextSeq = (existing?.[0]?.sequence_number || 0) + 1;
      const { start, end } = parseTime(time);

      const payload = {
        sequence_number: nextSeq,
        title: title.trim(),
        start_time: start,
        end_time: end,
        description: description || '',
        key_activities: Array.isArray(activities)
          ? activities
          : (typeof activities === 'string' ? activities.split('\n').filter(Boolean) : [])
      };

      const { data, error } = await supabaseAdmin
        .from('event_sessions')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        message: 'Event stage added successfully',
        stage: formatSession(data)
      });
    } catch (err) {
      console.error('Add event stage error:', err);
      return res.status(500).json({ error: 'Failed to add event session' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// PATCH /api/eventflow/:stage (Admin only)
router.patch('/:stage', async (req, res) => {
  const stageNum = parseInt(req.params.stage, 10);
  const { title, time, description, activities } = req.body;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const updatePayload = {};
      if (title) updatePayload.title = title.trim();
      if (time) {
        const { start, end } = parseTime(time);
        updatePayload.start_time = start;
        updatePayload.end_time = end;
      }
      if (description !== undefined) updatePayload.description = description;
      if (activities !== undefined) {
        updatePayload.key_activities = Array.isArray(activities)
          ? activities
          : (typeof activities === 'string' ? activities.split('\n').filter(Boolean) : []);
      }

      const { data, error } = await supabaseAdmin
        .from('event_sessions')
        .update(updatePayload)
        .eq('sequence_number', stageNum)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        message: 'Stage updated successfully',
        stage: formatSession(data)
      });
    } catch (err) {
      console.error('Update event stage error:', err);
      return res.status(500).json({ error: 'Failed to update event session' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// DELETE /api/eventflow/:stage (Admin only)
router.delete('/:stage', async (req, res) => {
  const stageNum = parseInt(req.params.stage, 10);

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('event_sessions')
        .delete()
        .eq('sequence_number', stageNum)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        message: 'Stage deleted successfully',
        stage: formatSession(data)
      });
    } catch (err) {
      console.error('Delete event stage error:', err);
      return res.status(500).json({ error: 'Failed to delete event session' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

export default router;
