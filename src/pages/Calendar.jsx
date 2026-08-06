import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  // events: { 'YYYY-MM-DD': [{ id, title, desc, start, end }] }
  const [events, setEvents] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const openModal = (day, eventToEdit = null) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
    } else {
      setEditingEvent(null);
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const saveEvent = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent = {
      id: editingEvent ? editingEvent.id : Date.now().toString(),
      title,
      description,
      startTime,
      endTime
    };

    setEvents(prev => {
      const dayEvents = prev[selectedDate] || [];
      if (editingEvent) {
        return {
          ...prev,
          [selectedDate]: dayEvents.map(ev => ev.id === editingEvent.id ? newEvent : ev)
        };
      } else {
        return {
          ...prev,
          [selectedDate]: [...dayEvents, newEvent]
        };
      }
    });
    closeModal();
  };

  const deleteEvent = () => {
    if (!editingEvent) return;
    setEvents(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(ev => ev.id !== editingEvent.id)
    }));
    closeModal();
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-primary" size={32} />
            Calendar
          </h1>
          <p className="text-gray-500 mt-1">Manage your schedule and events</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-gray-800 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
            <ChevronRight size={20} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button onClick={goToToday} className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
            Today
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-soft border border-gray-50 flex flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {dayNames.map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-gray-100">
          {/* Empty cells for padding */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-white p-2 opacity-50"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events[dateStr] || [];
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <div 
                key={day} 
                className="bg-white p-2 flex flex-col hover:bg-gray-50 transition-colors cursor-pointer group min-h-[100px]"
                onClick={(e) => {
                  if (e.target === e.currentTarget || e.target.tagName === 'SPAN') openModal(day);
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${isToday ? 'bg-primary text-white' : 'text-gray-700 group-hover:bg-gray-100'}`}>
                    {day}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal(day); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary transition-opacity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1 mt-1 no-scrollbar">
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id}
                      onClick={(e) => { e.stopPropagation(); openModal(day, ev); }}
                      className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 truncate border border-blue-100/50 hover:bg-blue-100 transition-colors"
                      title={ev.title}
                    >
                      {ev.startTime} {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Team Meeting"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input 
                      type="time" 
                      required
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input 
                      type="time" 
                      required
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    rows="3"
                    placeholder="Add details..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  {editingEvent && (
                    <button 
                      type="button" 
                      onClick={deleteEvent}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Save
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
