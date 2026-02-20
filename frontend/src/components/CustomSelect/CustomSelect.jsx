import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

/**
 * CustomSelect — Liste déroulante avec popup contextuel et recherche intégrée.
 *
 * Props:
 *   name         string   — nom du champ (pour handleChange)
 *   value        string   — valeur sélectionnée
 *   onChange     fn       — appelé avec un event synthétique { target: { name, value } }
 *   options      array    — [{ value, label }]
 *   placeholder  string   — texte par défaut
 *   disabled     bool
 *   searchable   bool     — affiche un champ de recherche (default true)
 */
const CustomSelect = ({
    name,
    value,
    onChange,
    options = [],
    placeholder = '— Sélectionner —',
    disabled = false,
    searchable = true,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    // Fermer en cliquant en dehors
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase())
    );

    const selected = options.find(o => o.value === value);

    const handleSelect = (optValue) => {
        onChange({ target: { name, value: optValue } });
        setOpen(false);
        setSearch('');
    };

    const handleToggle = () => {
        if (!disabled) {
            setOpen(prev => !prev);
            setSearch('');
        }
    };

    return (
        <div className={`cs-wrapper${disabled ? ' cs-disabled' : ''}`} ref={containerRef}>
            {/* Trigger */}
            <button
                type="button"
                className={`cs-trigger${open ? ' cs-open' : ''}`}
                onClick={handleToggle}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={`cs-value${!selected ? ' cs-placeholder' : ''}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <i className={`bi bi-chevron-${open ? 'up' : 'down'} cs-arrow`}></i>
            </button>

            {/* Popup */}
            {open && (
                <div className="cs-popup" role="listbox">
                    {searchable && options.length > 5 && (
                        <div className="cs-search-wrap">
                            <i className="bi bi-search cs-search-icon"></i>
                            <input
                                className="cs-search"
                                type="text"
                                placeholder="Rechercher..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                                onClick={e => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <div className="cs-list">
                        {/* Option vide */}
                        <div
                            className={`cs-option cs-empty${!value ? ' cs-selected' : ''}`}
                            onClick={() => handleSelect('')}
                        >
                            {placeholder}
                        </div>

                        {filtered.length === 0 ? (
                            <div className="cs-no-results">Aucun résultat</div>
                        ) : (
                            filtered.map(o => (
                                <div
                                    key={o.value}
                                    className={`cs-option${o.value === value ? ' cs-selected' : ''}`}
                                    onClick={() => handleSelect(o.value)}
                                    role="option"
                                    aria-selected={o.value === value}
                                >
                                    {o.value === value && (
                                        <i className="bi bi-check2 cs-check"></i>
                                    )}
                                    {o.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
