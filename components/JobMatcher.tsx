import React, { useState } from 'react';
import { JobDescription, MasterProfile, ExperienceEntry } from '../types';
import { optimizeBulletPoint, analyzeJobDescription, scoreBulletsRelevance, scoreSingleBullet, analyzeJobGaps, generateBridgingBullet } from '../services/geminiService';
import { ArrowRight, Wand2, Check, X, RefreshCw, AlertCircle, BarChart3, Eye, EyeOff, Target, Plus, ChevronRight, Briefcase, RotateCcw } from 'lucide-react';

interface Props {
  job: JobDescription;
  setJob: React.Dispatch<React.SetStateAction<JobDescription>>;
  profile: MasterProfile;
  setProfile: React.Dispatch<React.SetStateAction<MasterProfile>>;
  onResetFromMaster: () => void;
}

export const JobMatcher: React.FC<Props> = ({ job, setJob, profile, setProfile, onResetFromMaster }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [optimizing, setOptimizing] = useState<Record<string, boolean>>({});
  const [proposedChanges, setProposedChanges] = useState<Record<string, string>>({});
  
  // Gap Analysis State
  const [gaps, setGaps] = useState<{missing: string[], present: string[]} | null>(null);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [selectedGap, setSelectedGap] = useState<string | null>(null);
  const [gapContext, setGapContext] = useState('');
  const [gapTargetRole, setGapTargetRole] = useState(profile.experiences[0]?.id || '');
  const [generatingGap, setGeneratingGap] = useState(false);

  const handleAnalyze = async () => {
    if (!job.text) return;
    setAnalyzing(true);
    const keywords = await analyzeJobDescription(job.text);
    setJob(prev => ({ ...prev, keywords }));
    setAnalyzing(false);
  };

  const handleScoreRelevance = async () => {
    if (!job.text) return;
    setScoring(true);

    const allBullets = profile.experiences.flatMap(exp => 
        exp.bullets.map(b => ({ id: b.id, content: b.content }))
    );

    const scores = await scoreBulletsRelevance(allBullets, job.text);

    setProfile(prev => ({
        ...prev,
        experiences: prev.experiences.map(exp => ({
            ...exp,
            bullets: exp.bullets.map(b => {
                const scoreData = scores.find(s => s.id === b.id);
                return scoreData ? { ...b, relevanceScore: scoreData.score, relevanceReason: scoreData.reason } : b;
            })
        }))
    }));

    setScoring(false);
  };

  const handleAnalyzeGaps = async () => {
      if (!job.text) return;
      setAnalyzingGaps(true);
      
      // Serialize profile for context
      const profileText = JSON.stringify(profile.experiences.map(e => ({ role: e.role, bullets: e.bullets.map(b => b.content) })));
      
      const result = await analyzeJobGaps(profileText, job.text);
      setGaps({ missing: result.missingSkills, present: result.presentSkills });
      setAnalyzingGaps(false);
  };

  const handleGenerateBridgingBullet = async () => {
      if (!selectedGap || !gapContext || !gapTargetRole) return;
      setGeneratingGap(true);
      
      const newBulletContent = await generateBridgingBullet(selectedGap, gapContext, job.text);
      
      if (newBulletContent) {
          const newId = `b-${Date.now()}`;
          setProfile(prev => ({
              ...prev,
              experiences: prev.experiences.map(exp => exp.id !== gapTargetRole ? exp : {
                  ...exp,
                  bullets: [{ id: newId, content: newBulletContent, isLocked: false, isVisible: true, relevanceScore: 100, relevanceReason: "Gap filled via Strategy" }, ...exp.bullets]
              })
          }));
          
          // Cleanup
          setSelectedGap(null);
          setGapContext('');
          // Update gaps list locally to reflect the fix
          setGaps(prev => prev ? { ...prev, missing: prev.missing.filter(s => s !== selectedGap), present: [...prev.present, selectedGap] } : null);
      }
      
      setGeneratingGap(false);
  };

  const handleOptimizeBullet = async (expId: string, bulletId: string, content: string) => {
    setOptimizing(prev => ({ ...prev, [bulletId]: true }));
    const optimized = await optimizeBulletPoint(content, job.text);
    setProposedChanges(prev => ({ ...prev, [bulletId]: optimized }));
    setOptimizing(prev => ({ ...prev, [bulletId]: false }));
  };

  const handleManualEdit = (expId: string, bulletId: string, newContent: string) => {
      // Clear proposed changes if user edits manually
      if (proposedChanges[bulletId]) {
          const newProposed = { ...proposedChanges };
          delete newProposed[bulletId];
          setProposedChanges(newProposed);
      }

      setProfile(prev => ({
          ...prev,
          experiences: prev.experiences.map(e => e.id !== expId ? e : {
              ...e,
              bullets: e.bullets.map(b => b.id !== bulletId ? b : { 
                  ...b, 
                  content: newContent,
                  // Reset score as content changed
                  relevanceScore: undefined,
                  relevanceReason: undefined 
              })
          })
      }));
  };

  const toggleVisibility = (expId: string, bulletId: string) => {
    setProfile(prev => ({
        ...prev,
        experiences: prev.experiences.map(e => e.id !== expId ? e : {
            ...e,
            bullets: e.bullets.map(b => b.id !== bulletId ? b : { ...b, isVisible: !b.isVisible })
        })
    }));
  };

  const acceptChange = async (expId: string, bulletId: string) => {
    const newVal = proposedChanges[bulletId];
    if (!newVal) return;
    
    // 1. Update text locally
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.map(e => e.id !== expId ? e : {
        ...e,
        bullets: e.bullets.map(b => b.id !== bulletId ? b : { ...b, content: newVal, relevanceScore: undefined }) // Clear score temporarily
      })
    }));
    
    setProposedChanges(prev => {
      const next = { ...prev };
      delete next[bulletId];
      return next;
    });

    // 2. Re-score specifically this bullet
    setOptimizing(prev => ({ ...prev, [bulletId]: true })); // Show loading state on wand
    const newScore = await scoreSingleBullet(bulletId, newVal, job.text);
    
    if (newScore) {
        setProfile(prev => ({
            ...prev,
            experiences: prev.experiences.map(e => e.id !== expId ? e : {
                ...e,
                bullets: e.bullets.map(b => b.id !== bulletId ? b : { 
                    ...b, 
                    relevanceScore: newScore.score, 
                    relevanceReason: newScore.reason 
                })
            })
        }));
    }
    setOptimizing(prev => ({ ...prev, [bulletId]: false }));
  };

  const discardChange = (bulletId: string) => {
    setProposedChanges(prev => {
      const next = { ...prev };
      delete next[bulletId];
      return next;
    });
  };

  const getRelevanceColor = (score?: number) => {
    if (score === undefined) return 'bg-slate-100';
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-full gap-0 lg:gap-6 p-6">
      {/* Left Col: JD Input (3 cols) */}
      <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h2 className="font-bold text-slate-800">Job Description</h2>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
             <input 
                placeholder="Company" 
                className="border p-2 rounded text-sm w-full"
                value={job.company}
                onChange={e => setJob({...job, company: e.target.value})}
             />
             <input 
                placeholder="Job Title" 
                className="border p-2 rounded text-sm w-full"
                value={job.title}
                onChange={e => setJob({...job, title: e.target.value})}
             />
          </div>
          <textarea 
            className="flex-1 w-full border border-slate-200 rounded p-3 text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Paste entire job description here..."
            value={job.text}
            onChange={(e) => setJob({...job, text: e.target.value})}
          />
          <div className="flex gap-2 flex-wrap">
            <button 
                onClick={handleScoreRelevance}
                disabled={scoring || !job.text}
                className="flex-1 bg-indigo-600 text-white py-2 rounded font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {scoring ? <RefreshCw className="animate-spin" size={16}/> : <BarChart3 size={16}/>}
                Rank Bullets
            </button>
            <button 
                onClick={handleAnalyzeGaps}
                disabled={analyzingGaps || !job.text}
                className="flex-1 bg-white text-emerald-600 border border-emerald-600 py-2 rounded font-medium text-sm hover:bg-emerald-50 disabled:opacity-50 flex justify-center items-center gap-2"
            >
                {analyzingGaps ? <RefreshCw className="animate-spin" size={16}/> : <Target size={16}/>}
                Find Gaps
            </button>
          </div>
        </div>
      </div>

      {/* Middle Col: Optimization List (5 cols) */}
      <div className="lg:col-span-5 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800 text-lg">Your Resume Assets</h2>
            <div className="flex items-center gap-2">
                <button 
                    onClick={onResetFromMaster}
                    className="text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    title="Discard tailored changes and reset to Master Profile"
                >
                    <RotateCcw size={12} />
                    Reset to Master
                </button>
                <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                    <AlertCircle size={12} />
                    Sort: Relevance
                </div>
            </div>
        </div>
        
        <div className="space-y-6">
            {profile.experiences.map(exp => (
                <div key={exp.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-medium text-slate-700 text-sm flex justify-between">
                        <span>{exp.role} @ {exp.company}</span>
                        <span className="text-xs text-slate-400">
                            {exp.bullets.filter(b => b.isVisible !== false).length} / {exp.bullets.length} Visible
                        </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {exp.bullets.sort((a,b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)).map(bullet => {
                            const isProposed = !!proposedChanges[bullet.id];
                            const isLoading = optimizing[bullet.id];
                            const isVisible = bullet.isVisible !== false;

                            return (
                                <div key={bullet.id} className={`p-4 transition-colors hover:bg-slate-50 ${!isVisible ? 'bg-slate-50 opacity-60' : ''}`}>
                                    <div className="flex gap-4 items-start">
                                        <button 
                                            onClick={() => toggleVisibility(exp.id, bullet.id)}
                                            className={`mt-1 flex-shrink-0 transition-colors ${isVisible ? 'text-slate-600 hover:text-slate-800' : 'text-slate-300 hover:text-slate-500'}`}
                                        >
                                            {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>

                                        <div className={`flex-1 ${isProposed ? 'opacity-50' : 'opacity-100'}`}>
                                            <textarea
                                                value={bullet.content}
                                                onChange={(e) => handleManualEdit(exp.id, bullet.id, e.target.value)}
                                                disabled={!isVisible}
                                                className={`w-full text-sm leading-relaxed resize-none bg-transparent border border-transparent focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-blue-100 rounded p-1 -ml-1 outline-none transition-all ${isVisible ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-300'}`}
                                                rows={Math.max(2, Math.ceil(bullet.content.length / 80))}
                                            />
                                            
                                            {isVisible && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    {bullet.relevanceScore !== undefined ? (
                                                        <>
                                                            <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full ${getRelevanceColor(bullet.relevanceScore)}`} 
                                                                    style={{ width: `${bullet.relevanceScore}%` }} 
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-500">{bullet.relevanceScore}/100</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">Needs Ranking</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {isVisible && !isProposed && (
                                            <button 
                                                onClick={() => handleOptimizeBullet(exp.id, bullet.id, bullet.content)}
                                                disabled={isLoading || !job.text}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-30"
                                            >
                                                {isLoading ? <RefreshCw className="animate-spin" size={16}/> : <Wand2 size={16}/>}
                                            </button>
                                        )}
                                    </div>

                                    {isProposed && isVisible && (
                                        <div className="mt-3 pl-4 border-l-4 border-emerald-400 bg-emerald-50 p-3 rounded-r relative">
                                            <p className="text-sm text-emerald-900 font-medium pr-8">{proposedChanges[bullet.id]}</p>
                                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                                <button onClick={() => acceptChange(exp.id, bullet.id)} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                                                    <Check size={14} />
                                                </button>
                                                <button onClick={() => discardChange(bullet.id)} className="p-1 bg-white text-slate-500 border border-slate-200 rounded hover:text-red-600">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Right Col: Strategic Gaps (4 cols) */}
      <div className="lg:col-span-4 flex flex-col h-full pl-0 lg:pl-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h2 className="font-bold text-slate-800">Gap Analysis</h2>
                <p className="text-xs text-slate-500">Skills missing from your profile.</p>
              </div>
              
              {!gaps ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <Target size={48} className="mb-4 opacity-20" />
                      <p className="text-sm">Run "Find Gaps" to analyze what you are missing against this JD.</p>
                  </div>
              ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                       {/* Present Skills */}
                       {gaps.present.length > 0 && (
                           <div>
                               <h3 className="text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1">
                                   <Check size={12}/> Found in Profile
                               </h3>
                               <div className="flex flex-wrap gap-2">
                                   {gaps.present.map(s => (
                                       <span key={s} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs border border-emerald-100">
                                           {s}
                                       </span>
                                   ))}
                               </div>
                           </div>
                       )}

                       {/* Missing Skills */}
                       <div>
                           <h3 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                               <AlertCircle size={12}/> Critical Gaps
                           </h3>
                           <div className="space-y-2">
                               {gaps.missing.length === 0 ? (
                                   <p className="text-xs text-emerald-600 italic">No critical gaps found! Good job.</p>
                               ) : (
                                   gaps.missing.map(skill => (
                                       <div key={skill} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-md">
                                           <span className="text-sm font-medium text-red-800">{skill}</span>
                                           <button 
                                                onClick={() => setSelectedGap(skill)}
                                                className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-100 flex items-center gap-1"
                                           >
                                               <Plus size={12}/> Fill Gap
                                           </button>
                                       </div>
                                   ))
                               )}
                           </div>
                       </div>
                  </div>
              )}
          </div>
      </div>
      
      {/* Gap Filling Modal */}
      {selectedGap && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Target size={18} className="text-indigo-600"/>
                          Bridge Gap: {selectedGap}
                      </h3>
                      <button onClick={() => setSelectedGap(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <div className="p-6">
                      <p className="text-sm text-slate-600 mb-4">
                          You are missing <strong>{selectedGap}</strong>. The AI can generate a "Ruthless" bullet point for you, but it needs context.
                      </p>
                      
                      <label className="block text-xs font-bold text-slate-500 mb-1">Which role does this belong to?</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded mb-4 text-sm"
                        value={gapTargetRole}
                        onChange={(e) => setGapTargetRole(e.target.value)}
                      >
                          {profile.experiences.map(exp => (
                              <option key={exp.id} value={exp.id}>{exp.role} @ {exp.company}</option>
                          ))}
                      </select>
                      
                      <label className="block text-xs font-bold text-slate-500 mb-1">Roughly, what did you do with {selectedGap}?</label>
                      <textarea 
                          className="w-full p-3 border border-slate-300 rounded text-sm h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder={`e.g. Used ${selectedGap} to containerize the payment service...`}
                          value={gapContext}
                          onChange={(e) => setGapContext(e.target.value)}
                      />
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setSelectedGap(null)} className="px-4 py-2 text-slate-600 text-sm">Cancel</button>
                      <button 
                        onClick={handleGenerateBridgingBullet}
                        disabled={generatingGap || !gapContext}
                        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                          {generatingGap ? <RefreshCw className="animate-spin" size={16}/> : <Wand2 size={16}/>}
                          Generate & Insert
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};