
import { Note, ParsedNoteData } from '../types';

// const API_URL = 'http://localhost:3001/api';
// Use this service if you want to switch from LocalStorage to Backend

export const apiService = {
  async getNotes(): Promise<Note[]> {
    const res = await fetch('/api/notes');
    return res.json();
  },

  async createNote(note: Note): Promise<void> {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
  },

  async updateNote(note: Note): Promise<void> {
    await fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
  },

  async deleteNote(id: string): Promise<void> {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  },

  async parseWithAI(text: string, existingNotes: Note[]): Promise<ParsedNoteData> {
    const res = await fetch('/api/ai/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text, 
        existingNotes, 
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone 
      })
    });
    return res.json();
  },

  async analyzeWithAI(notesSummary: string): Promise<string> {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notesSummary })
    });
    const data = await res.json();
    return data.text;
  }
};
