import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { CiUser } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { CiBoxes } from "react-icons/ci";
import { GoQuestion } from "react-icons/go";
import { TbLogout } from "react-icons/tb";

const SideBar: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
<<<<<<< HEAD
      className={`h-[42vh] text-white p-2 rounded-2xl m-5 transition-all duration-300 ease-in-out ${
=======
      className={`h-1/2 text-white p-2 rounded-2xl m-5 transition-all duration-300 ease-in-out ${
>>>>>>> 5bb85cbfd1eab873925f0e26656bd9d490395925
        isExpanded ? 'w-48' : 'w-20'
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
            <Link to="/perfil" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <CiUser className="w-10 h-10"/>
              {isExpanded && <span className="ml-2">Perfil</span>}
            </Link>
          </li>
          <li>
            <Link to="/empresa" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <FaRegBuilding className="w-10 h-10"/>
              {isExpanded && <span className="ml-2">Empresa</span>}
            </Link>
          </li>
          <li>
            <Link to="/productos" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <CiBoxes className="w-11 h-11"/>
              {isExpanded && <span className="ml-2">Productos</span>}
            </Link>
          </li>
          <li>
            <Link to="/acercaDe" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <GoQuestion className="w-10 h-10"/>
              {isExpanded && <span className="ml-2">Acerca de</span>}
            </Link>
          </li> 
          <li>
            <Link to="/" className="flex items-center p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <TbLogout className="w-10 h-10"/>
              {isExpanded && <span className="ml-2">Cerrar Sesión</span>}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;