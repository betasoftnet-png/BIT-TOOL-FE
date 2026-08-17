import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator, 
  Calendar as CalendarIcon, 
  Users, 
  StickyNote,
  Languages, 
  Camera, 
  CloudRain, 
  Newspaper, 
  Keyboard as KeyboardIcon, 
  Settings as SettingsIcon,
  X,
  HelpCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const menuItems = [
  // { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/calculator', name: 'Calculator', icon: Calculator },
  { path: '/calendar', name: 'Calendar', icon: CalendarIcon },
  { path: '/notes', name: 'Notes', icon: StickyNote },
  { path: '/contacts', name: 'Contacts', icon: Users },
  // { path: '/translator', name: 'Translator', icon: Languages },
  // { path: '/lens', name: 'Lens', icon: Camera },
  { path: '/weather', name: 'Weather', icon: CloudRain },
  // { path: '/news', name: 'News Feed', icon: Newspaper },
  { path: '/keyboard', name: 'Keyboard', icon: KeyboardIcon },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside 
      className={twMerge(
        clsx(
          "fixed top-16 bottom-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-400 shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col transition-colors",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )
      )}
    >


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
                  ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 font-medium" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={clsx(
                    "transition-colors",
                    isActive ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  )} 
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto border-t border-gray-100 dark:border-gray-800 p-4 shrink-0 flex flex-col gap-1 transition-colors">
        <NavLink
          to="/settings"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 font-medium" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            )
          }
        >
          {({ isActive }) => (
            <>
              <SettingsIcon 
                size={20} 
                className={clsx(
                  "transition-colors",
                  isActive ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                )} 
              />
              Settings
            </>
          )}
        </NavLink>

        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100">
          <HelpCircle size={20} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          <span className="font-medium">Help & Support</span>
        </a>
      </div>
    </aside>
  );
}
