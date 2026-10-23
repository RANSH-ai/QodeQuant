import { API_BASE_URL } from '../apiConfig';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, PlayCircle, CheckCircle, Lock, FileText, Download, ChevronRight, MonitorPlay } from 'lucide-react';

export default function CourseViewer() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [curriculum, setCurriculum] = useState([
    {
      id: 1,
      title: "Topic 1: Introduction to AI",
      duration: "15:20",
      completed: true,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      summary: "In this introductory topic, we cover the basics of Artificial Intelligence. You'll learn about the history of AI, its fundamental concepts, and how it differs from traditional programming. We explore real-world examples and why AI is becoming essential in every industry."
    },
    {
      id: 2,
      title: "Topic 2: Core Machine Learning Concepts",
      duration: "24:10",
      completed: false,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      summary: "Dive deep into Machine Learning. This module breaks down supervised vs unsupervised learning, neural networks, and training data. By the end, you'll understand how algorithms learn from data to make predictions."
    }
  ]);

  const [activeTopicId, setActiveTopicId] = useState(1);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId || 'medical'}/topics`);
        if (res.ok) {
          const data = await res.json();
          setCurriculum(data);
          if (data && data.length > 0) {
            setActiveTopicId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch topics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [courseId]);

  const activeTopic = curriculum.length > 0 ? (curriculum.find(t => t.id === activeTopicId) || curriculum[0]) : null;

  const completedCount = curriculum.filter(t => t.completed).length;
  const progressPercentage = curriculum.length > 0 ? Math.round((completedCount / curriculum.length) * 100) : 0;

  const currentIndex = curriculum.findIndex(t => t.id === (activeTopic?.id ?? activeTopicId));
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < curriculum.length - 1;

  const handlePrevTopic = () => {
    if (hasPrev) {
      setActiveTopicId(curriculum[currentIndex - 1].id);
    }
  };

  const handleNextTopic = () => {
    if (hasNext) {
      setActiveTopicId(curriculum[currentIndex + 1].id);
    }
  };

  const toggleTopicCompletion = (topicId) => {
    setCurriculum(prev => {
      const updated = prev.map(t => {
        if (t.id === topicId) {
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      const idx = updated.findIndex(t => t.id === topicId);
      if (idx !== -1 && updated[idx].completed && idx + 1 < updated.length) {
        updated[idx + 1] = { ...updated[idx + 1], locked: false };
      }
      return updated;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-16 bg-[#0a0a0a] border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/courses')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
              <MonitorPlay size={16} />
            </div>
            <h1 className="font-bold text-lg">
              {courseId === 'medical' ? 'AI in Medicine - Masterclass' : courseId === 'engineering' ? 'AI for Engineers - Masterclass' : 'AI Masterclass'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-blue-400 font-bold">{progressPercentage}%</span> Completed
          </div>
          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Main Content Area (Video + Summary) */}
        <div className="flex-1 overflow-y-auto bg-[#050505] custom-scrollbar">
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            
            {/* Video Player Container */}
            {activeTopic ? (
              <>
            <div className="aspect-video bg-black rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative group mb-8">
              {activeTopic.locked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-500">
                  <Lock size={48} className="mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-gray-300">Topic Locked</h3>
                  <p className="text-sm">Complete previous topics to access this content.</p>
                </div>
              ) : (
                <video 
                  controls 
                  className="w-full h-full object-contain bg-black"
                  src={activeTopic.videoUrl}
                  poster="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Topic Information */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-extrabold">{activeTopic.title}</h2>
                <button 
                  onClick={() => activeTopic && toggleTopicCompletion(activeTopic.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg cursor-pointer ${
                    activeTopic.completed 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                  }`}
                >
                  {activeTopic.completed ? 'Completed' : 'Mark as Complete'} <CheckCircle size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-gray-800 mb-6">
                <button className="text-blue-400 border-b-2 border-blue-400 pb-4 font-bold flex items-center gap-2">
                  <FileText size={18} /> Summary
                </button>
                <button 
                  onClick={() => alert('Resources for this topic: Slide deck (PDF), Reference Cheatsheet (PDF), Starter Notebook (.ipynb)')}
                  className="text-gray-500 hover:text-gray-300 pb-4 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={18} /> Resources (3)
                </button>
              </div>

              {/* Summary Content */}
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {activeTopic.summary}
                </p>
                <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Key Takeaways</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-gray-300">Understand the foundational principles of the topic.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                      <span className="text-gray-300">Learn how to apply these concepts in real-world scenarios.</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Next/Prev Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-800">
                <button 
                  disabled={!hasPrev}
                  onClick={handlePrevTopic}
                  className={`flex items-center gap-2 font-bold transition-colors ${!hasPrev ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white cursor-pointer'}`}
                >
                  <ChevronLeft size={18} /> Previous Topic
                </button>
                <button 
                  disabled={!hasNext}
                  onClick={handleNextTopic}
                  className={`flex items-center gap-2 font-bold transition-colors ${!hasNext ? 'text-gray-700 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300 cursor-pointer'}`}
                >
                  Next Topic <ChevronRight size={18} />
                </button>
              </div>

            </div>
            </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-32">
                <MonitorPlay size={64} className="opacity-20 mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">No Topics Uploaded Yet</h3>
                <p>Curriculum is currently empty for this course.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Curriculum) */}
        <div className="w-80 bg-[#0a0a0a] border-l border-gray-800 flex flex-col shrink-0">
          <div className="p-5 border-b border-gray-800">
            <h3 className="font-bold text-lg">Course Curriculum</h3>
            <p className="text-gray-500 text-sm">{curriculum.length} Topics • 2h 15m total</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {curriculum.length > 0 ? curriculum.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveTopicId(topic.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex gap-3 cursor-pointer ${
                  activeTopicId === topic.id 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-transparent border-transparent hover:bg-[#111] hover:border-gray-800'
                }`}
              >
                <div className="mt-1 shrink-0">
                  {topic.completed ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : topic.locked ? (
                    <Lock size={18} className="text-gray-600" />
                  ) : (
                    <PlayCircle size={18} className={activeTopicId === topic.id ? 'text-blue-400' : 'text-gray-400'} />
                  )}
                </div>
                <div>
                  <div className={`font-bold text-sm mb-1 line-clamp-2 ${
                    activeTopicId === topic.id ? 'text-blue-400' : topic.locked ? 'text-gray-500' : 'text-gray-200'
                  }`}>
                    {topic.title}
                  </div>
                  <div className="text-xs text-gray-500">{topic.duration}</div>
                </div>
              </button>
            )) : (
              <div className="text-center p-6 text-sm text-gray-600 italic">No topics available</div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
