import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Plus, Settings, HelpCircle, LayoutGrid, Calendar, Play, User, ShieldAlert, Clock, Search, ChevronRight, Zap, Activity, Lock, Star, Trophy, Swords, CheckCircle } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import PaymentModal from './PaymentModal';
import ParticleBackground from './ParticleBackground';

export default function Dashboard() {
  const navigate = useNavigate();
  const [examCode, setExamCode] = useState('');
  const [sysTime, setSysTime] = useState(new Date());
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showProWelcome, setShowProWelcome] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setInterval(() => setSysTime(new Date()), 1000);
    fetchExams();
    fetchUserProfile();

    const hasSeenProWelcome = localStorage.getItem('hasSeenProWelcome');
    if (!hasSeenProWelcome) {
      setShowProWelcome(true);
      localStorage.setItem('hasSeenProWelcome', 'true');
    }

    return () => clearInterval(timer);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams`);
      if (res.ok) {
        const data = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const makeLive = async (examId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/exams/${examId}/live`, {
        method: 'PUT'
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Exam is now Live! Link: ${data.link}`);
        fetchExams();
        navigate(`/monitor/${examId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const code = examCode.trim();
    if (code) {
      const id = code.includes('/exam/') ? code.split('/exam/')[1] : code;
      navigate(`/exam/${id}`);
    }
  };

  const handleMonitor = (e) => {
    e.preventDefault();
    const code = examCode.trim();
    if (code) {
      const id = code.includes('/exam/') ? code.split('/exam/')[1] : code;
      navigate(`/monitor/${id}`);
    }
  };

  const getCountdown = (exam) => {
    if (exam.status === 'live') {
      const endsAt = new Date(new Date(exam.startTime).getTime() + exam.durationMinutes * 60000);
      const diff = endsAt - sysTime;
      if (diff <= 0) return <span className="text-red-400 font-medium text-sm flex items-center gap-1"><Clock size={14}/> Time's Up</span>;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return <span className="text-blue-400 font-medium text-sm flex items-center gap-1 whitespace-nowrap"><Clock size={14}/> Ends in {h}h {m}m {s}s</span>;
    }
    if (exam.status === 'scheduled') {
      if (!exam.scheduledFor) return <span className="text-gray-500">-</span>;
      const diff = new Date(exam.scheduledFor) - sysTime;
      if (diff <= 0) return <span className="text-yellow-400 font-medium text-sm flex items-center gap-1"><Zap size={14}/> Ready</span>;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      return <span className="text-purple-400 font-medium text-sm flex items-center gap-1 whitespace-nowrap"><Calendar size={14}/> Starts in {h}h {m}m {s}s</span>;
    }
    return <span className="text-gray-500">-</span>;
  };

  const timeString = sysTime.toLocaleTimeString('en-US', { hour12: false });
  const dateString = sysTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-gray-200 flex flex-col relative overflow-hidden">
      
      {/* Cyber Code Floating Particles Background */}
      <ParticleBackground className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      {/* Glassmorphic Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#111111]/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <AnimatedLogo />
        
        {/* Modern Search/Action Bar */}
        <div className="flex-1 max-w-2xl mx-12">
          <form className="relative flex items-center bg-[#1a1a1a]/50 rounded-full px-2 py-1.5 border border-white/10 focus-within:border-blue-500/50 focus-within:bg-[#1a1a1a] focus-within:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-300">
            <Search className="text-gray-400 ml-3 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Enter Exam ID or Link to Join / Monitor..."
              value={examCode}
              onChange={(e) => setExamCode(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none px-2 py-1.5 text-sm text-gray-200 placeholder-gray-500"
            />
            <div className="flex gap-2 mr-1">
              <button 
                onClick={handleJoin}
                disabled={!examCode.trim()}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${examCode.trim() ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
              >
                JOIN
              </button>
              <button 
                onClick={handleMonitor}
                disabled={!examCode.trim()}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 ${examCode.trim() ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
              >
                MONITOR
              </button>
            </div>
          </form>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-5 text-gray-400">
          <button 
            onClick={() => navigate('/superadmin')}
            className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-2 rounded-lg transition-colors border border-purple-500/20"
          >
            <ShieldAlert size={16} /> SUPER ADMIN
          </button>
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors border border-red-500/20"
          >
            <ShieldAlert size={16} /> ADMIN
          </button>
          
          <div className="w-px h-6 bg-white/10"></div>
          
          <button className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><HelpCircle size={20} /></button>
          <button className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Settings size={20} /></button>
          <button className="hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><LayoutGrid size={20} /></button>
          
          <div 
            onClick={() => navigate('/profile')}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer border-2 border-white/10 hover:border-blue-500 transition-all overflow-hidden ml-2 ${!userProfile?.profilePic ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : ''}`}
            title="My Profile"
          >
            {userProfile?.profilePic ? (
              <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8 relative z-10">
        
        {/* Top Row: Welcome & Clock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Welcome Card with Animated Rotating Glow Light */}
          <div className="lg:col-span-2 relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-30 blur-2xl group-hover:opacity-60 transition duration-700"></div>

            <div className="animated-card-box relative z-10 h-full rounded-3xl">
              <div className="animated-card-content p-8 flex flex-col justify-between overflow-hidden relative rounded-3xl h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full group-hover:bg-blue-500/35 transition-colors duration-700"></div>
                
                <div className="relative z-10">
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                    Welcome back, {userProfile?.name?.split(' ')[0] || 'Instructor'}!
                  </h1>
                  <p className="text-gray-400 mb-8 text-lg">Manage your active sessions and scheduled examinations.</p>
                  
                  <button 
                    onClick={() => navigate('/create')}
                    className="inline-flex items-center gap-3 bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 cursor-pointer"
                  >
                    <Plus size={18} /> Create New Exam
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clock Widget with Purple Animated Rotating Glow Light */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-30 blur-2xl group-hover:opacity-60 transition duration-700"></div>

            <div className="animated-card-box-purple relative z-10 h-full rounded-3xl">
              <div className="animated-card-content p-8 flex flex-col justify-center items-center text-center overflow-hidden relative rounded-3xl h-full">
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-500/15 to-transparent"></div>
                <Activity className="text-purple-400 mb-4 opacity-75 animate-pulse" size={32} />
                <h2 className="text-5xl font-black font-mono tracking-tight text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  {timeString}
                </h2>
                <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">
                  {dateString}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Upgrade Banner with Amber Animated Rotating Glow Light */}
        <div className="w-full relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 opacity-25 blur-xl group-hover:opacity-50 transition duration-700"></div>
          
          <div className="animated-card-box-amber relative z-10 rounded-3xl">
            <div className="animated-card-content p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl overflow-hidden bg-[#18150f]/95">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <Terminal className="text-yellow-500" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    Unlock Premium Features <Zap size={18} className="text-yellow-500 fill-yellow-500" />
                  </h3>
                  <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
                    Upgrade your workspace to access advanced AST code analysis, strict anti-plagiarism tools, and custom execution environments for your students.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="shrink-0 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black px-8 py-3.5 rounded-full text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] hover:scale-105 flex items-center gap-2 cursor-pointer">
                Upgrade Now <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Exams Section */}
        <div className="relative group flex-1">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-25 blur-xl group-hover:opacity-50 transition duration-700"></div>
          
          <div className="animated-card-box relative z-10 flex flex-col flex-1 min-h-[400px] rounded-3xl">
            <div className="animated-card-content overflow-hidden flex flex-col flex-1 rounded-3xl">
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div> Exam Sessions
                </h2>
            <button 
              onClick={fetchExams}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Refresh List
            </button>
          </div>

          <div className="p-6 md:p-8 flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-medium tracking-wide animate-pulse">Loading sessions...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                  <Terminal size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No active exams</h3>
                <p className="text-gray-400 mb-8">You haven't created any exams yet. Create your first exam to get started.</p>
                <button 
                  onClick={() => navigate('/create')}
                  className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                >
                  Create Exam
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                  <div key={exam.id} className="relative group">
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20 blur-md group-hover:opacity-50 transition duration-500"></div>
                    <div className="animated-card-box relative z-10 rounded-2xl h-full">
                      <div className="animated-card-content p-6 rounded-2xl bg-[#141414] relative overflow-hidden flex flex-col justify-between h-full">
                        {/* Status indicator line */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${exam.status === 'live' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : exam.status === 'scheduled' ? 'bg-purple-500' : 'bg-gray-600'}`}></div>

                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-xs font-mono text-gray-500 mb-1">ID: #{exam.id}</p>
                            <h3 className="font-bold text-lg text-white truncate max-w-[200px]" title={exam.title}>{exam.title}</h3>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${exam.status === 'live' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : exam.status === 'scheduled' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                            {exam.status}
                          </span>
                        </div>
                        
                        <div className="mb-6 bg-black/40 rounded-xl p-3 border border-white/5">
                          {getCountdown(exam)}
                        </div>

                        <div className="flex gap-3 mt-auto">
                          {exam.status === 'live' ? (
                            <button 
                              onClick={() => navigate(`/monitor/${exam.id}`)} 
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Activity size={16} /> Monitor
                            </button>
                          ) : (
                            <button 
                              onClick={() => makeLive(exam.id)} 
                              className="flex-1 bg-white/5 hover:bg-green-500/20 text-gray-300 hover:text-green-400 border border-white/10 hover:border-green-500/30 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Play size={16} /> Make Live
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

        {/* Exam Arenas Section (Game Style) */}
        <div className="mt-12 relative z-10">
          
          {/* PUBG-Style Rank Banner with Silver Rotating Glow Light */}
          <div className="mb-12 relative group">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-gray-400 via-slate-300 to-gray-500 opacity-25 blur-xl group-hover:opacity-50 transition duration-700"></div>

            <div className="animated-card-box-silver relative z-10 rounded-[2rem]">
              <div className="animated-card-content p-8 flex flex-col md:flex-row items-center justify-between rounded-[2rem] overflow-hidden bg-gradient-to-r from-[#111111] to-[#1a1a1a]">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-gray-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-gray-400/20 transition-all duration-700"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                   {/* Current Badge Graphic (Silver III) */}
                   <div className="w-32 h-32 relative flex justify-center items-center">
                      <div className="absolute w-24 h-24 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-700 rotate-45 rounded-xl shadow-[0_0_40px_rgba(156,163,175,0.4)]"></div>
                      <div className="absolute w-[88px] h-[88px] bg-gradient-to-tl from-gray-500 via-gray-200 to-white rotate-45 rounded-xl border-[3px] border-white/50 flex items-center justify-center"></div>
                      <ShieldAlert className="text-gray-700 drop-shadow-md relative z-10" size={40} />
                      {/* Stars */}
                      <div className="absolute -bottom-2 flex gap-1 z-10 bg-[#111111] px-3 py-1 rounded-full border border-gray-600">
                        <Star size={12} className="fill-gray-300 text-gray-300"/>
                        <Star size={12} className="fill-gray-300 text-gray-300"/>
                        <Star size={12} className="fill-gray-300 text-gray-300"/>
                      </div>
                   </div>
                   
                   <div className="text-center md:text-left">
                      <div className="inline-block bg-gray-800/80 border border-gray-600 text-gray-300 font-black tracking-[0.2em] uppercase text-[10px] px-3 py-1 rounded-full mb-3 shadow-inner">Current Season Rank</div>
                      <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 drop-shadow-lg tracking-tight">SILVER III</h2>
                      
                      <div className="mt-5 flex flex-col gap-2">
                         <div className="flex justify-between items-end">
                           <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">Rank Progress</span>
                           <span className="text-gray-300 font-black text-sm">240 <span className="text-gray-500">/ 400 XP</span></span>
                         </div>
                         <div className="w-64 md:w-80 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                            <div className="h-full bg-gradient-to-r from-gray-500 via-gray-300 to-white w-[60%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] relative overflow-hidden">
                               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
                
                {/* Upcoming Ranks Preview */}
                <div className="hidden lg:flex gap-8 items-center bg-black/40 px-8 py-6 rounded-3xl border border-white/5 backdrop-blur-md">
                   {/* Bronze */}
                   <div className="flex flex-col items-center gap-3 grayscale opacity-40">
                      <div className="w-14 h-14 relative flex justify-center items-center">
                        <div className="absolute w-10 h-10 bg-gradient-to-br from-amber-700 to-orange-900 rotate-45 rounded-lg border-2 border-orange-400/30"></div>
                      </div>
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Bronze</span>
                   </div>
                   {/* Current (Silver) */}
                   <div className="flex flex-col items-center gap-3 relative">
                      <div className="absolute -inset-4 bg-gray-500/20 rounded-full blur-xl"></div>
                      <div className="w-14 h-14 relative flex justify-center items-center scale-110 z-10">
                        <div className="absolute w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rotate-45 rounded-lg border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"></div>
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider z-10">Silver</span>
                   </div>
                   {/* Gold */}
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 relative flex justify-center items-center">
                        <div className="absolute w-10 h-10 bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 rotate-45 rounded-lg border-2 border-yellow-200/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]"></div>
                      </div>
                      <span className="text-xs font-black text-yellow-500 uppercase tracking-wider drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">Gold</span>
                   </div>
                   {/* RANSH */}
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 relative flex justify-center items-center">
                        <div className="absolute w-10 h-10 bg-gradient-to-br from-red-600 via-purple-600 to-indigo-900 rotate-45 rounded-lg border-2 border-purple-400/80 shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-pulse"></div>
                      </div>
                      <span className="text-xs font-black text-purple-400 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">RANSH</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div> 
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Exam Arenas</h2>
          </div>

          <div className="flex flex-col gap-16">
            
            {/* Beginner Track with Green Rotating Glow Light */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-20 blur-2xl group-hover:opacity-45 transition duration-700"></div>

              <div className="animated-card-box-green relative z-10 rounded-[2.5rem]">
                <div className="animated-card-content p-8 md:p-10 rounded-[2.5rem] overflow-hidden bg-[#111111]/95">
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-green-500/15 transition-colors duration-700"></div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-green-500/10 pb-8 mb-16 relative z-10">
                    <div>
                      <div className="flex items-center gap-6 mb-4">
                        {/* Bronze Badge */}
                        <div className="w-16 h-16 relative flex items-center justify-center">
                           <div className="absolute w-14 h-14 bg-gradient-to-br from-amber-700 via-orange-600 to-yellow-900 rotate-45 rounded-xl shadow-[0_0_30px_rgba(217,119,6,0.5)]"></div>
                           <div className="absolute w-12 h-12 bg-gradient-to-tl from-amber-800 via-orange-500 to-yellow-600 rotate-45 rounded-xl border-[2px] border-orange-300 flex items-center justify-center"></div>
                           <Star className="text-orange-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] relative z-10" size={26} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white tracking-tight">Beginner Track</h3>
                          <p className="text-orange-400 font-black text-xs tracking-[0.2em] uppercase mt-1 drop-shadow-md">BRONZE TIER • 10 Levels</p>
                        </div>
                      </div>
                      <p className="text-gray-400 max-w-xl mt-4 text-base leading-relaxed">Master the absolute basics of programming. Loops, arrays, and control flow. Complete all levels to unlock the Silver tier.</p>
                    </div>
                    <div className="bg-[#111111]/50 border border-green-500/20 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                      <div className="text-right">
                        <p className="text-[10px] text-green-400/80 font-black uppercase tracking-widest mb-1">Track Progress</p>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-black text-white">3<span className="text-gray-500 text-lg">/10</span></div>
                          <div className="flex text-yellow-500"><Star size={14} className="fill-yellow-500"/><Star size={14} className="fill-yellow-500"/><Star size={14} className="fill-yellow-500"/></div>
                        </div>
                      </div>
                      <div className="w-px h-12 bg-white/10"></div>
                      <button className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-black font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] hover:-translate-y-1 flex items-center gap-2">
                        <Play size={18} className="fill-black" /> Continue Lvl 4
                      </button>
                    </div>
                  </div>

                  {/* Advanced Game Map */}
                  <div className="relative w-full py-12 overflow-x-auto custom-scrollbar">
                    <div className="min-w-[1000px] relative h-[250px] flex items-center">
                      
                      {/* Glowing Energy Path connecting nodes */}
                      <div className="absolute top-1/2 left-12 right-12 h-2 bg-[#111111] border-y border-green-500/20 -translate-y-1/2 rounded-full z-0 shadow-inner">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-emerald-400 to-transparent w-[35%] rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse"></div>
                      </div>
                      
                      <div className="flex justify-between items-center w-full relative z-10 px-6">
                        {[
                          { r: 'I', n: "Basics", s: 3, status: 'done' }, { r: 'II', n: "Variables", s: 2, status: 'done' }, { r: 'III', n: "Operators", s: 3, status: 'done' }, 
                          { r: 'IV', n: "If-Else", s: 0, status: 'current' }, { r: 'V', n: "Loops", s: 0, status: 'locked' },
                          { r: 'VI', n: "Arrays", s: 0, status: 'locked' }, { r: 'VII', n: "Strings", s: 0, status: 'locked' }, { r: 'VIII', n: "Functions", s: 0, status: 'locked' }, 
                          { r: 'IX', n: "Basic DS", s: 0, status: 'locked' }, { r: 'X', n: "Boss Fight", s: 0, status: 'boss' }
                        ].map((node, i) => {
                          const levelIndex = i + 1;
                          const isClickable = node.status === 'done' || node.status === 'current' || node.status === 'boss';
                          return (
                          <div key={node.r} className="flex flex-col items-center relative group w-24" style={{ animation: `float ${3 + (i%3)}s ease-in-out infinite ${i*0.2}s`, transform: `translateY(${i % 2 === 0 ? '-60px' : '60px'})` }}>
                            
                            {/* Connecting Laser to main path */}
                            <div className={`absolute left-1/2 w-1 -translate-x-1/2 ${i % 2 === 0 ? 'top-[56px] h-16 bg-gradient-to-b' : 'bottom-[56px] h-16 bg-gradient-to-t'} ${node.status === 'done' || node.status === 'current' ? 'from-green-500 to-transparent shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'from-green-500/20 to-transparent'} -z-10 rounded-full`}></div>
                            
                            {/* The Island Node */}
                            <button 
                              onClick={() => isClickable && navigate(`/arena/beginner/${levelIndex}`)}
                              title={isClickable ? `Enter Level ${node.r}: ${node.n}` : 'Complete previous levels to unlock'}
                              className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black transition-all duration-300 relative z-10
                              ${node.status === 'done' ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-black border border-white/40 shadow-[0_0_30px_rgba(34,197,94,0.8)] scale-110 hover:scale-125 cursor-pointer' : 
                                node.status === 'current' ? 'bg-[#111111] border-2 border-green-400 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.6)] scale-125 hover:scale-150 ring-4 ring-green-500/20 cursor-pointer' : 
                                node.status === 'boss' ? 'bg-gradient-to-br from-purple-600 to-red-600 border-2 border-white/20 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-125 cursor-pointer' :
                                'bg-[#111111] border-2 border-green-500/30 text-green-500/50 cursor-not-allowed'}`}
                            >
                              <span className="text-xl tracking-tighter">{node.r}</span>
                              
                              {/* Current level beacon */}
                              {node.status === 'current' && <div className="absolute inset-0 rounded-3xl border-2 border-green-400 animate-ping opacity-75"></div>}
                              {/* Lock overlay for locked nodes */}
                              {node.status === 'locked' && <Lock size={12} className="absolute top-1 right-1 opacity-40" />}
                            </button>
                            
                            {/* Label & Stars */}
                            <div className={`absolute w-max flex flex-col items-center ${i % 2 === 0 ? '-top-12' : '-bottom-12'}`}>
                              <p className={`text-sm font-black tracking-wide mb-1 transition-colors ${node.status === 'done' || node.status === 'current' ? 'text-white' : node.status === 'boss' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-gray-500 group-hover:text-green-400/80'}`}>{node.n}</p>
                              {node.status === 'done' && (
                                <div className="flex gap-0.5">
                                  {[1,2,3].map(star => (
                                    <Star key={star} size={10} className={star <= node.s ? "fill-yellow-500 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,1)]" : "text-gray-700"} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          );
                        })}

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Intermediate Track with Amber Rotating Glow Light */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 opacity-20 blur-2xl group-hover:opacity-45 transition duration-700"></div>

              <div className="animated-card-box-amber relative z-10 rounded-[2.5rem]">
                <div className="animated-card-content p-8 md:p-10 rounded-[2.5rem] overflow-hidden bg-[#111111]/95">
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-yellow-500/15 transition-colors duration-700"></div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-yellow-500/10 pb-8 mb-16 relative z-10">
                    <div>
                      <div className="flex items-center gap-6 mb-4">
                        {/* Silver Badge */}
                        <div className="w-16 h-16 relative flex items-center justify-center">
                           <div className="absolute w-14 h-14 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-700 rotate-45 rounded-xl shadow-[0_0_30px_rgba(156,163,175,0.4)]"></div>
                           <div className="absolute w-12 h-12 bg-gradient-to-tl from-gray-500 via-gray-200 to-white rotate-45 rounded-xl border-[2px] border-white/70 flex items-center justify-center"></div>
                           <ShieldAlert className="text-gray-700 drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)] relative z-10" size={26} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white tracking-tight">Intermediate Track</h3>
                          <p className="text-gray-300 font-black text-xs tracking-[0.2em] uppercase mt-1 drop-shadow-md">SILVER TIER • 10 Levels</p>
                        </div>
                      </div>
                      <p className="text-gray-400 max-w-xl mt-4 text-base leading-relaxed">Data structures, string manipulation, and sorting algorithms. Step up your game and earn your Gold badge.</p>
                    </div>
                    <div className="bg-[#111111]/50 border border-yellow-500/20 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                      <div className="text-right">
                        <p className="text-[10px] text-yellow-400/80 font-black uppercase tracking-widest mb-1">Track Status</p>
                        <p className="text-gray-500 font-bold flex items-center gap-2"><Lock size={14} className="text-red-500"/> Locked</p>
                      </div>
                      <div className="w-px h-12 bg-white/10"></div>
                      <button className="bg-gray-800 text-gray-500 font-black px-8 py-3.5 rounded-xl cursor-not-allowed border border-gray-700 flex items-center gap-2">
                        Finish Beginner First
                      </button>
                    </div>
                  </div>

                  {/* Game Map */}
                  <div className="relative w-full py-12 overflow-x-auto custom-scrollbar opacity-70 grayscale-[0.8] group-hover:grayscale-[0.5] transition-all duration-700">
                    <div className="min-w-[1000px] relative h-[250px] flex items-center">
                      
                      {/* Central Timeline */}
                      <div className="absolute top-1/2 left-12 right-12 h-2 bg-[#111111] border-y border-yellow-500/10 -translate-y-1/2 rounded-full z-0 shadow-inner"></div>
                      
                      <div className="flex justify-between items-center w-full relative z-10 px-6">
                        {[
                          { r: 'I', n: "Hash Maps" }, { r: 'II', n: "2 Pointers" }, { r: 'III', n: "Sliding Win" }, { r: 'IV', n: "Stacks" }, { r: 'V', n: "Queues" },
                          { r: 'VI', n: "Linked List" }, { r: 'VII', n: "Trees" }, { r: 'VIII', n: "Binary Src" }, { r: 'IX', n: "Recursion" }, { r: 'X', n: "Dragon Boss" }
                        ].map((node, i) => (
                          <div key={node.r} className="flex flex-col items-center relative w-24" style={{ transform: `translateY(${i % 2 === 0 ? '-60px' : '60px'})` }}>
                            
                            {/* Connecting Line */}
                            <div className={`absolute left-1/2 w-1 -translate-x-1/2 ${i % 2 === 0 ? 'top-[56px] h-16 bg-gradient-to-b' : 'bottom-[56px] h-16 bg-gradient-to-t'} from-yellow-500/10 to-transparent -z-10 rounded-full`}></div>
                            
                            {/* The Island Node */}
                            <button className="w-14 h-14 rounded-3xl bg-[#111111] border-2 border-yellow-500/30 flex items-center justify-center text-yellow-500/30 font-black relative z-10 cursor-not-allowed">
                              <span className="text-xl tracking-tighter opacity-40">{node.r}</span>
                              <Lock size={12} className="absolute top-1 right-1 opacity-40" />
                            </button>
                            
                            <div className={`absolute w-max text-center ${i % 2 === 0 ? '-top-10' : '-bottom-10'}`}>
                              <p className="text-xs font-bold text-gray-600">{node.n}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Track with Red Rotating Glow Light */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 opacity-20 blur-2xl group-hover:opacity-45 transition duration-700"></div>

              <div className="animated-card-box-red relative z-10 rounded-[2.5rem]">
                <div className="animated-card-content p-8 md:p-10 rounded-[2.5rem] overflow-hidden bg-[#111111]/95">
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-red-500/15 transition-colors duration-700"></div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-red-500/10 pb-8 mb-16 relative z-10">
                    <div>
                      <div className="flex items-center gap-6 mb-4">
                        {/* Gold Badge */}
                        <div className="w-16 h-16 relative flex items-center justify-center">
                           <div className="absolute w-14 h-14 bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 rotate-45 rounded-xl shadow-[0_0_40px_rgba(234,179,8,0.5)]"></div>
                           <div className="absolute w-12 h-12 bg-gradient-to-tl from-yellow-600 via-yellow-300 to-yellow-100 rotate-45 rounded-xl border-[2px] border-yellow-100 flex items-center justify-center"></div>
                           <Trophy className="text-amber-800 drop-shadow-[0_2px_2px_rgba(255,255,255,0.5)] relative z-10" size={26} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white tracking-tight">Advanced Track</h3>
                          <p className="text-yellow-400 font-black text-xs tracking-[0.2em] uppercase mt-1 drop-shadow-md">GOLD TIER • 10 Levels</p>
                        </div>
                      </div>
                      <p className="text-gray-400 max-w-xl mt-4 text-base leading-relaxed">Dynamic programming, graphs, and complex optimization problems. The ultimate test of your logic to reach Diamond.</p>
                    </div>
                    <div className="bg-[#111111]/50 border border-red-500/20 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                      <div className="text-right">
                        <p className="text-[10px] text-red-400/80 font-black uppercase tracking-widest mb-1">Track Status</p>
                        <p className="text-gray-500 font-bold flex items-center gap-2"><Lock size={14} className="text-red-500"/> Locked</p>
                      </div>
                      <div className="w-px h-12 bg-white/10"></div>
                      <button className="bg-gray-800 text-gray-500 font-black px-8 py-3.5 rounded-xl cursor-not-allowed border border-gray-700 flex items-center gap-2">
                        Finish Int. First
                      </button>
                    </div>
                  </div>

                  {/* Game Map */}
                  <div className="relative w-full py-12 overflow-x-auto custom-scrollbar opacity-60 grayscale-[0.9] group-hover:grayscale-[0.6] transition-all duration-700">
                    <div className="min-w-[1000px] relative h-[250px] flex items-center">
                      
                      {/* Central Timeline */}
                      <div className="absolute top-1/2 left-12 right-12 h-2 bg-[#111111] border-y border-red-500/10 -translate-y-1/2 rounded-full z-0 shadow-inner"></div>
                      
                      <div className="flex justify-between items-center w-full relative z-10 px-6">
                        {[
                          { r: 'I', n: "DP Basics" }, { r: 'II', n: "Graphs" }, { r: 'III', n: "Backtrack" }, { r: 'IV', n: "Tries" }, { r: 'V', n: "Seg Trees" },
                          { r: 'VI', n: "Bit Manip" }, { r: 'VII', n: "Math & Geo" }, { r: 'VIII', n: "Adv DP" }, { r: 'IX', n: "Hard Graph" }, { r: 'X', n: "God Mode" }
                        ].map((node, i) => (
                          <div key={node.r} className="flex flex-col items-center relative w-24" style={{ transform: `translateY(${i % 2 === 0 ? '-60px' : '60px'})` }}>
                            
                            {/* Connecting Line */}
                            <div className={`absolute left-1/2 w-1 -translate-x-1/2 ${i % 2 === 0 ? 'top-[56px] h-16 bg-gradient-to-b' : 'bottom-[56px] h-16 bg-gradient-to-t'} from-red-500/10 to-transparent -z-10 rounded-full`}></div>
                            
                            {/* The Island Node */}
                            <button className="w-14 h-14 rounded-3xl bg-[#111111] border-2 border-red-500/30 flex items-center justify-center text-red-500/30 font-black relative z-10 cursor-not-allowed">
                              <span className="text-xl tracking-tighter opacity-40">{node.r}</span>
                              <Lock size={12} className="absolute top-1 right-1 opacity-40" />
                            </button>
                            
                            <div className={`absolute w-max text-center ${i % 2 === 0 ? '-top-10' : '-bottom-10'}`}>
                              <p className="text-xs font-bold text-gray-600">{node.n}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RANSH TIER with Purple Rotating Glow Light */}
            <div className="relative group mb-12">
              <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 opacity-30 blur-3xl group-hover:opacity-65 transition duration-1000"></div>

              <div className="animated-card-box-purple relative z-10 rounded-[2.5rem]">
                <div className="animated-card-content p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-[#111111]/95">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-purple-600/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-purple-600/20 transition-colors duration-1000 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen"></div>
                  
                  <div className="flex flex-col items-center justify-center text-center relative z-10">
                    
                    {/* Massive Conqueror Badge */}
                    <div className="w-48 h-48 relative flex justify-center items-center mb-8">
                       <div className="absolute w-32 h-32 bg-gradient-to-br from-red-600 via-purple-600 to-indigo-900 rotate-45 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.6)] animate-[pulse_4s_ease-in-out_infinite]"></div>
                       <div className="absolute w-28 h-28 bg-gradient-to-tl from-[#111111] via-purple-900/50 to-[#111111] rotate-45 rounded-2xl border-4 border-purple-400/50 flex items-center justify-center backdrop-blur-sm"></div>
                       
                       <div className="relative z-10 flex flex-col items-center">
                         <Swords className="text-purple-300 drop-shadow-[0_0_15px_rgba(216,180,254,0.8)] mb-2" size={48} />
                       </div>
                    </div>

                    <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-indigo-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] tracking-widest mb-2">RANSH TIER</h3>
                    <p className="text-purple-300 font-bold text-sm tracking-[0.3em] uppercase mb-8">The Ultimate Coding Conqueror</p>
                    
                    <p className="text-gray-400 max-w-2xl text-lg leading-relaxed mb-10">
                      Only the top 1% of coders reach this level. No I to X levels. Just one massive, brutal DSA Pro challenge that will test everything you've learned. Are you worthy?
                    </p>
                    
                    <button className="bg-gray-900 text-gray-500 font-black px-12 py-5 rounded-2xl cursor-not-allowed border-2 border-gray-800 shadow-inner flex items-center gap-3 text-lg hover:border-red-900 hover:text-red-900 transition-all duration-300">
                      <Lock size={20} /> Unlock all tiers to enter RANSH
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      
      {/* Required for custom animations & scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes popIn3D {
          0% { opacity: 0; transform: perspective(1000px) rotateX(20deg) scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: perspective(1000px) rotateX(0deg) scale(1) translateY(0); }
        }
      `}} />

      {/* Pro Welcome Modal */}
      {showProWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 transition-all duration-500 perspective-1000">
          <div className="relative group max-w-lg w-full animate-[popIn3D_0.6s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-50 blur-2xl group-hover:opacity-80 transition duration-700"></div>
            <div 
              className="animated-card-box-purple relative z-10 rounded-[2rem]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="animated-card-content rounded-[2rem] p-8 pb-10 bg-gradient-to-b from-[#1e293b] to-[#111111] overflow-hidden flex flex-col justify-between text-center relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/30 blur-3xl rounded-full"></div>
                
                <div className="relative z-10">
                  {/* Float animated icon */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(168,85,247,0.5)] transform -rotate-6 hover:rotate-0 transition-transform duration-300 animate-[float_3s_ease-in-out_infinite] border-t border-l border-white/30 border-b-[6px] border-r-[2px] border-purple-900">
                    <Star className="text-white drop-shadow-md" size={40} fill="currentColor" />
                  </div>
                  
                  <h2 className="text-4xl font-black text-white mb-3 tracking-tight drop-shadow-lg">You've got <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">PRO!</span></h2>
                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    Because you just signed up, we've gifted you a <strong className="text-white bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30 shadow-sm">$100 PRO Membership</strong> absolutely free for 1 month!
                  </p>
                  
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-8 text-sm text-gray-300 text-left shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400"/> <span className="font-medium">Unlimited access to Premium Tiers</span></li>
                      <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400"/> <span className="font-medium">AI Proctoring Engine access</span></li>
                      <li className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400"/> <span className="font-medium">Advanced coding assessments</span></li>
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => setShowProWelcome(false)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(168,85,247,0.4),inset_0_2px_10px_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-[0_0px_10px_rgba(168,85,247,0.4)] border-b-[6px] border-purple-900 active:border-b-0 cursor-pointer"
                  >
                    Awesome, let's go!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}
