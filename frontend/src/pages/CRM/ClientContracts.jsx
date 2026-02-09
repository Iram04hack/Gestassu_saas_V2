import React, { useState, useEffect } from 'react';
import { getContratsByClient, getCompagnies, getAgences, getGroupesProduits } from '../../services/contrats';

const ClientContracts = ({ clientId }) => {
    const [contrats, setContrats] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [agences, setAgences] = useState([]);
    const [groupesProduits, setGroupesProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtres
    const [filters, setFilters] = useState({
        search: '',
        compagnie: '',
        agence: '',
        groupeProduit: '',
    });

    // Charger les listes de référence au montage
    useEffect(() => {
        loadReferenceData();
    }, []);

    // Charger les contrats quand le client ou les filtres changent
    useEffect(() => {
        loadContrats();
    }, [clientId, filters.compagnie, filters.agence, filters.groupeProduit]);

    const loadReferenceData = async () => {
        try {
            const [compagniesData, agencesData, groupesData] = await Promise.all([
                getCompagnies(),
                getAgences(),
                getGroupesProduits(),
            ]);
            setCompagnies(compagniesData.results || compagniesData || []);
            setAgences(agencesData.results || agencesData || []);
            setGroupesProduits(groupesData.results || groupesData || []);
        } catch (err) {
            console.error('Erreur chargement références:', err);
        }
    };

    const loadContrats = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (filters.compagnie) params.Id_compagnie = filters.compagnie;
            if (filters.agence) params.CodeAgence = filters.agence;
            if (filters.groupeProduit) params.produit__code_groupe_prod = filters.groupeProduit;
            // Note: la recherche textuelle (search) est gérée localement pour l'instant pour la réactivité,
            // sauf si on veut déclencher un appel API à chaque frappe (avec debounce).
            // On peut aussi passer params.search si le backend le gère.

            const data = await getContratsByClient(clientId, params);
            let results = data.results || data || [];

            // Filtrage local pour la recherche texte
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                results = results.filter(c =>
                    (c.numPolice && c.numPolice.toLowerCase().includes(searchLower)) ||
                    (c.numPolice_assureur && c.numPolice_assureur.toLowerCase().includes(searchLower)) ||
                    (c.nom_produit && c.nom_produit.toLowerCase().includes(searchLower))
                );
            }

            setContrats(results);
        } catch (err) {
            console.error('Erreur chargement contrats:', err);
            setError('Impossible de charger les contrats');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        // Le filtrage 'search' est appliqué dans loadContrats après fetch, 
        // mais ici on doit déclencher un re-render. 
        // Comme loadContrats est appelé par useEffect sur filtres "structurels" (selects),
        // pour search, on peut soit ajouter search aux deps de useEffect, 
        // soit filtrer juste pour l'affichage sans recharger si on a déjà tout chargé.
        // MAIS comme on filtre serveur pour les autres, on risque d'avoir des incohérences.
        // Pour faire simple : on peut recharger. 
        // Ou mieux : on ne met search dans les deps QUE si on veut search serveur.
        // Ici j'ai implémenté le filtrage SEARCH en local DANS loadContrats, donc il faut rappeler loadContrats.
        // Ajoutons search aux deps du useEffect.
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            compagnie: '',
            agence: '',
            groupeProduit: '',
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const formatMontant = (montant) => {
        if (!montant && montant !== 0) return '-';
        return new Intl.NumberFormat('fr-FR').format(montant);
    };

    const getStatutBadgeClass = (statut) => {
        switch (statut) {
            case 'Actif': return 'badge-actif';
            case 'Projet': return 'badge-projet';
            case 'Suspendu': return 'badge-suspendu';
            case 'Résilié': return 'badge-resilie';
            default: return '';
        }
    };

    return (
        <div className="client-contracts">
            <style>{`
                .client-contracts { padding: 20px; }
                .contracts-header { margin-bottom: 20px; }
                .contracts-title { font-size: 1.1rem; color: #6d4c41; margin-bottom: 15px; font-weight: 500; }
                
                .filters-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 15px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                
                .filter-group-produit {
                    flex: 1;
                    min-width: 200px;
                }
                
                .search-bar {
                    flex: 2;
                    min-width: 250px;
                    position: relative;
                }
                
                .search-icon {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #a1887f;
                }
                
                .search-input {
                    width: 100%;
                    padding: 8px 12px 8px 35px;
                    border: 1px solid #d7ccc8;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    background: #fff;
                }
                
                .filter-select {
                    padding: 8px 30px 8px 12px; /* Extra padding for arrow */
                    border: 1px solid #d7ccc8;
                    border-radius: 20px;
                    background: #fff;
                    font-size: 0.9rem;
                    color: #5d4037;
                    min-width: 140px;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236d4c41%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px top 50%;
                    background-size: 10px auto;
                }

                .actions-group {
                    display: flex;
                    gap: 8px;
                }
                
                .btn-action {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border: none;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                
                .btn-filter {
                    background: #efebe9;
                    color: #6d4c41;
                }
                
                .btn-reset {
                    background: transparent;
                    color: #8d6e63;
                }
                .btn-reset:hover {
                    color: #5d4037;
                    background: #f5f5f5;
                }

                .table-responsive {
                    overflow-x: auto;
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .contracts-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1000px; }
                .contracts-table th {
                    padding: 12px 10px;
                    text-align: left;
                    font-weight: 600;
                    color: #8d6e63;
                    font-size: 0.8rem;
                    border-bottom: 2px solid #efebe9;
                    white-space: nowrap;
                    background: #fafafa;
                }
                .contracts-table th i { margin-left: 5px; opacity: 0.5; font-size: 0.75rem; cursor: pointer; }
                .contracts-table td {
                    padding: 12px 10px;
                    border-bottom: 1px solid #f5f5f5;
                    font-size: 0.85rem;
                    color: #4e342e;
                }
                .badge { padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
                .badge-actif { background: #e8f5e9; color: #2e7d32; }
                .badge-projet { background: #fff8e1; color: #f9a825; }
                .badge-suspendu { background: #fbe9e7; color: #d84315; }
                .badge-resilie { background: #eceff1; color: #546e7a; }
                
                .loading-state, .error-state { text-align: center; padding: 40px; color: #8d6e63; }
                .error-state { color: #d32f2f; }
            `}</style>

            <div className="contracts-header">
                <h3 className="contracts-title">Liste des contrats du client</h3>

                <div className="filters-row">
                    <div className="filter-group-produit">
                        <select
                            className="filter-select"
                            style={{ width: '100%' }}
                            value={filters.groupeProduit}
                            onChange={(e) => setFilters(prev => ({ ...prev, groupeProduit: e.target.value }))}
                        >
                            <option value="">Groupe de produit d'assurance</option>
                            {groupesProduits.map(g => (
                                <option key={g.code_groupe_prod} value={g.code_groupe_prod}>
                                    {g.lib_groupe_prod}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filters-row">
                    <div className="search-bar">
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Rechercher un projet/contrat"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') loadContrats();
                            }}
                        />
                    </div>

                    <select
                        className="filter-select"
                        value={filters.compagnie}
                        onChange={(e) => setFilters(prev => ({ ...prev, compagnie: e.target.value }))}
                    >
                        <option value="">Compagnie</option>
                        {compagnies.map(c => (
                            <option key={c.id_compagnie} value={c.id_compagnie}>{c.nom_compagnie}</option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={filters.agence}
                        onChange={(e) => setFilters(prev => ({ ...prev, agence: e.target.value }))}
                    >
                        <option value="">Agence</option>
                        {agences.map(a => (
                            <option key={a.codeagence} value={a.codeagence}>{a.nomagence}</option>
                        ))}
                    </select>

                    <div className="actions-group">
                        <button className="btn-action btn-filter" onClick={loadContrats}>
                            <i className="bi bi-funnel"></i> Filtrer
                        </button>
                        <button className="btn-action btn-reset" onClick={handleResetFilters}>
                            <i className="bi bi-arrow-counterclockwise"></i> Réinitialiser
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state"><i className="bi bi-hourglass-split"></i> Chargement des contrats...</div>
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : (
                <div className="table-responsive">
                    <table className="contracts-table">
                        <thead>
                            <tr>
                                <th>Statut <i className="bi bi-funnel"></i></th>
                                <th>N° Police <i className="bi bi-funnel"></i></th>
                                <th>N° Avenant <i className="bi bi-funnel"></i></th>
                                <th>Date <i className="bi bi-calendar"></i></th>
                                <th>Produit <i className="bi bi-funnel"></i></th>
                                <th>Type doc. <i className="bi bi-funnel"></i></th>
                                <th>Type contrat <i className="bi bi-funnel"></i></th>
                                <th>Compagnie <i className="bi bi-funnel"></i></th>
                                <th>Effet <i className="bi bi-calendar"></i></th>
                                <th>Échéance <i className="bi bi-calendar"></i></th>
                                <th>Prime Totale <i className="bi bi-key"></i></th>
                                <th>Enreg.Par <i className="bi bi-funnel"></i></th>
                            </tr>
                        </thead>
                        <tbody>
                            {contrats.length === 0 ? (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: 'center', padding: '30px', color: '#a1887f' }}>
                                        Aucun contrat trouvé pour cette recherche
                                    </td>
                                </tr>
                            ) : (
                                contrats.map(contrat => (
                                    <tr key={contrat.id_contrat}>
                                        <td>
                                            <span className={`badge ${getStatutBadgeClass(contrat.statut)}`}>
                                                {contrat.statut}
                                            </span>
                                        </td>
                                        <td>{contrat.numPolice || '-'}</td>
                                        <td>{contrat.numAvenant || '-'}</td>
                                        <td>{formatDate(contrat.date_enreg)}</td>
                                        <td>{contrat.nom_produit || '-'}</td>
                                        <td>{contrat.type_doc || '-'}</td>
                                        <td>{contrat.type_contrat || '-'}</td>
                                        <td>{contrat.nom_compagnie || '-'}</td>
                                        <td>{formatDate(contrat.date_effet)}</td>
                                        <td>{formatDate(contrat.Date_echeance)}</td>
                                        <td style={{ fontWeight: 600 }}>{formatMontant(contrat.prime_totale)}</td>
                                        <td>{contrat.IDUTILISATEUR_save || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClientContracts;
