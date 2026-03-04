import React, { useState, useEffect } from 'react';
import { getTachesByClient } from '../../services/taches';
import TacheFormModal from './TacheFormModal';

// statut_tache: 0 = En attente, 1 = En cours, 2 = Terminé
const STATUT_TABS = [
    { key: 'all', label: 'Toutes' },
    { key: 'en_attente', label: 'En attente', int: 0 },
    { key: 'en_cours', label: 'En cours', int: 1 },
    { key: 'termine', label: 'Terminé', int: 2 },
];

const STATUT_BADGE = {
    0: { label: 'En attente', cls: 'badge-attente' },
    1: { label: 'En cours', cls: 'badge-encours' },
    2: { label: 'Terminé', cls: 'badge-termine' },
};

const ClientTasks = ({ client }) => {
    const [taches, setTaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (client) loadTaches();
    }, [client, activeTab]);

    const loadTaches = async () => {
        try {
            setLoading(true);
            const params = activeTab !== 'all' ? { statut: activeTab } : {};
            const data = await getTachesByClient(client.id || client.id_client, params);
            setTaches(data.results || data || []);
        } catch (err) {
            console.error('Erreur chargement tâches:', err);
            setError('Impossible de charger les tâches');
        } finally {
            setLoading(false);
        }
    };

    const filteredTaches = taches.filter(t =>
        !searchTerm || (t.titre_tache && t.titre_tache.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('fr-FR');
    };

    return (
        <div className="client-tasks">
            <style>{`
                .client-tasks { padding: 20px; }

                .tasks-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .tasks-search {
                    flex: 1; min-width: 220px;
                    position: relative;
                }
                .tasks-search-icon {
                    position: absolute; left: 12px; top: 50%;
                    transform: translateY(-50%);
                    color: #a1887f; font-size: 0.85rem;
                }
                .tasks-search-input {
                    width: 100%;
                    padding: 8px 14px 8px 34px;
                    border: 1.5px solid #d7ccc8;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    background: #fff;
                    color: #5d4037;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .tasks-search-input:hover { border-color: #a1887f; }
                .tasks-search-input:focus {
                    border-color: #6d4c41;
                    box-shadow: 0 0 0 3px rgba(109,76,65,0.1);
                }

                .tasks-toolbar-right { display: flex; gap: 8px; align-items: center; }

                .btn-action {
                    display: flex; align-items: center; gap: 6px;
                    padding: 7px 14px; border-radius: 20px;
                    font-size: 0.85rem; cursor: pointer;
                    transition: all 0.2s; font-weight: 500; border: none;
                }
                .btn-refresh { background: #efebe9; color: #6d4c41; border: 1.5px solid #d7ccc8; }
                .btn-refresh:hover { background: #e8ddd9; border-color: #a1887f; }
                .btn-new { background: #6d4c41; color: white; border: 1.5px solid #6d4c41; }
                .btn-new:hover { background: #5d4037; }

                .tasks-tabs {
                    display: flex; gap: 0;
                    margin-bottom: 16px;
                    border-bottom: 2px solid #e8ddd9;
                }
                .task-tab {
                    padding: 9px 20px;
                    background: transparent; border: none;
                    cursor: pointer; color: #8d6e63;
                    font-weight: 500; font-size: 0.875rem;
                    border-bottom: 3px solid transparent;
                    margin-bottom: -2px;
                    transition: all 0.2s;
                }
                .task-tab:hover { color: #6d4c41; }
                .task-tab.active {
                    color: #6d4c41;
                    border-bottom-color: #6d4c41;
                    font-weight: 600;
                }

                .tasks-table-wrap {
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    border: 1px solid #f0e8e4;
                    overflow: hidden;
                }
                .tasks-table {
                    width: 100%; border-collapse: separate; border-spacing: 0;
                }
                .tasks-table th {
                    padding: 11px 12px;
                    text-align: left; font-weight: 600;
                    color: #8d6e63; font-size: 0.76rem;
                    border-bottom: 2px solid #efebe9;
                    background: #fafaf9;
                    text-transform: uppercase; letter-spacing: 0.4px;
                    white-space: nowrap;
                }
                .tasks-table td {
                    padding: 11px 12px;
                    border-bottom: 1px solid #f5f0ee;
                    font-size: 0.85rem; color: #4e342e;
                    vertical-align: middle;
                }
                .tasks-table tr:last-child td { border-bottom: none; }
                .tasks-table tbody tr:hover { background: #fdf8f6; }

                .badge-statut { padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
                .badge-attente { background: #fff8e1; color: #f9a825; }
                .badge-encours { background: #e3f2fd; color: #1565c0; }
                .badge-termine { background: #e8f5e9; color: #2e7d32; }

                .task-color-dot {
                    display: inline-block;
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    vertical-align: middle;
                    margin-right: 6px;
                    border: 1px solid rgba(0,0,0,0.1);
                }

                .empty-state { padding: 0; }
                .empty-state-inner {
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 40px; color: #a1887f;
                }
            `}</style>

            <TacheFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                client={client}
                onSuccess={loadTaches}
            />

            <div className="tasks-toolbar">
                <div className="tasks-search">
                    <i className="bi bi-search tasks-search-icon"></i>
                    <input
                        type="text"
                        className="tasks-search-input"
                        placeholder="Rechercher une tâche"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="tasks-toolbar-right">
                    <button className="btn-action btn-refresh" onClick={loadTaches}>
                        <i className="bi bi-arrow-clockwise"></i> Actualiser
                    </button>
                    <button className="btn-action btn-new" onClick={() => setIsModalOpen(true)}>
                        <i className="bi bi-plus-circle"></i> Nouvelle tâche
                    </button>
                </div>
            </div>

            <div className="tasks-tabs">
                {STATUT_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`task-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="tasks-table-wrap">
                <table className="tasks-table">
                    <thead>
                        <tr>
                            <th>Statut</th>
                            <th>Échéance</th>
                            <th>Titre</th>
                            <th>Description</th>
                            <th>Créée le</th>
                            <th>Agent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6"><div className="empty-state-inner">Chargement...</div></td></tr>
                        ) : error ? (
                            <tr><td colSpan="6"><div className="empty-state-inner" style={{ color: '#d32f2f' }}>{error}</div></td></tr>
                        ) : filteredTaches.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state-inner">
                                        <i className="bi bi-check2-all" style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.4 }}></i>
                                        Aucune tâche trouvée
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredTaches.map(tache => {
                                const statut = STATUT_BADGE[tache.statut_tache] || { label: '-', cls: '' };
                                return (
                                    <tr key={tache.idtaches}>
                                        <td>
                                            <span className={`badge-statut ${statut.cls}`}>{statut.label}</span>
                                        </td>
                                        <td>{formatDate(tache.date_echeance_tache)}</td>
                                        <td>
                                            {tache.code_couleur && (
                                                <span
                                                    className="task-color-dot"
                                                    style={{ backgroundColor: tache.code_couleur }}
                                                />
                                            )}
                                            {tache.titre_tache}
                                        </td>
                                        <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {tache.description_tache || '-'}
                                        </td>
                                        <td>{formatDate(tache.date_creation_tache)}</td>
                                        <td>{tache.nom_utilisateur_affecte || '-'}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientTasks;
