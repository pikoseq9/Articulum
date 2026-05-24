import React, { useState } from 'react';
import { useArticles } from '../../hooks/useArticles';
import { ArticleCategory, CategoryLabels } from '../../utils/types';
// @ts-ignore: CSS module import without type declarations
import './LatestArticles.css';

const LatestArticles = () => {
  const { articles, loading, error, stats } = useArticles('/api/Articles/latest');
  
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | null>(null);

  if (loading) return <div className="la-loading">Ładowanie artykułów...</div>;
  if (error) return <div className="la-error">{error}</div>;

  const filteredArticles = activeCategory === null 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  const handleReadPdf = (id: string) => {
    window.open(`http://localhost:5269/api/Articles/${id}/view`, '_blank');
  };

  return (
    <div className="la-container">
      <div className="la-header">
        <h1 className="la-title">Najnowsze artykuły</h1>
        <div className="la-title-underline"></div>
      </div>

      <div className="la-filters">
        <span className="la-filters-label">Kategorie</span>
        <button 
          className={`la-filter-btn ${activeCategory === null ? 'active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          Wszystkie
        </button>
        <button 
          className={`la-filter-btn ${activeCategory === ArticleCategory.Mathematics ? 'active' : ''}`}
          onClick={() => setActiveCategory(ArticleCategory.Mathematics)}
        >
          Matematyka
        </button>
        <button 
          className={`la-filter-btn ${activeCategory === ArticleCategory.ComputerScience ? 'active' : ''}`}
          onClick={() => setActiveCategory(ArticleCategory.ComputerScience)}
        >
          Informatyka
        </button>
        <button 
          className={`la-filter-btn ${activeCategory === ArticleCategory.Didactics ? 'active' : ''}`}
          onClick={() => setActiveCategory(ArticleCategory.Didactics)}
        >
          Dydaktyka
        </button>
        <button 
          className={`la-filter-btn ${activeCategory === ArticleCategory.PopularScience ? 'active' : ''}`}
          onClick={() => setActiveCategory(ArticleCategory.PopularScience)}
        >
          Popularyzacja nauki
        </button>
      </div>

      <div className="la-layout">
        <div className="la-articles-column">
          {filteredArticles.length === 0 ? (
            <p className="la-no-data">Brak artykułów w tej kategorii.</p>
          ) : (
            filteredArticles.map(article => (
              <div key={article.id} className="la-article-card">
                <span className="la-card-category">{CategoryLabels[article.category]}</span>
                <h2 className="la-card-title">{article.title}</h2>
                <p className="la-card-abstract">
                  {article.keywords ? article.keywords : "Brak dodatkowego opisu dla tego artykułu. Pełna treść znajduje się w załączonym pliku PDF."}
                </p>
                
                <div className="la-card-footer">
                  <div className="la-card-meta">
                    <span>Autorzy: <b>{article.authors}</b></span>
                    <span>Data publikacji: <b>{new Date(article.publicationDate).toLocaleDateString('pl-PL')} r.</b></span>
                    <span>Liczba stron: <b>{article.pageRange}</b></span>
                  </div>
                  <button className="la-card-btn" onClick={() => handleReadPdf(article.id)}>
                    Czytaj więcej →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="la-stats-column">
          <div className="la-stats-card">
            <h3 className="la-stats-title">Statystyki publikacji<br/>rocznych</h3>
            
            <ul className="la-stats-list">
              <li className="la-stats-item">
                <div className="la-stats-label">
                  <span className="la-icon">📚</span> Wszystkie:
                </div>
                <span className="la-stats-value">{stats.total}</span>
              </li>
              <li className="la-stats-item">
                <div className="la-stats-label">
                  <span className="la-icon">➗</span> Matematyka:
                </div>
                <span className="la-stats-value">{stats.math}</span>
              </li>
              <li className="la-stats-item">
                <div className="la-stats-label">
                  <span className="la-icon">💻</span> Informatyka:
                </div>
                <span className="la-stats-value">{stats.cs}</span>
              </li>
              <li className="la-stats-item">
                <div className="la-stats-label">
                  <span className="la-icon">🎓</span> Dydaktyka:
                </div>
                <span className="la-stats-value">{stats.didactics}</span>
              </li>
              <li className="la-stats-item">
                <div className="la-stats-label">
                  <span className="la-icon">🔬</span> Popularyzacja nauki:
                </div>
                <span className="la-stats-value">{stats.popSci}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestArticles;