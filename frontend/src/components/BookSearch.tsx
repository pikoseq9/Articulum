import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import './BookSearch.css';
import { Book } from '../utils/types';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
}

interface OpenLibraryResponse {
  docs: OpenLibraryDoc[];
}

interface BookSearchProps {
  onSelectBook?: (book: Book) => void;
}

// 1. Zmieniamy definicję komponentu używając forwardRef
const BookSearch = forwardRef<HTMLInputElement, BookSearchProps>(({ onSelectBook }, ref) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ... (useEffect dla query i timeout - BEZ ZMIAN) ...
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setIsOpen(true);
      
      try {
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5&fields=title,author_name,cover_i,key,first_publish_year,isbn,number_of_pages_median`,
          { signal }
        );
        
        if (!response.ok) throw new Error("Błąd sieci");

        const data = await response.json() as OpenLibraryResponse;
        const formattedBooks: Book[] = data.docs.map((doc) => {
            const foundIsbn = doc.isbn && doc.isbn.length > 0 ? doc.isbn[0] : undefined;

            return {
                id: doc.key,
                title: doc.title,
                author: doc.author_name?.[0] || 'Autor nieznany',
                year: doc.first_publish_year || 0,
                cover: doc.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
                    : 'https://placehold.co/80x120/292624/e3ded9?text=No+Cover',
                isbn: foundIsbn,
                pages: doc.number_of_pages_median
            };
        });

        setResults(formattedBooks);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Błąd pobierania:", error);
        }
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (book: Book) => {
    setQuery(book.title);
    setIsOpen(false);
    if (onSelectBook) onSelectBook(book);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="input-group">
        <input
          // 2. Przypisujemy ref z forwardRef do inputa
          ref={ref} 
          type="text"
          className="search-input"
          placeholder="Wpisz tytuł książki..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
        />
        {isLoading && <div className="spinner"></div>}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="results-list">
          {results.map((book) => (
            <li key={book.id} onClick={() => handleSelect(book)} className="result-item">
              <img src={book.cover} alt={book.title} className="result-cover" />
              <div className="result-info">
                <span className="result-title">{book.title}</span>
                <span className="result-author">{book.author} ({book.year !== 0 ? book.year : '?'})</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && !isLoading && results.length === 0 && query.length >= 3 && (
        <div className="no-results">Brak wyników dla "{query}"</div>
      )}
    </div>
  );
});

// Ważne: export musi być po forwardRef
export default BookSearch;