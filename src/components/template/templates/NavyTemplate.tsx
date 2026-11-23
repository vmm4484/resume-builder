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
 * Corporate Navy Template
 * Exact match to user-designed layout:
 * - Solid deep navy header banner with white bold name & soft blue subtitle on left,
 *   and right-aligned clean white contact info.
 * - Clean subtle divider line below the banner.
 * - Uppercase bold slate section headings (PROFESSIONAL SUMMARY, WORK EXPERIENCE, SKILLS & EXPERTISE, EDUCATION).
 * - Work experience with role in bold, em dash company, right-aligned muted dates, and clean bullets.
 * - Skills in clean inline bullet-separated format ("JAVA • Angular • React • ...").
 * - Clean education entries with degree, institution, and bullet points.
 * - Real-time custom font-size overrides for every section.
 */
export default function NavyTemplate({
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
      arr.findIndex(
        (x) => x.name.trim().toLowerCase() === s.name.trim().toLowerCase()
      ) === idx
  );

  const defaultOrder = [
    'summary',
    'experience',
    'skills',
    'education',
    ...customSections.map((c) => c.id),
  ];
  const effectiveOrder =
    sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const globalBody = sectionFontSizes.globalBody;
  const globalHeading = sectionFontSizes.globalHeading;

  const activeFont = getFontFamilyCss(
    pageData?.fontFamily || data.fontFamily,
    'Arial, Helvetica, "Nimbus Sans", sans-serif'
  );

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary': {
        if (!summaryHtml) return null;
        const titleSize = sectionFontSizes.title_summary || globalHeading || 13;
        const textSize = sectionFontSizes.summary || globalBody || 13;
        return (
          <div key="summary" className="resume-section mb-5">
            <h2
              className="uppercase font-bold tracking-wider mb-2 text-slate-800"
              style={{ fontSize: `${titleSize}px` }}
            >
              {sectionTitles?.summary || 'PROFESSIONAL SUMMARY'}
            </h2>
            <div
              className="rich-text-content text-slate-700 leading-relaxed"
              style={{ fontSize: `${textSize}px`, lineHeight: '1.62' }}
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        );
      }

      case 'experience': {
        if (!experience || experience.length === 0) return null;
        const titleSize = sectionFontSizes.title_experience || globalHeading || 13;
        const expFontSize = sectionFontSizes.experience || globalBody || 12.5;
        return (
          <div key="experience" className="resume-section mb-5">
            <h2
              className="uppercase font-bold tracking-wider mb-2.5 text-slate-800"
              style={{ fontSize: `${titleSize}px` }}
            >
              {sectionTitles?.experience || 'WORK EXPERIENCE'}
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline gap-2">
                    <p
                      className="text-slate-900 leading-snug"
                      style={{ fontSize: `${expFontSize + 1.5}px` }}
                    >
                      <span className="font-bold">{exp.role || 'Job Title'}</span>
                      {exp.company && (
                        <span className="font-normal text-slate-700">
                          {' '}— {exp.company}
                        </span>
                      )}
                      {exp.location && (
                        <span className="font-normal text-slate-500 text-xs">
                          , {exp.location}
                        </span>
                      )}
                    </p>
                    <p
                      className="text-slate-400 font-normal shrink-0 text-right"
                      style={{
                        fontSize: `${Math.max(10, expFontSize - 1)}px`,
                      }}
                    >
                      {exp.startDate}
                      {(exp.endDate || exp.current) &&
                        ` — ${exp.current ? 'Present' : exp.endDate}`}
                    </p>
                  </div>
                  {exp.descriptionHtml && (
                    <div
                      className="mt-1.5 rich-text-content text-slate-600"
                      style={{
                        fontSize: `${expFontSize}px`,
                        lineHeight: '1.58',
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.descriptionHtml }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'skills': {
        if (!displaySkills || displaySkills.length === 0) return null;
        const titleSize = sectionFontSizes.title_skills || globalHeading || 13;
        const skillFontSize = sectionFontSizes.skills || globalBody || 13;
        return (
          <div key="skills" className="resume-section mb-5">
            <h2
              className="uppercase font-bold tracking-wider mb-2 text-slate-800"
              style={{ fontSize: `${titleSize}px` }}
            >
              {sectionTitles?.skills || 'SKILLS & EXPERTISE'}
            </h2>
            <p
              className="text-slate-700 leading-relaxed"
              style={{ fontSize: `${skillFontSize}px`, lineHeight: '1.6' }}
            >
              {displaySkills.map((s) => s.name).join(' • ')}
            </p>
          </div>
        );
      }

      case 'education': {
        if (!education || education.length === 0) return null;
        const titleSize = sectionFontSizes.title_education || globalHeading || 13;
        const eduFontSize = sectionFontSizes.education || globalBody || 12.5;
        return (
          <div key="education" className="resume-section mb-5">
            <h2
              className="uppercase font-bold tracking-wider mb-2.5 text-slate-800"
              style={{ fontSize: `${titleSize}px` }}
            >
              {sectionTitles?.education || 'EDUCATION'}
            </h2>
            <div className="space-y-3">
              {education.map((edu) => {
                const datePrefix = edu.startDate ? `${edu.startDate} ` : '';
                const dateSuffix =
                  !datePrefix && edu.endDate ? edu.endDate : '';
                return (
                  <div key={edu.id} className="resume-entry-item">
                    <div className="flex justify-between items-baseline gap-2">
                      <p
                        className="text-slate-900 leading-snug"
                        style={{ fontSize: `${eduFontSize + 1.5}px` }}
                      >
                        {datePrefix && (
                          <span className="font-semibold text-slate-800">
                            {datePrefix}
                          </span>
                        )}
                        <span className="font-bold">{edu.degree || 'Degree'}</span>
                        {edu.institution && (
                          <span className="font-normal text-slate-700">
                            {' '}— {edu.institution}
                          </span>
                        )}
                        {edu.location && (
                          <span className="font-normal text-slate-500 text-xs">
                            {' '}— {edu.location}
                          </span>
                        )}
                      </p>
                      {dateSuffix && (
                        <p
                          className="text-slate-400 font-normal shrink-0 text-right"
                          style={{
                            fontSize: `${Math.max(10, eduFontSize - 1)}px`,
                          }}
                        >
                          {dateSuffix}
                        </p>
                      )}
                    </div>
                    {edu.descriptionHtml && (
                      <div
                        className="mt-1 rich-text-content text-slate-600"
                        style={{
                          fontSize: `${eduFontSize}px`,
                          lineHeight: '1.55',
                        }}
                        dangerouslySetInnerHTML={{ __html: edu.descriptionHtml }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      default: {
        const customSec = customSections.find((c) => c.id === key);
        if (!customSec || !customSec.contentHtml) return null;
        const titleSize = sectionFontSizes[`title_${customSec.id}`] || globalHeading || 13;
        const customSize = sectionFontSizes[customSec.id] || globalBody || 12.5;
        return (
          <div key={customSec.id} className="resume-section mb-5">
            <h2
              className="uppercase font-bold tracking-wider mb-2 text-slate-800"
              style={{ fontSize: `${titleSize}px` }}
            >
              {customSec.title}
            </h2>
            <div
              className="rich-text-content text-slate-700 leading-relaxed"
              style={{ fontSize: `${customSize}px`, lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
            />
          </div>
        );
      }
    }
  };

  const nameSize = sectionFontSizes.name || 24;
  const contactSize = sectionFontSizes.contact || 12;

  return (
    <div
      className="w-full min-h-full bg-white"
      style={{ color: '#334155', padding: '34px 38px', fontFamily: activeFont }}
    >
      {/* ============ NAVY HEADER BANNER ============ */}
      {personalInfo && (
        <header
          className="w-full text-white px-5 py-4 rounded-xs mb-4 shadow-xs"
          style={{ backgroundColor: '#0f174e' }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left Column: Name & Title */}
            <div className="min-w-0">
              <h1
                className="font-bold uppercase tracking-wider text-white leading-tight"
                style={{ fontSize: `${nameSize}px` }}
              >
                {personalInfo.fullName || 'Your Name'}
              </h1>
              {personalInfo.jobTitle && (
                <p
                  className="font-medium mt-1 tracking-normal"
                  style={{
                    fontSize: `${Math.max(12, nameSize - 10)}px`,
                    color: '#93c5fd',
                  }}
                >
                  {personalInfo.jobTitle}
                </p>
              )}
            </div>

            {/* Right Column: Contact Details */}
            <div
              className="text-right shrink-0 space-y-0.5"
              style={{
                fontSize: `${contactSize}px`,
                color: 'rgba(255, 255, 255, 0.92)',
                lineHeight: '1.35',
              }}
            >
              {personalInfo.email && <p>{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.location && <p>{personalInfo.location}</p>}
              {personalInfo.linkedin && (
                <p className="text-sky-200">{personalInfo.linkedin}</p>
              )}
              {personalInfo.github && (
                <p className="text-sky-200">{personalInfo.github}</p>
              )}
              {personalInfo.website && (
                <p className="text-sky-200">{personalInfo.website}</p>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Subtle Horizontal Divider below Header Banner */}
      <div className="border-b border-slate-200/80 mb-4" />

      {/* Dynamic Ordered Resume Sections */}
      {effectiveOrder.map((key) => renderSection(key))}
    </div>
  );
}
