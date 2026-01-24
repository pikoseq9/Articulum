import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

interface Props {
    /**
     * Opcjonalna ścieżka przekierowania. Jeśli brak, używa navigate(-1).
     */
    to?: string;
    
    /**
     * Opcjonalna funkcja kliknięcia (nadpisuje domyślne zachowanie).
     */
    onClick?: () => void;

    /**
     * Styl przycisku:
     * - 'circle': Okrągły przycisk ze strzałką (idealny do nagłówków)
     * - 'text': Tekstowy przycisk "← Wróć" (klasyczny)
     * Domyślnie: 'circle'
     */
    variant?: 'circle' | 'text';

    /**
     * Własny tekst (tylko dla wariantu 'text'). Domyślnie "Wróć".
     */
    label?: string;

    className?: string;
}

export const BackButton: React.FC<Props> = ({ 
    to, 
    onClick, 
    variant = 'circle', 
    label = 'Wróć',
    className = ''
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    if (variant === 'text') {
        return (
            <button 
                className={`back-btn-text ${className}`} 
                onClick={handleClick}
                title="Wróć"
            >
                <span>←</span> {label}
            </button>
        );
    }

    return (
        <button 
            className={`back-btn-circle ${className}`} 
            onClick={handleClick}
            title="Wróć"
        >
            &larr;
        </button>
    );
};