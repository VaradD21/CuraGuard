import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RegistrationPage } from './components/RegistrationPage';
import { PortalPage } from './components/PortalPage';
import { LoginPage } from './components/LoginPage';
import { apiCall } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    'landing' | 'registration' | 'portal' | 'login'
  >('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [parentEmail, setParentEmail] = useState('');

  // Restore auth on refresh
  useEffect(() => {
    const token = localStorage.getItem('parentToken');
    const email = localStorage.getItem('parentEmail');
    if (token) {
      setIsAuthenticated(true);
      setParentEmail(email || '');
      setCurrentPage('portal');
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'landing' | 'registration' | 'portal' | 'login');
  };

  const handleRegister = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const resp = await apiCall('/register', 'POST', { email, password, full_name: fullName });
      localStorage.setItem('parentToken', resp.access_token);
      localStorage.setItem('parentId', resp.parent_id);
      localStorage.setItem('parentEmail', email);
      setParentEmail(email);
      setIsAuthenticated(true);
      setCurrentPage('portal');
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const resp = await apiCall('/login', 'POST', { email, password });
      localStorage.setItem('parentToken', resp.access_token);
      localStorage.setItem('parentId', resp.parent_id);
      localStorage.setItem('parentEmail', email);
      setParentEmail(email);
      setIsAuthenticated(true);
      setCurrentPage('portal');
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Login failed. Check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parentToken');
    localStorage.removeItem('parentId');
    localStorage.removeItem('parentEmail');
    setIsAuthenticated(false);
    setParentEmail('');
    setCurrentPage('landing');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isAuthenticated={isAuthenticated}
        parentEmail={parentEmail}
        onLogout={handleLogout}
      />
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'registration' && (
        <RegistrationPage onNavigate={handleNavigate} onRegister={handleRegister} />
      )}
      {currentPage === 'login' && (
        <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />
      )}
      {currentPage === 'portal' && isAuthenticated && (
        <PortalPage onNavigate={handleNavigate} onLogout={handleLogout} />
      )}
    </div>
  );
}