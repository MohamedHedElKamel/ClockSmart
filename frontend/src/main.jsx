import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import Attendance from './pages/Attendance.jsx';
import Leave from './pages/Leave.jsx';
import Dashboard from './Dashboard.jsx';
import AiChat from './AiChat.jsx';
import AdminPanel from './AdminPanel.jsx';
import keycloak from './keycloak.js';

keycloak.init({ onLoad: 'login-required' })
  .then((authenticated) => {
    if (authenticated) {
      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leave" element={<Leave />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="assistant" element={<AiChat />} />
                <Route path="admin" element={<AdminPanel />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </StrictMode>
      );
    } else {
      console.log('Not authenticated');
    }
  })
  .catch((error) => {
    console.error('Keycloak init failed', error);
  });