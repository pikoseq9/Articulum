import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios";
import { useAuth } from "../authContext";
import { BackButton } from "./BackButton";

// Nowe komponenty
import { ProfileMainInfo } from "./profilepage/ProfileMainInfo";
import { BioSection } from "./profilepage/BioSection";
import { GoalsSection } from "./profilepage/GoalSection";
import { SecuritySection } from "./profilepage/SecuritySection";
import { AccountSettingsSection } from "./profilepage/AccountSettingsSection";

import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // --- STAN ---
  const [activeSetting, setActiveSetting] = useState<'menu' | 'name' | 'password'>('menu');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [description, setDescription] = useState(user?.bio || "");
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [goal, setGoal] = useState<number>(user?.myGoal ?? 0);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const showStatus = (type: 'success' | 'error' | 'info', text: string) => setStatusMessage({ type, text });
  
  // Stan MFA
  const [method, setMethod] = useState<"authenticator" | "email" | null>(null);
  const [mfaData, setMfaData] = useState<any>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisableMfa, setShowDisableMfa] = useState(false);

  // Sync z danymi usera
  useEffect(() => { setDescription(user?.bio || ""); }, [user?.bio]);
  useEffect(() => { setGoal(user?.myGoal ?? 0); }, [user?.myGoal]);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // --- LOGIKA API ---
  const handleSaveBio = async () => {
    try {
      setIsSavingDesc(true);
      const res = await api.put("/api/account/update-bio", { bio: description });
      login(res.data); 
      showStatus("success", "Opis zapisany");
    } catch { showStatus("error", "Nie udało się zapisać opisu"); }
    finally { setIsSavingDesc(false); }
  };

  const handleSaveGoal = async () => {
    try {
      setIsSavingGoal(true);
      const res = await api.post("/api/account/update-goal", { newGoal: goal });
      login(res.data);
      showStatus("success", "Cel roczny zapisany 🎯");
    } catch { showStatus("error", "Nie udało się zapisać celu"); }
    finally { setIsSavingGoal(false); }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append("file", avatarFile);
    try {
      const res = await api.post("/api/account/upload-avatar", formData);
      login(res.data); 
      showStatus("success", "Zdjęcie profilowe zaktualizowane!");
      setAvatarFile(null);
    } catch { showStatus("error", "Nie udało się zaktualizować zdjęcia."); }
  };

  const handleEnableMfa = async (selectedMethod: "authenticator" | "email") => {
    try {
      setStatusMessage(null);
      setMethod(selectedMethod);
      const res = await api.post(`/api/account/enable-mfa?method=${selectedMethod}`);
      if (selectedMethod === "authenticator") setMfaData(res.data);
      else showStatus('info', "Kod weryfikacyjny został wysłany na Twój e-mail.");
    } catch {
      setMethod(null);
      showStatus('error', "Nie udało się rozpocząć konfiguracji MFA.");
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/account/confirm-mfa-enable", JSON.stringify(code), {
        headers: { "Content-Type": "application/json" }
      });
      login(res.data);
      showStatus("success", "MFA aktywowane pomyślnie!");
    } catch { showStatus('error', "Nieprawidłowy kod. Spróbuj ponownie."); }
  };

  const handleOpenDisableMfa = async () => {
    setShowDisableMfa(true);
    setDisableCode("");
    try { await api.post("/api/account/send-disable-code"); }
    catch { showStatus("error", "Nie udało się wysłać kodu"); }
  };

  const handleDisableMfa = async () => {
    try {
      await api.post("/api/account/disable-mfa", { code: disableCode });
      const res = await api.get("/api/account");
      login(res.data);
      showStatus("success", "MFA zostało wyłączone");
    } catch { showStatus("error", "Nieprawidłowy kod"); }
  };

  if (!user) return <div className="content"><p>Musisz być zalogowany.</p></div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <header className="profile-nav">
          <BackButton variant="text" label="Wróć do panelu" />
        </header>

        <ProfileMainInfo 
          user={user} 
          avatarFile={avatarFile}
          onAvatarChange={(e) => e.target.files && setAvatarFile(e.target.files[0])}
          onUploadAvatar={handleUploadAvatar}
        />

        <div className="profile-grid">
          <BioSection 
            description={description} 
            setDescription={setDescription} 
            onSave={handleSaveBio} 
            isSaving={isSavingDesc} 
          />

          <GoalsSection 
            goal={goal} 
            setGoal={setGoal} 
            onSave={handleSaveGoal} 
            isSaving={isSavingGoal}
            onNavigateHistory={() => navigate('/profile/history')}
          />

          <AccountSettingsSection 
            user={user}
            activeSetting={activeSetting}
            setActiveSetting={setActiveSetting}
            onSuccess={(msg) => showStatus('success', msg)}
            onError={(msg) => showStatus('error', msg)}
          />

          <SecuritySection 
            user={user}
            method={method}
            mfaData={mfaData}
            code={code}
            setCode={setCode}
            disableCode={disableCode}
            setDisableCode={setDisableCode}
            showDisableMfa={showDisableMfa}
            setShowDisableMfa={setShowDisableMfa}
            onEnableMfa={handleEnableMfa}
            onVerifyMfa={handleVerifyMfa}
            onDisableMfa={handleDisableMfa}
            onOpenDisableMfa={handleOpenDisableMfa}
            onCancelSetup={() => { setMethod(null); setMfaData(null); setCode(""); }}
          />
        </div>

        {statusMessage && <div className={`toast-message ${statusMessage.type}`}>{statusMessage.text}</div>}
      </div>
    </div>
  );
};

export default ProfilePage;