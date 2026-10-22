import express from 'express';
import { isSupabaseConfigured, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const formatAttendee = (row) => {
  const d = new Date(row.created_at || Date.now());
  const dateFormatted = `${d.getDate()} Oct, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  let checkInFormatted = null;
  if (row.checked_in_at) {
    const cd = new Date(row.checked_in_at);
    checkInFormatted = `${cd.getDate()} Oct, ${cd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return {
    id: row.id,
    name: row.full_name || 'Participant',
    email: row.email,
    phone: row.phone || '',
    category: row.category || 'Student',
    organization: row.organization || 'Alliance University',
    designation: row.designation || 'Participant',
    department: row.department || '',
    dietaryPreference: row.dietary_preference || 'No preference',
    areasOfInterest: row.areas_of_interest || [],
    notes: row.additional_info || '',
    status: row.status || 'Registered',
    registeredAt: dateFormatted,
    checkedInAt: checkInFormatted
  };
};

// GET /api/registrations/stats - KPI summary
router.get('/stats', async (req, res) => {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.from('registrations').select('*');
      if (error) throw error;

      const total = data.length;
      const checkedIn = data.filter((d) => d.status === 'Checked In').length;
      const yetToArrive = Math.max(0, total - checkedIn);

      // Compute category breakdown
      const categories = {
        students: data.filter((d) => d.category?.toLowerCase() === 'student').length,
        workingProfessionals: data.filter((d) => d.category?.toLowerCase().includes('professional')).length,
        founders: data.filter((d) => d.category?.toLowerCase() === 'founder').length,
        researchers: data.filter((d) => d.category?.toLowerCase() === 'researcher').length,
        startups: data.filter((d) => d.category?.toLowerCase() === 'startup').length,
        developers: data.filter((d) => d.category?.toLowerCase() === 'developer').length,
        others: data.filter((d) => d.category?.toLowerCase() === 'other' || !d.category).length
      };

      return res.json({
        totalRegistrations: total,
        checkedIn,
        yetToArrive,
        teamRegistrations: Math.round(total * 0.25),
        categories
      });
    } catch (err) {
      console.error('Stats query error:', err);
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// GET /api/registrations - List with search & filters
router.get('/', async (req, res) => {
  const { q, category, status, limit, offset } = req.query;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      let query = supabaseAdmin.from('registrations').select('*').order('created_at', { ascending: false });

      if (category && category !== 'All Categories') {
        query = query.eq('category', category);
      }

      if (status && status !== 'All Status') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data.map(formatAttendee);

      if (q) {
        const search = q.toLowerCase().trim();
        results = results.filter((a) =>
          [a.name, a.email, a.phone, a.organization, a.category, a.id]
            .filter(Boolean)
            .some((val) => String(val).toLowerCase().includes(search))
        );
      }

      const total = results.length;
      const start = parseInt(offset, 10) || 0;
      const count = parseInt(limit, 10) || 100;
      const paged = results.slice(start, start + count);

      return res.json({
        total,
        attendees: paged
      });
    } catch (err) {
      console.error('Registrations fetch error:', err);
      return res.status(500).json({ error: 'Failed to fetch registrations from database' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// POST /api/registrations - Add single participant
router.post('/', async (req, res) => {
  const {
    name,
    email,
    phone,
    category,
    organization,
    designation,
    department,
    dietaryPreference,
    areasOfInterest,
    notes
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const payload = {
        full_name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        category: category || 'Student',
        organization: organization || 'Alliance University',
        designation: designation || 'Participant',
        department: department || null,
        dietary_preference: dietaryPreference || null,
        areas_of_interest: Array.isArray(areasOfInterest) ? areasOfInterest : null,
        additional_info: notes || null,
        status: 'Registered'
      };

      const { data, error } = await supabaseAdmin
        .from('registrations')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        message: 'Registration successful',
        attendee: formatAttendee(data)
      });
    } catch (err) {
      console.error('Registration insert error:', err);
      return res.status(500).json({ error: err.message || 'Failed to create registration' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// POST /api/registrations/batch - Import CSV rows
router.post('/batch', async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Rows array is required' });
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const payloads = rows
        .filter((r) => r.name && r.email)
        .map((r) => ({
          full_name: r.name.trim(),
          email: r.email.trim().toLowerCase(),
          phone: r.phone || null,
          category: r.category || 'Other',
          organization: r.organization || 'Independent',
          designation: r.designation || 'Participant',
          status: r.status === 'Checked In' ? 'Checked In' : 'Registered',
          checked_in_at: r.status === 'Checked In' ? new Date().toISOString() : null
        }));

      const { data, error } = await supabaseAdmin
        .from('registrations')
        .insert(payloads)
        .select();

      if (error) throw error;

      return res.json({
        message: `Successfully imported ${data.length} participants into database`,
        count: data.length
      });
    } catch (err) {
      console.error('Batch import error:', err);
      return res.status(500).json({ error: 'Batch import failed' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// PATCH /api/registrations/:id/checkin - Toggle or set check-in
router.patch('/:id/checkin', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // First get current status
      const { data: existing, error: findErr } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('id', id)
        .single();

      if (findErr || !existing) {
        return res.status(404).json({ error: 'Attendee not found' });
      }

      let nextStatus = status;
      if (!nextStatus) {
        nextStatus = existing.status === 'Checked In' ? 'Registered' : 'Checked In';
      }

      const checkedInAt = nextStatus === 'Checked In' ? new Date().toISOString() : null;

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('registrations')
        .update({
          status: nextStatus,
          checked_in_at: checkedInAt
        })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      return res.json({
        message: `Attendee ${updated.full_name} marked as ${updated.status}`,
        attendee: formatAttendee(updated)
      });
    } catch (err) {
      console.error('Checkin update error:', err);
      return res.status(500).json({ error: 'Failed to update check-in status' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

// DELETE /api/registrations/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({ message: 'Attendee deleted', attendee: formatAttendee(data) });
    } catch (err) {
      console.error('Delete registration error:', err);
      return res.status(500).json({ error: 'Failed to delete registration' });
    }
  }

  res.status(503).json({ error: 'Database service unavailable' });
});

export default router;
