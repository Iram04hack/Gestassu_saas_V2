import React, { useState, useEffect } from 'react';
import AttestationsService from '../../../services/attestationsService';
import CompagniesService from '../../../services/compagnies';
import CoreService from '../../../services/core';
import AttestationModal from './AttestationModal';
import BordereauModal from './BordereauModal';
import AssignationModal from './AssignationModal';
import TrackingModal from './TrackingModal';
import './AttestationsList.css';

const AttestationsList = () => {
    const [attestations, setAttestations] = useState([]);
    const [compagnies, setCompagnies] = useState([]);
    const [agences, setAgences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Filtres et recherche
    const [searchTable, setSearchTable] = useState('');
    const [activeTab, setActiveTab] = useState('653');
    const [filterEtat, setFilterEtat] = useState('all');
    const [filterCompagnie, setFilterCompagnie] = useState('all');
    const [filterAgence, setFilterAgence] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showStateFilterMenu, setShowStateFilterMenu] = useState(false);

    // Statistiques
    const [statsRose, setStatsRose] = useState({ neutre: 0, utilise: 0, endommage: 0 });
    const [statsJaune, setStatsJaune] = useState({ neutre: 0, utilise: 0, endommage: 0 });

    // Modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBordereauOpen, setIsBordereauOpen] = useState(false);
    const [isAssignationOpen, setIsAssignationOpen] = useState(false);

    const [editingAttestation, setEditingAttestation] = useState(null);
    const [isTrackingOpen, setIsTrackingOpen] = useState(false);
    const [trackingId, setTrackingId] = useState(null);

    // Nouvel état pour le mode d'affichage (liste ou lots)
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'lots'
    const [lots, setLots] = useState([]);

    useEffect(() => {
        if (viewMode === 'lots') {
            fetchLots();
        }
    }, [viewMode, activeTab]);

    const fetchLots = async () => {
        try {
            const params = { type_attestation: activeTab };
            const response = await AttestationsService.getReferences(params);
            setLots(response.data || []);
        } catch (error) {
            console.error("Erreur chargement lots", error);
        }
    };

    const handleBatchClick = (lotRef) => {
        if (!lotRef) return;
        setSearchTable(lotRef.toString());
        setViewMode('list');
    };

    // Sélection
    const [selectedIds, setSelectedIds] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchInitialData();
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAttestations();
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTable, activeTab, filterEtat, filterCompagnie, filterAgence]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchInitialData = async () => {
        try {
            // setLoading(true); // Don't block the table for filters
            const [compRes, agenceRes] = await Promise.all([
                CompagniesService.getCompagnies(),
                CoreService.getAgences()
            ]);
            setCompagnies(Array.isArray(compRes) ? compRes : compRes.results || []);
            setAgences(Array.isArray(agenceRes) ? agenceRes : agenceRes.results || []);
        } catch (error) {
            console.error("Erreur lors du chargement des données", error);
        } finally {
            // setLoading(false);
        }
    };

    const fetchAttestations = async () => {
        try {
            setLoading(true); // Start loading immediately to clear old view
            // setAttestations([]); // Optional: Clear old data immediately if desired, but loading spinner covers it anyway

            const params = {
                type_attestation: activeTab
            };

            if (searchTable) {
                params.search = searchTable;
            }

            if (filterEtat !== 'all') {
                params.Etat_attestation = filterEtat;
            }
            if (filterCompagnie !== 'all') {
                params.id_compagnie = filterCompagnie;
            }
            if (filterAgence) {
                params.CodeAgence = filterAgence;
            }

            const response = await AttestationsService.getAll(params);
            const data = response.data.results || response.data || [];

            // Artificial delay to show loading state if response is too fast? No, user wants it fast.
            // But we must ensure the 'No data' message doesn't flash.
            setAttestations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur lors du chargement des attestations", error);
            setAttestations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await AttestationsService.getStats();
            const stats = response.data || [];

            // Calculer les stats pour Rose (653)
            const roseStats = stats.filter(s => s.type_attestation === '653');
            setStatsRose({
                neutre: roseStats.find(s => s.Etat_attestation === 0)?.count || 0,
                utilise: roseStats.find(s => s.Etat_attestation === 1)?.count || 0,
                endommage: roseStats.find(s => s.Etat_attestation === 2)?.count || 0
            });

            // Calculer les stats pour Jaune (652)
            const jauneStats = stats.filter(s => s.type_attestation === '652');
            setStatsJaune({
                neutre: jauneStats.find(s => s.Etat_attestation === 0)?.count || 0,
                utilise: jauneStats.find(s => s.Etat_attestation === 1)?.count || 0,
                endommage: jauneStats.find(s => s.Etat_attestation === 2)?.count || 0
            });
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques", error);
        }
    };

    const handleReset = () => {
        setSearchTable('');
        setFilterEtat('all');
        setFilterCompagnie('all');
        setFilterAgence('');
        setSelectedIds([]);
        setShowFilters(false);
        setShowStateFilterMenu(false);
        fetchInitialData();
        fetchStats();
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(currentItems.map(a => a.id_attestation));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleAssignSelection = (data) => {
        AttestationsService.assignSelection({
            attestation_ids: selectedIds,
            ...data
        }).then(() => {
            setSelectedIds([]);
            fetchAttestations();
            fetchStats();
            setIsAssignationOpen(false);
            alert("Attestations assignées avec succès !");
        }).catch(err => {
            console.error(err);
            alert("Erreur lors de l'assignation");
        });
    };

    const handleDeleteSelection = async () => {
        if (selectedIds.length === 0) {
            alert("Veuillez sélectionner au moins une attestation");
            return;
        }

        if (!window.confirm(`Supprimer ${selectedIds.length} attestation(s) ?`)) return;

        try {
            await AttestationsService.deleteSelection(selectedIds);
            setSelectedIds([]);
            fetchAttestations();
            fetchStats();
        } catch (error) {
            console.error("Erreur lors de la suppression", error);
            alert("Erreur lors de la suppression");
        }
    };

    const handleDoubleClick = (attestation) => {
        setTrackingId(attestation.id_attestation);
        setIsTrackingOpen(true);
    };

    const getEtatBadge = (etat) => {
        const badges = {
            0: { label: 'Neutre', className: 'badge-neutre' },
            1: { label: 'Utilisé', className: 'badge-utilise' },
            2: { label: 'Endommagé', className: 'badge-endommage' }
        };
        const badge = badges[etat] || badges[0];
        return <span className={`badge-etat ${badge.className}`}>{badge.label}</span>;
    };

    const StatCard = ({ title, stats, total, color }) => {
        const pNeutre = total > 0 ? (stats.neutre / total) * 100 : 0;
        const pUtilise = total > 0 ? (stats.utilise / total) * 100 : 0;
        const pEndommage = total > 0 ? (stats.endommage / total) * 100 : 0;

        return (
            <div className="compact-stat-card">
                <div className="stat-card-header">
                    <h4>{title}</h4>
                    <span className="total-count">{total}</span>
                </div>

                <div className="distribution-bar">
                    <div className="segment pink" style={{ width: `${pNeutre}%` }} title={`Neutre: ${stats.neutre}`}></div>
                    <div className="segment green" style={{ width: `${pUtilise}%` }} title={`Utilisé: ${stats.utilise}`}></div>
                    <div className="segment orange" style={{ width: `${pEndommage}%` }} title={`Endommagé: ${stats.endommage}`}></div>
                </div>

                <div className="stat-legend">
                    <div className="legend-item">
                        <span className="dot pink"></span>
                        <span className="label">Neutre</span>
                        <span className="value">{stats.neutre}</span>
                    </div>
                    <div className="legend-item">
                        <span className="dot green"></span>
                        <span className="label">Utilisé</span>
                        <span className="value">{stats.utilise}</span>
                    </div>
                    <div className="legend-item">
                        <span className="dot orange"></span>
                        <span className="label">Endommagé</span>
                        <span className="value">{stats.endommage}</span>
                    </div>
                </div>
            </div>
        );
    };

    const totalRose = statsRose.neutre + statsRose.utilise + statsRose.endommage;
    const totalJaune = statsJaune.neutre + statsJaune.utilise + statsJaune.endommage;

    const currentStats = activeTab === '653' ? statsRose : statsJaune;
    const totalCurrent = currentStats.neutre + currentStats.utilise + currentStats.endommage;

    // Filtrage local pour la recherche
    const filteredAttestations = attestations.filter(att => {
        const searchTerm = searchTable.toLowerCase().trim();

        // Filter by Search
        if (!searchTerm) return true;

        const numAtt = att.Num_attestation?.toString().toLowerCase() || '';
        const refLot = att.ref_lot?.toString().toLowerCase() || '';
        const idAtt = att.id_attestation?.toString().toLowerCase() || '';

        const matchesSearch = numAtt.includes(searchTerm) ||
            refLot.includes(searchTerm) ||
            idAtt.includes(searchTerm);

        // Filter by Agency (Server-side now)
        // const matchesAgence = ... (handled by API)

        // Filter by State (Local) - RESTORED
        const matchesEtat = filterEtat === 'all' || att.Etat_attestation.toString() === filterEtat;

        return matchesSearch && matchesEtat;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttestations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAttestations.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Rendu de la vue par lots (Grille de cartes)
    const renderLotsView = () => (
        <div className="lots-grid-container px-4 py-4">
            {lots.length > 0 ? (
                <div className="lots-grid">
                    {lots.map((lot, idx) => (
                        <div key={idx} className="lot-card" onClick={() => handleBatchClick(lot.ref_lot)}>
                            <div className="lot-card-header">
                                <div className="lot-icon">
                                    <i className="bi bi-collection"></i>
                                </div>
                                <div className="lot-count">
                                    {lot.count} attestations
                                </div>
                            </div>
                            <div className="lot-card-body">
                                <h3>{lot.ref_lot || "Sans Référence"}</h3>
                                <p className="lot-date">
                                    <i className="bi bi-calendar3"></i>
                                    {new Date(lot.date_enreg).toLocaleDateString('fr-FR', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div className="lot-card-footer">
                                <span>Voir le détail</span>
                                <i className="bi bi-arrow-right"></i>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <p>Aucun lot trouvé</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="attestations-container">
            {/* Header Strip */}
            <div className="attestations-header-strip">
                <h1>Liste des attestations</h1>
            </div>

            {/* Toolbar */}
            <div className="attestations-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher une attestation..."
                        value={searchTable}
                        onChange={(e) => setSearchTable(e.target.value)}
                    />
                </div>

                <div className="attestations-actions-group">
                    {/* View Mode Toggle */}
                    <div className="view-mode-toggle" style={{ display: 'flex', gap: '5px' }}>
                        <button
                            className={`btn-icon-simple ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Vue Liste"
                            style={{
                                padding: '8px',
                                border: 'none',
                                background: 'transparent',
                                color: viewMode === 'list' ? '#6d4c41' : '#ccc',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            <i className="bi bi-list-ul"></i>
                        </button>
                        <button
                            className={`btn-icon-simple ${viewMode === 'lots' ? 'active' : ''}`}
                            onClick={() => setViewMode('lots')}
                            title="Vue par Lots"
                            style={{
                                padding: '8px',
                                border: 'none',
                                background: 'transparent',
                                color: viewMode === 'lots' ? '#6d4c41' : '#ccc',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            <i className="bi bi-grid-3x3-gap-fill"></i>
                        </button>
                    </div>

                    <div className="tab-switcher">
                        <button
                            className={`tab-btn ${activeTab === '653' ? 'active' : ''}`}
                            onClick={() => setActiveTab('653')}
                        >
                            Rose
                        </button>
                        <button
                            className={`tab-btn ${activeTab === '652' ? 'active' : ''}`}
                            onClick={() => setActiveTab('652')}
                        >
                            Jaune
                        </button>
                    </div>

                    <div className="filter-group-advanced">
                        <button
                            className={`btn-icon-action ${filterEtat !== 'all' ? 'active' : ''}`}
                            onClick={() => setShowStateFilterMenu(!showStateFilterMenu)}
                            title="Filtrer"
                        >
                            <i className="bi bi-funnel"></i>
                        </button>

                        {showStateFilterMenu && (
                            <div className="state-filter-popover">
                                <div className="popover-header">Filtrer par état</div>
                                <div className="popover-content">
                                    <button
                                        className={`filter-item ${filterEtat === 'all' ? 'selected' : ''}`}
                                        onClick={() => { setFilterEtat('all'); setShowStateFilterMenu(false); }}
                                    >
                                        <span>Tous</span>
                                        <span className="badge-count-filter">{totalCurrent}</span>
                                    </button>
                                    <button
                                        className={`filter-item ${filterEtat === '0' ? 'selected' : ''}`}
                                        onClick={() => { setFilterEtat('0'); setShowStateFilterMenu(false); }}
                                    >
                                        <span>Neutre</span>
                                        <span className="badge-count-filter">{currentStats.neutre}</span>
                                    </button>
                                    <button
                                        className={`filter-item ${filterEtat === '1' ? 'selected' : ''}`}
                                        onClick={() => { setFilterEtat('1'); setShowStateFilterMenu(false); }}
                                    >
                                        <span>Utilisé</span>
                                    </button>
                                    <button
                                        className={`filter-item ${filterEtat === '2' ? 'selected' : ''}`}
                                        onClick={() => { setFilterEtat('2'); setShowStateFilterMenu(false); }}
                                    >
                                        <span>Endommagé</span>
                                    </button>
                                    <div className="filter-divider"></div>

                                    <div className="filter-section">
                                        <label>Compagnie</label>
                                        <select
                                            value={filterCompagnie}
                                            onChange={(e) => setFilterCompagnie(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="all">Toutes</option>
                                            {compagnies.map(c => (
                                                <option key={c.id_compagnie} value={c.id_compagnie}>
                                                    {c.nom_compagnie}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="filter-section">
                                        <label>Agence</label>
                                        <select
                                            value={filterAgence}
                                            onChange={(e) => setFilterAgence(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="">Toutes</option>
                                            {agences.map(agence => (
                                                <option key={agence.codeagence} value={agence.codeagence}>
                                                    {agence.nomagence}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="btn-icon-action" title="Réinitialiser" onClick={handleReset}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>



                    <button className="btn-bordereau" onClick={() => setIsBordereauOpen(true)}>
                        <i className="bi bi-file-earmark-text"></i>
                        Bordereau
                    </button>

                    <button className="btn-new" onClick={() => setIsModalOpen(true)}>
                        <i className="bi bi-plus-lg"></i>
                        Nouvelle attestation
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {viewMode === 'list' ? (
                <div className="attestations-main-content">
                    {/* Table Section */}
                    <div className="table-section">
                        {selectedIds.length > 0 && (
                            <div className="selection-toolbar">
                                <span>{selectedIds.length} attestation(s) sélectionnée(s)</span>
                                <div className="selection-actions">
                                    <button className="btn-action-toolbar assign" onClick={() => setIsAssignationOpen(true)}>
                                        <i className="bi bi-person-check-fill"></i>
                                        Assigner la sélection
                                    </button>
                                    <button className="btn-action-toolbar delete" onClick={handleDeleteSelection}>
                                        <i className="bi bi-trash-fill"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="table-container">
                            {loading ? (
                                <div className="loading">
                                    <i className="bi bi-hourglass-split"></i>
                                    <p>Chargement des attestations...</p>
                                </div>
                            ) : (
                                <table className="attestations-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    onChange={handleSelectAll}
                                                    checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                                                />
                                            </th>
                                            <th>Type</th>
                                            <th>N° attestation</th>
                                            <th>
                                                État
                                                <span className="header-count-badge">
                                                    {filterEtat === 'all' ? totalCurrent : (
                                                        filterEtat === '0' ? currentStats.neutre :
                                                            filterEtat === '1' ? currentStats.utilise :
                                                                currentStats.endommage
                                                    )}
                                                </span>
                                            </th>
                                            <th>Date enreg.</th>
                                            <th>Ref. Lot</th>
                                            <th>Compagnie</th>
                                            <th>Agence</th>
                                            <th>Remarque</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((att) => (
                                                <tr
                                                    key={att.id_attestation}
                                                    onDoubleClick={() => handleDoubleClick(att)}
                                                    className="clickable-row"
                                                >
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(att.id_attestation)}
                                                            onChange={() => handleSelectOne(att.id_attestation)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </td>
                                                    <td>
                                                        <span className={`badge-type ${att.type_attestation === '653' || att.type_attestation === 'Attestation rose' ? 'rose' : 'jaune'}`}>
                                                            {att.type_attestation === '653' || att.type_attestation === 'Attestation rose' ? 'Rose' : 'Jaune'}
                                                        </span>
                                                    </td>
                                                    <td><strong>{att.Num_attestation}</strong></td>
                                                    <td>{getEtatBadge(att.Etat_attestation)}</td>
                                                    <td>{new Date(att.date_enreg).toLocaleDateString('fr-FR')}</td>
                                                    <td>{att.ref_lot}</td>
                                                    <td>{att.nom_compagnie || att.id_compagnie}</td>
                                                    <td>{att.nom_agence || att.CodeAgence || '-'}</td>
                                                    <td>{att.Remarque_attestation || '-'}</td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <button
                                                                className="btn-action-round edit"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingAttestation(att);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                title="Modifier"
                                                            >
                                                                <i className="bi bi-pencil-square"></i>
                                                            </button>
                                                            <button
                                                                className="btn-action-round track"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDoubleClick(att);
                                                                }}
                                                                title="Historique"
                                                            >
                                                                <i className="bi bi-clock-history"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="10" className="text-center">
                                                    <div className="empty-state">
                                                        <i className="bi bi-inbox"></i>
                                                        <p>Aucune attestation trouvée</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredAttestations.length > 0 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredAttestations.length)} sur {filteredAttestations.length} éléments
                                </div>
                                <div className="pagination-controls">
                                    <button
                                        className="page-btn"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        className="page-btn"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {isModalOpen && (
                        <AttestationModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setEditingAttestation(null);
                            }}
                            onSuccess={() => {
                                fetchAttestations();
                                fetchStats();
                                fetchInitialData();
                            }}
                            attestation={editingAttestation}
                            currentUser={currentUser}
                        />
                    )}

                    {isBordereauOpen && (
                        <BordereauModal
                            isOpen={isBordereauOpen}
                            onClose={() => setIsBordereauOpen(false)}
                            compagnies={compagnies}
                        />
                    )}

                    {isAssignationOpen && (
                        <AssignationModal
                            isOpen={isAssignationOpen}
                            onClose={() => setIsAssignationOpen(false)}
                            onAssign={handleAssignSelection}
                            count={selectedIds.length}
                        />
                    )}

                    {isTrackingOpen && (
                        <TrackingModal
                            isOpen={isTrackingOpen}
                            onClose={() => {
                                setIsTrackingOpen(false);
                                setTrackingId(null);
                            }}
                            attestationId={trackingId}
                        />
                    )}
                </div>
            ) : (
                renderLotsView()
            )}

        </div >
    );
};

export default AttestationsList;
