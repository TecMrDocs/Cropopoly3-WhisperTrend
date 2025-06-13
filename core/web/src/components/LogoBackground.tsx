/**
 * Componente reutilizable: LogoBackground
 *
 * Este componente renderiza un contenedor de pantalla completa (`min-h-screen`)
 * con un fondo visual basado en un logo con color (`colorLogo`), centrado y sin repetición.
 * Su propósito es envolver otras vistas con un fondo decorativo.
 *
 * Autor: Mariana Balderrabano Aguilar
 * Contribuyentes: Andres Cabrera Alvarado (documentación), Sebastián Antonio Almanza (front design)
 */
import colorLogo from '../images/color-logo.png';

/**
 * Renderiza un fondo con imagen decorativa y contenido superpuesto.
 *
 * @param children - Elementos hijos a mostrar encima del fondo
 * @return JSX que representa una pantalla con fondo de logo y contenido central
 */
export default function LogoBackground(props: any) {
  return (
    <div
      className="min-h-screen flex bg-no-repeat bg-center md:bg-[length:125%]"
      style={{ backgroundImage: `url(${colorLogo})` }}
    >
      {props.children}
    </div>
  );
}
