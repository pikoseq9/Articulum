import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

interface Props {
    to?: string;
    onClick?: () => void;
    variant?: 'circle' | 'text';
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