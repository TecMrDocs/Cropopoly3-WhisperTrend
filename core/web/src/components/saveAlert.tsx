/**
 * Componente SaveAlert que muestra una alerta modal sencilla indicando
 * que los datos se guardaron correctamente.
 * 
 * Se usa para notificar al usuario el éxito de alguna operación,
 * mostrando un ícono, título y mensaje.
 * 
 * Autor: Sebastián Antonio Almanza 
 */

  /**
   * Renderiza un modal centrado en pantalla con fondo transparente,
   * que contiene un cuadro blanco con sombra, ícono de check y mensaje de éxito.
   * 
   * @returns JSX.Element - Alerta visual de confirmación de guardado exitoso.
   */
export default function SaveAlert() {
  return (
    <div className="fixed inset-0 bg-transparent  flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
          ¡Éxito!
        </h2>
        <p className="text-center text-gray-600">
          Datos guardados correctamente
        </p>
      </div>
    </div>
  );
}
