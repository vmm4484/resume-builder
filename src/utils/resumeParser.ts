import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import type {
  StructuredResumeData,
  StructuredExperience,
  StructuredEducation,
  CanvasLayer,
  ResumeProject,
  ResumeMode,
} from '../types/resume';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const genId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface TextItemWithCoords {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Spatial text extraction from PDF.
 * Reconstructs natural reading order by sorting items top-to-bottom and left-to-right,
 * and handles multi-column layouts (like sidebars / dual-column resumes).
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  let fullDocumentText = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const textContent = await page.getTextContent();
    const pageWidth = viewport.width;

    const items: TextItemWithCoords[] = [];

    for (const item of textContent.items as any[]) {
      if (!item.str || item.str.trim() === '') continue;
      items.push({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || 0,
        height: Math.abs(item.transform[0]) || item.height || 10,
      });
    }

    if (items.length === 0) continue;

    // Check if the page has a 2-column layout
    // A 2-column layout typically has items on the left (x < 48% width) and right (x > 50% width)
    // with overlapping Y ranges below the header.
    const leftColItems = items.filter((it) => it.x < pageWidth * 0.46);
    const rightColItems = items.filter((it) => it.x >= pageWidth * 0.46);

    // If both columns have significant content, treat as multi-column
    const isMultiColumn =
      leftColItems.length > 5 &&
      rightColItems.length > 5 &&
      leftColItems.length / items.length > 0.2 &&
      rightColItems.length / items.length > 0.2;

    if (isMultiColumn) {
      // Find top header items that span across or sit above the split
      // Find the highest Y in left and right column to determine where columns begin
      const leftMaxY = Math.max(...leftColItems.map((i) => i.y));
      const rightMaxY = Math.max(...rightColItems.map((i) => i.y));
      const columnStartY = Math.min(leftMaxY, rightMaxY) + 15;

      const headerItems = items.filter((it) => it.y >= columnStartY);
      const col1Items = items.filter((it) => it.y < columnStartY && it.x < pageWidth * 0.46);
      const col2Items = items.filter((it) => it.y < columnStartY && it.x >= pageWidth * 0.46);

      const headerText = clusterAndOrderLines(headerItems);
      const col1Text = clusterAndOrderLines(col1Items);
      const col2Text = clusterAndOrderLines(col2Items);

      fullDocumentText += `${headerText}\n\n${col1Text}\n\n${col2Text}\n\n`;
    } else {
      // Single-column: sort top-to-bottom, left-to-right
      const pageText = clusterAndOrderLines(items);
      fullDocumentText += `${pageText}\n\n`;
    }
  }

  return fullDocumentText.trim();
}

/**
 * Clusters text items into visual lines based on Y coordinate,
 * sorts lines top-to-bottom, and sorts items within a line left-to-right.
 */
function clusterAndOrderLines(items: TextItemWithCoords[]): string {
  if (items.length === 0) return '';

  // Sort by Y descending (top of page has highest Y in PDF coordinates)
  const sortedByY = [...items].sort((a, b) => b.y - a.y);

  const lines: TextItemWithCoords[][] = [];
  let currentLine: TextItemWithCoords[] = [sortedByY[0]];
  let currentY = sortedByY[0].y;

  for (let i = 1; i < sortedByY.length; i++) {
    const item = sortedByY[i];
    // If Y is within ~4 points of current line, consider it on the same line
    if (Math.abs(item.y - currentY) <= 4.5) {
      currentLine.push(item);
    } else {
      // Sort current line left-to-right
      currentLine.sort((a, b) => a.x - b.x);
      lines.push(currentLine);
      currentLine = [item];
      currentY = item.y;
    }
  }

  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.x - b.x);
    lines.push(currentLine);
  }

  // Combine items on each line with appropriate spacing
  return lines
    .map((lineItems) => {
      let lineStr = lineItems[0].str;
      for (let j = 1; j < lineItems.length; j++) {
        const prev = lineItems[j - 1];
        const curr = lineItems[j];
        // If distance between prev and curr is greater than 2px, add space
        const gap = curr.x - (prev.x + prev.width);
        if (gap > 1.5 && !lineStr.endsWith(' ') && !curr.str.startsWith(' ')) {
          lineStr += ' ';
        }
        lineStr += curr.str;
      }
      return lineStr.trim();
    })
    .filter((l) => l.length > 0)
    .join('\n');
}

