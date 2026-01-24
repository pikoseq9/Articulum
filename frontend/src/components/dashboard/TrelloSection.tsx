import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserBook, BookStatus } from '../../utils/types';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../Pagination';

interface Props {
    books: UserBook[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onMoveBook: (book: UserBook, status: BookStatus) => void;
    onAddClick: () => void;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
}

export const TrelloSection: React.FC<Props> = ({ books, searchTerm, setSearchTerm, onMoveBook, onAddClick, openMenuId, setOpenMenuId }) => {
    const navigate = useNavigate();

    const { currentItems, currentPage, totalPages, goToPage } = usePagination(books, 3);

    const renderMenu = (book: UserBook) => {
        if (openMenuId !== book.id) return null;
        return (
            <div className="action-menu">
                <button onClick={() => onMoveBook(book, BookStatus.Reading)}>📖 Czytaj teraz</button>
                <button onClick={() => onMoveBook(book, BookStatus.Read)}>✅ Ukończona</button>
            </div>
        );
    };

    return (
        <div className="dash-column trello-col">
            <div className="trello-header">
                <h3>Do przeczytania ({books.length})</h3>
                <input type="text" className="mini-search" placeholder="Filtruj..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="trello-list">
                {currentItems.map(book => (
                    <div key={book.id} className="trello-card" onClick={() => navigate(`/show/${book.id}`)}>
                        <div style={{flex: 1, cursor: 'pointer'}}>
                            <h4>{book.title}</h4>
                            <p>{book.author}</p>
                        </div>
                        <div className="menu-wrapper" onClick={(e) => e.stopPropagation()}>
                            <button className="btn-icon-action" onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === book.id ? null : book.id);
                            }}>⋮</button>
                            {renderMenu(book)}
                        </div>
                    </div>
                ))}
                <div className="trello-card-add" onClick={onAddClick}>+ Dodaj nową pozycję</div>
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={goToPage} 
                />
            </div>
        </div>
    );
};