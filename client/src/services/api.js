// Central API Service connecting directly to Supabase Database & EventFlow Backend
import { supabase, isSupabaseDirectReady } from '../supabase.js';

const API_BASE = '/api';

// Safe fetch with short timeout so unconfigured backend proxies on Apache/Hostinger never hang
const fetchWithTimeout = async (url, options = {}, timeoutMs = 1800) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// Format helper for user object
const formatUser = (authUser, profile = {}) => {
  const email = (authUser?.email || '').toLowerCase().trim();
  const isAdmin = email === 'admin@gmail.com';
  const role = isAdmin ? 'admin' : (profile?.role || 'staff');
  const displayName = isAdmin
    ? (profile?.full_name || 'Admin')
    : (profile?.full_name || authUser?.user_metadata?.name || email.split('@')[0] || 'User');

  return {
    id: authUser.id,
    email: authUser.email,
    name: displayName,
    role,
    category: isAdmin ? 'Admin' : (profile?.category || authUser?.user_metadata?.category || 'Student'),
    organization: isAdmin ? 'AU-QUASAR Operations' : (profile?.organization || authUser?.user_metadata?.organization || 'Alliance University'),
    designation: profile?.designation || authUser?.user_metadata?.designation || 'Participant',
    phone: profile?.phone || authUser?.user_metadata?.phone || '',
    avatar: displayName.charAt(0).toUpperCase()
  };
};

// Format attendee from database row
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