/**
 * Extract text and HTML from a Word .docx file using mammoth.
 */
export async function extractFromDocx(file: File): Promise<{ text: string; html: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });

  return {
    text: rawTextResult.value.trim(),
    html: htmlResult.value.trim(),
  };
}

// Known common resume section keywords
const KNOWN_SECTIONS = [
  'professional summary',
  'summary',
  'profile',
  'about me',
  'career objective',
  'objective',
  'work history',
  'work experience',
  'experience',
  'employment history',
  'professional experience',
  'projects',
  'personal projects',
  'academic projects',
  'education',
  'academic background',
  'academic history',
  'qualifications',
  'skills',
  'technical skills',
  'core competencies',
  'key skills',
  'skills & expertise',
  'technologies',
  'certificates',
  'certifications',
  'licenses',
  'languages',
  'soft skills',
  'awards',
  'honors',
];

function isSectionHeader(line: string): { isHeader: boolean; key: string } {
  const clean = line
    .toLowerCase()
    .replace(/[^a-z\s&]/g, '')
    .trim();

  // If line matches a known section keyword directly
  const match = KNOWN_SECTIONS.find(
    (sec) => clean === sec || clean === `${sec}s` || clean.startsWith(`${sec}:`)
  );

  if (match) {
    if (match.includes('summary') || match.includes('profile') || match.includes('about') || match.includes('objective')) {
      return { isHeader: true, key: 'summary' };
    }
    if (match.includes('experience') || match.includes('work') || match.includes('employment')) {
      return { isHeader: true, key: 'experience' };
    }
    if (match.includes('project')) {
      return { isHeader: true, key: 'projects' };
    }
    if (match.includes('education') || match.includes('academic') || match.includes('qualification')) {
      return { isHeader: true, key: 'education' };
    }
    if (match.includes('skills') && !match.includes('soft')) {
      return { isHeader: true, key: 'skills' };
    }
    if (match.includes('soft skill')) {
      return { isHeader: true, key: 'soft_skills' };
    }
    if (match.includes('certificate') || match.includes('certification') || match.includes('license')) {
      return { isHeader: true, key: 'certificates' };
    }
    if (match.includes('language')) {
      return { isHeader: true, key: 'languages' };
    }
    return { isHeader: true, key: 'custom' };
  }

  return { isHeader: false, key: '' };
}

/**
 * Intelligent Heuristic Resume Parser that extracts structured fields from raw text.
 */
