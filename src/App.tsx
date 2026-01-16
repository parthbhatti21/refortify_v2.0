import React from 'react';
import MultiStepForm from './components/MultiStepForm';
import Library from './components/Library';
import Login from './components/Login';
import Logs from './components/Logs';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { logger } from './lib/loggingService';
import './App.css';

function App() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [path, setPath] = useState<string>(() => window.location.pathname);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthed(!!data.session);
      if (data.session?.user?.email) {
        setUserEmail(data.session.user.email);
      }
    };
    getSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
    const onPop = () => setPath(window.location.pathname);
    const onNavigate = (e: any) => {
      const to = e?.detail?.to || '/';
      if (window.location.pathname !== to) {
        window.history.pushState({}, '', to);
        setPath(to);
      }
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('app:navigate', onNavigate as any);
    
    // Global error handler
    const handleError = async (event: ErrorEvent) => {
      if (userEmail) {
        await logger.logFrontendError(
          userEmail,
          'UNCAUGHT_ERROR',
          event.message,
          event.error?.stack,
          {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        );
      }
    };
    
    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      if (userEmail) {
        await logger.logFrontendError(
          userEmail,
          'UNHANDLED_REJECTION',
          event.reason?.message || 'Promise rejected',
          event.reason?.stack
        );
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('app:navigate', onNavigate as any);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [userEmail]);

  const otpPending = (() => { try { return localStorage.getItem('otp_pending') === '1'; } catch { return false; } })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col">
            {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="flex-shrink-0 flex items-center">
                <img src="/logo-1.webp" alt="ChimneySweeps" className="w-10 h-10 mr-3" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#722420] text-left">
                    ChimneySweeps
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 text-left">Professional Report Builder</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs sm:text-sm text-gray-500 text-center"> Quick report generator</span>
              {isAuthed ? (
                <>
                  
                  {path !== '/' && (
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('app:navigate', { detail: { to: '/' } }));
                      }}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Home
                    </button>
                  )}
                  <button
                    onClick={async () => { 
                      await logger.logLogout(userEmail);
                      await supabase.auth.signOut(); 
                    }}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 w-full">
        {isAuthed === null ? (
          <div className="text-center text-gray-600">Loading…</div>
        ) : (!isAuthed || otpPending) ? (
          <Login />
        ) : path === '/logs' ? (
          <Logs userEmail={userEmail} />
        ) : path === '/library' ? (
          <Library userEmail={userEmail} />
        ) : (
          <MultiStepForm userEmail={userEmail} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              © 2024 ChimneySweeps. Professional business reporting made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
