import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, User, ShieldCheck, Mail, Phone, Building2, MapPin, 
  CalendarDays, ShieldAlert, Users, FileCode2, Trash2, IndianRupee, Star, 
  CheckCircle, Plus, X, Sparkles, Edit2, Check, RefreshCw, MessageSquare,
  LogOut, ExternalLink, KeyRound, UserCheck
} from 'lucide-react';

export default function SuperAdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalExams: 0, activeTeachers: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Teacher State
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', phone: '', collegeName: '', degree: '' });
  const [addingTeacher, setAddingTeacher] = useState(false);

  // Create Admin State
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', phone: '', role: 'admin' });
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Daily Quotes / Funny Lines State
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    text: '',
    author: '',
    category: 'funny',
    makeActive: true
  });
  const [savingQuote, setSavingQuote] = useState(false);

  // Current logged in user info
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchPendingPayments();
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/quotes`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (err) {
      console.error('Failed to load quotes', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    if (!quoteForm.text.trim()) {
      return alert('Quote text is required!');
    }
    setSavingQuote(true);
    try {
      const url = editingQuoteId 
        ? `${API_BASE_URL}/api/admin/quotes/${editingQuoteId}`
        : `${API_BASE_URL}/api/admin/quotes`;
      const method = editingQuoteId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: quoteForm.text,
          author: quoteForm.author,
          category: quoteForm.category,
          isActive: quoteForm.makeActive,
          makeActive: quoteForm.makeActive
        })
      });

      if (res.ok) {
        alert(editingQuoteId ? 'Quote updated successfully!' : 'New quote added to landing page!');
        setQuoteForm({ text: '', author: '', category: 'funny', makeActive: true });
        setShowAddQuote(false);
        setEditingQuoteId(null);
        fetchQuotes();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save quote');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving quote');
    } finally {
      setSavingQuote(false);
    }
  };

  const handleActivateQuote = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/quotes/${id}/activate`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        fetchQuotes();
      }
    } catch (err) {
      console.error('Failed to activate quote', err);
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/quotes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setQuotes(quotes.filter(q => q.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete quote', err);
    }
  };

  const handleEditQuote = (quote) => {
    setEditingQuoteId(quote.id);
    setQuoteForm({
      text: quote.text,
      author: quote.author || '',
      category: quote.category || 'funny',
      makeActive: quote.isActive
    });
    setShowAddQuote(true);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/pending`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setPendingPayments(data);
      }
    } catch (err) {
      console.error('Failed to load pending payments', err);
    }
  };

  const handleApprovePayment = async (id) => {
    if (!window.confirm('Approve this payment? The user will be upgraded to PRO and notified.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/${id}/approve`, { 
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        fetchPendingPayments();
        fetchUsers();
        fetchStats();
      } else {
        alert('Failed to approve payment');
      }
    } catch (err) {
      console.error(err);
      alert('Error approving payment');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id));
        fetchStats();
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        fetchStats();
        alert(`User role updated to ${newRole.toUpperCase()}!`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update user role');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user role');
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) {
      return alert('Name, Email, and Password are required.');
    }
    setAddingTeacher(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newTeacher)
      });
      if (res.ok) {
        alert('Teacher profile created successfully!');
        setNewTeacher({ name: '', email: '', password: '', phone: '', collegeName: '', degree: '' });
        setShowAddTeacher(false);
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create teacher.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating teacher profile.');
    } finally {
      setAddingTeacher(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      return alert('Name, Email, and Password are required.');
    }
    setAddingAdmin(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/create-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAdmin)
      });
      if (res.ok) {
        alert(`${newAdmin.role.toUpperCase()} account created successfully!`);
        setNewAdmin({ name: '', email: '', password: '', phone: '', role: 'admin' });
        setShowAddAdmin(false);
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create admin.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating admin.');
    } finally {
      setAddingAdmin(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.phone || '').includes(searchQuery)
  );

  const teachersList = filteredUsers.filter(u => ['teacher', 'admin', 'superadmin'].includes(u.role));
  const studentsList = filteredUsers.filter(u => !['teacher', 'admin', 'superadmin'].includes(u.role));

  const renderUserTable = (title, userList, showAddBtn) => (
    <div className="mb-10 bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-[2rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#333] pb-4 mb-6 gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {title}
          <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/30 font-mono">
            {userList.length} Total
          </span>
        </h2>
        {showAddBtn && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowAddAdmin(v => !v); setShowAddTeacher(false); }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)] transition text-xs md:text-sm"
            >
              {showAddAdmin ? <X size={16}/> : <Plus size={16}/>} {showAddAdmin ? 'Cancel' : 'Create Admin'}
            </button>
            <button
              onClick={() => { setShowAddTeacher(v => !v); setShowAddAdmin(false); }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)] transition text-xs md:text-sm"
            >
              {showAddTeacher ? <X size={16}/> : <Plus size={16}/>} {showAddTeacher ? 'Cancel' : 'Create Teacher'}
            </button>
          </div>
        )}
      </div>

      {/* Add Admin Form */}
      {showAddBtn && showAddAdmin && (
        <div className="bg-[#0f0d1a] border border-orange-500/40 rounded-2xl p-6 mb-8 shadow-[0_0_30px_rgba(249,115,22,0.15)] animate-in fade-in duration-300">
          <h4 className="text-lg font-black text-orange-400 mb-5 tracking-wide flex items-center gap-2">
            <ShieldAlert size={20}/> Create Platform Admin Account
          </h4>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Full Name*</label>
                <input 
                  type="text" 
                  required 
                  value={newAdmin.name} 
                  onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} 
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-orange-500 outline-none" 
                  placeholder="e.g. Platform Admin" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Email*</label>
                <input 
                  type="email" 
                  required 
                  value={newAdmin.email} 
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-orange-500 outline-none" 
                  placeholder="admin@qodequant.com" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Password*</label>
                <input 
                  type="password" 
                  required 
                  value={newAdmin.password} 
                  onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-orange-500 outline-none" 
                  placeholder="Initial admin password" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Role Type</label>
                <select
                  value={newAdmin.role}
                  onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                  className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-orange-500 outline-none"
                >
                  <option value="admin">🛡️ Content & Questions Admin</option>
                  <option value="superadmin">👑 Full Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                type="submit" 
                disabled={addingAdmin} 
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.3)] transition"
              >
                {addingAdmin ? 'Creating Admin...' : 'Create Admin Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Teacher Form */}
      {showAddBtn && showAddTeacher && (
        <div className="bg-[#0a0f1c] border border-purple-500/30 rounded-2xl p-6 mb-8 shadow-[0_0_30px_rgba(168,85,247,0.1)] animate-in fade-in duration-300">
          <h4 className="text-lg font-black text-purple-400 mb-5 tracking-wide flex items-center gap-2">
            <User size={18}/> Create New Teacher Profile
          </h4>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Full Name*</label>
                <input type="text" required value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none" placeholder="e.g. Prof. Aloknath" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email*</label>
                <input type="email" required value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none" placeholder="teacher@university.edu" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Password*</label>
                <input type="password" required value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none" placeholder="Initial password" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Phone</label>
                <input type="text" value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none" placeholder="+91..." />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">College/Institution</label>
                <input type="text" value={newTeacher.collegeName} onChange={e => setNewTeacher({...newTeacher, collegeName: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none" placeholder="e.g. IIT Delhi" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Degree/Qualification</label>
                <input type="text" value={newTeacher.degree} onChange={e => setNewTeacher({...newTeacher, degree: e.target.value})} className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-2 text-white focus:border-purple-500 outline-none" placeholder="e.g. Ph.D. in Computer Science" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button type="submit" disabled={addingTeacher} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2">
                {addingTeacher ? 'Creating...' : 'Create Teacher Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-[#333]">
              <th className="pb-4 pl-4 font-bold">User</th>
              <th className="pb-4 font-bold">Contact Details</th>
              <th className="pb-4 font-bold">Location / Org</th>
              <th className="pb-4 font-bold">Role (Click to Change)</th>
              <th className="pb-4 font-bold">Payment</th>
              <th className="pb-4 font-bold">Joined</th>
              <th className="pb-4 font-bold text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading users...
                </td>
              </tr>
            ) : userList.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-500 font-mono">
                  No users found matching "{searchQuery}"
                </td>
              </tr>
            ) : (
              userList.map((user) => (
                <tr key={user.id} className="hover:bg-[#1a1a1a] transition-colors group">
                  
                  {/* Avatar & Name */}
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-[#333] bg-[#0a0a0a] overflow-hidden flex items-center justify-center text-gray-500 shrink-0">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm group-hover:text-blue-400 transition flex items-center gap-2">
                          {user.name || 'Anonymous'}
                          {user.isPro && <Star size={12} className="text-yellow-500 fill-yellow-500" title="Pro Member" />}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">ID: #{String(user.id).padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail size={12} className="text-purple-400" /> {user.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone size={12} className="text-green-400" /> {user.phone || 'N/A'}
                      </div>
                    </div>
                  </td>

                  {/* Location & Org */}
                  <td className="py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Building2 size={12} className="text-orange-400" /> <span className="truncate max-w-[150px]">{user.collegeName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={12} className="text-yellow-400" /> {user.city || 'N/A'}
                      </div>
                    </div>
                  </td>

                  {/* Interactive Role Selector Dropdown */}
                  <td className="py-4">
                    <select
                      value={user.role || 'student'}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-xl border cursor-pointer outline-none transition-all duration-200 ${
                        user.role === 'superadmin' 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                          : user.role === 'admin' 
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 hover:bg-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.25)]' 
                          : user.role === 'teacher' 
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]' 
                          : 'bg-[#18181b] text-gray-300 border-gray-700 hover:border-gray-500'
                      }`}
                      title="Click to promote or demote role"
                    >
                      <option value="student" className="bg-[#111115] text-gray-300">🎓 Student</option>
                      <option value="teacher" className="bg-[#111115] text-blue-400 font-bold">👨‍🏫 Teacher</option>
                      <option value="admin" className="bg-[#111115] text-orange-400 font-bold">🛡️ Admin</option>
                      <option value="superadmin" className="bg-[#111115] text-purple-400 font-bold">👑 Super Admin</option>
                    </select>
                  </td>

                  {/* Payment Details */}
                  <td className="py-4">
                    {user.Payments && user.Payments.length > 0 ? (
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20 truncate max-w-[140px]" title={`UTR: ${user.Payments[0].utrNumber}`}>
                          {user.Payments[0].utrNumber}
                        </span>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold w-max ${user.Payments[0].status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                            {user.Payments[0].status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1">
                            <CalendarDays size={10} className="text-gray-500" />
                            {new Date(user.Payments[0].createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 font-mono">No payment</span>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <CalendarDays size={12} className="text-gray-500" /> 
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 pr-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 bg-[#1a1a1a] hover:bg-red-500/20 border border-[#333] hover:border-red-500/50 rounded-lg text-gray-500 hover:text-red-400 transition"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-x-hidden p-6 md:p-12">
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-[#222]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-xl transition text-gray-400 hover:text-white"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-500 flex items-center gap-2">
                  Super Admin Terminal <ShieldAlert size={26} className="text-purple-400" />
                </h1>
                <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest hidden sm:inline-block">
                  Level 0 • Root Clearance
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Full platform authority: Manage users, promote/demote roles, approvals & financials.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick link to Questions Admin */}
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-[#14141c] hover:bg-[#1e1e2d] text-orange-400 hover:text-orange-300 font-bold px-4 py-2.5 rounded-xl border border-orange-500/30 hover:border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.15)] transition text-xs"
              title="Open Questions & Arena Admin Panel"
            >
              <FileCode2 size={16} /> Questions Admin <ExternalLink size={13} />
            </button>

            {/* Current Logged in User Badge */}
            <div className="flex items-center gap-2.5 bg-[#111116] border border-purple-500/30 px-3.5 py-2 rounded-xl text-xs">
              <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <UserCheck size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-white font-bold leading-none">{currentUser.name || 'Master SuperAdmin'}</span>
                <span className="text-[10px] text-purple-400 font-mono leading-tight mt-0.5">{currentUser.email || 'Root'}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/25 hover:border-red-500/50 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
              title="Logout from Admin Terminal"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Search size={18} /></span>
            <input 
              type="text" 
              placeholder="Search users by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition"
            />
          </div>
          <div className="text-xs text-gray-400 font-mono flex items-center gap-2 self-end sm:self-center">
            <span>Role Legend:</span>
            <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">👑 SuperAdmin</span>
            <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">🛡️ Admin</span>
            <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">👨‍🏫 Teacher</span>
            <span className="text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded border border-gray-500/20">🎓 Student</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Users</p>
              <h2 className="text-4xl font-black text-white mt-1">{stats.totalUsers}</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users size={28} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Active Teachers</p>
              <h2 className="text-4xl font-black text-white mt-1">{stats.activeTeachers}</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
              <ShieldCheck size={28} className="text-purple-500" />
            </div>
          </div>
          <div className="bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Exams</p>
              <h2 className="text-4xl font-black text-white mt-1">{stats.totalExams}</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              <FileCode2 size={28} className="text-green-500" />
            </div>
          </div>
          <div className="bg-[#111]/80 backdrop-blur-xl border border-[#222] rounded-2xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Revenue</p>
              <h2 className="text-4xl font-black text-white mt-1">₹ {stats.totalRevenue}</h2>
            </div>
            <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <IndianRupee size={28} className="text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div className="bg-[#111]/80 backdrop-blur-xl border border-yellow-500/30 rounded-[2rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] mb-10">
            <div className="flex items-center justify-between mb-8 border-b border-[#222] pb-6">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <ShieldAlert className="text-yellow-500" size={28} /> Action Required: Pending Payments
                </h3>
                <p className="text-gray-400 text-sm mt-1">Verify UTR numbers with your bank and approve to upgrade users to PRO.</p>
              </div>
              <div className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full font-bold text-sm border border-yellow-500/20">
                {pendingPayments.length} Pending
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222] text-gray-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 font-bold">User</th>
                    <th className="py-4 px-4 font-bold">UTR / Ref No.</th>
                    <th className="py-4 px-4 font-bold">Amount</th>
                    <th className="py-4 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {pendingPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-[#1a1a1a] transition group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <User size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{payment.User?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 font-mono">{payment.User?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20 tracking-wider text-sm font-bold">
                          {payment.utrNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white font-bold">₹ {payment.amount}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleApprovePayment(payment.id)}
                          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition shadow-lg flex items-center gap-2 ml-auto"
                        >
                          <CheckCircle size={16} /> Approve & Notify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daily Quotes & Funny Lines Manager Section */}
        <div className="mb-10 bg-[#111]/80 backdrop-blur-xl border border-amber-500/30 rounded-[2rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(234,179,8,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#222] pb-6 mb-6 gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    Hero Section Daily Lines & Coder Quotes
                    <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-500/30 font-mono">
                      {quotes.length} Quotes Saved
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Manage the daily quote or funny coder line shown above the main title on the landing page.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (showAddQuote) {
                  setShowAddQuote(false);
                  setEditingQuoteId(null);
                  setQuoteForm({ text: '', author: '', category: 'funny', makeActive: true });
                } else {
                  setShowAddQuote(true);
                  setEditingQuoteId(null);
                  setQuoteForm({ text: '', author: '', category: 'funny', makeActive: true });
                }
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] transition shrink-0 cursor-pointer text-sm"
            >
              {showAddQuote ? <X size={16}/> : <Plus size={16}/>} 
              {showAddQuote ? 'Close Form' : '+ Add New Line / Quote'}
            </button>
          </div>

          {/* Live Preview Box */}
          {quotes.find(q => q.isActive) && (
            <div className="mb-6 p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> LIVE ON LANDING PAGE
                </span>
                <span className="text-white font-medium italic">
                  "{quotes.find(q => q.isActive)?.text}"
                </span>
                <span className="text-amber-400/80 font-mono text-xs shrink-0">
                  — {quotes.find(q => q.isActive)?.author || 'Anonymous'}
                </span>
              </div>
              <button 
                onClick={() => fetchQuotes()}
                className="text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-mono shrink-0"
                title="Refresh Quotes"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          )}

          {/* Add / Edit Form */}
          {showAddQuote && (
            <div className="bg-[#0f0e0b] border border-amber-500/40 rounded-2xl p-6 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.15)] relative z-10 animate-fade-in">
              <h4 className="text-lg font-black text-amber-400 mb-4 tracking-wide flex items-center gap-2">
                <Edit2 size={18}/> {editingQuoteId ? 'Edit Daily Quote / Coder Line' : 'Create New Daily Quote / Funny Line'}
              </h4>

              <form onSubmit={handleSaveQuote} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">
                    Quote or Funny Coder Line Text*
                  </label>
                  <textarea 
                    rows={2}
                    required
                    value={quoteForm.text}
                    onChange={e => setQuoteForm({...quoteForm, text: e.target.value})}
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 outline-none transition text-sm leading-relaxed"
                    placeholder="e.g. Why do programmers prefer dark mode? Because light attracts bugs. 🐛"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">
                      Author / Attribution (Optional)
                    </label>
                    <input 
                      type="text"
                      value={quoteForm.author}
                      onChange={e => setQuoteForm({...quoteForm, author: e.target.value})}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-amber-400 outline-none text-sm"
                      placeholder="e.g. Linus Torvalds, Coder Vibe, or Anonymous"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">
                      Category
                    </label>
                    <select
                      value={quoteForm.category}
                      onChange={e => setQuoteForm({...quoteForm, category: e.target.value})}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-amber-400 outline-none text-sm cursor-pointer"
                    >
                      <option value="funny">🐛 Funny / Coder Joke</option>
                      <option value="wisdom">💡 Tech Wisdom / Philosophy</option>
                      <option value="quote">🚀 Motivational / Tech Quote</option>
                      <option value="joke">⚡ Daily Coder Vibe</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="makeActive"
                    checked={quoteForm.makeActive}
                    onChange={e => setQuoteForm({...quoteForm, makeActive: e.target.checked})}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#181818] border-white/20 cursor-pointer"
                  />
                  <label htmlFor="makeActive" className="text-sm text-gray-300 font-medium cursor-pointer">
                    Set as <strong className="text-amber-400">Active on Landing Page</strong> immediately
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddQuote(false);
                      setEditingQuoteId(null);
                    }}
                    className="px-5 py-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={savingQuote}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black px-6 py-2 rounded-xl text-sm transition shadow-[0_0_15px_rgba(234,179,8,0.3)] flex items-center gap-2 cursor-pointer"
                  >
                    {savingQuote ? 'Saving...' : (editingQuoteId ? 'Update Quote' : 'Publish Quote')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quotes List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-[#222]">
                  <th className="pb-4 pl-4 font-bold">Status</th>
                  <th className="pb-4 font-bold">Category</th>
                  <th className="pb-4 font-bold">Quote / Line</th>
                  <th className="pb-4 font-bold">Author</th>
                  <th className="pb-4 font-bold text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {loadingQuotes ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading quotes...
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-mono">
                      No daily quotes created yet. Click "+ Add New Line / Quote" to create one.
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-[#1a1a1a]/80 transition-colors group">
                      
                      {/* Active Status */}
                      <td className="py-4 pl-4">
                        {quote.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <button
                            onClick={() => handleActivateQuote(quote.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer"
                            title="Click to make this the active line on Landing Page"
                          >
                            Set Active
                          </button>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          quote.category === 'funny' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          quote.category === 'wisdom' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          quote.category === 'quote' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {quote.category === 'funny' ? '🐛 FUNNY' :
                           quote.category === 'wisdom' ? '💡 WISDOM' :
                           quote.category === 'quote' ? '🚀 QUOTE' : '⚡ TECH'}
                        </span>
                      </td>

                      {/* Quote Text */}
                      <td className="py-4 max-w-md">
                        <p className="text-white text-sm font-medium leading-relaxed group-hover:text-amber-300 transition">
                          "{quote.text}"
                        </p>
                      </td>

                      {/* Author */}
                      <td className="py-4">
                        <span className="text-xs text-gray-400 font-mono">
                          {quote.author || 'Anonymous'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditQuote(quote)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition"
                            title="Edit Quote"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                            title="Delete Quote"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Table Grid */}
        {renderUserTable("Registered Teachers & Admins", teachersList, true)}
        {renderUserTable("Registered Students", studentsList, false)}
      </div>
    </div>
  );
}
