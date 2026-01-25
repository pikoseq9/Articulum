import React from 'react';

interface GoalsSectionProps {
  goal: number;
  setGoal: (val: number) => void;
  onSave: () => void;
  isSaving: boolean;
  onNavigateHistory: () => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ 
  goal, setGoal, onSave, isSaving, onNavigateHistory 
}) => (
  <section className="profile-card">
    <div className="card-header">
      <h3>Postępy i Historia</h3>
      <p>Twój cel roczny oraz archiwum lektur.</p>
    </div>
    <div className="goal-section-content">
      <input 
        type="number" 
        min={1} 
        max={1000} 
        value={goal} 
        onChange={(e) => setGoal(Number(e.target.value))} 
        className="goal-input" 
      />
      
      <button className="btn-save" disabled={isSaving} onClick={onSave}>
        {isSaving ? "Zapisywanie..." : "Zaktualizuj cel"}
      </button>

    </div>
    <hr style={{ margin: '1.5rem 0', opacity: 0.1 }} />
    <button className="btn-primary" onClick={onNavigateHistory}>
      <span>Pełna historia przeczytanych</span>
    </button>
  </section>
);
