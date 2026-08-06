import React from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Info, ChevronRight } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences and account</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-soft border border-gray-50"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
              <p className="text-sm text-gray-500">Your personal information</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-medium text-gray-800">Alex Reed</p>
                <p className="text-xs text-gray-500">alex@example.com</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </motion.div>

        {/* Theme Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-soft border border-gray-50"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Appearance</h2>
              <p className="text-sm text-gray-500">Customize your workspace</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-700">Light Mode</span>
              <div className="w-4 h-4 rounded-full border-4 border-primary"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl opacity-50 cursor-not-allowed">
              <span className="font-medium text-gray-700">Dark Mode (Coming Soon)</span>
              <div className="w-4 h-4 rounded-full border border-gray-300"></div>
            </div>
          </div>
        </motion.div>

        {/* About Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-soft border border-gray-50 md:col-span-2"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">About Bit Tool</h2>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm max-w-2xl">
            Bit Tool is a premium suite of productivity applications designed to help you work smarter and faster. 
            Built with modern web technologies, it offers a seamless and elegant experience across all your devices.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
