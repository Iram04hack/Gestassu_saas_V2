import React, { useState, useEffect } from 'react';
import ContractSearchModal from './ContractSearchModal';
import AttestationsService from '../../../services/attestationsService'; // Need to implement assignToContract

const AffectationModal = ({ isOpen, onClose, selectedAttestations, onSuccess }) => {
    const [selectedContract, setSelectedContract] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [risks, setRisks] = useState([]);
    const [assignments, setAssignments] = useState({}); // { riskId: attestationNumber }
    const [loading, setLoading] = useState(false);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setSelectedContract(null);
            setRisks([]);
            setAssignments({});
        }
    }, [isOpen]);

    const handleContractSelect = (contract) => {
        setSelectedContract(contract);
        setRisks(contract.risques || []); // Assuming serializer returns 'risques'
        setShowSearchModal(false);
    };

    const handleAutoAssign = () => {
        // Auto-assign selected attestations to risks sequentially
        // This is a placeholder logic
        const newAssignments = { ...assignments };
        const availableAttestations = [...selectedAttestations];

        risks.forEach(risk => {
            if (availableAttestations.length > 0 && !newAssignments[risk.id_risque]) {
                newAssignments[risk.id_risque] = availableAttestations.shift();
            }
        });
        setAssignments(newAssignments);
    };

    const handleFinalize = async () => {
        if (!selectedContract) return;

        setLoading(true);
        try {
            const payload = {
                id_contrat: selectedContract.id_contrat,
                assignments: Object.entries(assignments).map(([riskId, attestation]) => ({
                    id_risque: riskId,
                    num_attestation: attestation.Num_attestation, // Assuming attestation object
                    id_attestation: attestation.id_attestation
                }))
            };

            await AttestationsService.assignToContract(payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erreur affectation", error);
            alert("Erreur lors de l'affectation");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
                <div className="modal-content modal-large animate-fade-in" style={{ width: '900px', maxWidth: '95vw' }}>
                    <div className="modal-header">
                        <h2>Affectation des attestations</h2>
                        <button className="close-btn" onClick={onClose}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <div className="modal-body" style={{ padding: '20px' }}>
                        {/* Section Selection Contrat */}
                        <div className="section-header" style={{ marginBottom: '15px' }}>
                            <h3 style={{ color: '#8d6e63', fontSize: '1.1rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                Sélectionner un contrat
                            </h3>
                        </div>

                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {/* Col 1 */}
                            <div className="form-group">
                                <label>N° Police :</label>
                                <div className="input-with-action">
                                    <input
                                        type="text"
                                        value={selectedContract?.numPolice || ''}
                                        readOnly
                                        className="form-control"
                                        style={{ backgroundColor: '#fff9c4' }} // Yellow bg as in image
                                        placeholder="Sélectionner un contrat..."
                                    />
                                    <button
                                        className="btn-search-action"
                                        onClick={() => setShowSearchModal(true)}
                                        style={{ background: '#6d4c41', color: 'white', border: 'none', padding: '0 15px' }}
                                    >
                                        <i className="bi bi-three-dots"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Date Effet :</label>
                                <input
                                    type="date"
                                    value={selectedContract?.date_effet || ''}
                                    readOnly
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Compagnie :</label>
                                <input
                                    type="text"
                                    value={selectedContract?.nom_compagnie || ''}
                                    readOnly
                                    className="form-control"
                                    style={{ backgroundColor: '#fff9c4' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Assuré :</label>
                                <input
                                    type="text"
                                    value={selectedContract?.nom_client_complet || ''}
                                    readOnly
                                    className="form-control"
                                    style={{ backgroundColor: '#fff9c4' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Date Échéance :</label>
                                <input
                                    type="date"
                                    value={selectedContract?.Date_echeance || ''}
                                    readOnly
                                    className="form-control"
                                />
                            </div>
                        </div>

                        {/* Section Véhicules */}
                        <div className="risks-table-container">
                            <table className="attestations-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Immat.</th>
                                        <th>Marque</th>
                                        <th>Modèle</th>
                                        <th>Catégorie</th>
                                        <th>Attestation</th>
                                        <th>Carte rose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {risks.length > 0 ? (
                                        risks.map((risk) => (
                                            <tr key={risk.id_risque}>
                                                <td>{risk.veh_immat || '-'}</td>
                                                <td>{risk.veh_marque || '-'}</td>
                                                <td>{risk.veh_modele || '-'}</td>
                                                <td>{risk.veh_type || '-'}</td>
                                                <td>
                                                    {assignments[risk.id_risque] ? (
                                                        <span className="badge-linked">
                                                            {assignments[risk.id_risque].Num_attestation}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {/* Placeholder for Carte Rose status/link */}
                                                    <i className="bi bi-file-earmark-check" style={{ color: '#ccc' }}></i>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                                {selectedContract ? "Aucun risque associé à ce contrat" : "Veuillez sélectionner un contrat"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Action Auto-assign if needed */}
                        {selectedContract && risks.length > 0 && selectedAttestations && selectedAttestations.length > 0 && (
                            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                <button
                                    className="btn-text"
                                    onClick={handleAutoAssign}
                                    style={{ color: '#6d4c41', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Pré-remplir avec les attestations sélectionnées
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer-assign" style={{ justifyContent: 'center' }}>
                        <button
                            className="btn-premium"
                            onClick={handleFinalize}
                            disabled={!selectedContract || loading}
                            style={{ minWidth: '200px' }}
                        >
                            {loading ? <div className="spinner-small"></div> : <><i className="bi bi-check-lg"></i> Finaliser l'affectation</>}
                        </button>
                    </div>
                </div>
            </div>

            <ContractSearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                onSelect={handleContractSelect}
            />
        </>
    );
};

export default AffectationModal;
