import { createContext, useContext } from 'react';
import { useAuthContext } from './AuthContext';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const { currentUser } = useAuthContext();
  const role = currentUser?.role ?? null;

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  return ctx; // may be null when not authenticated
}

export default RoleContext;
