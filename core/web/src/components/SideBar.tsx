import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { CiUser } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { CiBoxes } from "react-icons/ci";
import { GoQuestion } from "react-icons/go";
import { TbLogout } from "react-icons/tb";
import LogoutModal from './LogOut';

function SideBarItem({ to, ariaLabel, icon, text, isExpanded }: { to: string, ariaLabel: string, icon: React.ReactNode, text: string, isExpanded: boolean }) {
  return (
    <li>
      <Link to={to} className={`flex items-center ${isExpanded ? 'justify-start px-3' : 'justify-center'} hover:bg-white/10 rounded-xl transition-colors duration-200`} aria-label={ariaLabel}>
        {icon}
        {isExpanded && <span className="ml-2">{text}</span>}
      </Link>
    </li>
  )
}

const SideBar: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div
      className={`h-1/2 text-white p-2 rounded-2xl m-5 transition-all duration-300 ease-in-out ${isExpanded ? 'w-48' : 'w-20'
        }`}
      style={{
        background: 'radial-gradient(circle at 0% 0%, #2563eb, #34d399)'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav>
        <ul className="grid grid-cols-1 gap-4 py-4">
          <SideBarItem to="/perfil" ariaLabel="Edición de los datos del perfil" icon={<CiUser className="w-10 h-10" />} text="Perfil" isExpanded={isExpanded} />
          <SideBarItem to="/empresa" ariaLabel="Edición de los datos de la empresa" icon={<FaRegBuilding className="w-10 h-10" />} text="Empresa" isExpanded={isExpanded} />
          <SideBarItem to="/productos" ariaLabel="Página de los productos" icon={<CiBoxes className="w-11 h-11" />} text="Productos" isExpanded={isExpanded} />
          <SideBarItem to="/acercaDe" ariaLabel="Página de acerca de" icon={<GoQuestion className="w-10 h-10" />} text="Acerca de" isExpanded={isExpanded} />
          <li>
            <span
              onClick={() => setMostrarModal(true)}
              className={`flex items-center ${isExpanded ? 'justify-start px-3' : 'justify-center'} hover:bg-white/10 rounded-xl transition-colors duration-200 w-full text-left`}
              aria-label="Cerrar sesión"
            >
              <TbLogout className="w-10 h-10" />
              {isExpanded && <span className="ml-2 text-nowrap">Cerrar Sesión</span>}
            </span>
          </li>
        </ul>
      </nav>
      {mostrarModal && <LogoutModal setMostrarModal={setMostrarModal} />}
    </div>
  );
};

export default SideBar;