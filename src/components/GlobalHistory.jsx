import React, { useState, useEffect } from 'react';
import { History, X } from 'lucide-react';
import BitToolLogo from '../assets/BIT-TOOL-2.png';
import CliksBusinessLogo from '../assets/cliks-business.png';
import CliksLogo from '../assets/cliks.png';

const getAppLogo = (appName) => {
  if (appName === 'Bit Tool') return BitToolLogo;
  if (appName === 'Cliks Business') return CliksBusinessLogo;
  if (appName === 'Cliks') return CliksLogo;
  return BitToolLogo; // fallback
};

export default function GlobalHistory({ onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col h-full bg-white/90 backdrop-blur-xl border border-gray-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[24px] overflow-hidden w-80 flex-shrink-0 transition-all duration-300">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3 text-gray-800 font-extrabold">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
             <History size={18} />
          </div>
          <span>Cross-App History</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-12 flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
               <History size={24} className="opacity-50" />
            </div>
            <p className="font-semibold text-gray-500">No cross-app history</p>
            <p className="text-xs mt-1">Calculations from all apps will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map(session => {
              const itemsCount = session.items?.length || 0;
              const lastItem = itemsCount > 0 ? session.items[itemsCount - 1] : null;
              const finalTotal = lastItem ? lastItem.runningTotal : '0.00';
              
              return (
                <div key={session.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-3">
                    <img src={getAppLogo(session.applicationName)} alt={session.applicationName} className="w-6 h-6 rounded-md object-contain border border-gray-50 shadow-sm" />
                    <span className="text-xs font-bold text-gray-700">{session.applicationName}</span>
                    <span className="ml-auto text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-full">{new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
                      {session.title || 'Tape'} • {itemsCount} items
                    </div>
                    <div className="text-sm font-black text-gray-800 group-hover:text-blue-600 transition-colors">
                      ₹{parseFloat(finalTotal).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
