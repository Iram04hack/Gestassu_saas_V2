import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './SettingsMenu.css';

export default function SettingsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="settings-menu-container" ref={menuRef}>
            <button
                className="icon-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Settings"
            >
                <i className="bi bi-gear"></i>
            </button>

            {isOpen && (
                <div className="settings-dropdown">
                    <div className="settings-header">
                        <h3>Paramètres</h3>
                    </div>

                    <div className="settings-section">
                        <div className="setting-item">
                            <div className="setting-info">
                                <i className={`bi bi-${theme === 'light' ? 'moon-stars' : 'sun'}-fill setting-icon`}></i>
                                <div className="setting-text">
                                    <div className="setting-label">Thème</div>
                                    <div className="setting-description">
                                        {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                                    </div>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={theme === 'dark'}
                                    onChange={toggleTheme}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
