import React, { useState, useEffect } from 'react';
import productsService from '../../../services/products';
import GarantieFormModal from './GarantieFormModal';
import './GarantiesModal.css';

const GarantiesModal = ({ show, onHide, produit }) => {
    const [garanties, setGaranties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedGarantie, setSelectedGarantie] = useState(null);

    useEffect(() => {
        if (show && produit) {
            fetchGaranties();
            setShowForm(false);
            setSelectedGarantie(null);
        }
    }, [show, produit]);

    const fetchGaranties = async () => {
        setLoading(true);
        try {
            console.log("Fetching garanties for product:", produit.id_produit);
            const data = await productsService.getGaranties({ id_produit: produit.id_produit });
            console.log("Response:", data);
            setGaranties(data.results || data);
        } catch (error) {
            console.error("Erreur chargement garanties:", error);
            const msg = error.response ? `${error.response.status} - ${error.response.statusText}` : error.message;
            alert(`Erreur lors du chargement des garanties: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (garantie) => {
        setSelectedGarantie(garantie);
        setShowForm(true);
    };

    const handleAdd = () => {
        setSelectedGarantie(null);
        setShowForm(true);
    };

    const handleDelete = async (id_garantie, e) => {
        e.stopPropagation();
        if (!window.confirm("Voulez-vous vraiment supprimer cette garantie ?")) return;

        try {
            await productsService.deleteGarantie(id_garantie);
            alert("Garantie supprimée");
            fetchGaranties();
        } catch (error) {
            console.error("Erreur suppression:", error);
            alert("Erreur lors de la suppression");
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="garanties-modal-overlay" onClick={onHide}>
                <div className="garanties-modal" onClick={e => e.stopPropagation()}>
                    <div className="garanties-modal-header">
                        <h2>
                            <i className="bi bi-shield-check me-2"></i>
                            Garanties - {produit?.lib_produit}
                        </h2>
                        <button className="btn-close-modal" onClick={onHide}>&times;</button>
                    </div>

                    <div className="garanties-modal-body">
                        <div className="garanties-toolbar">
                            <button className="btn-add-garantie" onClick={handleAdd}>
                                <i className="bi bi-plus-lg"></i> Ajouter
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center p-4">Chargement...</div>
                        ) : (
                            <div className="garanties-table-container">
                                <table className="garanties-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60px' }}>N°</th>
                                            <th>Lib. Garantie</th>
                                            <th className="text-center">Obligatoire ?</th>
                                            <th className="text-end">Cap. Décès</th>
                                            <th className="text-end">Cap. Invalidité</th>
                                            <th className="text-end">Frais médicaux</th>
                                            <th className="text-end">Tx Commission</th>
                                            <th className="text-end">Taxe</th>
                                            <th style={{ width: '50px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {garanties.length === 0 ? (
                                            <tr>
                                                <td colSpan="9" className="text-center py-4 text-muted">
                                                    Aucune garantie configurée pour ce produit
                                                </td>
                                            </tr>
                                        ) : (
                                            garanties.map((g, index) => (
                                                <tr key={g.id_garantie} onClick={() => handleEdit(g)}>
                                                    <td>{g.num_ordre || index + 1}</td>
                                                    <td className="garantie-label">{g.libelle_garantie}</td>
                                                    <td className="text-center">
                                                        <input type="checkbox" checked={g.est_obligatoire} readOnly disabled />
                                                    </td>
                                                    <td className="text-end">{parseFloat(g.capital_deces || 0).toLocaleString()}</td>
                                                    <td className="text-end">{parseFloat(g.capital_invalidite || 0).toLocaleString()}</td>
                                                    <td className="text-end">{parseFloat(g.capital_fraismedicaux || 0).toLocaleString()}</td>
                                                    <td className="text-end">{g.tx_commision ? `${g.tx_commision} %` : '-'}</td>
                                                    <td className="text-end">{g.tx_taxe ? `${g.tx_taxe} %` : '-'}</td>
                                                    <td className="text-end">
                                                        <button className="btn-icon-action delete" onClick={(e) => handleDelete(g.id_garantie, e)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <GarantieFormModal
                show={showForm}
                onHide={() => { setShowForm(false); fetchGaranties(); }}
                garantie={selectedGarantie}
                produit={produit}
            />
        </>
    );
};

export default GarantiesModal;
