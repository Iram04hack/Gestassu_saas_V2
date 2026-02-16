import React, { useState, useEffect } from 'react';
import ContractSearchModal from './ContractSearchModal';
import AttestationsService from '../../../services/attestationsService';
import '../../CRM/CRM.css'; // Import CRM styles for consistency
import './AttestationsList.css'; // Keep Attestations styles if needed

const AffectationAttestations = () => {
    const [selectedContract, setSelectedContract] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [risks, setRisks] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [loading, setLoading] = useState(false);

    const handleContractSelect = (contract) => {
        setSelectedContract(contract);
        setRisks(contract.risques || []);
        setAssignments({});
        setShowSearchModal(false);
    };

    const handleAssignChange = (riskId, value, type) => {
        setAssignments(prev => ({
            ...prev,
            [riskId]: { ...prev[riskId], num: value, type: type }
        }));
    };

    const fetchNextAvailable = async (riskId, type) => {
        try {
            const typeCode = type === 'rose' ? '653' : '652';
            const response = await AttestationsService.getAll({
                Etat_attestation: '0',
                type_attestation: typeCode,
                ordering: 'date_enreg',
                page_size: 1
            });

            const results = response.data?.results || response.results || [];
            if (results.length > 0) {
                const next = results[0];
                setAssignments(prev => ({
                    ...prev,
                    [riskId]: {
                        num: next.Num_attestation,
                        id: next.id_attestation,
                        type: type
                    }
                }));
            } else {
                alert("Aucune attestation disponible pour ce type.");
            }
        } catch (error) {
            console.error("Erreur recherche auto", error);
        }
    };

    const handleFinalize = async () => {
        if (!selectedContract) return;

        setLoading(true);
        try {
            const validAssignments = Object.entries(assignments)
                .filter(([_, data]) => data && data.num)
                .map(([riskId, data]) => ({
                    id_risque: riskId,
                    num_attestation: data.num,
                    id_attestation: data.id
                }));

            if (validAssignments.length === 0) {
                alert("Aucune affectation à sauvegarder.");
                setLoading(false);
                return;
            }

            // Resolve IDs logic similar to before...
            for (let item of validAssignments) {
                if (!item.id_attestation && item.num_attestation) {
                    try {
                        const res = await AttestationsService.getAll({ search: item.num_attestation, Etat_attestation: '0' });
                        const found = (res.data?.results || res.results || []).find(a => a.Num_attestation.toString() === item.num_attestation.toString());
                        if (found) {
                            item.id_attestation = found.id_attestation;
                        } else {
                            throw new Error(`Attestation ${item.num_attestation} introuvable ou déjà utilisée.`);
                        }
                    } catch (e) {
                        alert(e.message);
                        setLoading(false);
                        return;
                    }
                }
            }

            const payload = {
                id_contrat: selectedContract.id_contrat,
                assignments: validAssignments
            };

            await AttestationsService.assignToContract(payload);
            alert("Affectation réussie !");
            setSelectedContract(null);
            setRisks([]);
            setAssignments({});
        } catch (error) {
            console.error("Erreur affectation", error);
            alert("Erreur lors de l'affectation: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="crm-container">
            {/* Header Strip - Using CRM Style */}
            <div className="crm-header-strip">
                <h1>Affectation des Attestations</h1>
            </div>

            {/* Toolbar Area - For Contract Search */}
            <div className="crm-toolbar" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button className="btn-new" onClick={() => setShowSearchModal(true)}>
                        <i className="bi bi-search"></i> Sélectionner un Contrat
                    </button>
                    {selectedContract && (
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', color: '#555', fontSize: '0.95rem' }}>
                            <span className="badge-contract" style={{ background: '#e3f2fd', color: '#1565c0', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                                {selectedContract.numPolice}
                            </span>
                            <span style={{ fontWeight: '600' }}>{selectedContract.nom_client_complet}</span>
                            <span style={{ color: '#888' }}>|</span>
                            <span>{selectedContract.nom_compagnie}</span>
                        </div>
                    )}
                </div>

                {selectedContract && (
                    <button
                        className="btn-action-toolbar assign"
                        onClick={handleFinalize}
                        disabled={loading}
                        style={{ background: '#6d4c41', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px' }}
                    >
                        {loading ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-lg"></i>}
                        Enregistrer
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div style={{ padding: '20px', overflowY: 'auto', height: 'calc(100% - 130px)' }}>
                {!selectedContract ? (
                    <div className="empty-state-large" style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>
                        <i className="bi bi-file-earmark-person" style={{ fontSize: '4rem', color: '#e0e0e0', marginBottom: '20px' }}></i>
                        <h3>Aucun contrat sélectionné</h3>
                        <p>Utilisez le bouton "Sélectionner un Contrat" pour commencer.</p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* Contract Summary Card (Optional, for more details) */}

                        {/* Risks List - Card Style */}
                        <h3 style={{ fontSize: '1.1rem', color: '#6d4c41', marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                            Véhicules à affecter ({risks.length})
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                            {risks.map((risk, index) => (
                                <div key={risk.id_risque || index} className="risk-card" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                    {/* Vehicle Hard Info */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{risk.veh_marque} {risk.veh_modele}</div>
                                            <div style={{ color: '#888', fontSize: '0.9rem' }}>{risk.veh_categorie || 'Catégorie non spécifiée'}</div>
                                        </div>
                                        <div style={{ background: '#eceff1', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 'bold', color: '#455a64' }}>
                                            {risk.veh_immat}
                                        </div>
                                    </div>

                                    {/* Assignment Section */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f9f9f9' }}>

                                        {/* Jaune */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbc02d' }} title="Carte Jaune"></div>
                                            <input
                                                type="text"
                                                placeholder="N° Attestation Jaune"
                                                className="form-control"
                                                value={assignments[risk.id_risque]?.type === 'jaune' ? assignments[risk.id_risque].num : (risk.attestation_jaune || '')}
                                                onChange={(e) => handleAssignChange(risk.id_risque, e.target.value, 'jaune')}
                                                style={{ flex: 1, fontSize: '0.9rem', padding: '6px 10px', borderColor: '#eee' }}
                                            />
                                            <button
                                                onClick={() => fetchNextAvailable(risk.id_risque, 'jaune')}
                                                className="btn-icon-mini"
                                                style={{ background: '#fff9c4', color: '#fbc02d', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                title="Suggérer Jaune"
                                            >
                                                <i className="bi bi-magic"></i>
                                            </button>
                                        </div>

                                        {/* Rose */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f48fb1' }} title="Carte Rose"></div>
                                            <input
                                                type="text"
                                                placeholder="N° Carte Rose"
                                                className="form-control"
                                                value={assignments[risk.id_risque]?.type === 'rose' ? assignments[risk.id_risque].num : (risk.attestation_rose || '')}
                                                onChange={(e) => handleAssignChange(risk.id_risque, e.target.value, 'rose')}
                                                style={{ flex: 1, fontSize: '0.9rem', padding: '6px 10px', borderColor: '#eee' }}
                                            />
                                            <button
                                                onClick={() => fetchNextAvailable(risk.id_risque, 'rose')}
                                                className="btn-icon-mini"
                                                style={{ background: '#fce4ec', color: '#ec407a', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                title="Suggérer Rose"
                                            >
                                                <i className="bi bi-magic"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ContractSearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                onSelect={handleContractSelect}
            />
        </div>
    );
};

export default AffectationAttestations;
