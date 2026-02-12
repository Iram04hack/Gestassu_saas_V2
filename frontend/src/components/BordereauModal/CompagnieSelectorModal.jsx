import React, { useState, useEffect } from 'react';
import compagniesService from '../../services/compagnies';
import './BordereauModal.css'; // Reusing styles and adding specific ones

const CompagnieSelectorModal = ({ isOpen, onClose, onSelect }) => {
    const [search, setSearch] = useState("");
    const [compagnies, setCompagnies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCompagnies();
        }
    }, [isOpen]);

    const fetchCompagnies = async (query = "") => {
        try {
            setLoading(true);
            const data = await compagniesService.getCompagnies({ search: query });
            const results = data.results || data || [];
            setCompagnies(results);
        } catch (error) {
            console.error("Erreur lors de la récupération des compagnies:", error);
            setCompagnies([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        fetchCompagnies(value);
    };

    if (!isOpen) return null;

    return (
        <div className="selector-modal-overlay" onClick={onClose}>
            <div className="selector-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="selector-modal-header">
                    <h3>Sélectionner une Compagnie</h3>
                    <button className="close-btn-minimal" onClick={onClose}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                <div className="selector-search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={search}
                        onChange={handleSearchChange}
                        autoFocus
                    />
                </div>

                <div className="selector-list-container">
                    {loading ? (
                        <div className="selector-loading">Chargement...</div>
                    ) : (
                        <ul className="selector-list">
                            {/* Static "All Companies" Option */}
                            {!search && (
                                <li
                                    className="selector-item all-companies-item"
                                    onClick={() => {
                                        onSelect({ id: 'all', nom_compagnie: 'Toutes les compagnies' });
                                        onClose();
                                    }}
                                >
                                    <div className="item-logo-container all-companies-icon">
                                        <i className="bi bi-layers-fill"></i>
                                    </div>
                                    <div className="item-details">
                                        <span className="item-name">Toutes les compagnies</span>
                                        <span className="item-code">Sélectionner tout</span>
                                    </div>
                                    <i className="bi bi-chevron-right arrow-select"></i>
                                </li>
                            )}

                            {compagnies.length > 0 ? (
                                compagnies.map((comp) => (
                                    <li
                                        key={comp.id}
                                        onClick={() => {
                                            onSelect(comp);
                                            onClose();
                                        }}
                                        className="selector-item"
                                    >
                                        <div className="item-logo-container">
                                            {comp.logo ? (
                                                <img src={comp.logo} alt={comp.nom_compagnie} className="item-logo" />
                                            ) : (
                                                <div className="item-icon">
                                                    <i className="bi bi-building"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <span className="item-name">{comp.nom_compagnie}</span>
                                            {comp.code && <span className="item-code">Code: {comp.code}</span>}
                                        </div>
                                        <i className="bi bi-chevron-right arrow-select"></i>
                                    </li>
                                ))
                            ) : search ? (
                                <div className="selector-empty">Aucune compagnie trouvée pour "{search}"</div>
                            ) : null}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompagnieSelectorModal;
