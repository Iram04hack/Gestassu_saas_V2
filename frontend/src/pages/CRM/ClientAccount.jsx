import React, { useState, useEffect } from 'react';
import { getMouvementsByClient } from '../../services/finances';
import MovementFormModal from './MovementFormModal';
import RegularisationFormModal from './RegularisationFormModal';

const ClientAccount = ({ client }) => {
    const [mouvements, setMouvements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [isRegularisationModalOpen, setIsRegularisationModalOpen] = useState(false);
    const [stats, setStats] = useState({
        solde: 0,
        totalCredit: 0,
        totalDebit: 0
    });

    // Filtres de période (par défaut: mois en cours)
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    useEffect(() => {
        // Initialiser les dates au mois en cours
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Ajuster pour le format YYYY-MM-DD local
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
        if (client && dateDebut && dateFin) {
            loadMouvements();
        }
    }, [client, dateDebut, dateFin]);

    const loadMouvements = async () => {
        try {
            setLoading(true);
            const data = await getMouvementsByClient(client.id, {
                date_debut: dateDebut,
                date_fin: dateFin
            });

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
            totalCredit += parseFloat(mvt.credit || 0);
            totalDebit += parseFloat(mvt.debit || 0);
        });

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

    return (
        <div className="client-account">
            <style>{`
                .client-account { padding: 20px; }
                .account-overview {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                
                .account-card {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 4px;
                    flex: 1;
                    min-width: 250px;
                    border-left: 4px solid #ccc;
                }
                .account-card.primary { border-left-color: #8d6e63; background: #efebe9; }
                .account-card.success { border-left-color: #4caf50; }
                .account-card.danger { border-left-color: #f44336; }
                
                .card-label { font-size: 0.85rem; color: #5d4037; margin-bottom: 5px; display: block; }
                .card-value { font-size: 1.5rem; font-weight: bold; color: #3e2723; }
                .currency { font-size: 0.9rem; font-weight: normal; margin-right: 5px; }
                
                .account-info { margin-top: 10px; font-size: 0.9rem; }
                .account-info strong { color: #3e2723; }
                
                .actions-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    background: #fafafa;
                    padding: 10px;
                    border-radius: 4px;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .date-filters {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .btn-brown {
                    background-color: #6d4c41;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                }
                
                .btn-brown:hover { background-color: #5d4037; }
                
                .movements-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .movements-table th {
                    text-align: left;
                    padding: 12px;
                    background: #efebe9;
                    color: #5d4037;
                    font-weight: 600;
                    border-bottom: 2px solid #d7ccc8;
                }
                .movements-table td {
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                }
                
                .text-success { color: #2e7d32; }
                .text-danger { color: #c62828; }
                .font-bold { font-weight: 600; }
            `}</style>

            <MovementFormModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                client={client}
                onSuccess={loadMouvements}
            />

            <RegularisationFormModal
                isOpen={isRegularisationModalOpen}
                onClose={() => setIsRegularisationModalOpen(false)}
                client={client}
                onSuccess={loadMouvements}
                type="credit"
            />

            <div className="account-overview">
                <div className="account-card primary">
                    <span className="card-label">Solde du compte</span>
                    <div className="card-value">
                        <span className="currency">XAF</span>
                        {formatMontant(stats.solde)}
                    </div>
                    <div className="account-info">
                        Intitulé du compte<br />
                        <strong>{client ? `${client.nom_client || ''} ${client.prenom_client || ''}`.toUpperCase() : 'Chargement...'}</strong>
                    </div>
                    <div className="account-info">
                        Nature du compte<br />
                        <strong>CLIENT</strong>
                    </div>
                </div>

                <div className="account-card success">
                    <span className="card-label">Total Crédit de la période <i className="bi bi-caret-up-fill"></i></span>
                    <div className="card-value" style={{ color: '#2e7d32' }}>
                        <span className="currency">XAF</span>
                        {formatMontant(stats.totalCredit)}
                    </div>
                </div>

                <div className="account-card danger">
                    <span className="card-label">Total débit de la période <i className="bi bi-caret-down-fill"></i></span>
                    <div className="card-value" style={{ color: '#c62828' }}>
                        <span className="currency">XAF</span>
                        {formatMontant(stats.totalDebit)}
                    </div>
                </div>
            </div>

            <div className="actions-bar">
                <div className="left-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="date-filters">
                        <span>Période du</span>
                        <input
                            type="date"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.target.value)}
                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <span>au</span>
                        <input
                            type="date"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.target.value)}
                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <button className="btn-brown" onClick={loadMouvements} style={{ padding: '5px 10px' }}>
                            <i className="bi bi-funnel"></i> Filtrer
                        </button>
                    </div>
                </div>

                <div className="right-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-brown" onClick={() => setIsMovementModalOpen(true)}>
                        <i className="bi bi-plus-circle"></i> Créer un mouvement
                    </button>
                    <button className="btn-brown" onClick={() => setIsRegularisationModalOpen(true)}>
                        <i className="bi bi-plus-circle"></i> Mouvement de régularisation
                    </button>
                    <button className="btn-brown" style={{ backgroundColor: '#8d6e63' }}>
                        <i className="bi bi-arrow-counterclockwise"></i> Réinitialiser
                    </button>
                </div>
            </div>

            <div className="movements-list">
                <div style={{ background: '#e0e0e0', padding: '10px', fontWeight: 'bold', color: '#5d4037' }}>
                    Activités du compte de la période du {formatDate(dateDebut)} au {formatDate(dateFin)}
                </div>

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
                        {mouvements.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                                    Aucun mouvement sur cette période
                                </td>
                            </tr>
                        ) : (
                            mouvements.map(mvt => (
                                <tr key={mvt.idquittance || mvt.idmouvement}>
                                    <td>{formatDate(mvt.datemouvement)}</td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{mvt.lib_type_mvt}</div>
                                        {mvt.num_mvt && <div style={{ fontSize: '0.8rem', color: '#777' }}>N° {mvt.num_mvt}</div>}
                                    </td>
                                    <td className="text-danger font-bold">{mvt.debit ? formatMontant(mvt.debit) : '-'}</td>
                                    <td className="text-success font-bold">{mvt.credit ? formatMontant(mvt.credit) : '-'}</td>
                                    <td>{mvt.observation}</td>
                                    <td>{mvt.nom_utilisateur || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientAccount;
