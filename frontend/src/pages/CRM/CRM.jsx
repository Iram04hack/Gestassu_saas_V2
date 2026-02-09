import React, { useState } from 'react';
import ClientList from './ClientList';
import ClientFormModal from './ClientFormModal';
import './CRM.css';

const CRM = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('personnes');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('personne');

    // Lifted State for Clients
    const [clients, setClients] = useState([]);

    const handleOpenModal = () => {
        // Set modal type based on active tab
        setModalType(activeTab === 'personnes' ? 'personne' : 'entreprise');
        setIsModalOpen(true);
    };

    const handleSaveClient = (newClient) => {
        setClients(prev => [newClient, ...prev]);
        // Also ensure we switch to the tab relevant to the new client if needed, or just let it appear
        if (newClient.type === 'Entreprise' && activeTab !== 'entreprises') {
            setActiveTab('entreprises');
        } else if (newClient.type === 'Client' && activeTab !== 'personnes') { // Assuming 'Client' is Personne
            // Actually badge logic: Client/Prospect. 
            // Logic: Personne vs Entreprise is usually a different filter or tab.
            // If tabs filter by type (Personne/Entreprise), we should ensure data has that distinction.
            // In mockData/ClientForm, we used 'type' for Badge (Client/Prospect). 
            // We need a 'category' or similar for Personne vs Entreprise.
            // For now, let's assume 'nom' vs 'raisonSocial' distinguishes, or add a category field.
            // In ClientFormModal I added 'type' (Personne/Entreprise) to details.
        }
    };

    return (
        <div className="crm-container">
            {/* Header Strip */}
            <div className="crm-header-strip">
                <h1>Gestion Relation Client</h1>
            </div>

            {/* Toolbar with Search, Tabs and Actions */}
            <div className="crm-toolbar">
                <div className="search-group">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Rechercher un client ou un prospect..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="crm-actions-group">
                    <div className="tab-switcher">
                        <button
                            className={`tab-btn ${activeTab === 'personnes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personnes')}
                        >
                            Personnes
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'entreprises' ? 'active' : ''}`}
                            onClick={() => setActiveTab('entreprises')}
                        >
                            Entreprises
                        </button>
                    </div>

                    <button className="btn-icon-action" title="Filtrer">
                        <i className="bi bi-funnel"></i>
                    </button>
                    <button className="btn-icon-action" title="Actualiser">
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>

                    <button className="btn-new" onClick={handleOpenModal}>
                        <i className="bi bi-person-plus-fill"></i> Nouveau Prospect
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <ClientList
                clients={clients}
                searchTerm={searchTerm}
                activeTab={activeTab}
            />

            {/* Modal */}
            <ClientFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveClient}
                defaultType={modalType}
            />
        </div>
    );
};

export default CRM;
