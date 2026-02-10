import React, { useState, useEffect } from 'react';
import { getTypeMouvements } from '../../services/finances';

const MovementTypeSelectionModal = ({ isOpen, onClose, onSelect }) => {
    const [types, setTypes] = useState([]);
    const [filteredTypes, setFilteredTypes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadTypes();
        }
    }, [isOpen]);

    useEffect(() => {
        if (types.length > 0) {
            const filtered = types.filter(t =>
                t.lib_type_mouvement && t.lib_type_mouvement.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredTypes(filtered);
        }
    }, [search, types]);

    const loadTypes = async () => {
        try {
            setLoading(true);
            const data = await getTypeMouvements();
            setTypes(data);
            setFilteredTypes(data);
        } catch (err) {
            console.error('Erreur chargement types:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .type-modal-content {
                    background: white;
                    border-radius: 4px;
                    width: 600px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .type-modal-header {
                    background: #6d4c41;
                    color: white;
                    padding: 10px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .type-modal-title { font-size: 1.1rem; font-weight: 500; margin: 0; }
                .modal-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
                .type-modal-body {
                    padding: 15px;
                    overflow-y: auto;
                    flex: 1;
                }
                .search-bar {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .search-input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #d7ccc8;
                    border-radius: 20px;
                    font-size: 0.9rem;
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
                .btn-add { background: transparent; color: white; border: none; cursor: pointer; display: flex; align-items: center; gap: 5px; }

                .types-table { width: 100%; border-collapse: collapse; }
                .types-table th {
                    text-align: left;
                    padding: 10px;
                    border-bottom: 1px solid #ddd;
                    color: #777;
                    font-weight: normal;
                    font-size: 0.85rem;
                }
                .types-table td {
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                    font-size: 0.9rem;
                }
                .types-table tr:hover { background: #fafafa; cursor: pointer; }
                
                .badge-type {
                    padding: 4px 10px;
                    border-radius: 4px;
                    color: white;
                    font-size: 0.8rem;
                    display: inline-block;
                    min-width: 60px;
                    text-align: center;
                }
                .badge-debit { background: #ef5350; }
                .badge-credit { background: #66bb6a; }
            `}</style>

            <div className="type-modal-content">
                <div className="type-modal-header">
                    <h3 className="type-modal-title">Type mouvement</h3>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button className="btn-add"><i className="bi bi-plus"></i> Ajouter</button>
                        <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                    </div>
                </div>

                <div className="type-modal-body">
                    <div className="search-bar">
                        <div style={{ position: 'relative', flex: 1 }}>
                            <i className="bi bi-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}></i>
                            <input
                                type="text"
                                className="search-input"
                                style={{ paddingLeft: '35px' }}
                                placeholder="Rechercher un type mouvement"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn-action btn-icon-only" title="Filtrer"><i className="bi bi-funnel"></i></button>
                        <button className="btn-action btn-icon-only" onClick={() => setSearch('')} title="Réinitialiser"><i className="bi bi-arrow-counterclockwise"></i></button>
                    </div>

                    <table className="types-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}></th>
                                <th>Lib. Type mouvement</th>
                                <th style={{ width: '30px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Chargement...</td></tr>
                            ) : filteredTypes.map(type => (
                                <tr key={type.id_type_mvt} onClick={() => onSelect(type)}>
                                    <td>
                                        <span className={`badge-type ${type.type_op ? 'badge-credit' : 'badge-debit'}`}>
                                            {type.type_op ? 'Crédit' : 'Débit'}
                                        </span>
                                    </td>
                                    <td>{type.lib_type_mouvement}</td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MovementTypeSelectionModal;
