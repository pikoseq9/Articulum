import React, { useState, useMemo, useEffect } from "react";
import { useArticles } from "../../hooks/useArticles";
import { usePagination } from "../../hooks/usePagination";
import { usePdfOpener } from "../../hooks/usePdfOpener";
import { ArticleCategory, CategoryLabels, Article } from "../../utils/types";
import { Pagination } from "../Pagination";
// @ts-ignore: CSS module import without type declarations
import "./Archive.css";

const Archive: React.FC = () => {
  const { articles, loading, error } = useArticles("/api/Articles/archive");
  const { openPdf } = usePdfOpener();
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | null>(
    null,
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [expandedDecade, setExpandedDecade] = useState<string | null>(null);

  const { decades, availableYears } = useMemo(() => {
    const years = Array.from(
      new Set(articles.map((a) => new Date(a.publicationDate).getFullYear())),
    ).sort((a, b) => b - a);

    const grouped: { [key: string]: number[] } = {};
    years.forEach((year) => {
      const startDecade = Math.floor(year / 10) * 10;
      const decadeLabel = `Lata ${startDecade} - ${startDecade + 9}`;
      if (!grouped[decadeLabel]) grouped[decadeLabel] = [];
      grouped[decadeLabel].push(year);
    });

    return { decades: grouped, availableYears: years };
  }, [articles]);

  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === null) {
      const newestYear = availableYears[0];
      setSelectedYear(newestYear);

      const startDecade = Math.floor(newestYear / 10) * 10;
      setExpandedDecade(`Lata ${startDecade} - ${startDecade + 9}`);
    }
  }, [availableYears, selectedYear]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === null || article.category === activeCategory;

      const articleYear = new Date(article.publicationDate).getFullYear();
      const matchesYear = selectedYear === null || articleYear === selectedYear;

      return matchesCategory && matchesYear;
    });
  }, [articles, activeCategory, selectedYear]);

  const { currentPage, totalPages, currentItems, goToPage } = usePagination(
    filteredArticles,
    4,
  );

  const handleReadPdf = (id: string) => {
    openPdf(id);
  };

  const toggleDecade = (decade: string) => {
    setExpandedDecade(expandedDecade === decade ? null : decade);
  };

  if (loading)
    return <div className="arch-loading">Ładowanie artykułów...</div>;
  if (error) return <div className="arch-error">{error}</div>;

  return (
    <div className="arch-container">
      <div className="arch-header">
        <h1 className="arch-title">Roczniki</h1>
        <div className="arch-title-underline"></div>
      </div>

      <div className="arch-filters">
        <span className="arch-filters-label">Kategorie</span>
        <button
          className={`arch-filter-btn ${activeCategory === null ? "active" : ""}`}
          onClick={() => setActiveCategory(null)}
        >
          Wszystkie
        </button>
        <button
          className={`arch-filter-btn ${activeCategory === ArticleCategory.Mathematics ? "active" : ""}`}
          onClick={() => setActiveCategory(ArticleCategory.Mathematics)}
        >
          Matematyka
        </button>
        <button
          className={`arch-filter-btn ${activeCategory === ArticleCategory.ComputerScience ? "active" : ""}`}
          onClick={() => setActiveCategory(ArticleCategory.ComputerScience)}
        >
          Informatyka
        </button>
        <button
          className={`arch-filter-btn ${activeCategory === ArticleCategory.Didactics ? "active" : ""}`}
          onClick={() => setActiveCategory(ArticleCategory.Didactics)}
        >
          Dydaktyka
        </button>
        <button
          className={`arch-filter-btn ${activeCategory === ArticleCategory.PopularScience ? "active" : ""}`}
          onClick={() => setActiveCategory(ArticleCategory.PopularScience)}
        >
          Popularyzacja nauki
        </button>
      </div>

      <div className="arch-layout">
        <div className="arch-articles-column">
          {currentItems.length === 0 ? (
            <p className="arch-no-data">
              Brak artykułów w tej kategorii dla roku {selectedYear}.
            </p>
          ) : (
            currentItems.map((article) => (
              <div key={article.id} className="arch-article-card">
                <span className="arch-card-category">
                  {CategoryLabels[article.category]}
                </span>
                <h2 className="arch-card-title">{article.title}</h2>
                <p className="arch-card-abstract">
                  {article.keywords
                    ? article.keywords
                    : "Brak dodatkowego opisu dla tego artykułu. Pełna treść znajduje się w załączonym pliku PDF."}
                </p>

                <div className="arch-card-footer">
                  <div className="arch-card-meta">
                    <span>
                      Autorzy: <b>{article.authors}</b>
                    </span>
                    <span>
                      Data publikacji:{" "}
                      <b>
                        {new Date(article.publicationDate).toLocaleDateString(
                          "pl-PL",
                        )}{" "}
                        r.
                      </b>
                    </span>
                    <span>
                      Liczba stron: <b>{article.pageRange}</b>
                    </span>
                  </div>
                  <button
                    className="arch-card-btn"
                    onClick={() => handleReadPdf(article.id)}
                  >
                    Czytaj więcej →
                  </button>
                </div>
              </div>
            ))
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>

        {/* Panel boczny */}
        <div className="arch-sidebar-column">
          <div className="arch-sidebar-card">
            <h3 className="arch-sidebar-title">Wybierz rocznik...</h3>

            <div className="arch-accordion">
              {Object.entries(decades).map(([decadeLabel, years]) => {
                const isOpen = expandedDecade === decadeLabel;
                return (
                  <div key={decadeLabel} className="arch-decade-group">
                    <div
                      className={`arch-decade-header ${isOpen ? "open" : ""}`}
                      onClick={() => toggleDecade(decadeLabel)}
                    >
                      <span
                        className={`arch-icon-svg ${isOpen ? "rotated" : ""}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          stroke="#6c75df"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </span>
                      {decadeLabel}
                    </div>

                    {isOpen && (
                      <div className="arch-years-list">
                        {years.map((year) => (
                          <div
                            key={year}
                            className={`arch-year-item ${selectedYear === year ? "active" : ""}`}
                            onClick={() => setSelectedYear(year)}
                          >
                            <span className="arch-bullet">•</span>
                            {year}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {availableYears.length === 0 && (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    fontStyle: "italic",
                  }}
                >
                  Brak dostępnych roczników.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;
