import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  UserCheck,
  Bell,
  GitCommit,
  Calendar,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Download,
  ArrowRight,
  LogOut,
  ChevronRight,
  Check,
  Shield,
  Users,
  Sparkles,
  Globe
} from 'lucide-react';
import './NonAdminPortal.css';

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Welcome to IDEA → AI → IMPACT",
    message: "We're excited to have you at AU-QUASAR! Get ready for a half-day of innovation, learning and hands-on prototyping.",
    type: "General",
    date: "24 Oct 2026, 08:00 AM"
  },
  {
    id: 2,
    title: "Event Venue & Gate Logistics",
    message: "The event is held at AU-QUASAR, Alliance University, Bengaluru. Please enter via Gate 2 for registration desks.",
    type: "Logistics",
    date: "23 Oct 2026, 06:00 PM"
  },
  {
    id: 3,
    title: "Registration & Badge Verification",
    message: "Thank you for registering! Please carry a valid government or college ID card to collect your smart badge.",
    type: "Registration",
    date: "20 Oct 2026, 10:00 AM"
  },
  {
    id: 4,
    title: "Team Formation & Mentor Matchmaking",
    message: "Team formation will happen during the event. Be ready to collaborate with participants across domains.",
    type: "Activity",
    date: "22 Oct 2026, 04:00 PM"
  },
  {
    id: 5,
    title: "Schedule Update: Keynote Timing",
    message: "The keynote session has been scheduled for 10:15 AM. Check the complete Event Flow tab for details.",
    type: "Schedule",
    date: "23 Oct 2026, 08:30 PM"
  },
  {
    id: 6,
    title: "Lunch & Refreshments",
    message: "Complimentary artisan refreshments and buffet lunch will be provided at the Innovation Courtyard.",
    type: "Logistics",
    date: "24 Oct 2026, 09:00 AM"
  }
];

