import express from 'express';
import { mockStore } from '../data/mockStore.js';
import { isSupabaseConfigured, supabase } from '../config/supabase.js';

const router = express.Router();

// Helper to sanitize user object
const sanitize = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // If Supabase is configured, use Supabase Auth
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    // Fetch profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.email.split('@')[0],
        role: profile?.role || 'attendee',
        category: profile?.category || 'Student',
        organization: profile?.organization || 'Alliance University'
      },
      token: data.session.access_token
    });
  }

  // Fallback to Mock Auth
  const user = mockStore.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json({
    user: sanitize(user),
    token: `mock_jwt_token_${user.id}_${Date.now()}`
  });
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, role, category, name, organization } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Map category to system role
  // 'Admin' or explicitly selected role
  let systemRole = 'attendee';
  if (role === 'admin' || email.includes('admin')) {
    systemRole = 'admin';
  } else if (role === 'staff' || email.includes('staff')) {
    systemRole = 'staff';
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          role: systemRole,
          category: category || 'Student',
          organization: organization || 'Alliance University'
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name || email.split('@')[0],
        role: systemRole,
        category: category || 'Student',
        organization: organization || 'Alliance University'
      },
      token: data.session?.access_token || 'pending_confirmation'
    });
  }

  // Mock Signup
  const existing = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const displayName = name || email.split('@')[0].replace('.', ' ');
  const newUser = {
    id: `usr_${Date.now()}`,
    email,
    password,
    name: displayName,
    role: systemRole,
    category: category || 'Student',
    organization: organization || 'Alliance University',
    avatar: displayName.charAt(0).toUpperCase()
  };

  mockStore.users.push(newUser);

  return res.status(201).json({
    user: sanitize(newUser),
    token: `mock_jwt_token_${newUser.id}_${Date.now()}`
  });
});

// POST /api/auth/quick-login (For rapid 1-click testing)
router.post('/quick-login', (req, res) => {
  const { role } = req.body; // 'admin' | 'staff' | 'attendee'
  const target = mockStore.users.find((u) => u.role === (role || 'admin')) || mockStore.users[0];

  return res.json({
    user: sanitize(target),
    token: `mock_jwt_token_${target.id}_${Date.now()}`
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Return the default active session user or admin
  res.json({ user: sanitize(mockStore.users[0]) });
});

export default router;
