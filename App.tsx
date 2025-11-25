import React, { useState, useEffect } from 'react';
import { Note, ViewMode } from './types';
import { NoteInput } from './components/NoteInput';
import { NoteList } from './components/NoteList';
import { ScheduleList } from './components/ScheduleList';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { Button } from './components/Button';
import { EditModal } from './components/EditModal';
import { notificationService } from './services/notificationService';

const STORAGE_KEY = 'brutal_notes_data';
const THEME_KEY = 'brutal_notes_theme';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.NOTES);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    notificationService.requestPermission();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    notificationService.syncNotifications(notes);
  }, [notes]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  };

  const addNote = (note: Note) => {
    if (Notification.permission === 'default') {
        notificationService.requestPermission();
    }
    setNotes(prev => [...prev, note]);
  };

  const deleteNote = (id: string) => {
    if (window.confirm("PERMANENTLY DELETE THIS ENTRY?")) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    setEditingNote(null);
  };

  const toggleDone = (id: string) => {
    setNotes(prev => prev.map(n => 
        n.id === id ? { ...n, isDone: !n.isDone } : n
    ));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto pb-20 transition-colors duration-300">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-4 border-black dark:border-white">
        <div className="relative group cursor-default">
          <div className="absolute -inset-2 bg-yellow-300 dark:bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity -rotate-1 skew-x-3"></div>
          <h1 className="relative text-7xl md:text-9xl font-black tracking-tighter hover:text-outline dark:hover:text-outline-white transition-all select-none leading-[0.85] text-black dark:text-white">
            BRUTAL<br/>NOTES.
          </h1>
          <p className="relative font-bold text-sm md:text-lg mt-4 bg-black text-white dark:bg-white dark:text-black inline-block px-3 py-1 -rotate-2 group-hover:rotate-0 transition-transform">
            ORGANIZE THE CHAOS
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4 w-full md:w-auto">
          <button 
            onClick={toggleTheme} 
            className="font-bold border-2 border-black dark:border-white px-3 py-1 text-sm uppercase bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            {isDarkMode ? '☀ LIGHT MODE' : '☾ DARK MODE'}
          </button>
          
          <nav className="flex flex-wrap gap-4 w-full md:w-auto">
            <Button 
              variant={viewMode === ViewMode.NOTES ? 'primary' : 'neutral'}
              onClick={() => setViewMode(ViewMode.NOTES)}
              className="flex-1 md:flex-none"
            >
              NOTES
            </Button>
            <Button 
              variant={viewMode === ViewMode.SCHEDULE ? 'secondary' : 'neutral'}
              onClick={() => setViewMode(ViewMode.SCHEDULE)}
              className="flex-1 md:flex-none"
            >
              SCHEDULE
            </Button>
            <Button 
              variant={viewMode === ViewMode.ANALYSIS ? 'danger' : 'neutral'}
              onClick={() => setViewMode(ViewMode.ANALYSIS)}
              className="flex-1 md:flex-none border-dashed"
            >
              STATS
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {viewMode === ViewMode.NOTES && (
          <div className="space-y-10">
            <NoteInput 
                onAddNote={addNote} 
                onUpdateNote={updateNote}
                notes={notes}
            />
            <div className="border-t-4 border-black dark:border-white border-dashed my-8 opacity-20"></div>
            <NoteList 
              notes={notes} 
              onDelete={deleteNote} 
              onEdit={setEditingNote}
              onToggleDone={toggleDone}
            />
          </div>
        )}

        {viewMode === ViewMode.SCHEDULE && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
             <ScheduleList notes={notes} />
          </div>
        )}

        {viewMode === ViewMode.ANALYSIS && (
            <AnalysisDashboard notes={notes} />
        )}
      </main>

      <EditModal 
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={updateNote}
      />

      <footer className="mt-32 border-t-2 border-black dark:border-white pt-8 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity text-black dark:text-white">
        <span className="font-bold uppercase text-xs">Neo-Brutalism System • v2.2</span>
        <span className="font-mono text-xs">BUILD {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}