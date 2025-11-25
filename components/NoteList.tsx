import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { Card } from './Card';

interface NoteListProps {
  notes: Note[];
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onToggleDone: (id: string) => void;
}

// Neon Palette for Tags (High contrast backgrounds)
const TAG_PALETTE = [
  'bg-black text-white',
  'bg-white text-black',
  'bg-[#ccff00] text-black', // Lime
  'bg-[#00ffff] text-black', // Cyan
  'bg-[#ff00ff] text-white', // Magenta
];

// Vivid Card Palette (Always black text for contrast)
const BOLD_CARD_PALETTE = [
  'bg-[#FF6B6B]', // Red
  'bg-[#4ECDC4]', // Teal
  'bg-[#FFE66D]', // Yellow
  'bg-[#C7F464]', // Lime Green
  'bg-[#A29BFE]', // Periwinkle
  'bg-[#00CEC9]', // Dark Cyan
  'bg-[#FAB1A0]', // Peach
  'bg-[#74B9FF]', // Blue
  'bg-[#FF7675]', // Pink
  'bg-[#fdcb6e]', // Mustard
];

export const NoteList: React.FC<NoteListProps> = ({ notes, onDelete, onEdit, onToggleDone }) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }
    return filtered;
  }, [notes, selectedTag]);

  const displayNotes = [...filteredNotes].reverse();

  const getRotation = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 5) - 2.5; 
  };

  const getTagStyle = (tag: string) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return TAG_PALETTE[hash % TAG_PALETTE.length];
  };

  const handleDoneClick = (id: string) => {
      setAnimatingId(id);
      setTimeout(() => {
          onToggleDone(id);
          setAnimatingId(null);
      }, 300); 
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Bar */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sticky top-4 z-10 transition-all">
          <span className="font-black mr-2 self-center text-lg dark:text-white">FILTER:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-1 font-bold border-2 border-black dark:border-white text-sm transition-colors font-mono ${!selectedTag ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-black dark:bg-black dark:text-white'}`}
          >
            ALL
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-4 py-1 font-bold border-2 border-black text-sm transition-all active:translate-y-1 font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none ${
                selectedTag === tag 
                  ? 'bg-black text-white dark:bg-white dark:text-black translate-y-[2px] shadow-none' 
                  : `${getTagStyle(tag)} hover:-translate-y-1`
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {displayNotes.length === 0 ? (
          <div className="col-span-full text-center py-20 border-4 border-dashed border-black dark:border-white opacity-30 font-black text-4xl uppercase select-none dark:text-white">
            NO ACTIVE NOTES
          </div>
        ) : (
          displayNotes.map((note, index) => {
            // Determine styles
            const isDone = note.isDone;
            const bgClass = isDone 
                ? 'bg-gray-100 dark:bg-gray-900' 
                : BOLD_CARD_PALETTE[index % BOLD_CARD_PALETTE.length];
            const textClass = isDone 
                ? 'text-gray-500 dark:text-gray-500' 
                : 'text-black'; // Force black text on vivid cards
            const borderClass = isDone 
                ? 'border-gray-400 dark:border-gray-700' 
                : 'border-black dark:border-white';

            return (
              <div 
                  key={note.id} 
                  className={`
                      transition-all duration-300 ease-in-out
                      ${animatingId === note.id ? 'scale-95' : 'animate-in slide-in-from-bottom-4 fade-in'}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
              >
                  <Card 
                    color={bgClass}
                    className={`flex flex-col h-full min-h-[320px] relative ${textClass}`}
                    rotate={isDone ? 0 : getRotation(note.id)}
                  >
                    {/* TOP BAR: Date & Check */}
                    <div className={`flex justify-between items-center mb-2 border-b-2 ${isDone ? 'border-gray-300' : 'border-black/20'} pb-2`}>
                       <span className="font-mono text-xs font-bold uppercase opacity-60">
                          {new Date(note.createdAt).toLocaleDateString()}
                       </span>
                       <button
                          onClick={() => handleDoneClick(note.id)}
                          className={`border-2 border-black w-6 h-6 flex items-center justify-center transition-all active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                              ${isDone ? 'bg-green-500 text-white shadow-none' : 'bg-white hover:bg-green-200'}
                          `}
                          title={isDone ? "Mark as Undone" : "Mark as Done"}
                        >
                           {isDone ? '✓' : ''}
                        </button>
                    </div>

                    {/* CENTER CONTENT AREA */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-4">
                       {/* Image Attachment */}
                      {note.imageUrl && (
                        <div className={`border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white max-w-full -rotate-1 hover:rotate-0 transition-transform ${isDone ? 'opacity-50 grayscale' : ''}`}>
                          <img src={note.imageUrl} alt="Attachment" className="w-full h-auto object-cover max-h-32" />
                        </div>
                      )}

                      {/* Main Text */}
                      <p className={`font-black text-2xl md:text-3xl leading-none tracking-tight break-words w-full ${isDone ? 'line-through decoration-4' : ''}`}>
                        {note.content}
                      </p>

                      {/* Schedule Badge */}
                      {note.scheduleDate && (
                        <div className={`inline-block border-2 border-black px-3 py-1 text-sm font-mono font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${isDone ? 'bg-gray-300 text-gray-600 shadow-none' : 'bg-black text-white'}`}>
                           {new Date(note.scheduleDate).toLocaleString(undefined, {weekday: 'short', hour: 'numeric', minute: '2-digit'})}
                        </div>
                      )}
                    </div>
                    
                    {/* BOTTOM BAR: Tags & Actions */}
                    <div className={`flex justify-between items-end mt-auto pt-4 border-t-2 ${isDone ? 'border-gray-300' : 'border-black'}`}>
                      <div className="flex flex-wrap gap-2 max-w-[70%]">
                        {note.tags.map(tag => (
                          <span 
                              key={tag} 
                              className={`
                                  ${getTagStyle(tag)} 
                                  border-2 border-black 
                                  text-[10px] md:text-xs px-2 py-1 
                                  font-bold font-mono uppercase 
                                  shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                  ${isDone ? 'opacity-50 shadow-none' : ''}
                              `}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => onEdit(note)}
                          className={`text-[10px] font-bold bg-white text-black hover:bg-black hover:text-white px-2 py-1 border-2 border-black transition-all active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isDone ? 'hidden' : ''}`}
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => onDelete(note.id)}
                          className="text-[10px] font-bold bg-[#FF0000] text-white px-2 py-1 border-2 border-black transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
