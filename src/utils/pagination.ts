import type { StructuredResumeData, SectionTitles, SectionFontSizes } from '../types/resume';

export interface PaginatedResumePage {
  pageNumber: number;
  totalPages: number;
  personalInfo?: StructuredResumeData['personalInfo'];
  summaryHtml?: string;
  experience: StructuredResumeData['experience'];
  education: StructuredResumeData['education'];
  skills: StructuredResumeData['skills'];
  customSections: StructuredResumeData['customSections'];
  isFirstPage: boolean;
  isLastPage: boolean;
  experienceContinued?: boolean;
  educationContinued?: boolean;
  sectionTitles?: SectionTitles;
  sectionOrder?: string[];
  sectionFontSizes?: SectionFontSizes;
}

/**
 * Estimation of section heights at standard 96 DPI A4 scale with balanced typography.
 * An A4 sheet is 1123px tall. Usable content height is ~1040px.
 */
export function estimateResumeHeight(data: StructuredResumeData): number {
  let height = 0;

  // Header & Personal Info (Only on Page 1)
  height += 140;

  // Summary
  if (data.summaryHtml && data.summaryHtml.trim()) {
    const textLength = data.summaryHtml.replace(/<[^>]*>/g, '').length;
    height += 38 + Math.ceil(textLength / 85) * 22;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    height += 38; // Section heading
    for (const exp of data.experience) {
      height += 54; // Title, company, dates
      if (exp.descriptionHtml) {
        const bulletCount = (exp.descriptionHtml.match(/<br\s*\/?>|<li>|•/gi) || []).length || 1;
        const textLen = exp.descriptionHtml.replace(/<[^>]*>/g, '').length;
        height += Math.max(bulletCount * 24, Math.ceil(textLen / 80) * 22);
      }
    }
  }

  // Education
  if (data.education && data.education.length > 0) {
    height += 38;
    for (const edu of data.education) {
      height += 48;
      if (edu.descriptionHtml) height += 22;
    }
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    height += 38;
    const lines = Math.ceil(data.skills.length / 4);
    height += lines * 28;
  }

  // Custom sections
  if (data.customSections && data.customSections.length > 0) {
    for (const sec of data.customSections) {
      height += 38;
      const lines = (sec.contentHtml.match(/<br\s*\/?>|•/gi) || []).length || 1;
      const textLen = sec.contentHtml.replace(/<[^>]*>/g, '').length;
      height += Math.max(lines * 24, Math.ceil(textLen / 70) * 22);
    }
  }

  return height;
}

/**
 * Intelligently divides structured resume data into discrete A4 pages.
 * Fills Page 1 up to ~1000px before splitting.
 * Personal information is strictly kept on Page 1 only.
 * Content continuing onto Page 2 flows naturally without artificial repeated headers.
 */
