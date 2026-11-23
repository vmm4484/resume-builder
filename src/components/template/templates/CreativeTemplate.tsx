import type { StructuredResumeData } from '../../../types/resume';
import type { PaginatedResumePage } from '../../../utils/pagination';
import { getFontFamilyCss } from '../../../utils/fontFamilies';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../../ui/Icons';

interface TemplateProps {
  data: StructuredResumeData;
  pageData?: PaginatedResumePage;
  page?: number;
  totalPages?: number;
}

/**
 * Creative Template — features an eye-catching gradient accent header,
 * clean typography, rounded tags, and modern dual-tone styling.
 * Skills placed immediately after Professional Summary.
 * Exact consistent titles matching the editor. Continuous expanding layout without gaps.
 */
export default function CreativeTemplate({
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

  // Default order: Skills right after Summary
  const defaultOrder = ['summary', 'skills', 'experience', 'education', ...customSections.map((c) => c.id)];
  const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summaryHtml) return null;
        return (
          <div key="summary" className="resume-section mb-5">
            <CreativeHeading title={sectionTitles?.summary || 'Professional Summary'} />
            <div
              className="rich-text-content text-slate-600 text-[14px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        );

      case 'skills':
        if (!displaySkills || displaySkills.length === 0) return null;
        return (
          <div key="skills" className="resume-section mb-5">
            <CreativeHeading title={sectionTitles?.skills || 'Skills & Expertise'} />
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-2.5 py-0.5 bg-violet-50 text-violet-700 font-semibold rounded-full border border-violet-100 text-[12px]"
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
          <div key="experience" className="resume-section mb-5">
            <CreativeHeading title={sectionTitles?.experience || 'Work Experience'} />
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="resume-entry-item relative pl-3.5 border-l-2 border-indigo-200">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-[15.5px] text-slate-900">
                      {exp.role || 'Job Title'}{' '}
                      <span className="font-semibold text-indigo-600">· {exp.company}</span>
                    </p>
                    <p className="text-[12px] font-semibold text-slate-400">
                      {exp.startDate}
                      {(exp.endDate || exp.current) && ` — ${exp.current ? 'Present' : exp.endDate}`}
                    </p>
                  </div>
                  {exp.descriptionHtml && (
                    <div
                      className="mt-1 rich-text-content text-slate-600 text-[13.5px] leading-relaxed"
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
          <div key="education" className="resume-section mb-5">
            <CreativeHeading title={sectionTitles?.education || 'Education'} />
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="resume-entry-item flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[15px] text-slate-900">{edu.degree}</p>
                    <p className="text-[13.5px] text-indigo-600 font-medium">{edu.institution}</p>
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium">
                    {edu.startDate}
                    {edu.endDate && ` — ${edu.endDate}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default: {
        const customSec = customSections.find((c) => c.id === key);
        if (!customSec || !customSec.contentHtml) return null;
        return (
          <div key={customSec.id} className="resume-section mb-5">
            <CreativeHeading title={customSec.title} />
            <div
              className="rich-text-content text-slate-600 text-[13.5px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
            />
          </div>
        );
      }
    }
  };

  const activeFont = getFontFamilyCss(
    pageData?.fontFamily || data.fontFamily,
    'Arial, Helvetica, "Nimbus Sans", sans-serif'
  );

  return (
    <div
      className="w-full min-h-full text-slate-800 bg-white"
      style={{ fontFamily: activeFont }}
    >
      {/* ============ ACCENT HEADER ============ */}
      {personalInfo && (
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white px-8 py-7 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-[30px] font-black tracking-tight leading-tight">
                {personalInfo.fullName || 'Your Name'}
              </h1>
              {personalInfo.jobTitle && (
                <p className="text-violet-200 text-[15px] font-semibold tracking-wide mt-0.5">
                  {personalInfo.jobTitle}
                </p>
              )}
            </div>
            {personalInfo.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md"
              />
            )}
          </div>

          {/* Contact Pills */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3.5 text-[12.5px] text-violet-100">
            {personalInfo.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-violet-300" />
                <span>{personalInfo.email}</span>
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-violet-300" />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-violet-300" />
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1.5">
                <LinkedinIcon className="w-3.5 h-3.5 text-violet-300" />
                <span>{personalInfo.linkedin}</span>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-violet-300" />
                <span>{personalInfo.github}</span>
              </span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-300" />
                <span>{personalInfo.website}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Reorderable Sections (Skills immediately after Summary) */}
      <div className="px-8 py-5">
        {effectiveOrder.map((key) => renderSection(key))}
      </div>
    </div>
  );
}

function CreativeHeading({ title }: { title: string }) {
  return (
    <h2 className="text-[15px] font-bold text-indigo-700 uppercase tracking-wider mb-2 pb-1 border-b border-indigo-100 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
      <span>{title}</span>
    </h2>
  );
}
