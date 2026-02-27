import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './app/store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#131e31',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: '"Exo 2", sans-serif',
              fontSize: '13px',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#131e31' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#131e31' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
