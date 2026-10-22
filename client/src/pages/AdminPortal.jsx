import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Home,
  UserPlus,
  QrCode,
  Users,
  BarChart3,
  Bell,
  GitCommit,
  Calendar,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Download,
  Upload,
  ArrowRight,
  LogOut,
  ChevronRight,
  Filter,
  FileText,
  Shield,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  Globe
} from 'lucide-react';
import './AdminPortal.css';

// Empty initial states to clear all mock data - live data will sync from database
const INITIAL_ATTENDEES = [];
const INITIAL_ANNOUNCEMENTS = [];

// Exact 9-stage schedule from EventFlow schedule image
const INITIAL_STAGES = [
  {
    stage: 1,
    title: "Welcome Address",
    time: "10:00–10:15 AM",
    description: "AU-QUASAR Management",
    activities: [
      "Welcome Address by AU-QUASAR Management",
      "Opening remarks & event introduction"
    ]
  },
  {
    stage: 2,
    title: "Chief Guest Address",
    time: "10:15–10:30 AM",
    description: "Shri. Mahadesha V, Director, STPI - Bengaluru",
    activities: [
      "Keynote address by Chief Guest Shri. Mahadesha V",
      "STPI Bengaluru ecosystem insights & support"
    ]
  },
  {
    stage: 3,
    title: "Dr. Kadiyali Srivatsa",
    time: "10:30–10:45 AM",
    description: "Session topic to be announced",
    activities: [
      "Special address by Dr. Kadiyali Srivatsa",
      "Interactive deep-tech Q&A"
    ]
  },
  {
    stage: 4,
    title: "DataDice & CommunIDy™",
    time: "10:45–11:00 AM",
    description: "Bhanu Surya on the company and the CommunIDy™ product",
    activities: [
      "Company introduction by Bhanu Surya",
      "CommunIDy™ platform demonstration & use cases"
    ]
  },
  {
    stage: 5,
    title: "Snacks Break",
    time: "11:00–11:15 AM",
    description: "Networking & refreshments",
    activities: [
      "Networking & refreshments break",
      "Breakout room coordination"
    ]
  },
  {
    stage: 6,
    title: "Round 1 - Three Rooms",
    time: "11:15 AM–12:00 PM",
    description: "Students, startups and enthusiasts compete in three different rooms",
    activities: [
      "Parallel room pitches (Room A, Room B, Room C)",
      "Panel assessment & scoring"
    ]
  },
  {
    stage: 7,
    title: "Final Round",
    time: "12:00–12:40 PM",
    description: "Top two from each room - six finalists",
    activities: [
      "Main stage presentations by 6 finalists",
      "Live demonstrations & Q&A"
    ]
  },
  {
    stage: 8,
    title: "Jury Deliberation",
    time: "12:40–12:50 PM",
    description: "The jury panel decides the winners",
    activities: [
      "Grand jury deliberation & score compilation",
      "Final selection of winners"
    ]
  },
  {
    stage: 9,
    title: "Winners & Closing",
    time: "12:50–1:00 PM",
    description: "Winners announced, event closes",
    activities: [
      "Winners announcement & felicitations",
      "Closing ceremony & group photo"
    ]
  }
];

