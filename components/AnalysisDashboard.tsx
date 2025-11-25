import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { analyzeUserProductivity } from '../services/geminiService';

interface AnalysisDashboardProps {
  notes: Note[];
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ notes }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = notes.length;
    const scheduled = notes.filter(n => n.hasSchedule).length;
    const done = notes.filter(n => n.isDone).length;
    const active = total - done;

    const tagCounts: Record<string, number> = {};
    
    notes.forEach(note => {
      if (note.tags.length === 0) {
        tagCounts['untagged'] = (tagCounts['untagged'] || 0) + 1;
      } else {
        note.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); 

    return { total, scheduled, done, active, sortedTags };
  }, [notes]);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeUserProductivity(notes);
    setAiInsight(result);
    setLoading(false);
  };

  const COLORS = ['bg-[#FF6B6B]', 'bg-[#4ECDC4]', 'bg-[#FFE66D]', 'bg-[#C7F464]', 'bg-[#EA80FC]'];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      
      {/* Top Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Changed Total Card to Purple for better visibility */}
        <Card className="col-span-2 md:col-span-1 bg-[#8B5CF6] text-white flex flex-col justify-center items-center py-6">
           <span className="text-6xl font-black">{stats.total}</span>
           <span className="text-sm font-bold uppercase tracking-widest mt-2">Total</span>
        </Card>
         <Card className="bg-green-400 text-black flex flex-col justify-center items-center">
            <span className="text-5xl font-black">{stats.done}</span>
            <span className="font-bold uppercase text-center text-sm">Completed</span>
        </Card>
        <Card className="bg-[#FFE66D] text-black flex flex-col justify-center items-center">
            <span className="text-5xl font-black">{stats.scheduled}</span>
            <span className="font-bold uppercase text-center text-sm">Scheduled</span>
        </Card>
        <Card className="bg-[#4ECDC4] text-black flex flex-col justify-center items-center">
            <span className="text-5xl font-black">{Math.round((stats.done / (stats.total || 1)) * 100)}%</span>
            <span className="font-bold uppercase text-center text-sm">Win Rate</span>
        </Card>
      </div>

      {/* Tag Distribution Graph */}
      <Card>
        <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black dark:border-white inline-block dark:text-white">Focus Areas</h3>
        <div className="space-y-4">
            {stats.sortedTags.length === 0 && <p className="opacity-50 font-bold dark:text-white">NO DATA. START TAGGING.</p>}
            {stats.sortedTags.map(([tag, count], index) => {
                const percentage = Math.round((count / stats.total) * 100);
                return (
                    <div key={tag} className="flex items-center gap-4">
                        <div className="w-24 font-bold text-right uppercase text-sm truncate dark:text-white">#{tag}</div>
                        <div className="flex-1 h-8 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800 relative">
                            <div 
                                className={`h-full border-r-2 border-black dark:border-white ${COLORS[index % COLORS.length]} absolute top-0 left-0 transition-all duration-1000`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="w-12 font-black text-lg dark:text-white">{count}</div>
                    </div>
                )
            })}
        </div>
      </Card>

      {/* AI Analysis Section */}
      <div className="relative">
          <div className="absolute inset-0 bg-black dark:bg-white translate-x-2 translate-y-2"></div>
          <div className="relative bg-white dark:bg-[#111] border-2 border-black dark:border-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h3 className="text-3xl font-black uppercase dark:text-white">System Audit</h3>
                    <p className="font-bold opacity-60 dark:text-gray-400">Let the AI judge your life choices.</p>
                </div>
                <Button onClick={handleAnalyze} isLoading={loading} className="w-full md:w-auto">
                    RUN DIAGNOSTICS
                </Button>
            </div>

            {aiInsight && (
                <div className="bg-black text-[#00ff00] p-6 font-mono text-lg border-2 border-transparent shadow-[inset_0_0_20px_rgba(0,255,0,0.2)] animate-in fade-in zoom-in-95 duration-300">
                    <span className="block mb-4 border-b border-[#00ff00] pb-2 opacity-50 text-xs">
                        > root@gemini:~/analysis# cat output.txt
                    </span>
                    <p className="leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
                    <span className="block mt-4 animate-pulse">_</span>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};