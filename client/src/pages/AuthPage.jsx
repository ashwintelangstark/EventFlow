import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  MapPin,
  Lightbulb,
  Users,
  Cpu,
  Rocket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Globe,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import './AuthPage.css';

export const AuthPage = () => {
  const { login, signup, loading } = useAuth();
  
  // Initialize mode from URL params (?mode=signup, ?register=true, or hash #register)
  const [mode, setMode] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlMode = searchParams.get('mode') || searchParams.get('tab');
      if (
        urlMode === 'signup' ||
        urlMode === 'register' ||
        searchParams.get('register') === 'true' ||
        window.location.hash === '#signup' ||
        window.location.hash === '#register'
      ) {
        return 'signup';
      }
    } catch {}
    return 'login';
  });

  // Keep state in sync with URL changes & browser history
  useEffect(() => {
    const syncFromUrl = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const urlMode = searchParams.get('mode') || searchParams.get('tab');
        if (
          urlMode === 'signup' ||
          urlMode === 'register' ||
          searchParams.get('register') === 'true' ||
          window.location.hash === '#signup' ||
          window.location.hash === '#register'
        ) {
          setMode('signup');
        } else if (urlMode === 'login' || window.location.hash === '#login') {
          setMode('login');
        }
      } catch {}
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
    };
  }, []);

  const handleTabChange = (nextMode) => {
    setMode(nextMode);
    setError('');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', nextMode);
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleCategory, setRoleCategory] = useState('Student');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Event Terms & Conditions');
      return;
    }

    try {
      await signup({
        email,
        password,
        category: roleCategory,
        role: roleCategory === 'Admin' ? 'admin' : (email.includes('admin') ? 'admin' : 'attendee'),
        organization: 'Alliance University'
      });
      setSuccessMsg('Account created successfully! Redirecting...');
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
  };


  return (
    <div className="auth-wrapper">
      {/* Background Ambience Elements */}
      <div className="glow-sphere glow-sphere-1" />
      <div className="glow-sphere glow-sphere-2" />

      <div className="auth-container">
        {/* LEFT COLUMN: HERO & BRANDING */}
        <div className="auth-hero">
          {/* Top Brand Header */}
          <div className="hero-top">
            <div className="brand-badge-group">
              <div className="brand-item">
                <div className="au-crest">
                  <span>AU</span>
                </div>
                <div>
                  <div className="brand-title">ALLIANCE</div>
                  <div className="brand-sub">UNIVERSITY</div>
                </div>
              </div>
              <div className="brand-divider">|</div>
              <div className="brand-item">
                <div>
                  <div className="quasar-title">AU-QUASAR ✦</div>
                  <div className="quasar-sub">INNOVATION · RESEARCH · IMPACT</div>
                </div>
              </div>
            </div>

            <div className="hero-motto">
              <div>IDEAS</div>
              <div>TECHNOLOGY</div>
              <div>PEOPLE</div>
              <div>A BETTER TOMORROW</div>
            </div>
          </div>

          {/* Main Title Banner */}
          <div className="hero-content">
            <h1 className="hero-heading">
              IDEA → AI → <br />
              <span className="gradient-text">IMPACT</span>
            </h1>
            <p className="hero-tagline">
              A HALF-DAY, HANDS-ON INNOVATION LAB<br />
              BY AU-QUASAR, ALLIANCE UNIVERSITY
            </p>

            {/* Event Metadata Badges */}
            <div className="meta-badges">
              <div className="meta-card">
                <Calendar size={22} className="meta-icon" />
                <div>
                  <strong>Sat, 24 Oct 2026</strong>
                  <small>10:00 AM – 1:00 PM</small>
                </div>
              </div>

              <div className="meta-card">
                <MapPin size={22} className="meta-icon" />
                <div>
                  <strong>AU-QUASAR</strong>
                  <small>Alliance University, Bengaluru</small>
                </div>
              </div>
            </div>

            {/* 4 Pillar Cards */}
            <div className="pillar-grid">
              <div className="pillar-card">
                <div className="pillar-icon-box cyan">
                  <Lightbulb size={20} />
                </div>
                <strong>Innovate</strong>
                <span>Turn ideas into real solutions</span>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box blue">
                  <Users size={20} />
                </div>
                <strong>Collaborate</strong>
                <span>Work with diverse minds</span>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box purple">
                  <Cpu size={20} />
                </div>
                <strong>Build</strong>
                <span>Hands-on prototyping</span>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box pink">
                  <Rocket size={20} />
                </div>
                <strong>Create Impact</strong>
                <span>Solutions for a better tomorrow</span>
              </div>
            </div>
          </div>

          {/* Hero Bottom Footer */}
          <div className="hero-footer">
            IDEAS &nbsp;|&nbsp; TECHNOLOGY &nbsp;|&nbsp; PEOPLE &nbsp;|&nbsp; A BETTER TOMORROW
          </div>
        </div>

        {/* RIGHT COLUMN: AUTH CARD */}
        <div className="auth-card-wrap">
          <div className="auth-card">
            {/* Top Bar with Landing Page Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                EventFlow Portal
              </span>
              <a
                href="/landing"
                style={{
                  fontSize: '11px',
                  color: 'var(--accent-cyan)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'rgba(19, 220, 229, 0.08)',
                  border: '1px solid rgba(19, 220, 229, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                title="View full event landing page"
              >
                <ArrowLeft size={12} />
                <span>Event Landing Page</span>
              </a>
            </div>

            {/* Tab Switcher: Sign In / Register */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => handleTabChange('login')}
              >
                <UserCheck size={16} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => handleTabChange('signup')}
              >
                <Sparkles size={16} />
                <span>Register</span>
              </button>
            </div>

            {/* Error / Success alert */}
            {error && (
              <div className="auth-alert error">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="auth-alert success">
                <span>{successMsg}</span>
              </div>
            )}

            {/* ================= LOGIN FORM ================= */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-header">
                  <h2>Welcome Back</h2>
                  <p>Login to access the event portal</p>
                </div>

                <div className="input-group">
                  <label>Email Address <span className="req">*</span></label>
                  <div className="input-field">
                    <Mail size={17} className="field-icon" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password <span className="req">*</span></label>
                  <div className="input-field">
                    <Lock size={17} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-subrow">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="link-btn" onClick={() => alert('Password reset instructions will be sent to your registered email address.')}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn btn-primary btn-full submit-btn" disabled={loading}>
                  <span>{loading ? 'Logging in...' : 'Login'}</span>
                  <ArrowRight size={16} />
                </button>

                <div className="form-footer-link">
                  <span>Don't have an account?</span>{' '}
                  <button type="button" className="text-link" onClick={() => handleTabChange('signup')}>
                    Register / Sign Up
                  </button>
                </div>
              </form>
            )}

            {/* ================= SIGN UP FORM ================= */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-header">
                  <h2>Create Your Account</h2>
                  <p>Join the event portal and register for IDEA → AI → IMPACT</p>
                </div>

                <div className="input-group">
                  <label>Email Address <span className="req">*</span></label>
                  <div className="input-field">
                    <Mail size={17} className="field-icon" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Password <span className="req">*</span></label>
                  <div className="input-field">
                    <Lock size={17} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Confirm Password <span className="req">*</span></label>
                  <div className="input-field">
                    <Lock size={17} className="field-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Role / Designation <span className="req">*</span></label>
                  <select
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value)}
                    required
                  >
                    <option value="Student">Student</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Founder / Startup">Founder / Startup</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Developer">Developer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="terms-check">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      required
                    />
                    <span>
                      I agree to the Event <a href="#terms">Terms & Conditions</a> and <a href="#privacy">Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-full submit-btn" disabled={loading}>
                  <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </button>

                <div className="form-footer-link">
                  <span>Already have an account?</span>{' '}
                  <button type="button" className="text-link" onClick={() => handleTabChange('login')}>
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
