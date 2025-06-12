/**
 * Componente SideBar de navegación lateral.
 * Este componente renderiza una barra lateral expandible que permite al usuario
 * navegar entre diferentes secciones de la aplicación: Perfil, Empresa, Productos, 
 * Acerca de y Cerrar sesión. También gestiona la visualización del modal de cierre de sesión.
 *
 * Autor: Sebastián Antonio Almanza 
 * Contribuyentes: Carlos Zamudio Velazquez 
 */
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { CiUser } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { CiBoxes } from "react-icons/ci";
import { GoQuestion } from "react-icons/go";
import { TbLogout } from "react-icons/tb";
import LogoutModal from './LogOut';

/**
 *
 * Componente funcional que representa una barra lateral expandible.
 * Al pasar el mouse por encima, se expande para mostrar etiquetas de texto junto a los íconos.
 * Incluye navegación mediante `react-router-dom` y muestra un modal al solicitar cerrar sesión.
 *
 * @return {JSX.Element} Elemento JSX que representa la barra lateral de navegación.
 *
 */
const SideBar: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div
      className={`hidden md:block h-1/2 text-white p-2 rounded-2xl m-5 transition-all duration-300 ease-in-out ${isExpanded ? 'w-48' : 'w-20'
        }`}
      style={{
        background: 'radial-gradient(circle at 0% 0%, #2563eb, #34d399)'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/perfil" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200" aria-label="Edición de los datos del perfil ">
              <CiUser className="w-10 h-10" />
              {isExpanded && <span className="ml-2">Perfil</span>}
              
            </Link>
          </li>
          <li>
            <Link to="/empresa" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200" aria-label="Edición de los datos de la empresa">
              <FaRegBuilding className="w-10 h-10" />
              {isExpanded && <span className="ml-2">Empresa</span>}
            </Link>
          </li>
          <li>
            <Link to="/productos" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200" aria-label="Página de los productos">
              <CiBoxes className="w-11 h-11" />
              {isExpanded && <span className="ml-2">Productos</span>}
            </Link>
          </li>
          <li>
            <Link to="/acercaDe" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200" aria-label="Página de acerca de">
              <GoQuestion className="w-10 h-10" />
              {isExpanded && <span className="ml-2">Acerca de</span>}
            </Link>
          </li>
          <li>
            <button
              // onClick={handleLogout}
              onClick={() => setMostrarModal(true)}
              className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200 w-full text-left"
              aria-label="Cerrar sesión"
            >
              <TbLogout className="w-10 h-10" />
              {isExpanded && <span className="ml-2">Cerrar Sesión</span>}
            </button>
          </li>
        </ul>
      </nav>
      {mostrarModal && <LogoutModal setMostrarModal={setMostrarModal} />}
    </div>
  );
};

export default SideBar;