export function parseResumeTextToStructured(rawText: string): StructuredResumeData {
  const allLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const data: StructuredResumeData = {
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
    },
    summaryHtml: '',
    experience: [],
    education: [],
    skills: [],
    customSections: [],
  };

  // ================= 1. CONTACT INFO EXTRACTION =================

  // Email
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  if (emailMatch) {
    data.personalInfo.email = emailMatch[0].trim();
  }

  // Phone: matches US (+1), Indian (+91, 10-digit uninterrupted), international
  const phoneMatch = rawText.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{4,5}|\b[6-9]\d{9}\b/
  );
  if (phoneMatch) {
    data.personalInfo.phone = phoneMatch[0].trim();
  }

  // LinkedIn
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    data.personalInfo.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
  }

  // GitHub
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    data.personalInfo.github = `github.com/${githubMatch[1]}`;
  }

  // Website / Portfolio
  const websiteMatch = rawText.match(/https?:\/\/(?!www\.linkedin|linkedin|www\.github|github)[^\s,]+/i);
  if (websiteMatch) {
    data.personalInfo.website = websiteMatch[0].trim();
  }

  // Location: search line by line in header for proper capitalized city, state/country
  let location = '';
  for (let i = 0; i < Math.min(15, allLines.length); i++) {
    const line = allLines[i];
    if (line.toLowerCase().includes('college') || line.toLowerCase().includes('university')) continue;
    // Proper city, state/country regex: Capitalized words before comma, capitalized state/country after comma
    const locMatch = line.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,\s*(?:[A-Z]{2}|[A-Z][a-z]+)(?:\s+\d{5,6})?)\b/);
    if (locMatch) {
      location = locMatch[1].trim();
      break;
    }
  }
  data.personalInfo.location = location;

  // ================= 2. CANDIDATE NAME & TITLE =================
  // Name is typically in the first 6 lines, NOT equal to any section header or email/phone
  let candidateName = '';
  let candidateTitle = '';
  let nameLineIndex = -1;

  for (let i = 0; i < Math.min(10, allLines.length); i++) {
    const line = allLines[i];
    const { isHeader } = isSectionHeader(line);

    // Skip section headers, email, phone, location, or urls
    if (
      isHeader ||
      line.includes('@') ||
      line.match(/https?:\/\//) ||
      (phoneMatch && line.includes(phoneMatch[0])) ||
      line.toLowerCase().includes('resume') ||
      line.toLowerCase().includes('curriculum vitae')
    ) {
      continue;
    }

    // Name usually has 2 to 5 words, letters only or periods/hyphens
    const wordCount = line.split(/\s+/).length;
    if (!candidateName && wordCount >= 2 && wordCount <= 6 && /^[a-zA-Z\s.-]+$/.test(line)) {
      candidateName = line;
      nameLineIndex = i;
      continue;
    }

    // Line right after name is often the Job Title / Student Status
    if (candidateName && !candidateTitle && (i === nameLineIndex + 1 || i === nameLineIndex + 2)) {
      if (line.length < 60 && !line.includes('@') && !line.match(/\d{4}/)) {
        candidateTitle = line;
      }
    }
  }

  data.personalInfo.fullName = candidateName;
  data.personalInfo.jobTitle = candidateTitle;

  // ================= 3. SECTION GROUPING =================
  type SectionGroup = {
    key: string;
    rawTitle: string;
    lines: string[];
  };

  const sections: SectionGroup[] = [];
  let activeSection: SectionGroup | null = null;

  for (let idx = 0; idx < allLines.length; idx++) {
    const line = allLines[idx];
    const { isHeader, key } = isSectionHeader(line);

    if (isHeader) {
      activeSection = {
        key,
        rawTitle: line,
        lines: [],
      };
      sections.push(activeSection);
    } else if (activeSection) {
      activeSection.lines.push(line);
    } else {
      // If before first section, check if it's an introductory summary
      if (
        line !== candidateName &&
        line !== candidateTitle &&
        !line.includes('@') &&
        !(phoneMatch && line.includes(phoneMatch[0])) &&
        line.length > 50
      ) {
        data.summaryHtml = data.summaryHtml ? `${data.summaryHtml} ${line}` : line;
      }
    }
  }

  // ================= 4. PARSE INDIVIDUAL SECTIONS =================
  for (const sec of sections) {
    if (sec.key === 'summary') {
      const summaryText = sec.lines.join(' ').trim();
      if (summaryText) {
        data.summaryHtml = summaryText;
      }
    } else if (sec.key === 'skills') {
      const parsedSkills = parseSkillsSection(sec.lines);
      for (const p of parsedSkills) {
        if (!data.skills.some((s) => s.name.toLowerCase() === p.name.toLowerCase())) {
          data.skills.push(p);
        }
      }
    } else if (sec.key === 'experience') {
      data.experience.push(...parseExperienceEntries(sec.lines));
    } else if (sec.key === 'projects') {
      // Parse projects
      const projectEntries = parseProjectsSection(sec.lines);
      // If candidate has no work experience (e.g. students like Resume 1),
      // populate projects into Experience so they shine in templates!
      if (data.experience.length === 0) {
        data.experience = projectEntries;
      } else {
        // Put in custom sections
        data.customSections.push({
          id: genId(),
          title: sec.rawTitle,
          contentHtml: formatEntriesToHtml(projectEntries),
        });
      }
    } else if (sec.key === 'education') {
      data.education.push(...parseEducationEntries(sec.lines));
    } else if (sec.key === 'certificates') {
      data.customSections.push({
        id: genId(),
        title: sec.rawTitle || 'Certificates & Certifications',
        contentHtml: sec.lines.map((l) => `• ${l}`).join('<br/>'),
      });
    } else if (sec.key === 'languages') {
      data.customSections.push({
        id: genId(),
        title: sec.rawTitle || 'Languages',
        contentHtml: sec.lines.join(' &bull; '),
      });
    } else if (sec.key === 'soft_skills') {
      data.customSections.push({
        id: genId(),
        title: sec.rawTitle || 'Soft Skills',
        contentHtml: sec.lines.map((l) => `• ${l}`).join('<br/>'),
      });
    } else {
      // Generic custom section
      data.customSections.push({
        id: genId(),
        title: sec.rawTitle,
        contentHtml: sec.lines.join('<br/>'),
      });
    }
  }

  return data;
}

