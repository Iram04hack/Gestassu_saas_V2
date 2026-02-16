import React from 'react';

const CommerciauxList = ({ apporteurs, onDetails, onEdit, onDelete, onCommissionConfig }) => {
    return (
        <div className="client-list-container">
            <div className="table-responsive">
                <table className="client-table">
                    <thead>
                        <tr>
                            <th>Référence</th>
                            <th>Login</th>
                            <th>Désignation</th>
                            <th>Type</th>
                            <th>Adresse</th>
                            <th>Téléphone</th>
                            <th>Fréq. paiement</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apporteurs.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    Aucun commercial trouvé
                                </td>
                            </tr>
                        ) : (
                            apporteurs.map(apporteur => (
                                <tr key={apporteur.code_apporteur}>
                                    <td>{apporteur.code_apporteur}</td>
                                    <td>{apporteur.login || '-'}</td>
                                    <td>{apporteur.nom_apporteur}</td>
                                    <td>
                                        <span className={`badge ${apporteur.type_apporteur === 'Entreprise' ? 'prospect' : 'client'}`}>
                                            {apporteur.type_apporteur}
                                        </span>
                                    </td>
                                    <td>{apporteur.adresse || '-'}</td>
                                    <td>{apporteur.telephone || '-'}</td>
                                    <td>{apporteur.frequence_paiement || '-'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-details"
                                                onClick={() => onDetails(apporteur)}
                                                title="Détails"
                                            >
                                                <i className="bi bi-eye"></i> Détails
                                            </button>
                                            <button
                                                className="btn-details"
                                                onClick={() => onCommissionConfig(apporteur)}
                                                title="Commission"
                                                style={{ borderColor: '#8d6e63', color: '#6d4c41' }}
                                            >
                                                <i className="bi bi-gear"></i> Commission
                                            </button>
                                            <button
                                                className="btn-icon-danger"
                                                onClick={() => onDelete(apporteur.code_apporteur)}
                                                title="Supprimer"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommerciauxList;
