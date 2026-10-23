import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, LogIn } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;

  try {
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    user = null;
  }

  // 1. Not logged in -> Redirect to Admin Login
  if (!token || !user) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 2. Logged in, but unauthorized role -> Show Cyber 403 Forbidden Screen
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#070709] text-gray-200 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Background glow effects */}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-red-600/15 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-md w-full bg-[#111115]/90 border border-red-500/30 rounded-3xl p-8 md:p-10 text-center relative z-10 shadow-[0_20px_60px_rgba(239,68,68,0.2)] backdrop-blur-2xl">
          
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
            <ShieldAlert size={42} />
          </div>

          <div className="inline-block bg-red-500/15 border border-red-500/30 text-red-400 font-mono text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
            Clearance Level 403
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            Access Denied
          </h2>
          
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            This sector is restricted to <strong className="text-white uppercase font-bold">{allowedRoles.join(' / ')}</strong> personnel only.
          </p>

          <div className="bg-black/50 border border-white/5 rounded-2xl p-4 mb-8 text-left text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-500">Current User:</span>
              <span className="text-gray-300 font-bold">{user.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-500">Active Role:</span>
              <span className="text-red-400 font-bold uppercase">{user.role || 'GUEST'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Required:</span>
              <span className="text-green-400 font-bold uppercase">{allowedRoles.join(' OR ')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/admin/login?redirect=${encodeURIComponent(location.pathname)}`)}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2 text-sm"
            >
              <LogIn size={16} /> Authenticate as Admin
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-xl border border-white/10 transition flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 3. Authorized -> Render children
  return children;
}
