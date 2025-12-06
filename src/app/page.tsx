'use client';

import { useState, useEffect } from 'react';
import JobCalendar from '@/components/JobCalendar';
import LoginScreen from '@/components/LoginScreen';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('user');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedEmail && savedName) {
      setCurrentUserEmail(savedEmail);
      setCurrentUserName(savedName);
      setCurrentUserRole(savedRole || 'user');
    }
    setMounted(true);
  }, []);

  const handleLogin = (email: string, name: string, role: string) => {
    setCurrentUserEmail(email);
    setCurrentUserName(name);
    setCurrentUserRole(role);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    setCurrentUserName(null);
    setCurrentUserRole('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  };

  if (!mounted) {
  return (
    <>
      <JobCalendar 
        currentUserEmail={currentUserEmail || undefined} 
        currentUserName={currentUserName || undefined}
        currentUserRole={currentUserRole}
        onLogout={handleLogout} 
      />
      <Toaster position="bottom-right" />
    </>
  );  <JobCalendar 
        currentUserEmail={currentUserEmail || undefined} 
        currentUserName={currentUserName || undefined} 
        onLogout={handleLogout} 
      />
      <Toaster position="bottom-right" />
    </>
  );
}
