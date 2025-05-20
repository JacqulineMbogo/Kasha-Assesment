// App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';

const App = () => {
  console.log('App component rendered');
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('kasha');
    if (stored) setAuth(JSON.parse(stored));
  }, []);

  const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
      localStorage.removeItem('kasha');
      navigate('/', { replace: true });
    }, [navigate]);

    return null; // You can show a spinner or "Logging out..." if you prefer
  };

  return (
    <Routes>
      <Route path="/" element={<AuthPage setAuth={setAuth} />} />
      <Route
        path="/home"
        element={
          auth?.token ? <HomePage auth={auth} /> : <Navigate to="/" replace />
        }
      />
      <Route path="/logout" element={<Logout />} />
      <Route
        path="*"
        element={<Navigate to={auth?.token ? '/home' : '/'} replace />}
      />
    </Routes>
  );
};

export default App;
