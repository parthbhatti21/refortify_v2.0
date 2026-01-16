import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logger } from '../lib/loggingService';

const Login: React.FC = () => {
  const mapError = (msg?: string | null) => {
    const text = (msg || '').toLowerCase();
    if (text.includes('token has expired') || text.includes('token is invalid') || text.includes('expired or invalid')) {
      return 'OTP has expired or is invalid. Please request a new code.';
    }
    if (text.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    return msg || 'Something went wrong. Please try again.';
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState<'password' | 'otp'>('password');
  const [loadingAction, setLoadingAction] = useState<'none' | 'send' | 'verify' | 'resend'>('none');
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const startPasswordPhase = () => {
    setPhase('password');
    setOtp('');
    setError(null);
    try { localStorage.removeItem('otp_pending'); } catch {}
  };

  const signInPasswordThenOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingAction('send');
    // 1) Validate email/password
    const passRes = await supabase.auth.signInWithPassword({ email, password });
    if (passRes.error) {
      setError(mapError(passRes.error.message));
      setLoadingAction('none');
      return;
    }
    // Immediately show OTP input
    setPhase('otp');
    try { localStorage.setItem('otp_pending', '1'); } catch {}
    setLoadingAction('none');
    // 2) In background, sign out to avoid granting access until OTP is verified, then send OTP
    ;(async () => {
      try {
        await supabase.auth.signOut();
        const otpRes = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: undefined
          }
        });
        if (otpRes.error) setError(mapError(otpRes.error.message));
      } catch (bgErr: any) {
        setError(mapError(bgErr?.message) || 'Failed to send code');
      }
    })();
  };

  const verifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingAction('verify');
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error) {
      setError(mapError(error.message));
      await logger.logLoginFailure(email, error.message);
    } else {
      await logger.logLoginSuccess(email);
      logger.resetSession();
    }
    setLoadingAction('none');
    if (!error) {
      try { localStorage.removeItem('otp_pending'); } catch {}
    }
  };

  const resendOtp = async () => {
    setError(null);
    setLoadingAction('resend');
    const otpRes = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: undefined
      }
    });
    if (otpRes.error) setError(mapError(otpRes.error.message));
    setLoadingAction('none');
    if (!otpRes.error) {
      setResendCooldown(60);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg mt-8 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:block bg-white p-6 flex items-center justify-center">
          <div className="text-center">
            <img src="/logo-1.webp" alt="Logo" className="mx-auto mb-4 w-40 h-40 object-contain" />
            <h3 className="text-xl font-bold text-[#722420]">Welcome back</h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">Secure sign-in with email OTP</p>
          </div>
        </div>
        <div className="p-6">
          <div className="text-center md:hidden mb-4">
            <img src="/logo-1.webp" alt="Logo" className="mx-auto mb-2 w-16 h-16 object-contain" />
            <h3 className="text-lg font-bold text-[#722420]">Welcome back</h3>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 mt-2 text-center">{phase === 'password' ? 'Sign in' : 'Enter OTP'}</h2>
      {error && (
        <div className="mb-3 p-2 text-sm rounded border border-red-200 bg-red-50 text-red-800">{error}</div>
      )}
      {phase === 'password' ? (
        <form onSubmit={signInPasswordThenOtp} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loadingAction !== 'none'}
            className="w-full px-4 py-2 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] disabled:opacity-50"
          >
            {loadingAction === 'send' ? 'Sending OTP…' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyEmailOtp} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">One-time code</label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the 8-digit code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent tracking-widest"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Check your email for a 8-digit code.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loadingAction !== 'none'}
              onClick={startPasswordPhase}
              className="w-1/3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loadingAction !== 'none' && loadingAction !== 'resend'}
              className="flex-1 px-4 py-2 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] disabled:opacity-50"
            >
              {loadingAction === 'verify' ? 'Verifying…' : 'Verify & Sign in'}
            </button>
          </div>
          <div className="text-center mt-2">
            <button
              type="button"
              disabled={loadingAction !== 'none' || resendCooldown > 0}
              onClick={resendOtp}
              className="text-xs text-[#722420] hover:underline disabled:opacity-50"
            >
              {loadingAction === 'resend' ? 'Resending…' : resendCooldown > 0 ? `Resend in 0:${String(resendCooldown).padStart(2,'0')}` : 'Resend code'}
            </button>
          </div>
        </form>
      )}
        </div>
      </div>
    </div>
  );
};

export default Login;


