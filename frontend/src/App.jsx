import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login/Login';
import CRM from './pages/CRM/CRM';
import ClientDetails from './pages/CRM/ClientDetails';
import Compagnies from './pages/Compagnies/Compagnies';
import Produits from './pages/Produits/Produits';
import VehicleCategories from './pages/BaseDonnees/VehicleCategories/VehicleCategories';
import CommissionCategories from './pages/BaseDonnees/CommissionCategories/CommissionCategories';
import AttestationsList from './pages/BaseDonnees/Attestations/AttestationsList';
import AffectationAttestations from './pages/BaseDonnees/Attestations/AffectationAttestations';
import Commerciaux from './pages/Commerciaux/Commerciaux';
import CommercialDetails from './pages/Commerciaux/CommercialDetails';
import TransactionReasonsList from './pages/BaseDonnees/TransactionReasons/TransactionReasonsList';
import Dashboard from './pages/Dashboard/Dashboard';
import TarifsAuto from './pages/Tarifs/TarifsAuto/TarifsAuto';
import TarifsMRH from './pages/Tarifs/TarifsMRH/TarifsMRH';
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
            <Route path="/agenda" element={<div>Module Agenda partagé (À venir)</div>} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/clients" element={<Navigate to="/crm" replace />} />
            <Route path="/crm/client/:id" element={<ClientDetails />} />
            <Route path="/compagnies" element={<Compagnies />} />
            <Route path="/base/categories-vehicules" element={<VehicleCategories />} />
            <Route path="/base/commissions" element={<CommissionCategories />} />
            <Route path="/base/attestations" element={<AttestationsList />} />
            <Route path="/base/affectation-attestations" element={<AffectationAttestations />} />
            <Route path="/produits" element={<Produits />} />
            <Route path="/tarifs/auto" element={<TarifsAuto />} />
            <Route path="/tarifs/mrh" element={<TarifsMRH />} />
            <Route path="/contrats/auto" element={<div>Assurance Auto (À venir)</div>} />
            <Route path="/contrats/mrh" element={<div>Assurance Multirisque Habitation (À venir)</div>} />
            <Route path="/contrats/autres-iard" element={<div>Autres IARD (À venir)</div>} />
            <Route path="/contrats/vie" element={<div>Assurance Vie (À venir)</div>} />
            <Route path="/quittances" element={<div>Module Quittances (À venir)</div>} />
            <Route path="/finances" element={<div>Module Finances (À venir)</div>} />
            <Route path="/reversement" element={<div>Module Reversement (À venir)</div>} />
            <Route path="/sinistres" element={<div>Module Sinistres (À venir)</div>} />
            <Route path="/base/commerciaux" element={<Commerciaux />} />
            <Route path="/base/commerciaux/:id" element={<CommercialDetails />} />
            <Route path="/base/motifs-transactions" element={<TransactionReasonsList />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