/**
 * Parses Skills lines, supporting space-separated chips, bullet points, commas, and pipes.
 */
function parseSkillsSection(lines: string[]): { id: string; name: string }[] {
  const skillNames: string[] = [];
  const compoundSkills = [
    'React js',
    'React.js',
    'Node js',
    'Node.js',
    'Next js',
    'Next.js',
    'Vue js',
    'Vue.js',
    'Spring Boot',
    'Data Structures',
    'REST APIs',
    'REST API',
    'RESTful APIs',
    'Machine Learning',
    'Deep Learning',
    'Computer Vision',
    'Cloud Computing',
    'Operating Systems',
    'Database Management',
  ];

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    let preserved = cleanLine;
    for (const compound of compoundSkills) {
      const regex = new RegExp(`\\b${compound.replace('.', '\\.')}\\b`, 'gi');
      preserved = preserved.replace(regex, compound.replace(/\s+/g, '_'));
    }

    const hasDelimiters = /[•·|,/;\t]/.test(preserved);
    const tokens = hasDelimiters ? preserved.split(/[•·|,/;\t]+/) : preserved.split(/\s+/);

    for (const rawToken of tokens) {
      const token = rawToken.replace(/_/g, ' ').trim();
      if (token.length >= 1 && token.length <= 40 && !/^(and|or|with|in|the)$/i.test(token)) {
        skillNames.push(token);
      }
    }
  }

  const seen = new Set<string>();
  const uniqueSkills: { id: string; name: string }[] = [];

  for (const name of skillNames) {
    const lower = name.toLowerCase();
    if (!seen.has(lower) && name.length > 0) {
      seen.add(lower);
      uniqueSkills.push({ id: genId(), name });
    }
  }

  return uniqueSkills;
}

// Regex to detect date spans like:
// "09/2024 to Current", "12/2020 - 04/2024", "(02/2025 - 04/2025)", "Jan 2021 – Present"
const DATE_SPAN_REGEX =
  /(?:\(?\s*)?(?:(\d{1,2}\/\d{4}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4})\s*(?:-|–|—|to)\s*(present|current|\d{1,2}\/\d{4}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4})|(\d{1,2}\/\d{4}))(?:\s*\)?)/i;

/**
 * Parses Work Experience entries from lines.
 */
