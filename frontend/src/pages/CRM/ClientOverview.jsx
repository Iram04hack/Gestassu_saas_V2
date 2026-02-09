import React from 'react';

const ClientOverview = ({ client, onEdit }) => {
    const risques = client.risques_par_type || {
        vehicule: 0,
        credit: 0,
        logement: 0,
        personne: 0,
        societe: 0
    };

    return (
        <div className="client-overview">
            {/* Section: Profil du client */}
            <div className="overview-section">
                <div className="section-header">
                    <h2>Profil du client</h2>
                    <button className="btn-modify" onClick={onEdit}>
                        <i className="bi bi-pencil-fill"></i> Modifier la fiche
                    </button>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <label>Type :</label>
                        <span className="info-value">{client.est_entreprise ? 'ENTREPRISE' : 'PARTICULIER'}</span>
                    </div>
                    <div className="info-item">
                        <label>Pays :</label>
                        <span className="info-value">{client.pays || '-'}</span>
                    </div>
                    <div className="info-item full-width">
                        <label>Adresse :</label>
                        <span className="info-value">{client.adresse || '-'}</span>
                    </div>
                    <div className="info-item full-width">
                        <label>Email :</label>
                        <span className="info-value">{client.email || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Téléphone :</label>
                        <span className="info-value">{client.telephone || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Whatsapp :</label>
                        <span className="info-value">{client.tel_whatsapp || '-'}</span>
                    </div>
                    {!client.est_entreprise && (
                        <>
                            <div className="info-item">
                                <label>Profession :</label>
                                <span className="info-value">{client.profession || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>Date de naissance :</label>
                                <span className="info-value">
                                    {client.date_naissance ? new Date(client.date_naissance).toLocaleDateString('fr-FR') : '-'}
                                </span>
                            </div>
                        </>
                    )}
                    {client.est_entreprise && (
                        <>
                            <div className="info-item">
                                <label>Point focal :</label>
                                <span className="info-value">{client.representant_entreprise || '-'}</span>
                            </div>
                            <div className="info-item">
                                <label>Fonction du point focal :</label>
                                <span className="info-value">{client.role_representant || '-'}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Section: Risques déclarés */}
            <div className="overview-section">
                <div className="section-header">
                    <h2>Risques déclarés</h2>
                </div>

                <div className="risques-grid">
                    <div className="risque-card">
                        <div className="risque-icon">
                            <i className="bi bi-car-front-fill"></i>
                        </div>
                        <div className="risque-info">
                            <span className="risque-label">Véhicule</span>
                            <span className="risque-count">({risques.vehicule})</span>
                        </div>
                    </div>
                    <div className="risque-card">
                        <div className="risque-icon">
                            <i className="bi bi-credit-card-fill"></i>
                        </div>
                        <div className="risque-info">
                            <span className="risque-label">Crédit</span>
                            <span className="risque-count">({risques.credit})</span>
                        </div>
                    </div>
                    <div className="risque-card">
                        <div className="risque-icon">
                            <i className="bi bi-house-fill"></i>
                        </div>
                        <div className="risque-info">
                            <span className="risque-label">Logement</span>
                            <span className="risque-count">({risques.logement})</span>
                        </div>
                    </div>
                    <div className="risque-card">
                        <div className="risque-icon">
                            <i className="bi bi-person-fill"></i>
                        </div>
                        <div className="risque-info">
                            <span className="risque-label">Personne</span>
                            <span className="risque-count">({risques.personne})</span>
                        </div>
                    </div>
                    <div className="risque-card">
                        <div className="risque-icon">
                            <i className="bi bi-building-fill"></i>
                        </div>
                        <div className="risque-info">
                            <span className="risque-label">Société</span>
                            <span className="risque-count">({risques.societe})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section: Échéances à venir */}
            <div className="overview-section">
                <div className="section-header">
                    <h2>Échéances à venir</h2>
                </div>
                <div className="empty-state">
                    <i className="bi bi-calendar-event"></i>
                    <p>Aucune échéance à venir</p>
                </div>
            </div>

            {/* Section: Autres informations */}
            <div className="overview-section">
                <div className="section-header">
                    <h2>Autres informations</h2>
                </div>

                <div className="info-grid">
                    <div className="info-item">
                        <label>Source :</label>
                        <span className="info-value">{client.source || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>Conseiller client :</label>
                        <span className="info-value">-</span>
                    </div>
                    {client.autres_informations && (
                        <div className="info-item full-width">
                            <label>Autres infos :</label>
                            <span className="info-value">{client.autres_informations}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Section: Publicités */}
            <div className="overview-section">
                <div className="section-header">
                    <h2>Publicités</h2>
                </div>
                <div className="empty-state">
                    <i className="bi bi-megaphone"></i>
                    <p>Aucune publicité</p>
                </div>
            </div>

            <style jsx>{`
                .client-overview {
                    max-width: 1200px;
                }

                .overview-section {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 12px;
                    border-bottom: 2px solid #efebe9;
                }

                .section-header h2 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #6d4c41;
                }

                .btn-modify {
                    background: #6d4c41;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 50px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .btn-modify:hover {
                    background: #5d4037;
                    transform: translateY(-1px);
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-item.full-width {
                    grid-column: 1 / -1;
                }

                .info-item label {
                    font-size: 0.85rem;
                    color: #8d6e63;
                    font-weight: 600;
                }

                .info-value {
                    font-size: 0.95rem;
                    color: #3e2723;
                    font-weight: 500;
                }

                .risques-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                }

                .risque-card {
                    background: #fafafa;
                    border: 1px solid #d7ccc8;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .risque-card:hover {
                    background: #fff8e1;
                    border-color: #a1887f;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(109, 76, 65, 0.1);
                }

                .risque-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: rgba(109, 76, 65, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: #6d4c41;
                }

                .risque-info {
                    display: flex;
                    flex-direction: column;
                }

                .risque-label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #5d4037;
                }

                .risque-count {
                    font-size: 0.85rem;
                    color: #8d6e63;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: #8d6e63;
                    text-align: center;
                }

                .empty-state i {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                }

                .empty-state p {
                    margin: 0;
                    font-size: 0.95rem;
                }
            `}</style>
        </div>
    );
};

export default ClientOverview;
