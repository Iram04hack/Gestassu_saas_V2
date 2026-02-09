import React, { useState, useEffect } from 'react';
import crmService from '../../services/crm';
import InteractionFormModal from './InteractionFormModal';

const ClientInteractions = ({ clientId, clientName }) => {
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        methode: '',
        lieu: '',
        agent: '',
    });

    useEffect(() => {
        loadInteractions();
    }, [clientId]);

    const loadInteractions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await crmService.getInteractions({ id_client: clientId });
            setInteractions(response.results || []);
        } catch (err) {
            console.error('Erreur lors du chargement des interactions:', err);
            setError('Impossible de charger les interactions.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInteraction = async (interactionData) => {
        try {
            await crmService.createInteraction({
                ...interactionData,
                id_client: clientId,
            });
            await loadInteractions();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Erreur lors de la création de l\'interaction:', err);
            alert('Impossible de créer l\'interaction.');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            methode: '',
            lieu: '',
            agent: '',
        });
    };

    const filteredInteractions = interactions.filter(interaction => {
        const matchesSearch = searchTerm === '' ||
            (interaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (interaction.type_interaction || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMethode = filters.methode === '' || interaction.type_interaction === filters.methode;
        const matchesLieu = filters.lieu === '' || (interaction.lieu || '').toLowerCase().includes(filters.lieu.toLowerCase());

        return matchesSearch && matchesMethode && matchesLieu;
    });

    return (
        <div className="client-interactions">
            {/* Toolbar */}
            <div className="interactions-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher une interaction..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={filters.methode}
                        onChange={(e) => setFilters({ ...filters, methode: e.target.value })}
                    >
                        <option value="">Toutes les méthodes</option>
                        <option value="Visite">Visite</option>
                        <option value="Appel téléphonique">Appel téléphonique</option>
                        <option value="Achat en ligne">Achat en ligne</option>
                        <option value="Courriel">Courriel</option>
                    </select>

                    <button className="btn-filter-reset" onClick={handleResetFilters} title="Réinitialiser les filtres">
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>

                    <button className="btn-new-interaction" onClick={() => setIsModalOpen(true)}>
                        <i className="bi bi-plus-lg"></i> Nouveau
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-state">
                    <i className="bi bi-hourglass-split"></i>
                    <p>Chargement des interactions...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <i className="bi bi-exclamation-triangle"></i>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="interactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Méthode</th>
                                <th>Lieu</th>
                                <th>Client</th>
                                <th>Agent</th>
                                <th>Durée</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInteractions.length > 0 ? (
                                filteredInteractions.map((interaction) => (
                                    <tr key={interaction.idinteraction}>
                                        <td>
                                            {interaction.date_heure_interaction
                                                ? new Date(interaction.date_heure_interaction).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '-'
                                            }
                                        </td>
                                        <td>{interaction.type_interaction || '-'}</td>
                                        <td>{interaction.lieu || '-'}</td>
                                        <td>{clientName}</td>
                                        <td>-</td>
                                        <td>{interaction.duree_interaction || '-'}</td>
                                        <td className="description-cell">
                                            {interaction.description || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-row">
                                        Aucune interaction trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <InteractionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateInteraction}
                clientName={clientName}
            />

            <style jsx>{`
                .client-interactions {
                    max-width: 1400px;
                }

                .interactions-toolbar {
                    background: white;
                    padding: 16px 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .search-group {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                }

                .search-group i {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #8d6e63;
                }

                .search-group input {
                    width: 100%;
                    padding: 10px 16px 10px 40px;
                    border: 1px solid #d7ccc8;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .search-group input:focus {
                    border-color: #6d4c41;
                    box-shadow: 0 0 0 3px rgba(109, 76, 65, 0.1);
                }

                .filter-group {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .filter-group select {
                    padding: 8px 16px;
                    border: 1px solid #d7ccc8;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    outline: none;
                    cursor: pointer;
                    background: white;
                }

                .btn-filter-reset {
                    width: 36px;
                    height: 36px;
                    padding: 0;
                    border: 1px solid #d7ccc8;
                    background: white;
                    color: #5d4037;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .btn-filter-reset:hover {
                    background: #efebe9;
                    border-color: #a1887f;
                    transform: rotate(180deg);
                }

                .btn-new-interaction {
                    background: #6d4c41;
                    color: white;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 50px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(109, 76, 65, 0.2);
                }

                .btn-new-interaction:hover {
                    background: #5d4037;
                    transform: translateY(-1px);
                }

                .table-container {
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .interactions-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .interactions-table th {
                    text-align: left;
                    padding: 16px 12px;
                    font-size: 0.8rem;
                    color: #8d6e63;
                    font-weight: 600;
                    border-bottom: 1px solid #eee;
                    background: #fafafa;
                }

                .interactions-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f5f5f5;
                    font-size: 0.9rem;
                    color: #3e2723;
                }

                .interactions-table tr:hover td {
                    background: #fff8e1;
                }

                .description-cell {
                    max-width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .empty-row {
                    text-align: center;
                    padding: 40px !important;
                    color: #8d6e63;
                }

                .loading-state,
                .error-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    color: #8d6e63;
                    text-align: center;
                    background: white;
                    border-radius: 12px;
                }

                .error-state {
                    color: #d32f2f;
                }

                .loading-state i,
                .error-state i {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                }
            `}</style>
        </div>
    );
};

export default ClientInteractions;
