/**
 * Componente visual de bienvenida que guía al usuario sobre cómo comenzar
 * el análisis de tendencias dentro del panel principal.
 * 
 * Presenta un mensaje introductorio con diseño atractivo, iconografía ilustrativa,
 * consejos de uso (TIP), y ejemplos de acciones que puede realizar el usuario.
 *
 * Autor: Sebastián Antonio Almanza
 * Contribuyentes: Andrés Cabrera Alvarado (documentación)
 */

export default function MensajeInicial() {
  /**
   * Renderiza el panel de bienvenida con un fondo degradado, íconos SVG
   * representativos y mensajes de ayuda interactivos.
   *
   * @return JSX que muestra el mensaje inicial con estructura visual atractiva
   */
  return (
    <div className="w-full h-96 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 rounded-xl border-2 border-dashed border-blue-300 relative overflow-hidden px-4">
      
      {/* Icono de fondo decorativo */}
      <div className="absolute top-4 right-4 opacity-20">
        <svg className="h-20 w-20 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 6l2.29 2.29c.39.39.39 1.02 0 1.41L16 12l2.29 2.29c.39.39.39 1.02 0 1.41L16 18l-4-4 4-4 4-4-4-4z"/>
        </svg>
      </div>
      
      {/* Contenido principal del mensaje */}
      <div className="text-center max-w-md mx-auto relative z-10">

        {/* Icono principal animado */}
        <div className="mb-4">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg 
              className="h-8 w-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        {/* Título llamativo */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          ¡Bienvenido al análisis de tendencias!
        </h3>

        {/* Tip con sugerencia útil para el usuario */}
        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mb-3 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-center mb-1">
            <div className="bg-yellow-400 rounded-full p-1 mr-2">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">💡 TIP</span>
          </div>
          <p className="text-gray-700 text-sm font-medium leading-tight">
            Selecciona cualquier <span className="text-blue-600 font-semibold">tendencia del menú lateral</span> para ver gráficas interactivas
          </p>
        </div>

        {/* Lista de funcionalidades destacadas */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 flex-shrink-0"></div>
            <span>Explora <strong>ventas</strong> del producto</span>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
            <span>Analiza <strong>hashtags</strong> y tendencias</span>
          </div>
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2 flex-shrink-0"></div>
            <span>Revisa impacto de <strong>noticias</strong></span>
          </div>
        </div>

        {/* Indicador de navegación con animación */}
        <div className="mt-4 flex justify-center">
          <div className="animate-bounce">
            <div className="bg-blue-500 rounded-full p-2 shadow-lg">
              <svg 
                className="h-4 w-4 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
