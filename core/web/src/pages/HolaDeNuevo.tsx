/**
 * Página: HolaDeNuevo.tsx
 * 
 * Descripción:
 * Este componente permite al usuario ingresar un código de verificación enviado por correo 
 * para completar el proceso de autenticación en dos pasos (MFA).
 * Ofrece opciones para reenviar el código, verificarlo o cancelar el proceso.
 * También redirige automáticamente al usuario si ya está autenticado o verificado.
 * 
 * Autor: Mariana Balderrábano Aguilar
 * Contribuyentes: Iván Alexander Ramos Ramírez
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getConfig } from "@/utils/auth";
import WhiteButton from '@/components/WhiteButton';
import BlueButton from '@/components/BlueButton';
import TextFieldWHolder from '@/components/TextFieldWHolder';
import { API_URL } from '@/utils/constants';

/**
 * Componente principal para la verificación MFA por código enviado al correo.
 * Permite validar el código, reenviarlo o cancelar el proceso.
 */
export default function HolaDeNuevo() {
  const [verify, setVerify] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { verifyCode, isAuthenticated, needsVerification } = useAuth();
  const navigate = useNavigate();

  /**
   * Obtiene el ID del usuario actualmente autenticado mediante `/auth/check`.
   * 
   * @return {Promise<number|null>} ID del usuario o null si falla la petición.
   */
  const getUserId = async (): Promise<number|null> => {
    try {
      const res = await fetch(`${API_URL}auth/check`, getConfig());
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      return id;
    } catch {
      return null;
    }
  };

  /**
   * Redirige automáticamente al usuario si ya está verificado o autenticado.
   * Se determina si su perfil es nuevo (con datos de prueba) o si ya tiene información real.
   */
  useEffect(() => {
    if (!needsVerification) {
      if (isAuthenticated) {
        (async () => {
          const id = await getUserId();
          if (!id) {
            navigate('/login', { replace: true });
            return;
          }
          try {
            const res = await fetch(`${API_URL}user/${id}`, getConfig());
            const data = await res.json();
            const isDefault =
              data.plan === 'tracker' &&
              data.business_name === 'test' &&
              data.industry === 'test' &&
              data.company_size === '1234' &&
              data.scope === 'internacional' &&
              data.locations === 'test' &&
              data.num_branches === '1234';

            navigate(isDefault ? '/launchProcess' : '/productos', { replace: true });
          } catch {
            // Si falla la obtención del perfil, redirige por defecto
            navigate('/productos', { replace: true });
          }
        })();
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [needsVerification, isAuthenticated, navigate]);

  /**
   * Verifica el código ingresado por el usuario.
   * En caso de éxito, redirige al dashboard; si falla, muestra un error.
   */
  const handleContinue = async () => {
    if (!verify.trim()) {
      setError('El código de verificación es requerido');
      return;
    }

    setError('');
    setApiError('');
    setIsSubmitting(true);

    try {
      await verifyCode(verify.trim());
      navigate('/productos', { replace: true });
    } catch {
      setApiError('Código inválido. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Reenvía el código de verificación al correo del usuario utilizando el token temporal almacenado.
   */
  const handleResend = async () => {
    try {
      const tempToken = localStorage.getItem('mfa_token') || '';
      await fetch(`${API_URL}auth/mfa/resend`, {
        method: 'POST',
        headers: { 'mfa-token': tempToken }
      });
      alert('Se ha enviado un nuevo código a tu correo.');
    } catch {
      alert('Error al reenviar el código. Intenta más tarde.');
    }
  };

  /**
   * Cancela el proceso de MFA, borra el token y redirige a la página inicial.
   */
  const handleCancel = () => {
    localStorage.removeItem('mfa_token');
    navigate('/', { replace: true });
  };

  /**
   * Renderiza el formulario para ingresar el código de verificación,
   * además de botones para continuar, reenviar o cancelar.
   */
  return (
    <div className='flex flex-col items-center justify-center w-full px-4'>
      <div className="w-full max-w-md">
        <h1 className="md:text-5xl text-3xl font-bold text-blue-900 text-center">
          ¡Hola de nuevo!
        </h1>

        <p className="md:text-3xl text-xl mb-8 pt-8 pb-8 text-center">
          Ingresa el código de verificación que llegó a tu correo
        </p>

        <div className="w-full">
          <label
            htmlFor="verify-input"
            className="w-full text-center md:text-2xl text-xl font-bold text-black block mb-2"
          >
            Código de verificación:
          </label>
          <TextFieldWHolder
            id="verify-input"
            name="verify"
            placeholder="Ingrese su código de verificación"
            value={verify}
            onChange={(e) => setVerify(e.target.value)}
            hasError={!!error || !!apiError}
            width="100%"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {apiError && <p className="text-red-500 text-sm mt-1">{apiError}</p>}
        </div>

        <div className="mt-6 w-full flex flex-col items-center">
          <p className="mt-4 md:text-lg text-md md:p-2 p-4">¿No te llegó el código?</p>

          <div className="mt-6 w-full flex flex-col items-center gap-4">
            <BlueButton
              text={isSubmitting ? 'Verificando…' : 'Continuar'}
              width="300px"
              onClick={handleContinue}
              disabled={isSubmitting}
            />

            <WhiteButton
              text="Enviar un código nuevo"
              width="300px"
              onClick={handleResend}
              disabled={isSubmitting}
            />

            <WhiteButton
              text="Cancelar"
              width="300px"
              onClick={handleCancel}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
