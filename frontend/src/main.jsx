import 'bootstrap/dist/css/bootstrap.min.css';

import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App.jsx';

const GOOGLE_CLIENT_ID = '564328782086-14nq74v0b6fsvl4gi9senu50thflplv5.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
