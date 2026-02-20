import React, { useState, useEffect } from 'react';
import productsService from '../../services/products';
import './GarantiesModal.css';
import '../../pages/Produits/ProduitFormModal.css';

const GarantieFormModal = ({ show, onHide, garantie, produit }) => {
    const [formData, setFormData] = useState({
        id_produit: '',
        libelle_garantie: '',
        num_ordre: '',
        code_groupe_garantie: '',
        est_obligatoire: false,
        inclus_PF: false,
        inclus_ValeurVenal: false,
        inclus_surprime: false,
        capital_deces: 0,
        capital_invalidite: 0,
        capital_fraismedicaux: 0,
        tx_commision: 0,
        tx_taxe: 0
    });

    useEffect(() => {
        if (show) {
            if (garantie) {
                setFormData({
                    ...garantie,
                    capital_deces: garantie.capital_deces || 0,
                    capital_invalidite: garantie.capital_invalidite || 0,
                    capital_fraismedicaux: garantie.capital_fraismedicaux || 0,
                    tx_commision: garantie.tx_commision || 0,
                    tx_taxe: garantie.tx_taxe || 0
                });
            } else {
                setFormData({
                    id_produit: produit?.id_produit || '',
                    libelle_garantie: '',
                    num_ordre: '',
                    code_groupe_garantie: '',
                    est_obligatoire: false,
                    inclus_PF: false,
                    inclus_ValeurVenal: false,
                    inclus_surprime: false,
                    capital_deces: 0,
                    capital_invalidite: 0,
                    capital_fraismedicaux: 0,
                    tx_commision: 0,
                    tx_taxe: 0
                });
            }
        }
    }, [show, garantie, produit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = value;
        if (type === 'checkbox') {
            newValue = checked;
        }
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const parseNumber = (val) => {
            if (!val) return 0;
            if (typeof val === 'number') return val;
            return parseFloat(val.toString().replace(',', '.')) || 0;
        };

        const dataToSend = {
            ...formData,
            id_produit: produit.id_produit,
            id_garantie: garantie ? garantie.id_garantie : crypto.randomUUID(),
            capital_deces: parseNumber(formData.capital_deces),
            capital_invalidite: parseNumber(formData.capital_invalidite),
            capital_fraismedicaux: parseNumber(formData.capital_fraismedicaux),
            tx_commision: parseNumber(formData.tx_commision),
            tx_taxe: parseNumber(formData.tx_taxe),
            num_ordre: parseInt(formData.num_ordre) || 0
        };

        try {
            if (garantie) {
                await productsService.updateGarantie(garantie.id_garantie, dataToSend);
                alert("Garantie modifiée");
            } else {
                await productsService.createGarantie(dataToSend);
                alert("Garantie créée");
            }
            onHide();
        } catch (error) {
            console.error("Erreur enregistrement:", error);
            const msg = error.response ? `${error.response.status} - ${error.response.statusText}` : error.message;
            alert(`Erreur lors de l'enregistrement: ${msg}`);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onHide} style={{ zIndex: 1100 }}>
            <div className="produit-modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <div className="produit-modal-header">
                    <h2>
                        <i className={`bi ${garantie ? 'bi-pencil-square' : 'bi-plus-circle-dotted'}`}></i>
                        {garantie ? ' Modifier la garantie' : ' Nouvelle garantie'}
                    </h2>
                    <button className="close-btn" onClick={onHide}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="produit-modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {/* Section: Identification */}
                            <div className="section-title">Identification</div>

                            <div className="form-row" style={{ gridColumn: '1 / -1' }}>
                                <label>Libellé produit :</label>
                                <input type="text" value={produit?.lib_produit || ''} readOnly style={{ backgroundColor: '#f8f9fa' }} />
                            </div>

                            <div className="form-row">
                                <label>Libellé garantie :</label>
                                <input
                                    type="text"
                                    name="libelle_garantie"
                                    value={formData.libelle_garantie}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ex: Responsabilité Civile"
                                />
                            </div>

                            <div className="form-row">
                                <label>N° Ordre :</label>
                                <input
                                    type="number"
                                    name="num_ordre"
                                    value={formData.num_ordre}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-row">
                                <label>Groupe garantie :</label>
                                <select
                                    name="code_groupe_garantie"
                                    value={formData.code_groupe_garantie}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Sélectionner --</option>
                                    <option value="INCENDIE">Incendie</option>
                                    <option value="VOL">Vol</option>
                                    <option value="BDG">Bris de glace</option>
                                    <option value="RC">Responsabilité Civile</option>
                                    <option value="DEFENSE">Défense et Recours</option>
                                </select>
                            </div>

                            {/* Section: Options */}
                            <div className="section-title">Options & Configuration</div>

                            <div className="form-row">
                                <label>Puissance Fiscale :</label>
                                <input type="checkbox" id="pf" name="inclus_PF" checked={formData.inclus_PF} onChange={handleChange} style={{ width: 'auto' }} />
                            </div>

                            <div className="form-row">
                                <label>Implique surprime :</label>
                                <input type="checkbox" id="sp" name="inclus_surprime" checked={formData.inclus_surprime} onChange={handleChange} style={{ width: 'auto' }} />
                            </div>

                            <div className="form-row">
                                <label>Valeur Vénale :</label>
                                <input type="checkbox" id="vv" name="inclus_ValeurVenal" checked={formData.inclus_ValeurVenal} onChange={handleChange} style={{ width: 'auto' }} />
                            </div>

                            <div className="form-row">
                                <label>Obligatoire :</label>
                                <input type="checkbox" id="obl" name="est_obligatoire" checked={formData.est_obligatoire} onChange={handleChange} style={{ width: 'auto' }} />
                            </div>

                            {/* Section: Capitaux */}
                            <div className="section-title">Capitaux Assurés</div>

                            <div className="form-row">
                                <label>Décès :</label>
                                <input type="number" name="capital_deces" value={formData.capital_deces} onChange={handleChange} style={{ textAlign: 'right' }} />
                            </div>

                            <div className="form-row">
                                <label>Invalidité :</label>
                                <input type="number" name="capital_invalidite" value={formData.capital_invalidite} onChange={handleChange} style={{ textAlign: 'right' }} />
                            </div>

                            <div className="form-row full-width">
                                <label>Frais médicaux :</label>
                                <input type="number" name="capital_fraismedicaux" value={formData.capital_fraismedicaux} onChange={handleChange} style={{ textAlign: 'right' }} />
                            </div>

                            {/* Section: Commission */}
                            <div className="section-title">Commission et Taxe</div>

                            <div className="form-row">
                                <label>Taux Commission (%) :</label>
                                <input type="number" step="0.01" name="tx_commision" value={formData.tx_commision} onChange={handleChange} placeholder="0.00" style={{ textAlign: 'right', fontWeight: 'bold' }} />
                            </div>

                            <div className="form-row">
                                <label>Taux Taxe (%) :</label>
                                <input type="number" step="0.01" name="tx_taxe" value={formData.tx_taxe} onChange={handleChange} placeholder="0.00" style={{ textAlign: 'right', fontWeight: 'bold' }} />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="produit-modal-footer">
                    <button className="btn-footer-cancel" onClick={onHide}>
                        <i className="bi bi-x-lg"></i> Annuler
                    </button>
                    <button className="btn-footer-save" onClick={handleSubmit}>
                        <i className="bi bi-check-lg"></i> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GarantieFormModal;
