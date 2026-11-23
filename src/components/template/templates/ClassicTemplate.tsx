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
 * Classic Academic / Corporate Template — traditional, timeless layout
 * with subtle frame accents, formal section headings, and balanced margins.
 * Skills placed immediately after Professional Summary.
 * Exact consistent titles matching the editor. Continuous expanding layout without gaps.
 */
export default function ClassicTemplate({
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

  const contactList: string[] = [];
  if (personalInfo?.email) contactList.push(personalInfo.email);
  if (personalInfo?.phone) contactList.push(personalInfo.phone);
  if (personalInfo?.location) contactList.push(personalInfo.location);
  if (personalInfo?.linkedin) contactList.push(personalInfo.linkedin);
  if (personalInfo?.github) contactList.push(personalInfo.github);
  if (personalInfo?.website) contactList.push(personalInfo.website);

  // Default order: Skills right after Summary
  const defaultOrder = ['summary', 'skills', 'experience', 'education', ...customSections.map((c) => c.id)];
  const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summaryHtml) return null;
        return (
          <div key="summary" className="resume-section mb-4">
            <ClassicHeading title={sectionTitles?.summary || 'Professional Summary'} />
            <div
              className="rich-text-content text-neutral-700 text-[14px] leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        );

      case 'skills':
        if (!displaySkills || displaySkills.length === 0) return null;
        return (
          <div key="skills" className="resume-section mb-4">
            <ClassicHeading title={sectionTitles?.skills || 'Skills & Expertise'} />
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-sans text-[13.5px] text-neutral-800">
              {displaySkills.map((skill) => (
                <span key={skill.id} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
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
            <ClassicHeading title={sectionTitles?.experience || 'Work Experience'} />
            <div className="space-y-3.5 font-sans">
              {experience.map((exp) => (
                <div key={exp.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-[15.5px] text-neutral-900 font-serif">
                      {exp.role || 'Job Title'},{' '}
                      <span className="font-normal italic text-neutral-700">{exp.company}</span>
                      {exp.location ? <span className="font-normal text-neutral-500 text-xs"> — {exp.location}</span> : ''}
                    </p>
                    <p className="text-xs text-neutral-600 font-serif">
                      {exp.startDate}
                      {(exp.endDate || exp.current) && ` – ${exp.current ? 'Present' : exp.endDate}`}
                    </p>
                  </div>
                  {exp.descriptionHtml && (
                    <div
                      className="mt-1 rich-text-content text-neutral-700 text-[13.5px] leading-relaxed"
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
            <ClassicHeading title={sectionTitles?.education || 'Education'} />
            <div className="space-y-2.5 font-sans">
              {education.map((edu) => (
                <div key={edu.id} className="resume-entry-item">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-[15px] text-neutral-900 font-serif">
                      {edu.degree},{' '}
                      <span className="font-normal italic text-neutral-700">{edu.institution}</span>
                    </p>
                    <p className="text-xs text-neutral-600 font-serif">
                      {edu.startDate}
                      {edu.endDate && ` – ${edu.endDate}`}
                    </p>
                  </div>
                  {edu.descriptionHtml && (
                    <div
                      className="text-neutral-600 text-[13px] mt-0.5"
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
            <ClassicHeading title={customSec.title} />
            <div
              className="rich-text-content text-neutral-700 font-sans text-[13.5px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
            />
          </div>
        );
      }
    }
  };

  const activeFont = getFontFamilyCss(
    pageData?.fontFamily || data.fontFamily,
    '"Times New Roman", Times, Georgia, serif'
  );

  return (
    <div
      className="w-full min-h-full text-neutral-900 bg-white"
      style={{ padding: '40px 44px', fontFamily: activeFont }}
    >
      {/* ============ HEADER ============ */}
      {personalInfo && (
        <div className="text-center pb-3.5 mb-4 border-b border-neutral-300">
          <h1 className="text-[26px] font-bold tracking-wider uppercase text-neutral-900 leading-tight">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          {personalInfo.jobTitle && (
            <p className="text-[14px] italic tracking-widest text-neutral-600 uppercase mt-0.5 font-sans">
              {personalInfo.jobTitle}
            </p>
          )}

          {/* Centered Contact Items */}
          {contactList.length > 0 && (
            <div className="flex justify-center flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[12.5px] text-neutral-600 font-sans">
              {contactList.map((item, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="mr-3 text-neutral-300">|</span>}
                  {item}
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

function ClassicHeading({ title }: { title: string }) {
  return (
    <h2 className="text-[14.5px] font-bold text-neutral-900 uppercase tracking-widest mb-1.5 pb-1 border-b border-neutral-400 font-serif">
      {title}
    </h2>
  );
}
