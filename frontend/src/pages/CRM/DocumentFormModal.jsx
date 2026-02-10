import React, { useState } from 'react';
import { createDocument } from '../../services/documents';

const DocumentFormModal = ({ isOpen, onClose, client, onSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [titre, setTitre] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedFile || !titre) {
            alert('Veuillez sélectionner un fichier et saisir un titre');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('fichier', selectedFile);
            formData.append('titre_document', titre);
            formData.append('id_client', client.id);

            await createDocument(formData);
            if (onSuccess) onSuccess();
            onClose();
            setSelectedFile(null);
            setTitre('');
        } catch (err) {
            console.error('Erreur création document:', err);
            alert('Erreur lors de l\'ajout du document');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <style>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 1000;
                }
                .doc-modal-content {
                    background: white; width: 600px; max-width: 95vw;
                    border-radius: 4px; overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                .doc-modal-header {
                    background: #6d4c41; color: white; padding: 15px;
                    font-size: 1.1rem; font-weight: 500;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-close {
                    background: none; border: none; color: white;
                    font-size: 1.5rem; cursor: pointer;
                }
                .doc-modal-body { padding: 30px; }
                .file-upload-area {
                    border: 2px dashed #ccc;
                    border-radius: 4px;
                    padding: 40px;
                    text-align: center;
                    margin-bottom: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .file-upload-area:hover { border-color: #6d4c41; background: #fafafa; }
                .file-upload-icon { font-size: 4rem; color: #d32f2f; margin-bottom: 10px; }
                .file-upload-text { color: #666; margin-bottom: 10px; }
                .file-upload-button {
                    background: #6d4c41; color: white; border: none;
                    padding: 8px 20px; border-radius: 4px; cursor: pointer;
                    display: inline-flex; align-items: center; gap: 6px;
                }
                .file-upload-button:hover { background: #5d4037; }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-label {
                    display: block; margin-bottom: 5px; font-weight: 500; color: #333;
                }
                .form-input {
                    width: 100%; padding: 8px 12px; border: 1px solid #ccc;
                    border-radius: 4px; font-size: 0.9rem;
                }
                .doc-modal-footer {
                    padding: 15px; background: #f5f5f5; display: flex;
                    justify-content: center; gap: 15px;
                }
                .btn-cancel, .btn-save {
                    padding: 8px 20px; border-radius: 20px; border: none;
                    cursor: pointer; display: flex; align-items: center; gap: 5px;
                }
                .btn-cancel { background: #6d4c41; color: white; }
                .btn-save { background: #6d4c41; color: white; }
            `}</style>

            <div className="doc-modal-content">
                <div className="doc-modal-header">
                    <span>Fiche document</span>
                    <button className="modal-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="doc-modal-body">
                        <div className="file-upload-area" onClick={() => document.getElementById('fileInput').click()}>
                            <i className="bi bi-file-earmark-pdf file-upload-icon"></i>
                            <div className="file-upload-text">
                                {selectedFile ? selectedFile.name : 'PDF'}
                            </div>
                            <button type="button" className="file-upload-button">
                                <i className="bi bi-file-earmark"></i>
                                Sélectionner un document
                            </button>
                            <input
                                id="fileInput"
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Titre du document :</label>
                            <input
                                type="text"
                                className="form-input"
                                value={titre}
                                onChange={(e) => setTitre(e.target.value)}
                                placeholder="Saisir le titre du document"
                            />
                        </div>
                    </div>

                    <div className="doc-modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            <i className="bi bi-x-lg"></i> Annuler
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            <i className="bi bi-check-lg"></i> {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentFormModal;
