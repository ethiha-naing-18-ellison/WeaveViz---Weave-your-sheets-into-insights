import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardBuilder } from '@/pages/DashboardBuilder';
import { Login } from '@/pages/Login';
import { Datasets } from '@/pages/Datasets';
import { useAuthStore } from '@/store/useAuthStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/datasets" 
            element={isAuthenticated ? <Datasets /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <DashboardBuilder /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