function parseExperienceEntries(lines: string[]): StructuredExperience[] {
  const entries: StructuredExperience[] = [];
  let currentEntry: Partial<StructuredExperience> | null = null;
  const descriptionBullets: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(DATE_SPAN_REGEX);

    // If this line has dates OR looks like a new role/company header
    if (dateMatch && !line.toLowerCase().includes('bachelor') && !line.toLowerCase().includes('college')) {
      if (currentEntry) {
        currentEntry.descriptionHtml = descriptionBullets.join('<br/>');
        entries.push(currentEntry as StructuredExperience);
        descriptionBullets.length = 0;
      }

      // Extract dates
      let startDate = dateMatch[1] || dateMatch[3] || '';
      let endDate = dateMatch[2] || '';
      const isCurrent = /present|current/i.test(endDate);

      // Extract title from the line or previous/next lines
      const lineWithoutDates = line.replace(DATE_SPAN_REGEX, '').replace(/[()]/g, '').trim();

      let role = '';
      let company = '';

      if (lineWithoutDates) {
        const parts = lineWithoutDates.split(/–|-|\||at|,/).map((p) => p.trim());
        role = parts[0] || '';
        company = parts[1] || '';
      }

      // Check next line for company / location if role was found
      if (!company && i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (!DATE_SPAN_REGEX.test(nextLine) && !nextLine.startsWith('•') && !nextLine.startsWith('-')) {
          const compParts = nextLine.split(/–|-|,/).map((p) => p.trim());
          company = compParts[0] || '';
          i++; // consumed next line
        }
      }

      currentEntry = {
        id: genId(),
        role: role || 'Software Engineer',
        company: company || 'Company',
        location: '',
        startDate,
        endDate: isCurrent ? '' : endDate,
        current: isCurrent,
        descriptionHtml: '',
      };
    } else if (currentEntry) {
      // Description bullet / line
      descriptionBullets.push(line);
    }
  }

  if (currentEntry) {
    currentEntry.descriptionHtml = descriptionBullets.join('<br/>');
    entries.push(currentEntry as StructuredExperience);
  }

  return entries;
}

/**
 * Parses Projects section lines into structured entries.
 */
function parseProjectsSection(lines: string[]): StructuredExperience[] {
  const projects: StructuredExperience[] = [];
  let currentProj: Partial<StructuredExperience> | null = null;
  const descLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(DATE_SPAN_REGEX);

    if (dateMatch) {
      let projTitle = '';
      const lineWithoutDates = line.replace(DATE_SPAN_REGEX, '').replace(/[()]/g, '').trim();

      if (lineWithoutDates.length > 2) {
        projTitle = lineWithoutDates;
      } else if (i > 0) {
        projTitle = lines[i - 1];
        // If the title was pushed into descLines of previous project, pop it!
        if (descLines.length > 0 && descLines[descLines.length - 1] === projTitle) {
          descLines.pop();
        }
      }

      if (currentProj) {
        currentProj.descriptionHtml = descLines.join('<br/>');
        projects.push(currentProj as StructuredExperience);
        descLines.length = 0;
      }

      const dates = dateMatch[0].replace(/[()]/g, '').trim();
      const parts = dates.split(/-|–|—|to/i).map((p) => p.trim());
      const isCurrent = /present|current/i.test(parts[1] || '');

      currentProj = {
        id: genId(),
        role: projTitle || 'Project',
        company: 'Project',
        location: '',
        startDate: parts[0] || '',
        endDate: isCurrent ? '' : (parts[1] || ''),
        current: isCurrent,
        descriptionHtml: '',
      };
    } else if (currentProj) {
      descLines.push(line);
    }
  }

  if (currentProj) {
    currentProj.descriptionHtml = descLines.join('<br/>');
    projects.push(currentProj as StructuredExperience);
  }

  return projects;
}

/**
 * Parses Education entries from lines.
 */
