import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, PinOff, Palette, Archive, Trash2, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services/noteService';

const COLORS = [
  '#ffffff', '#f28b82', '#fbbc04', '#fff475', '#ccff90', 
  '#a7ffeb', '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', 
  '#e6c9a8', '#e8eaed'
];

const NoteCard = ({ note, handleTogglePin, handleColorChange, handleDelete, onClick }) => {
  const [showPalette, setShowPalette] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative rounded-2xl border border-gray-200 p-4 mb-4 break-inside-avoid shadow-sm hover:shadow-md transition-shadow cursor-default"
      style={{ backgroundColor: note.color }}
      onClick={() => onClick(note)}
    >
      <button 
        onClick={(e) => handleTogglePin(e, note)}
        className={`absolute top-3 right-3 p-2 rounded-full transition-opacity ${note.isPinned ? 'opacity-100 text-gray-900 bg-black/5' : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:bg-black/5'}`}
      >
        {note.isPinned ? <Pin size={18} className="fill-gray-900" /> : <Pin size={18} />}
      </button>

      {note.title && <h3 className="font-bold text-gray-900 mb-2 pr-8">{note.title}</h3>}
      {note.content && <p className="text-gray-700 whitespace-pre-wrap text-sm">{note.content}</p>}

      {/* Note Footer Actions */}
      <div className="mt-4 pt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative">
        <button 
          className="p-1.5 rounded-full text-gray-500 hover:bg-black/5"
          onMouseEnter={() => setShowPalette(true)}
          onMouseLeave={() => setShowPalette(false)}
        >
          <Palette size={16} />
          <AnimatePresence>
            {showPalette && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 grid grid-cols-4 gap-1 z-10"
              >
                {COLORS.map(c => (
                  <div 
                    key={c}
                    onClick={(e) => handleColorChange(e, note.id, c)}
                    className="w-6 h-6 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <button className="p-1.5 rounded-full text-gray-500 hover:bg-black/5" title="Archive">
          <Archive size={16} />
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={(e) => handleDelete(e, note.id)}
          className="p-1.5 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete"
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
  const takeNoteRef = useRef(null);
  const editModalRef = useRef(null);

  const { data: notesObj, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => noteService.getNotes(),
    retry: false
  });

  const notes = notesObj?.data || [];
  const pinnedNotes = notes.filter(n => n.isPinned && !n.isArchived);
  const otherNotes = notes.filter(n => !n.isPinned && !n.isArchived);

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
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      
      {/* Take a note input */}
      <div className="max-w-2xl mx-auto mb-12">
        <motion.div 
          ref={takeNoteRef}
          className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-200 overflow-hidden"
          style={{ backgroundColor: newNote.color }}
          animate={{ minHeight: isTakingNote ? 120 : 50 }}
        >
          {isTakingNote ? (
            <div className="p-4 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <input 
                  type="text" 
                  placeholder="Title" 
                  value={newNote.title}
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                  className="w-full text-lg font-bold bg-transparent outline-none placeholder-gray-500"
                />
                <button 
                  onClick={(e) => handleTogglePin(e, 'new')}
                  className={`p-2 rounded-full hover:bg-black/5 ${newNote.isPinned ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  {newNote.isPinned ? <Pin size={20} className="fill-gray-900" /> : <Pin size={20} />}
                </button>
              </div>
              
              <textarea 
                placeholder="Take a note..." 
                value={newNote.content}
                onChange={e => setNewNote({...newNote, content: e.target.value})}
                className="w-full resize-none bg-transparent outline-none text-gray-700 text-sm min-h-[60px]"
                autoFocus
              />

              <div className="flex items-center gap-2 mt-4">
                <button className="p-2 rounded-full text-gray-500 hover:bg-black/5 group relative">
                  <Palette size={18} />
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 grid grid-cols-4 gap-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10 w-40">
                    {COLORS.map(c => (
                      <div 
                        key={c}
                        onClick={(e) => handleColorChange(e, 'new', c)}
                        className="w-6 h-6 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
                <div className="flex-1"></div>
                <button 
                  onClick={() => setIsTakingNote(false)}
                  className="px-4 py-2 font-bold text-sm rounded-lg hover:bg-black/5 text-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveNote}
                  className="px-4 py-2 font-bold text-sm rounded-lg hover:bg-black/5 text-gray-900 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="px-4 py-3.5 flex items-center justify-between cursor-text"
              onClick={() => setIsTakingNote(true)}
            >
              <span className="text-gray-500 font-medium">Take a note...</span>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><CheckSquare size={20} /></button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><ImageIcon size={20} /></button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full"></div>
        </div>
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pl-2">Pinned</h3>
              <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
                <AnimatePresence>
                  {pinnedNotes.map(note => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      handleTogglePin={handleTogglePin}
                      handleColorChange={handleColorChange}
                      handleDelete={handleDelete}
                      onClick={setEditingNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pl-2">Others</h3>}
              <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
                <AnimatePresence>
                  {otherNotes.map(note => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      handleTogglePin={handleTogglePin}
                      handleColorChange={handleColorChange}
                      handleDelete={handleDelete}
                      onClick={setEditingNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {notes.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 mt-10 opacity-70">
              <span className="text-6xl mb-4 grayscale">📝</span>
              <p className="text-xl font-medium">Notes you add appear here</p>
            </div>
          )}
        </>
      )}

      {/* Edit Note Modal */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
            <motion.div 
              ref={editModalRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl flex flex-col"
              style={{ backgroundColor: editingNote.color }}
            >
              <div className="p-4 flex flex-col h-full max-h-[80vh]">
                <input 
                  type="text" 
                  placeholder="Title" 
                  value={editingNote.title || ''}
                  onChange={e => setEditingNote({...editingNote, title: e.target.value})}
                  className="w-full text-xl font-bold bg-transparent outline-none placeholder-gray-500 mb-4"
                />
                
                <textarea 
                  placeholder="Note content..." 
                  value={editingNote.content || ''}
                  onChange={e => setEditingNote({...editingNote, content: e.target.value})}
                  className="w-full resize-none bg-transparent outline-none text-gray-700 min-h-[300px] flex-1 overflow-y-auto"
                />

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleSaveEdit}
                    className="px-6 py-2 font-bold text-sm rounded-lg hover:bg-black/5 text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
