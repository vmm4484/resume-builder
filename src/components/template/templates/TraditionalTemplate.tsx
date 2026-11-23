import type { StructuredResumeData } from '../../../types/resume';
import type { PaginatedResumePage } from '../../../utils/pagination';
import { getFontFamilyCss } from '../../../utils/fontFamilies';

interface TemplateProps {
  data: StructuredResumeData;
  pageData?: PaginatedResumePage;
  page?: number;
  totalPages?: number;
}

/**
 * Traditional / Ivy League Split Template
 * Exact reproduction of the classic serif layout with full-width dotted rules,
 * centered title header, and a clean left column for section titles & timeline dates.
 */
export default function TraditionalTemplate({
  data,
  pageData,
}: TemplateProps) {
  const personalInfo = pageData ? pageData.personalInfo : data.personalInfo;
  const summaryHtml = pageData ? pageData.summaryHtml : data.summaryHtml;
  const experience = pageData ? pageData.experience : data.experience;
  const education = pageData ? pageData.education : data.education;
  const rawSkills = pageData ? pageData.skills : data.skills;
  const customSections = pageData ? pageData.customSections : data.customSections;
  const sectionTitles = pageData?.sectionTitles || data.sectionTitles;
  const sectionOrder = pageData?.sectionOrder || data.sectionOrder;
  const sectionFontSizes = pageData?.sectionFontSizes || data.sectionFontSizes || {};

  // Deduplicate skills by normalized lowercased name
  const displaySkills = (rawSkills || []).filter(
    (s, idx, arr) =>
      arr.findIndex((x) => x.name.trim().toLowerCase() === s.name.trim().toLowerCase()) === idx
  );

  // Divide skills into 2 columns (column-major)
  const half = Math.ceil(displaySkills.length / 2);
  const skillCol1 = displaySkills.slice(0, half);
  const skillCol2 = displaySkills.slice(half);

  // Default section order: summary, skills, experience, education, customSections
  const defaultOrder = [
    'summary',
    'skills',
    'experience',
    'education',
    ...customSections.map((c) => c.id),
  ];
  const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  // Helper for dates like "09/2024 to Current" or "09/2022 to 09/2024" or "06/2022"
  const formatDateRange = (start?: string, end?: string, isCurrent?: boolean) => {
    if (!start && !end) return '';
    if (isCurrent) return start ? `${start} to Current` : 'Current';
    if (start && end) return `${start} to ${end}`;
    return start || end || '';
  };

  // Contact items joined by " - "
  const contactDetails = [
    personalInfo?.phone,
    personalInfo?.email,
    personalInfo?.linkedin,
    personalInfo?.github,
    personalInfo?.website,
  ].filter(Boolean);

  const globalBody = sectionFontSizes.globalBody;
  const globalHeading = sectionFontSizes.globalHeading;
  const activeFont = getFontFamilyCss(
    pageData?.fontFamily || data.fontFamily,
    '"Times New Roman", Times, Georgia, Cambria, serif'
  );

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summaryHtml) return null;
        return (
          <div key="summary" className="resume-section">
            <div className="border-t border-dotted border-neutral-700 my-3.5" />
            <h2
              className="font-bold text-black uppercase tracking-wide w-full mb-2"
              style={{ fontSize: `${sectionFontSizes.title_summary || globalHeading || 13.5}px` }}
            >
              {sectionTitles?.summary || 'PROFESSIONAL SUMMARY'}
            </h2>
            <div className="flex">
              <div className="w-[155px] shrink-0" />
              <div className="flex-1">
                <div
                  className="rich-text-content text-black leading-relaxed text-justify"
                  style={{ fontSize: `${sectionFontSizes.summary || globalBody || 13}px` }}
                  dangerouslySetInnerHTML={{ __html: summaryHtml }}
                />
              </div>
            </div>
          </div>
        );

      case 'skills':
        if (!displaySkills || displaySkills.length === 0) return null;
        return (
          <div key="skills" className="resume-section">
            <div className="border-t border-dotted border-neutral-700 my-3.5" />
            <h2
              className="font-bold text-black uppercase tracking-wide w-full mb-2"
              style={{ fontSize: `${sectionFontSizes.title_skills || globalHeading || 13.5}px` }}
            >
              {sectionTitles?.skills || 'SKILLS'}
            </h2>
            <div className="flex">
              <div className="w-[155px] shrink-0" />
              <div className="flex-1">
                <div
                  className="grid grid-cols-2 gap-x-8 text-black"
                  style={{ fontSize: `${sectionFontSizes.skills || globalBody || 13}px` }}
                >
                  <div className="space-y-1">
                    {skillCol1.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <span className="text-black font-bold leading-none">•</span>
                        <span>{skill.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {skillCol2.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <span className="text-black font-bold leading-none">•</span>
                        <span>{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'experience':
        if (!experience || experience.length === 0) return null;
        const expFontSize = sectionFontSizes.experience || globalBody || 13;
        return (
          <div key="experience" className="resume-section">
            <div className="border-t border-dotted border-neutral-700 my-3.5" />
            
            {/* Section Heading taking full width of the line */}
            <h2
              className="font-bold text-black uppercase tracking-wide w-full mb-2.5"
              style={{ fontSize: `${sectionFontSizes.title_experience || globalHeading || 13.5}px` }}
            >
              {sectionTitles?.experience || 'WORK HISTORY'}
            </h2>

            {/* Experience Entries with timeline dates in left column */}
            <div className="space-y-4">
              {experience.map((exp) => {
                const dateStr = formatDateRange(exp.startDate, exp.endDate, exp.current);
                return (
                  <div key={exp.id} className="resume-entry-item flex">
                    {/* Left Column: Date */}
                    <div className="w-[155px] shrink-0 pr-4 pt-0.5">
                      {dateStr && (
                        <p
                          className="text-neutral-500 leading-tight"
                          style={{ fontSize: `${Math.max(10, expFontSize - 0.5)}px` }}
                        >
                          {dateStr}
                        </p>
                      )}
                    </div>

                    {/* Right Column: Title, Company, Bullets */}
                    <div className="flex-1">
                      <p
                        className="font-bold text-black leading-snug"
                        style={{ fontSize: `${expFontSize + 1}px` }}
                      >
                        {exp.role || 'Role / Position'}
                      </p>
                      <p
                        className="font-bold italic text-black mt-0.5 leading-snug"
                        style={{ fontSize: `${expFontSize + 0.5}px` }}
                      >
                        {exp.company}
                        {exp.location ? ` — ${exp.location}` : ''}
                      </p>
                      {exp.descriptionHtml && (
                        <div
                          className="mt-1.5 rich-text-content text-black leading-relaxed"
                          style={{ fontSize: `${expFontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: exp.descriptionHtml }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        const eduFontSize = sectionFontSizes.education || globalBody || 13;
        return (
          <div key="education" className="resume-section">
            <div className="border-t border-dotted border-neutral-700 my-3.5" />
            
            {/* Section Heading taking full width of the line */}
            <h2
              className="font-bold text-black uppercase tracking-wide w-full mb-2.5"
              style={{ fontSize: `${sectionFontSizes.title_education || globalHeading || 13.5}px` }}
            >
              {sectionTitles?.education || 'EDUCATION'}
            </h2>

            {/* Education Entries with dates in left column */}
            <div className="space-y-4">
              {education.map((edu) => {
                const dateStr = formatDateRange(edu.startDate, edu.endDate);
                return (
                  <div key={edu.id} className="resume-entry-item flex">
                    {/* Left Column: Date */}
                    <div className="w-[155px] shrink-0 pr-4 pt-0.5">
                      {dateStr && (
                        <p
                          className="text-neutral-500 leading-tight"
                          style={{ fontSize: `${Math.max(10, eduFontSize - 0.5)}px` }}
                        >
                          {dateStr}
                        </p>
                      )}
                    </div>

                    {/* Right Column: Degree, Institution, Bullets */}
                    <div className="flex-1">
                      <p
                        className="font-bold text-black leading-snug"
                        style={{ fontSize: `${eduFontSize + 1}px` }}
                      >
                        {edu.degree || 'Degree'}
                      </p>
                      <p
                        className="font-bold italic text-black mt-0.5 leading-snug"
                        style={{ fontSize: `${eduFontSize + 0.5}px` }}
                      >
                        {edu.institution}
                        {edu.location ? ` — ${edu.location}` : ''}
                      </p>
                      {edu.descriptionHtml && (
                        <div
                          className="mt-1 rich-text-content text-black leading-relaxed"
                          style={{ fontSize: `${eduFontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: edu.descriptionHtml }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default: {
        const customSec = customSections.find((c) => c.id === key);
        if (!customSec || !customSec.contentHtml) return null;
        const customFontSize = sectionFontSizes[customSec.id] || globalBody || 13;
        return (
          <div key={customSec.id} className="resume-section">
            <div className="border-t border-dotted border-neutral-700 my-3.5" />
            <h2
              className="font-bold text-black uppercase tracking-wide w-full mb-2"
              style={{ fontSize: `${sectionFontSizes[`title_${customSec.id}`] || globalHeading || 13.5}px` }}
            >
              {customSec.title}
            </h2>
            <div className="flex">
              <div className="w-[155px] shrink-0" />
              <div className="flex-1">
                <div
                  className="rich-text-content text-black leading-relaxed"
                  style={{ fontSize: `${customFontSize}px` }}
                  dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
                />
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div
      className="w-full min-h-full text-black bg-white"
      style={{
        padding: '48px 48px 56px 48px',
        fontFamily: activeFont,
      }}
    >
      {/* ============ CENTERED HEADER ============ */}
      {personalInfo && (
        <div className="text-center">
          {/* Full Name */}
          <h1
            className="font-bold tracking-wider uppercase text-black leading-tight"
            style={{ fontSize: `${sectionFontSizes.name || 26}px` }}
          >
            {personalInfo.fullName || 'Your Name'}
          </h1>

          {/* Job Title */}
          {personalInfo.jobTitle && (
            <p
              className="font-bold text-black mt-1"
              style={{
                fontSize: `${sectionFontSizes.name ? Math.round(sectionFontSizes.name * 0.65) : 17}px`,
              }}
            >
              {personalInfo.jobTitle}
            </p>
          )}

          {/* Location */}
          {personalInfo.location && (
            <p
              className="text-black mt-2"
              style={{ fontSize: `${sectionFontSizes.contact || 13}px` }}
            >
              {personalInfo.location}
            </p>
          )}

          {/* Contact Details */}
          {contactDetails.length > 0 && (
            <p
              className="text-black mt-0.5"
              style={{ fontSize: `${sectionFontSizes.contact || 13}px` }}
            >
              {contactDetails.join(' - ')}
            </p>
          )}
        </div>
      )}

      {/* Dynamic Sections in order */}
      <div className="mt-2">
        {effectiveOrder.map((key) => renderSection(key))}
      </div>
    </div>
  );
}
