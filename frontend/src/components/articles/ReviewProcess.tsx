import React from "react";
// @ts-ignore: CSS module import without type declarations
import "./ReviewProcess.css";

const ReviewProcess: React.FC = () => {
  return (
    <div className="rp-container">
      <div className="rp-header">
        <h1 className="rp-title">Proces recenzji</h1>
        <div className="rp-title-underline"></div>
      </div>

      <p className="rp-intro">
        Artykuły zgłaszane do czasopisma podlegają ocenie w ramach procedury
        recenzji naukowej. Proces ten realizowany jest zgodnie z przyjętymi
        standardami redakcyjnymi, które przedstawiono poniżej.
      </p>

      <div className="rp-content">
        {/* Karta 1 */}
        <div className="rp-card">
          <p>
            Materiały zgłaszane do czasopisma podlegają ocenie merytorycznej co
            najmniej dwóch niezależnych recenzentów. Czasopismo publikuje
            artykuły z matematyki, informatyki, dydaktyki oraz popularyzacji
            nauki. Proces recenzji ma charakter anonimowy (
            <strong>double-blind review</strong>), co oznacza, że autorzy i
            recenzenci nie znają swoich tożsamości.
          </p>
          <p>
            Recenzje wykonywane są na podstawie formularza recenzyjnego i
            przesyłane w formie elektronicznej do redakcji. W przypadku
            publikacji zbiorowych recenzja może obejmować całość pracy lub
            poszczególne jej części.
          </p>
        </div>

        {/* Karta 2 - Z listą punktowaną */}
        <div className="rp-card">
          <p className="rp-list-title">Recenzenci oceniają w szczególności:</p>
          <ul className="rp-list">
            <li>oryginalność i wartość naukową tekstu,</li>
            <li>poprawność merytoryczną i metodologiczną,</li>
            <li>spójność i przejrzystość wywodu,</li>
            <li>aktualność literatury i poprawność aparatu naukowego,</li>
            <li>zgodność z profilem czasopisma.</li>
          </ul>
        </div>

        {/* Karta 3 */}
        <div className="rp-card">
          <p>
            Recenzja kończy się jednoznaczną opinią: akceptacja, konieczność
            wprowadzenia poprawek lub odrzucenie tekstu. W przypadku sprzecznych
            opinii redakcja może skierować artykuł do kolejnego recenzenta.
          </p>
          <p>
            Standardowy czas recenzji wynosi <strong>6–8 tygodni</strong> od
            daty złożenia artykułu. W uzasadnionych przypadkach termin może
            zostać wydłużony.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewProcess;
