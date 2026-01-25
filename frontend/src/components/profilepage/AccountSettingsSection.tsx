import React from 'react';
import { BackButton } from "../BackButton";
import DisplayNameForm from "../DisplayNameForm";
import ChangePasswordForm from "../ChangePasswordForm";

interface AccountSettingsSectionProps {
  user: any;
  activeSetting: 'menu' | 'name' | 'password';
  setActiveSetting: (val: 'menu' | 'name' | 'password') => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const AccountSettingsSection: React.FC<AccountSettingsSectionProps> = ({
  user,
  activeSetting,
  setActiveSetting,
  onSuccess,
  onError
}) => {
  return (
    <section className="profile-card">
      <div className="card-header">
        <h3>Ustawienia konta</h3>
        <p>Zarządzaj swoimi danymi i bezpieczeństwem.</p>
      </div>

      {activeSetting === 'menu' ? (
        <div className="settings-menu-list">
          <button className="settings-item-btn" onClick={() => setActiveSetting('name')}>
            <div className="settings-item-info">
              <span className="icon">👤</span>
              <div>
                <strong>Zmień nazwę wyświetlaną</strong>
                <p>Obecnie: {user.displayName}</p>
              </div>
            </div>
            <span className="arrow">→</span>
          </button>

          <button className="settings-item-btn" onClick={() => setActiveSetting('password')}>
            <div className="settings-item-info">
              
              <div>
                <strong>Zmień hasło</strong>
                <p>Zadbaj o bezpieczeństwo konta</p>
              </div>
            </div>
            <span className="arrow">→</span>
          </button>
        </div>
      ) : (
        <div className="settings-form-wrapper">
          <BackButton 
            variant="text" 
            label="Wróć do menu" 
            onClick={() => setActiveSetting('menu')} 
          />
          
          {activeSetting === 'name' ? (
            <>
              <h4>Zmiana nazwy</h4>
              <DisplayNameForm 
                initialName={user.displayName} 
                onSuccess={(msg) => { onSuccess(msg); setActiveSetting('menu'); }}
                onError={onError}
              />
            </>
          ) : (
            <>
              <h4>Zmiana hasła</h4>
              <ChangePasswordForm 
                onSuccess={(msg) => { onSuccess(msg); setActiveSetting('menu'); }}
                onError={onError}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
};