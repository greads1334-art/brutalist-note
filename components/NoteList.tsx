import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { Card } from './Card';

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onToggleDone: (id: string) => void;
}

const BRUTAL_COLORS = [
  'bg-[#FF9AA2]', 
  'bg-[#FFB7B2]', 
  'bg-[#FFDAC1]', 
  'bg-[#E2F0CB]', 
  'bg-[#B5EAD7]', 
  'bg-[#C7CEEA]', 
];

export const NoteList: React.FC<NoteListProps> = ({ notes, onDelete, onEdit, onToggleDone }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Local state to track which note is "animating out" before state update takes effect visually
  const [exitingNoteId, setExitingNoteId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  // Filter out Done notes from the main view (or handle them separately if requested, currently user said "remove")
  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(n => !n.isDone);
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }
    return filtered;
  }, [notes, selectedTag]);

  const displayNotes = [...filteredNotes].reverse();

  const getRotation = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 5) - 2; 
  };

  const handleDoneClick = (id: string) => {
      setExitingNoteId(id);
      // Visual delay before actual toggle
      setTimeout(() => {
          onToggleDone(id);
          setExitingNoteId(null);
      }, 600); // 600ms match CSS transition
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sticky top-4 z-10 transition-all">
          <span className="font-black mr-2 self-center text-lg dark:text-white">FILTER:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-1 font-bold border-2 border-black dark:border-white text-sm transition-colors ${!selectedTag ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white'}`}
          >
            ALL
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-1 font-bold border-2 border-black dark:border-white text-sm uppercase transition-all active:translate-y-1 ${
                selectedTag === tag 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-none translate-y-[2px]' 
                  : 'bg-white hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:text-white dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
        {displayNotes.length === 0 ? (
          <div className="col-span-full text-center py-20 border-4 border-dashed border-black dark:border-white opacity-30 font-black text-4xl uppercase select-none dark:text-white">
            NO ACTIVE NOTES
          </div>
        ) : (
          displayNotes.map((note, index) => (
            <div 
                key={note.id} 
                className={`
                    transition-all duration-500 ease-in-out
                    ${exitingNoteId === note.id ? 'opacity-0 scale-90 translate-y-10 blur-sm' : 'animate-in slide-in-from-bottom-4 fade-in'}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <Card 
                  color={BRUTAL_COLORS[index % BRUTAL_COLORS.length]}
                  className="flex flex-col justify-between h-full min-h-[220px]"
                  rotate={getRotation(note.id)}
                >
                  <div className="text-black">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map(tag => (
                          <span key={tag} className="bg-black text-white border border-black text-xs px-2 py-1 font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-default">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => handleDoneClick(note.id)}
                        className="bg-white border-2 border-black w-8 h-8 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#a3ffa3] transition-colors active:translate-y-[2px] active:shadow-none"
                        title="Mark as Done"
                      >
                         ✓
                      </button>
                    </div>

                    {/* Image Attachment */}
                    {note.imageUrl && (
                      <div className="mb-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                        <img src={note.imageUrl} alt="Attachment" className="w-full h-auto object-cover max-h-60" />
                      </div>
                    )}

                    <p className="font-bold text-xl mb-4 leading-snug break-words">
                      {note.content}
                    </p>
                    {note.scheduleDate && (
                      <div className="inline-block bg-white border-2 border-black p-2 text-sm font-bold mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                         ⏰ {new Date(note.scheduleDate).toLocaleString(undefined, {weekday: 'short', hour: 'numeric', minute: '2-digit'})}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end border-t-2 border-black pt-4 mt-auto text-black">
                    <span className="text-xs font-bold opacity-60 uppercase tracking-wide">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => onEdit(note)}
                        className="text-xs font-black bg-white hover:bg-black hover:text-white px-3 py-1 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => onDelete(note.id)}
                        className="text-xs font-black bg-[#FF0000] text-white hover:bg-red-800 px-3 py-1 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                      >
                        DEL
                      </button>
                    </div>
                  </div>
                </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};