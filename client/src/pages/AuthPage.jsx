import React, { useState } from 'react';
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
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import './AuthPage.css';

export const AuthPage = () => {
  const { login, signup, quickLogin, loading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

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

  const prefillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
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
            {/* Tab Switcher: Login / Sign Up */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError(''); }}
              >
                <UserCheck size={16} />
                <span>Login</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => { setMode('signup'); setError(''); }}
              >
                <Sparkles size={16} />
                <span>Sign Up</span>
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
                  <button type="button" className="link-btn" onClick={() => alert('Password reset link sent to demo mail.')}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn btn-primary btn-full submit-btn" disabled={loading}>
                  <span>{loading ? 'Logging in...' : 'Login'}</span>
                  <ArrowRight size={16} />
                </button>

                {/* Instant 1-Click Role Access */}
                <div className="quick-fill-box">
                  <span className="quick-fill-label">Instant 1-Click Access (Testing):</span>
                  <div className="quick-fill-buttons">
                    <button
                      type="button"
                      className="pill pill-purple"
                      onClick={() => quickLogin('admin')}
                      title="Enter directly as Ashwin Telang (Admin)"
                    >
                      Enter as Admin (Ashwin)
                    </button>
                    <button
                      type="button"
                      className="pill pill-blue"
                      onClick={() => quickLogin('staff')}
                      title="Enter directly as Priya Sharma (Staff)"
                    >
                      Enter as Staff (Priya)
                    </button>
                    <button
                      type="button"
                      className="pill pill-cyan"
                      onClick={() => quickLogin('attendee')}
                      title="Enter directly as Rohan Patil (Student)"
                    >
                      Enter as Student (Rohan)
                    </button>
                  </div>
                </div>

                <div className="form-footer-link">
                  <span>Don't have an account?</span>{' '}
                  <button type="button" className="text-link" onClick={() => setMode('signup')}>
                    Sign Up
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
                  <button type="button" className="text-link" onClick={() => setMode('login')}>
                    Login
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
