import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, GraduationCap, LogOut, Zap } from 'lucide-react';

export const QuickDemoSwitcher = () => {
  const { user, role, quickLogin, logout, isAuthenticated } = useAuth();

  return (
    <div className="demo-switcher" role="region" aria-label="Demo Role Switcher">
      <div className="demo-switcher-label">
        <Zap size={14} className="text-cyan animate-pulse" />
        <span>Quick Demo</span>
      </div>

      <button
        type="button"
        className={`demo-btn ${isAuthenticated && role === 'admin' ? 'active' : ''}`}
        onClick={() => quickLogin('admin')}
        title="Switch to Admin View (Ashwin Telang)"
      >
        <Shield size={13} />
        <span>Admin</span>
      </button>

      <button
        type="button"
        className={`demo-btn ${isAuthenticated && role === 'staff' ? 'active' : ''}`}
        onClick={() => quickLogin('staff')}
        title="Switch to Staff View (Priya Sharma)"
      >
        <Users size={13} />
        <span>Staff</span>
      </button>

      <button
        type="button"
        className={`demo-btn ${isAuthenticated && role === 'attendee' ? 'active' : ''}`}
        onClick={() => quickLogin('attendee')}
        title="Switch to Student / Attendee View (Rohan Patil)"
      >
        <GraduationCap size={13} />
        <span>Attendee</span>
      </button>

      {isAuthenticated && (
        <button
          type="button"
          className="demo-btn"
          style={{ borderColor: '#682020', background: 'rgba(80, 20, 20, 0.5)', color: '#ffaaaa' }}
          onClick={logout}
          title="Sign Out to Login Screen"
        >
          <LogOut size={13} />
          <span>Exit</span>
        </button>
      )}
    </div>
  );
};
