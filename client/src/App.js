import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientLogin from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import PatientDashboard from './pages/PatientDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import MedicineShop from './pages/MedicineShop';
import Orders from './pages/Orders';
import AIHealthAssistant from './pages/AIHealthAssistant';
import PaymentPage from './pages/PaymentPage';
import VideoCall from './pages/VideoCall';
import FloatingChatbot from './components/FloatingChatbot';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Doctor Routes */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/register" element={<DoctorRegister />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          
          {/* Patient Routes */}
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Common Routes */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/medicines" element={<MedicineShop />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/video-call" element={<VideoCall />} />
          
          {/* AI Chatbot Route */}
          <Route path="/ai-assistant" element={<AIHealthAssistant />} />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Floating Chatbot - Available on all pages */}
        <FloatingChatbot />
      </div>
    </Router>
  );
}

export default App;
