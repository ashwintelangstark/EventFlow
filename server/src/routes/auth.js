import express from 'express';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Helper to format user profile
const formatUser = (authUser, profile = {}) => {
  const displayName = profile?.full_name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'User';
  return {
    id: authUser.id,
    email: authUser.email,
    name: displayName,
    role: profile?.role || authUser?.user_metadata?.role || 'staff',
    category: profile?.category || authUser?.user_metadata?.category || 'Student',
    organization: profile?.organization || authUser?.user_metadata?.organization || 'Alliance University',
    phone: profile?.phone || authUser?.user_metadata?.phone || '',
    avatar: displayName.charAt(0).toUpperCase()
  };
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      // Fetch profile from profiles table using admin client to ensure access
      let profile = null;
      if (supabaseAdmin) {
        const { data: profData } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        profile = profData;
      }

      const user = formatUser(data.user, profile);

      return res.json({
        user,
        token: data.session.access_token
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Authentication service error' });
    }
  }

  return res.status(503).json({ error: 'Database service is currently unavailable' });
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, role, category, name, organization, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const displayName = name || cleanEmail.split('@')[0].replace('.', ' ');

      // Supabase role enum in DB is 'admin' | 'staff'
      let systemRole = 'staff';
      if (role === 'admin' || cleanEmail.includes('admin')) {
        systemRole = 'admin';
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: displayName,
            role: systemRole,
            category: category || 'Student',
            organization: organization || 'Alliance University',
            phone: phone || ''
          }
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Upsert profile into public.profiles table using admin client
      if (data.user && supabaseAdmin) {
        await supabaseAdmin.from('profiles').upsert({
          id: data.user.id,
          full_name: displayName,
          role: systemRole,
          category: category || 'Student',
          organization: organization || 'Alliance University',
          phone: phone || null
        });
      }

      const user = formatUser(data.user, {
        full_name: displayName,
        role: systemRole,
        category: category || 'Student',
        organization: organization || 'Alliance University',
        phone
      });

      return res.status(201).json({
        user,
        token: data.session?.access_token || 'confirmed'
      });
    } catch (err) {
      console.error('Signup error:', err);
      return res.status(500).json({ error: 'Failed to create account in database' });
    }
  }

  return res.status(503).json({ error: 'Database service is currently unavailable' });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      let profile = null;
      if (supabaseAdmin) {
        const { data: profData } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profile = profData;
      }

      return res.json({ user: formatUser(user, profile) });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid session' });
    }
  }

  return res.status(401).json({ error: 'Session unavailable' });
});

export default router;
