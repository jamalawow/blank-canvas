import React, { useState } from 'react';
import { MasterProfile, ExperienceEntry } from '../types';
import { parseResumeFromText, parseResumeFromPdf } from '../services/geminiService';
import { Briefcase, MapPin, Calendar, Plus, Trash2, Edit2, DownloadCloud, Loader2, X, FileText, Upload } from 'lucide-react';

interface Props {
  profile: MasterProfile;
  setProfile: React.Dispatch<React.SetStateAction<MasterProfile>>;
}

export const MasterProfileEditor: React.FC<Props> = ({ profile, setProfile }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleUpdateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleUpdateBullet = (expId: string, bulletId: string, newValue: string) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id !== expId) return exp;
        // Defensive check: ensure bullets exists
        const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];
        return {
          ...exp,
          bullets: bullets.map(b => b.id === bulletId ? { ...b, content: newValue } : b)
        };
      })
    }));
  };

  const handleAddExperience = () => {
    const newExp: ExperienceEntry = {
        id: `exp-${Date.now()}`,
        company: "",
        role: "",
        startDate: "",
        endDate: "",
        location: "",
        bullets: []
    };
    setProfile(prev => ({
        ...prev,
        experiences: [newExp, ...prev.experiences]
    }));
  };

  const handleAddBullet = (expId: string) => {
      const newBullet = {
          id: `b-${Date.now()}`,
          content: "",
          isLocked: false,
          isVisible: true
      };
      setProfile(prev => ({
          ...prev,
          experiences: prev.experiences.map(e => e.id !== expId ? e : {
              ...e,
              bullets: [...(e.bullets || []), newBullet]
          })
      }));
  };

  const handleDeleteBullet = (expId: string, bulletId: string) => {
      setProfile(prev => ({
          ...prev,
          experiences: prev.experiences.map(e => e.id !== expId ? e : {
              ...e,
              bullets: e.bullets.filter(b => b.id !== bulletId)
          })
      }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (!result) { reject("Empty file"); return; }
        const parts = result.split(',');
        const base64 = parts.length > 1 ? parts[1] : parts[0]; 
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRunImport = async () => {
    if (!importText.trim() && !selectedFile) return;
    
    setIsParsing(true);
    try {
        let parsedData: Partial<MasterProfile> = {};

        if (selectedFile) {
            const base64 = await fileToBase64(selectedFile);
            parsedData = await parseResumeFromPdf(base64);
        } else if (importText.trim()) {
            parsedData = await parseResumeFromText(importText);
        }

        if (parsedData && parsedData.experiences) {
            // Merge logic: For MVP, we simply overwrite to avoid complex diffing
            setProfile(prev => ({
                ...prev,
                ...parsedData,
                // Ensure default structure if AI missed something
                experiences: parsedData.experiences || []
            }));
            closeModal();
        }
    } catch (e) {
        alert("Failed to parse resume. Please try again.");
    } finally {
        setIsParsing(false);
    }
  };

  const closeModal = () => {
      setIsImporting(false);
      setImportText('');
      setSelectedFile(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
          setImportText(''); // Clear text if file is selected to avoid confusion
      }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20 relative">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div>
            <h2 className="text-xl font-bold text-slate-800">Master Profile</h2>
            <p className="text-xs text-slate-500">The "Source of Truth" for all your applications.</p>
        </div>
        <button 
            onClick={() => setIsImporting(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
            <DownloadCloud size={16} /> Import from Resume
        </button>
      </div>

      {/* Import Modal Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <DownloadCloud size={18} className="text-indigo-600"/> 
                        Smart Resume Import
                    </h3>
                    <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 flex-1 flex flex-col overflow-y-auto">
                    <p className="text-sm text-slate-600 mb-6">
                        Upload your existing resume (PDF) or paste the raw text. 
                        Our AI will destruct it into structured data automatically.
                    </p>

                    {/* File Upload Area */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Option A: Upload PDF</label>
                        <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-center group">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center justify-center pointer-events-none">
                                {selectedFile ? (
                                    <>
                                        <FileText size={32} className="text-indigo-600 mb-2" />
                                        <p className="text-sm font-medium text-slate-800">{selectedFile.name}</p>
                                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-slate-400 group-hover:text-slate-600 mb-2" />
                                        <p className="text-sm text-slate-600 font-medium">Click to upload PDF</p>
                                        <p className="text-xs text-slate-400">or drag and drop here</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-xs text-slate-400 font-bold uppercase">OR</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    {/* Text Paste Area */}
                    <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Option B: Paste Text</label>
                        <textarea 
                            className="w-full flex-1 border border-slate-300 rounded-lg p-4 text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[150px]"
                            placeholder="Paste text content here..."
                            value={importText}
                            onChange={(e) => {
                                setImportText(e.target.value);
                                setSelectedFile(null); // Clear file if typing text
                            }}
                        />
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={closeModal}
                        className="px-4 py-2 text-slate-600 font-medium text-sm hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleRunImport}
                        disabled={isParsing || (!importText && !selectedFile)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isParsing ? <Loader2 className="animate-spin" size={16} /> : null}
                        {isParsing ? 'Analyzing...' : 'Process & Import'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Personal Details */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-md font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 uppercase tracking-wide text-xs">Contact & Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
            <input 
              type="text" 
              value={profile.name} 
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email</label>
            <input 
              type="email" 
              value={profile.email} 
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone</label>
            <input 
              type="text" 
              value={profile.phone} 
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Location</label>
            <input 
              type="text" 
              value={profile.experiences[0]?.location || "Remote"} 
              // Note: Ideally location should be top-level in MasterProfile, using first exp location as proxy for MVP edit
              readOnly
              className="w-full p-2 border border-slate-300 rounded bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Professional Summary</label>
            <textarea 
              value={profile.summary} 
              onChange={(e) => setProfile({...profile, summary: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Experience List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Experience History</h2>
            <button 
                onClick={handleAddExperience}
                className="flex items-center gap-2 text-sm bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
            >
                <Plus size={16} /> Add Role
            </button>
        </div>
        
        {profile.experiences.map((exp) => (
          <div key={exp.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden group">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 w-full pr-8">
                <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-400" />
                    <input 
                        value={exp.role} 
                        onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                        className="bg-transparent font-bold text-slate-800 w-full focus:bg-white focus:ring-2 focus:ring-blue-200 rounded px-1 -ml-1"
                        placeholder="Role Title"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">@</span>
                    <input 
                        value={exp.company} 
                        onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className="bg-transparent font-semibold text-slate-700 w-full focus:bg-white focus:ring-2 focus:ring-blue-200 rounded px-1 -ml-1"
                        placeholder="Company Name"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar size={14} />
                    <div className="flex gap-2">
                        <input value={exp.startDate} onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)} className="bg-transparent w-20 focus:bg-white rounded px-1" placeholder="YYYY-MM" />
                        <span>-</span>
                        <input value={exp.endDate} onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)} className="bg-transparent w-20 focus:bg-white rounded px-1" placeholder="Present"/>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} />
                    <input value={exp.location} onChange={(e) => handleUpdateExperience(exp.id, 'location', e.target.value)} className="bg-transparent w-full focus:bg-white rounded px-1" placeholder="City, State" />
                </div>
              </div>
            </div>

            <div className="p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bullet Points (Context Blocks)</h4>
                <div className="space-y-3">
                    {/* Defensive check for bullets array existence */}
                    {Array.isArray(exp.bullets) && exp.bullets.map((bullet) => (
                        <div key={bullet.id} className="flex gap-3 items-start group/bullet">
                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                            <textarea
                                value={bullet.content || ''}
                                onChange={(e) => handleUpdateBullet(exp.id, bullet.id, e.target.value)}
                                className="w-full text-sm text-slate-700 bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-300 focus:bg-blue-50 rounded p-1.5 resize-none transition-all outline-none leading-relaxed"
                                rows={Math.max(2, Math.ceil((bullet.content || '').length / 100))}
                            />
                            <button 
                                onClick={() => handleDeleteBullet(exp.id, bullet.id)}
                                className="opacity-0 group-hover/bullet:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={() => handleAddBullet(exp.id)}
                        className="ml-4 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                    >
                        <Plus size={12} /> Add Bullet Point
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};