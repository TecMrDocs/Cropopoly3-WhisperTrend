import React, { useState, useEffect} from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/utils/api/admin';


export default function AuthProvider({ children }: {children: React.ReactNode}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if(token) {
      api.admin
        .verifyAdmin()
        .then(() => {
          setIsAuthenticated(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setIsLoading(false);
        });
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);


  function signOut() {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  }

  function signIn(email: string, password: string) {
    api.admin.loginAdmin(email, password)
      .then(({ token }) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
      })
  }


  return (
   <AuthContext.Provider value={{
      isAuthenticated, 
      isLoading, 
      signOut,
      signIn
      }
    }>
    {children}
  </AuthContext.Provider>
  );

  
}