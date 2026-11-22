import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  LayoutTemplate,
  Crown,
  Sparkles,
  Undo2,
  Redo2,
  FolderInput,
  FolderOutput,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Check,
  ChevronDown,
  Terminal,
  Palette,
  BookOpen,
  Columns2,
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore';
import { exportProjectAsJson } from '../utils/exportJson';
import { importResumeAnyFormat } from '../utils/resumeParser';
import { triggerPdfPrint } from '../utils/pdfPrint';
import { paginateResumeData, type PaginatedResumePage } from '../utils/pagination';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '../utils/constants';
import type { ResumeMode, TemplateId } from '../types/resume';
import FormEditor from '../components/template/FormEditor';
import ModernTemplate from '../components/template/templates/ModernTemplate';
import MinimalistTemplate from '../components/template/templates/MinimalistTemplate';
import ExecutiveTemplate from '../components/template/templates/ExecutiveTemplate';
import TechnicalTemplate from '../components/template/templates/TechnicalTemplate';
import CreativeTemplate from '../components/template/templates/CreativeTemplate';
import ClassicTemplate from '../components/template/templates/ClassicTemplate';
import ZoomControls from '../components/common/ZoomControls';
import Modal from '../components/ui/Modal';
import Artboard from '../components/canvas/Artboard';
import LayersPanel from '../components/canvas/LayersPanel';
import CanvasAddElements from '../components/toolbar/CanvasAddElements';
import FormatToolbar from '../components/toolbar/FormatToolbar';

const LAYOUT_OPTIONS: {
  id: TemplateId;
  label: string;
  tag: string;
  desc: string;
  icon: React.ReactNode;
  bgPreview: string;
}[] = [
  {
    id: 'minimalist',
    label: 'Minimalist Clean',
    tag: 'ATS Friendly',
    desc: 'Refined single-column layout with centered header and generous whitespace.',
    icon: <LayoutTemplate className="w-4 h-4 text-emerald-600" />,
    bgPreview: 'from-gray-100 to-slate-200',
  },
  {
    id: 'modern',
    label: 'Modern Sidebar',
    tag: 'Popular',
    desc: 'Two-column layout with a stylish slate sidebar for contact and skills.',
    icon: <Columns2 className="w-4 h-4 text-indigo-600" />,
    bgPreview: 'from-slate-800 to-indigo-900',
  },
  {
    id: 'executive',
    label: 'Executive Corporate',
    tag: 'Leadership',
    desc: 'Distinguished serif typography with bold rules and formal hierarchy.',
    icon: <Crown className="w-4 h-4 text-amber-600" />,
    bgPreview: 'from-amber-900 to-stone-900',
  },
  {
    id: 'technical',
    label: 'Technical / Developer',
    tag: 'Best for Tech',
    desc: 'Dense, high-information layout with inline skill tags and project bullet points.',
    icon: <Terminal className="w-4 h-4 text-cyan-600" />,
    bgPreview: 'from-slate-900 to-cyan-950',
  },
  {
    id: 'creative',
    label: 'Creative Accent',
    tag: 'Vibrant',
    desc: 'Bold gradient header banner with modern pill badges and crisp card sections.',
    icon: <Palette className="w-4 h-4 text-violet-600" />,
    bgPreview: 'from-violet-600 to-indigo-600',
  },
  {
    id: 'classic',
    label: 'Classic Academic',
    tag: 'Timeless',
    desc: 'Traditional clean academic and business format with subtle border dividers.',
    icon: <BookOpen className="w-4 h-4 text-stone-600" />,
    bgPreview: 'from-stone-200 to-neutral-300',
  },
];

