import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import SettingsMenu from '../SettingsMenu/SettingsMenu';
import './Layout.css';

const Layout = () => {
    const location = useLocation();

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
                        <button className="icon-btn">
                            <i className="bi bi-bell"></i>
                        </button>
                        <SettingsMenu />
                    </div>
                </div>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
