import React from 'react';
import { ResumeSnapshot } from '../types';
import { deleteSnapshot } from '../services/storageService';
import { Clock, Briefcase, Trash2, ArrowRight, CornerUpLeft } from 'lucide-react';

interface Props {
  snapshots: ResumeSnapshot[];
  onLoadSnapshot: (snapshot: ResumeSnapshot) => void;
  onRefresh: () => void;
}

export const ApplicationHistory: React.FC<Props> = ({ snapshots, onLoadSnapshot, onRefresh }) => {

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this history record?")) {
        deleteSnapshot(id);
        onRefresh();
    }
  };

  if (snapshots.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Briefcase size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-slate-600">No History Yet</h3>
            <p className="text-sm">Save your first tailored resume to see it here.</p>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Clock className="text-indigo-600" /> Application History
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {snapshots.map((snap) => (
            <div 
                key={snap.id} 
                onClick={() => onLoadSnapshot(snap)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg text-slate-800 truncate pr-4">{snap.company || "Untitled Company"}</div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded">
                            {new Date(snap.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="text-sm text-indigo-600 font-medium mb-4">{snap.jobTitle || "Untitled Role"}</div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            {snap.profileSnapshot.experiences.reduce((acc, exp) => acc + exp.bullets.filter(b => b.isVisible).length, 0)} Bullets
                        </span>
                        <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">
                             Tailored
                        </span>
                    </div>
                </div>
                
                <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                        <CornerUpLeft size={12} /> RESTORE
                    </span>
                    <button 
                        onClick={(e) => handleDelete(e, snap.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};