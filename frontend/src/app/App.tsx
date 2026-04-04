import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RegistrationPage } from './components/RegistrationPage';
import { PortalPage } from './components/PortalPage';
import { LoginPage } from './components/LoginPage';
import { apiCall } from './api';

interface UserCredentials {
  username: string;
  password: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'registration' | 'portal' | 'login' | 'download-parent' | 'download-child'>('landing');
  const [registeredUsers, setRegisteredUsers] = useState<UserCredentials[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    } catch {
      return [];
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'landing' | 'registration' | 'portal' | 'login' | 'download-parent' | 'download-child');
  };

  const handleRegister = async (username: string, password: string): Promise<boolean> => {
    try {
      await apiCall('/register', 'POST', { email: username, password });
      return true;
    } catch (e: any) {
      console.error('Registration API failed, falling back to mock:', e.message);
      const updated = [...registeredUsers, { username, password }];
      setRegisteredUsers(updated);
      localStorage.setItem('registeredUsers', JSON.stringify(updated));
      return true;
    }
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      const resp = await apiCall('/login', 'POST', { email: username, password });
      localStorage.setItem('parentToken', resp.access_token);
      localStorage.setItem('parentId', resp.parent_id);
      setIsAuthenticated(true);
      return true;
    } catch (e: any) {
      console.error('Login API failed, falling back to mock:', e.message);
      const user = registeredUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    handleNavigate('landing');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'registration' && <RegistrationPage onNavigate={handleNavigate} onRegister={handleRegister} />}
      {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {currentPage === 'portal' && <PortalPage onNavigate={handleNavigate} />}
    </div>
  );
}