export function paginateResumeData(
  data: StructuredResumeData,
  manualPageCount?: number
): PaginatedResumePage[] {
  // Strictly deduplicate skills by normalized lowercased name
  const seenSkillNames = new Set<string>();
  const deduplicatedSkills = (data.skills || []).filter((s) => {
    const k = s.name.trim().toLowerCase();
    if (!k || seenSkillNames.has(k)) return false;
    seenSkillNames.add(k);
    return true;
  });

  const totalEstimatedHeight = estimateResumeHeight({
    ...data,
    skills: deduplicatedSkills,
  });
  const totalPages = manualPageCount || (totalEstimatedHeight > 1020 ? 2 : 1);

  if (totalPages <= 1) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        personalInfo: data.personalInfo,
        summaryHtml: data.summaryHtml,
        experience: data.experience,
        education: data.education,
        skills: deduplicatedSkills,
        customSections: data.customSections,
        isFirstPage: true,
        isLastPage: true,
        experienceContinued: false,
        educationContinued: false,
        sectionTitles: data.sectionTitles,
        sectionOrder: data.sectionOrder,
        sectionFontSizes: data.sectionFontSizes,
      },
    ];
  }

  // Multi-page distribution
  let currentHeight = 140; // Personal info header
  if (data.summaryHtml) {
    const textLen = data.summaryHtml.replace(/<[^>]*>/g, '').length;
    currentHeight += 38 + Math.ceil(textLen / 85) * 22;
  }

  const page1Experience: StructuredResumeData['experience'] = [];
  const page2Experience: StructuredResumeData['experience'] = [];

  if (data.experience.length > 0) {
    currentHeight += 38; // Experience heading
    for (const exp of data.experience) {
      const bulletCount = (exp.descriptionHtml?.match(/<br\s*\/?>|<li>|•/gi) || []).length || 1;
      const textLen = exp.descriptionHtml?.replace(/<[^>]*>/g, '').length || 0;
      const itemH = 54 + Math.max(bulletCount * 24, Math.ceil(textLen / 80) * 22);

      if (currentHeight + itemH <= 980 || page1Experience.length === 0) {
        page1Experience.push(exp);
        currentHeight += itemH;
      } else {
        page2Experience.push(exp);
      }
    }
  }

  // Education placement
  const page1Education: StructuredResumeData['education'] = [];
  const page2Education: StructuredResumeData['education'] = [];

  if (data.education.length > 0) {
    const eduH = 38 + data.education.length * 48;
    if (currentHeight + eduH <= 980 && page2Experience.length === 0) {
      page1Education.push(...data.education);
      currentHeight += eduH;
    } else {
      page2Education.push(...data.education);
    }
  }

  // Skills placement - placed on Page 1 if space permits, else Page 2
  const page1Skills: StructuredResumeData['skills'] = [];
  const page2Skills: StructuredResumeData['skills'] = [];

  if (deduplicatedSkills.length > 0) {
    const skillsH = 38 + Math.ceil(deduplicatedSkills.length / 4) * 28;
    if (currentHeight + skillsH <= 990 && page2Experience.length <= 1) {
      page1Skills.push(...deduplicatedSkills);
      currentHeight += skillsH;
    } else {
      page2Skills.push(...deduplicatedSkills);
    }
  }

  // Custom sections placement
  const page1CustomSections: StructuredResumeData['customSections'] = [];
  const page2CustomSections: StructuredResumeData['customSections'] = [];

  for (const sec of data.customSections) {
    const lines = (sec.contentHtml.match(/<br\s*\/?>|•/gi) || []).length || 1;
    const textLen = sec.contentHtml.replace(/<[^>]*>/g, '').length;
    const secH = 38 + Math.max(lines * 24, Math.ceil(textLen / 70) * 22);

    if (
      currentHeight + secH <= 990 &&
      page2Experience.length === 0 &&
      page2Education.length === 0 &&
      page2Skills.length === 0
    ) {
      page1CustomSections.push(sec);
      currentHeight += secH;
    } else {
      page2CustomSections.push(sec);
    }
  }

  const expContinued = page1Experience.length > 0 && page2Experience.length > 0;
  const eduContinued = page1Education.length > 0 && page2Education.length > 0;

  return [
    {
      pageNumber: 1,
      totalPages: 2,
      personalInfo: data.personalInfo,
      summaryHtml: data.summaryHtml,
      experience: page1Experience,
      education: page1Education,
      skills: page1Skills,
      customSections: page1CustomSections,
      isFirstPage: true,
      isLastPage: false,
      experienceContinued: false,
      educationContinued: false,
      sectionTitles: data.sectionTitles,
      sectionOrder: data.sectionOrder,
      sectionFontSizes: data.sectionFontSizes,
    },
    {
      pageNumber: 2,
      totalPages: 2,
      personalInfo: undefined, // NO personal info on page 2
      summaryHtml: undefined,
      experience: page2Experience,
      education: page2Education,
      skills: page2Skills,
      customSections: page2CustomSections,
      isFirstPage: false,
      isLastPage: true,
      experienceContinued: expContinued,
      educationContinued: eduContinued,
      sectionTitles: data.sectionTitles,
      sectionOrder: data.sectionOrder,
      sectionFontSizes: data.sectionFontSizes,
    },
  ];
}
