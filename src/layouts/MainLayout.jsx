import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background dark:bg-gray-900 overflow-hidden font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop Fixed, Mobile Drawer */}
        <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-3.5 md:p-8 min-w-0 bg-gray-50/30 dark:bg-gray-900/50 transition-colors">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