function parseEducationEntries(lines: string[]): StructuredEducation[] {
  const educations: StructuredEducation[] = [];
  const degreeKeywords = [
    'bachelor',
    'btech',
    'b.tech',
    'b.s',
    'b.a',
    'master',
    'mtech',
    'm.tech',
    'm.s',
    'ph.d',
    'doctorate',
    'intermediate',
    'school (cbse)',
    'secondary school',
    'high school',
    'diploma',
  ];

  let currentEdu: Partial<StructuredEducation> | null = null;
  const noteLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Check if line is continuation of previous institution name (e.g. "Public School" after "Sri Sadineni Chowdaraiah Residential")
    if (
      currentEdu &&
      !currentEdu.startDate &&
      (lower === 'public school' || lower.includes('residential') || lower.includes('institution')) &&
      currentEdu.institution &&
      !currentEdu.institution.toLowerCase().includes('school')
    ) {
      currentEdu.institution = `${currentEdu.institution} ${line}`.trim();
      continue;
    }

    const isDegree = degreeKeywords.some((k) => lower.includes(k));

    if (isDegree) {
      if (currentEdu) {
        currentEdu.descriptionHtml = noteLines.join(', ');
        educations.push(currentEdu as StructuredEducation);
        noteLines.length = 0;
      }

      // Check next line for institution
      let institution = '';
      if (i + 1 < lines.length && !lines[i + 1].match(DATE_SPAN_REGEX)) {
        institution = lines[i + 1];
        i++;
      }

      currentEdu = {
        id: genId(),
        degree: line,
        institution: institution || 'Institution',
        location: '',
        startDate: '',
        endDate: '',
        descriptionHtml: '',
      };
    } else if (currentEdu) {
      const dateMatch = line.match(DATE_SPAN_REGEX);
      if (dateMatch && !currentEdu.startDate) {
        const parts = dateMatch[0].replace(/[()]/g, '').split(/-|–|—|to/i).map((p) => p.trim());
        currentEdu.startDate = parts[0] || '';
        currentEdu.endDate = parts[1] || '';
      }
      noteLines.push(line);
    }
  }

  if (currentEdu) {
    currentEdu.descriptionHtml = noteLines.join(', ');
    educations.push(currentEdu as StructuredEducation);
  }

  return educations;
}

function formatEntriesToHtml(entries: StructuredExperience[]): string {
  return entries
    .map(
      (e) =>
        `<strong>${e.role}</strong> (${e.startDate}${e.endDate ? ' - ' + e.endDate : ''})<br/>${e.descriptionHtml}`
    )
    .join('<br/><br/>');
}

/**
 * Generates Canvas Layers from parsed structured resume data with multi-page support.
 * Font sizes increased by +2px for enhanced readability.
 */
