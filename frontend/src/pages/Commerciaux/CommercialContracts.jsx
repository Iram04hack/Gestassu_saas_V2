import React, { useState, useEffect } from 'react';
import { getContratsByClient, getCompagnies, getAgences, getGroupesProduits } from '../../services/contrats';
// Note: reusing contrats service but we might need a specific service method if the endpoint needs specific params 
// or if we want to isolate logic. For now, getContratsByClient accepts params, so we can use it.
// Actually, getContratsByClient might assume ID_Client param. Let's check api.js or use a generic getContrats.
import api from '../../services/api';

const CommercialContracts = ({ apporteurCode }) => {
    const [contrats, setContrats] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        compagnie: '',
        statut: ''
    });

    useEffect(() => {
        loadReferenceData();
    }, []);

    useEffect(() => {
        if (apporteurCode) {
            console.log("Loading contracts for apporteur:", apporteurCode);
            loadContrats();
        }
    }, [apporteurCode, filters.compagnie, filters.statut]);

    const loadReferenceData = async () => {
        try {
            const compagniesData = await getCompagnies();
            setCompagnies(compagniesData.results || compagniesData || []);
        } catch (err) {
            console.error('Erreur references:', err);
        }
    };

    const loadContrats = async () => {
        try {
            setLoading(true);

            // Construct query params
            const params = {
                code_apporteur: apporteurCode
            };
            if (filters.compagnie) params.Id_compagnie = filters.compagnie;
            // if (filters.statut) params.statut = filters.statut; // Backend support needed for status?

            // Direct API call to ensure we use the right endpoint/params
            const response = await api.get('/contrats/contrats/', { params });
            let results = response.data.results || response.data || [];

            // Local filtering for search (and status if backend doesn't support it yet)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                results = results.filter(c =>
                    (c.numPolice && c.numPolice.toLowerCase().includes(searchLower)) ||
                    (c.ID_Client && c.ID_Client.toLowerCase().includes(searchLower))
                );
            }

            setContrats(results);
        } catch (err) {
            console.error('Erreur chargement contrats apporteur:', err);
            setError('Impossible de charger les contrats.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatMontant = (montant) => {
        if (!montant && montant !== 0) return '-';
        return new Intl.NumberFormat('fr-FR').format(montant);
    };

    return (
        <div className="commercial-contracts">
            <div className="filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                    <i className="bi bi-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
                    <input
                        type="text"
                        placeholder="Rechercher (Police, Client)..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px 8px 35px', borderRadius: '20px', border: '1px solid #ddd' }}
                    />
                </div>

                <select
                    value={filters.compagnie}
                    onChange={(e) => setFilters(prev => ({ ...prev, compagnie: e.target.value }))}
                    style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #ddd', minWidth: '150px' }}
                >
                    <option value="">Toutes Compagnies</option>
                    {compagnies.map(c => (
                        <option key={c.id_compagnie} value={c.id_compagnie}>{c.nom_compagnie}</option>
                    ))}
                </select>

                <button className="btn-icon-action" onClick={loadContrats} title="Actualiser">
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><i className="bi bi-hourglass-split"></i> Chargement...</div>
            ) : error ? (
                <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
            ) : (
                <div className="table-responsive">
                    <table className="client-table"> {/* Reusing client-table class for consistent styling */}
                        <thead>
                            <tr>
                                <th>Statut</th>
                                <th>N° Police</th>
                                <th>Date</th>
                                <th>Produit</th>
                                <th>Compagnie</th>
                                <th>Client</th>
                                <th>Effet</th>
                                <th>Échéance</th>
                                <th>Prime Totale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contrats.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Aucun contrat trouvé</td>
                                </tr>
                            ) : (
                                contrats.map(contrat => (
                                    <tr key={contrat.id_contrat}>
                                        <td>
                                            <span className={`badge ${contrat.statut === 'Actif' ? 'client' : 'prospect'}`}>
                                                {contrat.statut || 'Actif'} {/* Default logic if status missing */}
                                            </span>
                                        </td>
                                        <td>{contrat.numPolice || '-'}</td>
                                        <td>{formatDate(contrat.date_enreg)}</td>
                                        <td>{contrat.nom_produit || '-'}</td>
                                        <td>{contrat.nom_compagnie || '-'}</td>
                                        <td>{contrat.ID_Client || '-'}</td>
                                        <td>{formatDate(contrat.date_effet)}</td>
                                        <td>{formatDate(contrat.Date_echeance)}</td>
                                        <td style={{ fontWeight: 'bold' }}>{formatMontant(contrat.prime_totale)} FCFA</td>
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

export default CommercialContracts;
