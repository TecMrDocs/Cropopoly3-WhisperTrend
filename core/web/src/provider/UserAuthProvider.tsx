import React, { useState, useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import user from '@/utils/api/user';
import { useNavigate } from 'react-router-dom';


export default function UserAuthProvider({ children }: {children: React.ReactNode}){
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");

    if(token){
      user.user
        .check()
        .then(() => {
          setIsAuthenticated(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error verificando token:", error);
          setIsAuthenticated(false);
          setIsLoading(false);
          localStorage.removeItem("token");
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
    user.user.signIn({email, password})
      .then(({token}) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error al iniciar sesión:", error);
        throw error;
      });
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated, 
      isLoading, 
      signOut, 
      signIn
    }}>
      {children}
    </AuthContext.Provider>
  );
}