import type { StructuredResumeData } from '../../../types/resume';
import type { PaginatedResumePage } from '../../../utils/pagination';

interface TemplateProps {
  data: StructuredResumeData;
  pageData?: PaginatedResumePage;
  page?: number;
  totalPages?: number;
}

/**
 * Minimalist Template — single-column, centered header, generous whitespace.
 * Skills placed immediately after Professional Summary.
 * Exact consistent titles matching the editor. Continuous expanding layout without gaps.
 */
export default function MinimalistTemplate({
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

  const contactParts: string[] = [];
  if (personalInfo?.email) contactParts.push(personalInfo.email);
  if (personalInfo?.phone) contactParts.push(personalInfo.phone);
  if (personalInfo?.location) contactParts.push(personalInfo.location);
  if (personalInfo?.website) contactParts.push(personalInfo.website);
  if (personalInfo?.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo?.github) contactParts.push(personalInfo.github);

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
            <MinimalSection
              title={sectionTitles?.summary || 'Professional Summary'}
              fontSize={sectionFontSizes.title_summary || globalHeading}
            />
            <div
              className="rich-text-content"
              style={{
                fontSize: `${sectionFontSizes.summary || globalBody || 14}px`,
                color: '#4b5563',
                lineHeight: '1.65',
              }}
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        );

      case 'skills':
        if (!displaySkills || displaySkills.length === 0) return null;
        return (
          <div key="skills" className="resume-section mb-5">
            <MinimalSection
              title={sectionTitles?.skills || 'Skills & Expertise'}
              fontSize={sectionFontSizes.title_skills || globalHeading}
            />
            <p
              style={{
                fontSize: `${sectionFontSizes.skills || globalBody || 14}px`,
                color: '#4b5563',
                lineHeight: '1.7',
              }}
            >
              {displaySkills.map((s) => s.name).join('  ·  ')}
            </p>
          </div>
        );

      case 'experience':
        if (!experience || experience.length === 0) return null;
        const expFontSize = sectionFontSizes.experience || globalBody || 13.5;
        return (
          <div key="experience" className="resume-section mb-5">
            <MinimalSection
              title={sectionTitles?.experience || 'Work Experience'}
              fontSize={sectionFontSizes.title_experience || globalHeading}
            />
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <p
                      className="font-semibold"
                      style={{ fontSize: `${expFontSize + 2}px`, color: '#111827' }}
                    >
                      {exp.role || 'Job Title'}
                    </p>
                    <p style={{ fontSize: `${Math.max(10, expFontSize - 1.5)}px`, color: '#9ca3af' }}>
                      {exp.startDate}
                      {(exp.endDate || exp.current) &&
                        ` — ${exp.current ? 'Present' : exp.endDate}`}
                    </p>
                  </div>
                  <p style={{ fontSize: `${expFontSize}px`, color: '#6b7280' }}>
                    {exp.company}
                    {exp.location ? `, ${exp.location}` : ''}
                  </p>
                  {exp.descriptionHtml && (
                    <div
                      className="mt-1.5 rich-text-content"
                      style={{
                        fontSize: `${expFontSize}px`,
                        color: '#6b7280',
                        lineHeight: '1.6',
                      }}
                      dangerouslySetInnerHTML={{ __html: exp.descriptionHtml }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        const eduFontSize = sectionFontSizes.education || globalBody || 13.5;
        return (
          <div key="education" className="resume-section mb-5">
            <MinimalSection
              title={sectionTitles?.education || 'Education'}
              fontSize={sectionFontSizes.title_education || globalHeading}
            />
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <p
                      className="font-semibold"
                      style={{ fontSize: `${eduFontSize + 1.5}px`, color: '#111827' }}
                    >
                      {edu.degree || 'Degree'}
                    </p>
                    <p style={{ fontSize: `${Math.max(10, eduFontSize - 1.5)}px`, color: '#9ca3af' }}>
                      {edu.startDate}
                      {edu.endDate && ` — ${edu.endDate}`}
                    </p>
                  </div>
                  <p style={{ fontSize: `${eduFontSize}px`, color: '#6b7280' }}>
                    {edu.institution}
                    {edu.location ? `, ${edu.location}` : ''}
                  </p>
                  {edu.descriptionHtml && (
                    <div
                      className="mt-1 rich-text-content"
                      style={{
                        fontSize: `${eduFontSize}px`,
                        color: '#6b7280',
                        lineHeight: '1.55',
                      }}
                      dangerouslySetInnerHTML={{ __html: edu.descriptionHtml }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default: {
        const customSec = customSections.find((c) => c.id === key);
        if (!customSec || !customSec.contentHtml) return null;
        const customSize = sectionFontSizes[customSec.id] || globalBody || 13.5;
        return (
          <div key={customSec.id} className="resume-section mb-5">
            <MinimalSection
              title={customSec.title}
              fontSize={sectionFontSizes[`title_${customSec.id}`] || globalHeading}
            />
            <div
              className="rich-text-content"
              style={{
                fontSize: `${customSize}px`,
                color: '#6b7280',
                lineHeight: '1.6',
              }}
              dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
            />
          </div>
        );
      }
    }
  };

  return (
    <div
      className="w-full min-h-full font-sans"
      style={{ color: '#374151', padding: '40px 42px' }}
    >
      {/* ============ HEADER ============ */}
      {personalInfo && (
        <>
          <div className="text-center mb-5">
            {personalInfo.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                alt=""
                className="w-18 h-18 rounded-full object-cover mx-auto mb-2.5"
                style={{ border: '2px solid #e5e7eb' }}
              />
            )}
            <h1
              className="font-light tracking-widest uppercase"
              style={{ fontSize: `${sectionFontSizes.name || 28}px`, color: '#111827', letterSpacing: '4px' }}
            >
              {personalInfo.fullName || 'Your Name'}
            </h1>
            {personalInfo.jobTitle && (
              <p
                className="mt-1 tracking-wide font-medium"
                style={{ fontSize: `${Math.max(12, (sectionFontSizes.name || 28) - 13)}px`, color: '#6b7280', letterSpacing: '2px' }}
              >
                {personalInfo.jobTitle}
              </p>
            )}

            {/* Contact row */}
            {contactParts.length > 0 && (
              <div
                className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mt-2.5"
                style={{ fontSize: `${sectionFontSizes.contact || 12.5}px`, color: '#6b7280' }}
              >
                {contactParts.map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && (
                      <span className="mr-2" style={{ color: '#d1d5db' }}>
                        |
                      </span>
                    )}
                    {part}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            className="mb-5"
            style={{ borderBottom: '1px solid #e5e7eb' }}
          />
        </>
      )}

      {/* Dynamic Reorderable Sections (Skills immediately after Summary) */}
      {effectiveOrder.map((key) => renderSection(key))}
    </div>
  );
}

function MinimalSection({ title, fontSize }: { title: string; fontSize?: number }) {
  return (
    <h2
      className="uppercase tracking-widest mb-2.5 pb-1"
      style={{
        fontSize: `${fontSize || 14}px`,
        color: '#6b7280',
        letterSpacing: '2px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: 700,
      }}
    >
      {title}
    </h2>
  );
}
