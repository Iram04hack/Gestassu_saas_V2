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
    const [stats, setStats] = useState({ solde: 0, totalCredit: 0, totalDebit: 0 });
    const [soldeTotal, setSoldeTotal] = useState(0);

    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    useEffect(() => {
        if (client) loadMouvements();
    }, [client, dateDebut, dateFin]);

    const loadMouvements = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateDebut) params.date_debut = dateDebut;
            if (dateFin) params.date_fin = dateFin;

            const data = await getMouvementsByClient(client.id || client.id_client, params);
            const results = data.results || data || [];
            setMouvements(results);
            let totalCredit = 0, totalDebit = 0;
            results.forEach(mvt => {
                totalCredit += parseFloat(mvt.credit || mvt.mont_credit || 0);
                totalDebit += parseFloat(mvt.debit || mvt.mont_debit || 0);
            });
            setStats({ solde: totalCredit - totalDebit, totalCredit, totalDebit });
            setSoldeTotal(totalCredit - totalDebit);
        } catch (err) {
            console.error('Erreur chargement mouvements:', err);
            setError('Impossible de charger les mouvements du compte');
        } finally {
            setLoading(false);
        }
    };

    const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n);
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    return (
        <div className="client-account">
            <style>{`
                .client-account { padding: 20px; }

                /* ── Cartes résumé ── */
                .account-overview {
                    display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;
                }
                .account-card {
                    background: #fff;
                    border-radius: 10px;
                    border: 1px solid #f0e8e4;
                    border-left: 4px solid #d7ccc8;
                    padding: 12px 16px;
                    flex: 1; min-width: 160px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                }
                .account-card.primary { border-left-color: #6d4c41; background: #fdf8f6; }
                .account-card.success { border-left-color: #43a047; }
                .account-card.danger  { border-left-color: #e53935; }
                .card-label {
                    font-size: 0.74rem; color: #8d6e63; display: block;
                    margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;
                }
                .card-value {
                    font-size: 1.2rem; font-weight: 700; color: #3e2723;
                    display: flex; align-items: baseline; gap: 3px;
                }
                .card-value.credit { color: #2e7d32; }
                .card-value.debit  { color: #c62828; }
                .card-currency { font-size: 0.72rem; font-weight: 600; color: #a1887f; }
                .card-sub {
                    margin-top: 6px; font-size: 0.75rem; color: #a1887f; line-height: 1.4;
                }
                .card-sub strong { color: #5d4037; font-weight: 700; }

                /* ── Barre d'actions ── */
                .actions-bar {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 16px; background: #fafaf9;
                    padding: 10px 14px; border-radius: 10px;
                    border: 1px solid #f0e8e4;
                    flex-wrap: wrap; gap: 10px;
                }
                .date-filters {
                    display: flex; align-items: center; gap: 8px;
                    font-size: 0.85rem; color: #6d4c41;
                }
                .date-input {
                    padding: 5px 10px; border-radius: 8px;
                    border: 1.5px solid #d7ccc8; font-size: 0.84rem;
                    outline: none; color: #5d4037;
                    transition: border-color 0.2s;
                }
                .date-input:focus { border-color: #6d4c41; }

                .right-actions { display: flex; gap: 8px; flex-wrap: wrap; }
                .btn-brown {
                    background: #6d4c41; color: white; border: none;
                    padding: 7px 14px; border-radius: 20px;
                    cursor: pointer; display: inline-flex; align-items: center;
                    gap: 7px; font-size: 0.84rem; font-weight: 600;
                    transition: all 0.2s;
                    box-shadow: 0 1px 4px rgba(109,76,65,0.2);
                }
                .btn-brown:hover { background: #5d4037; box-shadow: 0 3px 8px rgba(109,76,65,0.3); }
                .btn-brown.secondary { background: #efebe9; color: #6d4c41; border: 1.5px solid #d7ccc8; box-shadow: none; }
                .btn-brown.secondary:hover { background: #e8ddd9; border-color: #a1887f; }
                .btn-filter-sm { background: #efebe9; color: #6d4c41; border: 1.5px solid #d7ccc8; }
                .btn-filter-sm:hover { background: #e8ddd9; }

                /* ── Tableau mouvements ── */
                .movements-wrap {
                    background: #fff; border-radius: 12px;
                    border: 1px solid #ede8e5;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    overflow: hidden;
                }
                .movements-period-bar {
                    padding: 10px 18px;
                    background: #faf7f5; border-bottom: 1px solid #ede8e5;
                    font-size: 0.8rem; color: #8d6e63; font-weight: 600;
                    letter-spacing: 0.2px;
                }
                .movements-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .movements-table th {
                    text-align: left; padding: 11px 16px;
                    background: #faf7f5; color: #a1887f;
                    font-size: 0.72rem; font-weight: 700;
                    border-bottom: 2px solid #ede8e5;
                    text-transform: uppercase; letter-spacing: 0.6px;
                    white-space: nowrap;
                }
                .movements-table th.col-amount { text-align: right; }
                .movements-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f5f1ef;
                    font-size: 0.85rem; color: #4e342e;
                    vertical-align: middle;
                }
                .movements-table tr:last-child td { border-bottom: none; }
                .movements-table tbody tr { transition: background 0.15s; }
                .movements-table tbody tr:hover { background: #fdf9f7; }

                /* Montants mis en avant */
                .mvt-amount {
                    font-size: 0.95rem; font-weight: 700;
                    text-align: right; white-space: nowrap;
                    letter-spacing: -0.3px;
                }
                .mvt-amount.is-debit  { color: #c62828; }
                .mvt-amount.is-credit { color: #2e7d32; }
                .mvt-amount.is-zero   { color: #bdbdbd; font-weight: 400; }

                /* Badge type de mouvement */
                .mvt-type-name {
                    font-weight: 600; font-size: 0.85rem; color: #3e2723;
                }
                .mvt-num { font-size: 0.73rem; color: #a1887f; margin-top: 2px; }

                /* Colonne date */
                .mvt-date {
                    font-size: 0.84rem; color: #6d4c41; font-weight: 500;
                    white-space: nowrap;
                }

                /* Colonne observation */
                .mvt-obs {
                    font-size: 0.8rem; color: #795548; max-width: 280px;
                    line-height: 1.4;
                }

                /* Colonne enregistré par */
                .mvt-user {
                    font-size: 0.8rem; color: #a1887f; white-space: nowrap;
                }

                .empty-state-inner {
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 40px; color: #bcaaa4; font-size: 0.88rem; gap: 8px;
                }
            `}</style>

            <MovementFormModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                client={client}
                soldeActuel={soldeTotal}
                onSuccess={loadMouvements}
            />
            <RegularisationFormModal
                isOpen={isRegularisationModalOpen}
                onClose={() => setIsRegularisationModalOpen(false)}
                client={client}
                soldeActuel={soldeTotal}
                onSuccess={loadMouvements}
                type="credit"
            />

            {/* Cards résumé */}
            <div className="account-overview">
                <div className="account-card primary">
                    <span className="card-label"><i className="bi bi-wallet2"></i> Solde du compte</span>
                    <div className="card-value">
                        <span className="card-currency">XAF</span>
                        {fmt(soldeTotal)}
                    </div>
                    <div className="card-sub">
                        <strong>{client ? `${client.nom_client || ''} ${client.prenom_client || ''}`.toUpperCase() : '—'}</strong>
                        <br />Nature : CLIENT
                    </div>
                </div>

                <div className="account-card success">
                    <span className="card-label"><i className="bi bi-caret-down-fill"></i> Total Crédit</span>
                    <div className="card-value credit">
                        <span className="card-currency">XAF</span>
                        {fmt(stats.totalCredit)}
                    </div>
                    <div className="card-sub">Période sélectionnée</div>
                </div>

                <div className="account-card danger">
                    <span className="card-label"><i className="bi bi-caret-up-fill"></i> Total Débit</span>
                    <div className="card-value debit">
                        <span className="card-currency">XAF</span>
                        {fmt(stats.totalDebit)}
                    </div>
                    <div className="card-sub">Période sélectionnée</div>
                </div>
            </div>

            {/* Barre actions */}
            <div className="actions-bar">
                <div className="date-filters">
                    <span>Du</span>
                    <input
                        type="date" className="date-input"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                    />
                    <span>au</span>
                    <input
                        type="date" className="date-input"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                    />
                    <button className="btn-brown btn-filter-sm" onClick={loadMouvements} style={{ padding: '5px 12px' }}>
                        <i className="bi bi-funnel"></i> Filtrer
                    </button>
                </div>

                <div className="right-actions">
                    <button className="btn-brown" onClick={() => setIsMovementModalOpen(true)}>
                        <i className="bi bi-plus-circle"></i> Créer un mouvement
                    </button>
                    <button className="btn-brown" onClick={() => setIsRegularisationModalOpen(true)}>
                        <i className="bi bi-sliders"></i> Régularisation
                    </button>
                    <button className="btn-brown secondary" onClick={loadMouvements}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
            </div>

            {/* Tableau */}
            <div className="movements-wrap">
                <div className="movements-period-bar">
                    {dateDebut || dateFin
                        ? `Activités du compte — du ${fmtDate(dateDebut)} au ${fmtDate(dateFin)}`
                        : 'Activités du compte — Tout l\'historique'
                    }
                </div>

                <table className="movements-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Libellé / Type</th>
                            <th className="col-amount">Débit</th>
                            <th className="col-amount">Crédit</th>
                            <th>Observation</th>
                            <th>Enregistré par</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6"><div className="empty-state-inner"><i className="bi bi-hourglass-split" style={{ fontSize: '1.6rem', opacity: 0.4 }}></i>Chargement...</div></td></tr>
                        ) : error ? (
                            <tr><td colSpan="6"><div className="empty-state-inner" style={{ color: '#d32f2f' }}>{error}</div></td></tr>
                        ) : mouvements.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    <div className="empty-state-inner">
                                        <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                                        Aucun mouvement sur cette période
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            mouvements.map(mvt => {
                                const debit  = parseFloat(mvt.debit  || mvt.mont_debit  || 0);
                                const credit = parseFloat(mvt.credit || mvt.mont_credit || 0);
                                return (
                                    <tr key={mvt.idmouvement || mvt.idquittance}>
                                        <td><span className="mvt-date">{fmtDate(mvt.datemouvement)}</span></td>
                                        <td>
                                            <div className="mvt-type-name">{mvt.lib_type_mvt || mvt.LibType_Mouvement || '-'}</div>
                                            {mvt.num_mvt ? <div className="mvt-num">N° {mvt.num_mvt}</div> : null}
                                        </td>
                                        <td>
                                            <span className={`mvt-amount ${debit > 0 ? 'is-debit' : 'is-zero'}`}>
                                                {debit > 0 ? fmt(debit) : '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`mvt-amount ${credit > 0 ? 'is-credit' : 'is-zero'}`}>
                                                {credit > 0 ? fmt(credit) : '—'}
                                            </span>
                                        </td>
                                        <td><span className="mvt-obs">{mvt.observation || '—'}</span></td>
                                        <td><span className="mvt-user">{mvt.nom_utilisateur_resolu || mvt.nom_utilisateur || mvt.Nom_utilisateur || '—'}</span></td>
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

export default ClientAccount;
