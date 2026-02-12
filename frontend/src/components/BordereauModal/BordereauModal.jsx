import React, { useState } from 'react';
import './BordereauModal.css';
import CompagnieSelectorModal from './CompagnieSelectorModal';

const BordereauModal = ({ isOpen, onClose }) => {
    const [libelle, setLibelle] = useState("Bordereau d'émission de primes et de commissions");
    const [selectedCompagnie, setSelectedCompagnie] = useState(null);
    const [isCompagnieModalOpen, setIsCompagnieModalOpen] = useState(false);
    const [dateDebut, setDateDebut] = useState("2026-02-01");
    const [dateFin, setDateFin] = useState("2026-02-11");

    const bordereauTypes = [
        "Bordereau d'émission de primes et de commissions",
        "Bordereau d'annulation de primes et de commissions",
        "Bordereau d'encaissement des primes",
        "Bordereau de reversement des primes",
        "Bordereau des arriérés de primes"
    ];

    console.log("BordereauModal Check - isOpen:", isOpen);
    if (!isOpen) return null;

    const handleSelectCompagnie = (compagnie) => {
        setSelectedCompagnie(compagnie);
    };

    return (
        <div className="bordereau-modal-overlay" onClick={onClose}>
            <div className="bordereau-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn-circle" onClick={onClose}>
                    <i className="bi bi-x"></i>
                </button>

                <div className="bordereau-modal-header-modern">
                    <h2 className="modal-title-modern">Edition de bordereau</h2>
                    <p className="modal-subtitle">Générez vos documents de bordereaux en quelques clics.</p>
                </div>

                <div className="bordereau-modal-body-modern">
                    <div className="form-group-modern">
                        <label className="label-modern">Bordereau</label> {/* Renamed from Libellé */}
                        <select
                            value={libelle}
                            onChange={(e) => setLibelle(e.target.value)}
                            className="input-modern bold-text-modern"
                        >
                            {bordereauTypes.map((type, index) => (
                                <option key={index} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group-modern">
                        <label className="label-modern">Compagnie</label>
                        <div className="input-with-button-left">
                            <button
                                className="btn-select-left"
                                onClick={() => setIsCompagnieModalOpen(true)}
                            >
                                <i className="bi bi-plus-circle"></i>
                                Selectionner
                            </button>
                            <input
                                type="text"
                                className="input-modern readonly-field"
                                value={selectedCompagnie ? selectedCompagnie.nom_compagnie : ""}
                                placeholder="Aucune compagnie sélectionnée"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="date-group-row">
                        <div className="form-group-modern">
                            <label className="label-modern">Date de début</label>
                            <input
                                type="date"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="input-modern"
                            />
                        </div>
                        <div className="form-group-modern">
                            <label className="label-modern">Date de fin</label>
                            <input
                                type="date"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="input-modern"
                            />
                        </div>
                    </div>

                    <div className="modal-actions-modern">
                        <button className="btn-secondary-modern" onClick={onClose}>
                            Annuler
                        </button>
                        <button
                            className="btn-primary-modern"
                            disabled={!selectedCompagnie}
                        >
                            Imprimer le bordereau
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-modal for Company Selection */}
            <CompagnieSelectorModal
                isOpen={isCompagnieModalOpen}
                onClose={() => setIsCompagnieModalOpen(false)}
                onSelect={handleSelectCompagnie}
            />
        </div>
    );
};

export default BordereauModal;
