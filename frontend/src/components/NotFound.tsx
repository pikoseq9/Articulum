import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
// @ts-ignore: CSS module import without type declarations
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="nf-container">
            <div className="nf-card">
                <div className="nf-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h1 className="nf-title">404</h1>
                <h2 className="nf-subtitle">Nie znaleziono pliku</h2>
                <p className="nf-text">
                    Przepraszamy, ale artykuł lub plik PDF, którego szukasz, nie istnieje na serwerze lub został trwale usunięty.
                </p>
                <div className="nf-actions">
                    <button onClick={() => navigate(-1)} className="nf-btn nf-btn-secondary">
                        Wróć do poprzedniej strony
                    </button>
                    <Link to="/" className="nf-btn nf-btn-primary">
                        Przejdź na stronę główną
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;