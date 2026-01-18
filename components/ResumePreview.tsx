import React from 'react';
import { MasterProfile } from '../types';
import { Download } from 'lucide-react';

interface Props {
  profile: MasterProfile;
}

export const ResumePreview: React.FC<Props> = ({ profile }) => {
  return (
    <div id="resume-preview-wrapper" className="flex flex-col h-full bg-slate-100 p-8 overflow-y-auto items-center resume-preview-wrapper">
      <div className="mb-6 flex gap-4 no-print">
        <button 
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 shadow-sm text-sm font-medium"
            onClick={() => window.print()}
        >
            <Download size={16} /> Print / Save PDF
        </button>
        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded-md border border-yellow-200">
            Preview Mode (A4 Scale)
        </div>
      </div>

      {/* The A4 Page */}
      <div 
        className="bg-white shadow-xl print-preview w-[210mm] min-h-[297mm] p-[20mm] text-slate-900"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-4xl font-bold uppercase tracking-wide mb-2 text-slate-900">{profile.name}</h1>
            <div className="text-sm text-slate-600 flex gap-3 divide-x divide-slate-300">
                <span className="pl-0">{profile.email}</span>
                <span className="pl-3">{profile.phone}</span>
                <span className="pl-3">{profile.location}</span>
                <span className="pl-3">{profile.linkedin.replace('https://', '')}</span>
            </div>
        </header>

        {/* Summary */}
        <section className="mb-6">
            <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-3 pb-1">Professional Summary</h2>
            <p className="text-sm leading-relaxed text-justify text-slate-700">
                {profile.summary}
            </p>
        </section>

        {/* Experience */}
        <section>
            <h2 className="text-lg font-bold uppercase border-b border-slate-300 mb-4 pb-1">Experience</h2>
            <div className="space-y-6">
                {profile.experiences.map(exp => {
                    // Filter visible bullets
                    const visibleBullets = exp.bullets.filter(b => b.isVisible !== false);
                    
                    // Don't render experience if no bullets are visible (optional rule, but clean)
                    if (visibleBullets.length === 0) return null;

                    return (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-md text-slate-900">{exp.company}</h3>
                                <span className="text-sm font-medium text-slate-600">{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <div className="text-sm italic text-slate-700 mb-2">{exp.role} | {exp.location}</div>
                            <ul className="list-disc pl-5 space-y-1">
                                {visibleBullets.map(bullet => (
                                    <li key={bullet.id} className="text-sm leading-snug text-slate-800 pl-1">
                                        {bullet.content}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
      </div>
    </div>
  );
};