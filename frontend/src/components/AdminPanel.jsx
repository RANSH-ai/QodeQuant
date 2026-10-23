import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, X, Trash2, ShieldAlert, Edit2, Video, Save, PlayCircle } from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();

  // Arena Questions State
  const [arenaQuestions, setArenaQuestions] = useState([]);
  const [arenaTrack, setArenaTrack] = useState('beginner');
  const [arenaLevel, setArenaLevel] = useState(1);
  const [arenaLoading, setArenaLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQId, setEditingQId] = useState(null);
  const [newQ, setNewQ] = useState({ title: '', content: '', difficulty: 'easy', expectedOutput: '', professorName: '', institution: '' });
  const [addingQ, setAddingQ] = useState(false);

  // Admin Dashboard Tabs
  const [activeTab, setActiveTab] = useState('arena'); // 'arena', 'courses'

  // Course Manager State
  const [courseId, setCourseId] = useState('medical');
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', videoUrl: '', summary: '', duration: '', locked: false });
  const [isSavingTopic, setIsSavingTopic] = useState(false);

  useEffect(() => {
    fetchArenaQuestions();
  }, [arenaTrack, arenaLevel]);

  const fetchArenaQuestions = async () => {
    setArenaLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/arena-questions?track=${arenaTrack}&level=${arenaLevel}`);
      if (res.ok) setArenaQuestions(await res.json());
    } catch (err) { console.error(err); }
    setArenaLoading(false);
  };

  const handleDeleteArenaQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/arena-questions/${id}`, { method: 'DELETE' });
      fetchArenaQuestions();
    } catch (err) { console.error(err); }
  };

  const handleSaveArenaQuestion = async () => {
    if (!newQ.title.trim() || !newQ.content.trim()) return alert('Title and content are required!');
    setAddingQ(true);
    try {
      const url = editingQId 
        ? `${API_BASE_URL}/api/admin/arena-questions/${editingQId}`
        : `${API_BASE_URL}/api/admin/arena-questions`;
      const method = editingQId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: arenaTrack, level: arenaLevel, ...newQ })
      });
      if (res.ok) {
        setNewQ({ title: '', content: '', difficulty: 'easy', expectedOutput: '', professorName: '', institution: '' });
        setShowAddForm(false);
        setEditingQId(null);
        fetchArenaQuestions();
      }
    } catch (err) { console.error(err); }
    setAddingQ(false);
  };

  const handleSaveTopic = async () => {
    if (!newTopic.title.trim()) return alert('Topic Title is required!');
    setIsSavingTopic(true);
    
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('title', newTopic.title);
    formData.append('duration', newTopic.duration);
    formData.append('summary', newTopic.summary);
    formData.append('locked', newTopic.locked);
    if (newTopic.videoFile) {
      formData.append('videoFile', newTopic.videoFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/topics`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setShowAddCourseForm(false);
        setNewTopic({ title: '', videoFile: null, summary: '', duration: '', locked: false });
        alert('Topic saved successfully!');
      } else {
        alert('Failed to save topic');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving topic');
    }
    setIsSavingTopic(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-x-hidden p-6 md:p-12">
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-xl transition text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-2">
                Questions Admin Panel <ShieldAlert size={24} className="text-orange-500" />
              </h1>
              <p className="text-sm text-gray-500 mt-1">Add and manage platform questions with professor credits.</p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
             onClick={() => setActiveTab('arena')}
             className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'arena' ? 'bg-orange-600 text-white shadow-[0_5px_20px_rgba(234,88,12,0.4)]' : 'bg-[#111] text-gray-400 hover:bg-[#222]'}`}
          >
             ⚔️ Arena Questions
          </button>
          <button 
             onClick={() => setActiveTab('courses')}
             className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'courses' ? 'bg-blue-600 text-white shadow-[0_5px_20px_rgba(37,99,235,0.4)]' : 'bg-[#111] text-gray-400 hover:bg-[#222]'}`}
          >
             📚 Course Curriculum
          </button>
        </div>

        {/* Arena Questions Manager */}
        {activeTab === 'arena' && (
        <div className="bg-[#111]/80 backdrop-blur-xl border border-orange-500/20 rounded-[2rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] mb-10 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[#222] pb-6">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-3xl">⚔️</span> Arena Question Manager
              </h3>
              <p className="text-gray-400 text-sm mt-1">Add, edit, or remove coding questions for each Arena level.</p>
            </div>
            <button
              onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false);
                  setEditingQId(null);
                  setNewQ({ title: '', content: '', difficulty: 'easy', expectedOutput: '', professorName: '', institution: '' });
                } else {
                  setShowAddForm(true);
                }
              }}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-black px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition"
            >
              {showAddForm ? <X size={18}/> : <Plus size={18}/>} {showAddForm ? 'Cancel' : 'Add Question'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Track</label>
              <select
                value={arenaTrack}
                onChange={e => setArenaTrack(e.target.value)}
                className="bg-[#0a0f1c] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition font-bold"
              >
                <option value="beginner">🟠 Beginner (Bronze)</option>
                <option value="intermediate">⚪ Intermediate (Silver)</option>
                <option value="advanced">🟡 Advanced (Gold)</option>
                <option value="ransh">🔴 RANSH (Ultimate)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Level</label>
              <select
                value={arenaLevel}
                onChange={e => setArenaLevel(parseInt(e.target.value))}
                className="bg-[#0a0f1c] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition font-bold"
              >
                {['I','II','III','IV','V','VI','VII','VIII','IX','X'].map((r,i) => (
                  <option key={i+1} value={i+1}>Level {r}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className={`px-4 py-2.5 rounded-xl font-black text-sm ${arenaQuestions.length >= 10 ? 'bg-green-900/40 text-green-400 border border-green-500/30' : 'bg-orange-900/40 text-orange-400 border border-orange-500/30'}`}>
                {arenaQuestions.length}/10 Questions
              </div>
            </div>
          </div>

          {/* Add Question Form */}
          {showAddForm && (
            <div className="bg-[#0a0f1c] border border-orange-500/30 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(234,88,12,0.1)]">
              <h4 className="text-lg font-black text-orange-400 mb-5 tracking-wide">{editingQId ? '📝 Edit Question' : '📝 New Question'}</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Professor Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Prof. H.C. Verma"
                      value={newQ.professorName}
                      onChange={e => setNewQ(v => ({...v, professorName: e.target.value}))}
                      className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Institution / IIT (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., IIT Kanpur"
                      value={newQ.institution}
                      onChange={e => setNewQ(v => ({...v, institution: e.target.value}))}
                      className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Question Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Print Hello World"
                    value={newQ.title}
                    onChange={e => setNewQ(v => ({...v, title: e.target.value}))}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Question Description / Problem Statement</label>
                  <textarea
                    placeholder="Write the full problem statement here. Include examples and expected output..."
                    value={newQ.content}
                    onChange={e => setNewQ(v => ({...v, content: e.target.value}))}
                    rows={5}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition resize-y font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Difficulty</label>
                  <select
                    value={newQ.difficulty}
                    onChange={e => setNewQ(v => ({...v, difficulty: e.target.value}))}
                    className="bg-[#111] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 transition font-bold"
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Expected Output <span className="text-gray-600 font-normal normal-case">(exact output your code should print)</span></label>
                  <textarea
                    placeholder={`e.g., Hello World\n5\nTrue`}
                    value={newQ.expectedOutput}
                    onChange={e => setNewQ(v => ({...v, expectedOutput: e.target.value}))}
                    rows={3}
                    className="w-full bg-[#0a1a0a] border border-green-800/50 text-green-300 rounded-xl px-4 py-3 outline-none focus:border-green-500 transition resize-y font-mono text-sm placeholder-green-900"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">⚠️ Exact match hoga — whitespace/newline bhi count hote hain. Trim karke compare hoga.</p>
                </div>
                <button
                  onClick={handleSaveArenaQuestion}
                  disabled={addingQ}
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black py-3 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition flex items-center justify-center gap-2"
                >
                  {addingQ ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Plus size={18}/>}
                  {addingQ ? 'Saving...' : (editingQId ? 'Update Question' : 'Save Question')}
                </button>
              </div>
            </div>
          )}

          {/* Questions List */}
          {arenaLoading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"/></div>
          ) : arenaQuestions.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30"/>
              <p className="font-black text-lg">No questions yet for this level.</p>
              <p className="text-sm mt-1">Click "Add Question" to create the first one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {arenaQuestions.map((q, idx) => (
                <div key={q.id} className="bg-[#0a0f1c] border border-[#1e2940] rounded-2xl p-5 flex gap-4 items-start hover:border-orange-500/30 transition group">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-black text-sm ${
                    q.difficulty === 'easy' ? 'bg-green-900/40 text-green-400 border border-green-500/30' :
                    q.difficulty === 'medium' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-900/40 text-red-400 border border-red-500/30'
                  }`}>{idx+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base mb-1">{q.title}</p>
                    
                    {/* Display Professor & Institution if available */}
                    {(q.professorName || q.institution) && (
                      <p className="text-xs text-orange-400 mb-2 font-bold tracking-wide flex items-center gap-1">
                        By {q.professorName || 'Unknown Professor'} 
                        {q.institution && <span>• {q.institution}</span>}
                      </p>
                    )}
                    
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{q.content}</p>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        q.difficulty === 'easy' ? 'bg-green-900/40 text-green-400' :
                        q.difficulty === 'medium' ? 'bg-yellow-900/40 text-yellow-400' :
                        'bg-red-900/40 text-red-400'
                      }`}>{q.difficulty.toUpperCase()}</span>
                      {q.expectedOutput ? (
                        <span className="text-xs font-mono bg-[#0a1a0a] border border-green-700/40 text-green-400 px-2 py-0.5 rounded-full max-w-[220px] truncate" title={q.expectedOutput}>
                          ✓ Expected: {q.expectedOutput.trim().slice(0, 30)}{q.expectedOutput.trim().length > 30 ? '...' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600 italic">No expected output set</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setNewQ({ 
                          title: q.title, 
                          content: q.content, 
                          difficulty: q.difficulty, 
                          expectedOutput: q.expectedOutput || '', 
                          professorName: q.professorName || '', 
                          institution: q.institution || '' 
                        });
                        setEditingQId(q.id);
                        setShowAddForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition"
                      title="Edit Question"
                    >
                      <Edit2 size={16}/>
                    </button>
                    <button
                      onClick={() => handleDeleteArenaQuestion(q.id)}
                      className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition"
                      title="Delete Question"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Course Content Manager */}
        {activeTab === 'courses' && (
        <div className="bg-[#111]/80 backdrop-blur-xl border border-blue-500/20 rounded-[2rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] mb-10 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[#222] pb-6">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <span className="text-blue-500"><BookOpen size={28} /></span> Course Curriculum Manager
              </h3>
              <p className="text-gray-400 text-sm mt-1">Upload videos, summaries, and manage curriculum topics.</p>
            </div>
            <button
              onClick={() => setShowAddCourseForm(!showAddCourseForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition"
            >
              {showAddCourseForm ? <X size={18}/> : <Plus size={18}/>} {showAddCourseForm ? 'Cancel' : 'Add Topic'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-full md:w-auto">
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Select Course</label>
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="w-full md:w-64 bg-[#0a0f1c] border border-[#333] text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition font-bold"
              >
                <option value="medical">AI in Medicine - Masterclass</option>
                <option value="engineering">AI for Engineers - Masterclass</option>
                <option value="general">AI Masterclass</option>
              </select>
            </div>
          </div>

          {/* Add Topic Form */}
          {showAddCourseForm ? (
            <div className="bg-[#0a0f1c] border border-blue-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(37,99,235,0.1)]">
              <h4 className="text-lg font-black text-blue-400 mb-5 tracking-wide">🆕 New Curriculum Topic</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Topic Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Topic 1: Introduction to AI"
                    value={newTopic.title}
                    onChange={e => setNewTopic(v => ({...v, title: e.target.value}))}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Upload Video File</label>
                    <div className="relative">
                      <Video size={16} className="absolute left-3 top-3.5 text-gray-500" />
                      <input
                        type="file"
                        accept="video/*"
                        onChange={e => setNewTopic(v => ({...v, videoFile: e.target.files[0]}))}
                        className="w-full bg-[#111] border border-[#333] text-gray-400 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-blue-500 transition file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Duration</label>
                    <div className="relative">
                      <PlayCircle size={16} className="absolute left-3 top-3.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="e.g., 15:20"
                        value={newTopic.duration}
                        onChange={e => setNewTopic(v => ({...v, duration: e.target.value}))}
                        className="w-full bg-[#111] border border-[#333] text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">Topic Summary / Notes</label>
                  <textarea
                    placeholder="Write a comprehensive summary or reading material for this topic..."
                    value={newTopic.summary}
                    onChange={e => setNewTopic(v => ({...v, summary: e.target.value}))}
                    rows={4}
                    className="w-full bg-[#111] border border-[#333] text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition resize-y font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input 
                    type="checkbox" 
                    id="isLocked"
                    checked={newTopic.locked}
                    onChange={e => setNewTopic(v => ({...v, locked: e.target.checked}))}
                    className="w-4 h-4 rounded bg-[#111] border-[#333] text-blue-500 focus:ring-blue-500 focus:ring-offset-[#0a0f1c]"
                  />
                  <label htmlFor="isLocked" className="text-sm text-gray-400 font-bold cursor-pointer">Lock topic (Requires previous completion)</label>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#222]">
                  <button
                    onClick={() => setShowAddCourseForm(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-[#222] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTopic}
                    disabled={isSavingTopic}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black transition text-white ${isSavingTopic ? 'bg-blue-800 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}
                  >
                    {isSavingTopic ? 'Saving...' : <><Save size={16}/> Save Topic</>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-[#222] rounded-2xl">
               <p className="text-gray-500 text-sm">Select a course and click "Add Topic" to manage the curriculum.</p>
            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
