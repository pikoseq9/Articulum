import React, { useState } from "react";
import api from "../axios";

interface Props {
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const ChangePasswordForm: React.FC<Props> = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prosta walidacja zgodności haseł po stronie frontu
    if (formData.newPassword !== formData.confirmPassword) {
      onError("Nowe hasła nie są identyczne");
      return;
    }

    try {
      setIsSaving(true);
      
      // Wysyłamy DTO zgodne z backendem (CurrentPassword, NewPassword)
      await api.post("/api/account/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      onSuccess("Hasło zostało pomyślnie zmienione");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      // Obsługa błędów z Identity (np. IncorrectPassword)
      const errorMsg = err.response?.data?.Message || "Nie udało się zmienić hasła. Sprawdź poprawność danych.";
      onError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="display-name-form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          name="currentPassword"
          type="password"
          placeholder="Obecne hasło"
          value={formData.currentPassword}
          onChange={handleChange}
          required
        />
        <input
          name="newPassword"
          type="password"
          placeholder="Nowe hasło"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Powtórz nowe hasło"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        
        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? "Zmienianie..." : "Zatwierdź zmianę hasła"}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;