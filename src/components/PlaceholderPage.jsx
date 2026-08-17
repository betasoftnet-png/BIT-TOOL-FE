import React from 'react';
import { motion } from 'framer-motion';

export default function PlaceholderPage({ title, icon: Icon }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-[70vh] text-center"
    >
      <div className="w-24 h-24 bg-white dark:bg-gray-800 shadow-soft dark:shadow-none rounded-2xl flex items-center justify-center mb-6 border border-transparent dark:border-gray-700 transition-colors">
        <Icon size={40} className="text-primary dark:text-blue-400" />
      </div>
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-2 transition-colors">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md transition-colors">Coming Soon. We are building a premium experience for this tool.</p>
    </motion.div>
  );
}
