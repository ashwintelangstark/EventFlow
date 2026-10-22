import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { AdminPortal } from './pages/AdminPortal';
import { NonAdminPortal } from './pages/NonAdminPortal';

const MainView = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (role === 'admin') {
    return <AdminPortal />;
  }

  return <NonAdminPortal />;
};

export default function App() {
  return (
    <AuthProvider>
      <MainView />
    </AuthProvider>
  );
}
