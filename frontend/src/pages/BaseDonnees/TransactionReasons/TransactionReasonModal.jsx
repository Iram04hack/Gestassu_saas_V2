import React, { useState, useEffect } from 'react';
import financesService from '../../../services/financesService';
import '../../Commerciaux/Commerciaux.css'; // Reusing modal styles

const TransactionReasonModal = ({ isOpen, onClose, onSave, reason }) => {
    const [formData, setFormData] = useState({
        lib_type_mouvement: '',
        type_op: false // false = Debit, true = Credit (Assuming convention based on user input)
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (reason) {
            setFormData({
                lib_type_mouvement: reason.lib_type_mouvement || '',
                type_op: reason.type_op
            });
        } else {
            setFormData({
                lib_type_mouvement: '',
                type_op: false
            });
        }
    }, [reason, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (reason) {
                await financesService.updateTypeMouvement(reason.id_type_mvt, formData);
            } else {
                await financesService.createTypeMouvement(formData);
            }
            onSave();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Une erreur est survenue lors de l\'enregistrement.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
            <div className="modal-content" style={{ maxWidth: '500px', borderRadius: '8px', overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: '15px 20px' }}>
                    <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="bi bi-card-list" style={{ background: 'white', color: '#6d4c41', padding: '3px', borderRadius: '4px' }}></i>
                        {reason ? 'Modifier type mouvement' : 'Fiche type mouvement'}
                    </h2>
                    <button onClick={onClose} className="btn-close">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="modal-body" style={{ padding: '30px' }}>
                        <div className="form-group" style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
                                Intitulé du mouvement :
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.lib_type_mouvement}
                                onChange={(e) => setFormData({ ...formData, lib_type_mouvement: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '1px solid #1976d2', // Blue border as in screenshot
                                    borderRadius: '4px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '10px', color: '#333', fontWeight: '500' }}>
                                Type mouvement :
                            </label>
                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="type_op"
                                        checked={formData.type_op === true}
                                        onChange={() => setFormData({ ...formData, type_op: true })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span>Crédit</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="type_op"
                                        checked={formData.type_op === false}
                                        onChange={() => setFormData({ ...formData, type_op: false })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <span>Débit</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '20px',
                        borderTop: 'none',
                        background: 'transparent'
                    }}>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                maxWidth: '300px',
                                padding: '10px 20px',
                                background: '#5d4037', // Brown color matching screenshot
                                fontSize: '1rem',
                                borderRadius: '30px'
                            }}
                        >
                            <i className="bi bi-check2" style={{ marginRight: '5px' }}></i>
                            {loading ? 'Enregistrement...' : 'Enregistrer le type mouvement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionReasonModal;
