/**
 * Hook personalizado para acceder fácilmente al contexto de autenticación (`AuthContext`) dentro de los componentes de React.
 * Permite utilizar las funciones y datos de autenticación desde cualquier parte de la aplicación.
 * Autor: Sebastian Antonio
 */

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';

/**
 *
 * Hook que retorna el contexto de autenticación actual. Este hook encapsula `useContext`
 * para facilitar el acceso al `AuthContext`, que debe envolver a los componentes donde se use.
 *
 * @return {AuthContextType} Objeto que contiene la información y funciones relacionadas con la autenticación del usuario.
 *
 */
export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
