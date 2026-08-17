import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Calendar as CalendarIcon, 
  Users, 
  StickyNote,
  Languages, 
  Camera, 
  CloudRain, 
  Newspaper, 
  Keyboard as KeyboardIcon 
} from 'lucide-react';

const tools = [
  { path: '/calculator', name: 'Calculator', description: 'Business & Scientific', icon: Calculator, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { path: '/calendar', name: 'Calendar', description: 'Manage your schedule', icon: CalendarIcon, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { path: '/contacts', name: 'Contacts', description: 'Address book', icon: Users, color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { path: '/notes', name: 'Notes', description: 'Multilingual support', icon: StickyNote, color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  // { path: '/lens', name: 'Lens', description: 'Scan & recognize', icon: Camera, color: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
  { path: '/weather', name: 'Weather', description: 'Local forecasts', icon: CloudRain, color: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
  // { path: '/news', name: 'News Feed', description: 'Latest updates', icon: Newspaper, color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  { path: '/keyboard', name: 'Keyboard', description: 'Custom inputs', icon: KeyboardIcon, color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
];

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('bnx_auth_token');
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let name = payload.sub || 'User'; // Fallback to token username
        
        const res = await fetch('https://api.bnxmail.com/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data && data.data.firstName) {
          name = data.data.firstName; // Use actual first name if available
        }
        
        // Capitalize first letter for display
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Welcome back{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(tool.path)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-50 dark:border-gray-700 group hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${tool.color} transition-colors`}>
              <tool.icon size={28} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">{tool.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
