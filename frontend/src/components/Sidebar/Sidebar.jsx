import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthService from '../../services/auth';
import logo from '../../assets/logo.png';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const user = AuthService.getCurrentUser();
    const [openMenus, setOpenMenus] = useState({});


    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path + '/') ? 'active' : '';
    };

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const menuItems = [
        {
            group: '',
            items: [
                { path: '/dashboard', label: 'Tableau de bord', icon: 'bi-grid-fill' },
                {
                    label: 'Données de base',
                    icon: 'bi-database-fill',
                    subItems: [
                        { path: '/base/categories-vehicules', label: 'Catégories de véhicules' },
                        { path: '/base/commissions', label: 'Commissions par catégorie' },
                        { path: '/base/attestations', label: 'Gestion des attestations' },
                        { path: '/base/affectation-attestations', label: 'Affectation des attestations' },
                        { path: '/base/commerciaux', label: 'Gestion des commerciaux' },
                        { path: '/base/motifs-transactions', label: 'Motifs des transactions financières' },
                    ]
                },
                { path: '/crm', label: 'Clients', icon: 'bi-people-fill' },
                { path: '/compagnies', label: 'Compagnies', icon: 'bi-building' },
                { path: '/produits', label: 'Produits', icon: 'bi-box-seam' },
            ]
        },
        {
            group: '',
            items: [
                {
                    label: 'Tarifs',
                    icon: 'bi-tags-fill',
                    subItems: [
                        { path: '/tarifs/auto', label: 'Tarif automobile' },
                        { path: '/tarifs/mrh', label: 'Tarif Multirisque Habitation' },
                    ]
                },
                {
                    label: 'Contrats',
                    icon: 'bi-file-earmark-text-fill',
                    subItems: [
                        { path: '/contrats/auto', label: 'Assurance Auto' },
                        { path: '/contrats/mrh', label: 'Assurance Multirisque Habitation' },
                        { path: '/contrats/autres-iard', label: 'Autres IARD' },
                        { path: '/contrats/vie', label: 'Assurance Vie' },
                    ]
                },
            ]
        },
        {
            group: '',
            items: [
                { path: '/quittances', label: 'Quittances', icon: 'bi-receipt' },
                { path: '/finances', label: 'Finances', icon: 'bi-cash-coin' },
                { path: '/reversement', label: 'Reversements', icon: 'bi-arrow-left-right' },
                { path: '/sinistres', label: 'Sinistre', icon: 'bi-exclamation-triangle-fill' },
            ]
        },
        {
            group: '',
            items: [
                {
                    label: 'Paramètres généraux',
                    icon: 'bi-gear-fill',
                    subItems: [
                        { path: '/parametres/agences', label: 'Gestion des agences' },
                        { path: '', label: 'Gestion des rôles' },
                        { path: '/parametres/utilisateurs', label: 'Gestion des utilisateurs' },
                    ]
                },
            ]
        }
    ];

    const handleLogout = () => {
        AuthService.logout();
        window.location.href = '/login';
    };

    return (
        <aside className="smart-sidebar">
            <nav className="sidebar-content">
                <div className="brand-section">
                    <span className="brand-primary">GESTASSU</span>
                    <span className="brand-secondary">-ASSURANCES-</span>
                    <span className="brand-tertiary">Espace d'administration</span>
                </div>
                {menuItems.map((group, groupIndex) => (
                    <div key={`group-${groupIndex}`} className="nav-group">
                        {group.group && <span className="group-label">{group.group}</span>}
                        <ul className="nav-list">
                            {group.items.map((item) => (
                                <li key={item.label} className="nav-item">
                                    {item.subItems ? (
                                        <div className="menu-group-wrapper">
                                            <button
                                                onClick={() => toggleMenu(item.label)}
                                                className={`nav-link sub-toggle ${openMenus[item.label] ? 'expanded' : ''}`}
                                            >
                                                <span className="icon-wrapper">
                                                    <i className={`bi ${item.icon}`}></i>
                                                </span>
                                                <span className="link-text">{item.label}</span>
                                                <i className={`bi bi-chevron-down arrow-icon ${openMenus[item.label] ? 'rotated' : ''}`}></i>
                                            </button>
                                            {openMenus[item.label] && (
                                                <ul className="sub-nav-list">
                                                    {item.subItems.map((subItem) => (
                                                        <li key={subItem.path} className="sub-nav-item">
                                                            <Link to={subItem.path} className={`sub-nav-link ${isActive(subItem.path)}`}>
                                                                <span className="sub-link-text">{subItem.label}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Link to={item.path} className={`nav-link ${isActive(item.path)}`}>
                                            <span className="icon-wrapper">
                                                <i className={`bi ${item.icon}`}></i>
                                            </span>
                                            <span className="link-text">{item.label}</span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile-card">
                    <div className="user-avatar">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.nom || 'U'}&background=E1CCB1&color=1a1a1b`}
                            alt="User"
                        />
                    </div>
                    <div className="user-details">
                        <div className="user-name-wrapper">
                            <span className="user-name">{user?.nom || 'Utilisateur'}</span>
                            <span className="badge-pro">PRO</span>
                        </div>
                        <span className="user-email">{user?.email || 'email@example.com'}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-icon-btn" title="Déconnexion">
                    <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
