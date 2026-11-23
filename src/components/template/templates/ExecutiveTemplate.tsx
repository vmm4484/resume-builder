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
 * Executive Template — classic, authoritative leadership resume.
 * Bold serif name top-left, contact right-aligned, prominent horizontal rules.
 * Skills placed immediately after Professional Summary.
 * Exact consistent titles matching the editor. Continuous expanding layout without gaps.
 */
export default function ExecutiveTemplate({
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
    (s, idx, arr) => arr.findIndex((x) => x.name.trim().toLowerCase() === s.name.trim().toLowerCase()) === idx
  );

  // Default order: Skills right after Summary
  const defaultOrder = ['summary', 'skills', 'experience', 'education', ...customSections.map((c) => c.id)];
  const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const globalBody = sectionFontSizes.globalBody;
  const globalHeading = sectionFontSizes.globalHeading;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summaryHtml) return null;
        return (
          <div key="summary" className="resume-section mb-5">
            <ExecSection
              title={sectionTitles?.summary || 'Professional Summary'}
              fontSize={sectionFontSizes.title_summary || globalHeading}
            />
            <div
              className="rich-text-content"
              style={{
                fontSize: `${sectionFontSizes.summary || globalBody || 14}px`,
                color: '#374151',
                lineHeight: '1.65',
                fontFamily: 'system-ui, sans-serif',
              }}
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        );

      case 'skills':
        if (!displaySkills || displaySkills.length === 0) return null;
        return (
          <div key="skills" className="resume-section mb-5">
            <ExecSection
              title={sectionTitles?.skills || 'Skills & Expertise'}
              fontSize={sectionFontSizes.title_skills || globalHeading}
            />
            <div
              className="flex flex-wrap gap-x-4 gap-y-1.5"
              style={{
                fontSize: `${sectionFontSizes.skills || globalBody || 13.5}px`,
                color: '#374151',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {displaySkills.map((skill) => (
                <span key={skill.id} className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#1f2937' }}
                  />
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        );

      case 'experience': {
        if (!experience || experience.length === 0) return null;
        const expFontSize = sectionFontSizes.experience || globalBody || 13.5;
        return (
          <div key="experience" className="resume-section mb-5">
            <ExecSection
              title={sectionTitles?.experience || 'Work Experience'}
              fontSize={sectionFontSizes.title_experience || globalHeading}
            />
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p
                        className="font-bold"
                        style={{
                          fontSize: `${expFontSize + 2.5}px`,
                          color: '#111827',
                          fontFamily: 'Georgia, "Times New Roman", serif',
                        }}
                      >
                        {exp.role || 'Job Title'}
                      </p>
                      <p
                        className="italic"
                        style={{ fontSize: `${expFontSize + 0.5}px`, color: '#4b5563' }}
                      >
                        {exp.company}
                        {exp.location ? ` — ${exp.location}` : ''}
                      </p>
                    </div>
                    <p
                      className="shrink-0 font-medium font-sans"
                      style={{ fontSize: `${Math.max(10, expFontSize - 1.5)}px`, color: '#6b7280' }}
                    >
                      {exp.startDate}
                      {(exp.endDate || exp.current) &&
                        ` – ${exp.current ? 'Present' : exp.endDate}`}
                    </p>
                  </div>
                  {exp.descriptionHtml && (
                    <div
                      className="mt-1.5 rich-text-content"
                      style={{
                        fontSize: `${expFontSize}px`,
                        color: '#374151',
                        lineHeight: '1.6',
                        fontFamily: 'system-ui, sans-serif',
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

      case 'education': {
        if (!education || education.length === 0) return null;
        const eduFontSize = sectionFontSizes.education || globalBody || 13.5;
        return (
          <div key="education" className="resume-section mb-5">
            <ExecSection
              title={sectionTitles?.education || 'Education'}
              fontSize={sectionFontSizes.title_education || globalHeading}
            />
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <p
                        className="font-bold"
                        style={{
                          fontSize: `${eduFontSize + 2}px`,
                          color: '#111827',
                          fontFamily: 'Georgia, "Times New Roman", serif',
                        }}
                      >
                        {edu.degree || 'Degree'}
                      </p>
                      <p
                        className="italic"
                        style={{ fontSize: `${eduFontSize + 0.5}px`, color: '#4b5563' }}
                      >
                        {edu.institution}
                        {edu.location ? ` — ${edu.location}` : ''}
                      </p>
                    </div>
                    <p
                      className="shrink-0 font-medium font-sans"
                      style={{ fontSize: `${Math.max(10, eduFontSize - 1.5)}px`, color: '#6b7280' }}
                    >
                      {edu.startDate}
                      {edu.endDate && ` – ${edu.endDate}`}
                    </p>
                  </div>
                  {edu.descriptionHtml && (
                    <div
                      className="mt-1 rich-text-content"
                      style={{
                        fontSize: `${eduFontSize}px`,
                        color: '#4b5563',
                        lineHeight: '1.55',
                        fontFamily: 'system-ui, sans-serif',
                      }}
                      dangerouslySetInnerHTML={{ __html: edu.descriptionHtml }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      default: {
        const customSec = customSections.find((c) => c.id === key);
        if (!customSec || !customSec.contentHtml) return null;
        const customSize = sectionFontSizes[customSec.id] || globalBody || 13.5;
        return (
          <div key={customSec.id} className="resume-section mb-5">
            <ExecSection
              title={customSec.title}
              fontSize={sectionFontSizes[`title_${customSec.id}`] || globalHeading}
            />
            <div
              className="rich-text-content"
              style={{
                fontSize: `${customSize}px`,
                color: '#4b5563',
                lineHeight: '1.6',
                fontFamily: 'system-ui, sans-serif',
              }}
              dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
            />
          </div>
        );
      }
    }
  };

  const nameSize = sectionFontSizes.name || 30;
  const contactSize = sectionFontSizes.contact || 12.5;

  const activeFont = getFontFamilyCss(
    pageData?.fontFamily || data.fontFamily,
    'Georgia, "Times New Roman", serif'
  );

  return (
    <div
      className="w-full min-h-full"
      style={{
        color: '#1f2937',
        padding: '40px 40px',
        fontFamily: activeFont,
      }}
    >
      {/* ============ HEADER ============ */}
      {personalInfo && (
        <div
          className="pb-3.5 mb-5"
          style={{ borderBottom: '3px solid #1f2937' }}
        >
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-4">
              {personalInfo.photoUrl && (
                <img
                  src={personalInfo.photoUrl}
                  alt=""
                  className="w-16 h-16 rounded object-cover"
                  style={{ border: '2px solid #d1d5db' }}
                />
              )}
              <div>
                <h1
                  className="font-bold leading-tight"
                  style={{
                    fontSize: `${nameSize}px`,
                    color: '#111827',
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}
                >
                  {personalInfo.fullName || 'Your Name'}
                </h1>
                {personalInfo.jobTitle && (
                  <p
                    className="italic mt-0.5"
                    style={{ fontSize: `${Math.max(12, nameSize - 14)}px`, color: '#4b5563' }}
                  >
                    {personalInfo.jobTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Contact right-aligned */}
            <div
              className="text-right space-y-0.5"
              style={{ fontSize: `${contactSize}px`, color: '#4b5563', fontFamily: 'system-ui, sans-serif' }}
            >
              {personalInfo.email && <p>{personalInfo.email}</p>}
              {personalInfo.phone && <p>{personalInfo.phone}</p>}
              {personalInfo.location && <p>{personalInfo.location}</p>}
              {personalInfo.website && <p>{personalInfo.website}</p>}
              {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
              {personalInfo.github && <p>{personalInfo.github}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Reorderable Sections (Skills immediately after Summary) */}
      {effectiveOrder.map((key) => renderSection(key))}
    </div>
  );
}

function ExecSection({ title, fontSize }: { title: string; fontSize?: number }) {
  return (
    <h2
      className="uppercase tracking-wider mb-2.5 pb-1"
      style={{
        fontSize: `${fontSize || 15}px`,
        color: '#1f2937',
        fontWeight: 700,
        borderBottom: '2px solid #1f2937',
        fontFamily: 'Georgia, "Times New Roman", serif',
        letterSpacing: '1px',
      }}
    >
      {title}
    </h2>
  );
}
