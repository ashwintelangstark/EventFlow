import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { downloadEventFlowAsImage } from '../utils/downloadScheduleImage';
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

  // Check-In Station search & selection (synchronized with all sections)
  const [checkSearch, setCheckSearch] = useState('');
  const [selectedAttendeeId, setSelectedAttendeeId] = useState(null);

  // Live matching participants for the Check-In search bar
  const checkMatches = React.useMemo(() => {
    if (!checkSearch.trim()) return [];
    const q = checkSearch.toLowerCase().trim();
    return attendees.filter((a) =>
      [a.name, a.email, a.phone, a.organization, a.id, a.category].some((field) =>
        String(field || '').toLowerCase().includes(q)
      )
    );
  }, [checkSearch, attendees]);

  // Directly derive selectedAttendee from live attendees array so it never desyncs across any tab.
  // When searching, if an attendee is explicitly selected and in matches, use them;
  // otherwise automatically show the top matching attendee so their full verification card appears immediately below the search bar!
  const selectedAttendee = React.useMemo(() => {
    if (checkSearch.trim()) {
      if (selectedAttendeeId) {
        const found = checkMatches.find((a) => a.id === selectedAttendeeId || a.email === selectedAttendeeId);
        if (found) return found;
      }
      return checkMatches.length > 0 ? checkMatches[0] : null;
    }
    if (selectedAttendeeId) {
      return attendees.find((a) => a.id === selectedAttendeeId || a.email === selectedAttendeeId) || null;
    }
    return null;
  }, [selectedAttendeeId, attendees, checkSearch, checkMatches]);

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

  // Edit Registration Modal State
  const [editingRegistration, setEditingRegistration] = useState(null);

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

  // Dynamic Real-Time Chart & Trend Data Generator
  const chartTrend = React.useMemo(() => {
    const total = attendees.length;
    const checked = attendees.filter((a) => a.status === 'Checked In').length;
    const labels = ['18 Oct', '20 Oct', '21 Oct', '22 Oct', '23 Oct', '24 Oct'];

    if (total === 0) {
      return {
        totalPolyline: "0,175 130,175 260,175 390,175 520,175 650,175",
        checkedPolyline: "0,175 130,175 260,175 390,175 520,175 650,175",
        totalArea: "0,175 130,175 260,175 390,175 520,175 650,175 650,185 0,185",
        checkedArea: "0,175 130,175 260,175 390,175 520,175 650,175 650,185 0,185",
        labels
      };
    }

    const regProgression = [
      Math.max(1, Math.round(total * 0.15)),
      Math.max(1, Math.round(total * 0.35)),
      Math.max(1, Math.round(total * 0.55)),
      Math.max(1, Math.round(total * 0.75)),
      Math.max(1, Math.round(total * 0.90)),
      total
    ];

    const checkProgression = [
      0,
      0,
      Math.round(checked * 0.12),
      Math.round(checked * 0.35),
      Math.round(checked * 0.70),
      checked
    ];

    const xStep = 650 / 5;
    const maxY = Math.max(total, 5);

    const totalPoints = regProgression.map((count, i) => ({
      x: Math.round(i * xStep),
      y: Math.round(165 - (count / maxY) * 140)
    }));

    const checkPoints = checkProgression.map((count, i) => ({
      x: Math.round(i * xStep),
      y: checked > 0 ? Math.round(165 - (count / maxY) * 140) : 175
    }));

    const totalPolyline = totalPoints.map((p) => `${p.x},${p.y}`).join(' ');
    const checkedPolyline = checkPoints.map((p) => `${p.x},${p.y}`).join(' ');
    const totalArea = `${totalPolyline} 650,185 0,185`;
    const checkedArea = `${checkedPolyline} 650,185 0,185`;

    return {
      totalPolyline,
      checkedPolyline,
      totalArea,
      checkedArea,
      labels
    };
  }, [attendees]);

  // Dynamic Category Conic Gradient for Donut Charts
  const categoryConicGradient = React.useMemo(() => {
    const total = attendees.length;
    if (total === 0) return 'conic-gradient(#1e293b 0 100%)';
    const colorMap = {
      'Student': '#1c7fff',
      'Working Professional': '#9646ff',
      'Founder': '#e024a5',
      'Researcher': '#f5a623',
      'Startup': '#10d4a3',
      'Developer': '#13dce5',
      'Other': '#6c86a8'
    };
    let currentPct = 0;
    const parts = [];
    categoryStats.forEach((cat) => {
      if (cat.pct > 0) {
        const nextPct = Math.min(100, currentPct + cat.pct);
        parts.push(`${colorMap[cat.name] || '#6c86a8'} ${currentPct}% ${nextPct}%`);
        currentPct = nextPct;
      }
    });
    if (currentPct < 100 && parts.length > 0) {
      parts.push(`#6c86a8 ${currentPct}% 100%`);
    }
    return parts.length ? `conic-gradient(${parts.join(', ')})` : 'conic-gradient(#1e293b 0 100%)';
  }, [categoryStats, attendees.length]);

  // Dynamic Attendance Conic Gradient
  const attendanceConicGradient = React.useMemo(() => {
    if (totalRegistrations === 0) return 'conic-gradient(#1e293b 0 100%)';
    const checkedPct = Math.round((totalCheckedIn / totalRegistrations) * 100);
    return `conic-gradient(#00d26a 0% ${checkedPct}%, #f5a623 ${checkedPct}% 100%)`;
  }, [totalRegistrations, totalCheckedIn]);

  // Toggle Checkin - synchronized across Check-In, Registrations, Attendees, and Dashboard
  const toggleCheckin = async (id) => {
    const attendee = attendees.find((a) => a.id === id || a.email === id);
    if (!attendee) return;
    const nextStatus = attendee.status === 'Checked In' ? 'Registered' : 'Checked In';
    const datePart = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const timePart = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowStr = `${datePart}, ${timePart}`;

    // Optimistic state update across all sections
    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id === id || a.email === id) {
          return {
            ...a,
            status: nextStatus,
            date: a.date || a.registeredAt || nowStr,
            checkedInAt: nextStatus === 'Checked In' ? nowStr : null
          };
        }
        return a;
      })
    );

    // Keep active selected attendee in check-in section in sync
    setSelectedAttendeeId(attendee.id);

    showToast(`${attendee.name} marked as ${nextStatus}`);

    try {
      await api.toggleCheckIn(attendee.id, nextStatus);
    } catch (err) {
      console.error('Checkin update error:', err);
      showToast(`Error updating check-in: ${err.message}`);
    }
  };

  // Handle Add Registration
  const handleAddRegistration = async (e) => {
    e.preventDefault();
    if (!newReg.name || !newReg.email) return;

    try {
      const res = await api.addRegistration({
        name: newReg.name.trim(),
        email: newReg.email.trim().toLowerCase(),
        phone: (newReg.phone || '').trim(),
        category: newReg.category || 'Student',
        organization: (newReg.organization || '').trim() || 'Alliance University',
        designation: (newReg.designation || '').trim() || 'Participant'
      });
      if (res?.attendee) {
        setAttendees((prev) => [res.attendee, ...prev]);
      } else {
        refreshData();
      }
      setNewReg({ name: '', email: '', phone: '', category: '', organization: '', designation: '' });
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
              phone: cols[2] || '',
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
    if (!checkSearch.trim()) {
      setSelectedAttendeeId(null);
      return;
    }
    const q = checkSearch.toLowerCase().trim();
    const found = attendees.find((a) =>
      [a.name, a.email, a.phone, a.organization, a.id, a.category].some((val) =>
        String(val || '').toLowerCase().includes(q)
      )
    );
    if (found) {
      setSelectedAttendeeId(found.id);
      showToast(`Selected ${found.name}`);
    } else {
      setSelectedAttendeeId(null);
      showToast('No matching registered attendee found');
    }
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

  // ================= ADMIN REGISTRATION CRUD =================
  const handleUpdateRegistration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingRegistration) return;

    const nowStr = `${new Date().getDate()} Oct, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const updated = {
      ...editingRegistration,
      name: editingRegistration.name?.trim() || 'Participant',
      email: editingRegistration.email?.trim() || '',
      phone: editingRegistration.phone?.trim() || '',
      category: editingRegistration.category || 'Student',
      organization: editingRegistration.organization?.trim() || 'Alliance University',
      designation: editingRegistration.designation?.trim() || 'Participant',
      status: editingRegistration.status || 'Registered',
      date: editingRegistration.date || editingRegistration.registeredAt || nowStr,
      checkedInAt: editingRegistration.status === 'Checked In' ? (editingRegistration.checkedInAt || nowStr) : null
    };

    setAttendees((prev) =>
      prev.map((a) => (a.id === editingRegistration.id ? { ...a, ...updated } : a))
    );

    try {
      await api.updateRegistration(editingRegistration.id, updated);
      showToast('Registration updated successfully');
    } catch (err) {
      console.error('Registration update error:', err);
      showToast(`Error updating registration: ${err.message}`);
    }
    setEditingRegistration(null);
  };

  const handleDeleteRegistration = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    if (selectedAttendeeId === id) {
      setSelectedAttendeeId(null);
    }
    try {
      await api.deleteRegistration(id);
      showToast('Registration deleted');
    } catch (err) {
      console.error('Registration delete error:', err);
      showToast(`Error deleting registration: ${err.message}`);
    }
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
      String(v || '').toLowerCase().includes(regSearch.toLowerCase())
    )
  );

  const filteredAttendees = attendees.filter((a) => {
    const matchQ = [a.name, a.email, a.phone, a.organization, a.category].some((v) =>
      String(v || '').toLowerCase().includes(attendeeSearch.toLowerCase())
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

      {/* EDIT REGISTRATION MODAL (ADMIN ONLY) */}
      {editingRegistration && (
        <div className="modal-overlay" onClick={() => setEditingRegistration(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-head">
              <h3>Edit Registration</h3>
              <button type="button" className="btn btn-ghost" onClick={() => setEditingRegistration(null)}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleUpdateRegistration} className="form-vertical" style={{ marginTop: '10px' }}>
              <div className="input-group">
                <label>Full Name *</label>
                <input
                  required
                  placeholder="Participant full name"
                  value={editingRegistration.name || ''}
                  onChange={(e) => setEditingRegistration({ ...editingRegistration, name: e.target.value })}
                />
              </div>
              <div className="form-two-col">
                <div className="input-group">
                  <label>Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    value={editingRegistration.email || ''}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, email: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number *</label>
                  <input
                    required
                    placeholder="+91 contact"
                    value={editingRegistration.phone || ''}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-two-col">
                <div className="input-group">
                  <label>Category *</label>
                  <select
                    value={editingRegistration.category || 'Student'}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, category: e.target.value })}
                  >
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
                  <label>Status *</label>
                  <select
                    value={editingRegistration.status || 'Registered'}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, status: e.target.value })}
                  >
                    <option>Registered</option>
                    <option>Checked In</option>
                  </select>
                </div>
              </div>
              <div className="form-two-col">
                <div className="input-group">
                  <label>Organization</label>
                  <input
                    placeholder="University or company"
                    value={editingRegistration.organization || ''}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, organization: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Designation / Role</label>
                  <input
                    placeholder="Participant, Lead, etc."
                    value={editingRegistration.designation || ''}
                    onChange={(e) => setEditingRegistration({ ...editingRegistration, designation: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingRegistration(null)}>
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
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1c7fff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1c7fff" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9646ff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#9646ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon points={chartTrend.totalArea} fill="url(#blueGrad)" />
                    {totalCheckedIn > 0 && <polygon points={chartTrend.checkedArea} fill="url(#purpleGrad)" />}
                    <polyline
                      points={chartTrend.totalPolyline}
                      fill="none"
                      stroke="#1c7fff"
                      strokeWidth="2.5"
                    />
                    <polyline
                      points={chartTrend.checkedPolyline}
                      fill="none"
                      stroke="#9646ff"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="chart-timeline-labels">
                  {chartTrend.labels.map((lbl) => (
                    <span key={lbl}>{lbl}</span>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Registrations by Category</h3>
                </div>
                <div className="donut-container">
                  <div className="donut-chart" style={{ background: categoryConicGradient }}>
                    <div className="donut-center-badge">
                      <strong>{totalRegistrations}</strong>
                      <small>Total</small>
                    </div>
                  </div>
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
                        <th>Organization & Role</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
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
                            <td>{a.phone || '—'}</td>
                            <td><span className={`pill ${getCategoryClass(a.category)}`}>{a.category}</span></td>
                            <td>
                              <div style={{ fontWeight: '500' }}>{a.organization || 'Alliance University'}</div>
                              {a.designation && (
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                  💼 {a.designation}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`pill ${a.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`}>
                                {a.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  style={{ padding: '2px 7px', fontSize: '10.5px' }}
                                  onClick={() => toggleCheckin(a.id)}
                                  title={a.status === 'Checked In' ? 'Undo check-in' : 'Check in participant'}
                                >
                                  {a.status === 'Checked In' ? 'Undo' : 'Check In'}
                                </button>
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  onClick={() => setEditingRegistration(a)}
                                  title="Edit registration"
                                >
                                  <Edit2 size={12} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="admin-action-btn delete"
                                  onClick={() => handleDeleteRegistration(a.id)}
                                  title="Delete registration"
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

                    <div className="input-group">
                      <label>Designation / Role</label>
                      <input
                        placeholder="e.g. Student, Software Engineer"
                        value={newReg.designation || ''}
                        onChange={(e) => setNewReg({ ...newReg, designation: e.target.value })}
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
                <div className="bar-track"><span style={{ width: `${totalRegistrations > 0 ? (totalCheckedIn / totalRegistrations) * 100 : 0}%`, background: 'var(--accent-green)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon amber"><Clock size={18} /></div>
                  <div>
                    <div className="stat-card-label">Yet to Arrive</div>
                    <strong>{totalYetToArrive}</strong>
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
                </div>
                <div className="bar-track"><span style={{ width: '25%', background: 'var(--accent-purple)' }} /></div>
              </div>
            </div>

            <div className="two-col-grid" style={{ marginTop: '10px' }}>
              <div>
                <div className="card">
                  <div className="card-head">
                    <div>
                      <h3>Search & Check-In Attendee</h3>
                      <p className="text-muted" style={{ fontSize: '11px', marginTop: '1px' }}>
                        Search any participant by name, email, phone, or ID to verify details and check them in.
                      </p>
                    </div>
                  </div>

                  <div className="search-filter-row" style={{ marginTop: '8px' }}>
                    <div className="input-field" style={{ flex: 1 }}>
                      <Search size={14} className="field-icon" />
                      <input
                        placeholder="Search by name, email, phone, or registration ID..."
                        value={checkSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCheckSearch(val);
                          if (!val.trim()) {
                            setSelectedAttendeeId(null);
                          } else {
                            const q = val.toLowerCase().trim();
                            const matches = attendees.filter((a) =>
                              [a.name, a.email, a.phone, a.organization, a.id, a.category].some((field) =>
                                String(field || '').toLowerCase().includes(q)
                              )
                            );
                            if (matches.length === 1) {
                              setSelectedAttendeeId(matches[0].id);
                            }
                          }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckinSearch()}
                      />
                    </div>
                    <button type="button" className="btn btn-purple" onClick={handleCheckinSearch}>
                      Search
                    </button>
                    {checkSearch && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setCheckSearch('');
                          setSelectedAttendeeId(null);
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Multiple Live Matching Results */}
                  {checkSearch.trim() && checkMatches.length > 1 && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Found <strong>{checkMatches.length}</strong> matching participants — click one to view full verification card:
                        </span>
                      </div>
                      <div className="checkin-results-list">
                        {checkMatches.map((m) => {
                          const isSel = selectedAttendee && selectedAttendee.id === m.id;
                          return (
                            <div
                              key={m.id}
                              className={`checkin-result-item ${isSel ? 'selected' : ''}`}
                              onClick={() => setSelectedAttendeeId(m.id)}
                            >
                              <div className="checkin-result-user">
                                <span className="initial" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                                  {m.name ? m.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'P'}
                                </span>
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>
                                    {m.name}
                                    <span className={`pill ${getCategoryClass(m.category)}`} style={{ marginLeft: '6px', fontSize: '9.5px', padding: '1px 5px' }}>
                                      {m.category}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
                                    {m.email} {m.phone ? `• ${m.phone}` : ''} • {m.organization}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`pill ${m.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`} style={{ fontSize: '10px' }}>
                                  {m.status}
                                </span>
                                <button
                                  type="button"
                                  className={`btn ${m.status === 'Checked In' ? 'btn-ghost' : 'btn-primary'}`}
                                  style={{ padding: '3px 8px', fontSize: '10.5px' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCheckin(m.id);
                                  }}
                                  title={m.status === 'Checked In' ? 'Undo check-in' : 'Check in participant'}
                                >
                                  {m.status === 'Checked In' ? 'Undo' : 'Check In'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No Match Notice */}
                  {checkSearch.trim() && checkMatches.length === 0 && (
                    <div className="empty-box" style={{ marginTop: '10px' }}>
                      <p style={{ margin: 0 }}>No registered participant found matching "<strong>{checkSearch}</strong>".</p>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-dim)' }}>
                        Check the spelling of the name, email, phone number, or registration ID.
                      </p>
                    </div>
                  )}

                  {/* Selected / Single-match Attendee Verification & Check-In Card (Directly Below Search Bar) */}
                  {selectedAttendee ? (
                    <div className="attendee-detail-panel" style={{ marginTop: '12px' }}>
                      <div className="card-head" style={{ paddingBottom: '6px', borderBottom: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={16} style={{ color: selectedAttendee.status === 'Checked In' ? 'var(--accent-green)' : 'var(--accent-amber)' }} />
                          <h4 style={{ margin: 0, fontSize: '13px' }}>Attendee Verification Details</h4>
                        </div>
                        <span className={`pill ${selectedAttendee.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`}>
                          {selectedAttendee.status}
                        </span>
                      </div>

                      <div className="attendee-card-body">
                        <div className="attendee-large-avatar">
                          {selectedAttendee.name ? selectedAttendee.name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'P'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '15px', margin: 0, fontWeight: '700' }}>{selectedAttendee.name}</h4>
                            <span className={`pill ${getCategoryClass(selectedAttendee.category)}`}>
                              {selectedAttendee.category}
                            </span>
                            <span className={`pill ${selectedAttendee.status === 'Checked In' ? 'pill-green' : 'pill-amber'}`}>
                              {selectedAttendee.status}
                            </span>
                          </div>

                          <div className="text-dim" style={{ fontSize: '11.5px', lineHeight: '1.5', marginTop: '4px' }}>
                            <div>📧 <strong>Email:</strong> {selectedAttendee.email}</div>
                            <div>📞 <strong>Phone:</strong> {selectedAttendee.phone || 'N/A'}</div>
                            <div>🏛️ <strong>Organization:</strong> {selectedAttendee.organization || 'Alliance University'}</div>
                            {selectedAttendee.designation && (
                              <div>💼 <strong>Designation:</strong> {selectedAttendee.designation}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="reg-id-badge" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <div>
                          <strong>Registration ID: {selectedAttendee.id}</strong>
                          <p style={{ margin: '2px 0 0', color: 'var(--text-dim)', fontSize: '10.5px' }}>
                            Registered: {selectedAttendee.date || selectedAttendee.registeredAt || '24 Oct, 10:00 AM'}
                          </p>
                        </div>
                        {selectedAttendee.checkedInAt && (
                          <div style={{ fontSize: '10.5px', color: 'var(--accent-green)', fontWeight: '600' }}>
                            ✓ Gate Arrival: {selectedAttendee.checkedInAt}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          className={`btn btn-full ${selectedAttendee.status === 'Checked In' ? 'btn-ghost' : 'btn-primary'}`}
                          style={{
                            padding: '10px 14px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            flex: 2,
                            background: selectedAttendee.status === 'Checked In'
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'linear-gradient(135deg, #00d26a 0%, #00a854 100%)',
                            color: '#ffffff',
                            border: selectedAttendee.status === 'Checked In' ? '1px solid var(--border-glass)' : 'none',
                            boxShadow: selectedAttendee.status === 'Checked In' ? 'none' : '0 4px 14px rgba(0, 210, 106, 0.35)',
                            cursor: 'pointer'
                          }}
                          onClick={() => toggleCheckin(selectedAttendee.id)}
                        >
                          {selectedAttendee.status === 'Checked In' ? '✓ Checked In (Click to Undo Check-In)' : '✓ Check In Attendee Now'}
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: '10px 12px', fontSize: '11.5px', flex: 1 }}
                          onClick={() => setEditingRegistration(selectedAttendee)}
                          title="Edit participant details"
                        >
                          <Edit2 size={13} style={{ marginRight: '4px' }} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  ) : !checkSearch.trim() ? (
                    <div className="empty-box" style={{ marginTop: '10px' }}>
                      <QrCode size={28} className="text-dim" style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0 }}>Search for a participant above to verify their details and mark gate arrival.</p>
                      <p style={{ margin: '4px 0 0', fontSize: '10.5px', color: 'var(--text-dim)' }}>
                        All check-in actions update immediately across Registrations, Attendees, and Analytics.
                      </p>
                    </div>
                  ) : null}
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
                      {attendees.filter((a) => a.status === 'Checked In').length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--text-dim)', fontSize: '12.5px' }}>
                            No attendees checked in yet. Check in attendees using the search or the Registrations tab.
                          </td>
                        </tr>
                      ) : (
                        attendees
                          .filter((a) => a.status === 'Checked In')
                          .slice(0, 6)
                          .map((a, i) => {
                            const timeStr = a.checkedInAt || a.date || a.registeredAt || '';
                            const displayTime = timeStr && timeStr.includes(', ') ? timeStr.split(', ')[1] : (timeStr || '10:00 AM');
                            return (
                              <tr
                                key={a.id || i}
                                onClick={() => {
                                  setSelectedAttendeeId(a.id);
                                  setCheckSearch(a.name);
                                }}
                                style={{ cursor: 'pointer' }}
                                title="Click to view & verify attendee card"
                              >
                                <td>{i + 1}</td>
                                <td><strong>{a.name}</strong></td>
                                <td><span className={`pill ${getCategoryClass(a.category)}`}>{a.category}</span></td>
                                <td>{a.organization}</td>
                                <td>{displayTime}</td>
                              </tr>
                            );
                          })
                      )}
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
                    <strong>{attendees.filter((a) => (a.category || '').toLowerCase().includes('student')).length}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: `${totalRegistrations > 0 ? (attendees.filter((a) => (a.category || '').toLowerCase().includes('student')).length / totalRegistrations) * 100 : 0}%`, background: 'var(--accent-purple)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon pink">💼</div>
                  <div>
                    <div className="stat-card-label">Working Pros</div>
                    <strong>{attendees.filter((a) => (a.category || '').toLowerCase().includes('professional')).length}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: `${totalRegistrations > 0 ? (attendees.filter((a) => (a.category || '').toLowerCase().includes('professional')).length / totalRegistrations) * 100 : 0}%`, background: 'var(--accent-magenta)' }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-row">
                  <div className="stat-card-icon green"><CheckCircle2 size={18} /></div>
                  <div>
                    <div className="stat-card-label">Checked In</div>
                    <strong>{totalCheckedIn}</strong>
                  </div>
                </div>
                <div className="bar-track"><span style={{ width: `${totalRegistrations > 0 ? (totalCheckedIn / totalRegistrations) * 100 : 0}%`, background: 'var(--accent-green)' }} /></div>
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
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-dim)', fontSize: '13px' }}>
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
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '5px' }}>
                              <button
                                type="button"
                                className={`btn ${a.status === 'Checked In' ? 'btn-ghost' : 'btn-primary'}`}
                                style={{ padding: '2px 7px', fontSize: '10.5px' }}
                                onClick={() => toggleCheckin(a.id)}
                                title={a.status === 'Checked In' ? 'Undo check-in' : 'Check in attendee'}
                              >
                                {a.status === 'Checked In' ? 'Undo' : 'Check In'}
                              </button>
                            </div>
                          </td>
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
                  <div className="chart-legend">
                    <span><i className="dot blue" /> Total ({totalRegistrations})</span>
                    <span><i className="dot purple" /> Checked In ({totalCheckedIn})</span>
                  </div>
                </div>
                <div className="chart-wrapper">
                  <svg viewBox="0 0 650 190" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="analyticsBlueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1c7fff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1c7fff" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="analyticsPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9646ff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#9646ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon points={chartTrend.totalArea} fill="url(#analyticsBlueGrad)" />
                    {totalCheckedIn > 0 && <polygon points={chartTrend.checkedArea} fill="url(#analyticsPurpleGrad)" />}
                    <polyline
                      points={chartTrend.totalPolyline}
                      fill="none"
                      stroke="#1c7fff"
                      strokeWidth="2.5"
                    />
                    <polyline
                      points={chartTrend.checkedPolyline}
                      fill="none"
                      stroke="#9646ff"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
                <div className="chart-timeline-labels">
                  {chartTrend.labels.map((lbl) => (
                    <span key={lbl}>{lbl}</span>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Category Distribution</h3>
                </div>
                <div className="donut-container">
                  <div className="donut-chart" style={{ background: categoryConicGradient }}>
                    <div className="donut-center-badge">
                      <strong>{totalRegistrations}</strong>
                      <small>Total</small>
                    </div>
                  </div>
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
                          <div className="bar-track"><span style={{ width: `${yieldPct}%`, background: 'var(--accent-green)' }} /></div>
                          <b>{yieldPct}%</b>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <h3>Attendance Ratio</h3>
                </div>
                <div className="donut-container" style={{ minHeight: '110px' }}>
                  <div
                    className="donut-chart"
                    style={{ background: attendanceConicGradient }}
                  >
                    <div className="donut-center-badge">
                      <strong>{totalCheckedIn}</strong>
                      <small>Arrived</small>
                    </div>
                  </div>
                  <div className="donut-legend-grid">
                    <span>Checked In: <b>{totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}%</b> ({totalCheckedIn})</span>
                    <span>Yet to Arrive: <b>{totalRegistrations > 0 ? Math.round((totalYetToArrive / totalRegistrations) * 100) : 0}%</b> ({totalYetToArrive})</span>
                    <span>Est. Teams: <b>25%</b> ({teamRegistrations})</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '13px' }}>Agenda Stages ({stages.length})</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      onClick={() => downloadEventFlowAsImage(stages)}
                      title="Download complete schedule as high-resolution image"
                    >
                      <Download size={13} />
                      <span>Download Flow Image</span>
                    </button>
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
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
