import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import crmService from '../../services/crm';
import ClientOverview from './ClientOverview';
import ClientInteractions from './ClientInteractions';
import ClientContracts from './ClientContracts';
import ClientAccount from './ClientAccount';
import ClientFormModal from './ClientFormModal';
import './ClientDetails.css';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        loadClientDetails();
    }, [id]);

    const loadClientDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await crmService.getClientDetails(id);
            setClient(data);
        } catch (err) {
            console.error('Erreur lors du chargement des détails du client:', err);
            setError('Impossible de charger les détails du client.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClient = async (updatedData) => {
        try {
            await crmService.updateClient(id, updatedData);
            await loadClientDetails(); // Recharger les données
            setIsEditModalOpen(false);
        } catch (err) {
            console.error('Erreur lors de la mise à jour du client:', err);
            alert('Impossible de mettre à jour le client.');
        }
    };

    if (loading) {
        return (
            <div className="client-details-loading">
                <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                <p>Chargement des détails...</p>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="client-details-error">
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '2rem' }}></i>
                <p>{error || 'Client introuvable'}</p>
                <button className="btn-back" onClick={() => navigate('/crm')}>
                    <i className="bi bi-arrow-left"></i> Retour à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="client-details-container">
            {/* Header */}
            <div className="client-details-header">
                <button className="btn-back" onClick={() => navigate('/crm')}>
                    <i className="bi bi-arrow-left"></i> Retour
                </button>
                <div className="client-header-info">
                    <div className="client-avatar">
                        <i className="bi bi-person-circle"></i>
                    </div>
                    <div className="client-header-text">
                        <h1>{client.nom_complet}</h1>
                        <span className={`badge ${client.type_client.toLowerCase()}`}>
                            {client.type_client}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content with Sidebar */}
            <div className="client-details-main">
                {/* Sidebar Navigation */}
                <div className="client-details-sidebar">
                    <button
                        className={`sidebar-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="bi bi-person-badge"></i>
                        <span>Vue d'ensemble</span>
                    </button>
                    <button
                        className={`sidebar-tab ${activeTab === 'interactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('interactions')}
                    >
                        <i className="bi bi-chat-dots"></i>
                        <span>Interactions</span>
                    </button>
                    <button
                        className={`sidebar-tab ${activeTab === 'contrats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contrats')}
                    >
                        <i className="bi bi-file-earmark-text"></i>
                        <span>Contrats</span>
                    </button>
                    <button
                        className={`sidebar-tab ${activeTab === 'compte' ? 'active' : ''}`}
                        onClick={() => setActiveTab('compte')}
                    >
                        <i className="bi bi-wallet2"></i>
                        <span>Compte du client</span>
                    </button>
                    <button
                        className={`sidebar-tab ${activeTab === 'documents' ? 'active' : ''}`}
                        onClick={() => setActiveTab('documents')}
                    >
                        <i className="bi bi-folder"></i>
                        <span>Documents</span>
                    </button>
                    <button
                        className={`sidebar-tab ${activeTab === 'taches' ? 'active' : ''}`}
                        onClick={() => setActiveTab('taches')}
                    >
                        <i className="bi bi-list-check"></i>
                        <span>Tâches</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="client-details-content">
                    {activeTab === 'overview' && (
                        <ClientOverview
                            client={client}
                            onEdit={() => setIsEditModalOpen(true)}
                        />
                    )}
                    {activeTab === 'interactions' && (
                        <ClientInteractions
                            clientId={id}
                            clientName={client.nom_complet}
                        />
                    )}
                    {activeTab === 'contrats' && (
                        <ClientContracts clientId={id} />
                    )}
                    {activeTab === 'compte' && (
                        <ClientAccount client={client} />
                    )}
                    {activeTab === 'documents' && (
                        <div className="tab-placeholder">
                            <i className="bi bi-folder" style={{ fontSize: '3rem' }}></i>
                            <p>Module Documents à venir</p>
                        </div>
                    )}
                    {activeTab === 'taches' && (
                        <div className="tab-placeholder">
                            <i className="bi bi-list-check" style={{ fontSize: '3rem' }}></i>
                            <p>Module Tâches à venir</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <ClientFormModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleUpdateClient}
                    defaultType={client.est_entreprise ? 'entreprise' : 'personne'}
                    initialData={client}
                    isEditMode={true}
                />
            )}
        </div>
    );
};

export default ClientDetails;
