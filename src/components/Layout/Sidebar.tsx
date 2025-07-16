import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Users, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { groupsAPI } from '../../services/api';
import { Group } from '../../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const menuItems = [
    { icon: MessageCircle, label: 'Chat', path: '/dashboard' },
    { icon: Users, label: 'Groups', path: '/groups' },
    { icon: BookOpen, label: 'Assignments', path: '/assignments' },
    { icon: BarChart3, label: 'Polls', path: '/polls' },
  ];

  if (user?.role === 'admin' || user?.role === 'hod') {
    menuItems.push({ icon: Settings, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">BCA Communication</h1>
        <p className="text-sm text-gray-600">{user?.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Groups</h3>
          <ul className="space-y-1">
            {groups.map((group) => (
              <li key={group._id}>
                <Link
                  to={`/chat/${group._id}`}
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg truncate"
                >
                  {group.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;