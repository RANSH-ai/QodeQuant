import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Cog, Search, Filter, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

export default function CourseDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              QodeQuant Courses
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4 bg-[#111] border border-gray-800 rounded-full px-4 py-1.5">
            <Search size={16} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="bg-transparent border-none focus:outline-none text-sm w-48 text-gray-300 placeholder-gray-600"
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold mb-4">Explore AI Batches</h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            Choose a specialized cohort tailored to your profession. Master AI tools, automate workflows, and stay ahead in your career.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 transition-colors">
            <Filter size={16} /> All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-gray-800 text-gray-300 font-medium rounded-full text-sm hover:border-blue-500/50 hover:text-blue-400 transition-colors">
            <Stethoscope size={16} /> Healthcare
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-gray-800 text-gray-300 font-medium rounded-full text-sm hover:border-purple-500/50 hover:text-purple-400 transition-colors">
            <Cog size={16} /> Engineering
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-gray-800 text-gray-300 font-medium rounded-full text-sm hover:border-green-500/50 hover:text-green-400 transition-colors">
            <Briefcase size={16} /> Business
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-gray-800 text-gray-300 font-medium rounded-full text-sm hover:border-yellow-500/50 hover:text-yellow-400 transition-colors">
            <GraduationCap size={16} /> Students
          </button>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Medical Batch Card */}
          <div className="group relative bg-[#0a0a0a] border border-gray-800/80 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 shadow-xl overflow-hidden cursor-pointer flex flex-col h-full">
             <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all -z-10"></div>
             <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Stethoscope size={24} />
               </div>
               <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div> Enrolling Now
               </span>
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">AI in Medicine</h3>
             <p className="text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
               Master AI applications for diagnostics, patient care, medical research, and data-driven healthcare decisions.
             </p>
             <div className="flex items-center justify-between border-t border-gray-800/80 pt-5">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Next Batch Starts</div>
                  <div className="text-sm font-mono text-gray-200">Oct 15, 2026</div>
                </div>
                <button 
                  onClick={() => navigate('/course-viewer/medical')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1 transition-all shadow-lg shadow-blue-500/20"
                >
                  Join <ArrowRight size={14} />
                </button>
             </div>
          </div>

          {/* Engineering Batch Card */}
          <div className="group relative bg-[#0a0a0a] border border-gray-800/80 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 shadow-xl overflow-hidden cursor-pointer flex flex-col h-full">
             <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all -z-10"></div>
             <div className="flex justify-between items-start mb-6">
               <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Cog size={24} />
               </div>
               <span className="bg-purple-500/10 text-purple-400 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/20 flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div> Enrolling Now
               </span>
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">AI for Engineers</h3>
             <p className="text-gray-400 text-sm mb-6 leading-relaxed flex-grow">
               Build powerful automation pipelines, master predictive maintenance, and leverage AI for complex engineering models.
             </p>
             <div className="flex items-center justify-between border-t border-gray-800/80 pt-5">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Next Batch Starts</div>
                  <div className="text-sm font-mono text-gray-200">Oct 20, 2026</div>
                </div>
                <button 
                  onClick={() => navigate('/course-viewer/engineering')}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1 transition-all shadow-lg shadow-purple-500/20"
                >
                  Join <ArrowRight size={14} />
                </button>
             </div>
          </div>

          {/* Business Batch Card (Placeholder) */}
          <div className="group relative bg-[#050505] border border-gray-800/40 border-dashed rounded-2xl p-6 hover:border-gray-600 transition-all duration-300 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
             <div className="w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center text-gray-600 mb-4 group-hover:text-gray-400 transition-colors">
                <Briefcase size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-400 mb-2">AI for Business</h3>
             <p className="text-gray-600 text-sm mb-4">Coming soon. Learn AI-driven analytics, market predictions, and automated reporting.</p>
             <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 border border-gray-800 px-3 py-1 rounded-full">Waitlist Open</span>
          </div>

        </div>
      </div>
    </div>
  );
}
