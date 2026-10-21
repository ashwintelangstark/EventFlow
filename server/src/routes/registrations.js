import express from 'express';
import { mockStore } from '../data/mockStore.js';
import { isSupabaseConfigured, supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/registrations/stats - KPI summary
router.get('/stats', async (req, res) => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('registrations').select('*');
    if (!error && data) {
      const total = data.length;
      const checkedIn = data.filter((d) => d.status === 'Checked In').length;
      return res.json({
        totalRegistrations: total,
        checkedIn,
        yetToArrive: Math.max(0, total - checkedIn),
        teamRegistrations: 28
      });
    }
  }

  // Calculate live from mock attendees
  const attendees = mockStore.attendees;
  const checkedInCount = attendees.filter((a) => a.status === 'Checked In').length;
  // Baseline wireframe values: 186 total, 124 checked in, 62 yet to arrive
  const dynamicTotal = 186 + (attendees.length - 10);
  const dynamicCheckedIn = 124 + (checkedInCount - 5);
  const dynamicYetToArrive = Math.max(0, dynamicTotal - dynamicCheckedIn);

  res.json({
    totalRegistrations: dynamicTotal,
    checkedIn: dynamicCheckedIn,
    yetToArrive: dynamicYetToArrive,
    teamRegistrations: 28,
    categories: {
      students: 78,
      workingProfessionals: 26,
      founders: 18,
      researchers: 14,
      startups: 12,
      developers: 8,
      others: 4
    }
  });
});

// GET /api/registrations - List with search & filters
router.get('/', (req, res) => {
  const { q, category, status, limit, offset } = req.query;
  let results = [...mockStore.attendees];

  if (q) {
    const search = q.toLowerCase().trim();
    results = results.filter((a) =>
      [a.name, a.email, a.phone, a.organization, a.category, a.id]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(search))
    );
  }

  if (category && category !== 'All Categories') {
    results = results.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }

  if (status && status !== 'All Status') {
    results = results.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  }

  const total = results.length;
  const start = parseInt(offset, 10) || 0;
  const count = parseInt(limit, 10) || 50;
  const paged = results.slice(start, start + count);

  res.json({
    total,
    attendees: paged
  });
});

// POST /api/registrations - Add single participant
router.post('/', (req, res) => {
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

  const newId = `AU2026-${String(mockStore.attendees.length + 1).padStart(3, '0')}`;
  const now = new Date();
  const dateFormatted = `${now.getDate()} Oct, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newAttendee = {
    id: newId,
    name,
    email,
    phone: phone || '+91 90000 00000',
    category: category || 'Student',
    organization: organization || 'Alliance University',
    designation: designation || 'Participant',
    department: department || 'General',
    dietaryPreference: dietaryPreference || 'No preference',
    areasOfInterest: areasOfInterest || [],
    notes: notes || '',
    status: 'Registered',
    registeredAt: dateFormatted,
    checkedInAt: null
  };

  mockStore.attendees.unshift(newAttendee);

  res.status(201).json({
    message: 'Registration successful',
    attendee: newAttendee
  });
});

// POST /api/registrations/batch - Import CSV rows
router.post('/batch', (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Rows array is required' });
  }

  const added = [];
  rows.forEach((r, idx) => {
    if (r.name && r.email) {
      const newId = `AU2026-${String(mockStore.attendees.length + 1).padStart(3, '0')}`;
      const attendee = {
        id: newId,
        name: r.name,
        email: r.email,
        phone: r.phone || '+91 90000 00000',
        category: r.category || 'Other',
        organization: r.organization || 'Independent',
        status: r.status || 'Registered',
        registeredAt: r.registeredAt || '24 Oct, 09:45 AM',
        checkedInAt: r.status === 'Checked In' ? '24 Oct, 09:45 AM' : null
      };
      mockStore.attendees.push(attendee);
      added.push(attendee);
    }
  });

  res.json({
    message: `Successfully imported ${added.length} participants`,
    count: added.length
  });
});

// PATCH /api/registrations/:id/checkin - Toggle or set check-in
router.patch('/:id/checkin', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const attendee = mockStore.attendees.find(
    (a) => a.id.toLowerCase() === id.toLowerCase() || a.email.toLowerCase() === id.toLowerCase()
  );

  if (!attendee) {
    return res.status(404).json({ error: 'Attendee not found' });
  }

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (status) {
    attendee.status = status;
    attendee.checkedInAt = status === 'Checked In' ? `24 Oct, ${timeFormatted}` : null;
  } else {
    // Toggle
    if (attendee.status === 'Checked In') {
      attendee.status = 'Registered';
      attendee.checkedInAt = null;
    } else {
      attendee.status = 'Checked In';
      attendee.checkedInAt = `24 Oct, ${timeFormatted}`;
    }
  }

  res.json({
    message: `Attendee ${attendee.name} marked as ${attendee.status}`,
    attendee
  });
});

// DELETE /api/registrations/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = mockStore.attendees.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Attendee not found' });
  }
  const deleted = mockStore.attendees.splice(index, 1);
  res.json({ message: 'Attendee deleted', attendee: deleted[0] });
});

export default router;
