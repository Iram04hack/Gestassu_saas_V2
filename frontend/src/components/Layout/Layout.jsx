import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import SettingsMenu from '../SettingsMenu/SettingsMenu';
import BordereauModal from '../BordereauModal/BordereauModal';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isBordereauModalOpen, setIsBordereauModalOpen] = useState(false);

    // Determine the page title based on the path
    const menuItems = [
        { path: '/dashboard', label: 'Tableau de bord' },
        { path: '/crm', label: 'CRM' },
        { path: '/compagnies', label: 'Compagnies' },
        { path: '/catalogue', label: 'Catalogue' },
        { path: '/contrats', label: 'Contrats' },
        { path: '/finances', label: 'Finances' },
        { path: '/reversement', label: 'Reversement' },
        { path: '/sinistres', label: 'Sinistres' },
    ];

    const pageTitle = menuItems.find(item => location.pathname.startsWith(item.path))?.label || 'GestAssu';

    return (
        <div className="layout-container">
            {/* New Smart Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="main-content">
                <div className="top-bar">
                    <div className="top-actions">
                        <button
                            className="top-link-btn"
                            onClick={() => navigate('/agenda')}
                        >
                            <i className="bi bi-calendar3"></i>
                            <span>Agenda</span>
                        </button>
                        <button
                            className="top-link-btn"
                            onClick={() => {
                                console.log("Bordereaux button clicked, setting isOpen to true");
                                setIsBordereauModalOpen(true);
                            }}
                        >
                            <i className="bi bi-file-earmark-spreadsheet"></i>
                            <span>Bordereaux</span>
                        </button>
                        <SettingsMenu />
                    </div>
                </div>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>

            {/* Bordereau Modal */}
            <BordereauModal
                isOpen={isBordereauModalOpen}
                onClose={() => setIsBordereauModalOpen(false)}
            />
        </div>
    );
};

export default Layout;
