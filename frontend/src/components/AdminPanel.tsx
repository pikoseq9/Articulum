import "./AdminPanel.css";
import { useEffect, useState } from "react";
import api from "../axios";
import { Article } from "../utils/types";

const AdminPanel = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [pageRange, setPageRange] = useState("");
  const [keywords, setKeywords] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [category, setCategory] = useState(1);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);

  const [editingArticle, setEditingArticle] =
    useState<Article | null>(null);

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
  };

  const handleAddArticle = async () => {
    if (!title.trim()) {
        alert("Pole 'Tytuł' jest obowiązkowe!");
        return;
    }
    if (!authors.trim()) {
        alert("Pole 'Autorzy' jest obowiązkowe!");
        return;
    }
    if (!publicationDate) {
        alert("Pole 'Data publikacji' jest obowiązkowe!");
        return;
    }
    if (!pdfFile) {
        alert("Musisz wgrać plik PDF artykułu!");
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

        formData.append("file", pdfFile);

        if (additionalFile) {
        formData.append("additionalFile", additionalFile);
        }

        await api.post("/api/articles", formData);
        await loadArticles();
        clearForm();
    } catch (error) {
        console.error(error);
        alert("Nie udało się dodać artykułu");
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

    setTitle(article.title);
    setAuthors(article.authors);
    setPageRange(article.pageRange);
    setKeywords(article.keywords);

    setPublicationDate(
      article.publicationDate.substring(0, 10)
    );

    setCategory(article.category);
  };

  const handleUpdateArticle = async () => {
        if (!editingArticle) return;

        if (!title.trim()) {
            alert("Pole 'Tytuł' nie może być puste!");
            return;
        }
        if (!authors.trim()) {
            alert("Pole 'Autorzy' nie może być puste!");
            return;
        }
        if (!publicationDate) {
            alert("Pole 'Data publikacji' nie może być puste!");
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

            await api.put(`/api/articles/${editingArticle.id}`, formData);
            await loadArticles();
            clearForm();
        } catch (error) {
            console.error(error);
            alert("Nie udało się zaktualizować artykułu");
        }
    };

  return (
    <div className="admin-panel">
      <h1>Panel administratora</h1>

      <div className="admin-grid">
        <div className="admin-form-container">
          <h3 className="form-section-title">
            {editingArticle
              ? "Edycja artykułu"
              : "Dodaj nowy artykuł poprzez formularz"}
          </h3>

          <div className="admin-form">
            <input
              type="text"
              placeholder="Tytuł"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="text"
              placeholder="Autorzy"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
            />

            <input
              type="text"
              placeholder="Data publikacji"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => !publicationDate && (e.target.type = "text")}
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
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
            >
              <option value={1}>Matematyka</option>
              <option value={2}>Informatyka</option>
              <option value={3}>Dydaktyka</option>
              <option value={4}>Popularyzacja nauki</option>
            </select>

            <div className="file-upload-wrapper">
              <label htmlFor="pdf-file-input" className={`file-upload-label ${pdfFile ? 'has-file' : ''}`}>
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
              />
            </div>

            <div className="file-upload-wrapper">
              <label htmlFor="additional-file-input" className={`file-upload-label ${additionalFile ? 'has-file' : ''}`}>
                <span className="file-placeholder">
                  {additionalFile ? `📄 ${additionalFile.name}` : "Wgraj plik opcjonalny"}
                </span>
              </label>
              <input
                id="additional-file-input"
                type="file"
                accept=".pdf"
                className="hidden-file-input"
                onChange={(e) => setAdditionalFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="form-actions-row">
              {editingArticle && (
                <button type="button" onClick={clearForm} className="btn-cancel">
                  Anuluj edycję
                </button>
              )}
              
              <button
                type="button"
                className="btn-submit"
                onClick={
                  editingArticle
                    ? handleUpdateArticle
                    : handleAddArticle
                }
              >
                {editingArticle ? "Zapisz zmiany" : "Dodaj artykuł"}
              </button>
            </div>
          </div>
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
                  <button onClick={() => handleDeleteArticle(article.id)}>
                    Usuń
                  </button>

                  <button onClick={() => startEdit(article)}>
                    Edytuj
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;