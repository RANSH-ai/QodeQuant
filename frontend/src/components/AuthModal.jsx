import { API_BASE_URL } from '../apiConfig';
import React, { useState, useRef } from 'react';
import { X, ShieldCheck, Mail, Phone, User, Lock, KeyRound, ArrowRight, CheckCircle2, Briefcase } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState('login'); // 'login', 'signup', 'otp', 'set_password'
  
  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Signup State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  
  if (!isOpen) return null;

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId && 
    googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' && 
    !googleClientId.includes('YOUR_GOOGLE_CLIENT_ID')
  );

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: credentialResponse?.credential || 'mock_token',
          role: step === 'signup' ? role : undefined 
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        localStorage.setItem('auth', 'true');
        onLoginSuccess(data.user);
      } else {
        alert(data.error || 'Google Login failed');
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      alert('Something went wrong during Google Login');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Hardcoded bypass as requested
    if (loginId === 'swatikumarisuman2@gmail.com') {
      onLoginSuccess({ name: 'Swati Kumari Suman', email: loginId, role: 'student' });
      return;
    }
    
    if (loginId && loginPass) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginId, password: loginPass })
        });
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          localStorage.setItem('auth', 'true');
          onLoginSuccess(data.user);
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (err) {
        console.error('Login error', err);
        alert('Something went wrong during login');
      }
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (name && phone && email) {
      setStep('otp');
    }
  };
  
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus next
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const verifyOtp = () => {
    if (otp.join('').length === 4) {
      setStep('set_password');
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length >= 6) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, role, password: newPassword })
        });
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          localStorage.setItem('auth', 'true');
          onLoginSuccess(data.user);
        } else {
          alert(data.error || 'Registration failed');
        }
      } catch (err) {
        console.error('Signup error', err);
        alert('Something went wrong during registration');
      }
    }
  };

  const resetAndClose = () => {
    setStep('login');
    setLoginId('');
    setLoginPass('');
    setName('');
    setPhone('');
    setEmail('');
    setOtp(['', '', '', '']);
    setNewPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-[#111] border border-[#333] rounded-2xl w-full p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative transform transition-all animate-in zoom-in-95 duration-200 ${step === 'signup' ? 'max-w-2xl' : 'max-w-md'}`}>
        
        <button onClick={resetAndClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors bg-[#222] hover:bg-[#333] p-1 rounded-full z-10">
          <X size={20} />
        </button>
        
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center p-4 rounded-xl border mb-5 transition-colors duration-500 ${step === 'signup' ? 'bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]'}`}>
            {step === 'otp' ? <KeyRound className="text-blue-500" size={36} /> : <ShieldCheck className={step === 'signup' ? 'text-purple-500' : 'text-blue-500'} size={36} />}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 'login' && 'Secure Login'}
            {step === 'signup' && 'Create Account'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'set_password' && 'Set Password'}
          </h2>
          <p className="text-gray-400 text-sm">
            {step === 'login' && 'Authenticate to access the Creator Dashboard'}
            {step === 'signup' && 'Register to build and proctor exams'}
            {step === 'otp' && `Enter the 4-digit code sent to ${email || phone}`}
            {step === 'set_password' && 'Create a strong password to secure your account'}
          </p>
        </div>

        {/* STEP 1: LOGIN */}
        {step === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in slide-in-from-left-4 fade-in">
            
            <div className="relative group/input">
              <input 
                type="text" 
                id="login-id"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent"
                placeholder="Email or Phone"
              />
              <label htmlFor="login-id" className="absolute left-9 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-blue-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                Email or Phone
              </label>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors"><User size={18} /></span>
            </div>

            <div className="relative group/input">
              <input 
                type="password" 
                id="login-pass"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium tracking-widest placeholder-transparent"
                placeholder="Password"
              />
              <label htmlFor="login-pass" className="absolute left-9 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-blue-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-blue-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                Password
              </label>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-blue-500 transition-colors"><Lock size={18} /></span>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-[0_5px_20px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2">
              Authenticate <ArrowRight size={18} />
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-[#333] flex-1"></div>
              <span className="text-gray-500 text-xs font-bold uppercase">or continue with</span>
              <div className="h-px bg-[#333] flex-1"></div>
            </div>
            
            <div className="flex flex-col items-center w-full">
              {isGoogleConfigured ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    alert('Google Login failed or credentials rejected. Switching to demo login.');
                    handleGoogleSuccess({ credential: 'mock_token' });
                  }}
                  theme="filled_black"
                  shape="pill"
                />
              ) : (
                <button 
                  type="button" 
                  onClick={() => handleGoogleSuccess({ credential: 'mock_token' })}
                  className="w-full flex items-center justify-center gap-3 bg-[#18181b] hover:bg-[#222226] text-white border border-[#333] hover:border-[#555] font-medium py-3 px-4 rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)] group cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="font-semibold text-sm">Sign in with Google</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Demo / 1-Click</span>
                </button>
              )}
            </div>

            <div className="text-center pt-4 border-t border-[#333]">
              <span className="text-gray-500 text-sm">First time here? </span>
              <button type="button" onClick={() => setStep('signup')} className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">
                Sign up
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SIGN UP */}
        {step === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4 animate-in slide-in-from-right-4 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="relative group/input">
                <input 
                  type="text" 
                  id="signup-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent"
                  placeholder="Full Name"
                />
                <label htmlFor="signup-name" className="absolute left-9 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Full Name <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><User size={18} /></span>
              </div>

              <div className="relative group/input">
                <input 
                  type="tel" 
                  id="signup-phone"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent"
                  placeholder="Phone Number"
                />
                <label htmlFor="signup-phone" className="absolute left-9 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Phone Number <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><Phone size={18} /></span>
              </div>

              <div className="relative group/input">
                <input 
                  type="email" 
                  id="signup-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium placeholder-transparent"
                  placeholder="Email Address"
                />
                <label htmlFor="signup-email" className="absolute left-9 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-purple-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-purple-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Email Address <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><Mail size={18} /></span>
              </div>

              <div className="relative group/input">
                <select 
                  id="signup-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <label htmlFor="signup-role" className="absolute left-9 -top-2 text-[10px] text-purple-400 transition-all pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                  Profession <span className="text-purple-500">*</span>
                </label>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-purple-500 transition-colors"><Briefcase size={18} /></span>
              </div>

            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-[0_5px_20px_rgba(168,85,247,0.4)] transition-all hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2">
              Continue <ArrowRight size={18} />
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-[#333] flex-1"></div>
              <span className="text-gray-500 text-xs font-bold uppercase">or sign up with</span>
              <div className="h-px bg-[#333] flex-1"></div>
            </div>
            
            <div className="flex flex-col items-center w-full">
              {isGoogleConfigured ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    alert('Google Signup failed or credentials rejected. Switching to demo signup.');
                    handleGoogleSuccess({ credential: 'mock_token' });
                  }}
                  theme="filled_black"
                  shape="pill"
                />
              ) : (
                <button 
                  type="button" 
                  onClick={() => handleGoogleSuccess({ credential: 'mock_token' })}
                  className="w-full flex items-center justify-center gap-3 bg-[#18181b] hover:bg-[#222226] text-white border border-[#333] hover:border-[#555] font-medium py-3 px-4 rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)] group cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="font-semibold text-sm">Sign up with Google</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Demo / 1-Click</span>
                </button>
              )}
            </div>

            <div className="text-center pt-3 border-t border-[#333]">
              <span className="text-gray-500 text-sm">Already have an account? </span>
              <button type="button" onClick={() => setStep('login')} className="text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors">
                Login
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <div className="flex justify-center gap-4 my-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-14 h-16 bg-[#0a0a0a] border border-[#333] rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                />
              ))}
            </div>
            <button 
              onClick={verifyOtp} 
              disabled={otp.join('').length < 4}
              className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${otp.join('').length === 4 ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_5px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5' : 'bg-[#222] text-gray-500 cursor-not-allowed'}`}
            >
              Verify Code <CheckCircle2 size={18} />
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setStep('signup')} className="text-gray-500 hover:text-white text-sm transition-colors">
                Back to Sign Up
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SET PASSWORD */}
        {step === 'set_password' && (
          <form onSubmit={handleSetPassword} className="space-y-4 animate-in slide-in-from-right-4 fade-in">
            <div className="relative group/input">
              <input 
                type="password" 
                id="set-password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="peer w-full bg-[#0a0a0a] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-white focus:outline-none focus:border-green-500 focus:shadow-[0_0_15px_rgba(34,197,94,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium tracking-widest placeholder-transparent"
                placeholder="New Password"
              />
              <label htmlFor="set-password" className="absolute left-9 top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-green-400 peer-valid:-top-2 peer-valid:text-[10px] peer-valid:text-green-400 pointer-events-none font-semibold uppercase tracking-wider bg-[#111] px-1">
                Create New Password
              </label>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/input:text-green-500 transition-colors"><Lock size={18} /></span>
            </div>
            <p className="text-xs text-gray-500 pl-2">Must be at least 6 characters long.</p>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-[0_5px_20px_rgba(34,197,94,0.4)] transition-all hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2">
              Complete Registration <CheckCircle2 size={18} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
