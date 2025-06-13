/**
 * Componente de encabezado visual del dashboard que presenta el nombre del producto
 * analizado, junto con una breve descripción del propósito del análisis.
 * 
 * Este encabezado se adapta dinámicamente al producto recibido mediante props.
 *
 * Autor: Sebastian Antonio Almanza
 * Contribuyentes: Andrés Cabrera Alvarado (documentación)
 */

export default function DashboardHeader(props: any) {
  /**
   * Renderiza el encabezado principal del dashboard con un título dinámico
   * y una breve descripción en un contenedor estilizado.
   * 
   * @param props - Objeto que contiene el nombre del producto (`nombreProducto`) a analizar
   * @return JSX que representa el encabezado personalizado del análisis
   */
  return (
    <div className="text-center mb-8">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
        <h1 className="text-4xl font-bold">
          Análisis para <span className="italic">"{props.nombreProducto}"</span>
        </h1>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100 shadow-sm">
          <h2 className="text-lg text-gray-700 leading-relaxed">
            A continuación se presenta el <span className="font-semibold text-blue-600">análisis de tendencias</span> para <span className="font-medium text-indigo-600">"{props.nombreProducto}"</span>, así como su relación con las <span className="font-semibold text-purple-600">ventas del producto</span>.
          </h2>
        </div>
      </div>
    </div>
  );
}
