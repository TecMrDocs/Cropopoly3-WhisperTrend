import MathCalc2 from '../mathCalculus/MathCalc2';
import MenuComponentes from '../components/MenuComponentes';

export default function Dashboard() {
  const nombreProducto = "Bolso Mariana :D";

  return (
    <div className="p-6">

      <div className="flex justify-center mb-4">
        <h1 className="text-3xl font-bold"> Análisis para "{nombreProducto}"</h1>
      </div>

      <div className="flex justify-center mb-4">
        <h2 className="text-xl">
          A continuación se presenta el análisis de tendencias para “{nombreProducto}”, así como su relación con las ventas del producto.
        </h2>
      </div>


      <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">

        <div className="w-full lg:w-4/5">
          <h3 className="text-2xl font-bold mb-4">Gráfica de Líneas</h3>
          <MathCalc2 />
        </div>

        {/* Sección derecha: MenuComponentes */}
        <div className="w-full lg:w-4/5">
          <MenuComponentes />
        </div>

      </div>
    </div>
  );
}
