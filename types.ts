export interface Note {
  id: string;
  content: string;
  rawContent: string;
  tags: string[];
  createdAt: string; // ISO String
  hasSchedule: boolean;
  scheduleDate?: string; // ISO String for event start
  imageUrl?: string; // Base64 string for uploaded photos
  isDone: boolean;
}

export interface Tag {
  label: string;
  color: string;
}

export enum ViewMode {
  NOTES = 'NOTES',
  SCHEDULE = 'SCHEDULE',
  ANALYSIS = 'ANALYSIS'
}

export interface ParsedNoteData {
  summary: string;
  tags: string[];
  scheduleDate?: string | null;
  isEvent: boolean;
  action: 'CREATE' | 'UPDATE';
  targetId?: string | null;
}