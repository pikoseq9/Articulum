import React from "react";
// @ts-ignore: CSS module import without type declarations
import "./ForAuthors.css";

const Authors: React.FC = () => {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">Dla autorów</h1>
        <div className="auth-title-underline"></div>
      </div>

      <p className="auth-intro">
        Zainteresowało Cię nasze czasopismo? Chciałbyś opublikować u nas swój
        artykuł? Oto wszystko, co musisz wiedzieć przed zgłoszeniem tekstu!
      </p>

      <div className="auth-layout">
        {/* Lewa kolumna z informacjami */}
        <div className="auth-info-column">
          {/* Klock 1: Pobierz szablon */}
          <div className="auth-card">
            <h2 className="auth-card-title">Pobierz szablon</h2>
            <p className="auth-card-text">
              Twój artykuł musi być sformatowany zgodnie z naszymi wytycznymi.
              Prosimy również o zachowanie odpowiedniej struktury treści, w tym
              poprawnego podziału na nagłówki, akapity oraz sekcje tematyczne.
              Dzięki temu materiał będzie bardziej czytelny dla odbiorców i
              łatwiejszy do publikacji na naszej stronie.
            </p>
            <div className="auth-download-wrapper">
              <span className="auth-arrow">→</span>
              {/* Tutaj łączymy bezpośrednio z Twoim plikiem Formularz.docx */}
              <a
                href="/docs/Formularz.docx"
                download="Formularz_Szablon_Articulum.docx"
                className="auth-download-link"
              >
                Szablon znajdziesz tutaj!
              </a>
            </div>
          </div>

          {/* Klock 2: Format pliku */}
          <div className="auth-card">
            <h2 className="auth-card-title">Format pliku</h2>
            <p className="auth-card-text">
              Przyjmujemy teksty wyłącznie w formacie PDF. Opcjonalnie możesz
              dołączyć materiały dodatkowe (np. archiwum ZIP z kodem źródłowym).
            </p>
          </div>

          {/* Klock 3: Ważna informacja */}
          <div className="auth-card">
            <h2 className="auth-card-title">
              Ważna informacja o nazewnictwie plików:
            </h2>
            <p className="auth-card-text">
              Nie musisz martwić się o nazwę przesyłanego pliku. Nasz system
              automatycznie nada mu oficjalny identyfikator czasopisma według
              schematu <strong>X-YY-NNN.pdf</strong>, gdzie X to kod kategorii,
              YY to dwucyfrowy rok, a NNN to kolejny numer artykułu.
            </p>
          </div>
        </div>

        {/* Prawa kolumna: Kategorie tematyczne */}
        <div className="auth-sidebar-column">
          <div className="auth-sidebar-card">
            <h2 className="auth-sidebar-title">Kategorie tematyczne</h2>
            <p className="auth-sidebar-text">
              Publikujemy artykuły w ramach czterech głównych dziedzin
            </p>
            <ul className="auth-categories-list">
              <li>
                <strong>M</strong> – Matematyka
              </li>
              <li>
                <strong>I</strong> – Informatyka
              </li>
              <li>
                <strong>D</strong> – Dydaktyka
              </li>
              <li>
                <strong>P</strong> – Popularyzacja nauki
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authors;
