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
 * Technical / Developer Template — high-density, clean single-column format
 * designed for Software Engineers, Tech Leads, and Data Scientists.
 * Skills placed immediately after Professional Summary.
 * Exact consistent titles matching the editor. Continuous expanding layout without gaps.
 */
export default function TechnicalTemplate({
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

  // Deduplicate skills by normalized lowercased name
  const displaySkills = (rawSkills || []).filter(
    (s, idx, arr) => arr.findIndex((x) => x.name.trim().toLowerCase() === s.name.trim().toLowerCase()) === idx
  );

  const contactItems: string[] = [];
  if (personalInfo?.email) contactItems.push(personalInfo.email);
  if (personalInfo?.phone) contactItems.push(personalInfo.phone);
  if (personalInfo?.location) contactItems.push(personalInfo.location);
  if (personalInfo?.linkedin) contactItems.push(personalInfo.linkedin);
  if (personalInfo?.github) contactItems.push(personalInfo.github);
  if (personalInfo?.website) contactItems.push(personalInfo.website);

  // Default order: Skills right after Summary
  const defaultOrder = ['summary', 'skills', 'experience', 'education', ...customSections.map((c) => c.id)];
  const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summaryHtml) return null;
        return (
          <div key="summary" className="resume-section mb-4">
            <TechHeading title={sectionTitles?.summary || 'Professional Summary'} />
            <div
              className="rich-text-content text-slate-700 font-sans text-[14px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        );

      case 'skills':
        if (!displaySkills || displaySkills.length === 0) return null;
        return (
          <div key="skills" className="resume-section mb-4">
            <TechHeading title={sectionTitles?.skills || 'Skills & Expertise'} />
            <div className="flex flex-wrap gap-1.5 font-sans">
              {displaySkills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-2 py-0.5 bg-slate-100 text-slate-800 font-medium rounded border border-slate-200 text-[12px]"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        );

      case 'experience':
        if (!experience || experience.length === 0) return null;
        return (
          <div key="experience" className="resume-section mb-4">
            <TechHeading title={sectionTitles?.experience || 'Work Experience'} />
            <div className="space-y-3.5 font-sans">
              {experience.map((exp) => (
                <div key={exp.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-[15.5px] text-slate-900">
                      {exp.role || 'Job Title'}{' '}
                      <span className="font-normal text-indigo-600">@ {exp.company}</span>
                      {exp.location ? <span className="font-normal text-slate-400 text-xs"> — {exp.location}</span> : ''}
                    </p>
                    <p className="text-[12px] font-medium text-slate-500 font-mono">
                      {exp.startDate}
                      {(exp.endDate || exp.current) && ` — ${exp.current ? 'Present' : exp.endDate}`}
                    </p>
                  </div>
                  {exp.descriptionHtml && (
                    <div
                      className="mt-1 rich-text-content text-slate-700 text-[13.5px] leading-relaxed"
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
        return (
          <div key="education" className="resume-section mb-4">
            <TechHeading title={sectionTitles?.education || 'Education'} />
            <div className="space-y-2.5 font-sans">
              {education.map((edu) => (
                <div key={edu.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-[15px] text-slate-900">
                      {edu.degree}{' '}
                      <span className="font-normal text-slate-600">— {edu.institution}</span>
                    </p>
                    <p className="text-[12px] text-slate-500 font-mono">
                      {edu.startDate}
                      {edu.endDate && ` — ${edu.endDate}`}
                    </p>
                  </div>
                  {edu.descriptionHtml && (
                    <div
                      className="text-slate-600 text-[13px] mt-0.5"
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
        return (
          <div key={customSec.id} className="resume-section mb-4">
            <TechHeading title={customSec.title} />
            <div
              className="rich-text-content text-slate-700 font-sans text-[13.5px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
            />
          </div>
        );
      }
    }
  };

  const activeFont = getFontFamilyCss(
    pageData?.fontFamily || data.fontFamily,
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  );

  return (
    <div
      className="w-full min-h-full text-slate-800"
      style={{ padding: '38px 42px', fontSize: '13.5px', fontFamily: activeFont }}
    >
      {/* ============ HEADER ============ */}
      {personalInfo && (
        <div className="border-b-2 border-slate-800 pb-3.5 mb-4">
          <div className="flex justify-between items-baseline">
            <div>
              <h1 className="text-[26px] font-bold tracking-tight text-slate-950 font-sans leading-tight">
                {personalInfo.fullName || 'Your Name'}
              </h1>
              {personalInfo.jobTitle && (
                <p className="text-[15px] font-semibold text-indigo-700 font-sans mt-0.5">
                  {personalInfo.jobTitle}
                </p>
              )}
            </div>
          </div>

          {/* Terminal-style contact row */}
          {contactItems.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[12.5px] text-slate-600">
              {contactItems.map((item, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <span className="text-slate-300">&bull;</span>}
                  <span>{item}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Reorderable Sections (Skills immediately after Summary) */}
      {effectiveOrder.map((key) => renderSection(key))}
    </div>
  );
}

function TechHeading({ title }: { title: string }) {
  return (
    <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b border-slate-300 font-mono flex items-center gap-1.5">
      <span className="text-indigo-600 font-black">&gt;</span>
      <span>{title}</span>
    </h2>
  );
}
