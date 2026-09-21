import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, LogOut, LogIn, Settings, UserPlus, Check, ChevronDown, Calculator, Calendar, Users, FileText, Cloud, Keyboard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contactService } from '../services/contactService';
import { noteService } from '../services/noteService';
import { calendarService } from '../services/calendarService';
import { notificationService } from '../services/notificationService';

const SEARCH_ITEMS = [
  { name: 'Calculator', path: '/calculator', icon: Calculator, category: 'Tool' },
  { name: 'Calendar', path: '/calendar', icon: Calendar, category: 'Tool' },
  { name: 'Contacts', path: '/contacts', icon: Users, category: 'App' },
  { name: 'Notes', path: '/notes', icon: FileText, category: 'App' },
  { name: 'Weather', path: '/weather', icon: Cloud, category: 'App' },
  { name: 'Keyboard', path: '/keyboard', icon: Keyboard, category: 'Tool' },
  { name: 'Settings', path: '/settings', icon: Settings, category: 'System' },
];

const UserAvatar = ({ user, imgClass, fallbackClass }) => {
  const [hasError, setHasError] = useState(false);

  if (user.avatar && !hasError) {
    return (
      <img
        src={user.avatar}
        alt="Profile Avatar"
        className={imgClass}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={fallbackClass}>
      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
    </div>
  );
};

export default function Navbar({ toggleMobileMenu }) {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Search States
  const [globalData, setGlobalData] = useState({ contacts: [], notes: [], calendar: [] });
  const [isGlobalDataLoaded, setIsGlobalDataLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const notificationsRef = useRef(null);

  // Handle clicking outside of search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch global data on first search focus
  useEffect(() => {
    if (isSearchOpen && !isGlobalDataLoaded && !isSearching) {
      const fetchData = async () => {
        setIsSearching(true);
        try {
          const [contactsRes, notesRes, calendarRes] = await Promise.allSettled([
            contactService.getAllContacts(),
            noteService.getNotes(),
            calendarService.search('')
          ]);

          const contacts = contactsRes.status === 'fulfilled' && contactsRes.value.data?.rows ? contactsRes.value.data.rows : [];
          const notes = notesRes.status === 'fulfilled' && notesRes.value.data ? notesRes.value.data : [];
          const calendar = calendarRes.status === 'fulfilled' && calendarRes.value.data ? calendarRes.value.data : [];

          setGlobalData({ contacts, notes, calendar });
          setIsGlobalDataLoaded(true);
        } catch (e) {
          console.error("Failed to load global search data", e);
        } finally {
          setIsSearching(false);
        }
      };
      fetchData();
    }
  }, [isSearchOpen, isGlobalDataLoaded, isSearching]);

  // Fetch notifications when the component mounts and whenever the dropdown is opened
  useEffect(() => {
    const activeToken = localStorage.getItem('bnx_auth_token');
    // Only fetch if we have a token, and either it's the initial load OR the dropdown was just opened
    if (activeToken) {
      const fetchNotifications = async () => {
        console.log("[Navbar] Fetching notifications...");
        if (notifications.length === 0) {
          setIsNotificationsLoading(true);
        }
        try {
          const res = await notificationService.getNotifications();
          console.log("[Navbar] Notification API Response:", res);
          if ((res.success || res.status === 'success') && res.data) {
            setNotifications(res.data);
            console.log(`[Navbar] Set ${res.data.length} notifications in state.`);
          } else {
            console.warn("[Navbar] API returned success=false or missing data.");
          }
        } catch (e) {
          console.error("[Navbar] Failed to load notifications", e);
          // If we fail, don't wipe out existing notifications just in case it was a momentary blip
        } finally {
          setIsNotificationsLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [isNotificationsOpen]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };

  const combinedSearchData = [
    ...SEARCH_ITEMS,
    ...globalData.contacts.map(c => ({
      name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unnamed Contact',
      category: 'Contact',
      path: '/contacts',
      icon: Users,
      subtitle: c.email || c.phonenumber || ''
    })),
    ...globalData.notes.map(n => ({
      name: n.title || 'Untitled Note',
      category: 'Note',
      path: '/notes',
      icon: FileText,
      subtitle: n.content ? n.content.replace(/<[^>]*>?/gm, '').substring(0, 40) + '...' : ''
    })),
    ...globalData.calendar.map(c => ({
      name: c.title || 'Event',
      category: 'Calendar',
      path: '/calendar',
      icon: Calendar,
      subtitle: c.description || ''
    }))
  ];

  const filteredSearchData = searchQuery.trim() === '' ? [] : combinedSearchData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSearchSelect = (item) => {
    navigate(item.path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

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
              avatar: data.data.profilePictureUrl ? (data.data.profilePictureUrl.startsWith('http') ? data.data.profilePictureUrl : `https://api.bnxmail.com/${data.data.profilePictureUrl.replace(/^\//, '')}`) : null,
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
    <header className="h-16 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm transition-colors">
      <div className="flex items-center gap-6 md:gap-20 lg:gap-25">
        <div className="flex items-center gap-2">
          <img src="/BIT-TOOL-2.png" alt="Bit Tool Logo" className="h-9 object-contain bg-white" style={{borderRadius:'5px'}} />
          <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-white">Bit-tool</span>
        </div>

        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="relative hidden md:block ml-4 lg:ml-8" ref={searchRef}>
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-4 py-2 w-64 lg:w-80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-inner">
            <Search size={16} className="text-gray-400 dark:text-gray-500 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search tools, contacts..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
          
          {/* Dropdown Results */}
          {(isSearchOpen && (searchQuery.trim() !== '' || isSearching)) && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto custom-scrollbar">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <p className="text-sm">Loading data...</p>
                </div>
              ) : filteredSearchData.length > 0 ? (
                <div className="py-2 flex flex-col">
                  {filteredSearchData.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearchSelect(item)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left w-full border-b border-gray-50 dark:border-gray-800 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <item.icon size={16} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight truncate">{item.name}</p>
                        {item.subtitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full shrink-0">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Bell size={20} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 border-2 border-white dark:border-gray-900">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className={`absolute top-full right-[-80px] md:right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top-right ${isNotificationsOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary font-medium hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {isNotificationsLoading ? (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <p className="text-sm">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`flex gap-3 p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors cursor-default ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                    >
                      <div className="mt-1 shrink-0">
                        <div className={`w-2 h-2 rounded-full ${notif.isRead ? 'bg-transparent' : 'bg-primary'}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        {!notif.isRead && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="mt-2 text-[11px] font-medium text-primary hover:text-blue-700 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                  <Bell className="mb-2 text-gray-300 dark:text-gray-600" size={32} />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs mt-1">No new notifications</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-50 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-gray-800/50">
                <button className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>
        
        {activeUser ? (
          <div className="flex items-center gap-2 cursor-pointer group relative bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors border border-transparent dark:border-gray-700 p-1 md:pr-3">
            <UserAvatar 
              user={activeUser}
              imgClass="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
              fallbackClass="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border border-blue-700 shadow-sm shrink-0"
            />
            
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize leading-tight">{activeUser.name}</p>
            </div>
            
            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 group-hover:rotate-180 transition-all duration-200 hidden md:block" />
            
            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-[360px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[24px] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden flex flex-col p-2">
              
              {/* Active Account Header */}
              <div className="flex flex-col items-center p-6 text-center">
                  <UserAvatar 
                    user={activeUser}
                    imgClass="w-[72px] h-[72px] rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm mb-3 shrink-0"
                    fallbackClass="w-[72px] h-[72px] rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold text-3xl shadow-sm mb-3 shrink-0"
                  />
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
                        <UserAvatar 
                          user={acc}
                          imgClass="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm shrink-0"
                          fallbackClass="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex items-center justify-center font-bold text-base shadow-sm shrink-0"
                        />
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
