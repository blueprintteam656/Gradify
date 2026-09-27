import { AuthProvider } from '../context/AuthContext';
import { RoleProvider } from '../context/RoleContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoleProvider>
          {children}
        </RoleProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
