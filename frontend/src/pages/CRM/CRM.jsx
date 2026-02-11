import React, { useState, useEffect, useCallback } from 'react';
import ClientList from './ClientList';
import ClientFormModal from './ClientFormModal';
import ClientFilters from './ClientFilters';
import crmService from '../../services/crm';
import './CRM.css';

const CRM = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('personnes');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('personne');

    // Lifted State for Clients
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        typeClient: '',
        qualite: ''
    });

    // Debounce search term and reload on filter/tab changes
    useEffect(() => {
        const timer = setTimeout(() => {
            loadClients();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, activeTab, filters]); // loadClients is stable now

    const loadClients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Filtrer par type selon l'onglet actif et terme de recherche
            const params = {
                est_entreprise: activeTab === 'entreprises' ? 'true' : 'false',
                search: searchTerm
            };

            const response = await crmService.getClients(params);

            // Transformer les données de l'API pour correspondre au format attendu par ClientList
            let transformedClients = response.results ? response.results.map(client => ({
                id: client.id_client,
                type: client.type_client || (client.est_entreprise ? 'Entreprise' : 'Client'), // Badge type (Client/Prospect)
                qualite: client.civilite || '-',
                nom: client.nom_complet || `${client.prenom_client || ''} ${client.nom_client || ''}`.trim(),
                adresse: client.adresse || '-',
                origine: client.source || '-',
                createur: client.enregistre_par || '-',
                conseiller: '-', // À implémenter plus tard
                contacts: [
                    client.telephone && { type: 'phone', value: client.telephone },
                    client.email && { type: 'email', value: client.email }
                ].filter(Boolean),
                details: {
                    type: client.est_entreprise ? 'entreprise' : 'personne',
                    ...client
                }
            })) : [];

            // Filtrage frontend pour typeClient et qualite (Optimisation: fait ici pour éviter trop de requêtes)
            if (filters.typeClient) {
                transformedClients = transformedClients.filter(c => c.type === filters.typeClient);
            }
            if (filters.qualite) {
                transformedClients = transformedClients.filter(c => c.qualite === filters.qualite);
            }

            setClients(transformedClients);
        } catch (err) {
            console.error('Erreur lors du chargement des clients:', err);
            setError('Impossible de charger les clients. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm, filters]);

    const handleDeleteClient = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce client ?')) {
            try {
                await crmService.deleteClient(id);
                // Rafraîchir la liste
                loadClients();
            } catch (err) {
                console.error('Erreur lors de la suppression du client:', err);
                alert('Impossible de supprimer le client. Veuillez réessayer.');
            }
        }
    };

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

    const handleApplyFilters = () => {
        setShowFilters(false);
        // loadClients will be called automatically via useEffect
    };

    const handleResetFilters = () => {
        setFilters({
            typeClient: '',
            qualite: ''
        });
        setShowFilters(false);
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

                    <div style={{ position: 'relative' }}>
                        <button
                            className={`btn-icon-action ${showFilters ? 'active' : ''}`}
                            title="Filtrer"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <i className="bi bi-funnel"></i>
                        </button>

                        <ClientFilters
                            filters={filters}
                            setFilters={setFilters}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            isOpen={showFilters}
                            activeTab={activeTab}
                        />
                    </div>

                    <button className="btn-icon-action" title="Actualiser" onClick={loadClients}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>

                    <button className="btn-new" onClick={handleOpenModal}>
                        <i className="bi bi-person-plus-fill"></i> Nouveau Prospect
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8d6e63' }}>
                    <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                    <p>Chargement des clients...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
                    <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                    <p>{error}</p>
                    <button className="btn-new" onClick={loadClients} style={{ marginTop: '16px' }}>
                        Réessayer
                    </button>
                </div>
            ) : (
                <ClientList
                    clients={clients}
                    searchTerm={searchTerm}
                    activeTab={activeTab}
                    onDelete={handleDeleteClient}
                />
            )}

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
