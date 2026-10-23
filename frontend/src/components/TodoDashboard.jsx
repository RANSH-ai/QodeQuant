import React, { useState } from 'react';
import { 
  Search, Bell, Moon, Plus, LayoutDashboard, CheckSquare, Folder, 
  Calendar as CalendarIcon, FileText, Target, Users, BarChart2, Briefcase, Settings, 
  ChevronRight, MoreHorizontal, Filter, List, KanbanSquare, Table2, 
  Clock, AlertCircle, CheckCircle2, Circle, ArrowUpRight, ArrowDownRight,
  ChevronLeft, Crown, CircleDashed, Check, MessageSquare, LayoutGrid, Activity
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import AnimatedLogo from './AnimatedLogo';

export default function TodoDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Tasks');
  const [viewMode, setViewMode] = useState('Kanban');
  const [activeSidebar, setActiveSidebar] = useState('Dashboard');

  const initialKanbanData = {
    'To Do': [],
    'In Progress': [],
    'Testing': [],
    'Review': [],
    'Completed': []
  };

  const [kanbanData, setKanbanData] = useState(() => {
    const saved = localStorage.getItem('qodequant_kanban');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return initialKanbanData;
  });

  React.useEffect(() => {
    localStorage.setItem('qodequant_kanban', JSON.stringify(kanbanData));
  }, [kanbanData]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [newTaskInput, setNewTaskInput] = useState({ status: null, text: '' });
  const [activeMenu, setActiveMenu] = useState(null);

  const totalTasks = Object.values(kanbanData).reduce((acc, tasks) => acc + tasks.length, 0);
  const completedTasks = kanbanData['Completed'].length;
  const inProgressTasks = kanbanData['In Progress'].length;
  const pendingTasks = kanbanData['To Do'].length;
  const overdueTasks = 0;

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: LayoutDashboard, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: '0%', trendUp: true },
    { label: 'Completed', value: completedTasks, icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', trend: '0%', trendUp: true },
    { label: 'In Progress', value: inProgressTasks, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', trend: '0%', trendUp: true },
    { label: 'Pending', value: pendingTasks, icon: CircleDashed, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', trend: '0%', trendUp: false },
    { label: 'Overdue', value: overdueTasks, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', trend: '0%', trendUp: false },
  ];

  const handleDeleteTask = (status, index) => {
    setKanbanData(prev => {
      const newList = [...prev[status]];
      newList.splice(index, 1);
      return { ...prev, [status]: newList };
    });
    setActiveMenu(null);
  };

  const handleAddTask = (status) => {
    if (!newTaskInput.text.trim() || newTaskInput.status !== status) {
      setNewTaskInput({ status: null, text: '' });
      return;
    }
    
    const newTask = {
      title: newTaskInput.text,
      project: 'General',
      tag: 'Task',
      date: 'Today',
      priority: 'Medium',
      progress: 0,
    };

    setKanbanData(prev => ({
      ...prev,
      [status]: [...prev[status], newTask]
    }));
    
    setNewTaskInput({ status: null, text: '' });
  };

  const handleDragStart = (e, status, index) => {
    setDraggedItem({ status, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { status: sourceStatus, index: sourceIndex } = draggedItem;
    
    // If dropped in the same column
    if (sourceStatus === targetStatus) return;

    setKanbanData(prev => {
      const sourceList = [...prev[sourceStatus]];
      const targetList = [...prev[targetStatus]];
      
      const [task] = sourceList.splice(sourceIndex, 1);
      targetList.push(task);
      
      return {
        ...prev,
        [sourceStatus]: sourceList,
        [targetStatus]: targetList
      };
    });

    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-500 bg-red-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'Low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };
  
  const getProgressColor = (status) => {
    switch(status) {
      case 'To Do': return 'bg-gray-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Testing': return 'bg-purple-500';
      case 'Review': return 'bg-blue-500';
      case 'Completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-[#090b14] text-gray-300 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 border-r border-gray-800 bg-[#0c0e1a] flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-4">
          <div className="px-2 mb-8 mt-2">
            <AnimatedLogo />
          </div>

          <div className="space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={activeSidebar === 'Dashboard'} onClick={() => setActiveSidebar('Dashboard')} />
            <NavItem icon={CheckSquare} label="My Tasks" active={activeSidebar === 'My Tasks'} onClick={() => setActiveSidebar('My Tasks')} />
            <NavItem icon={Folder} label="Projects" active={activeSidebar === 'Projects'} onClick={() => setActiveSidebar('Projects')} />
            <NavItem icon={CalendarIcon} label="Calendar" active={activeSidebar === 'Calendar'} onClick={() => setActiveSidebar('Calendar')} />
            <NavItem icon={FileText} label="Notes" active={activeSidebar === 'Notes'} onClick={() => setActiveSidebar('Notes')} />
            <NavItem icon={Target} label="Goals" active={activeSidebar === 'Goals'} onClick={() => setActiveSidebar('Goals')} />
            <NavItem icon={Users} label="Team" active={activeSidebar === 'Team'} onClick={() => setActiveSidebar('Team')} />
            <NavItem icon={BarChart2} label="Reports" active={activeSidebar === 'Reports'} onClick={() => setActiveSidebar('Reports')} />
            <NavItem icon={Briefcase} label="Resources" active={activeSidebar === 'Resources'} onClick={() => setActiveSidebar('Resources')} />
            <NavItem icon={Settings} label="Settings" active={activeSidebar === 'Settings'} onClick={() => setActiveSidebar('Settings')} />
          </div>

          <div className="mt-8">
            <div className="px-3 text-xs font-bold text-gray-500 uppercase mb-3 flex items-center justify-between">
              Workspaces <ChevronRight size={14} className="cursor-pointer hover:text-white" />
            </div>
            <div className="space-y-1">
              <WorkspaceItem color="bg-blue-500" label="Personal" />
              <WorkspaceItem color="bg-gray-400" label="College" />
              <WorkspaceItem color="bg-pink-500" label="QodeQuant Website" />
              <WorkspaceItem color="bg-yellow-500" label="DSA Practice" />
              <WorkspaceItem color="bg-green-500" label="Internship/Job" />
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg cursor-pointer transition mt-2">
                <Plus size={16} /> Add Workspace
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="bg-gradient-to-br from-[#1a1f3c] to-[#0f1322] border border-blue-900/30 rounded-xl p-4 relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2 items-center">
                 <Crown size={18} className="text-yellow-500" />
                 <span className="font-bold text-white text-sm">QodeQuant Pro</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Get advanced analytics, AI assistant, cloud sync and more.
            </p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition">
              Upgrade Now &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOP HEADER */}
        <header className="h-16 border-b border-gray-800 bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search tasks, projects, notes..." 
              className="w-full bg-[#13172b] border border-gray-700 rounded-lg pl-10 pr-12 py-2 text-sm focus:outline-none focus:border-blue-500 transition text-gray-200"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px] border border-gray-700">Ctrl</kbd>
              <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px] border border-gray-700">K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setNewTaskInput({ status: 'To Do', text: '' })}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              <Plus size={16} /> Quick Add
            </button>
            <div className="relative cursor-pointer hover:bg-gray-800 p-2 rounded-full transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0c0e1a]"></span>
            </div>
            <div className="cursor-pointer hover:bg-gray-800 p-2 rounded-full transition">
              <Moon size={18} />
            </div>
            <div className="h-8 w-px bg-gray-800 mx-1"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="https://ui-avatars.com/api/?name=Pranav&background=3b82f6&color=fff" alt="Pranav" className="w-8 h-8 rounded-full border border-gray-600" />
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-gray-200 leading-tight">Pranav</div>
                <div className="text-[10px] text-gray-500">Student | Builder</div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {activeSidebar === 'Dashboard' || activeSidebar === 'My Tasks' ? (
          <div className="flex flex-col xl:flex-row gap-6 min-h-full">
            
            {/* LEFT 3/4 PANEL */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              
              {/* Greeting & Stats */}
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                    Good Afternoon, Pranav <span className="text-2xl animate-waving-hand origin-bottom-right">👋</span>
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Let's make progress today. You have <span className="text-blue-400 font-bold">{pendingTasks + inProgressTasks} tasks</span> due this week.
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-[#111526] p-4 rounded-xl border border-gray-800 flex-1 max-w-sm ml-auto relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="relative z-10 flex-1">
                     <p className="text-sm text-gray-300 font-medium italic mb-2 leading-relaxed">
                       "Consistency turns ideas into reality."
                     </p>
                     <p className="text-xs text-gray-500 font-mono">— QodeQuant</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className={`bg-[#111526] border border-gray-800 rounded-xl p-4 flex flex-col justify-between group hover:border-gray-600 transition`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon size={16} />
                      </div>
                      <div className={`text-xs font-medium flex items-center gap-1 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {stat.trend}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                    </div>
                  </div>
                ))}
                
                {/* Progress Circle Card */}
                <div className="bg-[#111526] border border-gray-800 rounded-xl p-4 flex items-center justify-center gap-4 group hover:border-gray-600 transition">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1f2937" strokeWidth="4" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray={`${totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%</div>
                  </div>
                  <div className="shrink-0">
                    <div className="text-[11px] text-gray-400 mb-1">Completion</div>
                    <div className="text-[11px] font-bold text-gray-200">{completedTasks} / {totalTasks} tasks</div>
                  </div>
                </div>
              </div>

              {/* Tabs & Controls */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto scrollbar-hide">
                  {['Tasks', 'Projects', 'Calendar', 'Timeline', 'Analytics', 'Notes'].map(tab => (
                    <div 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium cursor-pointer transition whitespace-nowrap relative pb-4 -mb-4 ${activeTab === tab ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      {tab}
                      {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-[#13172b] rounded-lg p-1 border border-gray-800">
                    <ViewToggle icon={KanbanSquare} label="Kanban" active={viewMode === 'Kanban'} onClick={() => setViewMode('Kanban')} />
                    <ViewToggle icon={List} label="List" active={viewMode === 'List'} onClick={() => setViewMode('List')} />
                    <ViewToggle icon={Table2} label="Table" active={viewMode === 'Table'} onClick={() => setViewMode('Table')} />
                  </div>
                  
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition">
                    <Filter size={14} /> Filter
                  </button>
                  <button 
                    onClick={() => setNewTaskInput({ status: 'To Do', text: '' })}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-sm font-medium transition"
                  >
                    <Plus size={14} /> Add Task
                  </button>
                </div>
              </div>

              {/* Main Board View Area */}
              {activeTab === 'Tasks' ? (
                <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
                {viewMode === 'Kanban' && (
                  <div className="flex gap-4 min-w-max h-full items-start">
                  {Object.entries(kanbanData).map(([status, tasks]) => (
                    <div 
                      key={status} 
                      className="w-[280px] flex flex-col gap-3"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status)}
                    >
                      
                      {/* Column Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 bg-[#111526] px-3 py-1.5 rounded-full border border-gray-800">
                          <div className={`w-2 h-2 rounded-full ${getProgressColor(status)} shadow-[0_0_8px_currentColor] opacity-80`}></div>
                          <span className="font-bold text-sm text-gray-200">{status}</span>
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full ml-1">{tasks.length}</span>
                        </div>
                        <MoreHorizontal size={16} className="text-gray-500 cursor-pointer hover:text-gray-300" />
                      </div>

                      {/* Tasks List */}
                      <div className="flex flex-col gap-3 min-h-[100px]">
                        {tasks.map((task, i) => (
                          <div 
                            key={i} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, status, i)}
                            className="bg-[#111526] border border-gray-800 hover:border-gray-600 rounded-xl p-4 flex flex-col gap-3 group transition cursor-grab active:cursor-grabbing shadow-sm"
                          >
                            <div className="flex items-start justify-between">
                              <h3 className={`text-sm font-bold ${status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{task.title}</h3>
                              <div className="relative">
                                <MoreHorizontal 
                                  size={14} 
                                  className="text-gray-600 opacity-0 group-hover:opacity-100 transition cursor-pointer hover:text-gray-300" 
                                  onClick={() => setActiveMenu(activeMenu?.status === status && activeMenu?.index === i ? null : { status, index: i })}
                                />
                                {activeMenu?.status === status && activeMenu?.index === i && (
                                  <div className="absolute right-0 mt-1 w-24 bg-[#1a1f3c] border border-gray-700 rounded-md shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
                                    <button 
                                      onClick={() => handleDeleteTask(status, i)}
                                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-800 transition font-medium"
                                    >
                                      Delete Task
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">{task.project}</span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800/50">{task.tag}</span>
                            </div>

                            {status !== 'Completed' && status !== 'To Do' && (
                              <div className="space-y-1.5 mt-1">
                                <div className="flex justify-between text-[10px] font-medium text-gray-500">
                                  <span>Progress</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div className={`h-full ${getProgressColor(status)}`} style={{ width: `${task.progress}%` }}></div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800/50">
                              <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium">
                                <span className="flex items-center gap-1"><CalendarIcon size={12} /> {task.date}</span>
                                {task.priority && (
                                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div> {task.priority}
                                  </span>
                                )}
                              </div>
                              {task.users && (
                                <div className="flex -space-x-2">
                                  {task.users.map(u => (
                                    <img key={u} src={`https://i.pravatar.cc/150?img=${u+10}`} alt="user" className="w-5 h-5 rounded-full border-2 border-[#111526]" />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Task Btn */}
                      {newTaskInput.status === status ? (
                        <div className="mt-2">
                          <input 
                            type="text" 
                            autoFocus
                            placeholder="Task title... (Press Enter)"
                            className="w-full bg-[#13172b] border border-blue-500 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={newTaskInput.text}
                            onChange={(e) => setNewTaskInput({ ...newTaskInput, text: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTask(status);
                              if (e.key === 'Escape') setNewTaskInput({ status: null, text: '' });
                            }}
                            onBlur={() => handleAddTask(status)}
                          />
                        </div>
                      ) : (
                        <div 
                          onClick={() => setNewTaskInput({ status, text: '' })}
                          className="flex items-center justify-center gap-2 py-2 mt-2 border border-dashed border-gray-700 bg-gray-800/10 rounded-lg text-gray-500 text-xs font-medium cursor-pointer hover:bg-gray-800/50 hover:text-gray-300 transition"
                        >
                          <Plus size={14} /> Add Task
                        </div>
                      )}

                      {status === 'Completed' && (
                        <div className="text-center text-xs text-green-500 mt-2 font-medium cursor-pointer hover:underline">
                          View All Completed
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                )}

                {viewMode === 'List' && (
                  <div className="flex flex-col gap-6 w-full">
                    {Object.entries(kanbanData).map(([status, tasks]) => (
                      <div key={status} className="bg-[#111526] border border-gray-800 rounded-xl overflow-hidden w-full">
                        <div className="flex items-center gap-2 bg-[#0c0e1a] px-4 py-3 border-b border-gray-800">
                          <div className={`w-2 h-2 rounded-full ${getProgressColor(status)} shadow-[0_0_8px_currentColor] opacity-80`}></div>
                          <span className="font-bold text-sm text-gray-200">{status}</span>
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full ml-1">{tasks.length}</span>
                        </div>
                        <div className="flex flex-col">
                          {tasks.map((task, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition gap-4">
                              <div className="flex flex-wrap items-center gap-4">
                                <div className={`text-sm font-bold w-48 md:w-64 truncate ${status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{task.title}</div>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">{task.project}</span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800/50">{task.tag}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-[10px] text-gray-500"><CalendarIcon size={12} /> {task.date}</span>
                                {task.priority && (
                                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${getPriorityColor(task.priority)}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div> {task.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'Table' && (
                  <div className="bg-[#111526] border border-gray-800 rounded-xl overflow-hidden w-full min-w-[700px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0c0e1a] border-b border-gray-800 text-xs text-gray-400">
                          <th className="p-4 font-medium">Task Name</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Project</th>
                          <th className="p-4 font-medium">Priority</th>
                          <th className="p-4 font-medium">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {Object.entries(kanbanData).flatMap(([status, tasks]) => 
                          tasks.map((task, i) => (
                            <tr key={`${status}-${i}`} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                              <td className={`p-4 font-bold ${status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{task.title}</td>
                              <td className="p-4">
                                <span className="flex items-center gap-2 text-[10px] text-gray-300 font-medium">
                                  <div className={`w-2 h-2 rounded-full ${getProgressColor(status)}`}></div>{status}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">{task.project}</span>
                              </td>
                              <td className="p-4">
                                {task.priority && (
                                  <span className={`flex w-fit items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${getPriorityColor(task.priority)}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div> {task.priority}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium"><CalendarIcon size={12} /> {task.date}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/10 text-gray-400 p-12">
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center text-gray-500">
                    {activeTab === 'Projects' && <LayoutGrid size={24} />}
                    {activeTab === 'Calendar' && <CalendarIcon size={24} />}
                    {activeTab === 'Timeline' && <Activity size={24} />}
                    {activeTab === 'Analytics' && <BarChart2 size={24} />}
                    {activeTab === 'Notes' && <FileText size={24} />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-300 mb-2">{activeTab} View</h3>
                  <p className="text-sm text-center max-w-md">This feature is currently in development and will be available in the next release of QodeQuant. Stay tuned!</p>
                </div>
              )}

              {/* Bottom Mini Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-2 border-t border-gray-800/50 pt-4">
                <MiniChartCard title="Task Status Distribution">
                  {totalTasks > 0 ? (
                   <div className="flex items-center gap-4 mt-2">
                     <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray={`${Math.round((completedTasks/totalTasks)*100)}, 100`} />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eab308" strokeWidth="6" strokeDasharray={`${Math.round((inProgressTasks/totalTasks)*100)}, 100`} strokeDashoffset={`-${Math.round((completedTasks/totalTasks)*100)}`} />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="6" strokeDasharray={`${Math.round((pendingTasks/totalTasks)*100)}, 100`} strokeDashoffset={`-${Math.round(((completedTasks+inProgressTasks)/totalTasks)*100)}`} />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray={`${Math.round((overdueTasks/totalTasks)*100)}, 100`} strokeDashoffset={`-${Math.round(((completedTasks+inProgressTasks+pendingTasks)/totalTasks)*100)}`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-white">{totalTasks}</span>
                          <span className="text-[8px] text-gray-500">Tasks</span>
                        </div>
                     </div>
                     <div className="space-y-1.5 flex-1 shrink-0 min-w-0">
                       <LegendItem color="bg-green-500" label="Completed" val={`${completedTasks} (${Math.round((completedTasks/totalTasks)*100)}%)`} />
                       <LegendItem color="bg-yellow-500" label="In Progress" val={`${inProgressTasks} (${Math.round((inProgressTasks/totalTasks)*100)}%)`} />
                       <LegendItem color="bg-blue-500" label="Pending" val={`${pendingTasks} (${Math.round((pendingTasks/totalTasks)*100)}%)`} />
                       <LegendItem color="bg-red-500" label="Overdue" val={`${overdueTasks} (${Math.round((overdueTasks/totalTasks)*100)}%)`} />
                     </div>
                   </div>
                  ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 py-4 mt-2">
                     <span className="text-xs">No tasks yet</span>
                   </div>
                  )}
                </MiniChartCard>

                <MiniChartCard title="Project Progress" action="View All">
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 py-4">
                     <span className="text-xs">No active projects</span>
                   </div>
                </MiniChartCard>

                <MiniChartCard title="Priority Distribution">
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 py-4">
                     <span className="text-xs">No tasks yet</span>
                   </div>
                </MiniChartCard>

                <MiniChartCard title="Upcoming Deadlines" action="View All">
                   <div className="flex flex-col items-center justify-center h-full text-gray-500 py-4">
                     <span className="text-xs">No upcoming deadlines</span>
                   </div>
                </MiniChartCard>
              </div>
            </div>
            
            {/* RIGHT SIDEBAR (Calendar, Upcoming, Activity) */}
            <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0 border-l border-gray-800 pl-6 xl:border-l-0 xl:pl-0 pt-6 xl:pt-0 border-t xl:border-t-0">
              
              {/* Calendar Widget */}
              <div className="bg-[#111526] border border-gray-800 rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg border border-blue-500/20">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Tue, 29 Sep 2026</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Small steps every day.</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-white">September 2026</span>
                  <div className="flex gap-2 text-gray-400">
                    <ChevronLeft size={16} className="cursor-pointer hover:text-white" />
                    <ChevronRight size={16} className="cursor-pointer hover:text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-gray-500 font-medium py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {/* Fake Calendar Grid */}
                  {[...Array(35)].map((_, i) => {
                    const day = i - 1; 
                    if (day < 1 || day > 30) return <div key={i} className="py-1.5 text-gray-700">{day > 30 ? day-30 : 31+day}</div>;
                    
                    const isToday = day === 29;
                    const hasEvent = [14, 18, 25, 26].includes(day);

                    return (
                      <div key={i} className={`py-1.5 relative cursor-pointer rounded-full flex items-center justify-center w-7 h-7 mx-auto transition ${isToday ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'text-gray-300 hover:bg-gray-800'}`}>
                        {day}
                        {hasEvent && !isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming List */}
              <div className="bg-[#111526] border border-gray-800 rounded-xl p-5 flex-1 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><Clock size={16} className="text-gray-400"/> Upcoming</h3>
                  <span className="text-[10px] text-blue-400 cursor-pointer hover:underline font-medium">View All</span>
                </div>
                
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <CalendarIcon size={24} className="mb-2 opacity-50" />
                  <span className="text-xs">No upcoming events</span>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#111526] border border-gray-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                  <span className="text-[10px] text-blue-400 cursor-pointer hover:underline font-medium">View All</span>
                </div>
                
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <Activity size={24} className="mb-2 opacity-50" />
                  <span className="text-xs">No recent activity</span>
                </div>
              </div>

            </div>
          </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[600px] border-2 border-dashed border-gray-800 rounded-xl bg-[#111526] text-gray-400 p-12 relative overflow-hidden group">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition duration-1000"></div>
               <div className="w-24 h-24 mb-6 rounded-2xl bg-[#1a1f3c] border border-blue-900/30 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-900/20 relative z-10">
                  <LayoutDashboard size={40} />
               </div>
               <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight relative z-10">{activeSidebar} Module</h3>
               <p className="text-lg text-center max-w-lg text-gray-400 relative z-10">
                 The {activeSidebar} module is currently in active development. We're building powerful capabilities here for the upcoming QodeQuant release.
               </p>
               <button onClick={() => setActiveSidebar('Dashboard')} className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:-translate-y-1 relative z-10">
                  Return to Dashboard
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${active ? 'bg-blue-600 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </div>
);

const WorkspaceItem = ({ color, label }) => (
  <div className="flex items-center gap-3 px-3 py-1.5 cursor-pointer hover:bg-gray-800 rounded-lg group transition">
    <div className={`w-4 h-4 rounded shadow-sm ${color} flex items-center justify-center opacity-80 group-hover:opacity-100`}>
      <span className="text-[8px] font-bold text-white uppercase">{label[0]}</span>
    </div>
    <span className="text-sm text-gray-400 group-hover:text-gray-200">{label}</span>
  </div>
);

const ViewToggle = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-xs font-medium transition ${active ? 'bg-blue-600/20 text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
    <Icon size={14} />
    {label}
  </div>
);

const MiniChartCard = ({ title, action, children }) => (
  <div className="bg-[#111526] border border-gray-800 rounded-xl p-4 flex flex-col justify-between shadow-md hover:border-gray-700 transition">
    <div className="flex items-center justify-between mb-1">
      <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">{title}</h4>
      {action && <span className="text-[10px] text-blue-400 hover:underline cursor-pointer">{action}</span>}
    </div>
    {children}
  </div>
);

const LegendItem = ({ color, label, val }) => (
  <div className="flex items-center justify-between text-[9px] w-full min-w-0">
    <div className="flex items-center gap-1.5 min-w-0">
      <div className={`w-2 h-2 rounded-full shrink-0 ${color}`}></div>
      <span className="text-gray-400 truncate">{label}</span>
    </div>
    <span className="font-medium text-gray-200 whitespace-nowrap">{val}</span>
  </div>
);

const ProgressItem = ({ label, icon, color, progress }) => (
  <div className="flex items-center gap-3 w-full">
    <div className={`w-5 h-5 rounded shrink-0 ${color.replace('text', 'bg').replace('500', '500/10')} ${color} flex items-center justify-center text-[10px] font-bold border border-current border-opacity-20`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-gray-300 truncate">{label}</span>
        <span className="text-gray-500 font-mono ml-2">{progress}%</span>
      </div>
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color.replace('text', 'bg')}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  </div>
);

const BarItem = ({ val, label, color, height }) => (
  <div className="flex flex-col items-center gap-1 group">
    <span className="text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition translate-y-1 group-hover:translate-y-0">{val}</span>
    <div className={`w-4 ${height} ${color} rounded-t-sm opacity-80 group-hover:opacity-100 transition shadow-[0_0_10px_currentColor] drop-shadow-md`}></div>
    <span className="text-[9px] text-gray-400 mt-1">{label}</span>
  </div>
);

const DeadlineItem = ({ task, date, priority }) => {
  const getPrioColor = (p) => {
    if (p==='High') return 'bg-red-500/10 text-red-500 border-red-500/30';
    if (p==='Medium') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    return 'bg-green-500/10 text-green-500 border-green-500/30';
  };
  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-gray-300 truncate max-w-[120px]">{task}</div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-gray-500 font-medium">{date}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPrioColor(priority)} flex items-center gap-1`}>
           <span className="w-1.5 h-1.5 rounded-full bg-current"></span>{priority}
        </span>
      </div>
    </div>
  );
};

const EventItem = ({ title, time, color, priority }) => {
   const getPrioColor = (p) => {
    if (p==='High') return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (p==='Medium') return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
    return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
  };
  return (
    <div className="flex items-start gap-3 group cursor-pointer hover:bg-gray-800/30 p-2 -mx-2 rounded-lg transition border border-transparent hover:border-gray-800">
      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center bg-[#0c0e1a] border border-gray-700 shadow-inner shrink-0`}>
        <div className={`w-2 h-2 rounded-full ${color} shadow-[0_0_5px_currentColor]`}></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-gray-200 font-medium group-hover:text-white transition truncate">{title}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">{time}</div>
      </div>
      <div className={`text-[9px] font-bold px-2 py-0.5 mt-0.5 rounded border ${getPrioColor(priority)} shrink-0`}>
         {priority}
      </div>
    </div>
  );
}

const ActivityItem = ({ icon: Icon, color, title, time }) => (
  <div className="relative flex items-start gap-3 mb-4 group">
    <div className={`absolute left-0 w-6 h-6 rounded-full border-2 bg-[#111526] ${color} flex items-center justify-center z-10 shadow-[0_0_10px_currentColor]`}>
      <Icon size={10} className="text-white" />
    </div>
    <div className="ml-10 bg-[#0c0e1a] p-3 rounded-lg border border-gray-800 w-full group-hover:border-gray-700 transition shadow-sm">
      <p className="text-[11px] text-gray-400">{title}</p>
      <span className="text-[9px] text-gray-500 mt-1 block font-medium">{time}</span>
    </div>
  </div>
);
