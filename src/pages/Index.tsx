import React, { useState, useEffect } from 'react';
import { MasterProfile, JobDescription, AppView, INITIAL_PROFILE, ResumeSnapshot, generateId } from '../types';
import { MasterProfileEditor } from '../components/MasterProfileEditor';
import { saveMasterProfile, getMasterProfile, saveSnapshot, getSnapshots } from '../services/storageService';
import { Button } from '../components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Eye, 
  History, 
  Save, 
  CheckCircle, 
  Mail,
  Code2,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.MASTER_PROFILE);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Master Profile - Single source of truth
  const [masterProfile, setMasterProfile] = useState<MasterProfile>(() => {
    const saved = getMasterProfile();
    return saved || INITIAL_PROFILE;
  });

  // Tailored Profile - Job-specific version
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

  // Load history on mount
  useEffect(() => {
    setSnapshots(getSnapshots());
  }, []);

  // Save Master Profile on change
  useEffect(() => {
    saveMasterProfile(masterProfile);
  }, [masterProfile]);

  // Sync Tailored with Master when no job is active
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
      profileSnapshot: JSON.parse(JSON.stringify(tailoredProfile)),
      jobSnapshot: JSON.parse(JSON.stringify(job)),
      coverLetter: coverLetter
    };

    saveSnapshot(newSnapshot);
    setSnapshots(getSnapshots());
    
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2500);
  };

  const handleLoadSnapshot = (snap: ResumeSnapshot) => {
    if (confirm(`Load stored resume for ${snap.company}? Unsaved changes will be lost.`)) {
      setTailoredProfile(JSON.parse(JSON.stringify(snap.profileSnapshot)));
      setJob(JSON.parse(JSON.stringify(snap.jobSnapshot)));
      setCoverLetter(snap.coverLetter || "");
      setCurrentView(AppView.JOB_MATCH);
    }
  };

  const handleResetTailoredFromMaster = () => {
    if (confirm("Reset tailored resume to match Master Profile?")) {
      setTailoredProfile(JSON.parse(JSON.stringify(masterProfile)));
    }
  };

  const navItems = [
    { view: AppView.MASTER_PROFILE, label: 'Master Profile', icon: LayoutDashboard },
    { view: AppView.JOB_MATCH, label: 'Job Match', icon: FileText },
    { view: AppView.COVER_LETTER, label: 'Cover Letter', icon: Mail },
    { view: AppView.PREVIEW, label: 'Preview', icon: Eye },
    { view: AppView.HISTORY, label: 'History', icon: History, badge: snapshots.length > 0 ? snapshots.length : undefined },
  ];

  const renderView = () => {
    switch(currentView) {
      case AppView.MASTER_PROFILE:
        return <MasterProfileEditor profile={masterProfile} setProfile={setMasterProfile} />;
      case AppView.JOB_MATCH:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">Job Matcher</h2>
            <p>Coming next: Paste a job description to analyze and optimize your resume.</p>
          </div>
        );
      case AppView.COVER_LETTER:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">Cover Letter Generator</h2>
            <p>Coming soon: AI-powered cover letter generation.</p>
          </div>
        );
      case AppView.PREVIEW:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">Resume Preview</h2>
            <p>Coming soon: A4 document preview.</p>
          </div>
        );
      case AppView.HISTORY:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <History className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">Application History</h2>
            <p>{snapshots.length === 0 ? 'No saved applications yet.' : `${snapshots.length} saved applications.`}</p>
          </div>
        );
      case AppView.BACKEND_SPEC:
        return (
          <div className="p-6 text-center text-muted-foreground">
            <Code2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h2 className="text-xl font-semibold mb-2">Backend Specification</h2>
            <p>Technical documentation for Python backend.</p>
          </div>
        );
      default:
        return <MasterProfileEditor profile={masterProfile} setProfile={setMasterProfile} />;
    }
  };

  const getViewTitle = () => {
    switch(currentView) {
      case AppView.MASTER_PROFILE: return "Master Profile Editor";
      case AppView.JOB_MATCH: return "Job Analysis & Optimization";
      case AppView.COVER_LETTER: return "Cover Letter Generator";
      case AppView.PREVIEW: return "Document Preview";
      case AppView.HISTORY: return "Application Database";
      case AppView.BACKEND_SPEC: return "Backend Specification";
      default: return "Resume Tailor";
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-accent-foreground tracking-tight">
            Resume Tailor
          </h1>
          <p className="text-xs text-sidebar-muted mt-1">MVP v0.3.0</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {navItems.map(({ view, label, icon: Icon, badge }) => (
            <button 
              key={view}
              onClick={() => {
                setCurrentView(view);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                currentView === view 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {badge && (
                <span className="ml-auto bg-sidebar-accent text-sidebar-accent-foreground text-[10px] px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}

          {/* Developer Section */}
          <div className="pt-6 mt-6 border-t border-sidebar-border">
            <p className="px-4 text-xs font-semibold text-sidebar-muted uppercase tracking-wider mb-2">
              Developer
            </p>
            <button 
              onClick={() => setCurrentView(AppView.BACKEND_SPEC)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium",
                currentView === AppView.BACKEND_SPEC 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg" 
                  : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
              )}
            >
              <Code2 className="h-4 w-4" />
              <span>Backend Spec</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-muted">
          <p>Powered by Gemini AI</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="text-lg font-semibold">{getViewTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Save Button */}
            {(currentView === AppView.JOB_MATCH || currentView === AppView.PREVIEW || currentView === AppView.COVER_LETTER) && (
              <Button 
                onClick={handleSaveSnapshot}
                variant={showSaveSuccess ? "outline" : "default"}
                className={cn(
                  "transition-all",
                  showSaveSuccess && "border-success text-success"
                )}
              >
                {showSaveSuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {showSaveSuccess ? 'Saved!' : 'Save Application'}
              </Button>
            )}

            {/* User info */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {masterProfile.name || 'No name set'}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                {masterProfile.name ? masterProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
