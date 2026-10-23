import React from 'react';
import { Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AnimatedLogo() {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
      <div className="relative flex items-center justify-center p-2 rounded-lg bg-[#111] overflow-hidden shadow-[0_0_10px_rgba(37,99,235,0.2)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-shadow duration-500">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_270deg,#3b82f6_360deg)] animate-[spin_2s_linear_infinite] opacity-50 group-hover:bg-[conic-gradient(from_0deg,transparent_0_270deg,#a855f7_360deg)] group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-lg z-0"></div>
        <Terminal size={22} className="text-blue-400 relative z-10 group-hover:text-purple-400 transition-colors duration-300" />
      </div>
      <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-widest font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all">Qode<span className="text-blue-500 group-hover:text-purple-500 transition-colors">Quant</span></span>
    </div>
  );
}
