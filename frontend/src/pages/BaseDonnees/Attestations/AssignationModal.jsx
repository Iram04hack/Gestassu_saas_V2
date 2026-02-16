import React, { useState, useEffect } from 'react';
import CompagniesService from '../../../services/compagnies';
import CoreService from '../../../services/core';

const AssignationModal = ({ isOpen, onClose, onAssign, count }) => {
    const [compagnies, setCompagnies] = useState([]);
    const [agences, setAgences] = useState([]);
    const [idCompagnie, setIdCompagnie] = useState('');
    const [codeAgence, setCodeAgence] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            setIdCompagnie('');
            setCodeAgence('');
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [compRes, agenceRes] = await Promise.all([
                CompagniesService.getCompagnies(),
                CoreService.getAgences()
            ]);

            // Handle different response structures (Service returning response vs response.data)
            const compData = compRes.data || compRes;
            const agenceData = agenceRes.data || agenceRes;

            setCompagnies(Array.isArray(compData) ? compData : compData.results || []);
            setAgences(Array.isArray(agenceData) ? agenceData : agenceData.results || []);
        } catch (error) {
            console.error("Erreur chargement données assignation", error);
        }
    };

    const handleSave = () => {
        if (!idCompagnie && !codeAgence) {
            onClose();
            return;
        }

        const data = {};
        if (idCompagnie) data.id_compagnie = idCompagnie;
        if (codeAgence) data.CodeAgence = codeAgence;

        onAssign(data);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content modal-assign animate-fade-in">
                <div className="modal-header">
                    <h2>Fiche assignation</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body-assign">
                    <div className="form-group-assign">
                        <label>Assigner à une compagnie :</label>
                        <select
                            value={idCompagnie}
                            onChange={(e) => setIdCompagnie(e.target.value)}
                        >
                            <option value="">Sélectionner une compagnie</option>
                            {compagnies.map(c => (
                                <option key={c.id_compagnie} value={c.id_compagnie}>
                                    {c.nom_compagnie}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-assign">
                        <label>Assigner à une agence :</label>
                        <select
                            value={codeAgence}
                            onChange={(e) => setCodeAgence(e.target.value)}
                        >
                            <option value="">Sélectionner une agence</option>
                            {agences.map(a => (
                                <option key={a.codeagence || a.CodeAgence} value={a.codeagence || a.CodeAgence}>
                                    {a.nomagence || a.nom_agence}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="modal-footer-assign">
                    <button className="btn-cancel-assign" onClick={onClose}>
                        <i className="bi bi-x-lg"></i> Annuler
                    </button>
                    <button className="btn-save-assign" onClick={handleSave}>
                        <i className="bi bi-check-lg"></i> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignationModal;
