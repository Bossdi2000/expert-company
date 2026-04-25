import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  country?: string;
  phone?: string;
  balance: number;
  total_invested: number;
  total_profit: number;
  custom_roi_bonus: number;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  mockLogin: (email: string, fullName?: string, country?: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USER_ID = "mock-user-123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserData = async () => {
    // Temporary mock data
    const mockProfile: Profile = {
      id: MOCK_USER_ID,
      full_name: localStorage.getItem("mock_name") || "Demo User",
      email: localStorage.getItem("mock_email") || "demo@example.com",
      username: localStorage.getItem("mock_username") || "johndoe",
      country: localStorage.getItem("mock_country") || "United States",
      phone: localStorage.getItem("mock_phone") || "+1 555-0198",
      balance: 150000,
      total_invested: 50000,
      total_profit: 12500,
      custom_roi_bonus: 0,
    };
    setProfile(mockProfile);
    setIsAdmin(false);
  };

  useEffect(() => {
    // Check local storage for mock session
    const isMockLoggedIn = localStorage.getItem("mock_logged_in") === "true";
    
    if (isMockLoggedIn) {
      const mockUser = { id: MOCK_USER_ID, email: localStorage.getItem("mock_email") || "demo@example.com" } as User;
      const mockSession = { user: mockUser } as Session;
      
      setSession(mockSession);
      setUser(mockUser);
      loadUserData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    if (user) await loadUserData();
  };

  const signOut = async () => {
    localStorage.removeItem("mock_logged_in");
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const mockLogin = (email: string, fullName?: string, country?: string, phone?: string) => {
    localStorage.setItem("mock_logged_in", "true");
    localStorage.setItem("mock_email", email);
    if (fullName) localStorage.setItem("mock_name", fullName);
    if (country) localStorage.setItem("mock_country", country);
    if (phone) localStorage.setItem("mock_phone", phone);
    
    const mockUser = { id: MOCK_USER_ID, email } as User;
    const mockSession = { user: mockUser } as Session;
    
    setSession(mockSession);
    setUser(mockUser);
    loadUserData();
  };

  return (
    <AuthContext.Provider
      value={{ session, user, profile, isAdmin, loading, refreshProfile, signOut, mockLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

