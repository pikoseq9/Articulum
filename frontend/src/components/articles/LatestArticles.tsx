import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../axios";
import { useArticles } from "../../hooks/useArticles";
import { ArticleCategory, CategoryLabels, Article } from "../../utils/types";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Pagination";
import { usePdfOpener } from "../../hooks/usePdfOpener";
// @ts-ignore
import "./LatestArticles.css";
import { useAuth } from "../../authContext";

const LatestArticles = () => {
  const navigate = useNavigate();
  const { articles, loading, error, stats, refetch } = useArticles(
    "/api/Articles/latest",
  );
  const { openPdf } = usePdfOpener();
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | null>(
    null,
  );

  const { user } = useAuth();
  const isLoggedIn = !!user;

  const filteredArticles =
    activeCategory === null
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const { currentPage, totalPages, currentItems, goToPage } = usePagination(
    filteredArticles,
    4,
  );

  if (loading) return <div className="la-loading">Ładowanie artykułów...</div>;
  if (error) return <div className="la-error">{error}</div>;

  const handleReadPdf = (id: string) => openPdf(id);

  const handleEditArticle = (article: Article) => {
    navigate("/admin", { state: { articleToEdit: article } });
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Czy na pewno usunąć artykuł?")) return;
    try {
      await api.delete(`/api/articles/${id}`);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Nie udało się usunąć artykułu");
    }
  };

  return (
    <div className="la-container">
      <div className="la-layout">
        <div className="la-articles-column">
          {currentItems.length === 0 ? (
            <p className="la-no-data">Brak artykułów w tej kategorii.</p>
          ) : (
            currentItems.map((article) => (
              <div key={article.id} className="la-article-card">
                <span className="la-card-category">
                  {CategoryLabels[article.category]}
                </span>
                <h2 className="la-card-title">{article.title}</h2>
                <p className="la-card-abstract">
                  {article.keywords
                    ? article.keywords
                    : "Brak dodatkowego opisu dla tego artykułu. Pełna treść znajduje się w załączonym pliku PDF."}
                </p>

                <div className="la-card-footer">
                  {/* Ten div grupuje metadane i przyciski admina, żeby "Czytaj więcej" zostało po prawej stronie */}
                  <div>
                    <div className="la-card-meta">
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

                    {/* Zapis z operatorem trójargumentowym jest bezpieczniejszy dla TypeScripta */}
                    {isLoggedIn ? (
                      <div className="admin-action-links">
                        <button
                          className="text-link-btn"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          Usuń
                        </button>
                        <button
                          className="text-link-btn"
                          onClick={() => handleEditArticle(article)}
                        >
                          Edytuj
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <button
                    className="la-card-btn"
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

        <div className="la-stats-column">
          <div className="la-stats-card">
            <h3 className="la-stats-title">
              Statystyki publikacji
              <br />
              rocznych
            </h3>

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
