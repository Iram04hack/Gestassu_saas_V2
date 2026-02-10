import React, { useState, useEffect } from 'react';
import { getDocumentsByClient, deleteDocument } from '../../services/documents';
import DocumentFormModal from './DocumentFormModal';

const ClientDocuments = ({ client }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (client) {
            loadDocuments();
        }
    }, [client]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await getDocumentsByClient(client.id);
            setDocuments(data.results || data || []);
        } catch (err) {
            console.error('Erreur chargement documents:', err);
            setError('Impossible de charger les documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            try {
                await deleteDocument(documentId);
                loadDocuments();
            } catch (err) {
                console.error('Erreur suppression document:', err);
                alert('Impossible de supprimer le document');
            }
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.titre_document && doc.titre_document.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="client-documents">
            <style>{`
                .client-documents { padding: 20px; }
                .documents-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 15px;
                }
                .search-bar {
                    flex: 1;
                    position: relative;
                }
                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #999;
                }
                .search-input {
                    width: 100%;
                    padding: 8px 12px 8px 40px;
                    border: 1px solid #d7ccc8;
                    border-radius: 4px;
                    font-size: 0.9rem;
                }
                .header-actions {
                    display: flex;
                    gap: 10px;
                }
                .btn-action {
                    padding: 8px 14px;
                    border: 1px solid #d7ccc8;
                    background: transparent;
                    color: #8d6e63;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .btn-action:hover {
                    background: #f5f5f5;
                    border-color: #8d6e63;
                }
                .btn-icon-only {
                    padding: 8px;
                    min-width: 36px;
                    justify-content: center;
                }
                .btn-icon-only i {
                    font-size: 1.1rem;
                }
                .btn-new { 
                    background: #6d4c41; 
                    color: white; 
                    border-color: #6d4c41;
                }
                .btn-new:hover { 
                    background: #5d4037; 
                    border-color: #5d4037;
                }
                
                .documents-section {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .section-title {
                    font-size: 1rem;
                    color: #5d4037;
                    margin-bottom: 15px;
                    font-weight: 600;
                }
                .documents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 15px;
                }
                .document-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                    padding: 15px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .document-card:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    border-color: #6d4c41;
                }
                .document-icon {
                    font-size: 3rem;
                    color: #6d4c41;
                    margin-bottom: 10px;
                }
                .document-title {
                    font-size: 0.9rem;
                    color: #333;
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                .document-date {
                    font-size: 0.75rem;
                    color: #999;
                }
                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: #999;
                }
            `}</style>

            <DocumentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                client={client}
                onSuccess={loadDocuments}
            />

            <div className="documents-header">
                <div className="search-bar">
                    <i className="bi bi-search search-icon"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Rechercher un document"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="header-actions">
                    <button className="btn-action btn-icon-only" title="Filtrer">
                        <i className="bi bi-funnel"></i>
                    </button>
                    <button className="btn-action btn-icon-only" onClick={loadDocuments} title="Rafraîchir">
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                    <button className="btn-action btn-new" onClick={() => setIsModalOpen(true)}>
                        <i className="bi bi-plus-circle"></i> Nouveau
                    </button>
                </div>
            </div>

            <div className="documents-section">
                <h3 className="section-title">Document du client</h3>

                {loading ? (
                    <div className="empty-state">Chargement...</div>
                ) : error ? (
                    <div className="empty-state" style={{ color: '#d32f2f' }}>{error}</div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-file-earmark" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}></i>
                        <p>Aucun document</p>
                    </div>
                ) : (
                    <div className="documents-grid">
                        {filteredDocuments.map(doc => (
                            <div key={doc.iddocuments} className="document-card">
                                <i className="bi bi-file-earmark-pdf document-icon"></i>
                                <div className="document-title">{doc.titre_document || 'Sans titre'}</div>
                                <div className="document-date">
                                    {doc.date_enreg ? new Date(doc.date_enreg).toLocaleDateString('fr-FR') : '-'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDocuments;
