import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play, ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2,
  XCircle, Clock, Code2, Terminal, BookOpen, Loader2,
  AlignLeft, Trophy, Zap, RotateCcw
} from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

const LANGUAGES = [
  { id: 'python', label: 'Python 3', monacoId: 'python', template: '# Write your solution here\n\n' },
  { id: 'cpp',    label: 'C++',      monacoId: 'cpp',    template: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n' },
  { id: 'c',      label: 'C',        monacoId: 'c',      template: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n' },
  { id: 'java',   label: 'Java',     monacoId: 'java',   template: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n' },
];

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export default function ArenaExam() {
  const { track, level } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData]     = useState(null);
  const [questions, setQuestions]   = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [language, setLanguage]     = useState(LANGUAGES[0]);
  const [code, setCode]             = useState(LANGUAGES[0].template);
  const [running, setRunning]       = useState(false);
  const [output, setOutput]         = useState(null); // { stdout, stderr, isError }

  const [solvedSet, setSolvedSet]   = useState(new Set());
  const [activeTab, setActiveTab]   = useState('problem'); // problem | output
  const [elapsed, setElapsed]       = useState(0);
  const [warnings, setWarnings]     = useState([]);
  const timerRef = useRef(null);

  // Fetch arena data
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/arena/${track}/${level}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setExamData(data);
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch(() => { setError('Failed to connect to server.'); setLoading(false); });
  }, [track, level]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Anti-Cheat: Browser Event Monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "Tab switch detected! Cheating is strictly monitored." }]);
      }
    };

    const handleWindowBlur = () => {
      setWarnings(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "Window lost focus! Do not leave the exam window." }]);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const trackDisplay = track ? track.charAt(0).toUpperCase() + track.slice(1) : '';
  const currentQ = questions[currentQIdx];

  // Reset code when language changes
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(lang.template);
    setOutput(null);
  };

  // Reset code editor
  const handleReset = () => {
    setCode(language.template);
    setOutput(null);
  };

  // Run code
  const handleRun = async () => {
    if (!code.trim() || running) return;
    setRunning(true);
    setOutput(null);
    setActiveTab('output');

    try {
      const res = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: language.id, code })
      });
      const data = await res.json();

      // Compare with expected output if set
      const expected = currentQ?.expectedOutput;
      if (!data.isError && expected) {
        const actualTrimmed   = (data.output || '').trim();
        const expectedTrimmed = expected.trim();
        data.passed   = actualTrimmed === expectedTrimmed;
        data.expected = expected;
      } else if (!data.isError && !expected) {
        data.passed = true;   // no expected output = just run, auto-pass
      }

      setOutput(data);
      if (data.passed) {
        setSolvedSet(prev => new Set([...prev, currentQIdx]));
      }
    } catch {
      setOutput({ output: 'Network error: Make sure backend is running on port 5000', isError: true });
    }
    setRunning(false);
  };

  // ─── Loading / Error States ───────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Loading Arena...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="text-center p-10">
        <p className="text-red-400 font-black text-xl mb-4">⚠️ {error}</p>
        {questions.length === 0 && (
          <p className="text-gray-500 mb-6">Admin ne abhi tak is level ke questions add nahi kiye hain.<br/>Admin Panel → Arena Questions se questions add karo.</p>
        )}
        <button onClick={() => navigate('/dashboard')} className="bg-orange-600 text-white font-black px-6 py-3 rounded-xl hover:bg-orange-500 transition">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
      <div className="text-center p-10 max-w-lg">
        <BookOpen size={64} className="text-orange-500/40 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-white mb-3">No Questions Yet!</h2>
        <p className="text-gray-400 mb-8">
          Admin ne abhi tak <strong className="text-orange-400">{trackDisplay} Level {ROMAN[parseInt(level)]}</strong> ke liye koi question add nahi kiya hai.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/dashboard')} className="bg-orange-600 text-white font-black px-6 py-3 rounded-xl hover:bg-orange-500 transition">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Main LeetCode UI ─────────────────────────────────────────────────────

  const difficultyColor = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  };

  return (
    <div className="h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col overflow-hidden font-sans relative">

      {/* Warnings Overlay */}
      {warnings.length > 0 && (
        <div className="absolute top-16 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
          {warnings.map((w, i) => (
            <div key={i} className="bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg shadow-xl shadow-red-500/10 backdrop-blur-sm flex flex-col pointer-events-auto">
              <span className="text-xs font-black text-red-400 mb-1">🚨 SECURITY ALERT - {w.time}</span>
              <span className="text-sm font-bold">{w.msg}</span>
            </div>
          ))}
          <button 
            onClick={() => setWarnings([])}
            className="self-end mt-2 text-xs font-bold bg-red-900/50 hover:bg-red-800 text-white px-3 py-1.5 rounded pointer-events-auto transition"
          >
            Dismiss All
          </button>
        </div>
      )}

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#30363d] bg-[#161b22] shrink-0 z-50">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm font-bold">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span className="text-[#30363d]">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase text-orange-400">{trackDisplay}</span>
            <span className="text-gray-600">·</span>
            <span className="text-xs font-black text-white">Level {ROMAN[parseInt(level)]}</span>
          </div>
        </div>

        {/* Center — Question Navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setCurrentQIdx(i => Math.max(0, i-1)); setOutput(null); setActiveTab('problem'); }}
            disabled={currentQIdx === 0}
            className="p-1.5 rounded hover:bg-[#30363d] disabled:opacity-30 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentQIdx(i); setOutput(null); setActiveTab('problem'); }}
                className={`w-7 h-7 rounded text-xs font-black transition-all ${
                  i === currentQIdx
                    ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                    : solvedSet.has(i)
                    ? 'bg-green-600/30 text-green-400 border border-green-500/50'
                    : 'bg-[#21262d] text-gray-400 hover:bg-[#30363d]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setCurrentQIdx(i => Math.min(questions.length-1, i+1)); setOutput(null); setActiveTab('problem'); }}
            disabled={currentQIdx === questions.length - 1}
            className="p-1.5 rounded hover:bg-[#30363d] disabled:opacity-30 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Solved count */}
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-green-400 font-black">{solvedSet.size}</span>
            <span className="text-gray-500">/ {questions.length}</span>
          </div>
          {/* Timer */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Clock size={14} />
            <span className="font-mono font-bold">{formatTime(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL: Problem ────────────────────────────────────────────── */}
        <div className="w-[42%] min-w-[320px] flex flex-col border-r border-[#30363d] bg-[#0d1117] overflow-hidden">
          
          {/* Problem header */}
          <div className="px-6 pt-5 pb-3 border-b border-[#21262d] shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-500 font-bold text-sm">Q{currentQIdx + 1}.</span>
              <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                currentQ?.difficulty === 'easy'   ? 'bg-green-900/30 text-green-400 border-green-500/30' :
                currentQ?.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' :
                                                    'bg-red-900/30 text-red-400 border-red-500/30'
              }`}>
                {currentQ?.difficulty || 'easy'}
              </span>
              {solvedSet.has(currentQIdx) && (
                <span className="flex items-center gap-1 text-xs font-black text-green-400 bg-green-900/20 border border-green-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} /> Solved
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white leading-tight">{currentQ?.title}</h2>
          </div>

          {/* Problem body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
            <div className="prose prose-invert max-w-none">
              <div className="text-[15px] text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
                {currentQ?.content}
              </div>
            </div>
          </div>

          {/* Question progress bar */}
          <div className="px-6 py-3 border-t border-[#21262d] shrink-0">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-bold">
              <span>Progress</span>
              <span>{solvedSet.size}/{questions.length} solved</span>
            </div>
            <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${questions.length > 0 ? (solvedSet.size / questions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Editor + Output ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">

          {/* Editor Toolbar */}
          <div className="h-10 flex items-center justify-between px-3 border-b border-[#30363d] bg-[#161b22] shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-orange-400" />
              {/* Language selector */}
              <select
                value={language.id}
                onChange={e => handleLanguageChange(LANGUAGES.find(l => l.id === e.target.value))}
                className="bg-[#21262d] border border-[#30363d] text-white text-xs rounded-md px-2 py-1 outline-none focus:border-orange-500 transition cursor-pointer font-bold"
              >
                {LANGUAGES.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset */}
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded hover:bg-[#30363d]"
                title="Reset to template"
              >
                <RotateCcw size={12} /> Reset
              </button>

              {/* Run */}
              <button
                onClick={handleRun}
                disabled={running}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:text-green-700 text-white font-black text-xs px-4 py-1.5 rounded-lg transition shadow-[0_0_15px_rgba(22,163,74,0.3)] hover:shadow-[0_0_20px_rgba(22,163,74,0.5)]"
              >
                {running
                  ? <><Loader2 size={13} className="animate-spin" /> Running...</>
                  : <><Play size={13} fill="currentColor" /> Run Code</>
                }
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div 
            className="flex-1 overflow-hidden" 
            style={{ minHeight: 0 }}
            onCopy={(e) => { e.preventDefault(); alert("Copying is not allowed during the exam."); }}
            onPaste={(e) => { e.preventDefault(); alert("Pasting is not allowed during the exam."); }}
            onCut={(e) => { e.preventDefault(); alert("Cutting is not allowed during the exam."); }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Editor
              height="100%"
              language={language.monacoId}
              theme="vs-dark"
              value={code}
              onChange={val => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: '"Fira Code", "Cascadia Code", monospace',
                fontLigatures: true,
                autoClosingBrackets: 'always',
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                snippetSuggestions: 'inline',
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                formatOnType: true,
              }}
            />
          </div>

          {/* ── Output Panel ──────────────────────────────────────────────── */}
          <div className="h-52 border-t border-[#30363d] flex flex-col shrink-0 bg-[#0d1117]">
            {/* Output tabs */}
            <div className="h-9 flex items-center gap-0 border-b border-[#21262d] bg-[#161b22] shrink-0 px-2">
              <button
                onClick={() => setActiveTab('problem')}
                className={`flex items-center gap-1.5 px-3 h-full text-xs font-bold border-b-2 transition-colors ${activeTab === 'problem' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <AlignLeft size={12} /> Problem
              </button>
              <button
                onClick={() => setActiveTab('output')}
                className={`flex items-center gap-1.5 px-3 h-full text-xs font-bold border-b-2 transition-colors ${activeTab === 'output' ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                <Terminal size={12} /> Output
                {output && (
                  <span className={`ml-1 w-2 h-2 rounded-full ${output.isError ? 'bg-red-500' : 'bg-green-500'}`} />
                )}
              </button>
            </div>

            {/* Output content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'output' ? (
                !output ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-600">
                    <Terminal size={24} className="opacity-30" />
                    <p className="text-xs font-bold">Run your code to see output here</p>
                  </div>
                ) : output.isError ? (
                  /* Runtime / Compile Error */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-black text-red-400">
                      <XCircle size={16} /> Compilation / Runtime Error
                    </div>
                    <div className="rounded-lg p-3 font-mono text-sm whitespace-pre-wrap border bg-red-950/20 border-red-500/20 text-red-300">
                      {output.output || '(no output)'}
                    </div>
                  </div>
                ) : output.expected ? (
                  /* Expected output comparison */
                  <div className="space-y-3">
                    {/* Verdict */}
                    <div className={`flex items-center gap-2 text-sm font-black px-3 py-2 rounded-lg border ${
                      output.passed
                        ? 'bg-green-900/20 border-green-500/30 text-green-400'
                        : 'bg-red-900/20 border-red-500/30 text-red-400'
                    }`}>
                      {output.passed
                        ? <><CheckCircle2 size={16} /> Accepted — Output Matches!</>
                        : <><XCircle size={16} /> Wrong Answer</>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Your Output */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Your Output</p>
                        <div className={`rounded-lg p-3 font-mono text-xs whitespace-pre-wrap border min-h-[60px] ${
                          output.passed ? 'bg-[#0f1a0f] border-green-500/20 text-green-300' : 'bg-red-950/10 border-red-500/20 text-red-300'
                        }`}>
                          {(output.output || '').trim() || <span className="opacity-40">(empty)</span>}
                        </div>
                      </div>
                      {/* Expected Output */}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">Expected Output</p>
                        <div className="rounded-lg p-3 font-mono text-xs whitespace-pre-wrap border bg-[#0f1a0f] border-green-500/30 text-green-400 min-h-[60px]">
                          {output.expected.trim()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* No expected output — just show stdout */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-black text-green-400">
                      <CheckCircle2 size={16} /> Executed Successfully
                    </div>
                    <div className="rounded-lg p-3 font-mono text-sm whitespace-pre-wrap border bg-[#0f1a0f] border-green-500/20 text-green-300">
                      {output.output || '(no output)'}
                    </div>
                  </div>
                )
              ) : (
                /* Problem tab in bottom panel - quick summary */
                <div className="text-sm text-gray-400 leading-relaxed">
                  <span className="font-black text-white">Q{currentQIdx + 1}: {currentQ?.title}</span>
                  <p className="mt-2 text-xs text-gray-500 line-clamp-4">{currentQ?.content?.slice(0, 300)}...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {solvedSet.size === questions.length && questions.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="bg-[#161b22] border-2 border-yellow-500/50 rounded-3xl p-12 text-center shadow-[0_0_80px_rgba(234,179,8,0.2)] max-w-md">
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-3">Level Complete!</h2>
            <p className="text-gray-400 mb-2">
              <strong className="text-white">{trackDisplay} — Level {ROMAN[parseInt(level)]}</strong>
            </p>
            <p className="text-gray-500 text-sm mb-8">All {questions.length} questions solved in {formatTime(elapsed)}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/arena/${track}/${Math.min(parseInt(level)+1, 10)}`)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black px-8 py-4 rounded-2xl hover:opacity-90 transition text-lg shadow-[0_0_30px_rgba(234,179,8,0.4)]"
              >
                Next Level →
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#21262d] text-gray-400 font-bold px-8 py-3 rounded-2xl hover:text-white hover:bg-[#30363d] transition border border-[#30363d]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
