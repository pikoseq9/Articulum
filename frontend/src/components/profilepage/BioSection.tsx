import React from 'react';

interface BioSectionProps {
  description: string;
  setDescription: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const BioSection: React.FC<BioSectionProps> = ({ 
  description, setDescription, onSave, isSaving 
}) => (
  <section className="profile-card">
    <div className="card-header">
      <h3>O mnie</h3>
      <p>Twój publiczny opis widoczny dla innych.</p>
    </div>
    <textarea 
      value={description} 
      onChange={e => setDescription(e.target.value)} 
      placeholder="Napisz coś o sobie..." 
      maxLength={200} 
    />
    <div className="card-footer">
      <span className="char-count">{description.length}/200</span>
      <button className="btn-primary" disabled={isSaving} onClick={onSave}>
        {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
      </button>
    </div>
  </section>
);