export type ResumeMode = 'template' | 'canvas';

export interface CanvasLayer {
  id: string;
  page?: number;
  type: 'text' | 'heading' | 'image' | 'divider' | 'container';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  htmlContent: string;
  locked: boolean;
  visible: boolean;
  style: {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
    letterSpacing?: string;
    padding?: number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
    opacity?: number;
  };
}

export interface StructuredExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  descriptionHtml: string;
}

export interface StructuredEducation {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  descriptionHtml: string;
}

export interface SectionTitles {
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
}

export interface SectionFontSizes {
  [key: string]: number | undefined;
}

export interface StructuredResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    photoUrl?: string;
  };
  summaryHtml: string;
  experience: StructuredExperience[];
  education: StructuredEducation[];
  skills: { id: string; name: string; level?: string }[];
  customSections: { id: string; title: string; contentHtml: string }[];
  sectionTitles?: SectionTitles;
  sectionOrder?: string[];
  sectionFontSizes?: SectionFontSizes;
  fontFamily?: string;
}

export type TemplateId =
  | 'traditional'
  | 'navy'
  | 'modern'
  | 'minimalist'
  | 'executive'
  | 'technical'
  | 'creative'
  | 'classic';

export interface ResumeProject {
  id: string;
  title: string;
  mode: ResumeMode;
  lastModified: number;
  templateId?: TemplateId;
  canvasLayers: CanvasLayer[];
  structuredData: StructuredResumeData;
}
