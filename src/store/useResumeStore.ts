import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ResumeProject,
  ResumeMode,
  TemplateId,
  StructuredResumeData,
  CanvasLayer,
} from '../types/resume';
import { STORAGE_KEY_PROJECTS, STORAGE_KEY_CURRENT_PROJECT } from '../utils/constants';
import { SAMPLE_STRUCTURED_DATA } from '../utils/sampleData';
import { SAMPLE_CANVAS_LAYERS } from '../utils/sampleCanvasLayers';

// Generate unique IDs
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Default empty structured data
const createDefaultStructuredData = (): StructuredResumeData => ({
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    photoUrl: undefined,
  },
  summaryHtml: '',
  experience: [],
  education: [],
  skills: [],
  customSections: [],
  sectionTitles: {
    summary: 'Professional Summary',
    skills: 'Skills & Expertise',
    experience: 'Work Experience',
    education: 'Education',
  },
  sectionOrder: ['summary', 'skills', 'experience', 'education'],
});

// Create a new blank project
const createNewProject = (
  mode: ResumeMode,
  title: string = 'Untitled Resume'
): ResumeProject => ({
  id: generateId(),
  title,
  mode,
  lastModified: Date.now(),
  templateId: mode === 'template' ? 'minimalist' : undefined,
  canvasLayers: [],
  structuredData: createDefaultStructuredData(),
});

// --- localStorage helpers with Debounced Save ---
const loadProjects = (): ResumeProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveProjectsSync = (projects: ResumeProject[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSaveProjects = (
  projects: ResumeProject[],
  onSaved?: () => void
) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveProjectsSync(projects);
    if (onSaved) onSaved();
  }, 400);
};

const loadCurrentProjectId = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_CURRENT_PROJECT);
};

const saveCurrentProjectId = (id: string | null) => {
  if (id) {
    localStorage.setItem(STORAGE_KEY_CURRENT_PROJECT, id);
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT_PROJECT);
  }
};

const MAX_HISTORY = 30;

// --- Store interface ---
interface ResumeStoreState {
  projects: ResumeProject[];
  currentProject: ResumeProject | null;
  selectedLayerId: string | null;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;

  // History state
  past: ResumeProject[];
  future: ResumeProject[];
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;

  // History actions
  undo: () => void;
  redo: () => void;

  // Project CRUD
  createProject: (mode: ResumeMode, title?: string) => ResumeProject;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  clearAllProjects: () => void;
  importProject: (project: ResumeProject) => void;
  saveProject: () => void;

  // Current project updates
  updateTitle: (title: string) => void;
  setTemplateId: (templateId: TemplateId) => void;
  updateStructuredData: (data: Partial<StructuredResumeData>) => void;
  updatePersonalInfo: (
    info: Partial<StructuredResumeData['personalInfo']>
  ) => void;
  updateSectionTitle: (
    key: 'summary' | 'experience' | 'education' | 'skills',
    title: string
  ) => void;
  moveSection: (sectionKey: string, direction: 'up' | 'down') => void;

