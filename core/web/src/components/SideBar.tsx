import { FC } from 'react';
import { Link } from 'react-router-dom';

const SideBar: FC = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 text-white p-4">
      <div className="text-xl font-bold mb-8">Dashboard</div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link to="/" className="block p-2 hover:bg-gray-700 rounded">
              Home
            </Link>
          </li>
          <li>
            <Link to="/analytics" className="block p-2 hover:bg-gray-700 rounded">
              Analytics
            </Link>
          </li>
          <li>
            <Link to="/settings" className="block p-2 hover:bg-gray-700 rounded">
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;