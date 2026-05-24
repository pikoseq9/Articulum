import React, { useState, useEffect, useRef, forwardRef } from 'react';
// @ts-ignore: CSS module import without type declarations
import './ArticleSearch.css';
import { Article, CategoryLabels } from '../utils/types';
import api from '../axios';

interface ArticleSearchProps {
  onSelectArticle?: (article: Article) => void;
}

const ArticleSearch = forwardRef<HTMLInputElement, ArticleSearchProps>(({ onSelectArticle }, ref) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        const response = await api.get<Article[]>(`/api/Articles/search?searchTerm=${encodeURIComponent(query)}`, {
          signal
        });
        
        setResults(response.data);
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.message !== 'canceled') {
          console.error("Błąd pobierania artykułów:", error);
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

  const handleSelect = (article: Article) => {
    setQuery('');
    setIsOpen(false);
    
    if (onSelectArticle) {
      onSelectArticle(article);
    } else {
      window.open(`http://localhost:5269/api/Articles/${article.id}/view`, '_blank');
    }
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
          ref={ref} 
          type="text"
          className="search-input"
          placeholder="Szukaj artykułów, autorów, tematów..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
        />
        {isLoading && <div className="spinner"></div>}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="results-list">
          {results.map((article) => (
            <li key={article.id} onClick={() => handleSelect(article)} className="result-item">
              <div className="result-info">
                <span className="result-title">{article.title}</span>
                <span className="result-author">{article.authors}</span>
                <span className="result-category">{CategoryLabels[article.category]}</span>
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

export default ArticleSearch;