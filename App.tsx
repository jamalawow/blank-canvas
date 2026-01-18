import React, { useState, useEffect } from 'react';
import { MasterProfile, JobDescription, AppView, INITIAL_PROFILE, ResumeSnapshot } from './types';
import { MasterProfileEditor } from './components/MasterProfileEditor';
import { JobMatcher } from './components/JobMatcher';
import { ResumePreview } from './components/ResumePreview';
import { CoverLetterGenerator } from './components/CoverLetterGenerator';
import { BackendSpec } from './components/BackendSpec';
import { ApplicationHistory } from './components/ApplicationHistory';
import { saveSnapshot, getSnapshots, generateId, saveMasterProfile, getMasterProfile } from './services/storageService';
import { LayoutDashboard, FileText, Eye, Code2, History, Save, CheckCircle, Mail } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.MASTER_PROFILE);
  
  // Separate states for Master (Source of Truth) and Tailored (Job Specific)
  // Load from local storage if available, otherwise use initial placeholder
  const [masterProfile, setMasterProfile] = useState<MasterProfile>(() => {
      const saved = getMasterProfile();
      return saved || INITIAL_PROFILE;
  });

  const [tailoredProfile, setTailoredProfile] = useState<MasterProfile>(INITIAL_PROFILE);
  const [coverLetter, setCoverLetter] = useState<string>("");
  
  const [job, setJob] = useState<JobDescription>({
    id: 'job-1',
    company: '',
    title: '',
    text: '',
    keywords: []
  });
  const [snapshots, setSnapshots] = useState<ResumeSnapshot[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    // Load history on mount
    setSnapshots(getSnapshots());
  }, []);

  // Save Master Profile whenever it changes
  useEffect(() => {
      saveMasterProfile(masterProfile);
  }, [masterProfile]);

  // Auto-sync Tailored Profile with Master Profile IF no job is active.
  // This ensures that when a user imports a resume or edits the master, 
  // they see those changes immediately in the Matcher before they start tailoring.
  useEffect(() => {
    const isJobEmpty = !job.text && !job.title && !job.company;
    if (isJobEmpty) {
        setTailoredProfile(JSON.parse(JSON.stringify(masterProfile)));
    }
  }, [masterProfile, job.text, job.title, job.company]);

  const handleSaveSnapshot = () => {
    if (!job.company && !job.title) {
        alert("Please enter a Company Name or Job Title before saving.");
        return;
    }

    const newSnapshot: ResumeSnapshot = {
        id: generateId(),
        timestamp: Date.now(),
        company: job.company,
        jobTitle: job.title,
        profileSnapshot: JSON.parse(JSON.stringify(tailoredProfile)), // Save the TAILORED version
        jobSnapshot: JSON.parse(JSON.stringify(job)), // Deep copy
        coverLetter: coverLetter // Save the generated letter
    };

    saveSnapshot(newSnapshot);
    setSnapshots(getSnapshots());
    
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2500);
  };

  const handleLoadSnapshot = (snap: ResumeSnapshot) => {
    if (confirm(`Load stored resume for ${snap.company}? Unsaved changes in current session will be lost.`)) {
        setTailoredProfile(JSON.parse(JSON.stringify(snap.profileSnapshot)));
        setJob(JSON.parse(JSON.stringify(snap.jobSnapshot)));
        setCoverLetter(snap.coverLetter || ""); // Load letter or empty if old snapshot
        setCurrentView(AppView.JOB_MATCH);
    }
  };

  const handleResetTailoredFromMaster = () => {
      if (confirm("This will overwrite your current tailored resume with the latest Master Profile data. Continue?")) {
          setTailoredProfile(JSON.parse(JSON.stringify(masterProfile)));
      }
  };

  const renderView = () => {
    switch(currentView) {
      case AppView.MASTER_PROFILE:
        return <MasterProfileEditor profile={masterProfile} setProfile={setMasterProfile} />;
      case AppView.JOB_MATCH:
        return (
            <JobMatcher 
                job={job} 
                setJob={setJob} 
                profile={tailoredProfile} 
                setProfile={setTailoredProfile} 
                onResetFromMaster={handleResetTailoredFromMaster}
            />
        );
      case AppView.COVER_LETTER:
        return (
            <CoverLetterGenerator 
                profile={masterProfile} // Use Master profile metadata for letter
                job={job}
                coverLetter={coverLetter}
                setCoverLetter={setCoverLetter}
            />
        );
      case AppView.PREVIEW:
        return <ResumePreview profile={tailoredProfile} />;
      case AppView.BACKEND_SPEC:
        return <BackendSpec />;
      case AppView.HISTORY:
        return <ApplicationHistory snapshots={snapshots} onLoadSnapshot={handleLoadSnapshot} onRefresh={() => setSnapshots(getSnapshots())} />;
      default:
        return <MasterProfileEditor profile={masterProfile} setProfile={setMasterProfile} />;
    }
  };

  return (
    <div id="app-root" className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 no-print">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight">Resume Tailor</h1>
          <p className="text-xs text-slate-500 mt-1">MVP v0.2.1 (Track)</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setCurrentView(AppView.MASTER_PROFILE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${currentView === AppView.MASTER_PROFILE ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Master Profile</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.JOB_MATCH)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${currentView === AppView.JOB_MATCH ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <FileText size={18} />
            <span className="text-sm font-medium">Job Match & Optimize</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.COVER_LETTER)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${currentView === AppView.COVER_LETTER ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Mail size={18} />
            <span className="text-sm font-medium">Cover Letter</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.PREVIEW)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${currentView === AppView.PREVIEW ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <Eye size={18} />
            <span className="text-sm font-medium">PDF Preview</span>
          </button>

           <button 
            onClick={() => setCurrentView(AppView.HISTORY)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${currentView === AppView.HISTORY ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            <History size={18} />
            <span className="text-sm font-medium">App History</span>
            {snapshots.length > 0 && (
                <span className="ml-auto bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full">{snapshots.length}</span>
            )}
          </button>

          <div className="pt-8 mt-8 border-t border-slate-800">
            <h3 className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Developer</h3>
            <button 
                onClick={() => setCurrentView(AppView.BACKEND_SPEC)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${currentView === AppView.BACKEND_SPEC ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
            >
                <Code2 size={18} />
                <span className="text-sm font-medium">Backend Spec</span>
            </button>
          </div>
        </nav>

        <div className="p-6 text-xs text-slate-600 border-t border-slate-800">
          <p>Powered by Gemini 3 Flash</p>
          <p>& WeasyPrint Architecture</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center flex-shrink-0 z-10 no-print">
          <h2 className="text-lg font-semibold text-slate-800">
            {currentView === AppView.MASTER_PROFILE && "Master Profile Editor"}
            {currentView === AppView.JOB_MATCH && "Job Analysis & Optimization (Tailored)"}
            {currentView === AppView.COVER_LETTER && "Cover Letter Generator"}
            {currentView === AppView.PREVIEW && "Final Document Preview (Tailored)"}
            {currentView === AppView.BACKEND_SPEC && "Python & SQLAlchemy Specification"}
            {currentView === AppView.HISTORY && "Application Database"}
          </h2>
          <div className="flex items-center gap-4">
            
            {/* Save Action - Only visible in edit/preview modes */}
            {(currentView === AppView.JOB_MATCH || currentView === AppView.PREVIEW || currentView === AppView.COVER_LETTER) && (
                 <button 
                    onClick={handleSaveSnapshot}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                        showSaveSuccess 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                    }`}
                 >
                    {showSaveSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
                    {showSaveSuccess ? 'Saved!' : 'Save Application'}
                 </button>
            )}

            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">Local Session: {masterProfile.name}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                AM
                </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div id="view-content" className="flex-1 overflow-auto bg-slate-50 relative">
            {renderView()}
        </div>
      </main>
    </div>
  );
}