import express from 'express';
import { mockStore } from '../data/mockStore.js';

const router = express.Router();

// GET /api/eventflow
router.get('/', (req, res) => {
  res.json({
    theme: "IDEA → AI → IMPACT",
    tagline: "A HALF-DAY, HANDS-ON INNOVATION LAB BY AU-QUASAR, ALLIANCE UNIVERSITY",
    date: "Sat, 24 Oct 2026",
    time: "10:00 AM – 1:00 PM",
    venue: "AU-QUASAR, Alliance University, Bengaluru",
    stages: mockStore.eventFlow,
    organizations: mockStore.organizations,
    resources: [
      { name: "Event Schedule (PDF)", link: "#schedule", type: "pdf", size: "1.2 MB" },
      { name: "Campus & Venue Map", link: "#venue-map", type: "map", size: "3.4 MB" },
      { name: "Code of Conduct & Safety", link: "#conduct", type: "doc", size: "450 KB" },
      { name: "Participant FAQs & Guidelines", link: "#faqs", type: "faq", size: "280 KB" }
    ]
  });
});

// POST /api/eventflow (Admin only)
router.post('/', (req, res) => {
  const { title, time, description, activities } = req.body;
  if (!title || !time) {
    return res.status(400).json({ error: 'Title and time are required' });
  }
  const nextStageNum = mockStore.eventFlow.length + 1;
  const newStage = {
    stage: nextStageNum,
    title,
    time,
    description: description || '',
    activities: Array.isArray(activities) ? activities : (activities ? [activities] : [])
  };
  mockStore.eventFlow.push(newStage);
  res.status(201).json({ message: 'Event stage added successfully', stage: newStage });
});

// PATCH /api/eventflow/:stage (Admin only)
router.patch('/:stage', (req, res) => {
  const stageNum = parseInt(req.params.stage, 10);
  const { title, time, description, activities } = req.body;

  const stageItem = mockStore.eventFlow.find((s) => s.stage === stageNum);
  if (!stageItem) {
    return res.status(404).json({ error: 'Stage not found' });
  }

  if (title) stageItem.title = title;
  if (time) stageItem.time = time;
  if (description) stageItem.description = description;
  if (activities) {
    stageItem.activities = Array.isArray(activities) ? activities : activities.split('\n').filter(Boolean);
  }

  res.json({ message: 'Stage updated successfully', stage: stageItem });
});

// DELETE /api/eventflow/:stage (Admin only)
router.delete('/:stage', (req, res) => {
  const stageNum = parseInt(req.params.stage, 10);
  const index = mockStore.eventFlow.findIndex((s) => s.stage === stageNum);
  if (index === -1) {
    return res.status(404).json({ error: 'Stage not found' });
  }

  const deleted = mockStore.eventFlow.splice(index, 1);
  // Re-index remaining stages
  mockStore.eventFlow.forEach((s, idx) => {
    s.stage = idx + 1;
  });

  res.json({ message: 'Stage deleted successfully', stage: deleted[0] });
});

export default router;
