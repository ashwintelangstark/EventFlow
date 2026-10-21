import express from 'express';
import { mockStore } from '../data/mockStore.js';

const router = express.Router();

// GET /api/announcements
router.get('/', (req, res) => {
  const { q, type, status } = req.query;
  let items = [...mockStore.announcements];

  if (q) {
    const search = q.toLowerCase();
    items = items.filter(
      (a) => a.title.toLowerCase().includes(search) || a.message.toLowerCase().includes(search)
    );
  }

  if (type && type !== 'All Categories') {
    items = items.filter((a) => a.type.toLowerCase() === type.toLowerCase());
  }

  if (status && status !== 'All Status') {
    items = items.filter((a) => a.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    total: items.length,
    announcements: items
  });
});

// POST /api/announcements
router.post('/', (req, res) => {
  const { title, message, type, date, status } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const now = new Date();
  const dateFormatted = date || `24 Oct, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newAnnouncement = {
    id: `ann_${Date.now()}`,
    title,
    message,
    type: type || 'General',
    status: status || 'Published',
    date: dateFormatted
  };

  mockStore.announcements.unshift(newAnnouncement);

  res.status(201).json({
    message: 'Announcement published successfully',
    announcement: newAnnouncement
  });
});

// PATCH /api/announcements/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { title, message, type, date, status } = req.body;
  const announcement = mockStore.announcements.find((a) => String(a.id) === String(id));
  if (!announcement) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  if (title) announcement.title = title;
  if (message) announcement.message = message;
  if (type) announcement.type = type;
  if (date) announcement.date = date;
  if (status) announcement.status = status;

  res.json({ message: 'Announcement updated successfully', announcement });
});

// DELETE /api/announcements/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = mockStore.announcements.findIndex((a) => String(a.id) === String(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  const deleted = mockStore.announcements.splice(index, 1);
  res.json({ message: 'Announcement deleted', announcement: deleted[0] });
});

export default router;
