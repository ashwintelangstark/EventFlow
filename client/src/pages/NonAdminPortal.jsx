import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
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
  Globe,
  QrCode,
  Ticket,
  Building2
} from 'lucide-react';
import './NonAdminPortal.css';
import { downloadEventFlowAsImage } from '../utils/downloadScheduleImage';

const DEFAULT_STAGES = [
  {
    step: 1,
    time: "10:00–10:15 AM",
    title: "Welcome Address",
    speaker: "AU-QUASAR Management",
    desc: "Inaugural welcome and event overview by the AU-QUASAR leadership team.",
    color: "cyan",
    activities: [
      "Inauguration & welcome to IDEA > AI > IMPACT",
      "Overview of the Deep-Tech Innovation Lab",
      "Key guidelines and team introductions"
    ]
  },
  {
    step: 2,
    time: "10:15–10:30 AM",
    title: "Chief Guest Address",
    speaker: "Shri. Mahadesha V · Director, STPI - Bengaluru",
    desc: "Keynote address on India's deep-tech landscape and software technology parks ecosystem.",
    color: "purple",
    activities: [
      "Address on fostering deep-tech incubation",
      "Industry-academia innovation pathways",
      "Government initiatives and support for startups"
    ]
  },
  {
    step: 3,
    time: "10:30–10:45 AM",
    title: "Dr. Kadiyali Srivatsa",
    speaker: "Dr. Kadiyali Srivatsa",
    desc: "Session topic to be announced · Key research & industry perspective.",
    color: "blue",
    activities: [
      "Special technical address",
      "Deep-tech problem frameworks",
      "Interactive attendee perspective"
    ]
  },
  {
    step: 4,
    time: "10:45–11:00 AM",
    title: "DataDice & CommunIDy™",
    speaker: "Bhanu Surya on the company and the CommunIDy™ product",
    desc: "Introducing DataDice Technologies and showcasing the CommunIDy™ innovation product.",
    color: "cyan",
    activities: [
      "Presentation of DataDice & CommunIDy™ architecture",
      "Real-world application demonstrations",
      "Opportunities for collaboration and student tracks"
    ]
  },
  {
    step: 5,
    time: "11:00–11:15 AM",
    title: "Snacks Break",
    speaker: "Networking & Refreshments",
    desc: "Networking break with refreshments at the Innovation Courtyard.",
    color: "amber",
    activities: [
      "Artisan snacks & tea/coffee break",
      "Informal networking between participants and mentors",
      "Room briefing for competition rounds"
    ]
  },
  {
    step: 6,
    time: "11:15 AM–12:00 PM",
    title: "Round 1 - Three Rooms",
    speaker: "Students, startups and enthusiasts compete in three different rooms",
    desc: "Intensive innovation track where participants present and compete across parallel evaluation rooms.",
    color: "purple",
    activities: [
      "Parallel room track competitions (Students, Startups, Enthusiasts)",
      "Domain-specific problem statement pitches",
      "Shortlisting for the final room round"
    ]
  },
  {
    step: 7,
    time: "12:00–12:40 PM",
    title: "Final Round",
    speaker: "Top two from each room - six finalists",
    desc: "Six finalist teams face the central jury to pitch their prototypes and solutions.",
    color: "blue",
    activities: [
      "Top 6 team presentations (2 from each room)",
      "Live prototype demonstrations & defense",
      "High-impact deep-tech evaluation"
    ]
  },
  {
    step: 8,
    time: "12:40–12:50 PM",
    title: "Jury Deliberation",
    speaker: "The jury panel decides the winners",
    desc: "Closed evaluation session by expert jury members to finalize awards and rankings.",
    color: "cyan",
    activities: [
      "Scoring consolidation across rubric dimensions",
      "Jury debate and final winner selection",
      "Preparation of awards and citations"
    ]
  },
  {
    step: 9,
    time: "12:50–1:00 PM",
    title: "Winners & Closing",
    speaker: "Winners announced, event closes",
    desc: "Announcement of top winners, certificate distribution, and concluding remarks.",
    color: "amber",
    activities: [
      "Awards ceremony and winner declarations",
      "Closing remarks from DataDice & Alliance University leadership",
      "Photo session and next step accelerator announcements"
    ]
  }
];

