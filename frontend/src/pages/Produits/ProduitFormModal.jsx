import React, { useState, useEffect } from 'react';
import './ProduitFormModal.css';
import productsService from '../../services/products';
import compagniesService from '../../services/compagnies';

const ProduitFormModal = ({ isOpen, onClose, onSave, produit }) => {
    const [formData, setFormData] = useState({
        id_produit: '',
        codification_produit: '',
        lib_produit: '',
        Id_compagnie: '',
        code_groupe_prod: '',
        branche: '',
        type_risque: '',
        taux_commission: '',
        montant_fixe_commission: '',
        taux_taxe: '',
        frais_gestion: '',
        frais_adhesion: '',
        taux_frais_gestion: '',
        taux_com_premiere_an: '',
        taux_com_an_suivant: ''
    });

    const [compagnies, setCompagnies] = useState([]);
    const [groupes, setGroupes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pre-fill form when editing
    useEffect(() => {
        if (produit) {
            setFormData({
                id_produit: produit.id_produit || '',
                codification_produit: produit.codification_produit || '',
                lib_produit: produit.lib_produit || '',
                Id_compagnie: produit.Id_compagnie || '',
                code_groupe_prod: produit.code_groupe_prod || '',
                branche: produit.branche || '',
                type_risque: produit.type_risque || '',
                taux_commission: produit.taux_commission || '',
                montant_fixe_commission: produit.montant_fixe_commission || '',
                taux_taxe: produit.taux_taxe || '',
                frais_gestion: produit.frais_gestion || '',
                frais_adhesion: produit.frais_adhesion || '',
                taux_frais_gestion: produit.taux_frais_gestion || '',
                taux_com_premiere_an: produit.taux_com_premiere_an || '',
                taux_com_an_suivant: produit.taux_com_an_suivant || ''
            });
        } else {
            // Reset form for new product
            setFormData({
                id_produit: '',
                codification_produit: '',
                lib_produit: '',
                Id_compagnie: '',
                code_groupe_prod: '',
                branche: '',
                type_risque: '',
                taux_commission: '',
                montant_fixe_commission: '',
                taux_taxe: '',
                frais_gestion: '',
                frais_adhesion: '',
                taux_frais_gestion: '',
                taux_com_premiere_an: '',
                taux_com_an_suivant: ''
            });
        }
    }, [produit, isOpen]);

    // Load compagnies and groupes
    useEffect(() => {
        if (isOpen) {
            loadCompagnies();
            loadGroupes();
        }
    }, [isOpen]);

    const loadCompagnies = async () => {
        try {
            const response = await compagniesService.getCompagnies();
            setCompagnies(response.results || []);
        } catch (err) {
            console.error('Erreur lors du chargement des compagnies:', err);
        }
    };

    const loadGroupes = async () => {
        try {
            const response = await productsService.getGroupes();
            setGroupes(response.results || []);
        } catch (err) {
            console.error('Erreur lors du chargement des groupes:', err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (produit) {
                // Update existing product
                await productsService.updateProduct(formData.id_produit, formData);
            } else {
                // Create new product
                await productsService.createProduct(formData);
            }
            onSave();
            onClose();
        } catch (err) {
            console.error('Erreur lors de l\'enregistrement:', err);
            alert('Erreur lors de l\'enregistrement du produit.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="modal-overlay">
            <div className="produit-modal-container">
                <div className="produit-modal-header">
                    <h2>{produit ? 'Modifier le produit' : 'Nouveau produit'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="produit-modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-row">
                                <label>Numéro Produit :</label>
                                <input
                                    type="text"
                                    value={formData.codification_produit}
                                    onChange={(e) => handleChange('codification_produit', e.target.value)}
                                    placeholder="Ex: PROD001"
                                />
                            </div>

                            <div className="form-row">
                                <label>Compagnie :</label>
                                <select
                                    value={formData.Id_compagnie}
                                    onChange={(e) => handleChange('Id_compagnie', e.target.value)}
                                    required
                                >
                                    <option value="">Sélectionner une compagnie</option>
                                    {compagnies.map(comp => (
                                        <option key={comp.id_compagnie} value={comp.id_compagnie}>
                                            {comp.nom_compagnie}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row full-width">
                                <label>Libellé :</label>
                                <input
                                    type="text"
                                    value={formData.lib_produit}
                                    onChange={(e) => handleChange('lib_produit', e.target.value)}
                                    required
                                    placeholder="Ex: Assurance Automobile Tous Risques"
                                />
                            </div>

                            <div className="form-row">
                                <label>Groupe de produit :</label>
                                <select
                                    value={formData.code_groupe_prod}
                                    onChange={(e) => handleChange('code_groupe_prod', e.target.value)}
                                >
                                    <option value="">Sélectionner un groupe</option>
                                    {groupes.map(grp => (
                                        <option key={grp.code_groupe_prod} value={grp.code_groupe_prod}>
                                            {grp.lib_groupe_prod}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <label>Branche :</label>
                                <select
                                    value={formData.branche}
                                    onChange={(e) => handleChange('branche', e.target.value)}
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="IARD">IARD</option>
                                    <option value="Vie">Vie</option>
                                </select>
                            </div>

                            <div className="form-row full-width">
                                <label>Type de risque :</label>
                                <input
                                    type="text"
                                    value={formData.type_risque}
                                    onChange={(e) => handleChange('type_risque', e.target.value)}
                                    placeholder="Ex: Personne, Véhicule, Bâtiment"
                                />
                            </div>

                            <div className="section-title">COMMISSIONS</div>

                            <div className="form-row">
                                <label>Taux commission (%) :</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.taux_commission}
                                    onChange={(e) => handleChange('taux_commission', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-row">
                                <label>Commission fixe :</label>
                                <input
                                    type="number"
                                    value={formData.montant_fixe_commission}
                                    onChange={(e) => handleChange('montant_fixe_commission', e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-row">
                                <label>Tx com. 1ère année (%) :</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.taux_com_premiere_an}
                                    onChange={(e) => handleChange('taux_com_premiere_an', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-row">
                                <label>Tx com. années suivantes (%) :</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.taux_com_an_suivant}
                                    onChange={(e) => handleChange('taux_com_an_suivant', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="section-title">FRAIS ET TAXES</div>

                            <div className="form-row">
                                <label>Frais de gestion :</label>
                                <input
                                    type="number"
                                    value={formData.frais_gestion}
                                    onChange={(e) => handleChange('frais_gestion', e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-row">
                                <label>Frais d'adhésion :</label>
                                <input
                                    type="number"
                                    value={formData.frais_adhesion}
                                    onChange={(e) => handleChange('frais_adhesion', e.target.value)}
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-row">
                                <label>Taux frais gestion (%) :</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.taux_frais_gestion}
                                    onChange={(e) => handleChange('taux_frais_gestion', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-row">
                                <label>Taux taxe :</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.taux_taxe}
                                    onChange={(e) => handleChange('taux_taxe', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="produit-modal-footer">
                    <button className="btn-footer-cancel" onClick={onClose} disabled={loading}>
                        <i className="bi bi-x-lg"></i> Annuler
                    </button>
                    <button className="btn-footer-save" onClick={handleSubmit} disabled={loading}>
                        <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProduitFormModal;
