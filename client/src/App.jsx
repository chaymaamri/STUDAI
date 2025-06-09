import React, { useState, useEffect, useContext } from 'react';
import { Box } from '@mui/material';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Bar from './components/Bar';
import ChatWidget from './components/Chatpo';
import BodyText from './components/BodyText';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ToDoList from './components/ToDoList';
import ListUniv from './components/ListUniv';
import Univ from './components/Univ';
import Documents from './components/Documents';
import ChatAcad from './components/ChatAcad';
import ScheduleUpload from './components/ScheduleUpload';
import Timetable from './components/Timetable';
import TestAuth from './components/Test';
import Dashboard from './components/Dashboard';
import NotificationPopup from './components/NotificationPopup';
import CourseUpload from './components/CourseUpload';
import AdminLayout from './admin/AdmonLayout';
import AdminSignIn from './admin/AdminSignIn';
import ProfileForm from './components/Profile';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function AppContent() {
  // Ce composant se trouve à l'intérieur du AuthProvider
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000); // Cache après 5 secondes
    }, 500000); // Affiche toutes les 100 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && user.role === "admin" && !location.pathname.startsWith("/admin")) {
      navigate("/admin");
    }
  }, [user, location.pathname, navigate]);
  return (
    <Box sx={{ fontFamily: 'Arial', minHeight: '100vh', display: 'flex', flexDirection: 'column', marginTop: '65px' }}>
      { !location.pathname.startsWith('/admin') && <Bar /> }
      <Routes>
        {/* Routes publiques et utilisateur */}
        <Route path="/" element={<BodyText />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<ProfileForm />} />
        <Route path="/emplois" element={<ScheduleUpload />} />
        <Route path="/time" element={<Timetable />} />
        <Route path="/todo" element={<ToDoList />} />
        <Route path="/universite/:name" element={<Univ />} />
        <Route path="/share" element={<ListUniv />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/ChatAcad" element={<ChatAcad />} />
        <Route path="/test" element={<TestAuth />} />
        <Route path="/courses" element={<CourseUpload />} />
        <Route path="/dashboard" element={
          user 
            ? (user.role === "admin" ? <Navigate to="/admin" /> : <Dashboard />)
            : <Navigate to="/dashboard" />
        } />

        {/* Route de connexion admin */}
        <Route path="/admin/signin" element={<AdminSignIn />} />

        {/* Route admin protégée */}
        <Route path="/admin/*" element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        } />
      </Routes>
      {location.pathname === '/' && (
        <>
        
        </>
      )}
      {user && <ChatWidget userName={user.nomPrenom} />}
      {showNotification && <NotificationPopup onClose={() => setShowNotification(false)} />}
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
