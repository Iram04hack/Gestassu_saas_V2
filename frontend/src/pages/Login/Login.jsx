import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth';
import logo from '../../assets/logo.png'; // Make sure the path is correct
import './Login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
        setError('');
    };

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

    return (
        <div className="login-body">
            <div className="split-screen">
                <div className="left-side">
                    <div className="brand">GestAssu.</div>
                    <div className="hero-content">
                        <h1>Gérer Mieux.<br />Gagner Plus.</h1>
                        <p>La solution de courtage tout-en-un conçue pour simplifier votre gestion quotidienne et propulser
                            votre croissance.</p>
                    </div>
                    <div>{/* Spacer */}</div>
                </div>

                <div className="right-side">
                    <div className="login-card">
                        <div className="logo-container">
                            <img src={logo} alt="GestAssu Logo" className="logo-img" />
                        </div>
                        <h2>CONNEXION</h2>
                        <p className="subtitle">Connectez-vous pour accéder à votre tableau de bord.</p>

                        {error && (
                            <div className="messages error">
                                <i className="bi bi-exclamation-circle" style={{ marginRight: '8px' }}></i>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLoginSubmit}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="login"
                                    name="login"
                                    placeholder="Identifiant"
                                    value={credentials.login}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Mot de passe</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="extra-options">
                                <label className="remember-me">
                                    <input type="checkbox" /> Se souvenir de moi
                                </label>
                            </div>

                            <button type="submit" className="btn-login" disabled={loading}>
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
