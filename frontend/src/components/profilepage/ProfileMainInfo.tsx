import React from 'react';

interface ProfileMainInfoProps {
  user: any;
  avatarFile: File | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadAvatar: () => void;
}

export const ProfileMainInfo: React.FC<ProfileMainInfoProps> = ({ 
  user, avatarFile, onAvatarChange, onUploadAvatar 
}) => (
  <section className="profile-card profile-main-info">
    <div className="avatar-section">
      <div className="avatar-placeholder">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5269${user.avatarUrl}`} 
            alt="Avatar" 
            className="avatar-image" 
          />
        ) : (
          <span>{user.userName[0].toUpperCase()}</span>
        )}
      </div>

      <div className="avatar-actions">
        {/* Label działa jako stylizowany przycisk */}
        <label htmlFor="avatar-upload-input" className="btn-secondary-glass">
          <span className="icon">📸</span> Wybierz nowe zdjęcie
        </label>
        
        {/* Ukryty faktyczny input */}
        <input 
          id="avatar-upload-input"
          type="file" 
          accept="image/*" 
          onChange={onAvatarChange} 
          style={{ display: 'none' }} 
        />

        {avatarFile && (
          <button className="btn-primary" onClick={onUploadAvatar}>
            Zaktualizuj zdjęcie
          </button>
        )}
      </div>
    </div>

    <div className="info-text">
      <h1>{user.displayName}</h1>
      <p className="username">@{user.userName}</p>
      {user.bio ? (
        <p className="bio-preview">"{user.bio}"</p>
      ) : (
        <p className="bio-empty">Brak opisu profilu</p>
      )}
    </div>
  </section>
);