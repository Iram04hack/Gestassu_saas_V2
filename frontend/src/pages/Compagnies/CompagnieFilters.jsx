import React from 'react';
import './CompagnieFilters.css';

const CompagnieFilters = ({ filters, setFilters, onApply, onReset, isOpen }) => {
    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="compagnie-filters-dropdown">
            <div className="filters-panel">
                <div className="filters-header">
                    <h4>Filtres avancés</h4>
                </div>

                <div className="filters-grid">
                    {/* Nom de la compagnie */}
                    <div className="filter-group">
                        <label>Nom de la compagnie</label>
                        <input
                            type="text"
                            placeholder="Rechercher par nom..."
                            value={filters.nom}
                            onChange={(e) => handleChange('nom', e.target.value)}
                        />
                    </div>

                    {/* Numéro/Codification */}
                    <div className="filter-group">
                        <label>Numéro</label>
                        <input
                            type="text"
                            placeholder="Numéro de codification..."
                            value={filters.numero}
                            onChange={(e) => handleChange('numero', e.target.value)}
                        />
                    </div>

                    {/* Adresse */}
                    <div className="filter-group">
                        <label>Adresse</label>
                        <input
                            type="text"
                            placeholder="Rechercher par adresse..."
                            value={filters.adresse}
                            onChange={(e) => handleChange('adresse', e.target.value)}
                        />
                    </div>
                </div>

                <div className="filters-actions">
                    <button className="btn-reset-filters" onClick={onReset}>
                        <i className="bi bi-arrow-counterclockwise"></i> Réinitialiser
                    </button>
                    <button className="btn-apply-filters" onClick={onApply}>
                        <i className="bi bi-check-lg"></i> Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompagnieFilters;
