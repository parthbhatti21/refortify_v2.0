import React from 'react';
import MultiStepForm from './components/MultiStepForm';
import Library from './components/Library';
import Login from './components/Login';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import './App.css';
//
function App() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthed(!!data.session);
    };
    getSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

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
                <button
                  onClick={async () => { await supabase.auth.signOut(); }}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
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
        ) : window.location.pathname === '/library' ? (
          <Library />
        ) : (
          <MultiStepForm />
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