export function convertStructuredDataToCanvasLayers(data: StructuredResumeData): CanvasLayer[] {
  const layers: CanvasLayer[] = [];
  let currentPage = 1;
  let yOffset = 40;
  let z = 1;

  const checkPageOverflow = (neededHeight: number) => {
    if (yOffset + neededHeight > 1020 && currentPage === 1) {
      currentPage = 2;
      yOffset = 40;
    }
  };

  // Header Name
  layers.push({
    id: genId(),
    page: 1,
    type: 'heading',
    x: 48,
    y: yOffset,
    width: 450,
    height: 46,
    zIndex: z++,
    htmlContent: data.personalInfo.fullName || 'Your Name',
    locked: false,
    visible: true,
    style: {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '30px',
      color: '#0f172a',
      textAlign: 'left',
    },
  });

  // Job Title
  if (data.personalInfo.jobTitle) {
    yOffset += 46;
    layers.push({
      id: genId(),
      page: 1,
      type: 'text',
      x: 48,
      y: yOffset,
      width: 450,
      height: 28,
      zIndex: z++,
      htmlContent: data.personalInfo.jobTitle,
      locked: false,
      visible: true,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: '#6366f1',
        textAlign: 'left',
      },
    });
  }

  // Contact Info Right Box
  const contactLines = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.website,
    data.personalInfo.linkedin,
  ].filter(Boolean);

  if (contactLines.length > 0) {
    layers.push({
      id: genId(),
      page: 1,
      type: 'text',
      x: 520,
      y: 40,
      width: 226,
      height: 85,
      zIndex: z++,
      htmlContent: contactLines.join('<br/>'),
      locked: false,
      visible: true,
      style: {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12.5px',
        color: '#64748b',
        textAlign: 'right',
        lineHeight: 1.5,
      },
    });
  }

  yOffset += 45;

  // Header Divider
  layers.push({
    id: genId(),
    page: 1,
    type: 'divider',
    x: 48,
    y: yOffset,
    width: 698,
    height: 2,
    zIndex: z++,
    htmlContent: '',
    locked: false,
    visible: true,
    style: {
      backgroundColor: '#e2e8f0',
    },
  });

  yOffset += 20;

  // Summary
  if (data.summaryHtml) {
    layers.push({
      id: genId(),
      page: 1,
      type: 'heading',
      x: 48,
      y: yOffset,
      width: 698,
      height: 26,
      zIndex: z++,
      htmlContent: 'PROFESSIONAL SUMMARY',
      locked: false,
      visible: true,
      style: {
        fontSize: '14px',
        color: '#0f172a',
        letterSpacing: '1px',
      },
    });
    yOffset += 28;

    layers.push({
      id: genId(),
      page: 1,
      type: 'text',
      x: 48,
      y: yOffset,
      width: 698,
      height: 65,
      zIndex: z++,
      htmlContent: data.summaryHtml,
      locked: false,
      visible: true,
      style: {
        fontSize: '13px',
        color: '#475569',
        lineHeight: 1.55,
      },
    });
    yOffset += 75;
  }

  // Work Experience
  if (data.experience.length > 0) {
    checkPageOverflow(120);

    layers.push({
      id: genId(),
      page: currentPage,
      type: 'heading',
      x: 48,
      y: yOffset,
      width: 698,
      height: 26,
      zIndex: z++,
      htmlContent: currentPage === 2 ? 'WORK EXPERIENCE (CONTINUED)' : 'WORK EXPERIENCE',
      locked: false,
      visible: true,
      style: {
        fontSize: '14px',
        color: '#0f172a',
        letterSpacing: '1px',
      },
    });
    yOffset += 28;

    for (const exp of data.experience) {
      checkPageOverflow(80);
      const dates = `${exp.startDate || ''} ${exp.endDate || exp.current ? '— ' + (exp.current ? 'Present' : exp.endDate) : ''}`.trim();
      layers.push({
        id: genId(),
        page: currentPage,
        type: 'text',
        x: 48,
        y: yOffset,
        width: 698,
        height: 65,
        zIndex: z++,
        htmlContent: `<strong>${exp.role}</strong> &mdash; ${exp.company} <span style="float:right;color:#94a3b8;">${dates}</span><br/><span style="color:#64748b;">${exp.descriptionHtml}</span>`,
        locked: false,
        visible: true,
        style: {
          fontSize: '13px',
          color: '#1e293b',
          lineHeight: 1.5,
        },
      });
      yOffset += 75;
    }
  }

  // Skills
  if (data.skills.length > 0) {
    checkPageOverflow(100);

    layers.push({
      id: genId(),
      page: currentPage,
      type: 'heading',
      x: 48,
      y: yOffset,
      width: 698,
      height: 28,
      zIndex: z++,
      htmlContent: 'SKILLS &amp; EXPERTISE',
      locked: false,
      visible: true,
      style: {
        fontSize: '15px',
        color: '#0f172a',
        letterSpacing: '1px',
      },
    });
    yOffset += 30;

    const seenNames = new Set<string>();
    const uniqueNames = data.skills
      .map((s) => s.name.trim())
      .filter((n) => {
        const k = n.toLowerCase();
        if (!k || seenNames.has(k)) return false;
        seenNames.add(k);
        return true;
      });

    layers.push({
      id: genId(),
      page: currentPage,
      type: 'text',
      x: 48,
      y: yOffset,
      width: 698,
      height: 45,
      zIndex: z++,
      htmlContent: uniqueNames.join(' &bull; '),
      locked: false,
      visible: true,
      style: {
        fontSize: '13.5px',
        color: '#475569',
        lineHeight: 1.6,
      },
    });
    yOffset += 60;
  }

  // Education
  if (data.education.length > 0) {
    checkPageOverflow(110);

    layers.push({
      id: genId(),
      page: currentPage,
      type: 'heading',
      x: 48,
      y: yOffset,
      width: 698,
      height: 26,
      zIndex: z++,
      htmlContent: 'EDUCATION',
      locked: false,
      visible: true,
      style: {
        fontSize: '14px',
        color: '#0f172a',
        letterSpacing: '1px',
      },
    });
    yOffset += 28;

    for (const edu of data.education) {
      checkPageOverflow(60);
      const dates = `${edu.startDate || ''} ${edu.endDate ? '— ' + edu.endDate : ''}`.trim();
      layers.push({
        id: genId(),
        page: currentPage,
        type: 'text',
        x: 48,
        y: yOffset,
        width: 698,
        height: 48,
        zIndex: z++,
        htmlContent: `<strong>${edu.degree}</strong> &mdash; ${edu.institution} <span style="float:right;color:#94a3b8;">${dates}</span><br/><span style="color:#64748b;">${edu.descriptionHtml}</span>`,
        locked: false,
        visible: true,
        style: {
          fontSize: '13px',
          color: '#1e293b',
          lineHeight: 1.5,
        },
      });
      yOffset += 55;
    }
  }

  // Custom Sections (Certificates, Languages, Soft Skills, etc.)
  for (const custom of data.customSections) {
    checkPageOverflow(100);

    layers.push({
      id: genId(),
      page: currentPage,
      type: 'heading',
      x: 48,
      y: yOffset,
      width: 698,
      height: 26,
      zIndex: z++,
      htmlContent: custom.title.toUpperCase(),
      locked: false,
      visible: true,
      style: {
        fontSize: '14px',
        color: '#0f172a',
        letterSpacing: '1px',
      },
    });
    yOffset += 28;

    layers.push({
      id: genId(),
      page: currentPage,
      type: 'text',
      x: 48,
      y: yOffset,
      width: 698,
      height: 65,
      zIndex: z++,
      htmlContent: custom.contentHtml,
      locked: false,
      visible: true,
      style: {
        fontSize: '13px',
        color: '#475569',
        lineHeight: 1.5,
      },
    });
    yOffset += 75;
  }

  return layers;
}