  // Canvas layer operations
  setSelectedLayerId: (id: string | null) => void;
  setSnapToGrid: (enabled: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setGridSize: (size: number) => void;
  addLayer: (layer: Omit<CanvasLayer, 'id'>) => string;
  updateLayer: (id: string, updates: Partial<CanvasLayer>) => void;
  removeLayer: (id: string) => void;
  reorderLayers: (layers: CanvasLayer[]) => void;
  duplicateLayer: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  loadSampleCanvasLayers: () => void;

  // Persistence
  persistCurrentProject: () => void;
  loadFromStorage: () => void;
  loadSampleData: () => void;
}

export const useResumeStore = create<ResumeStoreState>()(
  subscribeWithSelector((set, get) => {
    // Helper to apply and record mutations in memory without auto-saving
    const mutateProject = (
      updater: (current: ResumeProject) => ResumeProject
    ) => {
      const state = get();
      if (!state.currentProject) return;

      // Deep copy currentProject for past history
      const snapshot: ResumeProject = JSON.parse(
        JSON.stringify(state.currentProject)
      );
      const newPast = [...state.past, snapshot].slice(-MAX_HISTORY);

      const updated = updater(state.currentProject);
      updated.lastModified = Date.now();

      const projects = state.projects.map((p) =>
        p.id === updated.id ? updated : p
      );

      set({
        currentProject: updated,
        projects,
        past: newPast,
        future: [],
        canUndo: true,
        canRedo: false,
        hasUnsavedChanges: true,
      });
    };

    return {
      projects: [],
      currentProject: null,
      selectedLayerId: null,
      snapToGrid: true,
      gridSize: 10,
      showGrid: true,

      // History
      past: [],
      future: [],
      isSaving: false,
      hasUnsavedChanges: false,
      canUndo: false,
      canRedo: false,

      saveProject: () => {
        const { currentProject, projects } = get();
        if (!currentProject) return;
        const updated = { ...currentProject, lastModified: Date.now() };
        const updatedProjects = projects.map((p) =>
          p.id === updated.id ? updated : p
        );
        saveProjectsSync(updatedProjects);
        saveCurrentProjectId(updated.id);
        set({
          currentProject: updated,
          projects: updatedProjects,
          hasUnsavedChanges: false,
          isSaving: false,
        });
      },

      clearAllProjects: () => {
        localStorage.removeItem(STORAGE_KEY_PROJECTS);
        localStorage.removeItem(STORAGE_KEY_CURRENT_PROJECT);
        set({
          projects: [],
          currentProject: null,
          past: [],
          future: [],
          canUndo: false,
          canRedo: false,
          hasUnsavedChanges: false,
        });
      },

      undo: () => {
        const { past, future, currentProject, projects } = get();
        if (past.length === 0 || !currentProject) return;

        const previousState = past[past.length - 1];
        const newPast = past.slice(0, -1);

        const currentSnapshot: ResumeProject = JSON.parse(
          JSON.stringify(currentProject)
        );
        const newFuture = [currentSnapshot, ...future].slice(0, MAX_HISTORY);

        const updatedProjects = projects.map((p) =>
          p.id === previousState.id ? previousState : p
        );

        set({
          currentProject: previousState,
          projects: updatedProjects,
          past: newPast,
          future: newFuture,
          canUndo: newPast.length > 0,
          canRedo: true,
          hasUnsavedChanges: true,
        });
      },

      redo: () => {
        const { past, future, currentProject, projects } = get();
        if (future.length === 0 || !currentProject) return;

        const nextState = future[0];
        const newFuture = future.slice(1);

        const currentSnapshot: ResumeProject = JSON.parse(
          JSON.stringify(currentProject)
        );
        const newPast = [...past, currentSnapshot].slice(-MAX_HISTORY);

        const updatedProjects = projects.map((p) =>
          p.id === nextState.id ? nextState : p
        );

        set({
          currentProject: nextState,
          projects: updatedProjects,
          past: newPast,
          future: newFuture,
          canUndo: true,
          canRedo: newFuture.length > 0,
          hasUnsavedChanges: true,
        });
      },

      setSelectedLayerId: (id) => set({ selectedLayerId: id }),
      setSnapToGrid: (enabled) => set({ snapToGrid: enabled }),
      setShowGrid: (show) => set({ showGrid: show }),
      setGridSize: (size) => set({ gridSize: size }),

      createProject: (mode, title) => {
        const project = createNewProject(mode, title);
        set((state) => {
          const updatedProjects = [...state.projects, project];
          saveProjectsSync(updatedProjects);
          saveCurrentProjectId(project.id);
          return {
            projects: updatedProjects,
            currentProject: project,
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
            selectedLayerId: null,
          };
        });
        return project;
      },

      loadProject: (id) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === id) || null;
        if (project) {
          saveCurrentProjectId(project.id);
          set({
            currentProject: project,
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
            selectedLayerId: null,
          });
        }
      },

      deleteProject: (id) => {
        set((state) => {
          const updatedProjects = state.projects.filter((p) => p.id !== id);
          saveProjectsSync(updatedProjects);
          const newCurrent =
            state.currentProject?.id === id ? null : state.currentProject;
          if (!newCurrent) saveCurrentProjectId(null);
          return {
            projects: updatedProjects,
            currentProject: newCurrent,
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
          };
        });
      },

      importProject: (project) => {
        // Deduplicate skills if any
        let cleanStructuredData = project.structuredData;
        if (cleanStructuredData && cleanStructuredData.skills) {
          const seen = new Set<string>();
          const dedupedSkills = cleanStructuredData.skills.filter((s) => {
            const k = s.name.trim().toLowerCase();
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          cleanStructuredData = { ...cleanStructuredData, skills: dedupedSkills };
        }

        const imported: ResumeProject = {
          ...project,
          structuredData: cleanStructuredData,
          id: generateId(),
          lastModified: Date.now(),
        };
        set((state) => {
          const updatedProjects = [...state.projects, imported];
          saveProjectsSync(updatedProjects);
          saveCurrentProjectId(imported.id);
          return {
            projects: updatedProjects,
            currentProject: imported,
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
            selectedLayerId: null,
          };
        });
      },

      updateTitle: (title) => {
        mutateProject((current) => ({
          ...current,
          title,
        }));
      },

      setTemplateId: (templateId) => {
        mutateProject((current) => ({
          ...current,
          templateId,
        }));
      },

      updateStructuredData: (data) => {
        let cleanData = data;
        if (data.skills) {
          const seen = new Set<string>();
          const dedupedSkills = data.skills.filter((s) => {
            const k = s.name.trim().toLowerCase();
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          cleanData = { ...data, skills: dedupedSkills };
        }
        mutateProject((current) => ({
          ...current,
          structuredData: { ...current.structuredData, ...cleanData },
        }));
      },

      updatePersonalInfo: (info) => {
        mutateProject((current) => ({
          ...current,
          structuredData: {
            ...current.structuredData,
            personalInfo: {
              ...current.structuredData.personalInfo,
              ...info,
            },
          },
        }));
      },

      updateSectionTitle: (key, title) => {
        mutateProject((current) => ({
          ...current,
          structuredData: {
            ...current.structuredData,
            sectionTitles: {
              ...current.structuredData.sectionTitles,
              [key]: title,
            },
          },
        }));
      },

      moveSection: (sectionKey, direction) => {
        mutateProject((current) => {
          const sd = current.structuredData;
          const defaultOrder = [
            'summary',
            'skills',
            'experience',
            'education',
            ...sd.customSections.map((c) => c.id),
          ];
          const currentOrder =
            sd.sectionOrder && sd.sectionOrder.length > 0
              ? [...sd.sectionOrder]
              : [...defaultOrder];

          if (!currentOrder.includes(sectionKey)) {
            currentOrder.push(sectionKey);
          }
          for (const c of sd.customSections) {
            if (!currentOrder.includes(c.id)) currentOrder.push(c.id);
          }

          const index = currentOrder.indexOf(sectionKey);
          if (index < 0) return current;

          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= currentOrder.length) return current;

          const newOrder = [...currentOrder];
          const temp = newOrder[index];
          newOrder[index] = newOrder[targetIndex];
          newOrder[targetIndex] = temp;

          return {
            ...current,
            structuredData: {
              ...current.structuredData,
              sectionOrder: newOrder,
            },
          };
        });
      },

      addLayer: (layerData) => {
        const layerId = generateId();
        mutateProject((current) => {
          const currentLayers = current.canvasLayers;
          const maxZ = currentLayers.reduce(
            (max, l) => Math.max(max, l.zIndex || 0),
            0
          );
          const layer: CanvasLayer = {
            ...layerData,
            id: layerId,
            zIndex: maxZ + 1,
          };
          return {
            ...current,
            canvasLayers: [...currentLayers, layer],
          };
        });
        set({ selectedLayerId: layerId });
        return layerId;
      },

      updateLayer: (id, updates) => {
        mutateProject((current) => ({
          ...current,
          canvasLayers: current.canvasLayers.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
      },

      removeLayer: (id) => {
        mutateProject((current) => ({
          ...current,
          canvasLayers: current.canvasLayers.filter((l) => l.id !== id),
        }));
        if (get().selectedLayerId === id) {
          set({ selectedLayerId: null });
        }
      },

      reorderLayers: (layers) => {
        mutateProject((current) => ({
          ...current,
          canvasLayers: layers,
        }));
      },

      duplicateLayer: (id) => {
        const layerToDup = get().currentProject?.canvasLayers.find(
          (l) => l.id === id
        );
        if (!layerToDup) return;

        const newId = generateId();
        mutateProject((current) => {
          const maxZ = current.canvasLayers.reduce(
            (max, l) => Math.max(max, l.zIndex || 0),
            0
          );
          const newLayer: CanvasLayer = {
            ...JSON.parse(JSON.stringify(layerToDup)),
            id: newId,
            x: layerToDup.x + 15,
            y: layerToDup.y + 15,
            zIndex: maxZ + 1,
          };
          return {
            ...current,
            canvasLayers: [...current.canvasLayers, newLayer],
          };
        });
        set({ selectedLayerId: newId });
      },

      bringForward: (id) => {
        mutateProject((current) => {
          const layers = [...current.canvasLayers].sort(
            (a, b) => a.zIndex - b.zIndex
          );
          const index = layers.findIndex((l) => l.id === id);
          if (index === -1 || index === layers.length - 1) return current;

          const currentZ = layers[index].zIndex;
          const nextZ = layers[index + 1].zIndex;
          layers[index].zIndex = nextZ;
          layers[index + 1].zIndex = currentZ;

          return {
            ...current,
            canvasLayers: layers,
          };
        });
      },

      sendBackward: (id) => {
        mutateProject((current) => {
          const layers = [...current.canvasLayers].sort(
            (a, b) => a.zIndex - b.zIndex
          );
          const index = layers.findIndex((l) => l.id === id);
          if (index <= 0) return current;

          const currentZ = layers[index].zIndex;
          const prevZ = layers[index - 1].zIndex;
          layers[index].zIndex = prevZ;
          layers[index - 1].zIndex = currentZ;

          return {
            ...current,
            canvasLayers: layers,
          };
        });
      },

      bringToFront: (id) => {
        mutateProject((current) => {
          const layers = current.canvasLayers;
          const maxZ = layers.reduce((max, l) => Math.max(max, l.zIndex || 0), 0);
          return {
            ...current,
            canvasLayers: layers.map((l) =>
              l.id === id ? { ...l, zIndex: maxZ + 1 } : l
            ),
          };
        });
      },

      sendToBack: (id) => {
        mutateProject((current) => {
          const layers = current.canvasLayers;
          const minZ = layers.reduce((min, l) => Math.min(min, l.zIndex || 0), 0);
          return {
            ...current,
            canvasLayers: layers.map((l) =>
              l.id === id ? { ...l, zIndex: Math.max(0, minZ - 1) } : l
            ),
          };
        });
      },

      loadSampleCanvasLayers: () => {
        mutateProject((current) => ({
          ...current,
          canvasLayers: JSON.parse(JSON.stringify(SAMPLE_CANVAS_LAYERS)),
        }));
        set({ selectedLayerId: null });
      },

      loadSampleData: () => {
        mutateProject((current) => ({
          ...current,
          structuredData: JSON.parse(JSON.stringify(SAMPLE_STRUCTURED_DATA)),
        }));
      },

      persistCurrentProject: () => {
        const { currentProject, projects } = get();
        if (currentProject) {
          saveProjectsSync(projects);
          saveCurrentProjectId(currentProject.id);
        }
      },

      loadFromStorage: () => {
        const projects = loadProjects();
        const currentId = loadCurrentProjectId();
        const currentProject =
          projects.find((p) => p.id === currentId) || null;
        set({
          projects,
          currentProject,
          past: [],
          future: [],
          canUndo: false,
          canRedo: false,
          selectedLayerId: null,
        });
      },
    };
  })
);

// Window beforeunload immediate write safeguard
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const { projects, currentProject } = useResumeStore.getState();
    if (projects.length > 0) {
      saveProjectsSync(projects);
      if (currentProject) {
        saveCurrentProjectId(currentProject.id);
      }
    }
  });
}
