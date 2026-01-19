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
        const savedPage = localStorage.getItem(`mock_progress_${book.id}`);
        const current = savedPage ? parseInt(savedPage) : 0;
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

    const singleBookStats = books.length === 1 ? getProgressStats(books[0]) : { current: 0, total: 0, percent: 0 };

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
                        <img src={books[0].imageUrl || "https://placehold.co/100x150"} alt={books[0].title} className="book-cover" />
                        <div className="book-info">
                            <h2>{books[0].title}</h2>
                            <p className="author">{books[0].author}</p>
                            <div className="mini-progress">
                                <label>Liczba stron: {books[0].pages || "?"}</label>
                                <progress 
                                    value={singleBookStats.percent} 
                                    max="100"
                                ></progress>
                            </div>
                            <div className="actions">
                                <Link to={`/show/${books[0].id}`}><button className="btn-secondary">Zarządzaj</button></Link>
                                <button className="btn-primary-small" onClick={() => onMoveBook(books[0], BookStatus.Read)}>Ukończ</button>
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