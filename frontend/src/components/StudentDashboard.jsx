import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { Play, Plus, Server, Settings, AlignLeft, Code, Type, Menu, Camera as CameraIcon, CameraOff, Bold, Italic, Link as LinkIcon, Image as ImageIcon, Quote, ListOrdered, List, Minus, Smile, Table, ArrowUp, ArrowDown, Edit3, Trash2, MoreVertical, Type as TypeIcon, CheckCircle2 } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

const WALLPAPERS = [
  { id: 'default', name: 'Default Dark', value: '#1e1e1e' },
  { id: 'cyberpunk', name: 'Cyberpunk', value: 'linear-gradient(135deg, #120b29 0%, #3a1c71 50%, #d76d77 100%)' },
  { id: 'matrix', name: 'Matrix', value: 'linear-gradient(to bottom, #001100 0%, #003300 100%)' },
  { id: 'hacker', name: 'Hacker Room', value: 'url(https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop)' },
  { id: 'lofi', name: 'Lo-Fi Chill', value: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop)' },
];

const TextAreaCell = ({ initialContent, onChange }) => {
  const [text, setText] = useState(initialContent || '');
  
  const handleChange = (e) => {
    setText(e.target.value);
    onChange(e.target.value);
  };

  return (
    <textarea 
      className="w-full h-24 bg-transparent p-3 text-sm resize-y outline-none text-gray-300 font-sans"
      value={text}
      onChange={handleChange}
      placeholder="Click to edit text..."
    />
  );
};

