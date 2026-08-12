import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus, Clock, FileText, CheckCircle, Search, Bell, AlignLeft, Tag } from 'lucide-react';
import Holidays from 'date-holidays';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService } from '../services/calendarService';

export default function Calendar() {
  const queryClient = useQueryClient();
  const searchRef = useRef(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedApp, setSelectedApp] = useState('All Apps');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayViewOpen, setIsDayViewOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState('event'); // 'event', 'note', 'reminder'
  const [editingItem, setEditingItem] = useState(null); // { type: 'event'|'note'|'reminder', data: {...} }

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // also content for notes
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [categoryId, setCategoryId] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  // Setup Month Bounds
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthStartStr = new Date(year, month, 1, 0, 0, 0).toISOString();
  const monthEndStr = new Date(year, month, daysInMonth, 23, 59, 59, 999).toISOString();

  // Helper to format ISO string to local YYYY-MM-DD
  const getLocalDayStr = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Helper to format ISO string to local HH:mm
  const getLocalTimeStr = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Queries
  const { data: monthDataObj, isLoading: isMonthLoading } = useQuery({
    queryKey: ['calendar-month', year, month],
    queryFn: () => calendarService.search('', { startDate: monthStartStr, endDate: monthEndStr, allApps: true })
  });
  
  const { data: categoriesObj } = useQuery({
    queryKey: ['calendar-categories'],
    queryFn: () => calendarService.getCategories()
  });

  const { data: searchResultsObj, isLoading: isSearching } = useQuery({
    queryKey: ['calendar-search', searchQuery],
    queryFn: () => calendarService.search(searchQuery, { allApps: true }),
    enabled: searchQuery.length > 1
  });

  const dayViewStart = isDayViewOpen && selectedDate ? new Date(`${selectedDate}T00:00:00.000Z`).toISOString() : null;
  const dayViewEnd = isDayViewOpen && selectedDate ? new Date(`${selectedDate}T23:59:59.999Z`).toISOString() : null;

  const { data: dayViewDataObj, isLoading: isDayViewLoading } = useQuery({
    queryKey: ['calendar-day-view', selectedDate],
    queryFn: () => calendarService.search('', { startDate: dayViewStart, endDate: dayViewEnd, allApps: true }),
    enabled: isDayViewOpen && !!selectedDate
  });

  const monthData = monthDataObj?.data || { events: [], notes: [], reminders: [] };
  const categories = categoriesObj?.data || [];
  const rawSearchResults = searchResultsObj?.data || { events: [], notes: [], reminders: [] };
  const rawDayViewData = dayViewDataObj?.data || { events: [], notes: [], reminders: [] };

  const availableApps = useMemo(() => {
    const apps = new Set(['All Apps', 'Bit Tool']);
    const extract = (arr) => arr?.forEach(item => { if (item.applicationName) apps.add(item.applicationName); });
    extract(monthData.events);
    extract(monthData.notes);
    extract(monthData.reminders);
    return Array.from(apps);
  }, [monthData]);

  const filterByApp = useCallback((arr) => {
    if (!arr) return [];
    if (selectedApp === 'All Apps') return arr;
    return arr.filter(item => (item.applicationName || 'Bit Tool') === selectedApp);
  }, [selectedApp]);

  const searchResults = useMemo(() => ({
    events: filterByApp(rawSearchResults.events),
    notes: filterByApp(rawSearchResults.notes),
    reminders: filterByApp(rawSearchResults.reminders)
  }), [rawSearchResults, filterByApp]);

  const dayViewData = useMemo(() => ({
    events: filterByApp(rawDayViewData.events),
    notes: filterByApp(rawDayViewData.notes),
    reminders: filterByApp(rawDayViewData.reminders)
  }), [rawDayViewData, filterByApp]);

  // Data processing for grid
  const groupedData = useMemo(() => {
    const map = {};
    const fEvents = filterByApp(monthData.events);
    const fNotes = filterByApp(monthData.notes);
    const fReminders = filterByApp(monthData.reminders);

    if (fEvents) {
      fEvents.forEach(ev => {
        const d = getLocalDayStr(ev.startTime);
        if (!map[d]) map[d] = { events: [], notes: [], reminders: [] };
        map[d].events.push(ev);
      });
    }
    if (fNotes) {
      fNotes.forEach(nt => {
        const d = getLocalDayStr(nt.date);
        if (!map[d]) map[d] = { events: [], notes: [], reminders: [] };
        map[d].notes.push(nt);
      });
    }
    if (fReminders) {
      fReminders.forEach(rm => {
        const d = getLocalDayStr(rm.date);
        if (!map[d]) map[d] = { events: [], notes: [], reminders: [] };
        map[d].reminders.push(rm);
      });
    }
    return map;
  }, [monthData, filterByApp]);

  // Holidays
  const holidaysMap = useMemo(() => {
    const hdIN = new Holidays('IN');
    const hdWorld = new Holidays('US'); 
    const map = {};
    const addHols = (hols, type) => {
      if (!hols) return;
      hols.forEach(h => {
        const dateStr = h.date.split(' ')[0];
        if (!map[dateStr]) map[dateStr] = [];
        if (!map[dateStr].find(existing => existing.name === h.name)) {
          map[dateStr].push({ ...h, type });
        }
      });
    };
    addHols(hdWorld.getHolidays(year), 'World');
    addHols(hdIN.getHolidays(year), 'IN');
    return map;
  }, [year]);

  // Nav Handlers
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal Handlers
  const openDayView = (day) => {
    if (day) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(formattedDate);
    }
    setIsDayViewOpen(true);
  };

  const closeDayView = () => {
    setIsDayViewOpen(false);
  };

  const openModal = (day, itemToEdit = null, type = 'event') => {
    let dateStr = selectedDate;
    if (day) {
      dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    setSelectedDate(dateStr);
    
    if (itemToEdit) {
      setEditingItem({ type, data: itemToEdit });
      setActiveTab(type);
      setTitle(itemToEdit.title);
      setCategoryId(itemToEdit.categoryId || '');
      
      if (type === 'event') {
        setDescription(itemToEdit.description || '');
        setStartTime(getLocalTimeStr(itemToEdit.startTime));
        setEndTime(getLocalTimeStr(itemToEdit.endTime));
      } else if (type === 'note') {
        setDescription(itemToEdit.content || '');
      } else if (type === 'reminder') {
        setDescription(itemToEdit.description || '');
        setStartTime(itemToEdit.time || '09:00'); // repurposing startTime for reminder time
      }
    } else {
      setEditingItem(null);
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
      setCategoryId('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Mutations
  const invalidateMonth = () => queryClient.invalidateQueries(['calendar-month', year, month]);

  const createCategoryMutation = useMutation({
    mutationFn: (data) => calendarService.createCategory(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-categories'] });
      setCategoryId(res.data.id);
      setIsCreatingCategory(false);
      setNewCategoryName('');
    }
  });

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate({ name: newCategoryName, color: newCategoryColor });
  };

  const eventMutation = useMutation({
    mutationFn: (data) => editingItem ? calendarService.updateEvent(editingItem.data.id, data) : calendarService.createEvent(data),
    onSuccess: () => { invalidateMonth(); closeModal(); }
  });
  
  const noteMutation = useMutation({
    mutationFn: (data) => editingItem ? calendarService.updateNote(editingItem.data.id, data) : calendarService.createNote(data),
    onSuccess: () => { invalidateMonth(); closeModal(); }
  });
  
  const reminderMutation = useMutation({
    mutationFn: (data) => editingItem ? calendarService.updateReminder(editingItem.data.id, data) : calendarService.createReminder(data),
    onSuccess: () => { invalidateMonth(); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'event') return calendarService.deleteEvent(id);
      if (type === 'note') return calendarService.deleteNote(id);
      if (type === 'reminder') return calendarService.deleteReminder(id);
    },
    onSuccess: () => { invalidateMonth(); closeModal(); }
  });

  const completeReminderMutation = useMutation({
    mutationFn: (id) => calendarService.completeReminder(id),
    onSuccess: () => invalidateMonth()
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const basePayload = { title, categoryId: categoryId || null };
    const getLocalDateObj = (dateStr, timeStr) => {
      const [y, m, d] = dateStr.split('-');
      const [hr, min] = timeStr.split(':');
      return new Date(y, m - 1, d, hr, min, 0);
    };

    if (activeTab === 'event') {
      const startISO = getLocalDateObj(selectedDate, startTime).toISOString();
      const endISO = getLocalDateObj(selectedDate, endTime).toISOString();
      eventMutation.mutate({ ...basePayload, description, startTime: startISO, endTime: endISO });
    } 
    else if (activeTab === 'note') {
      const dateISO = getLocalDateObj(selectedDate, '00:00').toISOString();
      noteMutation.mutate({ ...basePayload, content: description, date: dateISO });
    } 
    else if (activeTab === 'reminder') {
      const dateISO = getLocalDateObj(selectedDate, startTime).toISOString();
      reminderMutation.mutate({ ...basePayload, description, date: dateISO, time: startTime });
    }
  };

  const handleDelete = () => {
    if (editingItem) {
      deleteMutation.mutate({ type: editingItem.type, id: editingItem.data.id });
    }
  };

  // Rendering Helpers
  const renderItemPill = (item, type, day) => {
    let bg = 'bg-blue-50 text-blue-700 border-blue-100/50 hover:bg-blue-100'; // event
    let icon = <CalendarIcon size={10} className="mr-1 inline shrink-0" />;
    let timeOrLabel = item.startTime ? getLocalTimeStr(item.startTime) : '';
    
    if (type === 'note') {
      bg = 'bg-yellow-50 text-yellow-700 border-yellow-100/50 hover:bg-yellow-100';
      icon = <FileText size={10} className="mr-1 inline text-yellow-600 shrink-0" />;
      timeOrLabel = '';
    } else if (type === 'reminder') {
      const isCompleted = item.status === 'completed';
      bg = isCompleted ? 'bg-gray-100 text-gray-500 border-gray-200 line-through' : 'bg-purple-50 text-purple-700 border-purple-100/50 hover:bg-purple-100';
      icon = <Bell size={10} className={`mr-1 inline shrink-0 ${isCompleted ? 'text-gray-400' : 'text-purple-600'}`} />;
      timeOrLabel = item.time || '';
    }

    return (
      <div 
        key={`${type}-${item.id}`}
        onClick={(e) => { e.stopPropagation(); openModal(day, item, type); }}
        className={`text-xs px-2 py-1 rounded truncate border transition-colors cursor-pointer flex items-center gap-1 ${bg}`}
        title={item.title}
      >
        {icon}
        {item.applicationName && item.applicationName !== 'Bit Tool' && (
          <span className="bg-white/60 text-[9px] px-1 rounded-sm uppercase tracking-wider shadow-sm font-bold opacity-90 shrink-0">
            {item.applicationName.split(' ')[0]}
          </span>
        )}
        <span className="font-medium shrink-0">{timeOrLabel}</span>
        <span className="truncate">{item.title}</span>
        
        {type === 'reminder' && item.status !== 'completed' && (
          <button 
            onClick={(e) => { e.stopPropagation(); completeReminderMutation.mutate(item.id); }}
            className="ml-auto hover:text-green-600 pl-1 shrink-0"
            title="Mark Complete"
          >
            <CheckCircle size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col p-4 md:p-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <CalendarIcon size={24} />
            </div>
            Calendar
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Manage your events, notes, and reminders</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          {/* App Filter Dropdown */}
          <select 
            value={selectedApp} 
            onChange={(e) => setSelectedApp(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium bg-white cursor-pointer"
          >
            {availableApps.map(app => (
              <option key={app} value={app}>{app}</option>
            ))}
          </select>

          {/* Unified Search */}
          <div className="relative w-full md:w-72" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium bg-white"
            />
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.length > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                  ) : (
                    <div className="p-2 space-y-4">
                      {searchResults.events?.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Events</div>
                          {searchResults.events.map(ev => (
                            <div key={ev.id} onClick={() => { setSelectedDate(ev.startTime.split('T')[0]); openModal(null, ev, 'event'); setIsSearchFocused(false); }} className="px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-3">
                              <CalendarIcon size={16} className="text-blue-500 shrink-0" />
                              <div className="overflow-hidden flex-1">
                                <div className="text-sm font-medium text-gray-800 truncate flex items-center gap-2">
                                  {ev.title}
                                  {ev.applicationName && ev.applicationName !== 'Bit Tool' && (
                                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold">
                                      {ev.applicationName.split(' ')[0]}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{new Date(ev.startTime).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {searchResults.notes?.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Notes</div>
                          {searchResults.notes.map(nt => (
                            <div key={nt.id} onClick={() => { setSelectedDate(nt.date.split('T')[0]); openModal(null, nt, 'note'); setIsSearchFocused(false); }} className="px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-3">
                              <FileText size={16} className="text-yellow-500 shrink-0" />
                              <div className="overflow-hidden flex-1">
                                <div className="text-sm font-medium text-gray-800 truncate flex items-center gap-2">
                                  {nt.title}
                                  {nt.applicationName && nt.applicationName !== 'Bit Tool' && (
                                    <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold">
                                      {nt.applicationName.split(' ')[0]}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{new Date(nt.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {searchResults.reminders?.length > 0 && (
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-1">Reminders</div>
                          {searchResults.reminders.map(rm => (
                            <div key={rm.id} onClick={() => { setSelectedDate(rm.date.split('T')[0]); openModal(null, rm, 'reminder'); setIsSearchFocused(false); }} className="px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer flex items-center gap-3">
                              <Bell size={16} className="text-purple-500 shrink-0" />
                              <div className="overflow-hidden flex-1">
                                <div className="text-sm font-medium text-gray-800 truncate flex items-center gap-2">
                                  {rm.title}
                                  {rm.applicationName && rm.applicationName !== 'Bit Tool' && (
                                    <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider font-bold">
                                      {rm.applicationName.split(' ')[0]}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{new Date(rm.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {!searchResults.events?.length && !searchResults.notes?.length && !searchResults.reminders?.length && (
                        <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="font-bold text-gray-800 min-w-[130px] text-center text-sm">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <button onClick={goToToday} className="px-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col overflow-hidden relative">
        {isMonthLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-[minmax(120px,1fr)] gap-px bg-gray-100 overflow-y-auto">
          {/* Empty cells for padding */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white/50 p-2 opacity-50"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = groupedData[dateStr] || { events: [], notes: [], reminders: [] };
            const dayHolidays = holidaysMap[dateStr] || [];
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div 
                key={day} 
                className="bg-white p-2 flex flex-col hover:bg-gray-50 transition-colors cursor-pointer group min-h-[120px]"
                onClick={(e) => {
                  if (e.target === e.currentTarget || e.target.tagName === 'SPAN' || e.target.tagName === 'DIV') openDayView(day);
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-700 group-hover:bg-gray-200'}`}>
                    {day}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal(day); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 mt-1 no-scrollbar pr-1">
                  {dayHolidays.map((h, i) => (
                    <div 
                      key={`hol-${i}`}
                      className={`text-xs px-2 py-1 rounded truncate border ${h.type === 'IN' ? 'bg-orange-50 text-orange-700 border-orange-100/50' : 'bg-green-50 text-green-700 border-green-100/50'}`}
                      title={h.name}
                    >
                      {h.type === 'IN' ? '🇮🇳' : '🌎'} {h.name}
                    </div>
                  ))}
                  {dayData.events.map(item => renderItemPill(item, 'event', day))}
                  {dayData.reminders.map(item => renderItemPill(item, 'reminder', day))}
                  {dayData.notes.map(item => renderItemPill(item, 'note', day))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day View Modal */}
      <AnimatePresence>
        {isDayViewOpen && selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={closeDayView}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center mb-5 shrink-0">
                <h2 className="text-xl font-black text-gray-900">
                  {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <button onClick={closeDayView} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                {isDayViewLoading ? (
                  <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
                ) : (
                  <>
                    {(!dayViewData.events?.length && !dayViewData.notes?.length && !dayViewData.reminders?.length) ? (
                      <div className="text-center p-8 text-gray-500 font-medium">No items scheduled for this day.</div>
                    ) : (
                      <>
                        {dayViewData.events?.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Events</h3>
                            {dayViewData.events.map(ev => renderItemPill(ev, 'event', null))}
                          </div>
                        )}
                        {dayViewData.reminders?.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reminders</h3>
                            {dayViewData.reminders.map(rm => renderItemPill(rm, 'reminder', null))}
                          </div>
                        )}
                        {dayViewData.notes?.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                            {dayViewData.notes.map(nt => renderItemPill(nt, 'note', null))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 shrink-0">
                <button 
                  onClick={() => openModal(null)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-200"
                >
                  <Plus size={18} />
                  Add New Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-black text-gray-900">
                  {editingItem ? `Edit ${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}` : 'Create New Item'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {!editingItem && (
                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                  {['event', 'note', 'reminder'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 text-sm"
                    placeholder={`e.g. ${activeTab === 'event' ? 'Team Sync' : activeTab === 'note' ? 'Meeting Minutes' : 'Follow up with client'}`}
                  />
                </div>
                
                {activeTab === 'event' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Start Time</label>
                      <input 
                        type="time" 
                        required
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">End Time</label>
                      <input 
                        type="time" 
                        required
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'reminder' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Reminder Time</label>
                    <input 
                      type="time" 
                      required
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                    <Tag size={14} className="text-gray-400" />
                    Category (Optional)
                  </label>
                  {!isCreatingCategory ? (
                    <select
                      value={categoryId}
                      onChange={e => {
                        if (e.target.value === 'NEW') setIsCreatingCategory(true);
                        else setCategoryId(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 text-sm appearance-none"
                    >
                      <option value="">No Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="NEW" className="font-bold text-blue-600">+ Add New Category</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={newCategoryColor}
                        onChange={e => setNewCategoryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={handleCreateCategory}
                        disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                        className="px-3 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm disabled:opacity-50"
                      >
                        Add
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsCreatingCategory(false)}
                        className="px-2 py-2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    {activeTab === 'note' ? 'Content' : 'Description'}
                  </label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required={activeTab === 'note'}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none font-medium text-gray-900 text-sm"
                    rows={activeTab === 'note' ? "5" : "3"}
                    placeholder={activeTab === 'note' ? "Write your note here..." : "Add details..."}
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                  {editingItem && (
                    <button 
                      type="button" 
                      onClick={handleDelete}
                      className="px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl transition-colors text-sm"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 font-bold rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 text-sm flex items-center gap-2"
                  >
                    Save {activeTab}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
