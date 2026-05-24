import React from 'react';
// @ts-ignore: CSS module import without type declarations
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header-section">
        <div className="about-intro">
          <h1 className="about-title">O czasopiśmie</h1>
          <p className="about-description">
            Articulum to recenzowane czasopismo naukowe publikujące oryginalne artykuły z zakresu matematyki, informatyki, dydaktyki i popularyzacji nauki. Wydawane od 1998 roku przez Wydział Nauk Ścisłych.
          </p>
        </div>

        <div className="about-quick-facts">
          <div className="fact-item">
            <div className="fact-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="fact-text">
              <span className="fact-label">Rok założenia</span>
              <span className="fact-value">1998</span>
            </div>
          </div>
          <div className="fact-divider"></div>
          <div className="fact-item">
            <div className="fact-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <div className="fact-text">
              <span className="fact-label">Język publikacji</span>
              <span className="fact-value">PL/EN</span>
            </div>
          </div>
          <div className="fact-divider"></div>
          <div className="fact-item">
            <div className="fact-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </div>
            <div className="fact-text">
              <span className="fact-label">Częstotliwość wydawania</span>
              <span className="fact-value">Co tydzień</span>
            </div>
          </div>
        </div>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="card-header">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            </div>
            <h3 className="card-title">Historia</h3>
          </div>
          <p className="card-text">
            Czasopismo zostało założone w 1998 roku przez Wydział Nauk Ścisłych. Od ponad dwóch dekad stanowi niezawodną platformę wymiany myśli i osiągnięć badawczych dla środowiska akademickiego.
          </p>
        </div>

        <div className="about-card">
          <div className="card-header">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
            </div>
            <h3 className="card-title">Zakres tematyczny</h3>
          </div>
          <p className="card-text">
            Na łamach czasopisma publikujemy oryginalne prace badawcze z zakresu matematyki i informatyki. Nasz profil uzupełniają również artykuły poświęcone dydaktyce oraz szeroko pojętej popularyzacji nauki, prezentujące złożone zagadnienia w przystępny sposób.
          </p>
        </div>

        <div className="about-card">
          <div className="card-header">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
            </div>
            <h3 className="card-title">Misja i cele</h3>
          </div>
          <p className="card-text">
            Naszym celem jest promowanie rzetelnej wiedzy naukowej, wspieranie innowacyjnych badań oraz ułatwianie dialogu między naukowcami, dydaktykami a pasjonatami nauki.
          </p>
        </div>

        <div className="about-card">
          <div className="card-header">
            <div className="card-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
            </div>
            <h3 className="card-title">Otwarty dostęp</h3>
          </div>
          <p className="card-text">
            Wierzymy w powszechny dostęp do nauki. Wszystkie materiały w "Articulum" są udostępniane bezpłatnie natychmiast po publikacji, co gwarantuje im globalny zasięg i ułatwia cytowanie.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;