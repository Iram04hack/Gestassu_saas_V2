import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthService from '../../services/auth';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const user = AuthService.getCurrentUser();

    const isActive = (path) => {
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    const menuItems = [
        { path: '/dashboard', label: 'Tableau de bord', icon: 'bi-grid-fill' }, // Changed to grid for Dashboard
        { path: '/crm', label: 'CRM', icon: 'bi-people-fill' },
        { path: '/compagnies', label: 'Compagnies', icon: 'bi-building' },
        { path: '/catalogue', label: 'Catalogue', icon: 'bi-journal-bookmark-fill' },
        { path: '/contrats', label: 'Contrats', icon: 'bi-file-earmark-text-fill' },
        { path: '/finances', label: 'Finances', icon: 'bi-cash-coin' },
        { path: '/reversement', label: 'Reversement', icon: 'bi-arrow-left-right' },
        { path: '/sinistres', label: 'Sinistres', icon: 'bi-exclamation-triangle-fill' },
    ];

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = '/login';
    };

    return (
        <aside className="smart-sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <i className="bi bi-shield-check"></i>
                </div>
                <div className="logo-text">GestAssu</div>
            </div>

            <nav className="sidebar-content">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li key={item.path} className="nav-item">
                            <Link to={item.path} className={`nav-link ${isActive(item.path)}`}>
                                <span className="icon-wrapper">
                                    <i className={`bi ${item.icon}`}></i>
                                </span>
                                <span className="link-text">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    {/* Using the first letter of the name as avatar if no image */}
                    <div className="avatar-placeholder">
                        {user?.nom?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info-text">
                        <span className="user-name">{user?.nom || 'Utilisateur'}</span>
                        <span className="user-role">{user?.role || 'Agent'}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn" title="Déconnexion">
                    <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
