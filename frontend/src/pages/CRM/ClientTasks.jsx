import React, { useState, useEffect } from 'react';
import { getTachesByClient } from '../../services/taches';
import TacheFormModal from './TacheFormModal';

const ClientTasks = ({ client }) => {
    const [taches, setTaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('en_attente');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (client) {
            loadTaches();
        }
    }, [client, activeTab]);

    const loadTaches = async () => {
        try {
            setLoading(true);
            const params = activeTab !== 'all' ? { statut: activeTab } : {};
            const data = await getTachesByClient(client.id, params);
            setTaches(data.results || data || []);
        } catch (err) {
            console.error('Erreur chargement tâches:', err);
            setError('Impossible de charger les tâches');
        } finally {
            setLoading(false);
        }
    };

    const filteredTaches = taches.filter(t =>
        t.titre_tache && t.titre_tache.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatutLabel = (statut) => {
        const labels = {
            'en_attente': 'En attente',
            'en_cours': 'En cours',
            'termine': 'Terminé'
        };
        return labels[statut] || statut;
    };

    return (
        <div className="client-tasks">
            <style>{`
                .client-tasks { padding: 20px; }
                .tasks-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 15px;
                }
                .search-bar {
                    flex: 1;
                    position: relative;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #999;
                }
                .search-input {
                    width: 100%;
                    padding: 8px 12px 8px 40px;
                    border: 1px solid #d7ccc8;
                    border-radius: 4px;
                    font-size: 0.9rem;
                }
                .header-actions {
                    display: flex;
                    gap: 10px;
                }
                .btn-action {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.9rem;
                }
                .btn-filter { background: #efebe9; color: #5d4037; }
                .btn-refresh { background: #efebe9; color: #5d4037; }
                .btn-new { background: #6d4c41; color: white; }
                .btn-new:hover { background: #5d4037; }
                
                .tabs-container {
                    display: flex;
                    gap: 0;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e0e0e0;
                }
                .tab {
                    padding: 10px 20px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-weight: 500;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s;
                }
                .tab.active {
                    color: #6d4c41;
                    border-bottom-color: #6d4c41;
                }
                
                .tasks-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .tasks-table th {
                    text-align: left;
                    padding: 12px;
                    background: #efebe9;
                    color: #5d4037;
                    font-weight: 600;
                    border-bottom: 2px solid #d7ccc8;
                }
                .tasks-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f5f5f5;
                }
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: #999;
                }
            `}</style>

            <TacheFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                client={client}
                onSuccess={loadTaches}
            />

            <div className="tasks-header">
                <div className="search-bar">
                    <i className="bi bi-search search-icon"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher une tâche"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="header-actions">
                    <button className="btn-action btn-filter">
                        <i className="bi bi-funnel"></i> Filtrer
                    </button>
                    <button className="btn-action btn-refresh" onClick={loadTaches}>
                        <i className="bi bi-arrow-clockwise"></i> Réinitialiser
                    </button>
                    <button className="btn-action btn-new" onClick={() => setIsModalOpen(true)}>
                        <i className="bi bi-plus-circle"></i> Nouveau
                    </button>
                </div>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'en_attente' ? 'active' : ''}`}
                    onClick={() => setActiveTab('en_attente')}
                >
                    En attente
                </button>
                <button
                    className={`tab ${activeTab === 'en_cours' ? 'active' : ''}`}
                    onClick={() => setActiveTab('en_cours')}
                >
                    En cours
                </button>
                <button
                    className={`tab ${activeTab === 'termine' ? 'active' : ''}`}
                    onClick={() => setActiveTab('termine')}
                >
                    Terminé
                </button>
            </div>

            <table className="tasks-table">
                <thead>
                    <tr>
                        <th>Statut</th>
                        <th>Échéance</th>
                        <th>Titre</th>
                        <th>Description</th>
                        <th>Client</th>
                        <th>Agent</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="empty-state">Chargement...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="7" className="empty-state" style={{ color: '#d32f2f' }}>{error}</td>
                        </tr>
                    ) : filteredTaches.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="empty-state">Aucune tâche trouvée</td>
                        </tr>
                    ) : (
                        filteredTaches.map(tache => (
                            <tr key={tache.id_tache}>
                                <td>{getStatutLabel(tache.statut)}</td>
                                <td>{tache.date_echeance ? new Date(tache.date_echeance).toLocaleDateString('fr-FR') : '-'}</td>
                                <td>{tache.titre_tache}</td>
                                <td>{tache.description_tache || '-'}</td>
                                <td>{tache.nom_client || '-'}</td>
                                <td>{tache.nom_utilisateur_affecte || '-'}</td>
                                <td>
                                    <i className="bi bi-three-dots-vertical" style={{ cursor: 'pointer' }}></i>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ClientTasks;
