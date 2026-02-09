import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login/Login';
import CRM from './pages/CRM/CRM';
import Compagnies from './pages/Compagnies/Compagnies';
import Dashboard from './pages/Dashboard/Dashboard';
import Layout from './components/Layout/Layout';
import './App.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Routes protégées avec Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/compagnies" element={<Compagnies />} />
            <Route path="/catalogue" element={<div>Module Catalogue (À venir)</div>} />
            <Route path="/contrats" element={<div>Module Contrats (À venir)</div>} />
            <Route path="/finances" element={<div>Module Finances (À venir)</div>} />
            <Route path="/reversement" element={<div>Module Reversement (À venir)</div>} />
            <Route path="/sinistres" element={<div>Module Sinistres (À venir)</div>} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
