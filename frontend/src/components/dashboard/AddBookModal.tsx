import React from 'react';
import { Book, BookStatus } from '../../utils/types';

interface Props {
    book: Book;
    isAdding: boolean;
    onConfirm: (status: BookStatus) => void;
    onCancel: () => void;
}

export const ConfirmAddModal: React.FC<Props> = ({ book, isAdding, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="confirm-modal">
                <h3>Dodać do biblioteki?</h3>
                <div className="confirm-info">
                    <img src={book.cover} alt={book.title} />
                    <div className="confirm-text">
                        <p><strong>{book.title}</strong></p>
                        <p>{book.author}</p>
                    </div>
                </div>
                <div className="modal-actions">
                    <button 
                        className="btn-add-book" 
                        onClick={() => onConfirm(BookStatus.ToRead)} 
                        disabled={isAdding}
                    >
                        Do przeczytania
                    </button>
                    <button 
                        className="btn-secondary" 
                        onClick={() => onConfirm(BookStatus.Reading)} 
                        disabled={isAdding}
                    >
                        Zacznij czytać teraz
                    </button>
                    <button className="cancel-link" onClick={onCancel}>
                        Anuluj
                    </button>
                </div>
            </div>
        </div>
    );
};