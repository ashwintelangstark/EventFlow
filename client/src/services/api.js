// Central API Service connecting directly to EventFlow Backend & Supabase
const API_BASE = '/api';

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async signup(payload) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sign up');
    return data;
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Session invalid');
    return res.json();
  },

  // Registrations
  async getRegistrations(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/registrations?${qs}`);
    if (!res.ok) throw new Error('Failed to fetch registrations');
    return res.json();
  },

  async getRegistrationStats() {
    const res = await fetch(`${API_BASE}/registrations/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async addRegistration(payload) {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add registration');
    return res.json();
  },

  async importBatchRegistrations(rows) {
    const res = await fetch(`${API_BASE}/registrations/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows })
    });
    if (!res.ok) throw new Error('Failed to import registrations');
    return res.json();
  },

  async toggleCheckIn(id, status) {
    const res = await fetch(`${API_BASE}/registrations/${id}/checkin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update check-in status');
    return res.json();
  },

  // Announcements
  async getAnnouncements(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/announcements?${qs}`);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },

  async createAnnouncement(payload) {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create announcement');
    return res.json();
  },

  async updateAnnouncement(id, payload) {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update announcement');
    return res.json();
  },

  async deleteAnnouncement(id) {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete announcement');
    return res.json();
  },

  // Event Flow
  async getEventFlow() {
    const res = await fetch(`${API_BASE}/eventflow`);
    if (!res.ok) throw new Error('Failed to fetch event flow');
    return res.json();
  },

  async addEventStage(payload) {
    const res = await fetch(`${API_BASE}/eventflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to add event stage');
    return res.json();
  },

  async updateEventStage(stage, payload) {
    const res = await fetch(`${API_BASE}/eventflow/${stage}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update event stage');
    return res.json();
  },

  async deleteEventStage(stage) {
    const res = await fetch(`${API_BASE}/eventflow/${stage}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete event stage');
    return res.json();
  }
};
