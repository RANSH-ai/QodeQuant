import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CreatorDashboard from './components/CreatorDashboard';
import StudentDashboard from './components/StudentDashboard';
import MonitoringDashboard from './components/MonitoringDashboard';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import SuperAdminPanel from './components/SuperAdminPanel';
import AdminLogin from './components/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import ArenaExam from './components/ArenaExam';
import CompilerDashboard from './components/CompilerDashboard';
import WhiteboardPage from './components/WhiteboardPage';

import TodoDashboard from './components/TodoDashboard';
import CourseDashboard from './components/CourseDashboard';
import CourseViewer from './components/CourseViewer';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreatorDashboard />} />
            <Route path="/compiler/:lang" element={<CompilerDashboard />} />
            <Route path="/exam/:examId" element={<StudentDashboard />} />
            <Route path="/arena/:track/:level" element={<StudentDashboard isArena={true} />} />
            <Route path="/monitor/:examId" element={<MonitoringDashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Dedicated Secret Admin & SuperAdmin Authentication Terminal */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Role-Based Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/superadmin" 
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperAdminPanel />
                </ProtectedRoute>
              } 
            />

            <Route path="/whiteboard" element={<WhiteboardPage />} />
            <Route path="/todo" element={<TodoDashboard />} />
            <Route path="/courses" element={<CourseDashboard />} />
            <Route path="/course-viewer/:courseId" element={<CourseViewer />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
