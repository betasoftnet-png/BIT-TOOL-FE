import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Calendar as CalendarIcon, 
  Users, 
  Languages, 
  Camera, 
  CloudRain, 
  Newspaper, 
  Keyboard as KeyboardIcon 
} from 'lucide-react';

const tools = [
  { path: '/calculator', name: 'Calculator', description: 'Business & Scientific', icon: Calculator, color: 'bg-blue-50 text-blue-600' },
  { path: '/calendar', name: 'Calendar', description: 'Manage your schedule', icon: CalendarIcon, color: 'bg-purple-50 text-purple-600' },
  { path: '/contacts', name: 'Contacts', description: 'Address book', icon: Users, color: 'bg-green-50 text-green-600' },
  { path: '/translator', name: 'Translator', description: 'Multilingual support', icon: Languages, color: 'bg-orange-50 text-orange-600' },
  // { path: '/lens', name: 'Lens', description: 'Scan & recognize', icon: Camera, color: 'bg-pink-50 text-pink-600' },
  { path: '/weather', name: 'Weather', description: 'Local forecasts', icon: CloudRain, color: 'bg-cyan-50 text-cyan-600' },
  { path: '/news', name: 'News Feed', description: 'Latest updates', icon: Newspaper, color: 'bg-red-50 text-red-600' },
  { path: '/keyboard', name: 'Keyboard', description: 'Custom inputs', icon: KeyboardIcon, color: 'bg-indigo-50 text-indigo-600' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Welcome back, Alex</h1>
        <p className="text-gray-500 mt-1">What would you like to do today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(tool.path)}
            className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-50 group hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
              <tool.icon size={28} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-primary transition-colors">{tool.name}</h2>
            <p className="text-sm text-gray-500">{tool.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
