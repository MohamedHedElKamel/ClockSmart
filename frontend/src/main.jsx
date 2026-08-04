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
import { ToastProvider } from './Toast.jsx';

keycloak.init({ onLoad: 'login-required' })
  .then((authenticated) => {
    if (authenticated) {
      setInterval(() => {
        keycloak.updateToken(70).catch(() => {
          console.warn('Failed to refresh token, logging out.');
          keycloak.logout();
        });
      }, 60000);

      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <ToastProvider>
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
          </ToastProvider>
        </StrictMode>
      );
    } else {
      console.log('Not authenticated');
    }
  })
  .catch((error) => {
    console.error('Keycloak init failed', error);
  });