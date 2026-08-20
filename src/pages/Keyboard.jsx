import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, Delete, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Layouts based on iOS / iPadOS
const layouts = {
  lowercase: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'delete'],
    ['123', 'space', 'return']
  ],
  uppercase: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'delete'],
    ['123', 'space', 'return']
  ],
  numbers: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['#+=', '.', ',', '?', '!', "'", 'delete'],
    ['ABC', 'space', 'return']
  ],
  symbols: [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
    ['123', '.', ',', '?', '!', "'", 'delete'],
    ['ABC', 'space', 'return']
  ]
};

export default function Keyboard() {
  const [text, setText] = useState('');
  const [layoutName, setLayoutName] = useState('lowercase');
  const [capsLock, setCapsLock] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeKeys, setActiveKeys] = useState(new Set());
  
  const textareaRef = useRef(null);

  // Keep focus on the textarea naturally
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [text]);

  useEffect(() => {
    const mapPhysicalToSoft = (e) => {
      if (e.key === 'Backspace') return 'delete';
      if (e.key === 'Enter') return 'return';
      if (e.key === 'Shift') return 'shift';
      if (e.key === ' ') return 'space';
      // Convert to lowercase to match the soft keyboard layout keys
      return e.key.toLowerCase(); 
    };

    const handleKeyDown = (e) => {
      const softKey = mapPhysicalToSoft(e);
      setActiveKeys(prev => new Set(prev).add(softKey));
    };

    const handleKeyUp = (e) => {
      const softKey = mapPhysicalToSoft(e);
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(softKey);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleKeyPress = (key) => {
    switch (key) {
      case 'delete':
        setText(prev => prev.slice(0, -1));
        break;
      case 'space':
        setText(prev => prev + ' ');
        break;
      case 'return':
        setText(prev => prev + '\n');
        break;
      case 'shift':
        if (layoutName === 'lowercase') {
          setLayoutName('uppercase');
        } else if (layoutName === 'uppercase') {
          if (!capsLock) {
             setLayoutName('lowercase');
          } else {
             setLayoutName('lowercase');
             setCapsLock(false);
          }
        }
        break;
      case '123':
        setLayoutName('numbers');
        break;
      case 'ABC':
        setLayoutName(capsLock ? 'uppercase' : 'lowercase');
        break;
      case '#+=':
        setLayoutName('symbols');
        break;
      default:
        setText(prev => prev + key);
        if (layoutName === 'uppercase' && !capsLock) {
          setLayoutName('lowercase');
        }
        break;
    }
  };

  const handleDoubleShift = () => {
    setCapsLock(true);
    setLayoutName('uppercase');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderKey = (key) => {
    let keyLabel = key;
    let Icon = null;
    let widthClass = 'flex-1';
    let colorClass = 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-500 shadow-sm border-b border-gray-300 dark:border-gray-800';

    if (key === 'delete') {
      Icon = Delete;
      keyLabel = '';
      widthClass = 'w-[13%] max-w-[90px]';
      colorClass = 'bg-[#B3B9C5] dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-[#A3A9B5] dark:hover:bg-gray-600 shadow-sm border-b border-gray-400 dark:border-gray-800';
    } else if (key === 'shift') {
      Icon = ChevronUp;
      keyLabel = '';
      widthClass = 'w-[13%] max-w-[90px]';
      if (layoutName === 'uppercase') {
        colorClass = capsLock 
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-b border-blue-800' 
          : 'bg-white dark:bg-gray-200 text-gray-900 shadow-sm border-b border-gray-300 dark:border-gray-500';
      } else {
        colorClass = 'bg-[#B3B9C5] dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-[#A3A9B5] dark:hover:bg-gray-600 shadow-sm border-b border-gray-400 dark:border-gray-800';
      }
    } else if (key === 'space') {
      keyLabel = 'space';
      widthClass = 'flex-[4] max-w-[600px]';
      colorClass = 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-500 shadow-sm border-b border-gray-300 dark:border-gray-800';
    } else if (key === 'return') {
      keyLabel = 'return';
      widthClass = 'flex-[1.5] max-w-[140px]';
      colorClass = 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-b border-blue-800';
    } else if (['123', 'ABC', '#+='].includes(key)) {
      widthClass = 'w-[15%] max-w-[110px]';
      colorClass = 'bg-[#B3B9C5] dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-[#A3A9B5] dark:hover:bg-gray-600 shadow-sm border-b border-gray-400 dark:border-gray-800';
    }

    const isActive = activeKeys.has(key.toLowerCase());
    if (isActive) {
      // Simulate hover/active state
      colorClass = colorClass.replace('bg-white', 'bg-gray-200').replace('bg-[#B3B9C5]', 'bg-[#9399A5]').replace('dark:bg-gray-600', 'dark:bg-gray-500').replace('dark:bg-gray-700', 'dark:bg-gray-600');
    }

    return (
      <motion.button
        key={key}
        whileTap={{ scale: 0.94, y: 1 }}
        onClick={(e) => {
          e.preventDefault();
          handleKeyPress(key);
        }}
        onDoubleClick={key === 'shift' ? handleDoubleShift : undefined}
        className={`
          flex items-center justify-center rounded-[10px] sm:rounded-[12px] text-lg sm:text-2xl font-medium select-none
          transition-colors duration-75 h-12 sm:h-16 ${widthClass} ${colorClass} ${isActive ? 'scale-[0.94] translate-y-[1px]' : ''}
        `}
      >
        {Icon ? (
          <Icon 
            size={24} 
            strokeWidth={layoutName === 'uppercase' && key === 'shift' && !capsLock ? 3 : 2}
            className={key === 'shift' && layoutName === 'uppercase' ? 'fill-current' : ''} 
          />
        ) : keyLabel}
      </motion.button>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-[#1C1C1E]">
      <div className="flex-1 p-4 md:p-6 flex flex-col max-w-5xl mx-auto w-full">
        {/* Top Controls */}
        <div className="flex justify-between items-center mb-4 px-2">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white tracking-tight">Keyboard</h1>
          <button 
            onClick={copyToClipboard}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
              copied 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md border border-gray-200 dark:border-gray-700'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
        </div>

        {/* Text Area */}
        <div className="flex-1 bg-white dark:bg-[#2C2C2E] rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-6 flex flex-col relative overflow-hidden">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type here..."
            className="w-full h-full resize-none bg-transparent outline-none text-gray-900 dark:text-gray-100 text-2xl sm:text-3xl leading-relaxed placeholder:text-gray-300 dark:placeholder:text-gray-600 font-sans"
          />
        </div>

        {/* Keyboard Container */}
        <div className="bg-[#D1D5DB]/80 dark:bg-[#2C2C2E]/90 backdrop-blur-2xl p-2 sm:p-2.5 rounded-3xl border border-white/40 dark:border-gray-700/50 shadow-2xl mx-auto w-full max-w-[900px]">
          <div className="flex flex-col gap-2 sm:gap-3">
            {layouts[layoutName].map((row, i) => (
              <div 
                key={i} 
                className={`flex gap-1.5 sm:gap-2.5 justify-center ${i === 1 ? 'px-[4.5%] sm:px-[5%]' : ''}`}
              >
                {row.map(renderKey)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
