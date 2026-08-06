import React from 'react';
import { motion } from 'framer-motion';

export default function PlaceholderPage({ title, icon: Icon }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-[70vh] text-center"
    >
      <div className="w-24 h-24 bg-white shadow-soft rounded-2xl flex items-center justify-center mb-6">
        <Icon size={40} className="text-primary" />
      </div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-md">Coming Soon. We are building a premium experience for this tool.</p>
    </motion.div>
  );
}