export const NonAdminPortal = ({ onGoToLanding }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('registrations');
  const [toast, setToast] = useState('');

  // Live synced state from Supabase backend
  const [registrations, setRegistrations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [eventStages, setEventStages] = useState(DEFAULT_STAGES);
  const [myPass, setMyPass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Self-Registration Form State
  const [selfForm, setSelfForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: user?.category || 'Student',
    organization: user?.organization || 'Alliance University',
    designation: user?.designation || '',
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

  // Live polling synchronization
  const refreshData = async () => {
    try {
      const [regsData, annsData, flowData] = await Promise.allSettled([
        api.getRegistrations(),
        api.getAnnouncements(),
        api.getEventFlow()
      ]);

      if (regsData.status === 'fulfilled') {
        const raw = regsData.value;
        const attendeesList = Array.isArray(raw)
          ? raw
          : (Array.isArray(raw?.attendees) ? raw.attendees : []);

        setRegistrations(attendeesList);
        if (user?.email && attendeesList.length > 0) {
          const found = attendeesList.find(
            (r) => (r.email || '').toLowerCase() === user.email.toLowerCase()
          );
          if (found) {
            setMyPass(found);
            // Prepopulate selfForm with their actual registered details from database!
            setSelfForm((prev) => ({
              ...prev,
              fullName: found.name || prev.fullName,
              email: found.email || prev.email,
              phone: found.phone || prev.phone,
              organization: found.organization || prev.organization,
              designation: found.designation || prev.designation,
              department: found.department || prev.department,
              category: found.category || prev.category,
              diet: found.dietaryPreference || prev.diet,
              interests: (Array.isArray(found.areasOfInterest) && found.areasOfInterest.length > 0) ? found.areasOfInterest : prev.interests,
              extra: found.notes || prev.extra
            }));
          } else {
            setMyPass(null);
          }
        } else {
          setMyPass(null);
        }
      }

      if (annsData.status === 'fulfilled') {
        const rawAnn = annsData.value;
        const list = Array.isArray(rawAnn)
          ? rawAnn
          : (Array.isArray(rawAnn?.announcements) ? rawAnn.announcements : []);
        setAnnouncements(list);
      }

      if (flowData.status === 'fulfilled') {
        const rawFlow = flowData.value;
        const stagesList = Array.isArray(rawFlow)
          ? rawFlow
          : (Array.isArray(rawFlow?.stages) ? rawFlow.stages : []);
        if (stagesList.length > 0) {
          setEventStages(stagesList);
        }
      }
    } catch (err) {
      console.warn('Sync refresh error in NonAdminPortal:', err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Sync user info into form if state updates
  useEffect(() => {
    if (user?.name || user?.email) {
      setSelfForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        organization: prev.organization || user.organization || 'Alliance University',
        designation: prev.designation || user.designation || '',
        category: prev.category || user.category || 'Student'
      }));
    }
  }, [user]);

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

  const handleSelfRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selfForm.fullName || !selfForm.email) return;

    setIsSubmitting(true);
    const regPayload = {
      userId: user?.id || null,
      name: selfForm.fullName.trim(),
      email: selfForm.email.trim().toLowerCase(),
      phone: selfForm.phone.trim(),
      category: selfForm.category || 'Student',
      organization: selfForm.organization.trim() || 'Alliance University',
      designation: selfForm.designation.trim() || 'Participant',
      department: selfForm.department.trim() || '',
      dietaryPreference: selfForm.diet || 'No preference',
      areasOfInterest: selfForm.interests || [],
      notes: selfForm.extra || '',
      ticketType: selfForm.category === 'Founder / Startup' ? 'VIP Pass' : 'Standard Pass',
      status: 'Registered',
      checkedIn: false
    };

    try {
      const res = await api.addRegistration(regPayload);
      const saved = res?.attendee || res || regPayload;
      const passData = {
        ...regPayload,
        ...saved,
        status: saved.status === 'Checked In' ? 'Checked In' : 'Registered'
      };
      setMyPass(passData);
      showToast(`Registration saved! You are now officially registered, ${selfForm.fullName}.`);
      await refreshData();
    } catch (err) {
      console.error('Registration submission error:', err);
      showToast(`Registration failed: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };



  // Filtered Announcements
  let filteredAnnouncements = announcements.filter((a) => {
    const matchQ = ((a.title || '') + ' ' + (a.message || '')).toLowerCase().includes(annSearch.toLowerCase());
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
          <button type="button" className="sidebar-logout-btn" onClick={logout}>
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="nonadmin-main">
        {/* TOPBAR */}
        <header className="nonadmin-topbar">
          <div className="topbar-left-meta">
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
            <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'P'}</div>
            <div>
              <strong>{user?.name || 'Participant'}</strong>
              <small>{user?.role === 'staff' ? 'Event Staff' : 'Participant'}</small>
            </div>
          </div>
        </header>



        {/* ================= TAB 2: REGISTRATIONS ================= */}
        {activeTab === 'registrations' && (
          <section className="portal-tab-content" key="registrations">
            <div className="welcome-section" style={{ marginBottom: '16px' }}>
              <h1 className="portal-heading">Registrations</h1>
              <p className="portal-sub">Register yourself for the event pass or view your active badge credentials.</p>
            </div>

            <div className="layout-two-pane">
              {/* Registration Form / Status Card */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <h3>Participant Self-Registration</h3>
                    <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                      Please provide your accurate details. Your registration will sync immediately to the Admin Portal.
                    </p>
                  </div>
                  <span className="pill pill-cyan">Live Sync</span>
                </div>

                {myPass ? (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 212, 163, 0.12), rgba(28, 127, 255, 0.12))',
                    border: '1px solid rgba(16, 212, 163, 0.35)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '18px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-green)', fontWeight: 600 }}>
                          ✓ Registered Event Pass
                        </div>
                        <h4 style={{ margin: '4px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
                          {myPass.name}
                        </h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {myPass.organization} · <span className="pill pill-purple">{myPass.category}</span>
                          {myPass.phone && ` · 📞 ${myPass.phone}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`pill ${myPass.checkedIn || myPass.status === 'Checked In' ? 'pill-green' : 'pill-cyan'}`} style={{ fontWeight: 600 }}>
                          {myPass.checkedIn || myPass.status === 'Checked In' ? 'Checked In' : 'Registered'}
                        </span>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          ID: #{myPass.id || 'SYNCED'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255, 170, 0, 0.08)',
                    border: '1px solid rgba(255, 170, 0, 0.25)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-amber)' }}>
                        ⚠️ Event Pass Status: Not Registered Yet
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        You are signed in, but have not registered for this event yet. Enter or verify your details below and click <strong>Register for Event Pass</strong>.
                      </div>
                    </div>
                    <span className="pill pill-amber" style={{ fontWeight: 600 }}>Not Registered</span>
                  </div>
                )}

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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-full"
                    style={{ padding: '12px', marginTop: '10px' }}
                  >
                    <Check size={16} />
                    <span>
                      {isSubmitting
                        ? 'Saving Details...'
                        : (myPass ? '✓ Registered — Update Details' : 'Register for Event Pass')}
                    </span>
                  </button>

                  <p className="text-dim" style={{ fontSize: '11px', textAlign: 'center', marginTop: '4px' }}>
                    🔒 Live Role-Linked: Information submitted here syncs immediately to the Admin Portal.
                  </p>
                </form>
              </div>

              {/* Aside: Event Info & Pass Preview */}
              <div className="side-forms-pane">
                <div className="card">
                  <h3>Event Overview</h3>
                  <div className="details-stack" style={{ marginTop: '14px' }}>
                    <div className="detail-row">
                      <Calendar size={16} className="meta-icon" />
                      <div>
                        <strong>Date & Time</strong>
                        <p className="text-muted" style={{ margin: 0, fontSize: '12px' }}>
                          Sat, 24 Oct 2026 · 10:00 AM – 1:00 PM IST
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
                      <span>This form registers your official event credentials.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet purple">♙</span>
                      <span>Your badge and profile sync directly to the Admin Portal.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet blue">♧</span>
                      <span>Restricted admin controls ensure participant data privacy.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet amber">ℹ</span>
                      <span>Please carry a valid government or college ID card.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet pink">✉</span>
                      <span>Digital check-in available at the door via QR pass.</span>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '16px', textAlign: 'center' }}>
                  <h3>Registration QR Pass</h3>
                  <div style={{ marginTop: '12px' }}>
                    <img
                      src="/images/Eventflow.png"
                      alt="EventFlow Registration Pass QR"
                      style={{ width: '130px', height: '130px', margin: '0 auto', display: 'block', borderRadius: '8px', background: '#fff', padding: '6px' }}
                    />
                    <p className="text-dim" style={{ fontSize: '11px', marginTop: '8px' }}>
                      Present this QR pass at the entrance on event day for instant check-in.
                    </p>
                  </div>
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
              <p className="portal-sub">Live updates, logistical guidance, and schedule notices broadcast by organizers.</p>
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
                  {filteredAnnouncements.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '50px 20px',
                      background: 'var(--bg-card)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)'
                    }}>
                      <Bell size={32} style={{ opacity: 0.35, marginBottom: '10px' }} />
                      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 6px 0', fontSize: '15px' }}>No Announcements Found</h4>
                      <p style={{ margin: 0, fontSize: '12.5px' }}>
                        Announcements published from the Admin Portal will automatically broadcast here in real time.
                      </p>
                    </div>
                  ) : (
                    filteredAnnouncements.map((a) => (
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
                          <strong>{(a.date || '').split(', ')[0] || 'Today'}</strong>
                          <small>{(a.date || '').split(', ')[1] || 'Live'}</small>
                        </div>
                      </div>
                    ))
                  )}
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
                        <small>10:00 AM – 1:00 PM IST</small>
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
            <div className="welcome-section" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 className="portal-heading">
                  Event Flow <span className="pill pill-cyan">Agenda</span>
                </h1>
                <p className="portal-sub">Chronological itinerary and schedule breakdown based on the official event program.</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => downloadEventFlowAsImage(eventStages)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', fontSize: '12px' }}
                title="Download complete schedule as high-resolution image"
              >
                <Download size={15} />
                <span>Download Flow as Image</span>
              </button>
            </div>

            {/* Stepper Header with 9 Official Stages */}
            <div className="card" style={{ marginBottom: '18px' }}>
              <div className="flow-stepper-row">
                {eventStages.map((stage) => (
                  <div key={stage.step} className="flow-step">
                    <div className={`flow-step-icon ${stage.color || 'blue'}`}>{stage.step}</div>
                    <strong style={{ fontSize: '11.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {stage.title}
                    </strong>
                    <small style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>{stage.time}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Timeline List */}
            <div className="layout-two-pane">
              <div className="flow-card-stack">
                {eventStages.map((stage) => (
                  <div key={stage.step} className="flow-card-item">
                    <div className={`flow-number-badge ${stage.color || 'blue'}`}>{stage.step}</div>
                    <div className="flow-card-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 2px 0' }}>{stage.title}</h3>
                          <div style={{ color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 600 }}>
                            {stage.speaker}
                          </div>
                        </div>
                        <div className="text-dim" style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          ◷ {stage.time}
                        </div>
                      </div>
                      <p style={{ marginTop: '6px' }}>{stage.desc}</p>
                      {stage.activities && stage.activities.length > 0 && (
                        <div className="flow-activity-list">
                          <strong>Key Highlights</strong>
                          {stage.activities.map((act, idx) => (
                            <span key={idx}>● {act}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                        <small>10:00 AM – 1:00 PM IST</small>
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
                      <span>Please arrive by 9:45 AM before opening address.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet purple">•</span>
                      <span>Carry your student ID / government ID for verification.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet blue">•</span>
                      <span>Teams will be divided across three rooms in Round 1.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet amber">•</span>
                      <span>Snacks and artisan refreshments served at 11:00 AM.</span>
                    </div>
                    <div className="guideline-row">
                      <span className="bullet pink">•</span>
                      <span>Final round presentations will be evaluated by jury.</span>
                    </div>
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
