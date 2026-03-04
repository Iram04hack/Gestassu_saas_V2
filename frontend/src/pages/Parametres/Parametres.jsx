import React, { useState } from 'react';
import SocieteForm from './SocieteForm';
import AgencesTab from './AgencesTab';
import './Parametres.css';

const TABS = [
    { key: 'societe', label: 'Informations société', icon: 'bi-building' },
    { key: 'agences', label: 'Agences', icon: 'bi-geo-alt' },
];

const Parametres = () => {
    const [activeTab, setActiveTab] = useState('societe');

    return (
        <div className="parametres-container">
            <div className="parametres-header">
                <h1>
                    Gestion des sociétés
                </h1>
            </div>

            <div className="parametres-tabs-bar">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`parametres-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <i className={`bi ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="parametres-tab-content">
                {activeTab === 'societe' && <SocieteForm />}
                {activeTab === 'agences' && <AgencesTab />}
            </div>
        </div>
    );
};

export default Parametres;
