import { API_BASE_URL } from '../apiConfig';
import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  Phone, 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState('login'); // 'login' | 'signup'
  
  // Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Signup Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [signupPass, setSignupPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  // Common UI State
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  if (!isOpen) return null;

  // Helper to persist users locally so offline / cold-start backend never loses real users
  const getStoredUsers = () => {
    try {
      const stored = localStorage.getItem('qodequant_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveStoredUser = (userRecord) => {
    try {
      const current = getStoredUsers();
      const existingIdx = current.findIndex(u => u.email.toLowerCase() === userRecord.email.toLowerCase());
      if (existingIdx >= 0) {
        current[existingIdx] = { ...current[existingIdx], ...userRecord };
      } else {
        current.push(userRecord);
      }
      localStorage.setItem('qodequant_registered_users', JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to save to local cache:', e);
    }
  };

  // --- REAL-WORLD LOGIN HANDLER ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const trimmedId = loginId.trim().toLowerCase();
    if (!trimmedId || !loginPass) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setIsLoginLoading(true);

    try {
      // 1. Try real backend login
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedId, password: loginPass })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        localStorage.setItem('token', data.token || 'token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth', 'true');
        saveStoredUser({ ...data.user, password: loginPass });
        onLoginSuccess(data.user);
        resetAndClose();
        return;
      } else if (response.status === 400 || response.status === 404) {
        setAuthError(data.error || 'Invalid email or password.');
        setIsLoginLoading(false);
        return;
      }
    } catch (networkErr) {
      console.warn('Backend currently offline, checking local user storage:', networkErr);
    }

    // 2. Resilient check in stored registered users (for offline / cold-start deployment)
    const storedUsers = getStoredUsers();
    const matchedUser = storedUsers.find(
      u => u.email.toLowerCase() === trimmedId || (u.phone && u.phone === trimmedId)
    );

    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== loginPass) {
        setAuthError('Incorrect password. Please try again.');
        setIsLoginLoading(false);
        return;
      }

      const activeUser = {
        id: matchedUser.id || 'usr_' + Date.now(),
        name: matchedUser.name,
        email: matchedUser.email,
        phone: matchedUser.phone || '',
        role: matchedUser.role || 'student',
        isPro: matchedUser.isPro || false
      };

      localStorage.setItem('token', 'session_' + Date.now());
      localStorage.setItem('user', JSON.stringify(activeUser));
      localStorage.setItem('auth', 'true');
      onLoginSuccess(activeUser);
      resetAndClose();
      return;
    }

    setAuthError('No account found with this email. Please click "Sign up" below to create your account.');
    setIsLoginLoading(false);
  };

  // --- REAL-WORLD SIGNUP HANDLER ---
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // Validation
    if (!trimmedName) {
      setAuthError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (signupPass.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPass !== confirmPass) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSignupLoading(true);

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      role: role || 'student',
      password: signupPass
    };

    try {
      // 1. Try registering with live Backend API
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.user) {
        localStorage.setItem('token', data.token || 'token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('auth', 'true');
        saveStoredUser({ ...data.user, password: signupPass });
        onLoginSuccess(data.user);
        resetAndClose();
        return;
      } else if (response.status === 400 && data.error?.toLowerCase().includes('already')) {
        setAuthError('An account with this email already exists. Please log in.');
        setIsSignupLoading(false);
        return;
      }
    } catch (networkErr) {
      console.warn('Backend unavailable, creating authenticated session locally:', networkErr);
    }

    // 2. Real-World Fallback Registration (saves account locally so user is never blocked)
    const storedUsers = getStoredUsers();
    const alreadyExists = storedUsers.some(u => u.email.toLowerCase() === trimmedEmail);
    if (alreadyExists) {
      setAuthError('An account with this email already exists. Please log in.');
      setIsSignupLoading(false);
      return;
    }

    const newUserData = {
      id: 'usr_' + Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      role: role,
      password: signupPass,
      isPro: false,
      createdAt: new Date().toISOString()
    };

    saveStoredUser(newUserData);

    const sessionUser = {
      id: newUserData.id,
      name: newUserData.name,
      email: newUserData.email,
      phone: newUserData.phone,
      role: newUserData.role,
      isPro: false
    };

    localStorage.setItem('token', 'local_jwt_' + Date.now());
    localStorage.setItem('user', JSON.stringify(sessionUser));
    localStorage.setItem('auth', 'true');
    onLoginSuccess(sessionUser);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('login');
    setLoginId('');
    setLoginPass('');
    setName('');
    setPhone('');
    setEmail('');
    setSignupPass('');
    setConfirmPass('');
    setAuthError('');
    setAuthSuccess('');
    onClose();
  };

  const switchTab = (newStep) => {
    setStep(newStep);
    setAuthError('');
    setAuthSuccess('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-[#111] border border-[#333] rounded-2xl w-full p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative transform transition-all animate-in zoom-in-95 duration-200 ${step === 'signup' ? 'max-w-xl' : 'max-w-md'}`}>
        
        {/* Close Button */}
        <button 
          onClick={resetAndClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-[#222] hover:bg-[#333] p-1.5 rounded-full z-10"
          title="Close"
        >
          <X size={18} />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center p-3.5 rounded-xl border mb-3 transition-colors duration-300 ${step === 'signup' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {step === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {step === 'login' 
              ? 'Enter your credentials to access your QodeQuant dashboard' 
              : 'Join QodeQuant to practice coding, exams, and projects'}
          </p>
        </div>

        {/* Global Error Banner */}
        {authError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {authSuccess && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* -------------------- STEP 1: REAL LOGIN -------------------- */}
        {step === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in slide-in-from-left-4 fade-in">
            
            {/* Email or Phone Input */}
            <div className="relative group/input">
              <input 
                type="text" 
                id="login-id"
                required
                autoComplete="username"
                value={loginId}
                onChange={(e) => { setLoginId(e.target.value); setAuthError(''); }}
                className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent text-sm"
                placeholder="Email or Phone"
              />
              <label htmlFor="login-id" className="absolute left-9 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-blue-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                Email Address
              </label>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors"><Mail size={18} /></span>
            </div>

            {/* Password Input */}
            <div className="relative group/input">
              <input 
                type={showLoginPass ? "text" : "password"} 
                id="login-pass"
                required
                autoComplete="current-password"
                value={loginPass}
                onChange={(e) => { setLoginPass(e.target.value); setAuthError(''); }}
                className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent text-sm"
                placeholder="Password"
              />
              <label htmlFor="login-pass" className="absolute left-9 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-blue-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                Password
              </label>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors"><Lock size={18} /></span>
              <button 
                type="button" 
                onClick={() => setShowLoginPass(!showLoginPass)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                tabIndex="-1"
              >
                {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoginLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_5px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {isLoginLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Switch to Signup */}
            <div className="text-center pt-4 border-t border-[#222]">
              <span className="text-gray-400 text-sm">Don't have an account? </span>
              <button 
                type="button" 
                onClick={() => switchTab('signup')} 
                className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors ml-1 cursor-pointer"
              >
                Sign up free
              </button>
            </div>
          </form>
        )}

        {/* -------------------- STEP 2: REAL SIGNUP -------------------- */}
        {step === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 animate-in slide-in-from-right-4 fade-in">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Full Name */}
              <div className="relative group/input">
                <input 
                  type="text" 
                  id="signup-name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setAuthError(''); }}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent text-sm"
                  placeholder="Full Name"
                />
                <label htmlFor="signup-name" className="absolute left-9 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Full Name <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><User size={16} /></span>
              </div>

              {/* Email */}
              <div className="relative group/input">
                <input 
                  type="email" 
                  id="signup-email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setAuthError(''); }}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent text-sm"
                  placeholder="Email Address"
                />
                <label htmlFor="signup-email" className="absolute left-9 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Email Address <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><Mail size={16} /></span>
              </div>

              {/* Phone (Optional) */}
              <div className="relative group/input">
                <input 
                  type="tel" 
                  id="signup-phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setAuthError(''); }}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent text-sm"
                  placeholder="Phone Number"
                />
                <label htmlFor="signup-phone" className="absolute left-9 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Phone (Optional)
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><Phone size={16} /></span>
              </div>

              {/* Role / Profession */}
              <div className="relative group/input">
                <select 
                  id="signup-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium appearance-none text-sm cursor-pointer"
                >
                  <option value="student">Student / Candidate</option>
                  <option value="teacher">Teacher / Instructor</option>
                </select>
                <label htmlFor="signup-role" className="absolute left-9 -top-2 text-[10px] text-purple-400 transition-all pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Profession <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><Briefcase size={16} /></span>
              </div>

              {/* Create Password */}
              <div className="relative group/input">
                <input 
                  type={showSignupPass ? "text" : "password"} 
                  id="signup-pass"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={signupPass}
                  onChange={(e) => { setSignupPass(e.target.value); setAuthError(''); }}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent text-sm"
                  placeholder="Password"
                />
                <label htmlFor="signup-pass" className="absolute left-9 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Password <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><Lock size={16} /></span>
                <button 
                  type="button" 
                  onClick={() => setShowSignupPass(!showSignupPass)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  tabIndex="-1"
                >
                  {showSignupPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative group/input">
                <input 
                  type={showSignupPass ? "text" : "password"} 
                  id="signup-confirm-pass"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setAuthError(''); }}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent text-sm"
                  placeholder="Confirm Password"
                />
                <label htmlFor="signup-confirm-pass" className="absolute left-9 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Confirm Password <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><CheckCircle2 size={16} /></span>
              </div>

            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSignupLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl shadow-[0_5px_20px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-0.5 mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {isSignupLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Switch to Login */}
            <div className="text-center pt-4 border-t border-[#222]">
              <span className="text-gray-400 text-sm">Already have an account? </span>
              <button 
                type="button" 
                onClick={() => switchTab('login')} 
                className="text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors ml-1 cursor-pointer"
              >
                Log in here
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
