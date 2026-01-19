import React from 'react';
import { UserBook, BookStatus } from '../../utils/types';

interface Props {
    books: UserBook[];
    onClose: () => void;
    onMoveBook: (book: UserBook, status: BookStatus) => void;
}

export const ReadHistoryModal: React.FC<Props> = ({ books, onClose, onMoveBook }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="confirm-modal read-history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Historia przeczytanych ({books.length})</h3>
                    <button className="close-icon" onClick={onClose}>×</button>
                </div>

                <div className="read-list-container">
                    {books.length === 0 ? (
                        <p className="empty-text">Jeszcze nic nie ukończyłeś w tym roku.</p>
                    ) : (
                        books.map((book) => (
                            <div key={book.id} className="read-list-item">
                                <div className="read-item-info">
                                    <img 
                                        src={book.imageUrl || "https://placehold.co/40x60"} 
                                        alt={book.title} 
                                    />
                                    <div>
                                        <h4>{book.title}</h4>
                                        <span>{book.author}</span>
                                    </div>
                                </div>
                                
                                <div className="read-item-actions">
                                    <button 
                                        className="btn-undo"
                                        title="Przywróć do czytania"
                                        onClick={() => onMoveBook(book, BookStatus.Reading)}
                                    >
                                        ↺ W trakcie
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};