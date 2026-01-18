import React from 'react';
import { PYTHON_BACKEND_SCRIPT } from '../types';
import { FileCode, Copy, Check } from 'lucide-react';

export const BackendSpec: React.FC = () => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(PYTHON_BACKEND_SCRIPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto pb-20">
            <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-slate-700">
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <FileCode className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-slate-100 font-bold text-sm">backend_prototype.py</h2>
                            <p className="text-slate-400 text-xs">SQLAlchemy Models & WeasyPrint Generation Logic</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors border border-slate-600"
                    >
                        {copied ? <Check size={14} className="text-emerald-400"/> : <Copy size={14} />}
                        {copied ? 'Copied to Clipboard' : 'Copy Script'}
                    </button>
                </div>
                <div className="p-0 overflow-x-auto">
                    <pre className="text-xs md:text-sm font-mono text-slate-300 leading-relaxed p-6">
                        {PYTHON_BACKEND_SCRIPT}
                    </pre>
                </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2">Data Model Strategy</h3>
                    <p className="text-sm text-slate-600">
                        The <code>MasterEntry</code> uses a One-to-Many relationship with <code>BulletPoint</code>. 
                        This ensures context retention. When a JD is matched, we filter the children (bullets) without 
                        losing the parent (role) context.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2">PDF Generation</h3>
                    <p className="text-sm text-slate-600">
                        We use <strong>WeasyPrint</strong> instead of ReportLab. This allows us to maintain a purely 
                        HTML/CSS template system (Jinja2) which is far easier to style and maintain than programmatic 
                        PDF drawing commands.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-2">Snapshotting</h3>
                    <p className="text-sm text-slate-600">
                        The <code>ResumeSnapshot</code> table stores a JSON dump of the <em>exact</em> data used for a specific job application.
                        This prevents "history drift" if you edit your master profile later.
                    </p>
                </div>
            </div>
        </div>
    );
};