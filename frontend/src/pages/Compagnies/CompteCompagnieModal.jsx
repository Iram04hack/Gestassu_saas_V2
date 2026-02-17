import React, { useState, useEffect } from 'react';
import './CompteCompagnieModal.css';
import compagniesService from '../../services/compagnies';

const CompteCompagnieModal = ({ isOpen, onClose, compagnie }) => {
    const [activeTab, setActiveTab] = useState('mouvements'); // 'mouvements' | 'synthese'
    const [mouvements, setMouvements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        solde: 0,
        totalCredit: 0,
        totalDebit: 0
    });

    // Filtres de période (par défaut: mois en cours)
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    // Sous-onglet pour la synthèse
    const [syntheseSubTab, setSyntheseSubTab] = useState('debit'); // 'debit' | 'credit'

    useEffect(() => {
        // Initialiser les dates au mois en cours
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDateLocal = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setDateDebut(formatDateLocal(firstDay));
        setDateFin(formatDateLocal(lastDay));
    }, []);

    useEffect(() => {
        if (isOpen && compagnie && dateDebut && dateFin) {
            loadMouvements();
        }
    }, [isOpen, compagnie, dateDebut, dateFin]);

    const loadMouvements = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('=== DÉBUT CHARGEMENT MOUVEMENTS ===');
            console.log('Compagnie:', compagnie);
            console.log('Compagnie ID:', compagnie?.id);
            console.log('Date début:', dateDebut);
            console.log('Date fin:', dateFin);

            const data = await compagniesService.getCompagnieMouvements(compagnie.id, {
                date_debut: dateDebut,
                date_fin: dateFin
            });

            console.log('Réponse API:', data);
            console.log('Nombre de résultats:', data?.results?.length || data?.length || 0);

            const results = data.results || data || [];
            setMouvements(results);
            calculateStats(results);
        } catch (err) {
            console.error('Erreur chargement mouvements:', err);
            setError('Impossible de charger les mouvements du compte');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (mouvementsList) => {
        let totalCredit = 0;
        let totalDebit = 0;

        mouvementsList.forEach(mvt => {
            // Le serializer renvoie 'credit' et 'debit', pas 'mont_credit' et 'mont_debit'
            const creditAmount = parseFloat(mvt.credit || mvt.mont_credit || 0);
            const debitAmount = parseFloat(mvt.debit || mvt.mont_debit || 0);

            totalCredit += creditAmount;
            totalDebit += debitAmount;

            console.log('Movement:', mvt.lib_type_mvt, 'Credit:', creditAmount, 'Debit:', debitAmount);
        });

        console.log('Total Credit:', totalCredit, 'Total Debit:', totalDebit, 'Solde:', totalCredit - totalDebit);

        setStats({
            solde: totalCredit - totalDebit,
            totalCredit,
            totalDebit
        });
    };

    const formatMontant = (montant) => {
        return new Intl.NumberFormat('fr-FR').format(montant);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const handleResetFilters = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDateLocal = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setDateDebut(formatDateLocal(firstDay));
        setDateFin(formatDateLocal(lastDay));
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="compte-compagnie-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="header-title">
                        <i className="bi bi-file-earmark-text"></i>
                        <span>MOUVEMENT</span>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Body with sidebar and content */}
                <div className="modal-body">
                    {/* Left Sidebar */}
                    <div className="sidebar">
                        <div className="company-name">{compagnie?.nom}</div>

                        <div className="sidebar-section">
                            <div className="section-label">Nature du compte</div>
                            <div className="section-value">COMPAGNIE</div>
                        </div>

                        <div className="sidebar-section balance-section">
                            <div className="section-label">Solde du compte</div>
                            <div className="balance-value">
                                {formatMontant(stats.solde)} <span className="currency">XAF</span>
                            </div>
                        </div>

                        <button className="btn-create-movement">
                            <i className="bi bi-plus-circle"></i> Créer un mouvement
                        </button>

                        <div className="sidebar-section stats-section">
                            <div className="stat-item credit">
                                <div className="stat-label">
                                    Total Crédit de la période
                                </div>
                                <div className="stat-value">
                                    <i className="bi bi-caret-up-fill"></i>
                                    {formatMontant(stats.totalCredit)} XAF
                                </div>
                            </div>

                            <div className="stat-item debit">
                                <div className="stat-label">
                                    Total débit de la période
                                </div>
                                <div className="stat-value">
                                    <i className="bi bi-caret-down-fill"></i>
                                    {formatMontant(stats.totalDebit)} XAF
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="content-area">
                        {/* Tab Switcher */}
                        <div className="tab-switcher">
                            <button
                                className={`tab-btn ${activeTab === 'mouvements' ? 'active' : ''}`}
                                onClick={() => setActiveTab('mouvements')}
                            >
                                Liste des mouvements
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'synthese' ? 'active' : ''}`}
                                onClick={() => setActiveTab('synthese')}
                            >
                                Synthèse
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'mouvements' ? (
                                <div className="mouvements-tab">
                                    {/* Period Header */}
                                    <div className="period-header">
                                        <span>
                                            Activités du compte de la période du {formatDate(dateDebut)} au {formatDate(dateFin)}
                                        </span>
                                    </div>

                                    {/* Date Filters */}
                                    <div className="date-filters-bar">
                                        <div className="date-inputs">
                                            <span>Période du</span>
                                            <input
                                                type="date"
                                                value={dateDebut}
                                                onChange={(e) => setDateDebut(e.target.value)}
                                            />
                                            <span>au</span>
                                            <input
                                                type="date"
                                                value={dateFin}
                                                onChange={(e) => setDateFin(e.target.value)}
                                            />
                                            <button className="btn-icon" onClick={loadMouvements} title="Filtrer">
                                                <i className="bi bi-calendar-check"></i>
                                            </button>
                                            <button className="btn-icon" onClick={loadMouvements} title="Actualiser">
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>
                                        </div>
                                        <button className="btn-reset" onClick={handleResetFilters}>
                                            <i className="bi bi-arrow-counterclockwise"></i> Réinitialiser
                                        </button>
                                    </div>

                                    {/* Movements Table */}
                                    {loading ? (
                                        <div className="empty-state">
                                            <i className="bi bi-hourglass-split"></i>
                                            <p>Chargement des mouvements...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="empty-state error">
                                            <i className="bi bi-exclamation-triangle"></i>
                                            <p>{error}</p>
                                        </div>
                                    ) : mouvements.length === 0 ? (
                                        <div className="empty-state">
                                            <i className="bi bi-inbox"></i>
                                            <p>Aucun mouvement sur cette période</p>
                                        </div>
                                    ) : (
                                        <div className="table-wrapper">
                                            <table className="movements-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Libellé / Type</th>
                                                        <th>Débit</th>
                                                        <th>Crédit</th>
                                                        <th>Observation</th>
                                                        <th>Enregistré par</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mouvements.map((mvt, index) => (
                                                        <tr key={mvt.idmouvement || index}>
                                                            <td>{formatDate(mvt.datemouvement)}</td>
                                                            <td>
                                                                <div className="mvt-type">{mvt.lib_type_mvt}</div>
                                                                {mvt.num_mvt && <div className="mvt-num">N° {mvt.num_mvt}</div>}
                                                            </td>
                                                            <td className="amount debit">
                                                                {(mvt.debit || mvt.mont_debit) ? formatMontant(mvt.debit || mvt.mont_debit) : '-'}
                                                            </td>
                                                            <td className="amount credit">
                                                                {(mvt.credit || mvt.mont_credit) ? formatMontant(mvt.credit || mvt.mont_credit) : '-'}
                                                            </td>
                                                            <td>{mvt.observation || '-'}</td>
                                                            <td>{mvt.nom_utilisateur || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="synthese-tab">
                                    {/* Period Header */}
                                    <div className="period-header">
                                        <span>
                                            Activités du compte de la période du {formatDate(dateDebut)} au {formatDate(dateFin)}
                                        </span>
                                    </div>

                                    {/* Date Filters */}
                                    <div className="date-filters-bar">
                                        <div className="date-inputs">
                                            <span>Période du</span>
                                            <input
                                                type="date"
                                                value={dateDebut}
                                                onChange={(e) => setDateDebut(e.target.value)}
                                            />
                                            <span>au</span>
                                            <input
                                                type="date"
                                                value={dateFin}
                                                onChange={(e) => setDateFin(e.target.value)}
                                            />
                                            <button className="btn-icon" onClick={loadMouvements} title="Filtrer">
                                                <i className="bi bi-calendar-check"></i>
                                            </button>
                                            <button className="btn-icon" onClick={loadMouvements} title="Actualiser">
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </button>
                                        </div>
                                        <button className="btn-reset" onClick={handleResetFilters}>
                                            <i className="bi bi-arrow-counterclockwise"></i> Réinitialiser
                                        </button>
                                    </div>

                                    {/* Synthese Content */}
                                    <div className="synthese-content">
                                        {/* Analyse des types mouvement */}
                                        <div className="synthese-section">
                                            <h3>Analyse des types mouvement de la période</h3>
                                            <div className="sub-tabs">
                                                <button
                                                    className={`sub-tab ${syntheseSubTab === 'debit' ? 'active' : ''}`}
                                                    onClick={() => setSyntheseSubTab('debit')}
                                                >
                                                    Débit
                                                </button>
                                                <button
                                                    className={`sub-tab ${syntheseSubTab === 'credit' ? 'active' : ''}`}
                                                    onClick={() => setSyntheseSubTab('credit')}
                                                >
                                                    Crédit
                                                </button>
                                            </div>
                                            <div className="analysis-content">
                                                <div className="empty-state">
                                                    <p>Aucune donnée disponible</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statistique des types de mouvement */}
                                        <div className="synthese-section">
                                            <h3>Statistique des types de mouvement</h3>
                                            <div className="stats-bars">
                                                <div className="stat-bar-item">
                                                    <div className="bar-label">Mouvement de crédit</div>
                                                    <div className="bar-container">
                                                        <div
                                                            className="bar credit-bar"
                                                            style={{ width: stats.totalCredit > 0 ? '100%' : '0%' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <div className="stat-bar-item">
                                                    <div className="bar-label">Mouvement de débit</div>
                                                    <div className="bar-container">
                                                        <div
                                                            className="bar debit-bar"
                                                            style={{ width: stats.totalDebit > 0 ? '100%' : '0%' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statistique des mouvements du type sélectionné */}
                                        <div className="synthese-section">
                                            <h3>Statistique des mouvements du type sélectionner</h3>
                                            <div className="selected-type-stats">
                                                <div className="date-range">
                                                    <i className="bi bi-calendar3"></i>
                                                    <span>{formatDate(dateDebut)} - {formatDate(dateFin)}</span>
                                                </div>
                                                <div className="total-amount">
                                                    <div className="amount-label">Montant total crédit</div>
                                                    <div className="amount-value credit">
                                                        <i className="bi bi-caret-down-fill"></i>
                                                        {formatMontant(stats.totalCredit)} XAF
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompteCompagnieModal;
