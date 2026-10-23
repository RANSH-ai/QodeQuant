import { API_BASE_URL } from '../apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building2, MapPin, UploadCloud, Save, ArrowLeft, ShieldCheck, Star, Award } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    collegeName: '',
    degree: '',
    city: '',
    profilePic: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          collegeName: data.collegeName || '',
          degree: data.degree || '',
          city: data.city || '',
          profilePic: data.profilePic || null,
          role: data.role || 'student',
          isPro: data.isPro || false,
        });
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });
      if (response.ok) {
        showToastMsg('Profile updated successfully!');
      } else {
        showToastMsg('Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error('Save failed', err);
      showToastMsg('Network error. Check backend.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans relative overflow-x-hidden p-6 md:p-12">
      
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 animate-[bounce_0.5s_ease-out] font-bold ${toast.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-[#111] hover:bg-[#222] border border-[#333] rounded-xl transition text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">My Profile</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><ShieldCheck size={14} className="text-green-500" /> Account details are encrypted & secure</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 relative group/card">
            {profileData.isPro && (
              <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-600 opacity-20 blur-md group-hover/card:opacity-40 transition duration-500 animate-pulse"></div>
            )}
            <div className={`relative h-full bg-[#111]/90 backdrop-blur-xl rounded-[2rem] p-8 flex flex-col items-center text-center overflow-hidden transition-all duration-500 group-hover/card:shadow-2xl ${profileData.isPro ? 'border border-yellow-500/40 shadow-[0_10px_40px_rgba(250,204,21,0.2)]' : 'border border-[#222] shadow-[0_15px_40px_rgba(0,0,0,0.4)]'}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${profileData.isPro ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}></div>
              
              {/* Avatar Upload */}
              <div className="relative mb-6 cursor-pointer group/avatar" onClick={() => fileInputRef.current.click()}>
                
                {/* PRO Glowing Animation Border */}
                {profileData.isPro && (
                  <>
                    <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-600 animate-[spin_4s_linear_infinite] opacity-60 blur-[3px]"></div>
                    <div className="absolute inset-[-4px] rounded-full bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-600 animate-[spin_4s_linear_infinite]"></div>
                  </>
                )}

                <div 
                  className={`relative w-40 h-40 rounded-full border-4 ${profileData.isPro ? 'border-[#0a0a0a]' : 'border-[#222] group-hover/avatar:border-blue-500/50'} transition-colors overflow-hidden flex items-center justify-center bg-[#0a0a0a] z-10`}
                >
                  {profileData.profilePic ? (
                    <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-600" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <UploadCloud className="text-white mb-2" size={24} />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
                  </div>
                </div>
                
                {/* Floating PRO Badge */}
                {profileData.isPro && (
                  <div className="absolute bottom-2 right-0 z-20 bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-black text-[10px] px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)] border-2 border-[#111]">
                    PRO
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              <h2 className="text-xl font-bold text-white mb-1">{profileData.name || 'Anonymous User'}</h2>
              <p className="text-xs text-blue-400 font-mono bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-4 max-w-[95%] truncate" title={profileData.email}>{profileData.email || 'user@qodequant.com'}</p>
              <div className="flex gap-2">
                {profileData.role && (
                  <span className={`px-4 py-1 rounded-full text-xs font-bold border ${
                    profileData.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    profileData.role === 'teacher' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {profileData.role === 'admin' || profileData.role === 'teacher' ? 'Professor' : profileData.role.toUpperCase()}
                  </span>
                )}
                {profileData.isPro && (
                  <span className="px-4 py-1 rounded-full text-xs font-bold border bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400" /> PRO
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Details Form */}
          <div className="md:col-span-2 relative group/card">
            {profileData.isPro && (
              <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r from-yellow-600 via-amber-300 to-yellow-400 opacity-20 blur-md group-hover/card:opacity-40 transition duration-500 animate-pulse"></div>
            )}
            <div className={`relative h-full bg-[#111]/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 transition-all duration-500 group-hover/card:shadow-2xl ${profileData.isPro ? 'border border-yellow-500/40 shadow-[0_10px_40px_rgba(250,204,21,0.2)]' : 'border border-[#222] shadow-[0_15px_40px_rgba(0,0,0,0.4)]'}`}>
              <h3 className="text-lg font-bold text-white mb-8 border-b border-[#222] pb-4 flex items-center gap-2">
                Personal Information
              </h3>

              <div className="space-y-6">
                
                {/* Name */}
                <div className="group/input">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors group-focus-within/input:text-white">
                    <User size={14} className={profileData.isPro ? "text-yellow-500" : "text-blue-500"} /> Full Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    className={`w-full bg-[#0a0a0a] rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 hover:shadow-lg ${profileData.isPro ? 'border border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:border-yellow-500/60' : 'border border-[#333] focus:border-blue-500 focus:shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:border-[#555]'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Email */}
                  <div className="md:col-span-3 group/input">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors group-focus-within/input:text-white">
                      <Mail size={14} className={profileData.isPro ? "text-yellow-500" : "text-purple-500"} /> Gmail
                    </label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      onChange={e => setProfileData({...profileData, email: e.target.value})}
                      className={`w-full bg-[#0a0a0a] rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 hover:shadow-lg font-mono text-sm ${profileData.isPro ? 'border border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:border-yellow-500/60' : 'border border-[#333] focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-[#555]'}`}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="md:col-span-2 group/input">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors group-focus-within/input:text-white">
                      <Phone size={14} className={profileData.isPro ? "text-yellow-500" : "text-green-500"} /> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={e => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+91 9876543210"
                      className={`w-full bg-[#0a0a0a] rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 hover:shadow-lg ${profileData.isPro ? 'border border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:border-yellow-500/60' : 'border border-[#333] focus:border-green-500 focus:shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:border-[#555]'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* College Name */}
                  <div className="group/input">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors group-focus-within/input:text-white">
                      <Building2 size={14} className={profileData.isPro ? "text-yellow-500" : "text-orange-500"} /> College Name
                    </label>
                    <input 
                      type="text" 
                      value={profileData.collegeName}
                      onChange={e => setProfileData({...profileData, collegeName: e.target.value})}
                      placeholder="e.g. IIT Bombay"
                      className={`w-full bg-[#0a0a0a] rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 hover:shadow-lg ${profileData.isPro ? 'border border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:border-yellow-500/60' : 'border border-[#333] focus:border-orange-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:border-[#555]'}`}
                    />
                  </div>
                  
                  {/* Degree */}
                  <div className="group/input">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors group-focus-within/input:text-white">
                      <Award size={14} className={profileData.isPro ? "text-yellow-500" : "text-blue-500"} /> Degree / Qual.
                    </label>
                    <input 
                      type="text" 
                      value={profileData.degree}
                      onChange={e => setProfileData({...profileData, degree: e.target.value})}
                      placeholder="e.g. Ph.D. / B.Tech"
                      className={`w-full bg-[#0a0a0a] rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 hover:shadow-lg ${profileData.isPro ? 'border border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:border-yellow-500/60' : 'border border-[#333] focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-[#555]'}`}
                    />
                  </div>
                  
                  {/* City */}
                  <div className="group/input">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors group-focus-within/input:text-white">
                      <MapPin size={14} className={profileData.isPro ? "text-yellow-500" : "text-yellow-500"} /> City
                    </label>
                    <input 
                      type="text" 
                      value={profileData.city}
                      onChange={e => setProfileData({...profileData, city: e.target.value})}
                      placeholder="e.g. Mumbai"
                      className={`w-full bg-[#0a0a0a] rounded-xl px-4 py-3 text-white outline-none transition-all duration-300 hover:shadow-lg ${profileData.isPro ? 'border border-yellow-500/30 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)] hover:border-yellow-500/60' : 'border border-[#333] focus:border-yellow-500 focus:shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:border-[#555]'}`}
                    />
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-[#222] flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={`bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_5px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_10px_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

            </div>
          </div>
        </form>

        {/* Activity Heatmap Section */}
        <div className="mt-8 relative group/heatmap">
          {profileData.isPro && (
            <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r from-green-600 via-emerald-400 to-green-600 opacity-20 blur-lg group-hover/heatmap:opacity-40 transition duration-500"></div>
          )}
          <div className={`relative bg-[#111]/90 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 transition-all duration-500 group-hover/heatmap:shadow-2xl ${profileData.isPro ? 'border border-green-500/30' : 'border border-[#222]'}`}>
            <div className="flex items-center justify-between border-b border-[#222] pb-4 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                 Coding Activity
              </h3>
              <span className="text-xs text-gray-500 font-mono">Last 364 days</span>
            </div>
            
            <div className="flex justify-center overflow-x-auto pb-4 custom-scrollbar">
              <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                {Array.from({ length: 364 }).map((_, i) => {
                  // Generate dummy activity levels: mostly 0, occasionally 1-4
                  const rand = Math.random();
                  const level = rand > 0.85 ? Math.floor(Math.random() * 4) + 1 : 0;
                  return (
                    <div 
                      key={i} 
                      className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-white hover:scale-125 z-10 ${
                        level === 0 ? 'bg-[#1e1e1e]' :
                        level === 1 ? 'bg-green-900/80' :
                        level === 2 ? 'bg-green-700/80' :
                        level === 3 ? 'bg-green-500' :
                        'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                      }`}
                      title={level > 0 ? `${level * 2} submissions on this day` : 'No activity'}
                    ></div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end items-center gap-2 mt-4 text-xs text-gray-500 font-mono">
              <span>Less</span>
              <div className="w-3 h-3 rounded-[2px] bg-[#1e1e1e]"></div>
              <div className="w-3 h-3 rounded-[2px] bg-green-900/80"></div>
              <div className="w-3 h-3 rounded-[2px] bg-green-700/80"></div>
              <div className="w-3 h-3 rounded-[2px] bg-green-500"></div>
              <div className="w-3 h-3 rounded-[2px] bg-green-400"></div>
              <span>More</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
