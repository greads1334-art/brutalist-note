import React, { useState, useCallback, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { parseNoteWithGemini } from '../services/geminiService';
import { Note, ParsedNoteData } from '../types';

interface NoteInputProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  onUpdateNote: (note: Note) => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({ notes, onAddNote, onUpdateNote }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        alert("FILE TOO BIG. MAX 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    setIsProcessing(true);
    try {
      let parsedData: ParsedNoteData = { 
        summary: input, 
        tags: [], 
        isEvent: false, 
        scheduleDate: null,
        action: 'CREATE',
        targetId: null
      };
      
      if (input.trim()) {
        // Pass existing notes for context-aware parsing
        parsedData = await parseNoteWithGemini(input, notes);
      } else {
        parsedData = { 
          summary: "Image Attachment", 
          tags: ["image"], 
          isEvent: false, 
          scheduleDate: null,
          action: 'CREATE',
          targetId: null
        };
      }

      if (parsedData.action === 'UPDATE' && parsedData.targetId) {
        const existingNote = notes.find(n => n.id === parsedData.targetId);
        if (existingNote) {
            const updatedNote: Note = {
                ...existingNote,
                content: parsedData.summary,
                tags: parsedData.tags.length > 0 ? parsedData.tags : existingNote.tags, // Keep old tags if no new ones
                hasSchedule: parsedData.isEvent,
                scheduleDate: parsedData.scheduleDate || undefined,
                // Only update raw content if it makes sense, usually we keep history or replace. 
                // Let's replace for the "latest" thought.
                rawContent: input 
            };
            onUpdateNote(updatedNote);
            // Visual feedback
            alert(`UPDATED: ${updatedNote.content}`);
        } else {
            // Fallback to create if ID mismatch
            const newNote: Note = {
                id: crypto.randomUUID(),
                content: parsedData.summary,
                rawContent: input,
                tags: parsedData.tags,
                createdAt: new Date().toISOString(),
                hasSchedule: parsedData.isEvent,
                scheduleDate: parsedData.scheduleDate || undefined,
                imageUrl: selectedImage || undefined,
                isDone: false
            };
            onAddNote(newNote);
        }
      } else {
        // CREATE ACTION
        const newNote: Note = {
            id: crypto.randomUUID(),
            content: parsedData.summary,
            rawContent: input,
            tags: parsedData.tags,
            createdAt: new Date().toISOString(),
            hasSchedule: parsedData.isEvent,
            scheduleDate: parsedData.scheduleDate || undefined,
            imageUrl: selectedImage || undefined,
            isDone: false
        };
        onAddNote(newNote);
      }

      setInput('');
      clearImage();
    } catch (err) {
      console.error("Failed to process note", err);
      alert("AI ERROR. TRY AGAIN.");
    } finally {
      setIsProcessing(false);
    }
  }, [input, selectedImage, onAddNote, onUpdateNote, notes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <Card className="mb-8 border-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <label className="block font-bold mb-2 uppercase tracking-wide dark:text-white">
            Input Terminal
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a note... OR type 'Reschedule [Event] to [Time]' to update."
            className="w-full h-32 p-4 text-lg border-2 border-black dark:border-white focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-shadow bg-yellow-50 dark:bg-gray-800 dark:text-white resize-none font-medium placeholder:text-gray-500"
          />
          <div className="absolute bottom-3 right-3 text-xs font-bold text-gray-400 pointer-events-none">
            CTRL + ENTER
          </div>
        </div>

        {selectedImage && (
          <div className="relative inline-block w-max border-2 border-black dark:border-white">
            <img src={selectedImage} alt="Preview" className="h-32 object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-3 -right-3 bg-[#FF0000] text-white border-2 border-black w-6 h-6 flex items-center justify-center font-bold text-xs hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              X
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <Button 
              type="button" 
              variant="neutral" 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2"
            >
              📷 UPLOAD
            </Button>
          </div>
          
          <Button type="submit" isLoading={isProcessing} className="w-full sm:w-auto ml-auto">
            EXECUTE
          </Button>
        </div>
      </form>
    </Card>
  );
};