import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth';
import './Login.css';

const Login = () => {
    const [view, setView] = useState('login'); // 'login', 'change_id', 'change_password'

    // Login State
    const [credentials, setCredentials] = useState({ login: '', password: '' });

    // Change ID State
    const [idData, setIdData] = useState({ oldLogin: '', password: '', newLogin: '' });

    // Change Password State
    const [pwdData, setPwdData] = useState({ login: '', oldPassword: '', newPassword: '' });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e, stateSetter, state) => {
        stateSetter({ ...state, [e.target.name]: e.target.value });
        setError('');
        setSuccess('');
    };

    // Handle Login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await AuthService.login(credentials);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login Error:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Identifiant ou mot de passe incorrect.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Mock Handlers for Updates (Backend logic not strictly defined yet, simulating success)
    const handleUpdateId = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(`Identifiant modifié avec succès ! Votre nouvel identifiant est : ${idData.newLogin}`);
            // Optional: Auto-switch back to login or fill login field
        }, 1500);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess('Mot de passe modifié avec succès ! Vous pouvez maintenant vous connecter.');
        }, 1500);
    };

    return (
        <div className="login-body">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>

            <div className="login-container">
                <div className="header">
                    <div className="logo-icon-login">
                        <i className="bi bi-shield-check"></i>
                    </div>
                    <div className="logo">GestAssu</div>
                    <p className="subtitle">
                        {view === 'login' && 'Plateforme de courtage en assurance'}
                        {view === 'change_id' && 'Configuration de l\'identifiant'}
                        {view === 'change_password' && 'Modification du mot de passe'}
                    </p>
                </div>

                {error && <div className="messages error"><i className="bi bi-exclamation-circle"></i> {error}</div>}
                {success && <div className="messages success"><i className="bi bi-check-circle"></i> {success}</div>}

                {/* LOGIN VIEW */}
                {view === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="fade-in">
                        <div className="form-group">
                            <label htmlFor="login">Identifiant</label>
                            <div className="input-wrapper">
                                <i className="bi bi-person input-icon"></i>
                                <input type="text" id="login" name="login" placeholder="Votre nom d'utilisateur"
                                    value={credentials.login} onChange={(e) => handleChange(e, setCredentials, credentials)} required disabled={loading} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <div className="input-wrapper">
                                <i className="bi bi-lock input-icon"></i>
                                <input type="password" id="password" name="password" placeholder="••••••••"
                                    value={credentials.password} onChange={(e) => handleChange(e, setCredentials, credentials)} required disabled={loading} />
                            </div>
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>

                        <div className="auth-options">
                            <button type="button" className="btn-link" onClick={() => { setView('change_id'); setError(''); setSuccess(''); }}>
                                Modifier mon Identifiant
                            </button>
                            <span className="divider">•</span>
                            <button type="button" className="btn-link" onClick={() => { setView('change_password'); setError(''); setSuccess(''); }}>
                                Modifier Mot de Passe
                            </button>
                        </div>
                    </form>
                )}

                {/* CHANGE ID VIEW */}
                {view === 'change_id' && (
                    <form onSubmit={handleUpdateId} className="fade-in">
                        <div className="form-group">
                            <label>Ancien Identifiant</label>
                            <div className="input-wrapper">
                                <i className="bi bi-person-dash input-icon"></i>
                                <input type="text" name="oldLogin" placeholder="Identifiant actuel"
                                    value={idData.oldLogin} onChange={(e) => handleChange(e, setIdData, idData)} required disabled={loading} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Mot de passe actuel</label>
                            <div className="input-wrapper">
                                <i className="bi bi-lock input-icon"></i>
                                <input type="password" name="password" placeholder="Confirmation requise"
                                    value={idData.password} onChange={(e) => handleChange(e, setIdData, idData)} required disabled={loading} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Nouvel Identifiant</label>
                            <div className="input-wrapper">
                                <i className="bi bi-person-plus input-icon"></i>
                                <input type="text" name="newLogin" placeholder="Nouvel identifiant souhaité"
                                    value={idData.newLogin} onChange={(e) => handleChange(e, setIdData, idData)} required disabled={loading} />
                            </div>
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Traitement...' : 'Enregistrer le nouvel ID'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setView('login')}>
                            <i className="bi bi-arrow-left"></i> Retour
                        </button>
                    </form>
                )}

                {/* CHANGE PASSWORD VIEW */}
                {view === 'change_password' && (
                    <form onSubmit={handleUpdatePassword} className="fade-in">
                        <div className="form-group">
                            <label>Identifiant</label>
                            <div className="input-wrapper">
                                <i className="bi bi-person input-icon"></i>
                                <input type="text" name="login" placeholder="Votre identifiant"
                                    value={pwdData.login} onChange={(e) => handleChange(e, setPwdData, pwdData)} required disabled={loading} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Nouveau Mot de passe</label>
                            <div className="input-wrapper">
                                <i className="bi bi-key input-icon"></i>
                                <input type="password" name="newPassword" placeholder="Nouveau mot de passe"
                                    value={pwdData.newPassword} onChange={(e) => handleChange(e, setPwdData, pwdData)} required disabled={loading} />
                            </div>
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Traitement...' : 'Modifier le mot de passe'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setView('login')}>
                            <i className="bi bi-arrow-left"></i> Retour
                        </button>
                    </form>
                )}

                <div className="footer-links">
                    <p className="copyright">&copy; 2024 Gestassu SaaS</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
