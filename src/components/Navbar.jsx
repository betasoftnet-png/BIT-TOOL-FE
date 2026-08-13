import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, LogOut, LogIn, Settings, UserPlus, Check } from 'lucide-react';

export default function Navbar({ toggleMobileMenu }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);

  useEffect(() => {
    // 1. Process URL token
    const params = new URLSearchParams(window.location.search);
    const newToken = params.get('token');
    
    // Load existing stored array
    let tokens = [];
    try {
      tokens = JSON.parse(localStorage.getItem('bnx_auth_tokens') || '[]');
    } catch (e) {
      tokens = [];
    }
    
    // If we have an active legacy token but no array, initialize array
    const legacyToken = localStorage.getItem('bnx_auth_token');
    if (legacyToken && tokens.length === 0) {
      tokens = [legacyToken];
    }
    
    // Handle new token from URL
    if (newToken) {
      if (!tokens.includes(newToken)) {
        tokens.push(newToken);
      }
      localStorage.setItem('bnx_auth_tokens', JSON.stringify(tokens));
      localStorage.setItem('bnx_auth_token', newToken); // make it active
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // 2. Fetch profiles
    const activeToken = localStorage.getItem('bnx_auth_token');
    
    const fetchProfiles = async () => {
      const loadedAccounts = [];
      let activeIdx = 0;
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token === activeToken) activeIdx = i;
        
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const baseUser = { token, name: payload.sub || 'User', avatar: null, email: '' };
          
          const res = await fetch('https://api.bnxmail.com/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          
          if (data.success && data.data) {
            loadedAccounts.push({
              ...baseUser,
              ...data.data,
              name: data.data.firstName ? `${data.data.firstName} ${data.data.lastName || ''}`.trim() : (data.data.username || payload.sub),
              avatar: data.data.profilePicture || null,
              email: data.data.email,
            });
          } else {
            loadedAccounts.push(baseUser);
          }
        } catch (e) {
          console.error("Invalid token", e);
        }
      }
      
      const validTokens = loadedAccounts.map(a => a.token);
      if (validTokens.length > 0) {
        localStorage.setItem('bnx_auth_tokens', JSON.stringify(validTokens));
        // If active token was deleted/invalid, default to first valid
        if (!validTokens.includes(activeToken) && validTokens.length > 0) {
          localStorage.setItem('bnx_auth_token', validTokens[0]);
          activeIdx = 0;
        }
      } else {
        localStorage.removeItem('bnx_auth_tokens');
        localStorage.removeItem('bnx_auth_token');
      }
      
      setAccounts(loadedAccounts);
      setActiveAccountIndex(activeIdx);
    };

    if (tokens.length > 0) {
      fetchProfiles();
    }
  }, []);

  const handleSignIn = () => {
    const clientId = 'bit-tool';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth');
    const authUrl = `https://www.b2auth.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    window.location.href = authUrl;
  };

  const handleSignOut = () => {
    const tokens = JSON.parse(localStorage.getItem('bnx_auth_tokens') || '[]');
    tokens.splice(activeAccountIndex, 1); // Remove the active account
    
    if (tokens.length > 0) {
      localStorage.setItem('bnx_auth_tokens', JSON.stringify(tokens));
      localStorage.setItem('bnx_auth_token', tokens[0]); // Switch to another account
      window.location.reload();
    } else {
      localStorage.removeItem('bnx_auth_tokens');
      localStorage.removeItem('bnx_auth_token');
      setAccounts([]);
    }
  };

  const handleManageAccount = () => {
    const activeUser = accounts[activeAccountIndex];
    if (activeUser && activeUser.token) {
      window.open('https://account.beta-softnet.com?token=' + activeUser.token, '_blank');
    }
  };

  const handleSwitchAccount = (index) => {
    const selectedAccount = accounts[index];
    if (selectedAccount && selectedAccount.token) {
      localStorage.setItem('bnx_auth_token', selectedAccount.token);
      setActiveAccountIndex(index);
      window.location.reload(); // Reload to refresh all apps data with new token
    }
  };

  const activeUser = accounts.length > 0 ? accounts[activeAccountIndex] : null;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center">
          <img src="/BIT-TOOL-2.png" alt="Bit Tool Logo" className="h-8" />
        </div>

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
        
        {activeUser ? (
          <div className="flex items-center gap-3 cursor-pointer group relative">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-700 leading-tight">{activeUser.name}</p>
            </div>
            
            {activeUser.avatar ? (
              <img 
                src={activeUser.avatar} 
                alt="Profile Avatar" 
                className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border border-blue-700 shadow-sm shrink-0">
                {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden flex flex-col">
              
              {/* Active Account Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  {activeUser.avatar ? (
                    <img 
                      src={activeUser.avatar} 
                      alt="Profile Avatar" 
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg border border-blue-700 shadow-sm shrink-0">
                      {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{activeUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{activeUser.email}</p>
                  </div>
                  <Check size={18} className="text-blue-600 shrink-0" />
                </div>
              </div>

              {/* Inactive Account List */}
              {accounts.length > 1 && (
                <div className="max-h-48 overflow-y-auto">
                  {accounts.map((acc, idx) => {
                    if (idx === activeAccountIndex) return null;
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleSwitchAccount(idx)}
                        className="p-3 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50"
                      >
                        {acc.avatar ? (
                          <img 
                            src={acc.avatar} 
                            alt="Profile Avatar" 
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold text-xs border border-gray-600 shadow-sm shrink-0">
                            {acc.name ? acc.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{acc.name}</p>
                          <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="p-2 space-y-1 bg-gray-50/30">
                <button 
                  onClick={handleSignIn}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <UserPlus size={16} />
                  Add another account
                </button>
                <button 
                  onClick={handleManageAccount}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <Settings size={16} />
                  Manage account
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleSignIn}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogIn size={16} />
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
