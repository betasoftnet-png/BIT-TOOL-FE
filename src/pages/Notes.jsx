import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Palette, Archive, Trash2, CheckSquare, Image as ImageIcon, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services/noteService';

// Refined, premium translucent colors for glassmorphism
const COLORS = [
  '#ffffff', // Default
  'rgba(255, 107, 107, 0.4)', // Soft Red
  'rgba(250, 177, 16, 0.4)',  // Soft Yellow/Orange
  'rgba(241, 196, 15, 0.4)',  // Gold
  'rgba(46, 204, 113, 0.4)',  // Soft Green
  'rgba(26, 188, 156, 0.4)',  // Teal
  'rgba(52, 152, 219, 0.4)',  // Soft Blue
  'rgba(155, 89, 182, 0.4)',  // Amethyst
  'rgba(232, 67, 147, 0.4)',  // Pink
  'rgba(149, 165, 166, 0.4)', // Gray
];

const NoteCard = ({ note, handleTogglePin, handleColorChange, handleDelete, onClick }) => {
  const [showPalette, setShowPalette] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col rounded-3xl border border-white/60 p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer backdrop-blur-xl bg-white/70 h-full"
      style={{ 
        backgroundColor: note.color === '#ffffff' ? 'rgba(255,255,255,0.7)' : note.color,
      }}
      onClick={() => onClick(note)}
    >
      {/* Decorative top gradient edge */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-white/40 to-transparent"></div>

      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1 pr-8">
          {note.applicationName && (
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase bg-gray-900/5 px-2 py-0.5 rounded-full self-start">
              {note.applicationName}
            </span>
          )}
          {note.title && <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">{note.title}</h3>}
          {!note.title && !note.applicationName && <div className="h-2"></div>}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); handleTogglePin(e, note); }}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${note.isPinned ? 'bg-gray-900/10 text-gray-900 backdrop-blur-md' : 'text-gray-400 hover:bg-gray-900/10 hover:text-gray-800'}`}
        >
          {note.isPinned ? <Pin size={18} className="fill-current" /> : <Pin size={18} />}
        </button>
      </div>

      {note.content && <p className="text-gray-700 whitespace-pre-wrap text-[15px] leading-relaxed line-clamp-6 flex-1">{note.content}</p>}

      {/* Note Footer Actions */}
      <div className="mt-6 pt-3 flex items-center justify-between border-t border-gray-900/5 relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button 
            className="p-2 rounded-full text-gray-500 hover:bg-gray-900/10 hover:text-gray-900 transition-colors relative"
            onMouseEnter={() => setShowPalette(true)}
            onMouseLeave={() => setShowPalette(false)}
          >
            <Palette size={16} />
            <AnimatePresence>
              {showPalette && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-3 w-[200px] bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white p-3 grid grid-cols-5 gap-2 z-50 cursor-default"
                >
                  {COLORS.map(c => (
                    <div 
                      key={c}
                      onClick={(e) => { e.stopPropagation(); handleColorChange(e, note.id, c); setShowPalette(false); }}
                      className="w-8 h-8 rounded-full border-2 border-white/50 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                      style={{ backgroundColor: c === '#ffffff' ? '#f8f9fa' : c }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-900/10 hover:text-gray-900 transition-colors" title="Archive">
            <Archive size={16} />
          </button>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); handleDelete(e, note.id); }}
          className="p-2 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-600 transition-colors" title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default function Notes() {
  const queryClient = useQueryClient();
  const [isTakingNote, setIsTakingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#ffffff', isPinned: false });
  const [editingNote, setEditingNote] = useState(null);
  const [selectedApp, setSelectedApp] = useState('All');
  const takeNoteRef = useRef(null);
  const editModalRef = useRef(null);

  const { data: notesObj, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => noteService.getNotes({ allApps: true }),
    retry: false
  });

  const notes = notesObj?.data || [];
  
  // Extract unique app names for the filter
  const availableApps = ['All', ...new Set(notes.map(n => n.applicationName).filter(Boolean))];

  // Filter notes by selected app
  const filteredNotes = selectedApp === 'All' 
    ? notes 
    : notes.filter(n => n.applicationName === selectedApp);

  const pinnedNotes = filteredNotes.filter(n => n.isPinned && !n.isArchived);
  const otherNotes = filteredNotes.filter(n => !n.isPinned && !n.isArchived);

  const createMutation = useMutation({
    mutationFn: (data) => noteService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNewNote({ title: '', content: '', color: '#ffffff', isPinned: false });
      setIsTakingNote(false);
    },
    onError: (err) => alert(`Failed to create note: ${err.message}`)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => noteService.updateNote(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    onError: (err) => alert(`Failed to update note: ${err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => noteService.deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    onError: (err) => alert(`Failed to delete note: ${err.message}`)
  });

  const handleSaveNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      createMutation.mutate(newNote);
    } else {
      setIsTakingNote(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingNote) {
      updateMutation.mutate({ 
        id: editingNote.id, 
        data: { title: editingNote.title, content: editingNote.content } 
      });
      setEditingNote(null);
    }
  };

  // Handle click outside to save new note
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (takeNoteRef.current && !takeNoteRef.current.contains(e.target)) {
        if (isTakingNote) {
          handleSaveNote();
        }
      }
      if (editModalRef.current && !editModalRef.current.contains(e.target)) {
        if (editingNote) {
          handleSaveEdit();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTakingNote, newNote, createMutation, editingNote, updateMutation]);

  const handleColorChange = (e, noteId, color) => {
    e.stopPropagation();
    if (noteId === 'new') {
      setNewNote({ ...newNote, color });
    } else {
      updateMutation.mutate({ id: noteId, data: { color } });
    }
  };

  const handleTogglePin = (e, note) => {
    e.stopPropagation();
    if (note === 'new') {
      setNewNote({ ...newNote, isPinned: !newNote.isPinned });
    } else {
      updateMutation.mutate({ id: note.id, data: { isPinned: !note.isPinned } });
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8 overflow-hidden z-0">
      <div className="max-w-7xl mx-auto">
        
        {/* Sleek Take a note input */}
        <div className="max-w-2xl mx-auto mb-16 relative z-10">
          <motion.div 
            ref={takeNoteRef}
            className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgb(0,0,0,0.08)] border border-white/60 transition-all duration-300"
            style={{ backgroundColor: newNote.color === '#ffffff' ? 'rgba(255,255,255,0.8)' : newNote.color }}
            animate={{ minHeight: isTakingNote ? 160 : 64 }}
          >
            {isTakingNote ? (
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <input 
                    type="text" 
                    placeholder="Note Title" 
                    value={newNote.title}
                    onChange={e => setNewNote({...newNote, title: e.target.value})}
                    className="w-full text-xl font-bold bg-transparent outline-none placeholder-gray-400 text-gray-900"
                  />
                  <button 
                    onClick={(e) => handleTogglePin(e, 'new')}
                    className={`p-2 rounded-full hover:bg-gray-900/10 transition-colors ${newNote.isPinned ? 'text-gray-900 bg-gray-900/5' : 'text-gray-400'}`}
                  >
                    {newNote.isPinned ? <Pin size={22} className="fill-current" /> : <Pin size={22} />}
                  </button>
                </div>
                
                <textarea 
                  placeholder="What's on your mind?" 
                  value={newNote.content}
                  onChange={e => setNewNote({...newNote, content: e.target.value})}
                  className="w-full resize-none bg-transparent outline-none text-gray-700 text-[16px] min-h-[80px] leading-relaxed flex-1"
                  autoFocus
                />

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-900/5">
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-full text-gray-500 hover:bg-gray-900/10 hover:text-gray-900 transition-colors group relative">
                      <Palette size={20} />
                      <div className="absolute top-full left-0 mt-3 w-[200px] bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white p-3 grid grid-cols-5 gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 transition-all cursor-default">
                        {COLORS.map(c => (
                          <div 
                            key={c}
                            onClick={(e) => { e.stopPropagation(); handleColorChange(e, 'new', c); }}
                            className="w-8 h-8 rounded-full border-2 border-white/50 cursor-pointer hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: c === '#ffffff' ? '#f8f9fa' : c }}
                          />
                        ))}
                      </div>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsTakingNote(false)}
                      className="px-5 py-2.5 font-semibold text-sm rounded-xl hover:bg-gray-900/5 text-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNote}
                      className="px-6 py-2.5 font-semibold text-sm rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all active:scale-95"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="px-6 py-5 flex items-center justify-between cursor-text h-16 group"
                onClick={() => setIsTakingNote(true)}
              >
                <div className="flex items-center gap-3">
                  <Plus size={22} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <span className="text-gray-500 font-medium text-[16px] group-hover:text-gray-700 transition-colors">Create a new note...</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-400 hover:bg-gray-900/5 hover:text-gray-700 rounded-full transition-colors"><CheckSquare size={20} /></button>
                  <button className="p-2 text-gray-400 hover:bg-gray-900/5 hover:text-gray-700 rounded-full transition-colors"><ImageIcon size={20} /></button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 opacity-60">
            <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your thoughts...</p>
          </div>
        ) : (
          <div className="relative z-10">
            {availableApps.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8 pl-2">
                {availableApps.map(app => (
                  <button
                    key={app}
                    onClick={() => setSelectedApp(app)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedApp === app 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'bg-white/50 text-gray-600 hover:bg-white/80 border border-white/60'
                    }`}
                  >
                    {app === 'All' ? 'All Apps' : app}
                  </button>
                ))}
              </div>
            )}

            {pinnedNotes.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-2 mb-6 pl-2">
                  <Pin size={16} className="text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pinned Notes</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                  <AnimatePresence>
                    {pinnedNotes.map(note => (
                      <NoteCard key={note.id} note={note} handleTogglePin={handleTogglePin} handleColorChange={handleColorChange} handleDelete={handleDelete} onClick={setEditingNote} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {otherNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <div className="flex items-center gap-2 mb-6 pl-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Other Notes</h3>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                  <AnimatePresence>
                    {otherNotes.map(note => (
                      <NoteCard key={note.id} note={note} handleTogglePin={handleTogglePin} handleColorChange={handleColorChange} handleDelete={handleDelete} onClick={setEditingNote} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {notes.length === 0 && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center p-20 text-gray-400 mt-10 backdrop-blur-sm bg-white/30 rounded-3xl border border-white/50 shadow-sm max-w-xl mx-auto"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-white/50 flex items-center justify-center shadow-inner">
                  <span className="text-5xl drop-shadow-sm">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">A blank canvas</h2>
                <p className="text-gray-500 text-center">Your brilliant ideas, tasks, and thoughts will appear here once you create them.</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Edit Note Modal - Glassmorphic */}
        <AnimatePresence>
          {editingNote && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
              />
              <motion.div 
                ref={editModalRef}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_60px_rgb(0,0,0,0.15)] border border-white/60 overflow-hidden w-full max-w-3xl flex flex-col relative z-10"
                style={{ backgroundColor: editingNote.color === '#ffffff' ? 'rgba(255,255,255,0.9)' : editingNote.color }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-white/40 to-transparent"></div>
                
                <div className="p-8 flex flex-col h-full max-h-[85vh]">
                  <input 
                    type="text" 
                    placeholder="Note Title" 
                    value={editingNote.title || ''}
                    onChange={e => setEditingNote({...editingNote, title: e.target.value})}
                    className="w-full text-3xl font-bold bg-transparent outline-none placeholder-gray-400 text-gray-900 mb-6"
                  />
                  
                  <textarea 
                    placeholder="Start typing..." 
                    value={editingNote.content || ''}
                    onChange={e => setEditingNote({...editingNote, content: e.target.value})}
                    className="w-full resize-none bg-transparent outline-none text-gray-700 text-lg min-h-[400px] flex-1 overflow-y-auto leading-relaxed"
                  />

                  <div className="flex justify-end mt-8 pt-6 border-t border-gray-900/10">
                    <button 
                      onClick={handleSaveEdit}
                      className="px-8 py-3 font-semibold text-[15px] rounded-xl bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/20 transition-all active:scale-95"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
