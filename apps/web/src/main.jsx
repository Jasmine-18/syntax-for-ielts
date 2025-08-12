import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import AppRoutes from './App.jsx';
import ThemeProvider from './theme/ThemeProvider';

createRoot (document.getElementById ('root')).render (
  <StrictMode>
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>

  </StrictMode>
);
