import React, { useState } from 'react';

const BordereauModal = ({ isOpen, onClose, compagnies }) => {
    const [formData, setFormData] = useState({
        libelle: 'Bordereau des attestation automobile',
        id_compagnie: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePrint = () => {
        if (!formData.id_compagnie) {
            alert("Veuillez sélectionner une compagnie");
            return;
        }

        // TODO: Implémenter la génération et l'impression du bordereau
        alert(`Impression du bordereau pour ${formData.libelle}\nCompagnie: ${formData.id_compagnie}\nPériode: ${formData.date_debut} au ${formData.date_fin}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Impression bordereau attestation</h2>
                    <button className="btn-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Libellé :</label>
                        <input
                            type="text"
                            name="libelle"
                            value={formData.libelle}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Compagnie :</label>
                        <select
                            name="id_compagnie"
                            value={formData.id_compagnie}
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="">Sélectionner...</option>
                            {compagnies.map(c => (
                                <option key={c.id_compagnie} value={c.id_compagnie}>
                                    {c.nom_compagnie}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Période du :</label>
                        <div className="date-range">
                            <input
                                type="date"
                                name="date_debut"
                                value={formData.date_debut}
                                onChange={handleChange}
                                className="form-control"
                            />
                            <span className="date-separator">au</span>
                            <input
                                type="date"
                                name="date_fin"
                                value={formData.date_fin}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="modal-footer-center">
                        <button className="btn-print" onClick={handlePrint}>
                            <i className="bi bi-printer"></i>
                            Imprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BordereauModal;
