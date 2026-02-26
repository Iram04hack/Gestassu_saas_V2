import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContratsAuto.css';
import { getContrats, getCompagnies, getAgences } from '../../../services/contrats';
import CustomSelect from '../../../components/CustomSelect/CustomSelect';

// Helper : normalise une réponse API en tableau
const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
};

// Format date ISO -> dd/mm/yyyy
const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Classe CSS pour le badge statut
const getStatutClass = (statut) => {
    if (!statut) return 'statut-inconnu';
    const s = statut.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (s === 'actif') return 'statut-actif';
    if (s === 'projet') return 'statut-projet';
    if (s.includes('resili')) return 'statut-resilie';
    if (s.includes('suspend')) return 'statut-suspendu';
    return 'statut-inconnu';
};

// Label affiché dans le badge
const getStatutLabel = (statut) => {
    if (!statut) return '-';
    if (statut.toLowerCase() === 'actif') return 'CONTRAT';
    return statut.toUpperCase();
};

// Colonnes triables côté serveur
const SERVER_SORTABLE = new Set([
    'numPolice', 'numAvenant', 'date_acte', 'date_effet',
    'Date_echeance', 'prime_totale', 'type_contrat', 'date_enreg',
]);

const ITEMS_PER_PAGE = 20;

const ContratsAuto = () => {
    const navigate = useNavigate();

    // Données
    const [contrats, setContrats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    // Données de référence
    const [compagnies, setCompagnies] = useState([]);
    const [agences, setAgences] = useState([]);

    // Filtres (UI — appliqués uniquement au clic "Filtrer")
    const [filterCompagnie, setFilterCompagnie] = useState('');
    const [filterAgence, setFilterAgence] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDateDu, setFilterDateDu] = useState('');
    const [filterDateAu, setFilterDateAu] = useState('');
    const [filterStatut, setFilterStatut] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null); // { id, type } | null

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Tri
    const [sortField, setSortField] = useState('date_enreg');
    const [sortDir, setSortDir] = useState('desc');

    // Mémorise les derniers params envoyés (pour la pagination sans rejouer les filtres)
    const lastParamsRef = useRef(null);

    // ── Chargement (params explicites, pas de dépendances sur l'état) ─────
    const loadContrats = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        lastParamsRef.current = params;
        try {
            const data = await getContrats(params);
            setContrats(toArray(data));
            setTotalCount(data.count || 0);
        } catch (err) {
            // Affiche le traceback Python dans la console pour faciliter le débogage
            const detail = err.response?.data?.traceback || err.response?.data?.error;
            console.error('Erreur chargement contrats:', err.message);
            if (detail) console.error('Détail serveur:\n', detail);
            setError(err.response?.data?.error || 'Impossible de charger les contrats.');
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Ferme les dropdowns d'action au clic extérieur ────────────────────
    useEffect(() => {
        const close = () => setOpenDropdown(null);
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    // ── Construit les params depuis l'état courant ────────────────────────
    // Note : appelée depuis des handlers d'événements, donc l'état est à jour.
    const buildParams = (page = 1, overrides = {}) => {
        const ordering = (sortDir === 'desc' ? '-' : '') + sortField;
        const params = {
            code_groupe_prod: 'G01',
            page,
            page_size: ITEMS_PER_PAGE,
            ordering,
        };
        // estprojet est omis quand statut='projet' (les deux filtres sont en conflit :
        // estprojet=false exclurait les projets avant même que statut=projet s'applique)
        const resolvedStatut = overrides.statut !== undefined ? overrides.statut : filterStatut;
        if (resolvedStatut !== 'projet') {
            params.estprojet = 'false';
        }
        if (filterCompagnie) params.Id_compagnie = filterCompagnie;
        if (filterAgence) params.CodeAgence = filterAgence;
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (filterDateDu) params.date_effet_min = filterDateDu;
        if (filterDateAu) params.date_effet_max = filterDateAu;
        if (filterStatut) params.statut = filterStatut;
        return { ...params, ...overrides };
    };

    // ── Init : chargement des référentiels + 1ère page ───────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [comps, ags] = await Promise.all([getCompagnies(), getAgences()]);
                setCompagnies(toArray(comps));
                setAgences(toArray(ags));
            } catch (err) {
                console.error('Erreur init:', err);
            }
        };
        init();
        // Charge la 1ère page avec les paramètres par défaut
        loadContrats({
            code_groupe_prod: 'G01',
            estprojet: 'false',
            page: 1,
            page_size: ITEMS_PER_PAGE,
            ordering: '-date_enreg',
        });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Tri ──────────────────────────────────────────────────────────────
    const handleSort = (field) => {
        if (!SERVER_SORTABLE.has(field)) return;
        const newDir = (sortField === field && sortDir === 'asc') ? 'desc' : 'asc';
        setSortField(field);
        setSortDir(newDir);
        setCurrentPage(1);
        // Override ordering car setSortField/setSortDir sont async
        const ordering = (newDir === 'desc' ? '-' : '') + field;
        loadContrats(buildParams(1, { ordering }));
    };

    // ── Appliquer les filtres (bouton "Filtrer") ──────────────────────────
    const handleFilter = () => {
        setCurrentPage(1);
        loadContrats(buildParams(1));
    };

    // ── Réinitialiser tous les filtres ────────────────────────────────────
    const handleReset = () => {
        setSearchTerm('');
        setFilterCompagnie('');
        setFilterAgence('');
        setFilterStatut('');
        setFilterDateDu('');
        setFilterDateAu('');
        setSortField('date_enreg');
        setSortDir('desc');
        setCurrentPage(1);
        loadContrats({
            code_groupe_prod: 'G01',
            estprojet: 'false',
            page: 1,
            page_size: ITEMS_PER_PAGE,
            ordering: '-date_enreg',
        });
    };

    // ── Pagination ────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        loadContrats({ ...lastParamsRef.current, page: newPage });
    };

    // ── Dropdown actions ──────────────────────────────────────────────────
    const toggleDropdown = (e, id, type) => {
        e.stopPropagation();
        setOpenDropdown(prev =>
            (prev?.id === id && prev?.type === type) ? null : { id, type }
        );
    };

    const isDropdownOpen = (id, type) => openDropdown?.id === id && openDropdown?.type === type;

    // ── Icône tri ─────────────────────────────────────────────────────────
    const renderSortIcon = (field) => {
        if (!SERVER_SORTABLE.has(field)) return null;
        if (sortField !== field) return <i className="bi bi-chevron-expand sort-icon"></i>;
        return sortDir === 'asc'
            ? <i className="bi bi-chevron-up sort-icon"></i>
            : <i className="bi bi-chevron-down sort-icon"></i>;
    };

    // ════════════════════════════════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════════════════════════════════
    return (
        <div className="contrats-auto-container">

            {/* ── Header ── */}
            <div className="contrats-header-strip">
                <h1>Assurance Automobile</h1>
            </div>

            {/* ── Barre de filtres (Compagnie, Agence, Toggle Projet) ── */}
            <div className="contrats-filter-bar">
                <div className="filter-item">
                    <label>Compagnie</label>
                    <CustomSelect
                        name="filterCompagnie"
                        value={filterCompagnie}
                        onChange={e => setFilterCompagnie(e.target.value)}
                        placeholder="Compagnie"
                        options={compagnies.map(c => ({ value: c.id_compagnie, label: c.nom_compagnie }))}
                    />
                </div>
                <div className="filter-item">
                    <label>Agence</label>
                    <CustomSelect
                        name="filterAgence"
                        value={filterAgence}
                        onChange={e => setFilterAgence(e.target.value)}
                        placeholder="Agence"
                        options={agences.map(a => ({ value: a.codeagence || a.CodeAgence, label: a.nomagence || a.nom_agence }))}
                    />
                </div>
                <div className="contrats-filter-spacer"></div>
                <div className="nouveau-projet-wrapper">
                    <button
                        className="contrats-nouveau-projet-btn"
                        onClick={(e) => toggleDropdown(e, 'nouveau-projet', 'main')}
                    >
                        <i className="bi bi-plus-circle"></i>
                        Nouveau Projet
                        <i className="bi bi-caret-down-fill action-caret"></i>
                    </button>
                    {isDropdownOpen('nouveau-projet', 'main') && (
                        <div className="action-dropdown-menu nouveau-projet-menu" onClick={e => e.stopPropagation()}>
                            <button className="dropdown-item" onClick={() => navigate('/contrats/auto/nouveau')}>Affaire Nouvelle</button>
                            <button className="dropdown-item">Avenant de Changement d'Immatriculation</button>
                            <button className="dropdown-item">Avenant de Changement d'Identité</button>
                            <button className="dropdown-item">Avenant de Suspension</button>
                            <button className="dropdown-item">Avenant de Remise en Vigueur</button>
                            <button className="dropdown-item">Avenant de Résiliation</button>
                            <button className="dropdown-item">Avenant d'Incorporation</button>
                            <button className="dropdown-item">Avenant de Renouvellement</button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Toolbar (Recherche, Dates, Statut, Actions) ── */}
            <div className="contrats-toolbar">
                <div className="contrats-search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher un projet/contrat"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleFilter()}
                    />
                </div>

                <div className="contrats-date-group">
                    <label>Période du :</label>
                    <input
                        type="date"
                        value={filterDateDu}
                        onChange={e => setFilterDateDu(e.target.value)}
                    />
                </div>
                <div className="contrats-date-group">
                    <label>au :</label>
                    <input
                        type="date"
                        value={filterDateAu}
                        onChange={e => setFilterDateAu(e.target.value)}
                    />
                </div>

                <div className="contrats-statut-select">
                    <label>Statut :</label>
                    <select
                        value={filterStatut}
                        onChange={e => setFilterStatut(e.target.value)}
                    >
                        <option value="">Tous</option>
                        <option value="actif">Contrat</option>
                        <option value="projet">Projet</option>
                    </select>
                </div>

                <div className="contrats-toolbar-actions">
                    <button className="btn-filter" onClick={handleFilter}>
                        <i className="bi bi-funnel"></i> Filtrer
                    </button>
                    <button className="btn-reset" onClick={handleReset}>
                        <i className="bi bi-arrow-clockwise"></i> Réinitialiser
                    </button>
                </div>
            </div>

            {error && <div className="contrats-error-message">{error}</div>}

            {/* ════════════════════════════════════════════════════════════
                TABLE
            ════════════════════════════════════════════════════════════ */}
            <div className="contrats-table-container">
                <table className="contrats-table">
                    <colgroup>
                        <col style={{ width: '90px' }} />   {/* Statut */}
                        <col style={{ width: '125px' }} />  {/* N° Police */}
                        <col style={{ width: '55px' }} />   {/* N° Avenant */}
                        <col style={{ width: '100px' }} />  {/* N° Assureur */}
                        <col style={{ width: '88px' }} />   {/* Date acte */}
                        <col style={{ width: '140px' }} />  {/* Type doc */}
                        <col style={{ width: '80px' }} />   {/* Type contrat */}
                        <col style={{ width: '120px' }} />  {/* Compagnie */}
                        <col style={{ width: '150px' }} />  {/* Client */}
                        <col style={{ width: '88px' }} />   {/* Effet */}
                        <col style={{ width: '88px' }} />   {/* Échéance */}
                        <col style={{ width: '95px' }} />   {/* Prime Totale */}
                        <col style={{ width: '100px' }} />  {/* Enreg par */}
                        <col />                           {/* Actions (prend le reste) */}
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Statut</th>
                            <th className={`sortable${sortField === 'numPolice' ? ' sorted' : ''}`} onClick={() => handleSort('numPolice')}>
                                N° Police {renderSortIcon('numPolice')}
                            </th>
                            <th className={`sortable${sortField === 'numAvenant' ? ' sorted' : ''}`} onClick={() => handleSort('numAvenant')}>
                                N° Avenant {renderSortIcon('numAvenant')}
                            </th>
                            <th>N° Assureur</th>
                            <th className={`sortable${sortField === 'date_acte' ? ' sorted' : ''}`} onClick={() => handleSort('date_acte')}>
                                Date {renderSortIcon('date_acte')}
                            </th>
                            <th>Type doc.</th>
                            <th className={`sortable${sortField === 'type_contrat' ? ' sorted' : ''}`} onClick={() => handleSort('type_contrat')}>
                                Type contrat {renderSortIcon('type_contrat')}
                            </th>
                            <th>Compagnie</th>
                            <th>Client</th>
                            <th className={`sortable${sortField === 'date_effet' ? ' sorted' : ''}`} onClick={() => handleSort('date_effet')}>
                                Effet {renderSortIcon('date_effet')}
                            </th>
                            <th className={`sortable${sortField === 'Date_echeance' ? ' sorted' : ''}`} onClick={() => handleSort('Date_echeance')}>
                                Échéance {renderSortIcon('Date_echeance')}
                            </th>
                            <th className={`sortable${sortField === 'prime_totale' ? ' sorted' : ''}`} onClick={() => handleSort('prime_totale')}>
                                Prime Totale {renderSortIcon('prime_totale')}
                            </th>
                            <th>Enreg par</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="14" className="contrats-table-empty">
                                <i className="bi bi-hourglass-split"></i>
                                <span>Chargement des contrats...</span>
                            </td></tr>
                        ) : contrats.length === 0 ? (
                            <tr><td colSpan="14" className="contrats-table-empty">
                                <i className="bi bi-inbox"></i>
                                <span>Aucun contrat trouvé{filterCompagnie || filterStatut || searchTerm ? ' pour les filtres sélectionnés' : ''}.</span>
                            </td></tr>
                        ) : contrats.map(c => (
                            <tr key={c.id_contrat}>
                                <td>
                                    <span className={`statut-badge ${getStatutClass(c.statut)}`}>
                                        {getStatutLabel(c.statut)}
                                    </span>
                                </td>
                                <td data-tip={c.numPolice || '-'}><div className="cell-inner">{c.numPolice || '-'}</div></td>
                                <td>{c.numAvenant ?? '0'}</td>
                                <td data-tip={c.numPolice_assureur || '-'}><div className="cell-inner">{c.numPolice_assureur || '-'}</div></td>
                                <td data-tip={formatDate(c.date_acte)}><div className="cell-inner">{formatDate(c.date_acte)}</div></td>
                                <td data-tip={c.type_doc || '-'}><div className="cell-inner">{c.type_doc || '-'}</div></td>
                                <td data-tip={c.type_contrat || '-'}><div className="cell-inner">{c.type_contrat || '-'}</div></td>
                                <td data-tip={c.nom_compagnie || '-'}><div className="cell-inner">{c.nom_compagnie || '-'}</div></td>
                                <td data-tip={c.nom_client_complet || '-'}><div className="cell-inner">{c.nom_client_complet || '-'}</div></td>
                                <td data-tip={formatDate(c.date_effet)}><div className="cell-inner">{formatDate(c.date_effet)}</div></td>
                                <td data-tip={formatDate(c.Date_echeance)}><div className="cell-inner">{formatDate(c.Date_echeance)}</div></td>
                                <td className="contrats-num-cell">
                                    {c.prime_totale != null ? Number(c.prime_totale).toLocaleString('fr-FR') : '-'}
                                </td>
                                <td data-tip={c.nom_utilisateur_save || c.IDUTILISATEUR_save || '-'}><div className="cell-inner">{c.nom_utilisateur_save || c.IDUTILISATEUR_save || '-'}</div></td>
                                <td>
                                    <div className="contrats-actions">
                                        {/* Imprimer */}
                                        <div className="action-dropdown-wrapper">
                                            <button
                                                className="btn-action-icon btn-with-caret"
                                                title="Imprimer"
                                                onClick={(e) => toggleDropdown(e, c.id_contrat, 'print')}
                                            >
                                                <i className="bi bi-printer"></i>
                                                <i className="bi bi-caret-down-fill action-caret"></i>
                                            </button>
                                            {isDropdownOpen(c.id_contrat, 'print') && (
                                                <div className="action-dropdown-menu" onClick={e => e.stopPropagation()}>
                                                    <button className="dropdown-item">Conditions Particulière</button>
                                                    <button className="dropdown-item">Liste des véhicules</button>
                                                    <button className="dropdown-item">Liste des véhicules v2</button>
                                                    <button className="dropdown-item">Facture</button>
                                                    <div className="dropdown-divider" />
                                                    <button className="dropdown-item">Attestation standard</button>
                                                    <button className="dropdown-item">Attestation NSIA</button>
                                                    <button className="dropdown-item">Carte rose</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Modifier */}
                                        <div className="action-dropdown-wrapper">
                                            <button
                                                className="btn-action-icon btn-with-caret"
                                                title="Modifier"
                                                onClick={(e) => toggleDropdown(e, c.id_contrat, 'edit')}
                                            >
                                                <i className="bi bi-pencil"></i>
                                                <i className="bi bi-caret-down-fill action-caret"></i>
                                            </button>
                                            {isDropdownOpen(c.id_contrat, 'edit') && (
                                                <div className="action-dropdown-menu" onClick={e => e.stopPropagation()}>
                                                    <button className="dropdown-item">Modifier le contrat</button>
                                                    <button className="dropdown-item">Éditer le numéro police assureur</button>
                                                    <button className="dropdown-item">Régénérer le numéro de police du contrat</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Supprimer */}
                                        <button className="btn-action-icon danger" title="Supprimer">
                                            <i className="bi bi-trash"></i>
                                        </button>

                                        {/* Générer Quittance — disponible uniquement pour les projets */}
                                        <button
                                            className="btn-generer-quittance"
                                            title={c.statut?.toLowerCase() !== 'projet' ? 'Disponible uniquement pour les projets' : 'Générer une quittance'}
                                            disabled={c.statut?.toLowerCase() !== 'projet'}
                                        >
                                            <i className="bi bi-receipt"></i> Générer Quittance
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {!loading && totalCount > 0 && (
                <div className="contrats-pagination-bar">
                    <span className="contrats-pagination-info">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} sur {totalCount}
                    </span>
                    <div className="contrats-pagination-controls">
                        <button
                            className="contrats-pagination-btn"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(1)}
                            title="Première page"
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button
                            className="contrats-pagination-btn"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            title="Page précédente"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <span className="contrats-pagination-page">Page {currentPage} / {totalPages}</span>
                        <button
                            className="contrats-pagination-btn"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            title="Page suivante"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button
                            className="contrats-pagination-btn"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            title="Dernière page"
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContratsAuto;
