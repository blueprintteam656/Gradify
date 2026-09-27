import { createContext, useContext, useState, useCallback } from 'react';
import { ROLES } from '../constants/roles';
import * as authService from '../services/mock/mockAuthService';

const AuthContext = createContext(null);

const SESSION_KEY = 'gradify-session';
const REMEMBER_ME_MS = 30 * 24 * 60 * 60 * 1000;

// "Remember me" → localStorage (30 days); otherwise sessionStorage (cleared when the tab closes).
function readStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session.expiresAt && session.expiresAt < Date.now()) {
      clearStoredSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable (e.g. private mode) — nothing to clear.
  }
}

function storeSession(session, rememberMe) {
  clearStoredSession();
  try {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable — session lives in memory only.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const currentUser = session?.user ?? null;

  const startSession = useCallback(({ accessToken, refreshToken, user }, rememberMe) => {
    const next = {
      accessToken,
      refreshToken,
      user,
      expiresAt: rememberMe ? Date.now() + REMEMBER_ME_MS : null,
    };
    storeSession(next, rememberMe);
    setSession(next);
    return user;
  }, []);

  const login = useCallback(
    async ({ emailOrUsername, password, rememberMe = false }) => {
      const result = await authService.login({ emailOrUsername, password, rememberMe });
      return startSession(result, rememberMe);
    },
    [startSession],
  );

  // Right after email verification: sign the new user in without asking for the password again.
  const signInAfterVerification = useCallback(
    async (email) => startSession(await authService.signInVerifiedUser(email), false),
    [startSession],
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    return Promise.resolve();
  }, []);

  // Dev-only: switch role for testing role-gated routes (in memory, not persisted)
  const switchRole = useCallback((role) => {
    if (!Object.values(ROLES).includes(role)) return;
    setSession((prev) => (prev ? { ...prev, user: { ...prev.user, role } } : null));
  }, []);

  const value = { currentUser, login, signInAfterVerification, logout, switchRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
