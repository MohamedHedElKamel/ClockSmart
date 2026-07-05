import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import keycloak from './keycloak.js';

keycloak.init({ onLoad: 'login-required' })
  .then((authenticated) => {
    if (authenticated) {
      console.log('Authenticated!', keycloak.token);
      createRoot(document.getElementById('root')).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    } else {
      console.log('Not authenticated');
    }
  })
  .catch((error) => {
    console.error('Keycloak init failed', error);
  });