export const api = {
  // 1. Auth: Login
  async login(email, password) {
    const cleanEmail = (email || '').toLowerCase().trim();

    // Direct Supabase Primary
    if (isSupabaseDirectReady && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (error) throw new Error(error.message);

        let profile = null;
        try {
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          profile = prof;
        } catch {}

        return {
          user: formatUser(data.user, profile),
          token: data.session?.access_token || 'authenticated'
        };
      } catch (err) {
        if (err.message && (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('credential'))) {
          throw err;
        }
        console.warn('Direct Supabase auth note:', err.message);
      }
    }

    // Backend API Fallback
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      if (res.ok) {
        return await res.json();
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error(data.error || 'Invalid email or password');
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('invalid')) {
        throw err;
      }
      console.warn('Backend API login unavailable:', err.message);
    }

    throw new Error('Database connection failed. Please check your credentials.');
  },

  // 2. Auth: Signup
  async signup(payload) {
    const cleanEmail = (payload?.email || '').toLowerCase().trim();
    const systemRole = cleanEmail === 'admin@gmail.com' ? 'admin' : 'staff';
    const displayName = payload.name || cleanEmail.split('@')[0];
    const cleanPhone = (payload.phone || '').trim();
    const cleanOrg = (payload.organization || '').trim() || 'Alliance University';
    const cleanDesig = (payload.designation || '').trim() || 'Participant';
    const cleanCat = payload.category || 'Student';

    // Direct Supabase Primary
    if (isSupabaseDirectReady && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: payload.password,
          options: {
            data: {
              name: displayName,
              role: systemRole,
              phone: cleanPhone,
              category: cleanCat,
              organization: cleanOrg,
              designation: cleanDesig
            }
          }
        });
        if (error) {
          if (error.message?.toLowerCase().includes('already')) {
            throw new Error('An account with this email already exists');
          }
          throw new Error(error.message);
        }

        if (data.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: displayName,
              role: systemRole,
              phone: cleanPhone,
              category: cleanCat,
              organization: cleanOrg,
              designation: cleanDesig
            });
          } catch (dbErr) {
            console.warn('Direct profile sync note:', dbErr);
          }
        }

        return {
          user: formatUser(data.user, {
            full_name: displayName,
            role: systemRole,
            phone: cleanPhone,
            category: cleanCat,
            organization: cleanOrg,
            designation: cleanDesig
          }),
          token: data.session?.access_token || 'confirmed'
        };
      } catch (err) {
        if (err.message && (err.message.toLowerCase().includes('already') || err.message.toLowerCase().includes('password'))) {
          throw err;
        }
        console.warn('Direct Supabase signup note:', err.message);
      }
    }

    // Backend API Fallback
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, email: cleanEmail })
      });
      if (res.ok) {
        return await res.json();
      }
      const data = await res.json().catch(() => ({}));
      if (data.error && data.error.toLowerCase().includes('already')) {
        throw new Error(data.error);
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already')) {
        throw err;
      }
      console.warn('Backend API signup unavailable:', err.message);
    }

    throw new Error('Database signup failed. Please try again.');
  },

  async getMe(token) {
    if (isSupabaseDirectReady && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let profile = null;
          try {
            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            profile = prof;
          } catch {}
          return { user: formatUser(user, profile) };
        }
      } catch {}
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch {}

    throw new Error('Session invalid');
  },

  // 3. Registrations: List
  async getRegistrations(params = {}) {
    // Direct Supabase Primary
    if (isSupabaseDirectReady && supabase) {
      try {
        let query = supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (params.category && params.category !== 'All Categories') {
          query = query.eq('category', params.category);
        }
        if (params.status && params.status !== 'All Status') {
          query = query.eq('status', params.status);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          let list = data.map(formatAttendee);
          if (params.q) {
            const q = params.q.toLowerCase().trim();
            list = list.filter((a) =>
              [a.name, a.email, a.phone, a.organization, a.category, a.id]
                .filter(Boolean)
                .some((val) => String(val).toLowerCase().includes(q))
            );
          }
          return {
            total: list.length,
            attendees: list
          };
        }
      } catch (sbErr) {
        console.warn('Direct Supabase registrations note:', sbErr.message);
      }
    }

    // Backend API Fallback
    const qs = new URLSearchParams(params).toString();
    try {
      const res = await fetchWithTimeout(`${API_BASE}/registrations?${qs}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.attendees)) return data;
      }
    } catch (err) {
      console.warn('Backend API registrations fetch note:', err.message);
    }

    return { total: 0, attendees: [] };
  },

  // 4. Registrations: Stats
  async getRegistrationStats() {
    if (isSupabaseDirectReady && supabase) {
      try {
        const { data, error } = await supabase.from('registrations').select('*');
        if (!error && Array.isArray(data)) {
          const total = data.length;
          const checkedIn = data.filter((d) => d.status === 'Checked In').length;
          return {
            totalRegistrations: total,
            checkedIn,
            yetToArrive: Math.max(0, total - checkedIn),
            teamRegistrations: Math.round(total * 0.25),
            categories: {
              students: data.filter((d) => d.category?.toLowerCase().includes('student')).length,
              workingProfessionals: data.filter((d) => d.category?.toLowerCase().includes('professional')).length,
              founders: data.filter((d) => d.category?.toLowerCase().includes('founder')).length,
              researchers: data.filter((d) => d.category?.toLowerCase().includes('research')).length,
              startups: data.filter((d) => d.category?.toLowerCase().includes('startup')).length,
              developers: data.filter((d) => d.category?.toLowerCase().includes('developer')).length,
              others: 0
            }
          };
        }
      } catch {}
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/registrations/stats`);
      if (res.ok) return await res.json();
    } catch {}

    return { totalRegistrations: 0, checkedIn: 0, yetToArrive: 0, teamRegistrations: 0, categories: {} };
  },

  // 5. Registrations: Add
  async addRegistration(payload) {
    // Direct Supabase Primary
    if (isSupabaseDirectReady && supabase) {
      const cleanEmail = (payload.email || '').toLowerCase().trim();
      const row = {
        full_name: (payload.name || payload.fullName || '').trim(),
        email: cleanEmail,
        phone: (payload.phone || '').trim(),
        category: payload.category || 'Student',
        organization: (payload.organization || '').trim() || 'Alliance University',
        designation: (payload.designation || '').trim() || 'Participant',
        department: (payload.department || '').trim() || null,
        dietary_preference: payload.diet || payload.dietaryPreference || null,
        areas_of_interest: Array.isArray(payload.interests) ? payload.interests : (Array.isArray(payload.areasOfInterest) ? payload.areasOfInterest : null),
        additional_info: payload.extra || payload.notes || null,
        status: payload.status || 'Registered',
        created_at: new Date().toISOString()
      };
      if (payload.userId || payload.user_id) {
        row.user_id = payload.userId || payload.user_id;
      }

      try {
        const { data: existing } = await supabase
          .from('registrations')
          .select('id, status')
          .eq('email', cleanEmail)
          .limit(1);

        if (existing && existing.length > 0) {
          if (existing[0].status === 'Checked In') {
            row.status = 'Checked In';
          }
          const { data, error } = await supabase
            .from('registrations')
            .update(row)
            .eq('id', existing[0].id)
            .select()
            .single();
          if (error) throw error;
          if (data) return { attendee: formatAttendee(data) };
        } else {
          const { data, error } = await supabase
            .from('registrations')
            .insert(row)
            .select()
            .single();
          if (error) throw error;
          if (data) return { attendee: formatAttendee(data) };
        }
      } catch (sbErr) {
        console.error('Direct supabase registration error:', sbErr);
        throw sbErr;
      }
    }

    // Backend API Fallback
    try {
      const res = await fetchWithTimeout(`${API_BASE}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend API registration fallback failed:', err.message);
      throw err;
    }

    return { success: true };
  },

  async importBatchRegistrations(rows) {
    if (isSupabaseDirectReady && supabase) {
      const formatted = rows.map((r) => ({
        full_name: r.name || r.fullName,
        email: (r.email || '').toLowerCase().trim(),
        phone: (r.phone || '').trim(),
        category: r.category || 'Student',
        organization: (r.organization || '').trim() || 'Alliance University',
        designation: (r.designation || '').trim() || 'Participant',
        status: r.status || 'Registered',
        created_at: new Date().toISOString()
      }));
      const { error } = await supabase.from('registrations').insert(formatted);
      if (error) throw error;
      return { success: true, count: formatted.length };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/registrations/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  // 6. Registrations: Check-in toggle
  async toggleCheckIn(id, status) {
    if (isSupabaseDirectReady && supabase) {
      const updateData = {
        status,
        checked_in_at: status === 'Checked In' ? new Date().toISOString() : null
      };
      const { data, error } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) return { attendee: formatAttendee(data) };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/registrations/${id}/checkin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  async updateRegistration(id, payload) {
    if (isSupabaseDirectReady && supabase) {
      const updateData = {};
      if (payload.name !== undefined) updateData.full_name = payload.name;
      if (payload.email !== undefined) updateData.email = payload.email.toLowerCase().trim();
      if (payload.phone !== undefined) updateData.phone = payload.phone;
      if (payload.category !== undefined) updateData.category = payload.category;
      if (payload.organization !== undefined) updateData.organization = payload.organization;
      if (payload.designation !== undefined) updateData.designation = payload.designation;
      if (payload.department !== undefined) updateData.department = payload.department;
      if (payload.status !== undefined) {
        updateData.status = payload.status;
        if (payload.status === 'Checked In') {
          updateData.checked_in_at = new Date().toISOString();
        } else if (payload.status === 'Registered') {
          updateData.checked_in_at = null;
        }
      }

      const { data, error } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (data) return { attendee: formatAttendee(data) };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Backend API update registration fallback:', err.message);
    }

    return { success: true };
  },

  async deleteRegistration(id) {
    if (isSupabaseDirectReady && supabase) {
      const { error } = await supabase.from('registrations').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  // 7. Announcements
  async getAnnouncements(params = {}) {
    if (isSupabaseDirectReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return {
            total: data.length,
            announcements: data.map((a) => ({
              id: a.id,
              title: a.title,
              message: a.message,
              type: a.type || 'General',
              status: a.status || 'Published',
              date: new Date(a.created_at).toLocaleDateString()
            }))
          };
        }
      } catch {}
    }

    const qs = new URLSearchParams(params).toString();
    try {
      const res = await fetchWithTimeout(`${API_BASE}/announcements?${qs}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.announcements)) return data;
      }
    } catch {}

    return { total: 0, announcements: [] };
  },

  async createAnnouncement(payload) {
    if (isSupabaseDirectReady && supabase) {
      const { data, error } = await supabase.from('announcements').insert({
        title: payload.title,
        message: payload.message,
        type: payload.type || 'General',
        status: payload.status || 'Published',
        created_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      if (data) return { announcement: data };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  async updateAnnouncement(id, payload) {
    if (isSupabaseDirectReady && supabase) {
      const { error } = await supabase.from('announcements').update(payload).eq('id', id);
      if (error) throw error;
      return { success: true };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  async deleteAnnouncement(id) {
    if (isSupabaseDirectReady && supabase) {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  // 8. Event Flow (Agenda & Stages)
  async getEventFlow() {
    if (isSupabaseDirectReady && supabase) {
      try {
        const { data, error } = await supabase
          .from('event_sessions')
          .select('*')
          .order('sequence_number', { ascending: true });
        if (!error && Array.isArray(data) && data.length > 0) {
          return {
            stages: data.map((s) => ({
              id: s.id,
              stage: s.sequence_number || s.id,
              title: s.title,
              time: `${s.start_time} – ${s.end_time}`,
              startTime: s.start_time,
              endTime: s.end_time,
              description: s.description || '',
              activities: s.key_activities || []
            }))
          };
        }
      } catch {}
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/eventflow`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.stages) && data.stages.length > 0) return data;
      }
    } catch {}

    return { stages: [] };
  },

  async addEventStage(payload) {
    if (isSupabaseDirectReady && supabase) {
      const { data, error } = await supabase.from('event_sessions').insert({
        title: payload.title,
        start_time: payload.startTime || '10:00 AM',
        end_time: payload.endTime || '10:30 AM',
        description: payload.description || '',
        key_activities: Array.isArray(payload.activities) ? payload.activities : []
      }).select().single();
      if (error) throw error;
      if (data) return { stage: data };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/eventflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  async updateEventStage(stage, payload) {
    if (isSupabaseDirectReady && supabase) {
      const updateData = {};
      if (payload.title) updateData.title = payload.title;
      if (payload.startTime) updateData.start_time = payload.startTime;
      if (payload.endTime) updateData.end_time = payload.endTime;
      if (payload.description !== undefined) updateData.description = payload.description;
      if (payload.activities) updateData.key_activities = payload.activities;
      const { error } = await supabase.from('event_sessions').update(updateData).eq('sequence_number', stage);
      if (error) throw error;
      return { success: true };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/eventflow/${stage}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  },

  async deleteEventStage(stage) {
    if (isSupabaseDirectReady && supabase) {
      const { error } = await supabase.from('event_sessions').delete().eq('sequence_number', stage);
      if (error) throw error;
      return { success: true };
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/eventflow/${stage}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {}

    return { success: true };
  }
};