export const NonAdminPortal = ({ onGoToLanding }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState('');

  // Self-Registration Form State
  const [selfForm, setSelfForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    category: user?.category || 'Student',
    organization: user?.organization || 'Alliance University',
    designation: '',
    department: '',
    diet: 'No preference',
    interests: [],
    extra: ''
  });

  // Announcement Filters
  const [annSearch, setAnnSearch] = useState('');
  const [annCategory, setAnnCategory] = useState('All Categories');
  const [annSort, setAnnSort] = useState('new');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleInterestToggle = (interest) => {
    setSelfForm((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  const handleSelfRegisterSubmit = (e) => {
    e.preventDefault();
    if (!selfForm.fullName || !selfForm.email) return;

    showToast(`Thanks ${selfForm.fullName}! Your registration pass has been created.`);
    setSelfForm({
      fullName: '',
      email: '',
      phone: '',
      category: 'Student',
      organization: '',
      designation: '',
      department: '',
      diet: 'No preference',
      interests: [],
      extra: ''
    });
  };

  // Filtered Announcements
  let filteredAnnouncements = ANNOUNCEMENTS.filter((a) => {
    const matchQ = (a.title + ' ' + a.message).toLowerCase().includes(annSearch.toLowerCase());
    const matchCat = annCategory === 'All Categories' || a.type === annCategory;
    return matchQ && matchCat;
  });

  if (annSort === 'old') {
    filteredAnnouncements = [...filteredAnnouncements].reverse();
  }

  const getTagClass = (type) => {
    switch (type) {
      case 'Logistics': return 'pill-purple';
      case 'Registration': return 'pill-green';
      case 'Activity': return 'pill-pink';
      case 'Schedule': return 'pill-amber';
      case 'Guidelines': return 'pill-cyan';
      default: return 'pill-blue';
    }
  };

  return (
    <div className="nonadmin-app">
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={16} />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="nonadmin-sidebar">
        <div className="nonadmin-brand">
          <div className="brand-title">
            IDEA → AI → <br />
            <span>IMPACT</span>
          </div>
          <small>A HALF-DAY, INNOVATION LAB<br />BY AU-QUASAR, ALLIANCE UNIVERSITY</small>
        </div>

        <nav className="nonadmin-nav">
          <button
            type="button"
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <Home size={16} className="nav-ico" />
            <span className="nav-label">Dashboard</span>
          </button>

          <button
            type="button"
            className={activeTab === 'registrations' ? 'active' : ''}
            onClick={() => setActiveTab('registrations')}
          >
            <UserCheck size={16} className="nav-ico" />
            <span className="nav-label">Registrations</span>
          </button>

          <button
            type="button"
            className={activeTab === 'announcements' ? 'active' : ''}
            onClick={() => setActiveTab('announcements')}
          >
            <Bell size={16} className="nav-ico" />
            <span className="nav-label">Announcements</span>
          </button>

          <button
            type="button"
            className={activeTab === 'eventflow' ? 'active' : ''}
            onClick={() => setActiveTab('eventflow')}
          >
            <GitCommit size={16} className="nav-ico" />
            <span className="nav-label">Event Flow</span>
          </button>
        </nav>

        <div className="nonadmin-sidebar-bottom">
          <div className="alliance-title">◉ ALLIANCE<br />　UNIVERSITY</div>
          <div className="quasar-tag">
            AU-QUASAR
            <small>INNOVATION · RESEARCH · IMPACT</small>
          </div>
          <button type="button" className="sidebar-logout-btn" onClick={logout}>
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="nonadmin-main">
        {/* TOPBAR WITH PROMINENT PORTAL SWITCHER */}
        <header className="nonadmin-topbar">
          <div className="topbar-left-meta">
            <button
              type="button"
              className="topbar-landing-btn"
              onClick={onGoToLanding || (() => window.open('/landing', '_blank'))}
              title="View Public Event Landing Page"
            >
              <Globe size={13} />
              <span>Landing Page</span>
            </button>

            <div className="topbar-meta-item">
              <Calendar size={14} className="meta-icon" />
              <span>Sat, 24 Oct 2026 · 10:00 AM – 1:00 PM</span>
            </div>

            <div className="topbar-meta-item location">
              <MapPin size={14} className="meta-icon" />
              <span>AU-QUASAR, Bengaluru</span>
            </div>
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar">{user?.avatar || 'P'}</div>
            <div>
              <strong>{user?.name || 'Priya Sharma'}</strong>
              <small>{user?.role === 'staff' ? 'Event Staff' : 'Participant'}</small>
            </div>
          </div>
        </header>

        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <section className="portal-tab-content" key="dashboard">
            <div className="welcome-section">
              <div className="text-dim">Welcome back,</div>
              <h1 className="portal-heading">
                {user?.name || 'Priya Sharma'}{' '}
                <span className="pill pill-purple">{user?.role === 'staff' ? 'Event Staff' : 'Participant'}</span>
              </h1>
              <p className="portal-sub">Overview of IDEA → AI → IMPACT schedule and logistics.</p>
            </div>

            {/* Hero Image Banner */}
            <div className="hero-banner">
              <div>
                <h2>IDEA → AI → <span className="gradient-text">IMPACT</span></h2>
                <p>A HALF-DAY, HANDS-ON INNOVATION LAB BY AU-QUASAR, ALLIANCE UNIVERSITY</p>
              </div>
              <div className="banner-motto">
                IDEAS<br />TECHNOLOGY<br />PEOPLE<br />A BETTER TOMORROW
              </div>
            </div>

            {/* 4 Minimalist Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon blue"><Users size={20} /></div>
                  <div>
                    <div className="stat-card-label">Total Registrations</div>
                    <strong>186</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '72%' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon green"><CheckCircle2 size={20} /></div>
                  <div>
                    <div className="stat-card-label">Checked In</div>
                    <strong>124</strong>
                  </div>
                  <div className="stat-card-note">67%</div>
                </div>
                <div className="bar-track"><span style={{ width: '67%', background: 'var(--accent-green)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon amber"><Clock size={20} /></div>
                  <div>
                    <div className="stat-card-label">Yet to Arrive</div>
                    <strong>62</strong>
                  </div>
                  <div className="stat-card-note">33%</div>
                </div>
                <div className="bar-track"><span style={{ width: '33%', background: 'var(--accent-amber)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon purple"><Calendar size={20} /></div>
                  <div>
                    <div className="stat-card-label">Event Time</div>
                    <strong style={{ fontSize: '17px', marginTop: '4px' }}>10:00 – 1:00</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '25%', background: 'var(--accent-purple)' }} /></div>
              </div>
            </div>

            {/* Two-Column: Registration Trend & Categories */}
            <div className="two-col-grid">
              <div className="card">
                <div className="card-head">
                  <h3>Registration Momentum</h3>
                  <span className="text-dim" style={{ fontSize: '11px' }}>15 Oct – 24 Oct</span>
                </div>
                <div className="chart-wrapper">
                  <svg viewBox="0 0 600 180" preserveAspectRatio="none">
                    <polyline
                      points="0,155 65,143 130,130 195,116 260,102 325,88 390,74 455,60 520,45 590,22"
                      fill="none"
                      stroke="#1c7fff"
                      strokeWidth="2.5"
                    />
                    <polyline
                      points="0,164 65,157 130,148 195,137 260,126 325,114 390,103 455,91 520,80 590,65"
                      fill="none"
                      stroke="#9646ff"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="chart-timeline-labels">
                  <span>15 Oct</span>
                  <span>18 Oct</span>
                  <span>21 Oct</span>
                  <span>24 Oct</span>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Attendee Categories</h3>
                  <span className="text-dim" style={{ fontSize: '11px' }}>Distribution</span>
                </div>
                <div className="donut-container">
                  <div className="donut-chart" />
                  <div className="donut-legend-grid">
                    <span>🔵 Students <b>42%</b></span>
                    <span>🟣 Founders <b>18%</b></span>
                    <span>🩷 Working Pros <b>14%</b></span>
                    <span>🟠 Researchers <b>10%</b></span>
                    <span>🟢 Startups <b>8%</b></span>
                    <span>🔹 Developers <b>6%</b></span>
                    <span>⚪ Others <b>2%</b></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3-Grid: Recent Announcements, Quick Actions, Event Details */}
            <div className="three-col-grid" style={{ marginTop: '16px' }}>
              <div className="card">
                <div className="card-head">
                  <h3>Recent Announcements</h3>
                  <button type="button" className="btn btn-ghost" style={{ padding: 0 }} onClick={() => setActiveTab('announcements')}>
                    View all →
                  </button>
                </div>
                <div className="list-stack">
                  {ANNOUNCEMENTS.slice(0, 3).map((a) => (
                    <div key={a.id} className="list-item-row">
                      <div className="round-icon-badge">⚑</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong>{a.title}</strong>
                        <p>{a.message.slice(0, 60)}...</p>
                      </div>
                      <time>{a.date.split(', ')[1] || '08:00 AM'}</time>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3>Quick Actions</h3>
                <div className="quick-action-stack" style={{ marginTop: '14px' }}>
                  <button
                    type="button"
                    className="action-tile"
                    onClick={() => setActiveTab('registrations')}
                  >
                    <UserCheck size={18} className="action-tile-icon" />
                    <div>
                      <strong>Register Myself</strong>
                      <small>Fill in your event badge details →</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="action-tile"
                    onClick={() => setActiveTab('announcements')}
                  >
                    <Bell size={18} className="action-tile-icon" />
                    <div>
                      <strong>View Announcements</strong>
                      <small>Latest updates & venue notices →</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="action-tile"
                    onClick={() => setActiveTab('eventflow')}
                  >
                    <GitCommit size={18} className="action-tile-icon" />
                    <div>
                      <strong>View Event Flow</strong>
                      <small>Interactive 6-step agenda →</small>
                    </div>
                  </button>
                </div>
              </div>

              <div className="card">
                <h3>Event Details</h3>
                <div className="details-stack" style={{ marginTop: '14px' }}>
                  <div className="detail-row">
                    <Calendar size={16} className="meta-icon" />
                    <div>
                      <strong>Sat, 24 Oct 2026</strong>
                      <small>10:00 AM – 1:00 PM</small>
                    </div>
                  </div>
                  <div className="detail-row">
                    <MapPin size={16} className="meta-icon" />
                    <div>
                      <strong>AU-QUASAR</strong>
                      <small>Alliance University, Bengaluru</small>
                    </div>
                  </div>
                  <hr style={{ borderColor: 'rgba(255, 255, 255, 0.06)', margin: '8px 0' }} />
                  <p className="text-dim" style={{ fontSize: '11.5px', lineHeight: '1.5' }}>
                    Need on-site assistance? Visit the Quasar Help Desk at Gate 2 entrance.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: REGISTRATIONS (SELF-REGISTRATION) ================= */}
        {activeTab === 'registrations' && (
          <section className="portal-tab-content" key="registrations">
            <div className="welcome-section" style={{ marginBottom: '16px' }}>
              <h1 className="portal-heading">Registrations</h1>
              <p className="portal-sub">Register yourself for the event pass.</p>
            </div>

            <div className="layout-two-pane">
              {/* Registration Form Card */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <h3>Participant Self-Registration</h3>
                    <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                      Please provide your accurate details to receive your event pass.
                    </p>
                  </div>
                  <span className="pill pill-cyan">Pass Access</span>
                </div>

                <form onSubmit={handleSelfRegisterSubmit} className="form-vertical" style={{ marginTop: '10px' }}>
                  <div className="form-two-col">
                    <div className="input-group">
                      <label>Full Name <span style={{ color: 'var(--accent-magenta)' }}>*</span></label>
                      <input
                        required
                        placeholder="Enter your full name"
                        value={selfForm.fullName}
                        onChange={(e) => setSelfForm({ ...selfForm, fullName: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Email Address <span style={{ color: 'var(--accent-magenta)' }}>*</span></label>
                      <input
                        required
                        type="email"
                        placeholder="Enter your email address"
                        value={selfForm.email}
                        onChange={(e) => setSelfForm({ ...selfForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-two-col">
                    <div className="input-group">
                      <label>Phone Number <span style={{ color: 'var(--accent-magenta)' }}>*</span></label>
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={selfForm.phone}
                        onChange={(e) => setSelfForm({ ...selfForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Category <span style={{ color: 'var(--accent-magenta)' }}>*</span></label>
                      <select
                        required
                        value={selfForm.category}
                        onChange={(e) => setSelfForm({ ...selfForm, category: e.target.value })}
                      >
                        <option value="Student">Student</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Founder / Startup">Founder / Startup</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Developer">Developer</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-two-col">
                    <div className="input-group">
                      <label>Organization / University <span style={{ color: 'var(--accent-magenta)' }}>*</span></label>
                      <input
                        required
                        placeholder="e.g. Alliance University, Infosys"
                        value={selfForm.organization}
                        onChange={(e) => setSelfForm({ ...selfForm, organization: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Designation / Role <span style={{ color: 'var(--accent-magenta)' }}>*</span></label>
                      <input
                        required
                        placeholder="e.g. Student, Software Engineer"
                        value={selfForm.designation}
                        onChange={(e) => setSelfForm({ ...selfForm, designation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-two-col">
                    <div className="input-group">
                      <label>Department / Domain (Optional)</label>
                      <input
                        placeholder="e.g. AI, Robotics, Design"
                        value={selfForm.department}
                        onChange={(e) => setSelfForm({ ...selfForm, department: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Dietary Preference (Optional)</label>
                      <select
                        value={selfForm.diet}
                        onChange={(e) => setSelfForm({ ...selfForm, diet: e.target.value })}
                      >
                        <option value="No preference">No preference</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                      </select>
                    </div>
                  </div>

                  <div className="input-group" style={{ marginTop: '8px' }}>
                    <label>Areas of Interest (select all that apply):</label>
                    <div className="checkbox-grid">
                      {[
                        "AI / Machine Learning",
                        "Robotics & Automation",
                        "Startups & Innovation",
                        "Research & Development",
                        "Product Design",
                        "Networking"
                      ].map((interest) => (
                        <label key={interest} className="checkbox-wrap">
                          <input
                            type="checkbox"
                            checked={selfForm.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                          />
                          <span>{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="input-group" style={{ marginTop: '8px' }}>
                    <label>Additional Notes (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Special accommodations or questions for organizers..."
                      value={selfForm.extra}
                      onChange={(e) => setSelfForm({ ...selfForm, extra: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" style={{ padding: '12px', marginTop: '10px' }}>
                    <Check size={16} />
                    <span>Register Myself</span>
                  </button>

                  <p className="text-dim" style={{ fontSize: '11px', textAlign: 'center', marginTop: '4px' }}>
                    🔒 Privacy Assured: Self-registration data is kept strictly confidential.
                  </p>
                </form>
              </div>

              {/* Aside: Event Info & Guidelines */}
              <div className="side-forms-pane">
                <div className="card">
                  <h3>Event Overview</h3>
                  <div className="details-stack" style={{ marginTop: '14px' }}>
                    <div className="detail-row">
                      <Calendar size={16} className="meta-icon" />
                      <div>
                        <strong>Date & Time</strong>
                        <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>
                          Sat, 24 Oct 2026 · 10:00 AM – 1:00 PM
                        </p>
                      </div>
                    </div>
                    <div className="detail-row">
                      <MapPin size={16} className="meta-icon" />
                      <div>
                        <strong>Venue Location</strong>
                        <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>
                          AU-QUASAR Innovation Center<br />Alliance University, Bengaluru
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '16px' }}>
                  <h3>Participant Guidelines</h3>
                  <div className="guidelines-stack" style={{ marginTop: '12px' }}>
                    <div className="guideline-row">
                      <span className="bullet green">✓</span>
                      <span>This form is for individual self-registration.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet purple">♙</span>
                      <span>You can register only your own participant profile.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet blue">♧</span>
                      <span>Attendee lists are restricted to administrators for privacy.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet amber">ℹ</span>
                      <span>Please carry a valid government or college ID card.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet pink">✉</span>
                      <span>You will receive an instant digital registration badge.</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '16px' }}>
                  <h3>Need Assistance?</h3>
                  <p className="text-muted" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    For queries or technical support, visit the Help Desk in Block B foyer or speak with event organizers.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 3: ANNOUNCEMENTS ================= */}
        {activeTab === 'announcements' && (
          <section className="portal-tab-content" key="announcements">
            <div className="welcome-section" style={{ marginBottom: '16px' }}>
              <h1 className="portal-heading">Announcements</h1>
              <p className="portal-sub">Live updates, logistical guidance, and schedule announcements.</p>
            </div>

            <div className="layout-two-pane">
              {/* Main Announcements Feed */}
              <div>
                <div className="search-filter-row" style={{ marginBottom: '16px' }}>
                  <div className="input-field" style={{ flex: 1, minWidth: '220px' }}>
                    <Search size={15} className="field-icon" />
                    <input
                      placeholder="Search announcements..."
                      value={annSearch}
                      onChange={(e) => setAnnSearch(e.target.value)}
                    />
                  </div>

                  <select
                    style={{ maxWidth: '170px' }}
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                  >
                    <option>All Categories</option>
                    <option>General</option>
                    <option>Logistics</option>
                    <option>Registration</option>
                    <option>Schedule</option>
                    <option>Activity</option>
                    <option>Guidelines</option>
                    <option>Opportunity</option>
                  </select>

                  <select
                    style={{ maxWidth: '140px' }}
                    value={annSort}
                    onChange={(e) => setAnnSort(e.target.value)}
                  >
                    <option value="new">Latest First</option>
                    <option value="old">Oldest First</option>
                  </select>
                </div>

                <div className="announcements-feed">
                  {filteredAnnouncements.map((a) => (
                    <div key={a.id} className="announcement-card">
                      <div className="announcement-round-icon">⚑</div>
                      <div className="announcement-content">
                        <h4>
                          {a.title}{' '}
                          <span className={`pill ${getTagClass(a.type)}`}>
                            {a.type}
                          </span>
                        </h4>
                        <p>{a.message}</p>
                      </div>
                      <div className="announcement-time-box">
                        <strong>{a.date.split(', ')[0]}</strong>
                        <small>{a.date.split(', ')[1]}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aside: Categories Guide */}
              <div className="side-forms-pane">
                <div className="card">
                  <h3>Event Venue Details</h3>
                  <div className="details-stack" style={{ marginTop: '12px' }}>
                    <div className="detail-row">
                      <Calendar size={16} className="meta-icon" />
                      <div>
                        <strong>Date</strong>
                        <small>Saturday, 24 October 2026</small>
                      </div>
                    </div>
                    <div className="detail-row">
                      <Clock size={16} className="meta-icon" />
                      <div>
                        <strong>Time</strong>
                        <small>10:00 AM – 1:00 PM</small>
                      </div>
                    </div>
                    <div className="detail-row">
                      <MapPin size={16} className="meta-icon" />
                      <div>
                        <strong>Venue</strong>
                        <small>AU-QUASAR, Alliance University</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '16px' }}>
                  <h3>Category Directory</h3>
                  <div className="category-legend-list" style={{ marginTop: '12px' }}>
                    <p>🔵 <b>General</b> — Key event notices & welcomes</p>
                    <p>🟣 <b>Logistics</b> — Venue maps, directions, parking</p>
                    <p>🟢 <b>Registration</b> — Badge verification & passes</p>
                    <p>🟠 <b>Schedule</b> — Session times & keynote updates</p>
                    <p>🔹 <b>Guidelines</b> — Hardware, tools, safety rules</p>
                    <p>🩷 <b>Activity</b> — Team formation & sprints</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 4: EVENT FLOW ================= */}
        {activeTab === 'eventflow' && (
          <section className="portal-tab-content" key="eventflow">
            <div className="welcome-section" style={{ marginBottom: '16px' }}>
              <h1 className="portal-heading">
                Event Flow <span className="pill pill-cyan">Agenda</span>
              </h1>
              <p className="portal-sub">Chronological itinerary and activity breakdown.</p>
            </div>

            {/* Stepper Header */}
            <div className="card" style={{ marginBottom: '18px' }}>
              <div className="flow-stepper-row">
                <div className="flow-step">
                  <div className="flow-step-icon green">1</div>
                  <strong>1. Registration</strong>
                  <small style={{ color: 'var(--accent-green)' }}>8:30 – 10:00 AM</small>
                </div>
                <div className="flow-step">
                  <div className="flow-step-icon blue">2</div>
                  <strong>2. Welcome</strong>
                  <small>10:00 – 10:15 AM</small>
                </div>
                <div className="flow-step">
                  <div className="flow-step-icon purple">3</div>
                  <strong>3. Idea to Impact</strong>
                  <small>10:15 – 10:45 AM</small>
                </div>
                <div className="flow-step">
                  <div className="flow-step-icon pink">4</div>
                  <strong>4. Team Formation</strong>
                  <small>10:45 – 11:30 AM</small>
                </div>
                <div className="flow-step">
                  <div className="flow-step-icon amber">5</div>
                  <strong>5. Build & Explore</strong>
                  <small>11:30 – 12:30 PM</small>
                </div>
                <div className="flow-step">
                  <div className="flow-step-icon cyan">6</div>
                  <strong>6. Team Pitches</strong>
                  <small>12:30 – 1:00 PM</small>
                </div>
              </div>
            </div>

            {/* Detailed Timeline List */}
            <div className="layout-two-pane">
              <div className="flow-card-stack">
                <div className="flow-card-item">
                  <div className="flow-number-badge green">1</div>
                  <div className="flow-card-content">
                    <h3>Registration & Check-In</h3>
                    <div className="text-dim" style={{ fontSize: '11.5px' }}>◷ 8:30 AM – 10:00 AM</div>
                    <p>Participants arrive, verify credentials, and receive their smart access badge and event kit.</p>
                    <div className="flow-activity-list">
                      <strong>Key Activities</strong>
                      <span>● QR code / Photo ID verification</span>
                      <span>● Event kit & stickers distribution</span>
                      <span>● Help desk and Wi-Fi credential support</span>
                    </div>
                  </div>
                </div>

                <div className="flow-card-item">
                  <div className="flow-number-badge blue">2</div>
                  <div className="flow-card-content">
                    <h3>Opening & Welcome Address</h3>
                    <div className="text-dim" style={{ fontSize: '11.5px' }}>◷ 10:00 AM – 10:15 AM</div>
                    <p>Inauguration and welcome briefing by Alliance University leadership and the AU-QUASAR team.</p>
                    <div className="flow-activity-list">
                      <strong>Key Activities</strong>
                      <span>● Welcome speech by leadership</span>
                      <span>● Overview of event tracks & objectives</span>
                      <span>● Introduction to mentors and speakers</span>
                    </div>
                  </div>
                </div>

                <div className="flow-card-item">
                  <div className="flow-number-badge purple">3</div>
                  <div className="flow-card-content">
                    <h3>Idea to Impact: Setting the Stage</h3>
                    <div className="text-dim" style={{ fontSize: '11.5px' }}>◷ 10:15 AM – 10:45 AM</div>
                    <p>Keynote session on solving real problems, modern AI paradigms, and engineering for societal impact.</p>
                    <div className="flow-activity-list">
                      <strong>Key Activities</strong>
                      <span>● Keynote presentation</span>
                      <span>● Real-world case study breakdowns</span>
                      <span>● Interactive Q&A session</span>
                    </div>
                  </div>
                </div>

                <div className="flow-card-item">
                  <div className="flow-number-badge pink">4</div>
                  <div className="flow-card-content">
                    <h3>Team Formation & Problem Statements</h3>
                    <div className="text-dim" style={{ fontSize: '11.5px' }}>◷ 10:45 AM – 11:30 AM</div>
                    <p>Participants connect across domains, pitch rough concepts, form teams, and choose challenge briefs.</p>
                    <div className="flow-activity-list">
                      <strong>Key Activities</strong>
                      <span>● Cross-team matchmaking</span>
                      <span>● Problem statement briefing</span>
                      <span>● Mentor interaction and alignment</span>
                    </div>
                  </div>
                </div>

                <div className="flow-card-item">
                  <div className="flow-number-badge amber">5</div>
                  <div className="flow-card-content">
                    <h3>Build, Explore & Mentor Sessions</h3>
                    <div className="text-dim" style={{ fontSize: '11.5px' }}>◷ 11:30 AM – 12:30 PM</div>
                    <p>Teams build out prototypes with continuous feedback and technical guidance from industry mentors.</p>
                    <div className="flow-activity-list">
                      <strong>Key Activities</strong>
                      <span>● Hands-on coding and lab sprint</span>
                      <span>● Mentor support and architecture review</span>
                      <span>● Prototype demo preparations</span>
                    </div>
                  </div>
                </div>

                <div className="flow-card-item">
                  <div className="flow-number-badge cyan">6</div>
                  <div className="flow-card-content">
                    <h3>Team Pitches & Closing</h3>
                    <div className="text-dim" style={{ fontSize: '11.5px' }}>◷ 12:30 PM – 1:00 PM</div>
                    <p>Teams present live prototypes, followed by juror awards, accelerator entries, and closing remarks.</p>
                    <div className="flow-activity-list">
                      <strong>Key Activities</strong>
                      <span>● 3-minute team presentations</span>
                      <span>● Mentor & jury feedback</span>
                      <span>● Certificate distribution & networking lunch</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aside: Important Notes & Resources */}
              <div className="side-forms-pane">
                <div className="card">
                  <h3>Event Summary</h3>
                  <div className="details-stack" style={{ marginTop: '12px' }}>
                    <div className="detail-row">
                      <Calendar size={16} className="meta-icon" />
                      <div>
                        <strong>Sat, 24 Oct 2026</strong>
                        <small>10:00 AM – 1:00 PM</small>
                      </div>
                    </div>
                    <div className="detail-row">
                      <MapPin size={16} className="meta-icon" />
                      <div>
                        <strong>AU-QUASAR</strong>
                        <small>Alliance University, Bengaluru</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '16px' }}>
                  <h3>Important Notes</h3>
                  <div className="guidelines-stack" style={{ marginTop: '12px' }}>
                    <div className="guideline-row">
                      <span className="bullet green">•</span>
                      <span>Please arrive at least 15 minutes before opening.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet purple">•</span>
                      <span>Carry a valid ID card for check-in verification.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet blue">•</span>
                      <span>Follow the event schedule and be on time.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet amber">•</span>
                      <span>Complimentary lunch and refreshments are provided.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet pink">•</span>
                      <span>Visit the help desk in Block B for assistance.</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '16px' }}>
                  <h3>Event Resources</h3>
                  <div className="resource-list" style={{ marginTop: '10px' }}>
                    <a href="#pdf" className="resource-item" onClick={(e) => { e.preventDefault(); showToast('Downloading Schedule PDF...'); }}>
                      <FileText size={15} />
                      <span>Event Schedule (PDF)</span>
                      <Download size={13} className="download-ico" />
                    </a>
                    <a href="#map" className="resource-item" onClick={(e) => { e.preventDefault(); showToast('Opening Campus Map...'); }}>
                      <MapPin size={15} />
                      <span>Campus & Venue Map</span>
                      <Download size={13} className="download-ico" />
                    </a>
                    <a href="#code" className="resource-item" onClick={(e) => { e.preventDefault(); showToast('Opening Code of Conduct...'); }}>
                      <FileText size={15} />
                      <span>Code of Conduct</span>
                      <Download size={13} className="download-ico" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
