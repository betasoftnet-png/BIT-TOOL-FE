import React, { useState, useEffect } from 'react';
import { History, X, ChevronRight, ArrowLeft } from 'lucide-react';
import BitToolLogo from '../assets/BIT-TOOL-2.png';
import CliksBusinessLogo from '../assets/cliks-business.png';
import CliksLogo from '../assets/cliks.png';
import BnxMailIcon from '../assets/bnx-mail.png';

const getAppLogo = (appName) => {
  if (appName?.toLowerCase() === 'bnx mail') return BnxMailIcon;
  if (appName === 'Bit Tool') return BitToolLogo;
  if (appName === 'Cliks Business') return CliksBusinessLogo;
  if (appName === 'Cliks') return CliksLogo;
  return BitToolLogo;
};

export default function GlobalHistory({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drill-down navigation states
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('bnx_auth_token');
        if (!token) {
           setLoading(false);
           return;
        }

        const response = await fetch('https://api.bit-tool.com/api/calculator/history/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.rows) {
          setHistory(data.data.rows);
        }
      } catch (err) {
        console.error("Failed to fetch global history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  // Compute unique apps from history
  const uniqueApps = Array.from(new Set(history.map(s => s.applicationName))).sort();

  const handleBack = () => {
    if (selectedSession) {
      setSelectedSession(null);
    } else if (selectedApp) {
      setSelectedApp(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <div className="text-center text-gray-400 text-sm mt-12 flex flex-col items-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3 transition-colors">
             <History size={24} className="opacity-50" />
          </div>
          <p className="font-semibold text-gray-500 dark:text-gray-300">No cross-app history</p>
          <p className="text-xs mt-1">Calculations from all apps will appear here</p>
        </div>
      );
    }

    // LEVEL 3: Show Items inside a Tape
    if (selectedSession) {
      const items = selectedSession.items || [];
      return (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-500 mb-2 px-1 uppercase tracking-wider flex items-center gap-2">
             <img src={getAppLogo(selectedSession.applicationName)} alt="" className="w-4 h-4 rounded-sm" />
             {selectedSession.title || 'Tape Items'}
          </div>
          {items.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-4">No items in this tape</div>
          ) : (
            items.map((item, index) => (
              <div key={item.id || index} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col transition-colors">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                     {item.label || `Step ${item.sequence}`}
                   </span>
                   <span className="text-[10px] text-gray-400">
                     {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                   </span>
                </div>
                <div className="flex justify-between items-end mt-1">
                   <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{item.operator || ''} {parseFloat(item.value).toLocaleString('en-IN', {maximumFractionDigits: 4})}</span>
                   <span className="text-sm font-black text-gray-800 dark:text-gray-100">₹{parseFloat(item.runningTotal).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    // LEVEL 2: Show Tapes for a selected App
    if (selectedApp) {
      const appSessions = history.filter(s => s.applicationName === selectedApp);
      return (
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-gray-500 mb-1 px-1 uppercase tracking-wider flex items-center gap-2">
             <img src={getAppLogo(selectedApp)} alt="" className="w-4 h-4 rounded-sm" />
             {selectedApp} Tapes
          </div>
          {appSessions.map(session => {
            const itemsCount = session.items?.length || 0;
            const lastItem = itemsCount > 0 ? session.items[itemsCount - 1] : null;
            const finalTotal = lastItem ? lastItem.runningTotal : '0.00';
            
            return (
              <div 
                key={session.id} 
                onClick={() => setSelectedSession(session)}
                className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-500/50 transition-all cursor-pointer group flex justify-between items-center"
              >
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {session.title || 'Tape'}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                    <span>{new Date(session.createdAt).toLocaleDateString()} {new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span>•</span>
                    <span>{itemsCount} items</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-black text-gray-800 dark:text-gray-100">
                    ₹{parseFloat(finalTotal).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // LEVEL 1: Show Apps
    return (
      <div className="flex flex-col gap-3">
        <div className="text-xs font-bold text-gray-500 mb-1 px-1 uppercase tracking-wider">Applications</div>
        {uniqueApps.map(appName => {
          const appHistoryCount = history.filter(s => s.applicationName === appName).length;
          return (
            <div 
              key={appName} 
              onClick={() => setSelectedApp(appName)}
              className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-500/50 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img src={getAppLogo(appName)} alt={appName} className="w-8 h-8 rounded-lg object-contain border border-gray-50 dark:border-gray-700 shadow-sm" />
                <div>
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{appName}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{appHistoryCount} {appHistoryCount === 1 ? 'Tape' : 'Tapes'} saved</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white/90 dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none rounded-[24px] overflow-hidden w-full xl:w-80 flex-shrink-0 transition-all duration-300">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 min-h-[60px]">
        <div className="flex items-center gap-3 text-gray-800 dark:text-white font-extrabold flex-1">
          {selectedApp || selectedSession ? (
            <button 
              onClick={handleBack} 
              className="p-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors shadow-sm flex items-center gap-1"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
               <History size={18} />
            </div>
          )}
          <span className="truncate pr-2">
             {selectedSession ? 'Tape Details' : selectedApp ? selectedApp : 'Cross-App History'}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 rounded-full text-gray-400 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50 transition-colors">
        {renderContent()}
      </div>
    </div>
  );
}
