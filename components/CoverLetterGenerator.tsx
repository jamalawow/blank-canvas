import React, { useState } from 'react';
import { MasterProfile, JobDescription } from '../types';
import { generateCoverLetter } from '../services/geminiService';
import { Wand2, Download, Printer, Copy, Check } from 'lucide-react';

interface Props {
  profile: MasterProfile;
  job: JobDescription;
  coverLetter: string;
  setCoverLetter: (text: string) => void;
}

export const CoverLetterGenerator: React.FC<Props> = ({ profile, job, coverLetter, setCoverLetter }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!job.text) {
      alert("Please enter a Job Description in the 'Job Match' tab first.");
      return;
    }
    setIsGenerating(true);
    const letter = await generateCoverLetter(profile, job.title, job.company, job.text);
    setCoverLetter(letter);
    setIsGenerating(false);
  };

  const handleCopy = () => {
      navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="cover-letter-view" className="grid grid-cols-1 lg:grid-cols-12 h-full gap-0 lg:gap-6 p-6">
      {/* Left Panel: Controls - Hidden on Print */}
      <div className="lg:col-span-4 flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden no-print">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-lg mb-1">Cover Letter</h2>
          <p className="text-xs text-slate-500">Persuasive narrative based on your profile and the JD.</p>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-6">
           <div>
               <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Target Position</label>
               <div className="p-3 bg-slate-100 rounded border border-slate-200 text-sm text-slate-700">
                   {job.title ? job.title : <span className="text-slate-400 italic">No Title Defined</span>} 
                   <span className="text-slate-400 mx-2">@</span> 
                   {job.company ? job.company : <span className="text-slate-400 italic">No Company</span>}
               </div>
           </div>

           <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
               <h3 className="text-indigo-900 font-bold text-sm mb-2">AI Strategy</h3>
               <p className="text-xs text-indigo-700 leading-relaxed">
                   The generator uses the "Ruthless Hiring Manager" persona. It avoids generic templates ("To whom it may concern") and focuses on mapping your 
                   <strong> Master Profile Summary</strong> directly to the <strong>Job Description's</strong> key requirements.
               </p>
           </div>

           <button 
                onClick={handleGenerate}
                disabled={isGenerating || !job.text}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
           >
                {isGenerating ? <Wand2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                {isGenerating ? 'Writing Letter...' : 'Generate with AI'}
           </button>
           
           {!job.text && (
               <p className="text-xs text-red-500 text-center">
                   * Job Description required. Go to "Job Match" tab.
               </p>
           )}
        </div>
      </div>

      {/* Right Panel: Editor/Preview */}
      <div id="cover-letter-wrapper" className="lg:col-span-8 h-full bg-slate-100 p-8 overflow-y-auto flex flex-col items-center">
          
          {/* Toolbar */}
          <div className="mb-6 flex gap-3 w-full max-w-[210mm] no-print">
               <button 
                onClick={() => window.print()}
                disabled={!coverLetter}
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 shadow-sm text-sm font-medium disabled:opacity-50"
               >
                   <Printer size={16} /> Print / Save PDF
               </button>
               <button 
                onClick={handleCopy}
                disabled={!coverLetter}
                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 shadow-sm text-sm font-medium disabled:opacity-50"
               >
                   {copied ? <Check size={16} className="text-emerald-600"/> : <Copy size={16}/>}
                   {copied ? 'Copied' : 'Copy Text'}
               </button>
          </div>

          {/* A4 Page */}
          <div className="bg-white shadow-xl print-preview w-[210mm] min-h-[297mm] p-[25mm] text-slate-800 flex flex-col">
               {/* Contact Header */}
               <div className="mb-8 border-b border-slate-200 pb-6">
                   <h1 className="text-2xl font-bold uppercase text-slate-900 mb-2">{profile.name}</h1>
                   <p className="text-sm text-slate-600">{profile.email} | {profile.phone}</p>
                   <p className="text-sm text-slate-600">{profile.location}</p>
               </div>

               {/* Date (Auto) */}
               <div className="mb-8 text-sm text-slate-600">
                   {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
               </div>

               {/* Content Area */}
               {coverLetter ? (
                   <>
                       {/* Screen View: Editable Textarea */}
                       <textarea 
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="w-full flex-1 resize-none outline-none text-base leading-relaxed font-serif text-slate-800 h-full overflow-hidden bg-transparent border-none focus:ring-0 p-0 no-print"
                            spellCheck={false}
                       />
                       {/* Print View: Static Div that expands naturally */}
                       <div className="only-print text-base leading-relaxed font-serif text-slate-800 whitespace-pre-wrap">
                           {coverLetter}
                       </div>
                   </>
               ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-lg no-print">
                       <Wand2 size={48} className="mb-4 opacity-20" />
                       <p className="text-sm">Ready to write. Click "Generate with AI".</p>
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};