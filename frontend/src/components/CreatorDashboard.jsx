import { API_BASE_URL } from '../apiConfig';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Clock, Calendar, FileText, CheckCircle, AlertCircle, Play, Eye } from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';

export default function CreatorDashboard() {
  const [examDetails, setExamDetails] = useState({
    title: '',
    description: '',
    date: '',
    durationMinutes: 60,
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const [questions, setQuestions] = useState([
    { id: 1, title: 'Two Sum', content: 'Given an array of integers nums and an integer target...', expectedOutput: '' }
  ]);

  const [isPublishing, setIsPublishing] = useState(false);
  const navigate = useNavigate();

  const showToastMsg = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), title: '', content: '', expectedOutput: '' }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };



  const saveExam = async (status) => {
    if (isPublishing) return;

    const trimmedTitle = examDetails.title?.trim() || '';

    if (!trimmedTitle) {
      showToastMsg("Please enter an Exam Title first!");
      return;
    }

    if (status === 'scheduled' && !examDetails.date) {
      showToastMsg("Please select a date and time for the scheduled exam!");
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: examDetails.description?.trim(),
          durationMinutes: examDetails.durationMinutes,
          status: status,
          scheduledFor: status === 'scheduled' ? examDetails.date : null,
          questions: questions
        })
      });
      
      const data = await response.json();
      if(response.ok) {
        showToastMsg(`Exam ${status === 'live' ? 'published' : 'saved'} successfully!`, "success");
        if (status === 'live') {
          setTimeout(() => navigate(`/monitor/${data.examId}`), 1000);
        } else {
          setTimeout(() => navigate(`/dashboard`), 1000);
        }
      } else {
        showToastMsg("Failed to save exam");
        setIsPublishing(false);
      }
    } catch (err) {
      console.error(err);
      showToastMsg("Error connecting to server. Make sure Backend is running!");
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-4 md:p-8 font-sans relative overflow-x-hidden">
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-300 animate-[bounce_0.5s_ease-out] ${toast.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10 pb-20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <AnimatedLogo />
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4 border-b border-[#222] pb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 flex items-center gap-3 tracking-wide">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/30 shadow-[inset_0_0_15px_rgba(37,99,235,0.2)]">
              <FileText className="text-blue-500" size={28} />
            </div>
            Create New Exam
          </h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => saveExam('draft')}
              disabled={isPublishing}
              className="bg-[#222] hover:bg-[#333] text-gray-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all border border-[#444]"
            >
              <Save size={18} /> Save Draft
            </button>
            <button 
              onClick={() => saveExam('scheduled')}
              disabled={isPublishing}
              className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all border border-purple-500/30"
            >
              <Calendar size={18} /> Schedule
            </button>
            <button 
              onClick={() => saveExam('live')}
              disabled={isPublishing}
              className={`${isPublishing ? 'bg-blue-800 cursor-wait opacity-70' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_5px_20px_rgba(37,99,235,0.4)]'} text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all border-t border-white/20`}
            >
              <Play size={18} className={isPublishing ? 'animate-spin' : ''} /> {isPublishing ? 'Processing...' : 'Go Live Now'}
            </button>
          </div>
        </div>

        {/* 1. Exam Details Section */}
        <div className="bg-[#111]/80 backdrop-blur-xl border-t border-l border-white/5 border-b-2 border-r-2 border-black/80 rounded-[2rem] p-6 md:p-10 mb-10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group hover:border-blue-500/20 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          
          <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-2">
            <span className="text-blue-500 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">01</span>
            Exam Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2 tracking-wide uppercase">Exam Title <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={examDetails.title}
                onChange={e => setExamDetails({...examDetails, title: e.target.value})}
                placeholder="e.g. Data Structures Midterm" 
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(37,99,235,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium text-lg placeholder-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2 tracking-wide uppercase">Instructions / Description</label>
              <textarea 
                value={examDetails.description}
                onChange={e => setExamDetails({...examDetails, description: e.target.value})}
                placeholder="Rules and instructions for the students..." 
                className="w-full h-32 bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(37,99,235,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all resize-y placeholder-gray-700 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-purple-400" size={16} />
                  <label className="block text-sm font-semibold text-gray-400 tracking-wide uppercase">Scheduled Date & Time (Optional)</label>
                </div>
                <input 
                  type="datetime-local" 
                  value={examDetails.date}
                  onChange={e => setExamDetails({...examDetails, date: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all font-medium text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2 tracking-wide uppercase flex items-center gap-2"><Clock size={16} className="text-blue-500"/> Duration (Minutes)</label>
                <input 
                  type="number" 
                  value={examDetails.durationMinutes}
                  onChange={e => setExamDetails({...examDetails, durationMinutes: parseInt(e.target.value) || 60})}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(37,99,235,0.2)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] transition-all text-xl font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Questions Section */}
        <div className="bg-[#111]/80 backdrop-blur-xl border-t border-l border-white/5 border-b-2 border-r-2 border-black/80 rounded-[2rem] p-6 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group hover:border-purple-500/20 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-500 font-mono text-sm bg-purple-500/10 px-2 py-1 rounded">02</span>
              Add Coding Problems
            </h2>
            <button 
              onClick={addQuestion}
              className="bg-[#222] hover:bg-[#2a2a2a] border border-[#444] hover:border-purple-500/50 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:-translate-y-0.5"
            >
              <Plus size={18} className="text-purple-400" /> Add Question
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((q, index) => (
              <div key={q.id} className="relative bg-[#0d0d0d] border border-[#222] rounded-2xl p-6 md:p-8 shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] group/card hover:border-[#444] transition-colors">
                
                {/* Delete Button */}
                <button 
                  onClick={() => removeQuestion(q.id)}
                  className="absolute -top-3 -right-3 bg-[#1a1a1a] border border-[#333] hover:border-red-500 text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-all opacity-0 group-hover/card:opacity-100 hover:scale-110 shadow-lg"
                  title="Remove Question"
                >
                  <Trash2 size={16} />
                </button>
                
                <h3 className="font-bold text-gray-400 mb-4 flex items-center gap-2 tracking-wide uppercase text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#222] text-xs flex items-center justify-center text-white border border-[#444]">{index + 1}</span>
                  Problem Setup
                </h3>
                
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={q.title}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[index].title = e.target.value;
                      setQuestions(newQ);
                    }}
                    placeholder="Problem Title (e.g. Reverse a String)" 
                    className="w-full bg-[#151515] border border-[#333] rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all font-semibold text-lg placeholder-gray-700"
                  />
                  <textarea 
                    value={q.content}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[index].content = e.target.value;
                      setQuestions(newQ);
                    }}
                    placeholder="Problem description, constraints, and examples..." 
                    className="w-full h-32 bg-[#151515] border border-[#333] rounded-xl p-4 text-gray-300 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all resize-y font-mono text-sm leading-relaxed placeholder-gray-700 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
                  />
                  <textarea 
                    value={q.expectedOutput || ''}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[index].expectedOutput = e.target.value;
                      setQuestions(newQ);
                    }}
                    placeholder="Expected Output (e.g. [0, 1])" 
                    className="w-full h-24 bg-[#151515] border border-[#333] rounded-xl p-4 text-green-400 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all resize-y font-mono text-sm leading-relaxed placeholder-gray-700 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
