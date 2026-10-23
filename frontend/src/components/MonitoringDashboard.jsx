import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ShieldAlert, Users, ArrowLeft, VideoOff, Terminal } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

export default function MonitoringDashboard() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  // State: object mapping socketId to student data
  const [students, setStudents] = useState({});
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [fullScreenStudentId, setFullScreenStudentId] = useState(null);
  
  // Audio Streaming State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTarget, setRecordingTarget] = useState(null); // 'all' or socketId
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (!examId) return;
    
    // Connect to Socket
    socketRef.current = io(`${API_BASE_URL}`);
    socketRef.current.emit('join_exam', { examId, role: 'teacher', name: 'Admin Teacher' });

    // Listeners
    socketRef.current.on('student_joined', ({ socketId, name }) => {
      setStudents(prev => ({
        ...prev,
        [socketId]: { name, image: null, warnings: [], online: true }
      }));
    });

    socketRef.current.on('student_left', ({ socketId }) => {
      setStudents(prev => {
        if (!prev[socketId]) return prev;
        return {
          ...prev,
          [socketId]: { ...prev[socketId], online: false }
        };
      });
    });

    socketRef.current.on('receive_video_frame', ({ socketId, name, image }) => {
      setStudents(prev => {
        const student = prev[socketId] || { name, warnings: [], online: true };
        return {
          ...prev,
          [socketId]: { ...student, image, online: true }
        };
      });
    });

    socketRef.current.on('new_warning', ({ socketId, name, msg, time }) => {
      setStudents(prev => {
        const student = prev[socketId] || { name, image: null, screenImage: null, warnings: [], online: true };
        return {
          ...prev,
          [socketId]: { ...student, warnings: [{ time, msg }, ...student.warnings] }
        };
      });
    });

    socketRef.current.on('student_submitted', ({ socketId, attempted, total }) => {
      setStudents(prev => {
        const student = prev[socketId] || { name: 'Unknown', warnings: [], online: true };
        return {
          ...prev,
          [socketId]: { ...student, hasSubmitted: true, attempted, total }
        };
      });
    });

    socketRef.current.on('receive_screen_frame', ({ socketId, name, screenImage }) => {
      setStudents(prev => {
        const student = prev[socketId] || { name, image: null, screenImage: null, warnings: [], online: true };
        return {
          ...prev,
          [socketId]: { ...student, screenImage, online: true }
        };
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [examId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`http://localhost:5173/exam/${examId}`);
    alert("Student link copied to clipboard!");
  };

  const handlePushQuestion = () => {
    if (!newQuestion.title || !newQuestion.content) {
      alert("Please fill in both title and content!");
      return;
    }
    if (socketRef.current) {
      socketRef.current.emit('add_live_question', {
        examId,
        title: newQuestion.title,
        content: newQuestion.content
      });
      alert("Question pushed to all active students!");
      setNewQuestion({ title: '', content: '' });
      setShowQuestionPanel(false);
    }
  };

  // --- Audio Streaming Logic (Push-to-Talk) ---
  const startRecording = async (target) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      setRecordingTarget(target);
      setIsRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socketRef.current) {
          const reader = new FileReader();
          reader.readAsDataURL(e.data);
          reader.onloadend = () => {
            socketRef.current.emit('teacher_audio', {
              examId,
              targetSocketId: target,
              audioBase64: reader.result
            });
          };
        }
      };
      
      // Start recording, emitting chunks every 500ms
      mediaRecorder.start(500);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingTarget(null);
  };

  const activeCount = Object.values(students).filter(s => s.online).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-mono text-gray-300">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#111]">
        <div className="flex items-center gap-4">
          <AnimatedLogo />
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-[#222] rounded-md transition text-gray-400 hover:text-white ml-4">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Live Proctoring: Exam {examId}
            </h1>
            <p className="text-xs text-gray-500 mt-1">Real-time AI monitoring & video feeds</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onMouseDown={() => startRecording('all')}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className={`px-4 py-1.5 rounded-full font-bold text-sm transition shadow-[0_0_10px_rgba(37,99,235,0.4)] flex items-center gap-2 ${isRecording && recordingTarget === 'all' ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-900/50 hover:bg-blue-800 border border-blue-600 text-white'}`}
          >
            📢 {isRecording && recordingTarget === 'all' ? 'Speaking to All...' : 'Announce to All'}
          </button>

          <button 
            onClick={() => setShowQuestionPanel(!showQuestionPanel)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-full text-white font-bold text-sm transition shadow-[0_0_10px_rgba(37,99,235,0.4)]"
          >
            + Push Live Question
          </button>
          
          <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333] px-3 py-1.5 rounded-md">
            <span className="text-xs text-gray-500">Student Link:</span>
            <input type="text" readOnly value={`http://localhost:5173/exam/${examId}`} className="bg-transparent w-48 outline-none text-blue-400 font-mono text-[10px]" />
            <button onClick={copyToClipboard} className="bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-[10px] text-white transition">Copy</button>
          </div>
          <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-900/50 px-4 py-1.5 rounded-full text-blue-400">
            <Users size={16} />
            <span className="font-bold text-sm">{activeCount} Connected</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="p-6">
        {Object.keys(students).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
            <VideoOff size={48} className="mb-4 opacity-50" />
            <p className="text-lg">Waiting for students to join...</p>
            <p className="text-sm mt-2 text-gray-700">Student link: http://localhost:5173/exam/{examId}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(students).map(([id, student]) => (
              <div key={id} className={`bg-[#111] border rounded-lg overflow-hidden flex flex-col ${student.warnings.length > 0 ? 'border-red-500/50 shadow-[0_0_15px_rgba(255,0,0,0.1)]' : 'border-[#333]'}`}>
                
                {/* Video Feed */}
                <div className="h-48 bg-black relative">
                  {student.image ? (
                    <img src={student.image} alt={student.name} className={`w-full h-full object-cover ${!student.online ? 'opacity-30 grayscale' : ''}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      No Camera Feed
                    </div>
                  )}
                  
                  {/* Overlay Status */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${student.online ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-gray-900/50 border-gray-500 text-gray-400'}`}>
                        {student.online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                      {student.warnings.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-red-900/80 border-red-500 text-white flex items-center gap-1">
                          <ShieldAlert size={10} /> {student.warnings.length}
                        </span>
                      )}
                    </div>
                    {student.hasSubmitted && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-900/80 border-blue-500 text-blue-300 flex items-center w-max">
                        ✅ Submitted ({student.attempted}/{student.total})
                      </span>
                    )}
                  </div>
                  {/* Audio Controls Overlay */}
                  <div className="absolute bottom-2 right-2 z-10">
                    <button
                      onMouseDown={() => startRecording(id)}
                      onMouseUp={stopRecording}
                      onMouseLeave={stopRecording}
                      className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${isRecording && recordingTarget === id ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.8)]' : 'bg-black/80 hover:bg-gray-800 text-gray-300 border border-gray-600'}`}
                    >
                      🎙️ {isRecording && recordingTarget === id ? 'Speaking...' : 'Speak'}
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-sm border border-white/10">
                    {student.name}
                  </div>
                </div>

                {/* Screen Feed (Replaces Security Log) */}
                <div 
                  className="flex-1 border-t border-[#222] bg-black cursor-pointer hover:opacity-90 transition relative overflow-hidden"
                  onClick={() => setFullScreenStudentId(id)}
                >
                  {student.screenImage ? (
                    <img src={student.screenImage} alt="Screen Feed" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-700">
                      Waiting for screen...
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2 opacity-0 hover:opacity-100 transition">
                    <span className="text-white text-xs font-bold flex items-center gap-1">🔍 Tap to expand screen</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Live Question Panel (Floating) */}
      {showQuestionPanel && (
        <div className="fixed bottom-6 right-6 w-96 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="bg-[#2d2d2d] px-4 py-3 border-b border-[#333] flex justify-between items-center">
            <h3 className="font-bold text-white">Push Surprise Question</h3>
            <button onClick={() => setShowQuestionPanel(false)} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Question Title</label>
              <input 
                type="text" 
                value={newQuestion.title}
                onChange={e => setNewQuestion({...newQuestion, title: e.target.value})}
                className="w-full bg-[#111] border border-[#333] rounded p-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                placeholder="e.g., Bonus: Fibonacci Sequence"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea 
                value={newQuestion.content}
                onChange={e => setNewQuestion({...newQuestion, content: e.target.value})}
                className="w-full h-24 bg-[#111] border border-[#333] rounded p-2 text-white focus:outline-none focus:border-blue-500 text-sm resize-none font-mono"
                placeholder="Write a function to generate..."
              />
            </div>
            <button 
              onClick={handlePushQuestion}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-md transition"
            >
              🚀 Send to all students
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Student Modal */}
      {fullScreenStudentId && students[fullScreenStudentId] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-between items-center p-4 border-b border-[#222]">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              Live Monitoring: {students[fullScreenStudentId].name}
            </h2>
            <button 
              onClick={() => setFullScreenStudentId(null)}
              className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded font-bold transition"
            >
              Close
            </button>
          </div>
          
          <div className="flex flex-1 overflow-hidden p-4 gap-4">
            {/* Main Screen Area */}
            <div className="flex-1 border border-[#333] rounded-lg bg-[#111] relative overflow-hidden flex flex-col">
              <div className="px-4 py-2 bg-[#222] border-b border-[#333] text-xs text-gray-400 font-bold uppercase tracking-wider">
                Student Screen
              </div>
              <div className="flex-1 relative bg-black">
                {students[fullScreenStudentId].screenImage ? (
                  <img src={students[fullScreenStudentId].screenImage} alt="Screen" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">No screen feed</div>
                )}
              </div>
            </div>

            {/* Right Sidebar (Camera & Tools) */}
            <div className="w-80 flex flex-col gap-4">
              <div className="border border-[#333] rounded-lg bg-[#111] overflow-hidden">
                <div className="px-4 py-2 bg-[#222] border-b border-[#333] text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Camera Feed
                </div>
                <div className="aspect-[4/3] bg-black">
                  {students[fullScreenStudentId].image ? (
                    <img src={students[fullScreenStudentId].image} alt="Camera" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">No camera feed</div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col gap-4">
                {/* Copy Paste Counter */}
                <div className="border border-red-900/50 rounded-lg bg-[#1a0505] p-4 flex items-center justify-between shadow-[0_0_15px_rgba(255,0,0,0.1)]">
                   <div className="text-sm font-bold text-red-400 uppercase tracking-wider">Copy-Paste Attempts</div>
                   <div className="text-3xl font-black text-red-500">
                     {students[fullScreenStudentId].warnings.filter(w => w.msg.toLowerCase().includes('paste') || w.msg.toLowerCase().includes('clipboard')).length}
                   </div>
                </div>

                {/* Face & Tab Alerts Log */}
                <div className="flex-1 border border-[#333] rounded-lg bg-[#111] overflow-hidden flex flex-col">
                  <div className="px-4 py-2 bg-[#222] border-b border-[#333] text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Face & Tab Alerts
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    {(() => {
                      const faceWarnings = students[fullScreenStudentId].warnings.filter(w => !w.msg.toLowerCase().includes('paste') && !w.msg.toLowerCase().includes('clipboard'));
                      return faceWarnings.length === 0 ? (
                        <p className="text-xs text-green-500">No suspicious activity.</p>
                      ) : (
                        <ul className="space-y-2">
                          {faceWarnings.map((w, idx) => (
                            <li key={idx} className="text-[11px] bg-red-950/30 border border-red-900/50 p-2 rounded text-red-300">
                              <span className="font-bold text-red-500 block mb-0.5">{w.time}</span>
                              {w.msg}
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
