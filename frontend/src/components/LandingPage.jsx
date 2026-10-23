import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Code, Keyboard, Play, ChevronRight, TerminalSquare, ShieldCheck, Cpu, Code2, Globe, CheckCircle, ArrowRight, Video, FileCode2, Eye, Box, X, Plus, Calendar, Pencil, MousePointer2, CheckSquare, BarChart2, Stethoscope, Cog, Zap, Sparkles, RefreshCw } from 'lucide-react';
import AuthModal from './AuthModal';
import PaymentModal from './PaymentModal';
import AnimatedLogo from './AnimatedLogo';

import ParticleBackground from './ParticleBackground';

export default function LandingPage() {
  const navigate = useNavigate();
  const [examCode, setExamCode] = useState('');
  const [hoveredLangIndex, setHoveredLangIndex] = useState(null);

  // Daily Quote / Funny Coder Line State
  const [dailyQuote, setDailyQuote] = useState({
    text: "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
    author: "Anonymous Coder",
    category: "funny"
  });
  const [allActiveQuotes, setAllActiveQuotes] = useState([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isQuoteFlipping, setIsQuoteFlipping] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('auth') === 'true');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchActiveQuote();
  }, []);

  const fetchActiveQuote = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes/active`);
      if (res.ok) {
        const data = await res.json();
        if (data.quote && data.quote.text) {
          setDailyQuote(data.quote);
        }
        if (data.quotes && data.quotes.length > 0) {
          setAllActiveQuotes(data.quotes);
        }
      }
    } catch (err) {
      console.log('Using default daily quote');
    }
  };

  const cycleNextQuote = (e) => {
    e?.stopPropagation();
    if (allActiveQuotes.length > 1) {
      setIsQuoteFlipping(true);
      setTimeout(() => {
        const nextIdx = (quoteIndex + 1) % allActiveQuotes.length;
        setQuoteIndex(nextIdx);
        setDailyQuote(allActiveQuotes[nextIdx]);
        setIsQuoteFlipping(false);
      }, 200);
    }
  };

  const handleLoginSuccess = (user) => {
    localStorage.setItem('auth', 'true');
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    setIsAuthenticated(true);
    setShowLoginModal(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    setShowMenu(false);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setJoinError('');

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const code = examCode.trim();
    if (code) {
      if (code.includes('/exam/')) {
        const parts = code.split('/exam/');
        if (parts[1]) {
          navigate(`/exam/${parts[1]}`);
        } else {
          setJoinError("Invalid link format.");
        }
      } else {
        setJoinError("Please paste the full generated exam link.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-page font-sans text-muted relative overflow-hidden">

      {/* Abstract Code/Grid Background Effect */}
      <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 bg-page/80 backdrop-blur-md">
        <AnimatedLogo />

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="hover:text-accent transition font-mono">/features</button>
          <button onClick={() => navigate('/whiteboard')} className="hover:text-accent transition font-mono">/whiteboard</button>
          <button onClick={() => navigate('/todo')} className="hover:text-accent transition font-mono">/todo</button>
          <button onClick={() => alert('Documentation is currently being updated for v2.0!')} className="hover:text-accent transition font-mono">/docs</button>
          <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })} className="hover:text-accent transition font-mono">/pricing</button>
        </div>

        <div className="flex items-center gap-4">


          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-primary font-bold cursor-pointer border border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                A
              </div>
              <button
                onClick={handleLogout}
                className="text-muted hover:text-red-400 font-mono text-sm transition"
              >
                logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-muted hover:text-primary font-mono text-sm transition"
              >
                login()
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-accent hover:bg-accent-hover text-primary px-5 py-2 rounded-md font-mono text-sm transition shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                Try for free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Trial Mode Scrolling Banner */}
      <div className="w-full bg-[#0a0a0a] border-y border-yellow-500/30 py-2.5 overflow-hidden relative z-40 flex shadow-[0_0_15px_rgba(234,179,8,0.1)]">
        <div className="flex animate-marquee whitespace-nowrap min-w-max">
          <span className="text-sm md:text-base font-sans text-yellow-400 font-black px-8 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">
            🚀 This website is currently in trial/testing mode for 1 month. Enjoy all premium features for free!
          </span>
          <span className="text-sm md:text-base font-sans text-yellow-400 font-black px-8 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">
            🚀 This website is currently in trial/testing mode for 1 month. Enjoy all premium features for free!
          </span>
          <span className="text-sm md:text-base font-sans text-yellow-400 font-black px-8 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">
            🚀 This website is currently in trial/testing mode for 1 month. Enjoy all premium features for free!
          </span>
          <span className="text-sm md:text-base font-sans text-yellow-400 font-black px-8 tracking-wider uppercase drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">
            🚀 This website is currently in trial/testing mode for 1 month. Enjoy all premium features for free!
          </span>
        </div>
      </div>

      {/* Massive Brand Name with Cyber Code Particle Background */}
      <div className="relative w-full min-h-[calc(100vh-80px)] py-12 flex flex-col items-center justify-center overflow-hidden">
        <ParticleBackground />

        <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto">
          {/* Daily Quote / Funny Coder Line (Super Admin Customizable) */}
          {dailyQuote && dailyQuote.text && (
            <div 
              onClick={cycleNextQuote}
              className="mb-5 relative group cursor-pointer max-w-2xl mx-auto px-2 select-none"
              title={allActiveQuotes.length > 1 ? "Click to view next funny coder line" : "Daily Coder Line"}
            >
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/30 via-purple-500/30 to-blue-500/30 opacity-60 blur-md group-hover:opacity-100 transition duration-500 animate-pulse"></div>

              {/* Glassmorphic Cyber Pill */}
              <div className="relative z-10 flex items-center gap-2.5 px-4 md:px-5 py-2 rounded-full bg-[#111111]/90 border border-amber-400/30 group-hover:border-amber-400/70 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:scale-[1.02]">
                <div className="p-1 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/40 shrink-0">
                  <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                </div>

                <div className={`flex items-center gap-2 overflow-hidden transition-all duration-200 ${isQuoteFlipping ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}>
                  <span className="text-xs md:text-sm text-gray-200 font-medium tracking-wide">
                    "{dailyQuote.text}"
                  </span>
                  {dailyQuote.author && (
                    <span className="hidden sm:inline text-[11px] font-mono text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                      — {dailyQuote.author}
                    </span>
                  )}
                </div>

                {allActiveQuotes.length > 1 && (
                  <div className="ml-2 pl-2 border-l border-white/10 flex items-center gap-1 text-gray-400 group-hover:text-amber-400 transition-colors">
                    <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[10px] font-mono opacity-70">
                      {quoteIndex + 1}/{allActiveQuotes.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Developer Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-page/90 border border-blue-500/30 text-xs md:text-sm font-mono tracking-wider backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(59,130,246,0.15)] opacity-0 animate-fade-in-delayed">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold">RUNTIME ONLINE</span>
            <span className="text-muted/40">|</span>
            <span className="text-muted">v2.4 KERNEL</span>
            <span className="text-muted/40">|</span>
            <span className="text-blue-400 font-semibold flex items-center gap-1">
              <Zap size={12} className="fill-blue-400" /> 15+ RUNTIMES
            </span>
          </div>

          {/* Main Title: <QodeQuant /> with Terminal Cursor */}
          <h1
            className="text-[10vw] sm:text-[11vw] md:text-[9.5vw] lg:text-[8.5vw] leading-none font-bold text-primary tracking-tighter whitespace-nowrap select-none drop-shadow-[0_0_60px_rgba(59,130,246,0.25)] flex items-center justify-center pointer-events-none"
            style={{ letterSpacing: '-0.05em' }}
          >
            <span className="text-blue-500/80 mr-1 md:mr-2 font-mono font-light text-[0.85em] drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">&lt;</span>
            {"QodeQuant".split('').map((char, index) => (
              <span
                key={index}
                className="opacity-0 animate-letter-pop inline-block"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {char}
              </span>
            ))}
            <span className="text-purple-500/80 ml-1 md:ml-2 font-mono font-light text-[0.85em] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">/&gt;</span>
            <span className="inline-block w-[3px] md:w-[6px] h-[0.7em] bg-blue-400 ml-2 animate-pulse align-middle shadow-[0_0_12px_#3b82f6]"></span>
          </h1>

          {/* Subtitle / Developer Tagline */}
          <p className="text-muted mt-5 font-mono text-xs sm:text-sm md:text-base tracking-widest uppercase opacity-0 animate-fade-in-delayed text-center flex items-center gap-2">
            <span className="text-blue-400 font-bold">&gt;_</span> Next-Gen Cloud IDE • Competitive Arena • AI Proctoring
          </p>

          {/* Floating Interactive Terminal / CLI Snippet Card */}
          <div className="mt-8 w-full max-w-xl bg-card/90 border border-border/80 rounded-2xl p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl group hover:border-blue-500/50 transition-all duration-300 opacity-0 animate-fade-in-delayed">
            <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 text-xs font-mono text-muted flex items-center gap-1.5">
                  <Terminal size={12} className="text-blue-400" /> qodequant-cli — bash
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ready • &lt;10ms
              </span>
            </div>

            <div className="font-mono text-xs sm:text-sm text-left space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-blue-400 font-bold">$</span>
                <span className="text-purple-400">qodequant</span>
                <span className="text-emerald-400">run</span>
                <span className="text-yellow-400">--arena</span>
                <span className="text-muted">--lang=cpp,py,java</span>
              </div>
              <div className="text-muted pl-4 border-l border-blue-500/30 text-[11px] sm:text-xs">
                <span className="text-emerald-400 font-bold">✔</span> Isolated Docker Sandboxes <span className="text-blue-400 font-mono">[READY]</span> • Real-Time AI Proctoring
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/compiler/cpp')}
                  className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-primary text-xs font-mono font-medium flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(37,99,235,0.3)] cursor-pointer"
                >
                  <Code2 size={13} /> Launch Compiler
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-3.5 py-1.5 rounded-lg bg-card hover:bg-page border border-border text-primary text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Terminal size={13} className="text-purple-400" /> Enter Arena
                </button>
              </div>
              <span className="text-[11px] font-mono text-muted flex items-center gap-1">
                <Cpu size={12} className="text-blue-400" /> Zero Overhead
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- COMPILER GRID SECTION --- */}
      <section className="mt-12 py-12 bg-transparent relative z-20 flex justify-center px-4">
        <div className="relative w-full max-w-7xl group">
          {/* Outer glow for the card */}
          <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-[1500ms]"></div>

          <div className="animated-card-box relative z-10">
            <div className="animated-card-content overflow-hidden relative">

              {/* Top Left Pill */}
              <div className="absolute top-6 left-6 z-30">
                <div className="bg-accent text-primary text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg hover:bg-blue-700 cursor-pointer transition">
                  <Play size={14} fill="currentColor" /> Play intro
                </div>
              </div>

              <div className="pt-24 pb-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-primary mb-6 tracking-tight">Code online with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm">QodeQuant.</span></h2>
                  <p className="text-lg md:text-xl font-bold tracking-wide text-muted">
                    Come with me & let's <span className="text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">fucking crush</span> all coding together.
                  </p>
                </div>

                <div className="relative w-full max-w-[100vw] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                  <div className="flex flex-nowrap overflow-x-auto pb-16 pt-16 px-8 gap-6 items-end justify-start scrollbar-hide w-full">
                    {[
                      { name: 'HTML', icon: '5', color: 'text-primary', isHtml: true, theme: 'hover:shadow-[0_15px_40px_rgba(249,115,22,0.15)] hover:border-orange-500' },
                      { name: 'Python', icon: '🐍', color: 'text-accent', theme: 'hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] hover:border-blue-500' },
                      { name: 'JavaScript', icon: 'JS', color: 'text-black', isText: true, bg: 'bg-yellow-400', theme: 'hover:shadow-[0_15px_40px_rgba(234,179,8,0.15)] hover:border-yellow-500' },
                      { name: 'Java', icon: '☕', color: 'text-red-600', theme: 'hover:shadow-[0_15px_40px_rgba(239,68,68,0.15)] hover:border-red-500' },
                      { name: 'MySQL', icon: '🐬', color: 'text-accent', theme: 'hover:shadow-[0_15px_40px_rgba(147,197,253,0.15)] hover:border-blue-400' },
                      { name: 'C', icon: 'C', color: 'text-primary', isText: true, bg: 'bg-accent', theme: 'hover:shadow-[0_15px_40px_rgba(37,99,235,0.15)] hover:border-blue-600' },
                      { name: 'C++', icon: 'C++', color: 'text-primary', isText: true, bg: 'bg-accent', theme: 'hover:shadow-[0_15px_40px_rgba(37,99,235,0.15)] hover:border-blue-600' },
                      { name: 'PHP', icon: 'php', color: 'text-primary', isText: true, bg: 'bg-indigo-500', theme: 'hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)] hover:border-indigo-500' },
                      { name: 'C#', icon: 'C#', color: 'text-primary', isText: true, bg: 'bg-purple-600', theme: 'hover:shadow-[0_15px_40px_rgba(147,51,234,0.15)] hover:border-purple-600' },
                      { name: 'Assembly', icon: '⚙️', color: 'text-gray-600', theme: 'hover:shadow-[0_15px_40px_rgba(156,163,175,0.15)] hover:border-gray-500' },
                      { name: 'Lua', icon: '🌙', color: 'text-blue-600', theme: 'hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] hover:border-blue-500' },
                      { name: 'NodeJS', icon: '🟩', color: 'text-green-600', theme: 'hover:shadow-[0_15px_40px_rgba(34,197,94,0.15)] hover:border-green-500' },
                      { name: 'MongoDB', icon: '🍃', color: 'text-green-700', theme: 'hover:shadow-[0_15px_40px_rgba(22,163,74,0.15)] hover:border-green-600' },
                      { name: 'React', icon: '⚛️', color: 'text-cyan-500', theme: 'hover:shadow-[0_15px_40px_rgba(34,211,238,0.15)] hover:border-cyan-400' },
                      { name: 'PostgreSQL', icon: '🐘', color: 'text-accent', theme: 'hover:shadow-[0_15px_40px_rgba(96,165,250,0.15)] hover:border-blue-400' },
                    ].map((lang, index) => {
                      let scale = 1;
                      let zIndex = 1;
                      let translateY = 0;
                      let mx = 0;

                      if (hoveredLangIndex !== null) {
                        const dist = Math.abs(hoveredLangIndex - index);
                        if (dist === 0) {
                          scale = 1.3;
                          zIndex = 30;
                          translateY = -15;
                        } else if (dist === 1) {
                          scale = 1.15;
                          zIndex = 20;
                          translateY = -8;
                          mx = hoveredLangIndex < index ? 20 : -20;
                        } else if (dist === 2) {
                          scale = 1.05;
                          zIndex = 10;
                          translateY = -3;
                          mx = hoveredLangIndex < index ? 30 : -30;
                        } else {
                          mx = hoveredLangIndex < index ? 40 : -40;
                        }
                      }

                      return (
                        <div
                          key={lang.name}
                          onMouseEnter={() => setHoveredLangIndex(index)}
                          onMouseLeave={() => setHoveredLangIndex(null)}
                          onClick={() => navigate(`/compiler/${lang.name.toLowerCase()}`)}
                          className={`relative shrink-0 min-w-[200px] bg-card border-2 border-border rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-300 group shadow-[0_5px_15px_rgba(0,0,0,0.5)] ${hoveredLangIndex === null ? 'animate-card-float' : ''} ${lang.theme}`}
                          style={{
                            animationDelay: `${index * 0.1}s`,
                            transform: `scale(${scale}) translateY(${translateY}px) translateX(${mx}px)`,
                            zIndex,
                            transformOrigin: 'bottom center'
                          }}
                        >
                          <span className="text-muted font-bold text-base group-hover:text-primary transition-colors">{lang.name}</span>
                          {lang.isHtml ? (
                            <div className="bg-orange-500 text-primary font-black text-xl px-2 py-0.5 rounded shadow-sm group-hover:scale-110 transition-transform">5</div>
                          ) : lang.isText ? (
                            <div className={`font-black text-lg ${lang.color} ${lang.bg} px-2 py-1 rounded-lg group-hover:scale-110 transition-transform shadow-md`}>{lang.icon}</div>
                          ) : (
                            <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform">{lang.icon}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-20 bg-page/90 backdrop-blur-sm rounded-3xl mt-12 shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">

        {/* Left Copy */}
        <div className="max-w-2xl relative z-10">
          <div className="inline-block px-3 py-1 bg-accent-hover/10 border border-accent/30 rounded-full text-accent font-mono text-xs mb-6">
            v2.0 // AI Proctoring Engine Online
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight mb-6">
            Execute <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Secure Exams</span> <br /> at scale.
          </h1>
          <p className="text-lg text-muted mb-10 leading-relaxed font-mono text-sm">
            &gt; The modern testing environment for developers.<br />
            &gt; Real-time AI face tracking & browser monitoring.<br />
            &gt; Colab-style coding cells built right in.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('/dashboard');
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="bg-accent hover:bg-accent-hover text-primary px-6 py-3 rounded-lg font-bold transition w-full sm:w-auto shadow-lg flex items-center justify-center gap-2"
              >
                <Video size={18} fill="currentColor" /> New Exam
              </button>
            </div>

            <form onSubmit={handleJoin} className="relative flex-1 w-full flex items-center">
              <div className="relative w-full flex items-center">
                <span className="absolute left-4 text-muted"><Keyboard size={20} /></span>
                <input
                  type="text"
                  placeholder="Enter a code or link"
                  value={examCode}
                  onChange={(e) => { setExamCode(e.target.value); setJoinError(''); }}
                  className={`pl-11 pr-4 py-3 w-full bg-black/40 border rounded-lg focus:outline-none focus:ring-1 transition font-mono text-primary text-sm placeholder-gray-500 ${joinError ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'}`}
                />
              </div>
              <button
                type="submit"
                disabled={!examCode.trim()}
                className={`ml-4 px-6 py-2 font-bold text-sm rounded-lg transition ${examCode.trim() ? 'text-accent hover:bg-accent-hover/10' : 'text-gray-600 cursor-not-allowed'}`}
              >
                Join
              </button>
              {joinError && (
                <div className="absolute top-[115%] left-0 text-red-400 text-xs font-mono font-bold bg-red-900/30 border border-red-500/50 px-3 py-1.5 rounded backdrop-blur-sm animate-in slide-in-from-top-1 fade-in">
                  {joinError}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Illustration: IDE / Video Window Mockup */}
        <div className="relative z-10 w-full h-[500px] flex items-center justify-center perspective-1000">

          <div className="absolute top-10 right-0 w-full h-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-3xl -z-10 rounded-full"></div>

          {/* Fake IDE Window */}
          <div className="w-full h-full bg-card rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col transform hover:-translate-y-2 transition duration-500 hover:shadow-[0_20px_50px_rgba(37,99,235,0.3)]">

            {/* Window Controls */}
            <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-black">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="mx-auto font-mono text-xs text-muted">exam_session.py</div>
            </div>

            {/* Split View: Video on left, Code on right */}
            <div className="flex-1 flex">
              {/* Left: Video Placeholder */}
              <div className="w-1/3 border-r border-border flex flex-col p-3 gap-3 bg-[#181818]">
                <div className="flex-1 bg-black rounded-lg border border-border relative overflow-hidden group">
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded text-[10px] text-green-400 font-mono border border-green-900/50">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> AI ACTIVE
                  </div>
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=300" className="w-full h-full object-cover opacity-80" alt="Student Feed" />

                  {/* Fake Face Tracking Box */}
                  <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] border-2 border-blue-500/50 rounded-sm"></div>
                </div>
                <div className="h-24 bg-black rounded-lg border border-border flex items-center justify-center">
                  <span className="text-xs font-mono text-gray-600">Waiting for peer...</span>
                </div>
              </div>

              {/* Right: Code Placeholder */}
              <div className="w-2/3 bg-card p-4 font-mono text-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted mb-2">
                  <ChevronRight size={14} /> <span>def two_sum(nums, target):</span>
                </div>
                <div className="pl-6 text-accent">
                  seen = { }
                </div>
                <div className="pl-6 text-purple-400">
                  for i, num in enumerate(nums):
                </div>
                <div className="pl-10 text-yellow-300">
                  diff = target - num
                </div>
                <div className="pl-10 text-purple-400">
                  if diff in seen:
                </div>
                <div className="pl-14 text-green-400">
                  return [seen[diff], i]
                </div>
                <div className="pl-10 text-accent">
                  seen[num] = i
                </div>

                {/* AI Warning Simulation */}
                <div className="mt-auto bg-red-900/20 border border-red-500/30 p-2 rounded text-red-400 text-xs flex items-center gap-2">
                  <TerminalSquare size={14} />
                  <span>WARN: Multiple faces detected at line 14.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* --- WHITEBOARD SECTION --- */}
      <section className="py-24 bg-transparent relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-6">Built-in <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Whiteboard</span></h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Explain complex algorithms or system design architectures with our infinite canvas whiteboard, integrated directly into the platform.
            </p>
          </div>

          <div className="relative group max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-pink-600/20 blur-3xl rounded-3xl transform group-hover:scale-105 transition-transform duration-700 -z-10"></div>
            <div className="bg-card border-2 border-border rounded-3xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex items-center justify-center min-h-[400px]">

              {/* Fake Whiteboard UI */}
              <div className="w-full h-full bg-[#f8f9fa] rounded-2xl relative overflow-hidden flex flex-col cursor-crosshair">

                {/* Whiteboard Toolbar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white text-black shadow-xl border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-4 z-10">
                  <div className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer transition">
                    <MousePointer2 size={18} className="text-gray-600" />
                  </div>
                  <div className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer transition bg-gray-100 shadow-sm border border-gray-200">
                    <Pencil size={18} className="text-black" />
                  </div>
                  <div className="w-[1px] h-5 bg-gray-300"></div>
                  <div className="w-5 h-5 rounded-full bg-blue-500 cursor-pointer hover:scale-110 transition shadow-sm"></div>
                  <div className="w-5 h-5 rounded-full bg-red-500 cursor-pointer hover:scale-110 transition ring-2 ring-offset-2 ring-red-500 shadow-sm"></div>
                  <div className="w-5 h-5 rounded-full bg-green-500 cursor-pointer hover:scale-110 transition shadow-sm"></div>
                  <div className="w-5 h-5 rounded-full bg-gray-900 cursor-pointer hover:scale-110 transition shadow-sm"></div>
                </div>

                {/* Whiteboard Canvas/Drawing */}
                <div className="flex-1 w-full h-[500px] flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]">
                  <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Fake drawing of a binary tree */}
                    <path d="M 400 80 L 300 170" stroke="#374151" strokeWidth="3" className="stroke-dasharray-5" />
                    <path d="M 400 80 L 500 170" stroke="#374151" strokeWidth="3" />

                    <circle cx="400" cy="80" r="28" fill="white" stroke="#374151" strokeWidth="3" className="shadow-lg" />
                    <text x="400" y="87" textAnchor="middle" fill="#111827" stroke="none" className="font-mono text-xl font-bold">10</text>

                    <path d="M 300 170 L 200 260" stroke="#374151" strokeWidth="3" />
                    <path d="M 300 170 L 400 260" stroke="#374151" strokeWidth="3" />

                    <circle cx="300" cy="170" r="28" fill="white" stroke="#374151" strokeWidth="3" />
                    <text x="300" y="177" textAnchor="middle" fill="#111827" stroke="none" className="font-mono text-xl font-bold">5</text>

                    <circle cx="500" cy="170" r="28" fill="white" stroke="#374151" strokeWidth="3" />
                    <text x="500" y="177" textAnchor="middle" fill="#111827" stroke="none" className="font-mono text-xl font-bold">15</text>

                    <circle cx="200" cy="260" r="28" fill="white" stroke="#374151" strokeWidth="3" />
                    <text x="200" y="267" textAnchor="middle" fill="#111827" stroke="none" className="font-mono text-xl font-bold">3</text>

                    <circle cx="400" cy="260" r="28" fill="white" stroke="#374151" strokeWidth="3" />
                    <text x="400" y="267" textAnchor="middle" fill="#111827" stroke="none" className="font-mono text-xl font-bold">7</text>

                    {/* Fake drawing scribble */}
                    <path d="M 450 240 Q 520 180 580 290" stroke="#ef4444" strokeWidth="6" fill="none" />
                    <path d="M 580 290 L 560 270 M 580 290 L 550 300" stroke="#ef4444" strokeWidth="6" fill="none" />

                    {/* Text label */}
                    <text x="590" y="320" fill="#ef4444" stroke="none" className="font-mono text-2xl font-bold" transform="rotate(-5, 590, 320)">O(log N)</text>

                    {/* Fake handwritten brand */}
                    <g transform="translate(60, 80) rotate(-4)">
                      <text x="0" y="0" fill="#3b82f6" stroke="none" style={{ fontFamily: '"Caveat", "Comic Sans MS", "Bradley Hand", cursive', fontSize: '38px', fontWeight: 'bold', letterSpacing: '1px' }}>QodeQuant</text>
                      {/* Scribble underline */}
                      <path d="M -5 12 Q 80 5 180 15 T 195 12" stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-12">
              <button onClick={() => navigate('/whiteboard')} className="flex items-center gap-2 bg-card hover:bg-card-hover border border-border px-8 py-4 rounded-xl text-primary font-bold transition shadow-lg hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transform hover:-translate-y-1">
                <Pencil size={20} className="text-pink-500" /> Launch Interactive Whiteboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- TODO DASHBOARD SHOWCASE SECTION --- */}
      <section className="py-24 bg-page/50 backdrop-blur relative z-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold border border-blue-500/20">
                <CheckSquare size={16} /> New Feature
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-6">Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Task Management</span></h2>
              <p className="text-muted text-lg leading-relaxed">
                Stay organized and ship faster with our built-in Kanban dashboard. Track progress, manage priorities, and visualize your workflow without leaving your coding environment.
              </p>
              
              <ul className="space-y-4 my-8">
                <li className="flex items-center gap-3 text-primary font-medium">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500"><CheckCircle size={16} /></div>
                  Drag-and-drop Kanban Board
                </li>
                <li className="flex items-center gap-3 text-primary font-medium">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500"><BarChart2 size={16} /></div>
                  Visual Progress Tracking
                </li>
                <li className="flex items-center gap-3 text-primary font-medium">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Calendar size={16} /></div>
                  Upcoming Deadlines & Schedule
                </li>
              </ul>

              <button onClick={() => navigate('/todo')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-blue-500/30 transform hover:-translate-y-1">
                Open Dashboard <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex-1 w-full">
              <div className="bg-[#090b14] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden transform rotate-2 hover:rotate-0 transition duration-500 relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {/* Dashboard Mockup Image / Representation */}
                <div className="p-4 border-b border-gray-800 bg-[#0c0e1a] flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-xs text-gray-500 font-mono">QodeQuant Dashboard</div>
                </div>
                <div className="p-6 bg-[#090b14] grid gap-4">
                  <div className="flex gap-4">
                    <div className="h-24 w-1/3 rounded-xl bg-[#111526] border border-gray-800 flex flex-col justify-center items-center gap-2">
                      <div className="text-xl font-bold text-blue-500">42</div>
                      <div className="text-[10px] text-gray-500">Total Tasks</div>
                    </div>
                    <div className="h-24 w-1/3 rounded-xl bg-[#111526] border border-gray-800 flex flex-col justify-center items-center gap-2">
                      <div className="text-xl font-bold text-green-500">18</div>
                      <div className="text-[10px] text-gray-500">Completed</div>
                    </div>
                    <div className="h-24 w-1/3 rounded-xl bg-[#111526] border border-gray-800 relative overflow-hidden flex flex-col justify-center items-center gap-2">
                       <div className="text-xl font-bold text-yellow-500">10</div>
                       <div className="text-[10px] text-gray-500">In Progress</div>
                       <div className="absolute right-0 bottom-0 w-16 h-16 bg-blue-500/20 blur-xl"></div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-48 w-full rounded-xl bg-[#111526] border border-gray-800 p-4 flex flex-col gap-3">
                       <div className="flex gap-2 mb-2">
                         <div className="w-20 h-6 bg-gray-800 rounded-full flex items-center justify-center text-[9px] text-gray-400">To Do</div>
                         <div className="w-20 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-[9px] text-blue-400">In Progress</div>
                       </div>
                       <div className="w-full p-3 bg-[#0c0e1a] border border-gray-800 rounded-lg flex justify-between items-center">
                         <div className="w-1/2 h-3 bg-gray-700 rounded-full"></div>
                         <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white">Q</div>
                       </div>
                       <div className="w-full p-3 bg-[#0c0e1a] border border-gray-800 rounded-lg flex justify-between items-center">
                         <div className="w-3/4 h-3 bg-gray-700 rounded-full"></div>
                         <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-[8px] text-white">A</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AI FOR EVERYONE CTA SECTION --- */}
      <section className="py-24 bg-[#050505] relative z-20 border-t border-gray-800/50 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.1)_0%,_transparent_70%)] -z-10 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            AI for Everyone
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Master AI. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500">Apply It to Your World.</span>
          </h2>
          
          <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            Learn how to use AI effectively for learning, work, research, creativity, and your professional field.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12 text-left">
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#111] to-transparent p-4 rounded-2xl border border-gray-800/80 hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <CheckCircle className="text-blue-400" size={18} />
              </div>
              <span className="text-gray-200 font-medium">Automate repetitive daily tasks</span>
            </div>
            
            <div className="flex items-center gap-4 bg-gradient-to-r from-[#111] to-transparent p-4 rounded-2xl border border-gray-800/80 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                <CheckCircle className="text-purple-400" size={18} />
              </div>
              <span className="text-gray-200 font-medium">Boost your earning potential</span>
            </div>

            <div className="flex items-center gap-4 bg-gradient-to-r from-[#111] to-transparent p-4 rounded-2xl border border-gray-800/80 hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <CheckCircle className="text-blue-400" size={18} />
              </div>
              <span className="text-gray-200 font-medium">Research & analyze 10x faster</span>
            </div>

            <div className="flex items-center gap-4 bg-gradient-to-r from-[#111] to-transparent p-4 rounded-2xl border border-gray-800/80 hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                <CheckCircle className="text-purple-400" size={18} />
              </div>
              <span className="text-gray-200 font-medium">No prior coding experience needed</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/courses')}
            className="bg-white hover:bg-gray-200 text-black px-10 py-4 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-3 mx-auto mb-14"
          >
            Explore Course <ArrowRight size={20} />
          </button>
          
          <div className="pt-8 border-t border-gray-800/80">
            <p className="text-gray-500 text-sm md:text-base font-medium tracking-widest uppercase flex flex-wrap justify-center gap-x-2 gap-y-4">
              <span>Medical</span> <span className="text-gray-700">•</span>
              <span>Engineering</span> <span className="text-gray-700">•</span>
              <span>Business</span> <span className="text-gray-700">•</span>
              <span>Law</span> <span className="text-gray-700">•</span>
              <span>Research</span> <span className="text-gray-700">•</span>
              <span className="text-blue-400/80">Students & More</span>
            </p>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-transparent relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-6">Why Qode<span className="text-accent">Quant</span>?</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              The only platform that combines Jupyter-style interactive notebooks with real-time AI proctoring and low-latency audio/video feeds.
            </p>
          </div>

          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Eye className="text-purple-400" size={24} />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-4">Advanced AI Proctoring</h3>
                <p className="text-muted text-lg mb-6 leading-relaxed">
                  Our system utilizes Google MediaPipe's lightweight face detection algorithms directly in the browser. It tracks head movements, multiple faces, and screen tab switches to ensure 100% exam integrity without requiring heavy software installations.
                </p>
                <ul className="space-y-3 text-sm font-mono text-muted">
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-purple-400" /> Multiple Face Detection</li>
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-purple-400" /> Tab-Switching Alerts</li>
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-purple-400" /> WebRTC Live Screen Sharing</li>
                </ul>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full transform group-hover:scale-110 transition-transform duration-700 -z-10"></div>
                <div className="rounded-2xl overflow-hidden border-2 border-border shadow-2xl relative">
                  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=500" alt="Cyber Security" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <span className="font-mono text-purple-300 text-xs tracking-widest border border-purple-500/30 px-3 py-1 rounded bg-black/50 backdrop-blur-md">STATUS: MONITORING_ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 (Reversed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full transform group-hover:scale-110 transition-transform duration-700 -z-10"></div>
                <div className="rounded-2xl overflow-hidden border-2 border-border shadow-2xl relative">
                  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=500" alt="Code Execution" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <span className="font-mono text-blue-300 text-xs tracking-widest border border-accent/30 px-3 py-1 rounded bg-black/50 backdrop-blur-md">EXECUTION: SUCCESS (0.12s)</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="w-12 h-12 bg-accent-hover/10 border border-accent/30 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                  <Cpu className="text-accent" size={24} />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-4">Interactive Execution Engine</h3>
                <p className="text-muted text-lg mb-6 leading-relaxed">
                  Students write code in a beautiful, glassmorphism-themed Jupyter-style notebook. Supporting multiple languages (Python, C++, Java), our backend compiles and returns results in milliseconds.
                </p>
                <ul className="space-y-3 text-sm font-mono text-muted">
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-accent" /> Multi-language Support</li>
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-accent" /> Markdown & Code Cells</li>
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-accent" /> Live Question Pushing</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <Video className="text-green-400" size={24} />
                </div>
                <h3 className="text-3xl font-bold text-primary mb-4">Live 1-on-1 Monitoring & Audio</h3>
                <p className="text-muted text-lg mb-6 leading-relaxed">
                  Teachers aren't just passive observers. With our ultra-low latency WebRTC integration, teachers can view a student's screen in real-time, click to enlarge their feed, and use Push-To-Talk to speak directly into their ears.
                </p>
                <ul className="space-y-3 text-sm font-mono text-muted">
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-green-400" /> Real-time Screen Relay</li>
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-green-400" /> Walkie-Talkie Audio Comm</li>
                  <li className="flex items-center gap-3"><CheckCircle size={16} className="text-green-400" /> Global Warning Tickers</li>
                </ul>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-green-600/20 blur-3xl rounded-full transform group-hover:scale-110 transition-transform duration-700 -z-10"></div>
                <div className="rounded-2xl overflow-hidden border-2 border-border shadow-2xl relative">
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800&h=500" alt="Networking" className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700 opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <span className="font-mono text-green-300 text-xs tracking-widest border border-green-500/30 px-3 py-1 rounded bg-black/50 backdrop-blur-md">AUDIO: BROADCASTING</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 bg-transparent relative z-20 overflow-hidden">
        {/* Glow behind the pricing card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-6">Simple, Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Pricing</span></h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Choose the perfect plan to unlock the full power of QodeQuant.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Free Plan */}
            <div className="relative h-full">
              <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-gray-800 rounded-3xl p-8 flex flex-col relative shadow-lg overflow-hidden h-full group">
                {/* Spinning gradient border (Subdued) */}
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_270deg,#4b5563_360deg)] animate-[spin_6s_linear_infinite] opacity-20 group-hover:bg-[conic-gradient(from_0deg,transparent_0_270deg,#6b7280_360deg)] group-hover:opacity-40 transition-all duration-500 z-0 pointer-events-none rounded-3xl"></div>
                
                <div className="relative z-10 flex flex-col h-full bg-[#0a0a0a] p-8 -m-8 rounded-[1.4rem]">
                  <h3 className="text-2xl font-bold text-primary mb-2">Basic</h3>
                  <p className="text-sm text-muted mb-6">Perfect for testing out the platform.</p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-5xl font-black text-primary">Free</span>
                  </div>
                  <button 
                    onClick={() => { setShowLoginModal(true); }}
                    className="w-full py-3 rounded-xl border border-border hover:border-gray-400 text-primary font-bold transition-all mb-8 shadow-sm group-hover:bg-gray-900"
                  >
                    Get Started
                  </button>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-primary mb-4">What's included:</h4>
                    <ul className="space-y-4 text-sm text-muted">
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Up to 50 concurrent students</li>
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Basic AI Proctoring</li>
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Standard Languages (C++, Java)</li>
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Community Support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Plan (Highlighted) */}
            <div className="relative transform md:-translate-y-4 h-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.5)] z-30">
                Most Popular
              </div>
              
              <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-blue-500 rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(37,99,235,0.2)] overflow-hidden h-full">
                {/* Spinning gradient border */}
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_270deg,#3b82f6_360deg)] animate-[spin_4s_linear_infinite] opacity-30 group-hover:bg-[conic-gradient(from_0deg,transparent_0_270deg,#a855f7_360deg)] transition-all duration-500 z-0 pointer-events-none rounded-3xl"></div>
                
                <div className="relative z-10 flex flex-col h-full bg-[#0a0a0a] p-8 -m-8 rounded-[1.4rem]">
                  <div className="inline-block bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-accent/30 text-accent font-bold text-[10px] px-2.5 py-1 rounded-full mb-4 uppercase tracking-wider w-max">
                    QodeQuant PRO
                  </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Pro</h3>
                <p className="text-sm text-muted mb-6">Everything you need for secure remote assessments.</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">₹5</span>
                  <span className="text-lg text-muted mb-1">/mo</span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-muted line-through text-sm">$50</span>
                  <span className="text-[10px] text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">FLASH SALE</span>
                </div>
                <button 
                  onClick={() => { isAuthenticated ? setShowPaymentModal(true) : setShowLoginModal(true); }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-primary hover:from-blue-500 hover:to-purple-500 transition-all font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-1 mb-3"
                >
                  Upgrade to Pro
                </button>
                <p className="text-center text-[10px] text-muted flex items-center justify-center gap-1 mb-6">
                  <ShieldCheck size={12} className="text-green-500" /> 14-Day Money-Back Guarantee
                </p>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-primary mb-4">Everything in Basic, plus:</h4>
                  <ul className="space-y-4 text-sm text-muted">
                    <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-accent-hover/20 flex items-center justify-center border border-accent/30 min-w-[20px]"><CheckCircle size={12} className="text-accent" /></div> <span className="font-bold text-primary">Unlimited</span> concurrent exams</li>
                    <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-accent-hover/20 flex items-center justify-center border border-accent/30 min-w-[20px]"><CheckCircle size={12} className="text-accent" /></div> Advanced 3D AI Proctoring & Audio</li>
                    <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-accent-hover/20 flex items-center justify-center border border-accent/30 min-w-[20px]"><CheckCircle size={12} className="text-accent" /></div> All Languages (Rust, Python)</li>
                    <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 min-w-[20px]"><CheckCircle size={12} className="text-purple-400" /></div> Advanced Code Plagiarism Checker</li>
                    <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 min-w-[20px]"><CheckCircle size={12} className="text-purple-400" /></div> Detailed Export Reports & Analytics</li>
                  </ul>
                </div>
              </div>
            </div>
            </div>

            {/* Enterprise Plan */}
            <div className="relative h-full">
              <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-gray-800 rounded-3xl p-8 flex flex-col relative shadow-lg overflow-hidden h-full group">
                {/* Spinning gradient border (Subdued) */}
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_270deg,#4b5563_360deg)] animate-[spin_6s_linear_infinite] opacity-20 group-hover:bg-[conic-gradient(from_0deg,transparent_0_270deg,#6b7280_360deg)] group-hover:opacity-40 transition-all duration-500 z-0 pointer-events-none rounded-3xl"></div>
                
                <div className="relative z-10 flex flex-col h-full bg-[#0a0a0a] p-8 -m-8 rounded-[1.4rem]">
                  <h3 className="text-2xl font-bold text-primary mb-2">Enterprise</h3>
                  <p className="text-sm text-muted mb-6">For large universities and organizations.</p>
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-black text-primary mt-2">Custom</span>
                  </div>
                  <button 
                    className="w-full py-3 rounded-xl border border-border hover:border-gray-400 text-primary font-bold transition-all mb-8 shadow-sm group-hover:bg-gray-900"
                  >
                    Contact Sales
                  </button>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-primary mb-4">Everything in Pro, plus:</h4>
                    <ul className="space-y-4 text-sm text-muted">
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Dedicated Account Manager</li>
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Custom Domain & White-labeling</li>
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Single Sign-On (SSO)</li>
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> Priority 24/7 Phone Support</li>
                      <li className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center"><CheckCircle size={12} className="text-gray-400" /></div> On-premise Deployment Options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FUTURE ROADMAP SECTION --- */}
      <section className="py-24 bg-transparent relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-6">The Future of Qode<span className="text-accent">Quant</span></h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              We are constantly evolving. Here is a glimpse into the roadmap of what is coming next to the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phase 1 */}
            <div className="bg-card border border-accent/30 p-8 rounded-2xl relative overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.1)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent-hover"></div>
              <h4 className="text-accent font-mono text-sm mb-4">PHASE 1 (CURRENT)</h4>
              <h3 className="text-2xl font-bold text-primary mb-4">Intelligent Proctoring</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Our foundation. Face tracking, screen sharing, multi-language execution, and real-time audio broadcast.
              </p>
              <div className="flex items-center text-accent text-sm font-bold gap-2">
                <CheckCircle size={16} /> Completed
              </div>
            </div>

            {/* Phase 2 */}
            <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50 group-hover:bg-purple-500 transition-colors"></div>
              <h4 className="text-purple-400 font-mono text-sm mb-4">PHASE 2 (UPCOMING)</h4>
              <h3 className="text-2xl font-bold text-primary mb-4">Dockerized Sandboxes</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Moving from standard execution to fully isolated, secure Docker containers to allow students to install custom packages safely.
              </p>
              <div className="flex items-center text-muted text-sm font-bold gap-2">
                <Box size={16} /> In Development
              </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-card border border-border p-8 rounded-2xl relative overflow-hidden group hover:border-green-500/30 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 group-hover:bg-green-500 transition-colors"></div>
              <h4 className="text-green-400 font-mono text-sm mb-4">PHASE 3 (FUTURE)</h4>
              <h3 className="text-2xl font-bold text-primary mb-4">Multiplayer Mode</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Google Docs-style real-time collaboration. Ideal for technical interviews where the interviewer and candidate code together.
              </p>
              <div className="flex items-center text-muted text-sm font-bold gap-2">
                <Code2 size={16} /> Planned
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-page pt-24 pb-8 relative z-10 text-muted overflow-hidden">

        {/* Top Section */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-24">
          {/* Top Left - Experience Liftoff */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl md:text-5xl font-medium text-primary tracking-tight">Empowering next-gen developers</h2>
          </div>

          {/* Top Middle - Product */}
          <div className="col-span-1">
            <h4 className="text-primary font-medium mb-6">Product</h4>
            <ul className="space-y-4 font-medium text-[15px]">
              <li><a href="#" className="hover:text-primary transition">Download</a></li>
              <li><a href="#" className="hover:text-primary transition">Product</a></li>
              <li><a href="#" className="hover:text-primary transition">Docs</a></li>
              <li><a href="#" className="hover:text-primary transition">Changelog</a></li>
              <li><a href="#" className="hover:text-primary transition">Press</a></li>
              <li><a href="#" className="hover:text-primary transition">Releases</a></li>
            </ul>
          </div>

          {/* Top Right - Resources */}
          <div className="col-span-1">
            <h4 className="text-primary font-medium mb-6">Resources</h4>
            <ul className="space-y-4 font-medium text-[15px]">
              <li><a href="#" className="hover:text-primary transition">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition">Use Cases</a></li>
            </ul>
          </div>
        </div>

        {/* Center Huge Text */}
        <div className="w-full flex justify-center mb-16 overflow-hidden px-4">
          <h1 className="text-[13vw] sm:text-[14vw] leading-none font-bold text-primary tracking-tighter whitespace-nowrap" style={{ letterSpacing: '-0.05em' }}>
            QodeQuant
          </h1>
        </div>

        {/* Bottom Section */}
        <div className="max-w-7xl mx-auto px-6 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-medium">
          {/* Bottom Left - Brand */}
          <div className="text-2xl font-bold text-primary tracking-tight">
            QodeQuant
          </div>

          {/* Bottom Right - Links */}
          <div className="flex flex-wrap items-center gap-6 text-[14px]">
            <a href="#" className="hover:text-primary transition">About QodeQuant</a>
            <a href="#" className="hover:text-primary transition">Products</a>
            <a href="#" className="hover:text-primary transition">Privacy</a>
            <a href="#" className="hover:text-primary transition">Terms</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

    </div>
  );
}