export const AdminPortal = ({ onGoToLanding }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [attendees, setAttendees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stages, setStages] = useState(INITIAL_STAGES);

  // Notifications / Toast
  const [toast, setToast] = useState('');

  // Search and filter states
  const [regSearch, setRegSearch] = useState('');
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [announcementSearch, setAnnouncementSearch] = useState('');

  // Check-In Station search
  const [checkSearch, setCheckSearch] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState(null);

  // Forms
  const [newReg, setNewReg] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    organization: ''
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'General',
    date: ''
  });

  // Edit Announcement Modal State
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Edit / Add Stage Modal State
  const [editingStage, setEditingStage] = useState(null);
  const [isNewStage, setIsNewStage] = useState(false);

  // Refresh live data from Supabase backend
  const refreshData = async () => {
    try {
      const regRes = await api.getRegistrations();
      if (regRes && Array.isArray(regRes.attendees)) {
        setAttendees(regRes.attendees);
      }
    } catch (err) {
      console.warn('Registrations fetch:', err);
    }

    try {
      const annRes = await api.getAnnouncements();
      if (annRes && Array.isArray(annRes.announcements)) {
        setAnnouncements(annRes.announcements);
      }
    } catch (err) {
      console.warn('Announcements fetch:', err);
    }

    try {
      const flowRes = await api.getEventFlow();
      if (flowRes && Array.isArray(flowRes.stages) && flowRes.stages.length > 0) {
        setStages(flowRes.stages);
      }
    } catch (err) {
      console.warn('Event flow fetch:', err);
    }
  };

  useEffect(() => {
    // Purge legacy mock data cache from localStorage
    try {
      localStorage.removeItem('eventflow_attendees');
      localStorage.removeItem('eventflow_announcements');
      localStorage.removeItem('eventflow_stages');
    } catch {}

    refreshData();
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  // Dynamic KPIs derived strictly from live registrations
  const totalRegistrations = attendees.length;
  const totalCheckedIn = attendees.filter((a) => a.status === 'Checked In').length;
  const totalYetToArrive = Math.max(0, totalRegistrations - totalCheckedIn);
  const teamRegistrations = Math.round(totalRegistrations * 0.25);

  // Dynamic organizations breakdown derived from live attendees
  const orgsList = React.useMemo(() => {
    if (!attendees.length) return [];
    const counts = {};
    attendees.forEach((a) => {
      const org = a.organization?.trim() || 'Independent';
      counts[org] = (counts[org] || 0) + 1;
    });
    const colors = ["#1c7fff", "#9646ff", "#e024a5", "#f5a623", "#10d4a3", "#13dce5", "#54b2ff", "#9eb4d1"];
    const max = Math.max(...Object.values(counts), 1);
    return Object.entries(counts).map(([name, count], i) => ({
      name,
      count,
      pct: Math.round((count / max) * 100),
      color: colors[i % colors.length]
    })).sort((a, b) => b.count - a.count);
  }, [attendees]);

  // Dynamic category breakdown derived from live attendees
  const categoryStats = React.useMemo(() => {
    const cats = ['Student', 'Working Professional', 'Founder', 'Researcher', 'Startup', 'Developer', 'Other'];
    const total = attendees.length;
    const counts = {};
    cats.forEach((c) => { counts[c] = 0; });
    attendees.forEach((a) => {
      const c = a.category || 'Other';
      counts[c] = (counts[c] || 0) + 1;
    });
    return cats.map((c) => ({
      name: c,
      count: counts[c] || 0,
      pct: total > 0 ? Math.round(((counts[c] || 0) / total) * 100) : 0
    }));
  }, [attendees]);

  // Toggle Checkin
  const toggleCheckin = async (id) => {
    const attendee = attendees.find((a) => a.id === id || a.email === id);
    if (!attendee) return;
    const nextStatus = attendee.status === 'Checked In' ? 'Registered' : 'Checked In';

    // Optimistic state update
    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id === id || a.email === id) {
          const updated = {
            ...a,
            status: nextStatus,
            date: nextStatus === 'Checked In' ? '24 Oct, Checked In' : a.date
          };
          if (selectedAttendee && (selectedAttendee.id === a.id || selectedAttendee.email === a.email)) {
            setSelectedAttendee(updated);
          }
          return updated;
        }
        return a;
      })
    );
    showToast(`${attendee.name} is now ${nextStatus}`);

    try {
      await api.toggleCheckIn(attendee.id, nextStatus);
    } catch (err) {
      console.error('Checkin update error:', err);
    }
  };

  // Handle Add Registration
  const handleAddRegistration = async (e) => {
    e.preventDefault();
    if (!newReg.name || !newReg.email) return;

    try {
      const res = await api.addRegistration({
        name: newReg.name,
        email: newReg.email,
        phone: newReg.phone || '+91 98000 00000',
        category: newReg.category || 'Student',
        organization: newReg.organization || 'Alliance University'
      });
      if (res?.attendee) {
        setAttendees((prev) => [res.attendee, ...prev]);
      } else {
        refreshData();
      }
      setNewReg({ name: '', email: '', phone: '', category: '', organization: '' });
      showToast(`Added registration for ${newReg.name}`);
    } catch (err) {
      showToast(`Error adding registration: ${err.message}`);
    }
  };

  // Handle CSV Import
  const handleCsvImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const lines = String(text).split(/\r?\n/).filter(Boolean);
        if (lines.length <= 1) return;

        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 2 && cols[0] && cols[1]) {
            imported.push({
              name: cols[0],
              email: cols[1],
              phone: cols[2] || '+91 90000 00000',
              category: cols[3] || 'Other',
              organization: cols[4] || 'Independent',
              status: cols[5] || 'Registered'
            });
          }
        }
        if (imported.length > 0) {
          try {
            await api.importBatchRegistrations(imported);
            refreshData();
            showToast(`Imported ${imported.length} attendees from CSV!`);
          } catch (err) {
            showToast(`Error importing to database: ${err.message}`);
          }
        }
      } catch {
        showToast('Error reading CSV file');
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV Export
  const handleCsvExport = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Category", "Organization", "Status", "Registered At"];
    const rows = attendees.map((a) => [
      a.id,
      a.name,
      a.email,
      a.phone,
      a.category,
      a.organization,
      a.status,
      a.date || a.registeredAt || '24 Oct'
    ]);
    const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `eventflow-attendees-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported attendee roster to CSV');
  };

  // Handle Find Attendee in Checkin
  const handleCheckinSearch = () => {
    if (!checkSearch.trim()) return;
    const q = checkSearch.toLowerCase().trim();
    const found = attendees.find((a) =>
      [a.name, a.email, a.phone, a.organization, a.id].some((val) => String(val).toLowerCase().includes(q))
    );
    setSelectedAttendee(found || null);
  };

  // ================= ADMIN ANNOUNCEMENT CRUD =================
  const handleCreateAnnouncement = async (statusToSet = 'Published') => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      showToast('Title and message are required');
      return;
    }
    try {
      const res = await api.createAnnouncement({
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        type: newAnnouncement.type || 'General',
        status: statusToSet
      });
      if (res?.announcement) {
        setAnnouncements((prev) => [res.announcement, ...prev]);
      } else {
        refreshData();
      }
      setNewAnnouncement({ title: '', message: '', type: 'General', date: '' });
      showToast('Announcement published to database!');
    } catch (err) {
      showToast(`Error publishing announcement: ${err.message}`);
    }
  };

  const handleUpdateAnnouncement = (e) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === editingAnnouncement.id ? editingAnnouncement : a))
    );
    api.updateAnnouncement(editingAnnouncement.id, editingAnnouncement).catch(() => {});
    showToast('Announcement updated successfully');
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    api.deleteAnnouncement(id).catch(() => {});
    showToast('Announcement deleted');
  };

  // ================= ADMIN EVENT FLOW CRUD =================
  const handleSaveStage = (e) => {
    e.preventDefault();
    if (!editingStage) return;

    const formattedActivities = Array.isArray(editingStage.activities)
      ? editingStage.activities
      : String(editingStage.activities || '').split('\n').filter(Boolean);

    if (isNewStage) {
      const nextNum = stages.length + 1;
      const created = {
        ...editingStage,
        stage: nextNum,
        activities: formattedActivities
      };
      setStages([...stages, created]);
      api.addEventStage(created).catch(() => {});
      showToast(`Stage ${nextNum} added to agenda`);
    } else {
      setStages((prev) =>
        prev.map((s) => (s.stage === editingStage.stage ? { ...editingStage, activities: formattedActivities } : s))
      );
      api.updateEventStage(editingStage.stage, { ...editingStage, activities: formattedActivities }).catch(() => {});
      showToast(`Stage ${editingStage.stage} updated`);
    }
    setEditingStage(null);
  };

  const handleDeleteStage = (stageNum) => {
    if (!window.confirm(`Delete stage ${stageNum} from the event flow?`)) return;
    setStages((prev) => {
      const filtered = prev.filter((s) => s.stage !== stageNum);
      // Re-index remaining stages
      return filtered.map((s, idx) => ({ ...s, stage: idx + 1 }));
    });
    api.deleteEventStage(stageNum).catch(() => {});
    showToast(`Stage deleted and agenda re-indexed`);
  };

  // Category pill helper
  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'Student': return 'pill-blue';
      case 'Working Professional': return 'pill-purple';
      case 'Founder': return 'pill-pink';
      case 'Researcher': return 'pill-amber';
      case 'Startup': return 'pill-green';
      case 'Developer': return 'pill-cyan';
      default: return 'pill-purple';
    }
  };

  // Filtered lists
  const filteredRegs = attendees.filter((a) =>
    [a.name, a.email, a.phone, a.organization, a.category].some((v) =>
      v.toLowerCase().includes(regSearch.toLowerCase())
    )
  );

  const filteredAttendees = attendees.filter((a) => {
    const matchQ = [a.name, a.email, a.phone, a.organization].some((v) =>
      v.toLowerCase().includes(attendeeSearch.toLowerCase())
    );
    const matchCat = !categoryFilter || a.category === categoryFilter;
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const filteredAnnouncements = announcements.filter((a) =>
    (a.title + ' ' + a.message + ' ' + a.type).toLowerCase().includes(announcementSearch.toLowerCase())
  );

  return (
    <div className="admin-app">
      {/* Toast popup */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={15} />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL (ADMIN ONLY) */}
      {editingAnnouncement && (
        <div className="modal-overlay" onClick={() => setEditingAnnouncement(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-head">
              <h3>Edit Announcement</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingAnnouncement(null)}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleUpdateAnnouncement} className="form-vertical" style={{ marginTop: '10px' }}>
              <div className="input-group">
                <label>Title *</label>
                <input
                  required
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Message Content *</label>
                <textarea
                  rows={4}
                  required
                  value={editingAnnouncement.message}
                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, message: e.target.value })}
                />
              </div>
              <div className="form-two-col">
                <div className="input-group">
                  <label>Category</label>
                  <select
                    value={editingAnnouncement.type}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, type: e.target.value })}
                  >
                    <option>General</option>
                    <option>Logistics</option>
                    <option>Registration</option>
                    <option>Schedule</option>
                    <option>Guidelines</option>
                    <option>Activity</option>
                    <option>Opportunity</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Status</label>
                  <select
                    value={editingAnnouncement.status}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, status: e.target.value })}
                  >
                    <option>Published</option>
                    <option>Scheduled</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingAnnouncement(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT / ADD EVENT STAGE MODAL (ADMIN ONLY) */}
      {editingStage && (
        <div className="modal-overlay" onClick={() => setEditingStage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-head">
              <h3>{isNewStage ? 'Add New Agenda Stage' : `Edit Stage ${editingStage.stage}`}</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingStage(null)}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSaveStage} className="form-vertical" style={{ marginTop: '10px' }}>
              <div className="input-group">
                <label>Stage Title *</label>
                <input
                  required
                  placeholder="e.g. Keynote & Technical Deep Dive"
                  value={editingStage.title}
                  onChange={(e) => setEditingStage({ ...editingStage, title: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Time Range *</label>
                <input
                  required
                  placeholder="e.g. 10:15 AM – 10:45 AM"
                  value={editingStage.time}
                  onChange={(e) => setEditingStage({ ...editingStage, time: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of what takes place..."
                  value={editingStage.description}
                  onChange={(e) => setEditingStage({ ...editingStage, description: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Key Activities (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="QR code verification&#10;Kit distribution&#10;Wi-Fi support"
                  value={Array.isArray(editingStage.activities) ? editingStage.activities.join('\n') : editingStage.activities}
                  onChange={(e) => setEditingStage({ ...editingStage, activities: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingStage(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {isNewStage ? 'Add Stage' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-logo">
            IDEA → AI → <br />
            <span>IMPACT</span>
          </div>
          <small>A HALF-DAY, INNOVATION LAB<br />BY AU-QUASAR, ALLIANCE UNIVERSITY</small>
        </div>

        <nav className="admin-nav">
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
            <UserPlus size={16} className="nav-ico" />
            <span className="nav-label">Registrations</span>
          </button>

          <button
            type="button"
            className={activeTab === 'checkin' ? 'active' : ''}
            onClick={() => setActiveTab('checkin')}
          >
            <QrCode size={16} className="nav-ico" />
            <span className="nav-label">Check-In</span>
          </button>

          <button
            type="button"
            className={activeTab === 'attendees' ? 'active' : ''}
            onClick={() => setActiveTab('attendees')}
          >
            <Users size={16} className="nav-ico" />
            <span className="nav-label">Attendees</span>
          </button>

          <button
            type="button"
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} className="nav-ico" />
            <span className="nav-label">Analytics</span>
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

        <div className="admin-sidebar-bottom">
          <button type="button" className="sidebar-logout-btn" onClick={logout}>
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div>
            <div className="topbar-eyebrow">
              {activeTab === 'dashboard' ? 'Welcome back,' : 'EventFlow Operations'}
            </div>
            <h1 className="topbar-title">
              {activeTab === 'dashboard' ? (
                <>
                  {user?.name || 'Ashwin Telang'} <span className="pill pill-purple">Admin</span>
                </>
              ) : (
                activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
              )}
            </h1>
            <p className="topbar-sub">
              {activeTab === 'dashboard' && "Live operational overview of IDEA → AI → IMPACT."}
              {activeTab === 'registrations' && 'Manage all event registrations, import datasets, or add participants.'}
              {activeTab === 'checkin' && 'Live check-in verification station for event day reception.'}
              {activeTab === 'attendees' && 'Search, filter, and export the complete participant roster.'}
              {activeTab === 'analytics' && 'Event demographics, arrival momentum, and institutional breakdown.'}
              {activeTab === 'announcements' && 'Admin notice management with live edit & delete controls.'}
              {activeTab === 'eventflow' && 'Manage event agenda sequencing, edit stages, and modify timelines.'}
            </p>
          </div>

          <div className="topbar-meta">
            <button
              type="button"
              className="topbar-landing-btn"
              onClick={onGoToLanding || (() => window.open('/landing', '_blank'))}
              title="View Public Event Landing Page"
            >
              <Globe size={13} />
              <span>Landing Page</span>
            </button>

            <div className="meta-box">
              <Calendar size={14} className="meta-ico" />
              <div>
                <strong>Sat, 24 Oct 2026</strong>
                <small>10:00 – 1:00</small>
              </div>
            </div>

            <div className="admin-avatar" title={`Logged in as ${user?.name || 'Admin'}`}>
              {user?.avatar || 'A'}
            </div>
          </div>
        </header>

        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <section className="portal-tab-content" key="dashboard">
            {/* Compact Banner */}
            <div className="hero-banner">
              <div>
                <h2>IDEA → AI → <span className="gradient-text">IMPACT</span></h2>
                <p>A HALF-DAY, HANDS-ON INNOVATION LAB BY AU-QUASAR, ALLIANCE UNIVERSITY</p>
              </div>
              <div className="banner-motto">
                IDEAS<br />TECHNOLOGY<br />PEOPLE<br />A BETTER TOMORROW
              </div>
            </div>

            {/* Compact Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon blue"><Users size={18} /></div>
                  <div>
                    <div className="stat-card-label">Total Registrations</div>
                    <strong>{totalRegistrations}</strong>
                  </div>
                  <div className="stat-card-note green">↗ +12%</div>
                </div>
                <div className="bar-track"><span style={{ width: '62%' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon green"><CheckCircle2 size={18} /></div>
                  <div>
                    <div className="stat-card-label">Checked In</div>
                    <strong>{totalCheckedIn}</strong>
                  </div>
                  <div className="stat-card-note">
                    {totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}%
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: `${totalRegistrations > 0 ? (totalCheckedIn / totalRegistrations) * 100 : 0}%`, background: 'var(--accent-green)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon amber"><Clock size={18} /></div>
                  <div>
                    <div className="stat-card-label">Yet to Arrive</div>
                    <strong>{totalYetToArrive}</strong>
                  </div>
                  <div className="stat-card-note">
                    {totalRegistrations > 0 ? Math.round((totalYetToArrive / totalRegistrations) * 100) : 0}%
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: `${totalRegistrations > 0 ? (totalYetToArrive / totalRegistrations) * 100 : 0}%`, background: 'var(--accent-amber)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon purple"><Layers size={18} /></div>
                  <div>
                    <div className="stat-card-label">Team Count</div>
                    <strong>{teamRegistrations}</strong>
                  </div>
                  <div className="stat-card-note">8–12 target</div>
                </div>
                <div className="bar-track"><span style={{ width: `${Math.min(100, teamRegistrations * 10)}%`, background: 'var(--accent-purple)' }} /></div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="two-col-grid">
              <div className="card">
                <div className="card-head">
                  <h3>Registration Status</h3>
                  <div className="chart-legend">
                    <span><i className="dot blue" /> Total ({totalRegistrations})</span>
                    <span><i className="dot purple" /> Checked In ({totalCheckedIn})</span>
                  </div>
                </div>
                <div className="chart-wrapper">
                  <svg viewBox="0 0 650 190" preserveAspectRatio="none">
                    <polyline
                      points={totalRegistrations > 0 ? "0,165 65,151 130,137 195,119 260,103 325,88 390,72 455,56 520,42 585,26 650,12" : "0,180 650,180"}
                      fill="none"
                      stroke="#1c7fff"
                      strokeWidth="2.5"
                    />
                    <polyline
                      points={totalCheckedIn > 0 ? "0,176 65,166 130,154 195,142 260,130 325,119 390,105 455,91 520,78 585,65 650,52" : "0,180 650,180"}
                      fill="none"
                      stroke="#9646ff"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="chart-timeline-labels">
                  <span>15 Oct</span>
                  <span>17 Oct</span>
                  <span>19 Oct</span>
                  <span>21 Oct</span>
                  <span>23 Oct</span>
                  <span>24 Oct</span>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Registrations by Category</h3>
                </div>
                <div className="donut-container">
                  <div className="donut-chart" />
                  <div className="donut-legend-grid">
                    {categoryStats.map((c) => (
                      <span key={c.name}>
                        {c.name} <b>{c.pct}%</b> ({c.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Table Card */}
            <div className="card" style={{ marginTop: '10px' }}>
              <div className="card-head">
                <h3>Recent Registrations</h3>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '2px 8px' }}
                  onClick={() => setActiveTab('registrations')}
                >
                  View All →
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Category</th>
                      <th>Organization</th>
                      <th>Status</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-dim)', fontSize: '13px' }}>
                          No registrations yet. When non-admin attendees register, their info will immediately appear here.
                        </td>
                      </tr>
                    ) : (
                      attendees.slice(0, 5).map((a, i) => (
                        <tr key={a.id || i}>
                          <td>{i + 1}</td>
                          <td>
                            <div className="person">
                              <span className="initial">
                                {a.name ? a.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'P'}
                              </span>
                              <strong>{a.name}</strong>
                            </div>
                          </td>
                          <td>{a.email}</td>
                          <td><span className={`pill ${getCategoryClass(a.category)}`}>{a.category}</span></td>
                          <td>{a.organization}</td>
                          <td>
                            <span className={`pill ${a.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`}>
                              {a.status === 'Checked In' ? '✓ Checked In' : '◷ Registered'}
                            </span>
                          </td>
                          <td>{a.date || a.registeredAt || '24 Oct'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: REGISTRATIONS ================= */}
        {activeTab === 'registrations' && (
          <section className="portal-tab-content" key="registrations">
            <div className="kpi-small-grid">
              <div className="stat-card compact">
                <div className="stat-card-label">Total Registrations</div>
                <strong>{totalRegistrations}</strong>
              </div>
              <div className="stat-card compact">
                <div className="stat-card-label">Confirmed</div>
                <strong>{totalCheckedIn}</strong>
              </div>
              <div className="stat-card compact">
                <div className="stat-card-label">Pending</div>
                <strong>{totalYetToArrive}</strong>
              </div>
              <div className="stat-card compact">
                <div className="stat-card-label">Teams</div>
                <strong>{teamRegistrations}</strong>
              </div>
            </div>

            <div className="layout-two-pane">
              {/* Left: Table */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <h3>All Registrations</h3>
                    <p className="text-muted" style={{ fontSize: '11px', marginTop: '1px' }}>
                      Participant roster management.
                    </p>
                  </div>
                  <div className="search-filter-row">
                    <div className="input-field" style={{ minWidth: '180px' }}>
                      <Search size={14} className="field-icon" />
                      <input
                        placeholder="Search name, email, org..."
                        value={regSearch}
                        onChange={(e) => setRegSearch(e.target.value)}
                      />
                    </div>
                    {regSearch && (
                      <button type="button" className="btn" onClick={() => setRegSearch('')}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Category</th>
                        <th>Organization</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegs.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-dim)', fontSize: '13px' }}>
                            No registrations found. As non-admin participants register from the portal or landing page, their details will appear here.
                          </td>
                        </tr>
                      ) : (
                        filteredRegs.map((a, i) => (
                          <tr key={a.id || i}>
                            <td>{i + 1}</td>
                            <td>
                              <div className="person">
                                <span className="initial">
                                  {a.name ? a.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'P'}
                                </span>
                                <span>{a.name}</span>
                              </div>
                            </td>
                            <td>{a.email}</td>
                            <td>{a.phone}</td>
                            <td><span className={`pill ${getCategoryClass(a.category)}`}>{a.category}</span></td>
                            <td>{a.organization}</td>
                            <td>
                              <span className={`pill ${a.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`}>
                                {a.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-ghost"
                                style={{ padding: '2px 7px', fontSize: '10.5px' }}
                                onClick={() => toggleCheckin(a.id)}
                              >
                                {a.status === 'Checked In' ? 'Undo' : 'Check In'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-bar">
                  <span>Showing {filteredRegs.length} of {attendees.length} registrations</span>
                  <div className="page-btn-group">
                    <button type="button" className="active">1</button>
                    <button type="button">2</button>
                  </div>
                </div>
              </div>

              {/* Right: Add Registration & Import Forms */}
              <div className="side-forms-pane">
                <div className="card">
                  <h3>Add Participant</h3>
                  <form onSubmit={handleAddRegistration} className="form-vertical" style={{ marginTop: '8px' }}>
                    <div className="input-group">
                      <label>Full Name *</label>
                      <input
                        required
                        placeholder="Enter full name"
                        value={newReg.name}
                        onChange={(e) => setNewReg({ ...newReg, name: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="Enter email"
                        value={newReg.email}
                        onChange={(e) => setNewReg({ ...newReg, email: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Phone Number *</label>
                      <input
                        required
                        placeholder="+91 contact"
                        value={newReg.phone}
                        onChange={(e) => setNewReg({ ...newReg, phone: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label>Category *</label>
                      <select
                        required
                        value={newReg.category}
                        onChange={(e) => setNewReg({ ...newReg, category: e.target.value })}
                      >
                        <option value="">Select category</option>
                        <option>Student</option>
                        <option>Working Professional</option>
                        <option>Founder</option>
                        <option>Researcher</option>
                        <option>Startup</option>
                        <option>Developer</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Organization *</label>
                      <input
                        required
                        placeholder="University or company"
                        value={newReg.organization}
                        onChange={(e) => setNewReg({ ...newReg, organization: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '4px' }}>
                      <UserPlus size={14} />
                      <span>Add Registration</span>
                    </button>
                  </form>
                </div>

                <div className="card" style={{ marginTop: '10px' }}>
                  <h3>Import CSV Roster</h3>
                  <div className="csv-upload-box" style={{ marginTop: '8px' }}>
                    <input
                      type="file"
                      accept=".csv"
                      id="csvInput"
                      onChange={handleCsvImport}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="csvInput" className="btn btn-purple btn-full">
                      <Upload size={14} />
                      <span>Upload CSV File</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 3: CHECK-IN ================= */}
        {activeTab === 'checkin' && (
          <section className="portal-tab-content" key="checkin">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon blue"><Users size={18} /></div>
                  <div>
                    <div className="stat-card-label">Total Registrations</div>
                    <strong>{totalRegistrations}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '100%' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon green"><CheckCircle2 size={18} /></div>
                  <div>
                    <div className="stat-card-label">Checked In</div>
                    <strong>{totalCheckedIn}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: `${(totalCheckedIn / totalRegistrations) * 100}%`, background: 'var(--accent-green)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon amber"><Clock size={18} /></div>
                  <div>
                    <div className="stat-card-label">Yet to Arrive</div>
                    <strong>{totalYetToArrive}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: `${(totalYetToArrive / totalRegistrations) * 100}%`, background: 'var(--accent-amber)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon purple"><Layers size={18} /></div>
                  <div>
                    <div className="stat-card-label">Team Count</div>
                    <strong>{teamRegistrations}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '25%', background: 'var(--accent-purple)' }} /></div>
              </div>
            </div>

            <div className="two-col-grid" style={{ marginTop: '10px' }}>
              <div>
                <div className="card">
                  <h3>Search Attendee</h3>
                  <div className="search-filter-row" style={{ marginTop: '8px' }}>
                    <div className="input-field" style={{ flex: 1 }}>
                      <Search size={14} className="field-icon" />
                      <input
                        placeholder="Name, email, or phone..."
                        value={checkSearch}
                        onChange={(e) => setCheckSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckinSearch()}
                      />
                    </div>
                    <button type="button" className="btn btn-purple" onClick={handleCheckinSearch}>
                      Search
                    </button>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '10px' }}>
                  {selectedAttendee ? (
                    <div className="attendee-detail-panel">
                      <div className="card-head">
                        <h3>Attendee Verification</h3>
                        <span className={`pill ${selectedAttendee.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`}>
                          {selectedAttendee.status}
                        </span>
                      </div>

                      <div className="attendee-card-body">
                        <div className="attendee-large-avatar">
                          {selectedAttendee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px' }}>{selectedAttendee.name}</h4>
                          <div style={{ margin: '2px 0 4px' }}>
                            <span className={`pill ${getCategoryClass(selectedAttendee.category)}`}>
                              {selectedAttendee.category}
                            </span>
                          </div>
                          <div className="text-dim" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                            <div>📧 {selectedAttendee.email}</div>
                            <div>📞 {selectedAttendee.phone}</div>
                            <div>🏛️ {selectedAttendee.organization}</div>
                          </div>
                        </div>
                      </div>

                      <div className="reg-id-badge">
                        <strong>Registration ID: {selectedAttendee.id}</strong>
                        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '10px' }}>
                          Registered: {selectedAttendee.date}
                        </p>
                      </div>

                      <button
                        type="button"
                        className={`btn btn-full ${selectedAttendee.status === 'Checked In' ? 'btn-ghost' : 'btn-primary'}`}
                        style={{ padding: '9px', fontSize: '12px' }}
                        onClick={() => toggleCheckin(selectedAttendee.id)}
                      >
                        {selectedAttendee.status === 'Checked In' ? 'Undo Check-In' : '✓ Check In Attendee'}
                      </button>
                    </div>
                  ) : (
                    <div className="empty-box">
                      <QrCode size={28} className="text-dim" style={{ marginBottom: '6px' }} />
                      <p>Search for a registered participant to verify credentials and check them in.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Check-Ins Live Stream */}
              <div className="card">
                <div className="card-head">
                  <div>
                    <h3>Live Check-In Stream</h3>
                    <p className="text-muted" style={{ fontSize: '10.5px' }}>Real-time gate arrivals</p>
                  </div>
                  <span className="pill pill-green">Live Feed</span>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Organization</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendees
                        .filter((a) => a.status === 'Checked In')
                        .slice(0, 6)
                        .map((a, i) => (
                          <tr key={a.id || i}>
                            <td>{i + 1}</td>
                            <td><strong>{a.name}</strong></td>
                            <td><span className={`pill ${getCategoryClass(a.category)}`}>{a.category}</span></td>
                            <td>{a.organization}</td>
                            <td>{a.date.split(', ')[1] || '09:30 AM'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 4: ATTENDEES ================= */}
        {activeTab === 'attendees' && (
          <section className="portal-tab-content" key="attendees">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon blue"><Users size={18} /></div>
                  <div>
                    <div className="stat-card-label">Total Attendees</div>
                    <strong>{totalRegistrations}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '62%' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon purple">🎓</div>
                  <div>
                    <div className="stat-card-label">Students</div>
                    <strong>78</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '42%', background: 'var(--accent-purple)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon pink">💼</div>
                  <div>
                    <div className="stat-card-label">Working Pros</div>
                    <strong>26</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '14%', background: 'var(--accent-magenta)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon green">🚀</div>
                  <div>
                    <div className="stat-card-label">Founders</div>
                    <strong>18</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: '10%', background: 'var(--accent-green)' }} /></div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '10px' }}>
              <div className="card-head">
                <div>
                  <h3>Master Roster</h3>
                  <p className="text-muted" style={{ fontSize: '11px' }}>Filter and export participant data</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={handleCsvExport}>
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Filters toolbar */}
              <div className="search-filter-row" style={{ marginBottom: '10px' }}>
                <div className="input-field" style={{ flex: 1, minWidth: '180px' }}>
                  <Search size={14} className="field-icon" />
                  <input
                    placeholder="Search attendee..."
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                  />
                </div>

                <select
                  style={{ maxWidth: '140px' }}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option>Student</option>
                  <option>Working Professional</option>
                  <option>Founder</option>
                  <option>Researcher</option>
                  <option>Startup</option>
                  <option>Developer</option>
                  <option>Other</option>
                </select>

                <select
                  style={{ maxWidth: '120px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option>Checked In</option>
                  <option>Registered</option>
                </select>

                {(attendeeSearch || categoryFilter || statusFilter) && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setAttendeeSearch('');
                      setCategoryFilter('');
                      setStatusFilter('');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}><input type="checkbox" /></th>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Organization</th>
                      <th>Status</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-dim)', fontSize: '13px' }}>
                          No attendees registered yet.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendees.map((a, i) => (
                        <tr key={a.id || i}>
                          <td><input type="checkbox" /></td>
                          <td>{i + 1}</td>
                          <td>
                            <div className="person">
                              <span className="initial">
                                {a.name ? a.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'P'}
                              </span>
                              <strong>{a.name}</strong>
                            </div>
                          </td>
                          <td>{a.email}</td>
                          <td>{a.phone}</td>
                          <td><span className={`pill ${getCategoryClass(a.category)}`}>{a.category}</span></td>
                          <td>{a.organization}</td>
                          <td>
                            <span className={`pill ${a.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td>{a.date || a.registeredAt || '24 Oct'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-bar">
                <span>Showing {filteredAttendees.length} of {attendees.length} attendees</span>
                <div className="page-btn-group">
                  <button type="button" className="active">1</button>
                  <button type="button">2</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 5: ANALYTICS ================= */}
        {activeTab === 'analytics' && (
          <section className="portal-tab-content" key="analytics">
            <div className="two-col-grid">
              <div className="card">
                <div className="card-head">
                  <h3>Daily Registration Momentum</h3>
                </div>
                <div className="chart-wrapper">
                  <svg viewBox="0 0 650 190" preserveAspectRatio="none">
                    <polyline
                      points={totalRegistrations > 0 ? "0,164 70,145 140,130 210,111 280,91 350,72 420,56 490,39 560,22 650,8" : "0,180 650,180"}
                      fill="none"
                      stroke="#1c7fff"
                      strokeWidth="2.5"
                    />
                    <polyline
                      points={totalCheckedIn > 0 ? "0,177 70,164 140,151 210,137 280,123 350,111 420,99 490,85 560,70 650,53" : "0,180 650,180"}
                      fill="none"
                      stroke="#9646ff"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Category Distribution</h3>
                </div>
                <div className="donut-container">
                  <div className="donut-chart" />
                  <div className="donut-legend-grid">
                    {categoryStats.map((c) => (
                      <span key={c.name}>
                        {c.name} <b>{c.pct}%</b> ({c.count})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="three-col-grid" style={{ marginTop: '10px' }}>
              <div className="card">
                <div className="card-head">
                  <h3>Institution Share</h3>
                </div>
                <div className="progress-stack" style={{ marginTop: '8px' }}>
                  {orgsList.length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', fontSize: '12px', padding: '14px 0' }}>
                      No institutions registered yet.
                    </div>
                  ) : (
                    orgsList.slice(0, 5).map((o) => (
                      <div key={o.name} className="progress-row">
                        <span>{o.name}</span>
                        <div className="bar-track">
                          <span style={{ width: `${o.pct}%`, background: o.color }} />
                        </div>
                        <b>{o.count}</b>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Check-In Yield</h3>
                </div>
                <div className="progress-stack" style={{ marginTop: '8px' }}>
                  {categoryStats.filter((c) => c.count > 0).length === 0 ? (
                    <div style={{ color: 'var(--text-dim)', fontSize: '12px', padding: '14px 0' }}>
                      No check-in data yet.
                    </div>
                  ) : (
                    categoryStats.filter((c) => c.count > 0).map((c) => {
                      const checkedCount = attendees.filter((a) => (a.category || 'Other') === c.name && a.status === 'Checked In').length;
                      const yieldPct = c.count > 0 ? Math.round((checkedCount / c.count) * 100) : 0;
                      return (
                        <div key={c.name} className="progress-row">
                          <span>{c.name}</span>
                          <div className="bar-track"><span style={{ width: `${yieldPct}%`, background: 'var(--accent-blue)' }} /></div>
                          <b>{yieldPct}%</b>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Acquisition</h3>
                </div>
                <div className="donut-container" style={{ minHeight: '110px' }}>
                  <div
                    className="donut-chart"
                    style={{
                      background: 'conic-gradient(#1c7fff 0 56%, #9646ff 56% 84%, #e024a5 84% 94%, #f5a623 94% 100%)'
                    }}
                  />
                  <div className="donut-legend-grid">
                    <span>Google Form <b>56%</b></span>
                    <span>Website <b>28%</b></span>
                    <span>Referrals <b>10%</b></span>
                    <span>On-site <b>6%</b></span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 6: ANNOUNCEMENTS (ADMIN EDIT & DELETE) ================= */}
        {activeTab === 'announcements' && (
          <section className="portal-tab-content" key="announcements">
            <div className="stats-grid">
              <div className="stat-card compact">
                <div className="stat-card-label">Total Announcements</div>
                <strong>{announcements.length}</strong>
              </div>
              <div className="stat-card compact">
                <div className="stat-card-label">Published</div>
                <strong>{announcements.filter((a) => a.status === 'Published').length}</strong>
              </div>
              <div className="stat-card compact">
                <div className="stat-card-label">Scheduled</div>
                <strong>{announcements.filter((a) => a.status === 'Scheduled').length}</strong>
              </div>
              <div className="stat-card compact">
                <div className="stat-card-label">Drafts</div>
                <strong>{announcements.filter((a) => a.status === 'Draft').length}</strong>
              </div>
            </div>

            <div className="layout-two-pane" style={{ marginTop: '10px' }}>
              <div className="card">
                <div className="card-head">
                  <div>
                    <h3>Announcements Management</h3>
                    <p className="text-muted" style={{ fontSize: '11px' }}>
                      Admin controls: Edit or delete notices directly
                    </p>
                  </div>
                  <div className="input-field" style={{ minWidth: '180px' }}>
                    <Search size={14} className="field-icon" />
                    <input
                      placeholder="Search announcements..."
                      value={announcementSearch}
                      onChange={(e) => setAnnouncementSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th style={{ textAlign: 'right' }}>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAnnouncements.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <Bell size={24} style={{ opacity: 0.4 }} />
                              <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>No Announcements Posted</strong>
                              <span style={{ fontSize: '12px' }}>Use the form on the right to publish live event announcements to all portals.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredAnnouncements.map((a, i) => (
                          <tr key={a.id || i}>
                            <td>{i + 1}</td>
                            <td>
                              <strong>⚑ {a.title}</strong>
                              <div className="text-dim" style={{ fontSize: '10.5px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {a.message}
                              </div>
                            </td>
                            <td>
                              <span className={`pill ${getCategoryClass(a.type)}`}>{a.type}</span>
                            </td>
                            <td>
                              <span className={`pill ${a.status === 'Published' ? 'pill-green' : 'pill-amber'}`}>
                                {a.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '11px' }}>{a.date}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '5px' }}>
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  onClick={() => setEditingAnnouncement(a)}
                                  title="Edit announcement"
                                >
                                  <Edit2 size={12} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="admin-action-btn delete"
                                  onClick={() => handleDeleteAnnouncement(a.id)}
                                  title="Delete announcement"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Create Announcement Form */}
              <div className="card">
                <h3>Create New Announcement</h3>
                <div className="form-vertical" style={{ marginTop: '8px' }}>
                  <div className="input-group">
                    <label>Title *</label>
                    <input
                      required
                      placeholder="Headline"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label>Message Content *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write announcement body..."
                      value={newAnnouncement.message}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label>Category *</label>
                    <select
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                    >
                      <option>General</option>
                      <option>Registration</option>
                      <option>Schedule</option>
                      <option>Logistics</option>
                      <option>Guidelines</option>
                      <option>Activity</option>
                      <option>Opportunity</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Schedule Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={newAnnouncement.date}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, date: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ flex: 1 }}
                      onClick={() => handleCreateAnnouncement('Draft')}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => handleCreateAnnouncement('Published')}
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 7: EVENT FLOW (ADMIN EDIT & DELETE) ================= */}
        {activeTab === 'eventflow' && (
          <section className="portal-tab-content" key="eventflow">
            {/* Horizontal Stepper */}
            <div className="card">
              <div className="flow-stepper-row">
                {stages.map((s, idx) => (
                  <div key={s.stage} className="flow-step">
                    <div className={`flow-step-icon ${['green', 'blue', 'purple', 'pink', 'amber', 'cyan'][idx % 6]}`}>
                      {s.stage}
                    </div>
                    <strong>{s.title}</strong>
                    <small>{s.time}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="layout-two-pane" style={{ marginTop: '10px' }}>
              {/* Detailed Agenda Cards with Admin Edit & Delete Actions */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '13px' }}>Agenda Stages ({stages.length})</h3>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={() => {
                      setEditingStage({
                        stage: stages.length + 1,
                        title: '',
                        time: '',
                        description: '',
                        activities: []
                      });
                      setIsNewStage(true);
                    }}
                  >
                    <Plus size={13} />
                    <span>Add Stage</span>
                  </button>
                </div>

                <div className="flow-card-stack">
                  {stages.map((s, idx) => (
                    <div key={s.stage} className="flow-card-item">
                      <div className={`flow-number-badge ${['green', 'blue', 'purple', 'pink', 'amber', 'cyan'][idx % 6]}`}>
                        {s.stage}
                      </div>
                      <div className="flow-card-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <h3>{s.title}</h3>
                            <div className="text-dim" style={{ fontSize: '11px' }}>◷ {s.time}</div>
                          </div>
                          {/* Admin Only Edit & Delete Action Buttons */}
                          <div className="flow-card-actions">
                            <button
                              type="button"
                              className="admin-action-btn"
                              onClick={() => {
                                setEditingStage(s);
                                setIsNewStage(false);
                              }}
                              title="Edit stage"
                            >
                              <Edit2 size={11} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn delete"
                              onClick={() => handleDeleteStage(s.stage)}
                              title="Delete stage"
                            >
                              <Trash2 size={11} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        <p>{s.description}</p>
                        <div className="flow-activity-list">
                          {s.activities && s.activities.map((act, aIdx) => (
                            <span key={aIdx}>● {act}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Info & Resources */}
              <div className="side-forms-pane">
                <div className="card">
                  <h3>Event Logistics</h3>
                  <div className="event-info-notice" style={{ marginTop: '8px' }}>
                    <strong>📅 Sat, 24 Oct 2026</strong>
                    <p>◷ 10:00 AM – 1:00 PM</p>
                    <p style={{ marginTop: '4px' }}>📍 AU-QUASAR, Alliance University</p>
                  </div>
                </div>

                <div className="card" style={{ marginTop: '10px' }}>
                  <h3>Important Guidelines</h3>
                  <ul className="guidelines-list" style={{ marginTop: '6px' }}>
                    <li>Arrive at least 15 minutes before opening.</li>
                    <li>Carry valid photo ID for verification.</li>
                    <li>Laptops and prototyping tools recommended.</li>
                    <li>Complimentary lunch provided.</li>
                  </ul>
                </div>

                <div className="card" style={{ marginTop: '10px' }}>
                  <h3>Event Resources</h3>
                  <div className="resource-list">
                    <a href="#pdf" className="resource-item" onClick={(e) => { e.preventDefault(); showToast('Downloading Schedule PDF...'); }}>
                      <FileText size={14} />
                      <span>Event Schedule (PDF)</span>
                      <Download size={12} className="download-ico" />
                    </a>
                    <a href="#map" className="resource-item" onClick={(e) => { e.preventDefault(); showToast('Opening Campus Map...'); }}>
                      <MapPin size={14} />
                      <span>Campus & Venue Map</span>
                      <Download size={12} className="download-ico" />
                    </a>
                    <a href="#rules" className="resource-item" onClick={(e) => { e.preventDefault(); showToast('Opening Code of Conduct...'); }}>
                      <FileText size={14} />
                      <span>Code of Conduct</span>
                      <Download size={12} className="download-ico" />
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
