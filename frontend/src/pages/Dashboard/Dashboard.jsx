import React, { useEffect, useState } from 'react';
import AuthService from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        // Debug Log
        console.log("Dashboard mount. Current User:", currentUser);
        console.log("Local Storage User Raw:", localStorage.getItem('user'));

        if (!currentUser) {
            // console.warn("No current user found in Dashboard. displaying specific error.");
            navigate('/login');
            // Allow render but show a warning
        } else {
            setUser(currentUser);
        }
    }, [navigate]);

    if (!user) return null; // Prevent crash by waiting for user state

    // Mock Data for Charts/Stats - Updated to match Desktop App Data where possible
    const stats = [
        { label: 'Prospects', value: 246, color: 'bg-orange-500', icon: 'bi-people', trend: '+12%' },
        { label: 'Souscripteurs', value: 284, color: 'bg-indigo-500', icon: 'bi-person-check-fill', trend: '+5%' },
        { label: 'Projets en cours', value: 32, color: 'bg-blue-600', icon: 'bi-folder-symlink', trend: '-2%' },
        { label: 'Contrats', value: 449, color: 'bg-teal-500', icon: 'bi-file-earmark-text', trend: '+8%' },
    ];

    const bestLessons = [ // Mapping "Best Lessons" from mockup to "Top Products" for context
        { name: 'Multirisque Habitation', value: 95.4, color: '#3b82f6' },
        { name: 'Assurance Auto', value: 85.3, color: '#6366f1' },
        { name: 'Responsabilité Civile', value: 64.7, color: '#ec4899' },
        { name: 'Santé', value: 84.2, color: '#10b981' },
    ];

    return (
        <div className="dashboard-container">
            {/* Main Section */}
            <div className="dashboard-main">
                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="banner-content">
                        <h1>Bonjour {user.nom}!</h1>
                        <p>Vous avez 3 nouvelles tâches aujourd'hui. C'est beaucoup de travail, alors commençons !</p>
                        <a href="#" className="review-link">Voir les tâches</a>
                    </div>
                    <div className="banner-image">
                        <img src="/illustration-work.png" alt="Work" onError={(e) => e.target.style.display = 'none'} />
                        {/* Placeholder for illustration if no image */}
                        <i className="bi bi-laptop banner-icon-placeholder"></i>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className={`stat-icon ${stat.color}`}>
                                <i className={`bi ${stat.icon}`}></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                                <span className={`stat-trend ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.trend} par rapport au mois dernier
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Performance & Charts Section */}
                <div className="performance-section">
                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Contrats par produit (Top 4)</h3>
                            <button className="btn-tout-voir">Tout voir</button>
                        </div>
                        <div className="bar-chart-container">
                            <div className="products-list">
                                {bestLessons.map((item, index) => (
                                    <div key={index} className="product-item">
                                        <div className="product-info">
                                            <span className="product-name">{item.name}</span>
                                            <span className="product-value">{item.value}%</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${item.value}%`, backgroundColor: item.color }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="card-header">
                            <h3>Répartition par compagnie</h3>
                            <select className="period-select">
                                <option>Annuelle</option>
                            </select>
                        </div>
                        <div className="donut-charts-container gap-8">
                            {/* CSS Donut 1 - Sanlam */}
                            <div className="donut-item">
                                <div className="donut-chart" style={{ background: 'conic-gradient(#10b981 45%, #d1fae5 0)' }}>
                                    <div className="donut-hole flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold">45%</span>
                                    </div>
                                </div>
                                <span className="donut-label mt-2">Sanlam</span>
                            </div>

                            {/* CSS Donut 2 - AXA */}
                            <div className="donut-item">
                                <div className="donut-chart" style={{ background: 'conic-gradient(#3b82f6 35%, #bfdbfe 0)' }}>
                                    <div className="donut-hole flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold">35%</span>
                                    </div>
                                </div>
                                <span className="donut-label mt-2">AXA</span>
                            </div>

                            {/* CSS Donut 3 - Sunu */}
                            <div className="donut-item">
                                <div className="donut-chart" style={{ background: 'conic-gradient(#f97316 20%, #ffedd5 0)' }}>
                                    <div className="donut-hole flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold">20%</span>
                                    </div>
                                </div>
                                <span className="donut-label mt-2">Sunu</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Items / Linked Agents */}
                <div className="recent-section">
                    <div className="card-header">
                        <h3>Derniers Dossiers</h3>
                        <a href="#" className="see-all">Voir tout</a>
                    </div>
                    <div className="list-items">
                        <div className="list-item">
                            <div className="item-avatar bg-red-100 text-red-600">JD</div>
                            <div className="item-details">
                                <span className="item-name">Jean Dupont</span>
                                <span className="item-desc">Assurance Auto - Devis en cours</span>
                            </div>
                            <div className="item-actions">
                                <button className="btn-icon"><i className="bi bi-envelope"></i></button>
                                <button className="btn-icon"><i className="bi bi-telephone"></i></button>
                            </div>
                        </div>
                        <div className="list-item">
                            <div className="item-avatar bg-blue-100 text-blue-600">AM</div>
                            <div className="item-details">
                                <span className="item-name">Alice Martin</span>
                                <span className="item-desc">Multirisque Habitation - Validé</span>
                            </div>
                            <div className="item-actions">
                                <button className="btn-icon"><i className="bi bi-envelope"></i></button>
                                <button className="btn-icon"><i className="bi bi-telephone"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Calendar/Events) */}
            <div className="dashboard-sidebar">
                <div className="calendar-widget">
                    <div className="card-header">
                        <h3>Calendrier</h3>
                        <select className="period-select">
                            <option>Aujourd'hui</option>
                        </select>
                    </div>
                    {/* Simplified List View for Calendar Events */}
                    <div className="event-timeline">
                        <div className="timeline-item active">
                            <div className="time">10:00</div>
                            <div className="event-card primary">
                                <span className="event-title">Réunion Équipe</span>
                                <span className="event-time">10:00 - 11:00</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="time">13:00</div>
                            <div className="event-card secondary">
                                <span className="event-title">Rdv Client M. Thomas</span>
                                <span className="event-time">13:00 - 14:00</span>
                            </div>
                        </div>
                        <div className="timeline-item">
                            <div className="time">15:30</div>
                            <div className="event-card tertiary">
                                <span className="event-title">Appel Partenaire AXA</span>
                                <span className="event-time">15:30 - 16:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="upcoming-events">
                    <div className="card-header">
                        <h3>Événements à venir</h3>
                        <a href="#" className="see-all">Voir tout</a>
                    </div>
                    <div className="upcoming-list">
                        <div className="upcoming-item">
                            <div className="upcoming-icon">
                                <i className="bi bi-bell-fill"></i>
                            </div>
                            <div className="upcoming-info">
                                <span className="upcoming-title">Formation Produit Auto</span>
                                <span className="upcoming-date">14 Décembre 2024 - 10:00</span>
                            </div>
                            <button className="btn-more"><i className="bi bi-three-dots-vertical"></i></button>
                        </div>
                        <div className="upcoming-item">
                            <div className="upcoming-icon secondary">
                                <i className="bi bi-laptop"></i>
                            </div>
                            <div className="upcoming-info">
                                <span className="upcoming-title">Webinaire Nouveaux Outils</span>
                                <span className="upcoming-date">21 Décembre 2024 - 11:00</span>
                            </div>
                            <button className="btn-more"><i className="bi bi-three-dots-vertical"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
