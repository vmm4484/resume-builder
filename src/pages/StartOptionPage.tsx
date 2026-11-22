import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FilePlus2,
  FolderOpen,
  Upload,
  ArrowLeft,
  Trash2,
  FileText,
  LayoutTemplate,
  Paintbrush,
  Clock,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { importResumeAnyFormat } from '../utils/resumeParser';
import type { ResumeMode } from '../types/resume';
import { useCallback, useRef, useState } from 'react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

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

export default function StartOptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as ResumeMode) || 'template';

  const { projects, createProject, loadProject, importProject, deleteProject, clearAllProjects } =
    useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExisting, setShowExisting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({ open: false, id: '', title: '' });

  const isTemplate = mode === 'template';

  const handleCreateNew = () => {
    const project = createProject(mode);
    navigate(`/editor?mode=${mode}&id=${project.id}`);
  };

  const handleOpenExisting = (id: string) => {
    loadProject(id);
    const project = projects.find((p) => p.id === id);
    if (project) {
      navigate(`/editor?mode=${project.mode}&id=${id}`);
    }
  };

  const processImportFile = useCallback(
    async (file: File) => {
      setImportError(null);
      setIsParsing(true);
      try {
        const data = await importResumeAnyFormat(file, mode);
        importProject(data);
        setIsParsing(false);
        navigate(`/editor?mode=${data.mode}&id=${data.id}`);
      } catch (err) {
        setIsParsing(false);
        setImportError(
          err instanceof Error
            ? err.message
            : 'Failed to read resume document. Please check the file format.'
        );
      }
    },
    [importProject, navigate, mode]
  );

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImportFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.json')) {
        processImportFile(file);
      } else {
        setImportError('Please drop a .json file');
      }
    },
    [processImportFile]
  );

  const handleConfirmDelete = () => {
    deleteProject(deleteModal.id);
    setDeleteModal({ open: false, id: '', title: '' });
  };

  // Show all resumes, sorted by last modified
  const allResumes = [...projects].sort(
    (a, b) => b.lastModified - a.lastModified
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Back button */}
        <button
          onClick={() => navigate('/mode-select')}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to mode selection
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isTemplate ? 'bg-indigo-100' : 'bg-purple-100'
              }`}
            >
              {isTemplate ? (
                <LayoutTemplate className="w-5 h-5 text-indigo-600" />
              ) : (
                <Paintbrush className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                {isTemplate ? 'Template Mode' : 'Canvas Mode'}
              </h1>
            </div>
          </div>
          <p className="text-gray-500 text-lg ml-[52px]">
            Start fresh or continue where you left off.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid gap-4">
          {/* Create New */}
          <button
            onClick={handleCreateNew}
            className={`group bg-white rounded-xl border-2 p-6 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center gap-5 ${
              isTemplate
                ? 'border-indigo-100 hover:border-indigo-300 focus:ring-indigo-500'
                : 'border-purple-100 hover:border-purple-300 focus:ring-purple-500'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isTemplate
                  ? 'bg-indigo-100 group-hover:bg-indigo-200'
                  : 'bg-purple-100 group-hover:bg-purple-200'
              }`}
            >
              <FilePlus2
                className={`w-6 h-6 ${
                  isTemplate ? 'text-indigo-600' : 'text-purple-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                Create New Resume
              </h3>
              <p className="text-gray-500 text-sm mt-0.5">
                Start with a blank {isTemplate ? 'template' : 'canvas'} and
                build from scratch.
              </p>
            </div>
            <svg
              className={`w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                isTemplate ? 'text-indigo-400' : 'text-purple-400'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>

          {/* Open Existing */}
          <div>
            <button
              onClick={() => setShowExisting(!showExisting)}
              className="w-full group bg-white rounded-xl border-2 border-gray-100 p-6 text-left transition-all duration-300 hover:border-gray-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center gap-5"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                <FolderOpen className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">
                  Open Existing Resume
                </h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  {allResumes.length > 0
                    ? `${allResumes.length} saved resume${allResumes.length > 1 ? 's' : ''} found`
                    : 'No saved resumes yet'}
                </p>
              </div>
              {allResumes.length > 0 && (
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    showExisting ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Existing resumes list */}
            {showExisting && allResumes.length > 0 && (
              <div className="mt-2 bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden ml-4 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 text-xs">
                  <span className="font-semibold text-gray-600">Saved Resumes</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete all saved resumes?')) {
                        clearAllProjects();
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>
                {allResumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => handleOpenExisting(resume.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors group/item"
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        resume.mode === 'template'
                          ? 'bg-indigo-50'
                          : 'bg-purple-50'
                      }`}
                    >
                      {resume.mode === 'template' ? (
                        <FileText className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Paintbrush className="w-4 h-4 text-purple-500" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {resume.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                            resume.mode === 'template'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {resume.mode === 'template' ? 'Template' : 'Canvas'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {timeAgo(resume.lastModified)}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({
                          open: true,
                          id: resume.id,
                          title: resume.title,
                        });
                      }}
                      className="opacity-0 group-hover/item:opacity-100 p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shrink-0"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </button>
                ))}
              </div>
            )}

            {showExisting && allResumes.length === 0 && (
              <div className="mt-2 ml-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  No saved resumes yet. Create a new one or import a file.
                </p>
              </div>
            )}
          </div>

          {/* Import JSON / PDF / Word */}
          <button
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            disabled={isParsing}
            className={`group bg-white rounded-xl border-2 border-dashed p-6 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center gap-5 ${
              isDragging
                ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
                : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                isParsing
                  ? 'bg-indigo-50'
                  : isDragging
                  ? 'bg-indigo-100'
                  : 'bg-gray-50 group-hover:bg-gray-100'
              }`}
            >
              {isParsing ? (
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload
                  className={`w-6 h-6 ${
                    isDragging ? 'text-indigo-500' : 'text-gray-500'
                  }`}
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <span>{isParsing ? 'Reading & Parsing Document...' : 'Import Resume (PDF, Word, or JSON)'}</span>
              </h3>
              <p className="text-gray-500 text-sm mt-0.5">
                {isParsing ? (
                  <span className="text-indigo-600 font-medium">Extracting contact info, work history, education &amp; skills...</span>
                ) : isDragging ? (
                  <span className="text-indigo-600 font-medium">
                    Drop your resume file here...
                  </span>
                ) : (
                  <>
                    Upload an existing{' '}
                    <span className="font-medium text-gray-800">.pdf</span>,{' '}
                    <span className="font-medium text-gray-800">.docx</span> (Word), or{' '}
                    <span className="font-medium text-gray-800">.json</span> file
                  </>
                )}
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.pdf,.docx,.doc"
            onChange={handleImport}
            className="hidden"
          />

          {/* Import error message */}
          {importError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 ml-4">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Import failed
                </p>
                <p className="text-sm text-red-600 mt-0.5">{importError}</p>
              </div>
              <button
                onClick={() => setImportError(null)}
                className="ml-auto text-red-400 hover:text-red-600 p-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-gray-400 text-xs mt-10">
          All resumes are stored in your browser&apos;s local storage. Clear
          browser data will remove them — use Export to back up.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: '', title: '' })}
        title="Delete Resume"
      >
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-gray-900 text-sm">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                &ldquo;{deleteModal.title}&rdquo;
              </span>
              ?
            </p>
            <p className="text-gray-500 text-sm mt-1">
              This action cannot be undone. The resume will be permanently
              removed from your browser.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteModal({ open: false, id: '', title: '' })
            }
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
