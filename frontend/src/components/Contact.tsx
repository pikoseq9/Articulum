import React from 'react';
// @ts-ignore: CSS module import without type declarations
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1 className="contact-title">Kontakt</h1>
        <div className="contact-title-underline"></div>
      </div>

      <div className="contact-card">
        <h2 className="contact-card-title">Redakcja Czasopisma Naukowego Articulum</h2>
        
        <div className="contact-grid">
          <div className="contact-item">
            <div className="contact-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Adres</span>
              <span className="contact-value">
                ul. Akademicka 12<br />
                40-001 Katowice
              </span>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Telefon</span>
              <span className="contact-value">
                tel. +48 32 123 45 67<br />
                pon-pt 8:00 - 16:00
              </span>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">E-mail</span>
              <span className="contact-value">
                redakcja@articulum.pl
              </span>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Godziny pracy redakcji</span>
              <span className="contact-value">
                pon.-pt. 8:00-16:00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;