export default function EditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as ResumeMode) || 'template';
  const projectId = searchParams.get('id');

  const {
    currentProject,
    loadProject,
    loadFromStorage,
    updateTitle,
    setTemplateId,
    loadSampleData,
    importProject,
    undo,
    redo,
    canUndo,
    canRedo,
    hasUnsavedChanges,
    saveProject,
  } = useResumeStore();

  const [zoom, setZoom] = useState<number>(1.0);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [activePage, setActivePage] = useState<number>(1);
  const [pageViewMode, setPageViewMode] = useState<'single' | 'all'>('all');
  const [manualPageCount, setManualPageCount] = useState<number | undefined>(undefined);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const previewSheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState<number>(A4_HEIGHT_PX);

  // Auto-track the continuous preview sheet height for smooth scaled layout
  useEffect(() => {
    const el = previewSheetRef.current;
    if (!el) return;
    const updateHeight = () => {
      if (el) {
        setSheetHeight(el.scrollHeight || el.offsetHeight || A4_HEIGHT_PX);
      }
    };
    updateHeight();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) {
          setSheetHeight(entry.contentRect.height);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [currentProject?.structuredData, currentProject?.templateId]);

  const estimatedA4Pages = Math.max(1, Math.ceil((sheetHeight - 10) / A4_HEIGHT_PX));

  // Load project on mount
  useEffect(() => {
    loadFromStorage();
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject, loadFromStorage]);

  // Fit to screen width helper when requested
  const handleFitWidth = useCallback(() => {
    if (!previewContainerRef.current) return;
    const containerWidth = previewContainerRef.current.clientWidth - 80;
    if (containerWidth > 0) {
      const calculatedZoom = Math.min(1.2, Math.max(0.4, containerWidth / A4_WIDTH_PX));
      setZoom(Math.round(calculatedZoom * 100) / 100);
    }
  }, []);

  // Global Keyboard shortcuts for Undo (Ctrl+Z), Redo (Ctrl+Y), Save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('.tiptap') ||
          target.closest('[contenteditable="true"]'));

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveProject();
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
        return;
      }

      if (isEditing) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveProject]);

  // Export project as JSON
  const handleExportJson = () => {
    if (!currentProject) return;
    exportProjectAsJson(currentProject);
  };

  // Import JSON / PDF / Word project inside editor
  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const data = await importResumeAnyFormat(file, mode);
      importProject(data);
      setIsImporting(false);
      navigate(`/editor?mode=${data.mode}&id=${data.id}`);
    } catch (err) {
      setIsImporting(false);
      alert(err instanceof Error ? err.message : 'Failed to import resume document.');
    }
    e.target.value = '';
  };

  // Direct Vector PDF Download & Print (100% Vector, Pixel-Perfect, ATS-Friendly)
  const handleExecutePrint = () => {
    if (!currentProject) return;
    triggerPdfPrint(currentProject.title, () => {
      useResumeStore.getState().setSelectedLayerId(null);
    });
  };

  const handleDownloadPdf = () => {
    handleExecutePrint();
  };

  // Manual save handler
  const handleManualSave = () => {
    saveProject();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  const activeTemplateId: TemplateId = currentProject.templateId || 'minimalist';
  const currentLayoutInfo =
    LAYOUT_OPTIONS.find((l) => l.id === activeTemplateId) || LAYOUT_OPTIONS[0];

  // Compute pagination
  const paginatedPages = paginateResumeData(
    currentProject.structuredData,
    manualPageCount
  );
  const totalTemplatePages = paginatedPages.length;

  const canvasMaxPage = currentProject.canvasLayers.reduce(
    (max, l) => Math.max(max, l.page || 1),
    1
  );
  const totalCanvasPages = manualPageCount || Math.max(1, canvasMaxPage);
  const totalPages = mode === 'template' ? totalTemplatePages : totalCanvasPages;

  // Page switching helper
  const handleGoToPage = (targetPage: number) => {
    const validPage = Math.max(1, Math.min(totalPages, targetPage));
    setActivePage(validPage);
    if (pageViewMode === 'all') {
      const scrollPos = (validPage - 1) * (A4_HEIGHT_PX * zoom + 36);
      previewContainerRef.current?.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  };

  // Pages to render in template mode
  const templatePagesToRender =
    pageViewMode === 'all'
      ? paginatedPages
      : paginatedPages.filter((p) => p.pageNumber === activePage);

  // Render active template with page data
  const renderTemplate = (pageData?: PaginatedResumePage) => {
    const data = currentProject.structuredData;
    switch (activeTemplateId) {
      case 'minimalist':
        return <MinimalistTemplate data={data} pageData={pageData} />;
      case 'executive':
        return <ExecutiveTemplate data={data} pageData={pageData} />;
      case 'technical':
        return <TechnicalTemplate data={data} pageData={pageData} />;
      case 'creative':
        return <CreativeTemplate data={data} pageData={pageData} />;
      case 'classic':
        return <ClassicTemplate data={data} pageData={pageData} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} pageData={pageData} />;
    }
  };

  return (
    <>
      {/* ========= 1. ON-SCREEN INTERACTIVE UI (COMPLETELY REMOVED ON PRINT) ========= */}
      <div className="no-print h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* ========= TOP MAIN TOOLBAR (NO PRINT) ========= */}
      <header className="no-print bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mode-select')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            title="Back to Home Screen"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={currentProject.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-500 w-44 hover:bg-gray-50 focus:bg-white px-2 py-1 rounded transition-colors"
              placeholder="Resume title"
            />
          </div>

          {/* Undo / Redo buttons */}
          <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============ CHOOSE LAYOUT BUTTON (POPUPS ON CLICK) ============ */}
        {mode === 'template' && (
          <button
            type="button"
            onClick={() => setShowLayoutModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/80 shadow-xs transition-all active:scale-95"
            title="Click to view and switch resume layouts"
          >
            {currentLayoutInfo.icon}
            <span>Layout: {currentLayoutInfo.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Quick Sample Data loader */}
          {mode === 'template' && (
            <button
              onClick={loadSampleData}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              title="Fill with professional sample data"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Sample Data</span>
            </button>
          )}

          {/* ============ MANUAL SAVE BUTTON ============ */}
          <button
            onClick={handleManualSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-xs ${
              hasUnsavedChanges
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
            title="Save changes to your browser storage (Ctrl+S)"
          >
            {showSavedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved!</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save *</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            )}
          </button>

          <div className="h-5 w-px bg-gray-200 mx-1" />

          {/* Import JSON / PDF / Word */}
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
            title="Import from .pdf, .docx, or .json file"
          >
            {isImporting ? (
              <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FolderInput className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span className="hidden sm:inline">{isImporting ? 'Parsing...' : 'Import'}</span>
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json,.pdf,.docx,.doc"
            onChange={handleImportJsonFile}
            className="hidden"
          />

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white"
            title="Export project as .json"
          >
            <FolderOutput className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Download PDF (Direct 1-Click Vector PDF, 100% ATS-Friendly) */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm active:bg-indigo-800 cursor-pointer"
            title="Download vector ATS-friendly PDF directly"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* ========= MODE 1: STRUCTURED TEMPLATE MODE ========= */}
      {mode === 'template' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Form Editor (NO PRINT) */}
          <div className="no-print w-[500px] shrink-0 border-r border-gray-200 bg-gray-50 overflow-hidden flex flex-col shadow-sm z-10">
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Resume Content
                </h2>
                <p className="text-xs text-gray-500">
                  Structured fields update live in the A4 sheet
                </p>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <FormEditor />
            </div>
          </div>

          {/* Right: A4 Live Preview Viewport */}
          <div
            ref={previewContainerRef}
            className="flex-1 overflow-auto bg-slate-200/80 relative flex flex-col items-center p-8"
          >
            {/* Floating Zoom Controls (NO PRINT) */}
            <div className="no-print fixed bottom-6 right-6 z-30">
              <ZoomControls
                zoom={zoom}
                onZoomChange={setZoom}
                onFitWidth={handleFitWidth}
              />
            </div>

            {/* ============ STATUS & DOCUMENT INFO (NO PRINT) ============ */}
            <div className="no-print sticky top-0 z-20 mb-6 flex items-center justify-between w-full max-w-[794px] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-gray-200/90 shadow-md">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  Continuous Document
                </span>
                <span className="text-xs text-gray-300 font-light">•</span>
                <span className="text-xs text-gray-500">
                  Expands naturally with zero gaps
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                  ~{estimatedA4Pages} A4 {estimatedA4Pages === 1 ? 'Page' : 'Pages'} on Download
                </span>
              </div>
            </div>

            {/* Screen Preview (Continuous Single Sheet, expands with content) */}
            <div className="no-print flex flex-col items-center pb-20">
              <div
                style={{
                  width: `${A4_WIDTH_PX * zoom}px`,
                  height: `${Math.max(A4_HEIGHT_PX, sheetHeight) * zoom}px`,
                  transition: 'width 0.15s ease-out',
                }}
                className="shrink-0 relative"
              >
                {/* Continuous Expanding Sheet */}
                <div
                  ref={previewSheetRef}
                  id="resume-continuous-preview"
                  className="bg-white shadow-2xl origin-top-left border border-gray-300 relative"
                  style={{
                    width: `${A4_WIDTH_PX}px`,
                    minHeight: `${A4_HEIGHT_PX}px`,
                    height: 'auto',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {renderTemplate()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========= MODE 2: FREEFORM CANVAS MODE ========= */}
      {mode === 'canvas' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas Elements Toolbar (NO PRINT) */}
          <div className="no-print">
            <CanvasAddElements />
          </div>

          {/* Canvas Work Area: Viewport + Layers Panel */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Floating Rich Text Format Toolbar */}
            <div className="no-print absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
              <FormatToolbar />
            </div>

            {/* Scrollable Canvas Viewport */}
            <div
              ref={previewContainerRef}
              className="flex-1 overflow-auto bg-slate-200/90 relative flex flex-col items-center p-8 pt-16"
            >
              {/* Floating Zoom Controls (NO PRINT) */}
              <div className="no-print fixed bottom-6 right-86 z-30">
                <ZoomControls
                  zoom={zoom}
                  onZoomChange={setZoom}
                  onFitWidth={handleFitWidth}
                />
              </div>

              {/* Page Navigation & Controls (NO PRINT) */}
              <div className="no-print sticky top-0 z-20 mb-6 flex items-center justify-between w-full max-w-[794px] bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200/90 shadow-md">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGoToPage(activePage - 1)}
                    disabled={activePage <= 1}
                    className="p-1.5 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalCanvasPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleGoToPage(p)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          activePage === p
                            ? 'bg-indigo-600 text-white shadow-xs scale-105'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Page {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoToPage(activePage + 1)}
                    disabled={activePage >= totalCanvasPages}
                    className="p-1.5 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <span className="text-xs text-gray-400 font-medium ml-1">
                    ({totalCanvasPages} {totalCanvasPages === 1 ? 'Page' : 'Pages'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageViewMode((m) => (m === 'all' ? 'single' : 'all'))}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                      pageViewMode === 'single'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Toggle view"
                  >
                    {pageViewMode === 'single' ? 'View: Single Page' : 'View: Stacked'}
                  </button>

                  {totalCanvasPages < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = (manualPageCount || totalCanvasPages) + 1;
                        setManualPageCount(next);
                        handleGoToPage(next);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors"
                      title="Add a new page to the canvas"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Page</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Artboard (794px x 1123px) */}
              <Artboard scale={zoom} activePage={activePage} viewMode={pageViewMode} />
            </div>

            {/* Right: Layers Panel (NO PRINT) */}
            <div className="no-print h-full">
              <LayersPanel />
            </div>
          </div>
        </div>
      )}

      {/* ============ CHOOSE LAYOUT POPUP MODAL ============ */}
      <Modal
        open={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
        title="Choose Resume Layout"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Select a designer layout to reformat your resume instantly. Your content and custom sections will automatically adapt.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
            {LAYOUT_OPTIONS.map((layout) => {
              const isSelected = activeTemplateId === layout.id;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => {
                    setTemplateId(layout.id);
                    setShowLayoutModal(false);
                  }}
                  className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all relative group ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                      {layout.tag}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Banner */}
                  <div
                    className={`h-16 rounded-lg bg-gradient-to-r ${layout.bgPreview} mb-2.5 flex items-center justify-center text-white/90 shadow-xs`}
                  >
                    {layout.icon}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {layout.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {layout.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>

    {/* ======================================================== */}
    {/* 2. DEDICATED VECTOR PRINT ENGINE (PRINT ONLY)            */}
    {/* Clean isolated root: zero ancestors with scroll/overflow */}
    {/* ======================================================== */}
    <div id="print-root" className="hidden print:block">
      {mode === 'template' ? (
        <table className="resume-print-table bg-white">
          <thead className="resume-print-thead">
            <tr>
              {activeTemplateId === 'modern' ? (
                <>
                  <th
                    style={{
                      width: '32%',
                      backgroundColor: '#1e293b',
                      height: '12mm',
                      padding: 0,
                      margin: 0,
                      border: 'none',
                    }}
                  />
                  <th
                    style={{
                      width: '68%',
                      backgroundColor: '#ffffff',
                      height: '12mm',
                      padding: 0,
                      margin: 0,
                      border: 'none',
                    }}
                  />
                </>
              ) : (
                <th
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    height: '12mm',
                    padding: 0,
                    margin: 0,
                    border: 'none',
                  }}
                />
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={activeTemplateId === 'modern' ? 2 : 1}
                style={{ padding: 0, margin: 0, border: 'none', verticalAlign: 'top' }}
              >
                <div id="resume-continuous-print" className="resume-continuous-sheet bg-white">
                  {renderTemplate()}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        /* Canvas mode print sheets (100% Vector, Pixel-Perfect Absolute Positioning) */
        Array.from({ length: totalCanvasPages }, (_, i) => i + 1).map((pageNum) => {
          const pageLayers = currentProject.canvasLayers.filter(
            (l) => (l.page || 1) === pageNum
          );
          return (
            <div
              key={`print-artboard-${pageNum}`}
              className="resume-page-sheet bg-white relative overflow-hidden"
              style={{
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
              }}
            >
              {pageLayers
                .filter((layer) => layer.visible)
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((layer) => {
                  const s = layer.style || {};
                  return (
                    <div
                      key={layer.id}
                      style={{
                        position: 'absolute',
                        left: `${layer.x}px`,
                        top: `${layer.y}px`,
                        width: `${layer.width}px`,
                        height: `${layer.height}px`,
                        zIndex: layer.zIndex,
                        boxSizing: 'border-box',
                        backgroundColor: s.backgroundColor || 'transparent',
                        color: s.color || '#1e293b',
                        fontFamily: s.fontFamily || 'inherit',
                        fontSize: s.fontSize || (layer.type === 'heading' ? '20px' : '12px'),
                        textAlign: (s.textAlign as React.CSSProperties['textAlign']) || 'left',
                        lineHeight: s.lineHeight || 1.5,
                        letterSpacing: s.letterSpacing || 'normal',
                        padding: `${s.padding || 0}px`,
                        borderWidth: `${s.borderWidth || 0}px`,
                        borderColor: s.borderColor || 'transparent',
                        borderStyle: (s.borderWidth || 0) > 0 ? 'solid' : 'none',
                        borderRadius: `${s.borderRadius || 0}px`,
                        opacity: s.opacity ?? 1,
                        overflow: 'hidden',
                      }}
                    >
                      {layer.type === 'container' && (
                        <div style={{ width: '100%', height: '100%' }} />
                      )}

                      {layer.type === 'divider' && (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: s.backgroundColor || s.borderColor || '#cbd5e1',
                          }}
                        />
                      )}

                      {layer.type === 'image' && layer.htmlContent && (
                        <img
                          src={layer.htmlContent}
                          alt=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}

                      {(layer.type === 'text' || layer.type === 'heading') && (
                        <div
                          className="w-full h-full outline-none break-words rich-text-content"
                          style={{ width: '100%', height: '100%' }}
                          dangerouslySetInnerHTML={{ __html: layer.htmlContent }}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          );
        })
      )}
    </div>
  </>
  );
}
