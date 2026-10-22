import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AdminPortal } from './pages/AdminPortal';
import { NonAdminPortal } from './pages/NonAdminPortal';

const MainView = () => {
  const { isAuthenticated, role, user } = useAuth();

  // Determine whether to show Landing Page or Auth Page
  const [view, setView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (
        params.has('mode') ||
        params.has('auth') ||
        params.has('tab') ||
        params.get('register') === 'true' ||
        path === '/login' ||
        path === '/auth' ||
        hash === '#signup' ||
        hash === '#register' ||
        hash === '#login'
      ) {
        return 'auth';
      }
    } catch {}
    return 'landing';
  });

  // Keep view in sync with URL history and postMessage events
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        const path = window.location.pathname;
        if (
          params.has('mode') ||
          params.has('auth') ||
          params.has('tab') ||
          params.get('register') === 'true' ||
          path === '/login' ||
          path === '/auth' ||
          hash === '#signup' ||
          hash === '#register' ||
          hash === '#login'
        ) {
          setView('auth');
        } else {
          setView('landing');
        }
      } catch {}
    };

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'EVENTFLOW_NAVIGATE') {
        const mode = e.data.mode || 'signup';
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('mode', mode);
          window.history.pushState({}, '', url.toString());
        } catch {}
        setView('auth');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 1. Authenticated User Routing
  if (isAuthenticated) {
    // STRICT SECURITY: Only admin@gmail.com with role admin gets AdminPortal
    const isAdmin = user?.email?.toLowerCase() === 'admin@gmail.com' && role === 'admin';
    if (isAdmin) {
      return (
        <AdminPortal
          onGoToLanding={() => {
            try {
              const url = new URL(window.location.href);
              url.search = '';
              url.hash = '';
              window.history.pushState({}, '', url.toString());
            } catch {}
            setView('landing');
          }}
        />
      );
    }

    // All other users (staff, attendees, participants) receive NonAdminPortal
    return (
      <NonAdminPortal
        onGoToLanding={() => {
          try {
            const url = new URL(window.location.href);
            url.search = '';
            url.hash = '';
            window.history.pushState({}, '', url.toString());
          } catch {}
          setView('landing');
        }}
      />
    );
  }

  // 2. Unauthenticated User Routing: Show Auth Page if navigated to
  if (view === 'auth') {
    return (
      <AuthPage
        onBackToLanding={() => {
          try {
            const url = new URL(window.location.href);
            url.search = '';
            url.hash = '';
            window.history.pushState({}, '', url.pathname);
          } catch {}
          setView('landing');
        }}
      />
    );
  }

  // 3. Unauthenticated User Default: Show Landing Page first
  return (
    <LandingPage
      onNavigateToAuth={(mode) => {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('mode', mode || 'signup');
          window.history.pushState({}, '', url.toString());
        } catch {}
        setView('auth');
      }}
    />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainView />
    </AuthProvider>
  );
}
