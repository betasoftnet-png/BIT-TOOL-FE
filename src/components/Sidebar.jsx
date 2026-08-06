import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator, 
  Calendar as CalendarIcon, 
  Users, 
  Languages, 
  Camera, 
  CloudRain, 
  Newspaper, 
  Keyboard as KeyboardIcon, 
  Settings as SettingsIcon,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const menuItems = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/calculator', name: 'Calculator', icon: Calculator },
  { path: '/calendar', name: 'Calendar', icon: CalendarIcon },
  { path: '/contacts', name: 'Contacts', icon: Users },
  { path: '/translator', name: 'Translator', icon: Languages },
  { path: '/lens', name: 'Lens', icon: Camera },
  { path: '/weather', name: 'Weather', icon: CloudRain },
  { path: '/news', name: 'News Feed', icon: Newspaper },
  { path: '/keyboard', name: 'Keyboard', icon: KeyboardIcon },
  { path: '/settings', name: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside 
      className={twMerge(
        clsx(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )
      )}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl">
            B
          </div>
          <span className="font-semibold text-lg tracking-tight">Bit Tool</span>
        </div>
        <button 
          className="lg:hidden text-gray-500 hover:bg-gray-100 p-1 rounded-md"
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={clsx(
                    "transition-colors",
                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                  )} 
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
