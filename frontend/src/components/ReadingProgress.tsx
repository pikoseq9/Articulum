import React, { useState, useEffect } from 'react';
import { UserBook } from '../utils/types';
import './ReadingProgress.css';
import api from '../axios';

interface Props {
    book: UserBook;
    onUpdate: () => void;
}

const ReadingProgress: React.FC<Props> = ({ book, onUpdate }) => {
    const [current, setCurrent] = useState(book.currentPage || 0);
    const [isSaving, setIsSaving] = useState(false);
    
    const total = book.pages || 1; 
    
    const percentage = Math.min(100, Math.round((current / total) * 100));

    useEffect(() => {
        setCurrent(book.currentPage || 0);
    }, [book.currentPage]);

    const saveProgress = async () => {
        setIsSaving(true);
        try {
            const updatedBook = { 
                ...book, 
                currentPage: current 
            };
            await api.put(`/api/Books/${book.id}`, updatedBook);
            
            onUpdate();
        } catch (err) {
            console.error("Błąd zapisu postępu:", err);
            alert("Nie udało się zapisać postępu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (val: number) => {
        let newValue = val;
        if (newValue < 0) newValue = 0;
        if (newValue > total) newValue = total;
        setCurrent(newValue);
    };

    if (!book.pages || book.pages === 0) {
        return (
            <div className="progress-card error-state">
                <p>Ta książka nie ma podanej liczby stron. Edytuj ją, aby śledzić postęp.</p>
            </div>
        );
    }

    return (
        <div className="progress-card">
            <div className="progress-header">
                <h3>Twój postęp</h3>
                <span className="percent-badge">{percentage}%</span>
            </div>

            <div className="progress-bar-track">
                <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <div className="inputs-row">
                <input 
                    type="range" 
                    min="0" 
                    max={total} 
                    value={current} 
                    onChange={(e) => handleChange(parseInt(e.target.value))}
                    className="progress-slider"
                />
            </div>

            <div className="controls-row">
                <div className="page-input-group">
                    <label>Strona:</label>
                    <input 
                        type="number" 
                        value={current} 
                        onChange={(e) => handleChange(parseInt(e.target.value))}
                        min="0"
                        max={total}
                    />
                    <span className="total-pages"> / {total}</span>
                </div>

                <button 
                    className={`btn-save-progress ${isSaving ? 'saving' : ''}`} 
                    onClick={saveProgress}
                    disabled={book.currentPage === current || isSaving}
                >
                    {isSaving ? "Zapisywanie..." : (book.currentPage === current ? "Zapisano" : "Zapisz postęp")}
                </button>
            </div>
        </div>
    );
};

export default ReadingProgress;