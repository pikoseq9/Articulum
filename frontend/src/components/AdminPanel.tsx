// @ts-ignore: CSS module import without type declarations
import "./AdminPanel.css";
import React, { useEffect, useState } from "react";
import api from "../axios";
import { Article } from "../utils/types";
import { useLocation, useNavigate } from "react-router-dom";
import { MfaSettings } from "./MfaSettings";

const AdminPanel = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [pageRange, setPageRange] = useState("");
  const [keywords, setKeywords] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [category, setCategory] = useState(1);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"articles" | "settings">(
    "articles",
  );

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await api.get<Article[]>("/api/articles");
      setArticles(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadArticles();
    if (location.state && location.state.articleToEdit) {
      startEdit(location.state.articleToEdit);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const clearForm = () => {
    setTitle("");
    setAuthors("");
    setPageRange("");
    setKeywords("");
    setPublicationDate("");
    setCategory(1);
    setPdfFile(null);
    setAdditionalFile(null);
    setEditingArticle(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!editingArticle && !pdfFile) {
      setError(
        "Wgranie pliku PDF jest wymagane przy dodawaniu nowego artykułu.",
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Authors", authors);
      formData.append("PageRange", pageRange);
      formData.append("Keywords", keywords);
      formData.append("PublicationDate", publicationDate);
      formData.append("Category", category.toString());

      if (pdfFile) {
        formData.append("file", pdfFile);
      }

      if (additionalFile) {
        formData.append("additionalFile", additionalFile);
      }

      if (editingArticle) {
        await api.put(`/api/articles/${editingArticle.id}`, formData);
      } else {
        await api.post("/api/articles", formData);
      }

      await loadArticles();
      clearForm();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (Array.isArray(err.response.data)) {
          setError(err.response.data.map((e: any) => e.description).join(", "));
        } else {
          setError(
            editingArticle
              ? "Nie udało się zaktualizować artykułu."
              : "Nie udało się dodać artykułu.",
          );
        }
      } else {
        setError("Błąd połączenia z serwerem.");
      }
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Czy na pewno usunąć artykuł?")) {
      return;
    }

    try {
      await api.delete(`/api/articles/${id}`);
      await loadArticles();
    } catch (error) {
      console.error(error);
      alert("Nie udało się usunąć artykułu");
    }
  };

  const startEdit = (article: Article) => {
    setEditingArticle(article);
    setError("");
    setTitle(article.title);
    setAuthors(article.authors);
    setPageRange(article.pageRange);
    setKeywords(article.keywords);
    setPublicationDate(article.publicationDate.substring(0, 10));
    setCategory(article.category);
  };

  return (
    <div className="admin-panel">
      <h1>Panel administratora</h1>

      {/* Kontenery dla zakładek z użyciem klas zdefiniowanych w Twoim CSS */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "articles" ? "active" : ""}`}
          onClick={() => setActiveTab("articles")}
        >
          Zarządzanie artykułami
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Ustawienia i Bezpieczeństwo
        </button>
      </div>

      {activeTab === "articles" && (
        <div className="admin-grid">
          <div className="admin-form-container">
            <h3 className="form-section-title">
              {editingArticle
                ? "Edycja artykułu"
                : "Dodaj nowy artykuł poprzez formularz"}
            </h3>

            <form className="admin-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Tytuł"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Autorzy"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Data publikacji"
                value={publicationDate}
                onFocus={(e) => {
                  e.target.type = "date";
                  try {
                    e.target.showPicker();
                  } catch (err) {
                    console.log(err);
                  }
                }}
                onBlur={(e) => {
                  if (!publicationDate) {
                    e.target.type = "text";
                  }
                }}
                onChange={(e) => setPublicationDate(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Zakres stron"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
              />

              <input
                type="text"
                placeholder="Słowa kluczowe"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />

              <select
                className="category-select"
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))}
                required
              >
                <option value={1}>Matematyka</option>
                <option value={2}>Informatyka</option>
                <option value={3}>Dydaktyka</option>
                <option value={4}>Popularyzacja nauki</option>
              </select>

              <div className="file-upload-wrapper">
                <label
                  htmlFor="pdf-file-input"
                  className={`file-upload-label ${pdfFile ? "has-file" : ""}`}
                >
                  <span className="file-placeholder">
                    {pdfFile ? `📄 ${pdfFile.name}` : "Wgraj plik PDF"}
                  </span>
                </label>
                <input
                  id="pdf-file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden-file-input"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  required={!editingArticle}
                />
              </div>

              <div className="file-upload-wrapper">
                <label
                  htmlFor="additional-file-input"
                  className={`file-upload-label ${additionalFile ? "has-file" : ""}`}
                >
                  <span className="file-placeholder">
                    {additionalFile
                      ? `📄 ${additionalFile.name}`
                      : "Wgraj plik opcjonalny"}
                  </span>
                </label>
                <input
                  id="additional-file-input"
                  type="file"
                  accept=".pdf"
                  className="hidden-file-input"
                  onChange={(e) =>
                    setAdditionalFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              {error && (
                <p
                  className="error-message"
                  style={{ color: "red", margin: "10px 0" }}
                >
                  {error}
                </p>
              )}

              <div className="form-actions-row">
                {editingArticle && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="btn-cancel"
                  >
                    Anuluj edycję
                  </button>
                )}

                <button type="submit" className="btn-submit">
                  {editingArticle ? "Zapisz zmiany" : "Dodaj artykuł"}
                </button>
              </div>
            </form>
          </div>

          <div className="admin-articles">
            <h3>Statystyki otwarć</h3>

            {articles.map((article) => (
              <div key={article.id} className="article-row">
                <div className="article-info">
                  <span className="article-title">{article.title}</span>
                </div>

                <div className="article-actions">
                  <span className="views">👁 {article.openCount}</span>

                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(article.id)}
                    >
                      Usuń
                    </button>

                    <button type="button" onClick={() => startEdit(article)}>
                      Edytuj
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div style={{ marginTop: "20px" }}>
          <MfaSettings />
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
