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
    date: dateFormatted,
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

      const categories = {
        students: data.filter((d) => d.category?.toLowerCase().includes('student')).length,
        workingProfessionals: data.filter((d) => d.category?.toLowerCase().includes('professional')).length,
        founders: data.filter((d) => d.category?.toLowerCase().includes('founder')).length,
        researchers: data.filter((d) => d.category?.toLowerCase().includes('research')).length,
        startups: data.filter((d) => d.category?.toLowerCase().includes('startup') && !d.category?.toLowerCase().includes('founder')).length,
        developers: data.filter((d) => d.category?.toLowerCase().includes('developer')).length,
        others: data.filter((d) => {
          const c = (d.category || '').toLowerCase();
          return !c || (!c.includes('student') && !c.includes('professional') && !c.includes('founder') && !c.includes('research') && !c.includes('startup') && !c.includes('developer'));
        }).length
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

// POST /api/registrations - Add or update single participant registration
router.post('/', async (req, res) => {
  const {
    name,
    fullName,
    email,
    phone,
    category,
    organization,
    designation,
    department,
    dietaryPreference,
    diet,
    areasOfInterest,
    interests,
    notes,
    extra,
    status
  } = req.body;

  const resolvedName = (name || fullName || '').trim();
  const resolvedEmail = (email || '').trim().toLowerCase();

  if (!resolvedName || !resolvedEmail) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // Check if attendee with same email already exists
      const { data: existing } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('email', resolvedEmail)
        .limit(1);

      const existingRecord = existing && existing.length > 0 ? existing[0] : null;

      const payload = {
        full_name: resolvedName,
        email: resolvedEmail,
        phone: (phone && phone.trim()) ? phone.trim() : (existingRecord?.phone || ''),
        category: category || existingRecord?.category || 'Student',
        organization: (organization && organization.trim()) ? organization.trim() : (existingRecord?.organization || 'Alliance University'),
        designation: (designation && designation.trim()) ? designation.trim() : (existingRecord?.designation || 'Participant'),
        department: (department && department.trim()) ? department.trim() : (existingRecord?.department || null),
        dietary_preference: dietaryPreference || diet || existingRecord?.dietary_preference || null,
        areas_of_interest: Array.isArray(areasOfInterest) ? areasOfInterest : (Array.isArray(interests) ? interests : (existingRecord?.areas_of_interest || null)),
        additional_info: notes || extra || existingRecord?.additional_info || null,
        status: existingRecord?.status === 'Checked In' ? 'Checked In' : (status || 'Registered')
      };

      let data, error;
      if (existingRecord) {
        const updateRes = await supabaseAdmin
          .from('registrations')
          .update(payload)
          .eq('id', existingRecord.id)
          .select()
          .single();
        data = updateRes.data;
        error = updateRes.error;
      } else {
        const insertRes = await supabaseAdmin
          .from('registrations')
          .insert({
            ...payload,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
        data = insertRes.data;
        error = insertRes.error;
      }

      if (error) throw error;

      return res.status(201).json({
        message: existing?.length ? 'Registration details updated' : 'Registration successful',
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

// PATCH /api/registrations/:id - Update participant details
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
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
    notes,
    status
  } = req.body;

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const updateData = {};
      if (name !== undefined) updateData.full_name = name.trim();
      if (email !== undefined) updateData.email = email.trim().toLowerCase();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (category !== undefined) updateData.category = category;
      if (organization !== undefined) updateData.organization = organization;
      if (designation !== undefined) updateData.designation = designation;
      if (department !== undefined) updateData.department = department;
      if (dietaryPreference !== undefined) updateData.dietary_preference = dietaryPreference;
      if (areasOfInterest !== undefined) updateData.areas_of_interest = areasOfInterest;
      if (notes !== undefined) updateData.additional_info = notes;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'Checked In') {
          updateData.checked_in_at = new Date().toISOString();
        } else if (status === 'Registered') {
          updateData.checked_in_at = null;
        }
      }

      const { data, error } = await supabaseAdmin
        .from('registrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        message: 'Registration updated successfully',
        attendee: formatAttendee(data)
      });
    } catch (err) {
      console.error('Update registration error:', err);
      return res.status(500).json({ error: err.message || 'Failed to update registration' });
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
