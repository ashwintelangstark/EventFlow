import express from 'express';
import { isSupabaseConfigured, supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Helper to format user profile
const formatUser = (authUser, profile = {}) => {
  const email = (authUser?.email || '').toLowerCase().trim();
  // STRICT: Only admin@gmail.com gets admin portal access. All others receive non-admin view.
  const isAdmin = email === 'admin@gmail.com';
  const role = isAdmin ? 'admin' : 'staff';
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
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
  const { email, password, category, name, organization, phone, designation } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const displayName = (name && name.trim()) ? name.trim() : cleanEmail.split('@')[0].replace('.', ' ');
      const cleanPhone = (phone && phone.trim()) ? phone.trim() : '';
      const cleanOrg = (organization && organization.trim()) ? organization.trim() : 'Alliance University';
      const cleanDesig = (designation && designation.trim()) ? designation.trim() : 'Participant';
      const cleanCat = category || 'Student';

      // All new signups are strictly non-admin ('staff' / attendee).
      // Only the pre-registered admin@gmail.com can be admin.
      const systemRole = cleanEmail === 'admin@gmail.com' ? 'admin' : 'staff';

      let userObj;
      let accessToken = 'confirmed';

      if (supabaseAdmin) {
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            name: displayName,
            role: systemRole,
            category: cleanCat,
            organization: cleanOrg,
            designation: cleanDesig,
            phone: cleanPhone
          }
        });

        if (createError) {
          if (createError.message?.toLowerCase().includes('already')) {
            return res.status(400).json({ error: 'An account with this email already exists' });
          }
          const { data: fallback, error: fbError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                name: displayName,
                role: systemRole,
                category: cleanCat,
                organization: cleanOrg,
                designation: cleanDesig,
                phone: cleanPhone
              }
            }
          });
          if (fbError) return res.status(400).json({ error: fbError.message });
          userObj = fallback.user;
          accessToken = fallback.session?.access_token || 'confirmed';
        } else {
          userObj = created.user;
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: displayName,
              role: systemRole,
              category: cleanCat,
              organization: cleanOrg,
              designation: cleanDesig,
              phone: cleanPhone
            }
          }
        });

        if (error) {
          return res.status(400).json({ error: error.message });
        }
        userObj = data.user;
        accessToken = data.session?.access_token || 'confirmed';
      }

      // Upsert profile into public.profiles table using admin client
      if (userObj && supabaseAdmin) {
        await supabaseAdmin.from('profiles').upsert({
          id: userObj.id,
          full_name: displayName,
          role: systemRole,
          category: cleanCat,
          organization: cleanOrg,
          designation: cleanDesig,
          phone: cleanPhone || null
        });
      }

      const user = formatUser(userObj, {
        full_name: displayName,
        role: systemRole,
        category: cleanCat,
        organization: cleanOrg,
        designation: cleanDesig,
        phone: cleanPhone
      });

      return res.status(201).json({
        user,
        token: accessToken
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
