// core/web/src/contexts/AuthContext.tsx
import { createContext } from 'react';

export type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;      // verdadero sólo tras haber pasado 2FA
  needsVerification: boolean;    // verdadero tras un login exitoso, hasta que pase el 2FA
  signOut: () => void;
  // signIn: (email: string, password: string) => void;
  signIn: (email: string, password: string) => Promise<void>; 
  verifyCode: (code: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  needsVerification: false,
  signOut: () => {},
  // signIn: () => {},
  signIn: () => Promise.resolve(),
  verifyCode: async () => {},
});
