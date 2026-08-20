import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Info, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setLightMode, setDarkMode } = useTheme();
  const [user, setUser] = useState({ name: 'User', email: 'Loading...', avatar: null });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('bnx_auth_token');
      if (!token) {
        setUser({ name: 'Guest', email: 'Not logged in' });
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        let name = payload.sub || 'User';
        let email = payload.email || payload.sub || '';
        
        const res = await fetch('https://api.bnxmail.com/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          if (data.data.firstName || data.data.lastName) {
            name = `${data.data.firstName || ''} ${data.data.lastName || ''}`.trim();
          }
          if (data.data.email) {
            email = data.data.email;
          }
          let avatar = data.data.profilePictureUrl ? (data.data.profilePictureUrl.startsWith('http') ? data.data.profilePictureUrl : `https://api.bnxmail.com/${data.data.profilePictureUrl.replace(/^\//, '')}`) : null;
        }
        
        setUser({ name, email, avatar });
      } catch (e) {
        console.error(e);
        setUser({ name: 'User', email: 'Error loading profile', avatar: null });
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your preferences and account</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-50 dark:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-4 mb-6">
            {user.avatar ? (
              <img src={user.avatar} alt="Profile Avatar" className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-100 dark:border-gray-700" />
            ) : (
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your personal information</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
        </motion.div>

        {/* Theme Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-50 dark:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Appearance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize your workspace</p>
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={setLightMode}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border ${
                theme === 'light' 
                  ? 'bg-primary/5 border-primary shadow-sm' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun size={18} className={theme === 'light' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'} />
                <span className={`font-medium ${theme === 'light' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Light Mode</span>
              </div>
              <div className={`w-4 h-4 rounded-full transition-colors ${theme === 'light' ? 'border-4 border-primary' : 'border border-gray-300 dark:border-gray-600'}`}></div>
            </button>
            <button 
              onClick={setDarkMode}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 border ${
                theme === 'dark' 
                  ? 'bg-primary/5 border-primary shadow-sm' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon size={18} className={theme === 'dark' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'} />
                <span className={`font-medium ${theme === 'dark' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>Dark Mode</span>
              </div>
              <div className={`w-4 h-4 rounded-full transition-colors ${theme === 'dark' ? 'border-4 border-primary' : 'border border-gray-300 dark:border-gray-600'}`}></div>
            </button>
          </div>
        </motion.div>

        {/* About Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-50 dark:border-gray-700 md:col-span-2 transition-colors"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">About Bit Tool</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm max-w-2xl">
            Bit Tool is a premium suite of productivity applications designed to help you work smarter and faster. 
            Built with modern web technologies, it offers a seamless and elegant experience across all your devices.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
