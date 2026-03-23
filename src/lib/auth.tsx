import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const stored = localStorage.getItem('neurotrader_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u = { name: email.split('@')[0], email };
    setUser(u);
    localStorage.setItem('neurotrader_user', JSON.stringify(u));
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u = { name, email };
    setUser(u);
    localStorage.setItem('neurotrader_user', JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('neurotrader_user');
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
