import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserBook, BookStatus } from '../../utils/types';

interface Props {
    books: UserBook[];
    onMoveBook: (book: UserBook, status: BookStatus) => void;
    onAddClick: () => void;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
}

export const ReadingSection: React.FC<Props> = ({ books, onMoveBook, onAddClick, openMenuId, setOpenMenuId }) => {
    const navigate = useNavigate();

    const getProgressStats = (book: UserBook) => {
        const current = book.currentPage || 0;
        const total = book.pages || 1;
        const percent = Math.min(100, Math.round((current / total) * 100));
        
        return { current, total, percent };
    };

    const renderMenu = (book: UserBook) => {
        if (openMenuId !== book.id) return null;
        return (
            <div className="action-menu">
                <button onClick={() => onMoveBook(book, BookStatus.Read)}>Ukończona</button>
                <button onClick={() => onMoveBook(book, BookStatus.ToRead)}>Do kolejki</button>
            </div>
        );
    };

    const singleBook = books.length === 1 ? books[0] : null;
    const singlePercent = singleBook ? getProgressStats(singleBook).percent : 0;
    const singleStats = singleBook ? getProgressStats(singleBook) : { current: 0, total: 0 };

    return (
        <div className="dash-column center-col">
            <div className="card current-read-card">
                <div className="card-header-row">
                    <h3>Aktualnie czytasz</h3>
                    <span className="status-tag active">W trakcie ({books.length})</span>
                </div>
                
                {books.length === 0 ? (
                    <div className="empty-state">
                        <p>Nic teraz nie czytasz.</p>
                        <button className="btn-secondary" onClick={onAddClick}>Wyszukaj coś</button>
                    </div>
                ) : books.length === 1 ? (
                    <div className="book-detail-flex">
                        <img src={singleBook!.imageUrl || "https://placehold.co/100x150"} alt={singleBook!.title} className="book-cover" />
                        <div className="book-info">
                            <h2>{singleBook!.title}</h2>
                            <p className="author">{singleBook!.author}</p>
                            <div className="mini-progress">
                                <label>Liczba stron: {singleBook!.pages || "?"}</label>
                                <progress 
                                    value={singlePercent} 
                                    max="100"
                                ></progress>
                            </div>
                            <div className="actions">
                                <Link to={`/show/${books[0].id}`}><button className="btn-secondary">Zarządzaj</button></Link>
                                <button className="btn-primary-small" onClick={() => onMoveBook(books[0], BookStatus.Read)}>Ukończ</button>
                                <button className="btn-primary-small" onClick={() => onMoveBook(books[0], BookStatus.ToRead)} title="Przenieś do kolejki">
                                    Odłóż
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="reading-grid">
                        {books.map(book => (
                            <div key={book.id} className="reading-grid-item" onClick={() => navigate(`/show/${book.id}`)}>
                                <div className="menu-wrapper" onClick={(e) => e.stopPropagation()}>
                                    <button className="btn-dots" onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(openMenuId === book.id ? null : book.id);
                                    }}>⋮</button>
                                    {renderMenu(book)}
                                </div>
                                <img src={book.imageUrl || "https://placehold.co/80x120"} alt={book.title} />
                                <div className="reading-item-info">
                                    <h5>{book.title}</h5>
                                    <p>{book.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};