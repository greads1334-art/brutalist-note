import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { Button } from './Button';

interface EditModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ note, isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [hasSchedule, setHasSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTags(note.tags.join(', '));
      setHasSchedule(note.hasSchedule);
      setImageUrl(note.imageUrl);
      
      if (note.scheduleDate) {
        const date = new Date(note.scheduleDate);
        // Convert to local datetime-local format: YYYY-MM-DDThh:mm
        const offset = date.getTimezoneOffset() * 60000;
        const localIso = new Date(date.getTime() - offset).toISOString().slice(0, 16);
        setScheduleDate(localIso);
      } else {
        setScheduleDate('');
      }
    }
  }, [note]);

  if (!isOpen || !note) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 1024 * 1024 * 2) { 
            alert("FILE TOO BIG."); 
            return; 
        }
        const reader = new FileReader();
        reader.onloadend = () => setImageUrl(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    let finalDate = undefined;
    if (hasSchedule && scheduleDate) {
        finalDate = new Date(scheduleDate).toISOString();
    }

    onSave({
      ...note,
      content,
      tags: tagArray,
      hasSchedule,
      scheduleDate: hasSchedule ? finalDate : undefined,
      imageUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1a1a] dark:text-white border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 font-bold border-2 border-black dark:border-white w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
            X
        </button>

        <h2 className="text-3xl font-black mb-6 uppercase border-b-4 border-black dark:border-white pb-2 inline-block">Edit Protocol</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Content */}
            <div className="flex flex-col gap-2">
                <label className="font-bold bg-black text-white dark:bg-white dark:text-black inline-block px-2 py-1 w-max">CONTENT</label>
                <textarea 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full border-2 border-black dark:border-white bg-white dark:bg-[#000] p-3 font-medium min-h-[120px] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-shadow text-lg resize-y"
                />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
                <label className="font-bold bg-black text-white dark:bg-white dark:text-black inline-block px-2 py-1 w-max">TAGS</label>
                <input 
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="study, meeting, work"
                    className="w-full border-2 border-black dark:border-white bg-white dark:bg-[#000] p-3 font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-shadow"
                />
            </div>
            
            {/* Image */}
            <div className="flex flex-col gap-2">
                 <label className="font-bold bg-black text-white dark:bg-white dark:text-black inline-block px-2 py-1 w-max">IMAGE</label>
                 {imageUrl ? (
                     <div className="relative w-max border-2 border-black dark:border-white">
                         <img src={imageUrl} alt="Current" className="h-32 object-cover"/>
                         <button 
                            type="button" 
                            onClick={() => setImageUrl(undefined)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 border-2 border-black flex items-center justify-center font-bold"
                         >X</button>
                     </div>
                 ) : (
                     <div className="flex gap-2">
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                         <Button type="button" variant="neutral" onClick={() => fileInputRef.current?.click()}>ADD PHOTO</Button>
                     </div>
                 )}
            </div>

            {/* Schedule */}
            <div className="border-4 border-black dark:border-white p-4 bg-[#fff0f0] dark:bg-[#2a0000]">
                <label className="flex items-center gap-3 font-bold cursor-pointer mb-4 select-none">
                    <div className={`w-6 h-6 border-2 border-black dark:border-white flex items-center justify-center bg-white ${hasSchedule ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : ''}`}>
                        {hasSchedule && <div className="w-3 h-3 bg-black" />}
                    </div>
                    <input 
                        type="checkbox" 
                        checked={hasSchedule}
                        onChange={e => setHasSchedule(e.target.checked)}
                        className="hidden"
                    />
                    <span className="uppercase tracking-wide">Enable Scheduling</span>
                </label>

                {hasSchedule && (
                    <div className="animate-in slide-in-from-top-2">
                        <label className="font-bold block mb-2 text-sm uppercase opacity-70">Date & Time</label>
                        <input 
                            type="datetime-local"
                            value={scheduleDate}
                            onChange={e => setScheduleDate(e.target.value)}
                            className="w-full border-2 border-black dark:border-white p-2 font-medium bg-white dark:bg-[#000] dark:text-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-shadow"
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4 border-t-2 border-dashed border-black dark:border-white">
                <Button type="button" variant="neutral" onClick={onClose} className="flex-1">CANCEL</Button>
                <Button type="submit" className="flex-1">SAVE</Button>
            </div>
        </form>
      </div>
    </div>
  );
};