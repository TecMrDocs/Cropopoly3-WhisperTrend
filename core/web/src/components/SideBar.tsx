import { FC } from 'react';
import { Link } from 'react-router-dom';
import { CiUser } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { CiBoxes } from "react-icons/ci";
import { GoQuestion } from "react-icons/go";
import { TbLogout } from "react-icons/tb";

const SideBar: FC = () => {
  return (
    <div 
      className="h-[40vh] w-20 text-white p-1.5 rounded-2xl m-5"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #2563eb, #34d399)'
      }}
    >
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="block p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <CiUser className="w-10 h-10"/>
            </Link>
          </li>
          <li>
            <Link to="/analytics" className="block p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <FaRegBuilding className="w-10 h-10"/>
            </Link>
          </li>
          <li>
            <Link to="/settings" className="block p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <CiBoxes className="w-10 h-10"/>
            </Link>
          </li>
          <li>
            <Link to="/settings" className="block p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <GoQuestion className="w-10 h-10"/>
            </Link>
          </li> 
          <li>
            <Link to="/settings" className="block p-2 hover:bg-white/10 rounded-xl transition-colors duration-200">
              <TbLogout className="w-10 h-10"/>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;