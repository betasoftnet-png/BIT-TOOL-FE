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
    localStorage.removeItem('bnx_auth_tokens');
    localStorage.removeItem('bnx_auth_token');
    localStorage.removeItem('bnx_active_token_index');
    setAccounts([]);
    window.location.reload();
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
    <header className="h-16 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm transition-colors" style={{backgroundColor:"rgba(17, 87, 218, 0.66)"}}>
      <div className="flex items-center gap-6 md:gap-20 lg:gap-25">
        <div className="flex items-center gap-2">
          <img src="/BIT-TOOL-2.png" alt="Bit Tool Logo" className="h-8 object-contain" />
          <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-white">BitTool</span>
        </div>

        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar (UI Only) */}
        <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-4 py-2 w-64 lg:w-80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-inner ml-4 lg:ml-8">
          <Search size={16} className="text-gray-400 dark:text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search tools, contacts..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>
        
        {activeUser ? (
          <div className="flex items-center gap-3 cursor-pointer group relative bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-1.5 pl-4 pr-1.5 rounded-full transition-colors border border-transparent dark:border-gray-700">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">{activeUser.name}</p>
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
            <div className="absolute top-full right-0 mt-2 w-[360px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden flex flex-col p-2">
              
              {/* Active Account Header */}
              <div className="flex flex-col items-center p-6 text-center">
                  {activeUser.avatar ? (
                    <img 
                      src={activeUser.avatar} 
                      alt="Profile Avatar" 
                      className="w-[72px] h-[72px] rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm mb-3"
                    />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold text-3xl shadow-sm mb-3">
                      {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{activeUser.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{activeUser.email}</p>
                  
                  <button 
                    onClick={handleManageAccount}
                    className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Manage your Account
                  </button>
              </div>

              {/* Inactive Account List */}
              {accounts.length > 1 && (
                <div className="max-h-56 overflow-y-auto px-2 pb-2">
                  <div className="h-px bg-gray-200 dark:bg-gray-800 w-full mb-2"></div>
                  {accounts.map((acc, idx) => {
                    if (idx === activeAccountIndex) return null;
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleSwitchAccount(idx)}
                        className="p-3 flex items-center gap-4 cursor-pointer transition-colors rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 mb-1"
                      >
                        {acc.avatar ? (
                          <img 
                            src={acc.avatar} 
                            alt="Profile Avatar" 
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                            {acc.name ? acc.name.charAt(0).toLowerCase() : 'u'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{acc.name}</p>
                          <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">{acc.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="h-px bg-gray-200 dark:bg-gray-800 w-full mb-1"></div>

              {/* Actions */}
              <div className="px-2 pt-1 pb-2">
                <button 
                  onClick={handleSignIn}
                  className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl flex items-center gap-4 font-semibold transition-colors"
                >
                  <UserPlus size={20} className="text-gray-600 dark:text-gray-400" />
                  Add another account
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl flex items-center gap-4 font-semibold transition-colors"
                >
                  <LogOut size={20} className="text-gray-600 dark:text-gray-400" />
                  Sign out of all accounts
                </button>
              </div>
              
              <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 font-medium border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 rounded-b-[24px]">
                <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Terms of Service</a>
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
