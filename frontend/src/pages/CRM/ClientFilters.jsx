import React from 'react';
import { civilities, legalForms } from '../../constants/legalForms';
import './ClientFilters.css';

const ClientFilters = ({ filters, setFilters, onApply, onReset, isOpen, activeTab }) => {
    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Déterminer les options de qualité selon l'onglet actif
    const qualiteOptions = activeTab === 'entreprises' ? legalForms : civilities;
    const qualiteLabel = activeTab === 'entreprises' ? 'Forme Juridique' : 'Qualité';

    return (
        <div className="client-filters-dropdown">
            <div className="filters-panel">
                <div className="filters-header">
                    <h4>Filtres avancés</h4>
                </div>

                <div className="filters-grid">
                    {/* Type Client/Prospect */}
                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={filters.typeClient}
                            onChange={(e) => handleChange('typeClient', e.target.value)}
                        >
                            <option value="">Tous</option>
                            <option value="Client">Client</option>
                            <option value="Prospect">Prospect</option>
                        </select>
                    </div>

                    {/* Qualité (Civilité ou Forme Juridique) */}
                    <div className="filter-group">
                        <label>{qualiteLabel}</label>
                        <select
                            value={filters.qualite}
                            onChange={(e) => handleChange('qualite', e.target.value)}
                        >
                            <option value="">Toutes</option>
                            {qualiteOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
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

export default ClientFilters;
