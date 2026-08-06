import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

export default function Navbar({ toggleMobileMenu }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Search Bar (UI Only) */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-full px-4 py-2 w-64 lg:w-80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-inner">
          <Search size={16} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search tools, contacts..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-700 leading-tight">Alex Reed</p>
            <p className="text-xs text-gray-500">Pro Plan</p>
          </div>
          <img 
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
            alt="Profile Avatar" 
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
