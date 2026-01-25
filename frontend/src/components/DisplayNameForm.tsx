import React, { useState } from "react";
import api from "../axios";
import { useAuth } from "../authContext";

interface Props {
  initialName: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const DisplayNameForm: React.FC<Props> = ({ initialName, onSuccess, onError }) => {
  const { login } = useAuth();
  const [newName, setNewName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName === initialName) return;

    try {
      setIsSaving(true);
      // Wysyłamy string jako JSON body
      const res = await api.put("/api/account/update-displayname", JSON.stringify(newName), {
        headers: { "Content-Type": "application/json" }
      });
      login(res.data);
      onSuccess("Nazwa użytkownika została zmieniona!");
    } catch (err) {
      onError("Błąd podczas zmiany nazwy.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="display-name-form">
      <div className="verify-inline">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nowa nazwa wyświetlana"
          minLength={3}
          maxLength={50}
        />
        <button type="submit" className="btn-primary" disabled={isSaving || newName === initialName}>
          {isSaving ? "Zapisywanie..." : "Zmień nazwę"}
        </button>
      </div>
    </form>
  );
};

export default DisplayNameForm;