/**
 * Universal file importer supporting .json, .pdf, and .docx files.
 */
export async function importResumeAnyFormat(
  file: File,
  targetMode: ResumeMode = 'template'
): Promise<ResumeProject> {
  const fileName = file.name.toLowerCase();

  // 1. If it's a JSON file
  if (fileName.endsWith('.json')) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      id: genId(),
      lastModified: Date.now(),
    };
  }

  // 2. If it's a PDF file
  let rawText = '';
  if (fileName.endsWith('.pdf')) {
    rawText = await extractTextFromPdf(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    const docxResult = await extractFromDocx(file);
    rawText = docxResult.text;
  } else {
    throw new Error('Unsupported file format. Please upload a .pdf, .docx, or .json file.');
  }

  if (!rawText.trim()) {
    throw new Error('Could not extract readable text from the uploaded document. It might be a scanned image.');
  }

  // Parse structured data
  const structuredData = parseResumeTextToStructured(rawText);
  const title = structuredData.personalInfo.fullName
    ? `${structuredData.personalInfo.fullName}'s Resume`
    : file.name.replace(/\.[^/.]+$/, '');

  const canvasLayers =
    targetMode === 'canvas'
      ? convertStructuredDataToCanvasLayers(structuredData)
      : [];

  return {
    id: genId(),
    title,
    mode: targetMode,
    lastModified: Date.now(),
    templateId: 'minimalist',
    canvasLayers,
    structuredData,
  };
}
