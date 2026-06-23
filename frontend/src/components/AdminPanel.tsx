// @ts-ignore: CSS module import without type declarations
import "./AdminPanel.css";
import React, { useEffect, useState } from "react";
import api from "../axios";
import { Article, UserDto } from "../utils/types";
import { useLocation, useNavigate } from "react-router-dom";
import { MfaSettings } from "./MfaSettings";
import { useAuth } from "../authContext";

const AdminPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"articles" | "users" | "settings">(
    "articles",
  );

  const [articles, setArticles] = useState<Article[]>([]);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [pageRange, setPageRange] = useState("");
  const [keywords, setKeywords] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [category, setCategory] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleError, setArticleError] = useState("");

  const [usersList, setUsersList] = useState<UserDto[]>([]);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [userError, setUserError] = useState("");
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    loadArticles();
    if (location.state && location.state.articleToEdit) {
      setActiveTab("articles");
      startEdit(location.state.articleToEdit);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab]);

  const loadArticles = async () => {
    try {
      const response = await api.get<Article[]>("/api/articles");
      setArticles(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const clearArticleForm = () => {
    setTitle("");
    setAuthors("");
    setPageRange("");
    setKeywords("");
    setPublicationDate("");
    setCategory(1);
    setPdfFile(null);
    setAdditionalFile(null);
    setEditingArticle(null);
    setArticleError("");
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArticleError("");

    if (!editingArticle && !pdfFile) {
      setArticleError(
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

      if (pdfFile) formData.append("file", pdfFile);
      if (additionalFile) formData.append("additionalFile", additionalFile);

      if (editingArticle) {
        await api.put(`/api/articles/${editingArticle.id}`, formData);
      } else {
        await api.post("/api/articles", formData);
      }

      await loadArticles();
      clearArticleForm();
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
        if (typeof err.response.data === "string")
          setArticleError(err.response.data);
        else if (Array.isArray(err.response.data))
          setArticleError(
            err.response.data.map((e: any) => e.description).join(", "),
          );
        else
          setArticleError(
            editingArticle
              ? "Nie udało się zaktualizować artykułu."
              : "Nie udało się dodać artykułu.",
          );
      } else {
        setArticleError("Błąd połączenia z serwerem.");
      }
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Czy na pewno usunąć artykuł?")) return;
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
    setArticleError("");
    setTitle(article.title);
    setAuthors(article.authors);
    setPageRange(article.pageRange);
    setKeywords(article.keywords);
    setPublicationDate(article.publicationDate.substring(0, 10));
    setCategory(article.category);
  };

  const loadUsers = async () => {
    try {
      const res = await api.get<UserDto[]>("/api/Account/all");
      setUsersList(res.data);
    } catch (error) {
      console.error("Błąd pobierania listy użytkowników", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError("");
    setUserMessage("");

    try {
      await api.post("/api/Account/register", {
        displayName: newUserName,
        email: newUserEmail,
        userName: newUserEmail,
        password: newUserPassword,
      });

      setUserMessage("Pomyślnie utworzono nowego użytkownika.");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      await loadUsers();
    } catch (err: any) {
      if (err.response?.data && typeof err.response.data === "string") {
        setUserError(err.response.data);
      } else if (Array.isArray(err.response?.data)) {
        setUserError(
          err.response.data.map((e: any) => e.description).join(", "),
        );
      } else {
        setUserError("Wystąpił błąd podczas tworzenia użytkownika.");
      }
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (email === currentUser?.email) {
      alert("Nie możesz usunąć własnego konta z tego poziomu.");
      return;
    }

    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć użytkownika: ${email}? Ta operacja jest nieodwracalna.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/api/Account/delete-user/${email}`);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("Nie udało się usunąć użytkownika.");
    }
  };

  return (
    <div className="admin-panel">
      <h1>Panel administratora</h1>

      {/* ZAKŁADKI */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === "articles" ? "active" : ""}`}
          onClick={() => setActiveTab("articles")}
        >
          Zarządzanie artykułami
        </button>
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Użytkownicy
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

            <form className="admin-form" onSubmit={handleArticleSubmit}>
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
                  } catch (err) {}
                }}
                onBlur={(e) => {
                  if (!publicationDate) e.target.type = "text";
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

              {articleError && (
                <p
                  className="error-message"
                  style={{ color: "red", margin: "10px 0" }}
                >
                  {articleError}
                </p>
              )}

              <div className="form-actions-row">
                {editingArticle && (
                  <button
                    type="button"
                    onClick={clearArticleForm}
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

      {activeTab === "users" && (
        <div className="admin-grid">
          <div className="admin-form-container">
            <h3 className="form-section-title">Dodaj nowego redaktora</h3>
            <form className="admin-form" onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Imię / Nazwa wyświetlana"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Adres e-mail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Hasło tymczasowe"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                required
              />

              {userError && (
                <p style={{ color: "red", margin: "5px 0", fontSize: "14px" }}>
                  {userError}
                </p>
              )}
              {userMessage && (
                <p
                  style={{
                    color: "#10b981",
                    margin: "5px 0",
                    fontSize: "14px",
                  }}
                >
                  {userMessage}
                </p>
              )}

              <div className="form-actions-row">
                <button type="submit" className="btn-submit">
                  Utwórz admina
                </button>
              </div>
            </form>
          </div>

          <div className="admin-articles">
            <h3>Lista kont dostępowych</h3>
            {usersList.map((usr) => (
              <div key={usr.email} className="article-row">
                <div className="article-info">
                  <span className="article-title" style={{ fontWeight: 600 }}>
                    {usr.displayName}
                  </span>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {usr.email}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: usr.isMfaEnabled ? "#10b981" : "#ef4444",
                      marginTop: "2px",
                    }}
                  >
                    {usr.isMfaEnabled ? "MFA Aktywne" : "MFA Nieaktywne"}
                  </p>
                </div>
                <div
                  className="article-actions"
                  style={{ justifyContent: "center" }}
                >
                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(usr.email!)}
                      style={{
                        color:
                          usr.email === currentUser?.email ? "#ccc" : "#ef4444",
                        cursor:
                          usr.email === currentUser?.email
                            ? "not-allowed"
                            : "pointer",
                      }}
                      disabled={usr.email === currentUser?.email}
                      title={
                        usr.email === currentUser?.email
                          ? "Nie możesz usunąć samego siebie"
                          : "Usuń konto"
                      }
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {usersList.length === 0 && (
              <p style={{ color: "#666", fontSize: "14px" }}>
                Brak innych użytkowników.
              </p>
            )}
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
