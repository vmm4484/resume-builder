import { useNavigate } from 'react-router-dom';
import {
  LayoutTemplate,
  Paintbrush,
  Shield,
  Wifi,
  HardDrive,
  Clock,
  ArrowRight,
  Trash2,
  FileText,
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';

/** Human-friendly relative time */
function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ModeSelectPage() {
  const navigate = useNavigate();
  const { projects, clearAllProjects, loadProject } = useResumeStore();

  // Get last 2 editing resumes
  const recentProjects = [...projects]
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, 2);

  const handleOpenResume = (id: string, mode: string) => {
    loadProject(id);
    navigate(`/editor?mode=${mode}&id=${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Logo / Brand */}
            <div className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                ResumeBuilder
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
              Build your resume{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                your way
              </span>
            </h1>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Choose your editing style below or jump back into your recent work.
            </p>
          </div>

          {/* ============ RECENT RESUMES SECTION (LAST 2 RESUMES) ============ */}
          {recentProjects.length > 0 && (
            <div className="mb-10 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Recent Resumes ({recentProjects.length})
                  </h2>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all stored resumes?')) {
                      clearAllProjects();
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors border border-rose-200"
                  title="Clear all stored resumes"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                {recentProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {proj.title || 'Untitled Resume'}
                        </h3>
                        <p className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="capitalize font-medium text-indigo-600">
                            {proj.mode === 'template' ? 'Pre-built Layout' : 'Canvas Artboard'}
                          </span>
                          <span>&bull;</span>
                          <span>Edited {timeAgo(proj.lastModified)}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenResume(proj.id, proj.mode)}
                      className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg shrink-0 transition-colors shadow-xs group-hover:scale-105 active:scale-95"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Template Mode Card */}
            <button
              onClick={() => navigate('/start-option?mode=template')}
              className="group relative bg-white rounded-2xl border-2 border-gray-100 p-8 text-left transition-all duration-300 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                {/* Mini preview illustration */}
                <div className="mb-6 relative">
                  <div className="w-full h-36 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-100 p-3 flex gap-2 overflow-hidden">
                    {/* Left form mockup */}
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 bg-indigo-200/60 rounded w-3/4" />
                      <div className="h-2 bg-indigo-200/40 rounded w-full" />
                      <div className="h-2 bg-indigo-200/40 rounded w-5/6" />
                      <div className="h-6 bg-indigo-200/30 rounded w-full mt-2" />
                      <div className="h-6 bg-indigo-200/30 rounded w-full" />
                      <div className="h-6 bg-indigo-200/30 rounded w-3/4" />
                    </div>
                    {/* Right preview mockup */}
                    <div className="w-20 bg-white rounded-lg border border-indigo-100 shadow-sm p-2 space-y-1.5">
                      <div className="h-1.5 bg-indigo-300/50 rounded w-3/4 mx-auto" />
                      <div className="h-1 bg-gray-200 rounded w-full" />
                      <div className="h-1 bg-gray-200 rounded w-5/6" />
                      <div className="h-px bg-indigo-200 my-1" />
                      <div className="h-1 bg-gray-200 rounded w-full" />
                      <div className="h-1 bg-gray-200 rounded w-4/5" />
                      <div className="h-1 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <LayoutTemplate className="w-5.5 h-5.5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Pre-built Resume Layout
                    </h2>
                    <p className="text-xs text-indigo-600 font-medium">
                      6 Designer Layouts (Modern, Technical, Executive &amp; more)
                    </p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Fill in structured form fields on the left and watch your ATS-friendly resume format itself live on the right.
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                  Create with Layouts &rarr;
                </span>
              </div>
            </button>

            {/* Canvas Mode Card */}
            <button
              onClick={() => navigate('/start-option?mode=canvas')}
              className="group relative bg-white rounded-2xl border-2 border-gray-100 p-8 text-left transition-all duration-300 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                {/* Mini preview illustration */}
                <div className="mb-6 relative">
                  <div className="w-full h-36 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-100 p-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#c084fc_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
                    <div className="absolute top-4 left-6 w-32 h-6 bg-white rounded border border-purple-200 shadow-sm flex items-center px-2">
                      <div className="h-2 bg-purple-400/60 rounded w-3/4" />
                    </div>
                    <div className="absolute top-14 left-6 w-20 h-4 bg-white rounded border border-purple-200 shadow-sm flex items-center px-2">
                      <div className="h-1.5 bg-purple-300/60 rounded w-full" />
                    </div>
                    <div className="absolute top-8 right-6 w-28 h-20 bg-white rounded-lg border-2 border-dashed border-purple-300 p-2 space-y-1.5">
                      <div className="h-1.5 bg-purple-200 rounded w-full" />
                      <div className="h-1.5 bg-purple-200 rounded w-4/5" />
                      <div className="h-1.5 bg-purple-200 rounded w-3/5" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Paintbrush className="w-5.5 h-5.5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Freeform Canvas Artboard
                    </h2>
                    <p className="text-xs text-purple-600 font-medium">
                      Design freedom like Figma &amp; Canva
                    </p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Drag, drop, resize, and freely position headings, text boxes, and dividers anywhere on the A4 artboard.
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 group-hover:text-purple-700 transition-colors">
                  Open Freeform Canvas &rarr;
                </span>
              </div>
            </button>
          </div>

          {/* Value props footer */}
          <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-gray-200/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">100% Client-Side Privacy</p>
                <p className="text-xs text-gray-500">Your data never leaves your browser</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Zero Backend / Offline</p>
                <p className="text-xs text-gray-500">Fully functional without internet</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <HardDrive className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Explicit Local Control</p>
                <p className="text-xs text-gray-500">Save manually whenever you choose</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
