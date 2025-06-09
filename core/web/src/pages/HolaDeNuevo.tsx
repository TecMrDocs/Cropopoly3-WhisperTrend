import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import WhiteButton from '@/components/WhiteButton';
import BlueButton from '@/components/BlueButton';
import TextFieldWHolder from '@/components/TextFieldWHolder';
import { API_URL } from '@/utils/constants';

export default function HolaDeNuevo() {
  const [verify, setVerify] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyCode, isAuthenticated, needsVerification } = useAuth();
  const navigate = useNavigate();

  // Redirige si ya no hace falta verificar
  useEffect(() => {
    if (!needsVerification) {
      if (isAuthenticated) {
        navigate('/productos', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [needsVerification, isAuthenticated, navigate]);

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

  const handleCancel = () => {
    localStorage.removeItem('mfa_token');
    navigate('/', { replace: true });
  };

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
            <p className="mt-4 md:text-lg text-md md:p-2 p-4">¿No te llegó el código?</p>

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
