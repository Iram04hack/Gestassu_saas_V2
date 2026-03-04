import React, { useState, useEffect } from 'react';
import { getContratsByClient, getCompagnies, getAgences, getGroupesProduits } from '../../services/contrats';
import CustomSelect from '../../components/CustomSelect/CustomSelect';

const ClientContracts = ({ clientId }) => {
    const [contrats, setContrats] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [agences, setAgences] = useState([]);
    const [groupesProduits, setGroupesProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        compagnie: '',
        agence: '',
        groupeProduit: '',
    });

    useEffect(() => { loadReferenceData(); }, []);
    useEffect(() => { loadContrats(); }, [clientId, filters.compagnie, filters.agence, filters.groupeProduit]);

    const loadReferenceData = async () => {
        try {
            const [c, a, g] = await Promise.all([getCompagnies(), getAgences(), getGroupesProduits()]);
            setCompagnies(c.results || c || []);
            setAgences(a.results || a || []);
            setGroupesProduits(g.results || g || []);
        } catch (err) { console.error('Erreur chargement références:', err); }
    };

    const loadContrats = async () => {
        try {
            setLoading(true); setError(null);
            const params = {};
            if (filters.compagnie) params.Id_compagnie = filters.compagnie;
            if (filters.agence) params.CodeAgence = filters.agence;
            if (filters.groupeProduit) params.produit__code_groupe_prod = filters.groupeProduit;
            const data = await getContratsByClient(clientId, params);
            let results = data.results || data || [];
            if (filters.search) {
                const s = filters.search.toLowerCase();
                results = results.filter(c =>
                    (c.numPolice?.toLowerCase().includes(s)) ||
                    (c.numPolice_assureur?.toLowerCase().includes(s)) ||
                    (c.nom_produit?.toLowerCase().includes(s))
                );
            }
            setContrats(results);
        } catch (err) {
            console.error('Erreur chargement contrats:', err);
            setError('Impossible de charger les contrats');
        } finally { setLoading(false); }
    };

    const handleResetFilters = () => setFilters({ search: '', compagnie: '', agence: '', groupeProduit: '' });

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';
    const formatMontant = (m) => (m || m === 0) ? new Intl.NumberFormat('fr-FR').format(m) : '-';

    const getStatutClass = (s) => {
        switch (s) {
            case 'Actif': return 'badge-actif';
            case 'Projet': return 'badge-projet';
            case 'Suspendu': return 'badge-suspendu';
            case 'Résilié': return 'badge-resilie';
            default: return '';
        }
    };

    const compagnieOptions = compagnies.map(c => ({ value: String(c.id_compagnie), label: c.nom_compagnie }));
    const agenceOptions = agences.map(a => ({ value: String(a.codeagence), label: a.nomagence }));
    const groupeOptions = groupesProduits.map(g => ({ value: String(g.code_groupe_prod), label: g.lib_groupe_prod }));

    return (
        <div className="client-contracts">
            <style>{`
                .client-contracts { padding: 20px; }
                .contracts-title { font-size: 1rem; color: #6d4c41; margin-bottom: 14px; font-weight: 600; }

                /* ── Barre de filtres ── */
                .filters-bar {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 14px;
                    align-items: center;
                    flex-wrap: nowrap;
                }

                /* Recherche — prend l'espace restant */
                .filter-search {
                    position: relative;
                    flex: 1;
                    min-width: 0;
                }
                .filter-search-icon {
                    position: absolute; left: 11px; top: 50%;
                    transform: translateY(-50%);
                    color: #a1887f; font-size: 0.8rem; pointer-events: none;
                }
                .filter-search-input {
                    width: 100%;
                    padding: 9px 12px 9px 30px;
                    border: 1px solid #d7ccc8; border-radius: 8px;
                    font-size: 0.9rem; background: #fff; color: #3e2723;
                    outline: none; box-sizing: border-box;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .filter-search-input::placeholder { color: #bdbdbd; }
                .filter-search-input:hover { border-color: #a1887f; }
                .filter-search-input:focus { border-color: #6d4c41; box-shadow: 0 0 0 3px rgba(109,76,65,0.1); }

                /* CustomSelect dans les filtres — taille fixe */
                .filter-cs { flex: 0 0 auto; min-width: 160px; max-width: 210px; }
                /* CustomSelect pleine largeur (groupe produit) */
                .filter-cs-full { flex: 1; min-width: 0; }

                .filter-btn {
                    flex: 0 0 auto;
                    display: flex; align-items: center; gap: 5px;
                    padding: 9px 14px; border-radius: 8px;
                    font-size: 0.9rem; cursor: pointer;
                    font-weight: 500; white-space: nowrap;
                    transition: all 0.2s; border: 1px solid #d7ccc8;
                }
                .filter-btn-apply { background: #efebe9; color: #6d4c41; }
                .filter-btn-apply:hover { background: #e8ddd9; border-color: #a1887f; }
                .filter-btn-reset { background: transparent; color: #8d6e63; }
                .filter-btn-reset:hover { background: #f5f0ee; border-color: #a1887f; color: #5d4037; }

                /* ── Tableau ── */
                .table-responsive {
                    overflow-x: auto;
                    background: #fff; border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    border: 1px solid #f0e8e4;
                }
                .contracts-table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 950px; }
                .contracts-table th {
                    padding: 10px 10px; text-align: left;
                    font-weight: 600; color: #8d6e63; font-size: 0.74rem;
                    border-bottom: 2px solid #efebe9;
                    white-space: nowrap; background: #fafaf9;
                    letter-spacing: 0.4px; text-transform: uppercase;
                }
                .contracts-table td {
                    padding: 10px 10px; border-bottom: 1px solid #f5f0ee;
                    font-size: 0.84rem; color: #4e342e;
                }
                .contracts-table tr:last-child td { border-bottom: none; }
                .contracts-table tbody tr:hover { background: #fdf8f6; }

                .badge { padding: 3px 9px; border-radius: 11px; font-size: 0.69rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
                .badge-actif { background: #e8f5e9; color: #2e7d32; }
                .badge-projet { background: #fff8e1; color: #f9a825; }
                .badge-suspendu { background: #fbe9e7; color: #d84315; }
                .badge-resilie { background: #eceff1; color: #546e7a; }

                .loading-state, .error-state { text-align: center; padding: 40px; color: #8d6e63; font-size: 0.88rem; }
                .error-state { color: #d32f2f; }
            `}</style>

            <h3 className="contracts-title">Liste des contrats du client</h3>

            {/* Ligne 1 : groupe de produit seul */}
            <div className="filters-bar">
                <div className="filter-cs-full">
                    <CustomSelect
                        name="groupeProduit"
                        value={filters.groupeProduit}
                        onChange={(e) => setFilters(prev => ({ ...prev, groupeProduit: e.target.value }))}
                        options={groupeOptions}
                        placeholder="— Groupe de produit d'assurance —"
                    />
                </div>
            </div>

            {/* Ligne 2 : recherche + compagnie + agence + boutons */}
            <div className="filters-bar">
                <div className="filter-search">
                    <i className="bi bi-search filter-search-icon"></i>
                    <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Rechercher un projet/contrat"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') loadContrats(); }}
                    />
                </div>

                <div className="filter-cs">
                    <CustomSelect
                        name="compagnie"
                        value={filters.compagnie}
                        onChange={(e) => setFilters(prev => ({ ...prev, compagnie: e.target.value }))}
                        options={compagnieOptions}
                        placeholder="— Compagnie —"
                    />
                </div>

                <div className="filter-cs">
                    <CustomSelect
                        name="agence"
                        value={filters.agence}
                        onChange={(e) => setFilters(prev => ({ ...prev, agence: e.target.value }))}
                        options={agenceOptions}
                        placeholder="— Agence —"
                    />
                </div>

                <button className="filter-btn filter-btn-apply" onClick={loadContrats}>
                    <i className="bi bi-funnel"></i> Filtrer
                </button>
                <button className="filter-btn filter-btn-reset" onClick={handleResetFilters}>
                    <i className="bi bi-arrow-counterclockwise"></i> Réinitialiser
                </button>
            </div>

            {loading ? (
                <div className="loading-state"><i className="bi bi-hourglass-split"></i> Chargement...</div>
            ) : error ? (
                <div className="error-state">{error}</div>
            ) : (
                <div className="table-responsive">
                    <table className="contracts-table">
                        <thead>
                            <tr>
                                <th>Statut</th>
                                <th>N° Police</th>
                                <th>N° Avenant</th>
                                <th>Date</th>
                                <th>Produit</th>
                                <th>Type doc.</th>
                                <th>Type contrat</th>
                                <th>Compagnie</th>
                                <th>Effet</th>
                                <th>Échéance</th>
                                <th>Prime Totale</th>
                                <th>Enreg. par</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contrats.length === 0 ? (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: 'center', padding: '28px', color: '#a1887f' }}>
                                        Aucun contrat trouvé
                                    </td>
                                </tr>
                            ) : contrats.map(contrat => (
                                <tr key={contrat.id_contrat}>
                                    <td><span className={`badge ${getStatutClass(contrat.statut)}`}>{contrat.statut}</span></td>
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
                                    <td>{contrat.nom_utilisateur_save || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClientContracts;
