import { createContext, useContext, useEffect, useState } from "react";
import api from "./axios";

interface User {
  isMfaEnabled: boolean;
  displayName: string;
  userName: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  appLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appLoading, setAppLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
        setAppLoading(false);
        return;
    }

    api.get<User>("/api/Account")
      .then(res => {
        const tokenToSave = res.data.token || token;
        const userWithToken = { ...res.data, token: tokenToSave };
        
        setUser(userWithToken);
        localStorage.setItem("jwt", tokenToSave);
      })
      .catch((err) => {
        console.error("Błąd przywracania sesji:", err);
        localStorage.removeItem("jwt");
        setUser(null);
      })
      .finally(() => {
        setAppLoading(false);
      });
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("jwt", userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("jwt");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, appLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};