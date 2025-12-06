'use client';

import { useState, useEffect } from 'react';
import JobCalendar from '@/components/JobCalendar';
import LoginScreen from '@/components/LoginScreen';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const savedEmail = localStorage.getItem('userEmail');
    const savedName = localStorage.getItem('userName');
    if (savedEmail && savedName) {
      setCurrentUserEmail(savedEmail);
      setCurrentUserName(savedName);
    }
    setMounted(true);
  }, []);

  const handleLogin = (email: string, name: string) => {
    setCurrentUserEmail(email);
    setCurrentUserName(name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    setCurrentUserName(null);
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
  };

  if (!mounted) {
    return <div className="flex items-center justify-center h-screen bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div></div>;
  }

  if (!currentUserEmail) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <JobCalendar 
        currentUserEmail={currentUserEmail || undefined} 
        currentUserName={currentUserName || undefined} 
        onLogout={handleLogout} 
      />
      <Toaster position="bottom-right" />
    </>
  );
}
