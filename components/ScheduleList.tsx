import React from 'react';
import { Note } from '../types';

interface ScheduleListProps {
  notes: Note[];
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ notes }) => {
  // Show all schedule notes, but sort completed ones to the bottom or visual indication
  const events = notes
    .filter(n => n.hasSchedule && n.scheduleDate)
    .sort((a, b) => new Date(a.scheduleDate!).getTime() - new Date(b.scheduleDate!).getTime());

  const now = new Date();

  return (
    <div className="space-y-6">
      <div className="border-2 border-black dark:border-white bg-[#90f1ef] dark:bg-[#005f5e] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
        <h2 className="text-4xl font-black uppercase mb-2 dark:text-white">Timeline</h2>
        <p className="font-bold opacity-70 dark:text-gray-200">
          Upcoming deadlines. Completed tasks are struck through.
        </p>
      </div>

      <div className="relative border-l-4 border-black dark:border-white ml-4 md:ml-8 pl-8 py-4 space-y-12">
        {events.length === 0 ? (
          <p className="font-bold text-xl opacity-50 dark:text-gray-500">Nothing scheduled.</p>
        ) : (
          events.map((event) => {
            const date = new Date(event.scheduleDate!);
            const isPast = date < now;
            
            return (
              <div key={event.id} className={`relative group ${event.isDone ? 'opacity-50 grayscale' : ''}`}>
                {/* Timeline dot */}
                <div className={`
                  absolute -left-[45px] md:-left-[45px] top-2
                  w-6 h-6 border-2 border-black dark:border-white
                  ${event.isDone ? 'bg-green-500' : (isPast ? 'bg-gray-400 dark:bg-gray-700' : 'bg-[#FF6B6B]')}
                  group-hover:scale-125 transition-transform flex items-center justify-center text-[10px] font-bold text-white
                `}>
                    {event.isDone && '✓'}
                </div>

                <div className={`
                  border-2 border-black dark:border-white p-4 
                  shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]
                  transition-transform hover:-translate-y-1
                  ${isPast || event.isDone ? 'bg-gray-200 dark:bg-gray-800' : 'bg-white dark:bg-[#1a1a1a]'}
                `}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className={`text-2xl font-black dark:text-white ${event.isDone ? 'line-through decoration-4 decoration-black dark:decoration-white' : ''}`}>
                      {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                    </div>
                    <div className="font-mono font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-1 inline-block text-center md:text-right">
                      {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {event.imageUrl && (
                      <div className="mb-2 border-2 border-black dark:border-white">
                          <img src={event.imageUrl} alt="Thumbnail" className="h-20 w-full object-cover" />
                      </div>
                  )}

                  <p className={`text-lg font-bold border-t-2 border-black dark:border-white pt-2 dark:text-white ${event.isDone ? 'line-through' : ''}`}>
                    {event.content}
                  </p>
                  
                  <div className="mt-2 flex gap-2">
                    {event.tags.map(tag => (
                      <span key={tag} className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};