import { API_BASE_URL } from '../apiConfig';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Lock, Mail, KeyRound, ArrowRight, ArrowLeft, Zap, Sparkles, Terminal, CheckCircle } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [activePortal, setActivePortal] = useState('superadmin'); // 'superadmin' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle direct login submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        // Check if role is allowed in admin portal
        if (data.user.role !== 'admin' && data.user.role !== 'superadmin') {
          setError(`Account has role '${data.user.role.toUpperCase()}'. Admin clearance required.`);
          setLoading(false);
          return;
        }

        // Store credentials
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth', 'true');

        // Route to target
        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (data.user.role === 'superadmin') {
          navigate('/superadmin');
        } else {
          navigate('/admin');
        }
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error(err);
      setError('Server unreachable. Please check backend status.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Login for testing
  const handleQuickLogin = async (userEmail, userPassword, targetRole) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setActivePortal(targetRole === 'superadmin' ? 'superadmin' : 'admin');
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: userPassword })
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth', 'true');

        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (data.user.role === 'superadmin') {
          navigate('/superadmin');
        } else {
          navigate('/admin');
        }
      } else {
        setError(data.error || 'Quick login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-gray-200 font-sans flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Cyberpunk Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] bg-blue-600/10 blur-[160px] rounded-full pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0b0b0f]/60 backdrop-blur-xl">
        <AnimatedLogo />
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Main Site
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-xl w-full relative group">
          {/* Rotating Glowing Beam Background Aura */}
          <div className={`absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r ${activePortal === 'superadmin' ? 'from-purple-600 via-pink-600 to-indigo-600' : 'from-orange-600 via-amber-500 to-red-600'} opacity-30 blur-2xl group-hover:opacity-60 transition duration-700`}></div>

          {/* Card Body */}
          <div className="relative z-10 bg-[#0f0f14]/95 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            
            {/* Header Title & Shield */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className={`w-18 h-18 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 shadow-xl ${activePortal === 'superadmin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.3)]'}`}>
                {activePortal === 'superadmin' ? <ShieldAlert size={36} /> : <ShieldCheck size={36} />}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {activePortal === 'superadmin' ? 'Super Admin Terminal' : 'Platform Admin Terminal'}
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-1.5 font-mono">
                {activePortal === 'superadmin' ? '⚡ Master Clearance Level • Full Platform Control' : '🛡️ Content & Questions Clearance • Curriculum Management'}
              </p>
            </div>

            {/* Portal Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/50 border border-white/10 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => {
                  setActivePortal('superadmin');
                  setError('');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${activePortal === 'superadmin' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-gray-400 hover:text-white'}`}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePortal('admin');
                  setError('');
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${activePortal === 'admin' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'text-gray-400 hover:text-white'}`}
              >
                🛡️ Platform Admin
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono flex items-center gap-2.5">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Administrative Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-gray-500" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activePortal === 'superadmin' ? "superadmin@qodequant.com" : "admin@qodequant.com"}
                    className="w-full bg-[#16161f] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Secure Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-gray-500" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#16161f] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer mt-2 ${activePortal === 'superadmin' ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_25px_rgba(168,85,247,0.4)]' : 'bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-500 hover:to-amber-500 shadow-[0_0_25px_rgba(249,115,22,0.4)]'} ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
              >
                {loading ? 'Authenticating...' : (
                  <>Authenticate & Enter <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Buttons for Instant Testing */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest text-center mb-3">
                ⚡ Instant 1-Click Credentials (Dev & Testing)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('superadmin@qodequant.com', 'SuperAdmin@2026', 'superadmin')}
                  className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 p-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={13} className="text-purple-400" /> Super Admin Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@qodequant.com', 'Admin@2026', 'admin')}
                  className="bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 hover:border-orange-500/60 text-orange-300 p-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={13} className="text-orange-400" /> Platform Admin Demo
                </button>
              </div>

              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('swatikumarisuman2@gmail.com', 'Admin@123', 'superadmin')}
                  className="text-[11px] font-mono text-gray-400 hover:text-white transition underline cursor-pointer"
                >
                  Login as Personal Super Admin (swatikumarisuman2@gmail.com)
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 py-4 text-center text-xs font-mono text-gray-600">
        QodeQuant Security Kernel v2.4 • Role-Based Access Control Active
      </footer>

    </div>
  );
}