export default function StudentDashboard({ isArena = false }) {
  const { examId, track, level } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [globalLanguage, setGlobalLanguage] = useState('python');
  const [activeWallpaper, setActiveWallpaper] = useState(WALLPAPERS[0]);
  const [cells, setCells] = useState([
    { id: 1, type: 'code', language: 'python', content: '# Write your code here', output: null, isExecuting: false },
    { id: 2, type: 'code', language: 'python', content: '', output: null, isExecuting: false }
  ]);
  const videoRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastWarningTimeRef = useRef(0);
  const socketRef = useRef(null);

  // Resizable Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(256); // 256px = w-64
  const isDraggingRef = useRef(false);
  const [screenShared, setScreenShared] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const isCameraOnRef = useRef(true); // For closures
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef(null);
  const videoStreamRef = useRef(null);
  const editorsRef = useRef({}); // Store Monaco instances for butter-smooth execution

  // Audio Playback State
  const audioQueue = useRef([]);
  const isPlayingAudio = useRef(false);
  const [teacherSpeaking, setTeacherSpeaking] = useState(false);

  const playNextAudio = useCallback(() => {
    if (audioQueue.current.length === 0) {
      isPlayingAudio.current = false;
      setTeacherSpeaking(false);
      return;
    }
    isPlayingAudio.current = true;
    setTeacherSpeaking(true);
    const audioData = audioQueue.current.shift();
    const audio = new Audio(audioData);
    audio.play().catch(e => {
      console.error("Audio play error (Browser might block auto-play):", e);
      playNextAudio();
    });
    audio.onended = playNextAudio;
  }, []);

  // Initialize Socket.io Connection
  useEffect(() => {
    if (!examId) return;
    socketRef.current = io(`${API_BASE_URL}`);
    socketRef.current.emit('join_exam', { examId, role: 'student', name: 'Student 1' });

    socketRef.current.on('receive_live_question', (newQuestion) => {
      setQuestions(prev => [...prev, { ...newQuestion, isLive: true }]);
      // Use the warning system to notify the student, or just a standard alert
      addWarning(`Teacher published a new question: ${newQuestion.title}`);
    });

    socketRef.current.on('receive_audio', (data) => {
      audioQueue.current.push(data.audioBase64);
      if (!isPlayingAudio.current) {
        playNextAudio();
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [examId]);

  const addWarning = useCallback((msg) => {
    const time = new Date().toLocaleTimeString();
    setWarnings(prev => [...prev, { time, msg }]);
    
    // Broadcast warning to the teacher
    if (socketRef.current) {
      socketRef.current.emit('security_warning', { examId, msg, time });
    }
  }, [examId]);

  // Fetch Exam/Arena Data
  useEffect(() => {
    if (isArena) {
      if (!track || !level) return;
      fetch(`${API_BASE_URL}/api/arena/${track}/${level}`)
        .then(res => res.json())
        .then(data => {
          setExam(data);
          if (data.questions) setQuestions(data.questions);
        })
        .catch(err => console.error("Error fetching arena:", err));
    } else {
      if (!examId) return;
      fetch(`${API_BASE_URL}/api/exams/${examId}`)
        .then(res => res.json())
        .then(data => {
          setExam(data);
          if(data.questions) setQuestions(data.questions);
        })
        .catch(err => console.error("Error fetching exam:", err));
    }
  }, [examId, track, level, isArena]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setGlobalLanguage(newLang);
    setCells(prev => prev.map(c => c.type === 'code' ? { ...c, language: newLang } : c));
  };

  const handleThemeChange = (e) => {
    const val = e.target.value;
    if (val === 'custom') {
      fileInputRef.current?.click();
    } else {
      const selected = WALLPAPERS.find(w => w.id === val);
      if (selected) setActiveWallpaper(selected);
    }
  };

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setActiveWallpaper({ id: 'custom', name: 'Custom Image', value: `url(${imageUrl})` });
      };
      reader.readAsDataURL(file);
    }
    // Reset file input so same file can be selected again if needed
    e.target.value = null;
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      // Turn OFF: Completely kill tracks to turn off laptop light and save privacy
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
        videoStreamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
      }
      setIsCameraOn(false);
      isCameraOnRef.current = false;
    } else {
      // Turn ON: Request camera again
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        videoStreamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        isCameraOnRef.current = true;
      } catch (err) {
        console.error("Camera restart error", err);
        alert("Failed to access camera.");
      }
    }
  };

  const addCodeCell = () => {
    setCells(prev => [...prev, { id: Date.now(), type: 'code', language: globalLanguage, content: '', output: null, isExecuting: false }]);
  };

  const handleSubmitExam = () => {
    if (window.confirm("Are you sure you want to submit the exam?")) {
      const attempted = cells.filter(c => c.content && c.content.trim() !== '' && c.content !== '# Write your code here').length;
      if (socketRef.current) {
        socketRef.current.emit('submit_exam', { examId, attempted, total: questions.length || cells.length });
      }
      setIsSubmitted(true);
      alert("Exam submitted successfully!");
    }
  };

  const addTextCell = () => {
    setCells(prev => [...prev, { id: Date.now(), type: 'text', content: '' }]);
  };

  const moveCellUp = (id) => {
    setCells(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx > 0) {
        const newCells = [...prev];
        [newCells[idx - 1], newCells[idx]] = [newCells[idx], newCells[idx - 1]];
        return newCells;
      }
      return prev;
    });
  };

  const moveCellDown = (id) => {
    setCells(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx < prev.length - 1 && idx !== -1) {
        const newCells = [...prev];
        [newCells[idx + 1], newCells[idx]] = [newCells[idx], newCells[idx + 1]];
        return newCells;
      }
      return prev;
    });
  };

  const deleteCell = (id) => {
    setCells(prev => prev.filter(c => c.id !== id));
  };

  const updateCell = (id, changes) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c));
  };

  const executeCode = async (cellId, language, code) => {
    const cellIndex = cells.findIndex(c => c.id === cellId);
    const question = questions[cellIndex];

    if (!question) {
      updateCell(cellId, { 
        isExecuting: false, 
        output: { 
          output: `[ERROR] Box Mismatch: Box [${cellIndex + 1}] does not correspond to any active question. There are only ${questions.length} question(s) available.`, 
          isError: true, 
          aiFeedback: null 
        } 
      });
      addWarning(`Tried to run code in unmapped Box [${cellIndex + 1}]`);
      return;
    }

    updateCell(cellId, { isExecuting: true, output: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code })
      });
      const data = await res.json();
      
      let isCorrect = !data.isError;
      let outputText = data.output;
      let expectedText = question.expectedOutput ? question.expectedOutput.trim() : null;
      let actualText = data.output ? data.output.trim() : "";
      let verdictMsg = "";

      if (!data.isError && expectedText) {
        if (actualText === expectedText) {
          isCorrect = true;
          verdictMsg = "\n\n✅ Accepted: Output Matches Expected!";
        } else {
          isCorrect = false;
          verdictMsg = `\n\n❌ Wrong Answer.\nExpected:\n${expectedText}\n\nGot:\n${actualText}`;
        }
      }

      const formattedOutput = {
        output: outputText + verdictMsg,
        isError: data.isError,
        isCorrect: isCorrect
      };
      
      updateCell(cellId, { isExecuting: false, output: formattedOutput });
    } catch (err) {
      updateCell(cellId, { isExecuting: false, output: { output: "Network error: Make sure backend is running", isError: true } });
    }
  };

  // No need to fetch warnings here to save performance

  const executeAll = async () => {
    for (const cell of cells) {
      if (cell.type === 'code') {
        const currentCode = editorsRef.current[cell.id] ? editorsRef.current[cell.id].getValue() : cell.content;
        await executeCode(cell.id, cell.language, currentCode);
      }
    }
  };

  const runAll = executeAll;

  // --- Browser Event Monitoring Logic (Anti-cheat) ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) addWarning("Tab switch detected!");
    };

    const handleWindowBlur = () => {
      addWarning("Window lost focus!");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  // --- Sidebar Resize Logic ---
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    let newWidth = e.clientX;
    if (newWidth < 200) newWidth = 200; // Min width
    if (newWidth > 600) newWidth = 600; // Max width
    setSidebarWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenVideo = document.createElement('video');
      screenVideo.srcObject = screenStream;
      screenVideo.muted = true;
      screenVideo.playsInline = true;
      await screenVideo.play();

      const screenCanvas = document.createElement('canvas');
      const screenCtx = screenCanvas.getContext('2d');
      const screenInterval = setInterval(() => {
        if (screenVideo.readyState >= 2 && socketRef.current) {
          screenCanvas.width = 800;
          screenCanvas.height = 600;
          screenCtx.drawImage(screenVideo, 0, 0, screenCanvas.width, screenCanvas.height);
          const screenImage = screenCanvas.toDataURL('image/jpeg', 0.4); // 40% quality
          socketRef.current.emit('screen_frame', { examId, image: screenImage });
        }
      }, 1000); // 1 FPS

      if (videoRef.current) {
        videoRef.current.screenInterval = screenInterval;
      }
      setScreenShared(true);
    } catch (err) {
      console.error("Screen share error:", err);
      alert("You must share your screen to continue!");
    }
  };

  // --- Camera & AI Face Tracking Logic ---
  useEffect(() => {
    let animationFrameId;

    async function setupCameraAndAI() {
      try {
        // 3. Setup Video Stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        videoStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // 2. Load MediaPipe AI
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        faceDetectorRef.current = faceDetector;

        // 3. Start Detection Loop
        const detectFaces = () => {
          const video = videoRef.current;
          if (isCameraOnRef.current && video && video.srcObject && video.readyState >= 2 && faceDetectorRef.current) {
            const startTimeMs = performance.now();
            if (video.currentTime !== lastVideoTimeRef.current) {
              lastVideoTimeRef.current = video.currentTime;
              const detections = faceDetectorRef.current.detectForVideo(video, startTimeMs).detections;
              
              // Warning Logic (Throttle to max 1 warning every 3 seconds)
              if (startTimeMs - lastWarningTimeRef.current > 3000) {
                if (detections.length === 0) {
                  addWarning("AI Alert: Face not detected! Please face the screen.");
                  lastWarningTimeRef.current = startTimeMs;
                } else if (detections.length > 1) {
                  addWarning("AI Alert: Multiple faces detected! No cheating allowed.");
                  lastWarningTimeRef.current = startTimeMs;
                }
              }
            }
          }
          animationFrameId = requestAnimationFrame(detectFaces);
        };
        
        detectFaces();

        // 4. Start Streaming Video Frames to Teacher
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const streamInterval = setInterval(() => {
          if (isCameraOnRef.current && videoRef.current && videoRef.current.srcObject && videoRef.current.readyState >= 2 && socketRef.current) {
            canvas.width = 320;
            canvas.height = 240;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const image = canvas.toDataURL('image/jpeg', 0.5); // 50% quality JPEG
            socketRef.current.emit('video_frame', { examId, image });
          }
        }, 1000); // 1 FPS

        // Attach interval ID to a ref to clear it on unmount
        videoRef.current.streamInterval = streamInterval;

      } catch (err) {
        console.error("Camera or AI init error:", err);
      }
    }
    
    setupCameraAndAI();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (faceDetectorRef.current) faceDetectorRef.current.close();
      if (videoRef.current) {
        if (videoRef.current.streamInterval) clearInterval(videoRef.current.streamInterval);
        if (videoRef.current.screenInterval) clearInterval(videoRef.current.screenInterval);
      }
    };
  }, [addWarning, examId]);

  return (
    <div 
      className="flex flex-col h-screen text-[#cccccc] font-sans bg-cover bg-center transition-all duration-500"
      style={{ background: activeWallpaper.value }}
    >
      
      {/* Top Navbar (Colab Style) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#333333]/50 bg-[#2d2d2d]/80 backdrop-blur-md text-sm z-50">
        <div className="flex items-center space-x-4">
          {isArena && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition mr-2"
              title="Back to Dashboard"
            >
              ← Back
            </button>
          )}
          <AnimatedLogo />
          <div className="h-4 w-px bg-[#444] mx-1"></div>
          <button onClick={addCodeCell} className="hover:text-white flex items-center gap-1"><Code size={16} /> + Code</button>
          <button onClick={addTextCell} className="hover:text-white flex items-center gap-1"><Type size={16} /> + Text</button>
          <button onClick={runAll} className="hover:text-white flex items-center gap-1"><Play size={16} /> Run all</button>
          <div className="h-4 w-px bg-[#444] mx-2"></div>
          <select 
            className="bg-[#333] border border-[#444] text-gray-300 text-xs rounded px-2 py-1 outline-none hover:border-blue-500 cursor-pointer font-bold"
            value={globalLanguage}
            onChange={handleLanguageChange}
          >
            <option value="python">Python 3</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <div className="h-4 w-px bg-[#444] mx-2"></div>
        </div>

        {/* Warning Ticker in the Middle */}
        {warnings.length > 0 && (
          <div className="flex-1 flex justify-center items-center px-4">
            <div className="bg-red-900/40 border border-red-500/50 text-red-400 px-4 py-1 rounded-full flex items-center gap-2 max-w-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-bold text-xs">({warnings.length}) Alerts:</span>
              <span className="text-xs truncate">{warnings[warnings.length - 1].msg}</span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 ml-auto">
          {isSubmitted ? (
            <span className="text-green-400 font-bold bg-green-900/40 border border-green-500/50 px-3 py-1 rounded-full text-xs flex items-center gap-2">
              <CheckCircle2 size={14} /> Submitted
            </span>
          ) : (
            <button 
              onClick={handleSubmitExam}
              className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-1.5 rounded text-xs transition shadow-lg shadow-green-500/20 flex items-center gap-1"
            >
              Submit Exam
            </button>
          )}
          <button className="hover:text-white flex items-center gap-1 ml-2">Connect <Server size={14} /></button>
          <Settings onClick={() => setIsSettingsOpen(true)} size={16} className="cursor-pointer hover:text-white" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar (Resizable) */}
        <div 
          style={{ width: sidebarWidth }}
          className="flex-shrink-0 flex flex-col bg-[#252526]/80 backdrop-blur-lg relative border-r border-[#333]/50"
        >
          
          {/* Table of Contents / Problems */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><AlignLeft size={16}/> {exam ? exam.title : "Loading..."}</h3>
            </div>
            <ul className="space-y-3 text-[#cccccc]">
              {questions.length === 0 && <li className="text-gray-500 text-sm">No questions available.</li>}
              {questions.map((q, idx) => (
                <li 
                  key={q.id} 
                  className="cursor-pointer group relative p-3 rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:-translate-y-1 border-t border-l border-white/10 border-b-2 border-r-2 border-black/60 bg-gradient-to-br from-[#2d2d2d]/90 to-[#1a1a1a]/90"
                >
                  <span className="font-medium text-white flex items-center gap-2 mb-2">
                    <span className="bg-gradient-to-br from-[#444] to-[#222] border border-white/10 text-xs px-2 py-0.5 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.5)]">{idx + 1}</span> 
                    {q.title}
                    {q.isLive && (
                      <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse tracking-wide shadow-[0_0_10px_rgba(220,38,38,0.6)] ml-auto">
                        LIVE
                      </span>
                    )}
                  </span>
                  <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed bg-black/40 p-2.5 rounded-lg border border-black/50 shadow-inner">
                    {q.content}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Camera Feed Widget (Bottom of sidebar) */}
          <div className="h-48 border-t border-[#333333] p-2 flex flex-col items-center justify-center bg-[#1a1a1a] relative flex-shrink-0 overflow-hidden">
            <div className="w-56 h-40 relative rounded-md overflow-hidden flex-shrink-0 group">
              <span className="absolute top-2 left-2 text-[10px] text-gray-300 z-10 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-full border border-white/10">
                <CameraIcon size={12}/> Live Proctoring
              </span>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover rounded-md border border-red-900 shadow-[0_0_15px_rgba(255,0,0,0.4)] bg-black transition-opacity ${!isCameraOn ? 'opacity-0' : 'opacity-100'}`}
              ></video>

              {/* Camera OFF Indicator */}
              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-black/80 rounded-md z-10">
                  <CameraOff size={28} className="mb-2" />
                  <span className="text-[10px] font-bold tracking-widest">CAMERA OFF</span>
                </div>
              )}

              {/* Overlay Toggle Button (visible on hover) */}
              <button 
                onClick={toggleCamera}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black p-1.5 rounded-full text-white backdrop-blur transition shadow opacity-0 group-hover:opacity-100 z-20"
                title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isCameraOn ? <CameraIcon size={14} /> : <CameraOff size={14} className="text-red-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Drag Handle for Resizing */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-1 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 bg-[#333333]/50 transition-colors z-20 flex-shrink-0"
        />

        {/* Main Content Area (Code Cells) */}
        <div className="flex-1 overflow-y-auto bg-black/20 p-6 custom-scrollbar">
          
          {/* Teacher Speaking Indicator */}
          {teacherSpeaking && (
            <div className="mb-6 p-3 bg-blue-900/40 border border-blue-500/50 rounded-md text-blue-200 flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <span className="text-xl">🔊</span>
              <p className="font-bold tracking-wider">Teacher is speaking to you...</p>
            </div>
          )}

          {/* Colab Style Cells */}
          <div className="space-y-4 max-w-4xl mx-auto pb-20">
            {cells.map((cell, idx) => (
              <div key={cell.id} className="flex group">
                <div className="w-12 flex flex-col items-center pt-2">
                  {cell.type === 'code' && <span className="text-xs text-gray-500 mb-1">[{idx + 1}]</span>}
                  {cell.type === 'code' && (
                    <button 
                      onClick={() => {
                        const currentCode = editorsRef.current[cell.id] ? editorsRef.current[cell.id].getValue() : cell.content;
                        executeCode(cell.id, cell.language, currentCode);
                      }}
                      disabled={cell.isExecuting}
                      className="mt-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#444] to-[#222] hover:from-blue-500 hover:to-blue-700 flex items-center justify-center text-white transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.5)] hover:-translate-y-1 border-t border-l border-white/20 border-b border-r border-black/80 flex-shrink-0"
                      title="Run Cell"
                    >
                      {cell.isExecuting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </button>
                  )}
                </div>
                <div className={`flex-1 rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300 relative group shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1 border-t border-l border-white/10 border-b-2 border-r-2 border-black/60 bg-gradient-to-br from-[#2d2d2d]/95 to-[#1a1a1a]/95 focus-within:border-blue-500/50 ${cell.type === 'text' ? 'border-blue-500/30' : ''}`}>
                  
                  {/* Floating Action Bar (Top Right) */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                    <button onClick={() => moveCellUp(cell.id)} className="p-1 hover:text-white transition rounded-full hover:bg-white/10" title="Move Up"><ArrowUp size={14}/></button>
                    <button onClick={() => moveCellDown(cell.id)} className="p-1 hover:text-white transition rounded-full hover:bg-white/10" title="Move Down"><ArrowDown size={14}/></button>
                    <div className="w-px h-3 bg-white/20 mx-1"></div>
                    <button onClick={() => deleteCell(cell.id)} className="p-1 text-red-400 hover:text-red-300 transition rounded-full hover:bg-red-500/20" title="Delete Cell"><Trash2 size={14}/></button>
                  </div>

                  {cell.type === 'code' ? (
                    <>
                      {/* Monaco Editor Wrapper (Captures paste events) */}
                      <div 
                        onPasteCapture={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addWarning("Clipboard Alert: Pasting code is strictly prohibited!");
                        }}
                        className="w-full min-h-[150px] border-b border-[#222]"
                      >
                        <Editor
                          height="200px"
                          language={cell.language || 'python'}
                          theme="vs-dark"
                          defaultValue={cell.content}
                          onMount={(editor) => { editorsRef.current[cell.id] = editor; }}
                          onChange={(value) => {
                            // Debounce the state update to keep typing VS-Code smooth
                            if (window[`timer_${cell.id}`]) clearTimeout(window[`timer_${cell.id}`]);
                            window[`timer_${cell.id}`] = setTimeout(() => {
                              updateCell(cell.id, { content: value });
                            }, 1000);
                          }}
                          options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            fontFamily: 'monospace',
                            autoClosingBrackets: 'always',
                            suggestOnTriggerCharacters: true,
                            quickSuggestions: true,
                            snippetSuggestions: 'inline',
                            formatOnType: true,
                            wordWrap: 'on',
                            padding: { top: 10, bottom: 10 }
                          }}
                        />
                      </div>

                      {/* Output Display */}
                      {cell.output && (
                        <div className="w-full min-h-[40px] border-t border-[#333] flex flex-col">
                          {/* Standard Output */}
                          <div className={`p-3 text-sm font-mono whitespace-pre-wrap ${cell.output.isError ? 'text-red-400 bg-red-950/20' : 'text-green-400 bg-black/30'}`}>
                            <span className="text-gray-500 font-bold mb-1 block">Console Output:</span>
                            {cell.output.output || "Program finished with no output."}
                          </div>

                          {/* AI Evaluation Result */}
                          {cell.output.aiFeedback && (
                            <div className={`p-4 text-sm font-sans border-t-2 ${cell.output.aiFeedback.isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-black tracking-wider text-base">
                                  {cell.output.aiFeedback.isCorrect ? '✅ AI GRADER: PASSED' : '❌ AI GRADER: FAILED'}
                                </span>
                              </div>
                              <p className="text-gray-300 font-medium leading-relaxed">{cell.output.aiFeedback.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Markdown Toolbar */}
                      <div className="bg-[#2d2d2d]/80 flex items-center gap-3 px-3 py-1.5 border-b border-[#333333]/50 text-gray-400 text-sm">
                        <button className="hover:text-white transition"><TypeIcon size={14}/></button>
                        <button className="hover:text-white transition font-bold font-serif text-base">B</button>
                        <button className="hover:text-white transition italic font-serif text-base">I</button>
                        <button className="hover:text-white transition"><Code size={14}/></button>
                        <button className="hover:text-white transition"><LinkIcon size={14}/></button>
                        <button className="hover:text-white transition"><ImageIcon size={14}/></button>
                        <button className="hover:text-white transition"><Quote size={14}/></button>
                        <button className="hover:text-white transition"><ListOrdered size={14}/></button>
                        <button className="hover:text-white transition"><List size={14}/></button>
                        <button className="hover:text-white transition"><Minus size={14}/></button>
                        <button className="hover:text-white transition font-serif text-base">ψ</button>
                        <button className="hover:text-white transition"><Smile size={14}/></button>
                        <button className="hover:text-white transition"><Table size={14}/></button>
                        <span className="text-blue-400 cursor-pointer hover:text-blue-300 ml-2 text-xs">Close</span>
                      </div>
                      <TextAreaCell 
                        initialContent={cell.content}
                        onChange={(newVal) => updateCell(cell.id, { content: newVal })}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl p-6 w-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20}/> Settings</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Workspace Theme</label>
                <select 
                  className="w-full bg-[#2d2d2d] border border-[#444] text-gray-300 text-sm rounded px-3 py-2 outline-none hover:border-blue-500 cursor-pointer"
                  value={activeWallpaper.id === 'custom' ? 'custom' : activeWallpaper.id}
                  onChange={handleThemeChange}
                >
                  <option disabled value="">🎨 Choose a theme...</option>
                  {WALLPAPERS.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                  <option value="custom">🖼️ Custom Image...</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-2">Customize the look and feel of your coding environment.</p>
              </div>

              {/* Exam Security Settings */}
              <div className="border-t border-[#333] pt-4">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Exam Security</label>
                <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-[#444]">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Screen Sharing</h4>
                    <p className="text-[10px] text-gray-500">Required for exam proctoring.</p>
                  </div>
                  {!screenShared ? (
                    <button 
                      onClick={() => { startScreenShare(); setIsSettingsOpen(false); }} 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs rounded-md font-bold shadow-[0_0_10px_rgba(37,99,235,0.4)] transition"
                    >
                      Share Screen
                    </button>
                  ) : (
                    <span className="text-green-400 font-bold text-xs bg-green-900/30 border border-green-500/50 px-3 py-2 rounded-md flex items-center gap-1">
                      ✅ Shared
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-bold text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Image Upload Hidden Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCustomImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
