import type { StructuredResumeData } from '../../../types/resume';
import type { PaginatedResumePage } from '../../../utils/pagination';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../../ui/Icons';

interface TemplateProps {
  data: StructuredResumeData;
  pageData?: PaginatedResumePage;
  page?: number;
  totalPages?: number;
}

/**
 * Modern Template — two-column layout with a stylish slate left sidebar.
 * Sidebar: photo, name, contact info.
 * Main: summary, skills, experience, education, custom sections in consistent editor order.
 * Natural continuous flow without gaps; splits cleanly during download.
 */
export default function ModernTemplate({
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

  const hasContact = Boolean(
    personalInfo?.email ||
    personalInfo?.phone ||
    personalInfo?.location ||
    personalInfo?.website ||
    personalInfo?.linkedin ||
    personalInfo?.github
  );

  // Default order has Skills right after Professional Summary
  const defaultOrder = ['summary', 'skills', 'experience', 'education', ...customSections.map((c) => c.id)];
  const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summaryHtml) return null;
        return (
          <div key="summary" className="resume-section mb-5">
            <SectionHeading>{sectionTitles?.summary || 'Professional Summary'}</SectionHeading>
            <div
              className="rich-text-content"
              style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>
        );

      case 'skills':
        if (!displaySkills || displaySkills.length === 0) return null;
        return (
          <div key="skills" className="resume-section mb-5">
            <SectionHeading>{sectionTitles?.skills || 'Skills & Expertise'}</SectionHeading>
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 font-medium rounded border border-slate-200 text-[12px]"
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
            <SectionHeading>{sectionTitles?.experience || 'Work Experience'}</SectionHeading>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="resume-entry-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ fontSize: '15.5px', color: '#0f172a' }}
                      >
                        {exp.role || 'Job Title'}
                      </p>
                      <p style={{ fontSize: '13.5px', color: '#6366f1' }}>
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ''}
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-right font-medium"
                      style={{ fontSize: '12px', color: '#94a3b8' }}
                    >
                      {exp.startDate}
                      {(exp.endDate || exp.current) &&
                        ` — ${exp.current ? 'Present' : exp.endDate}`}
                    </p>
                  </div>
                  {exp.descriptionHtml && (
                    <div
                      className="mt-1.5 rich-text-content"
                      style={{
                        fontSize: '13.5px',
                        color: '#64748b',
                        lineHeight: '1.55',
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
        return (
          <div key="education" className="resume-section mb-5">
            <SectionHeading>{sectionTitles?.education || 'Education'}</SectionHeading>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="resume-entry-item">
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ fontSize: '15px', color: '#0f172a' }}
                      >
                        {edu.degree || 'Degree'}
                      </p>
                      <p style={{ fontSize: '13.5px', color: '#6366f1' }}>
                        {edu.institution}
                        {edu.location ? ` · ${edu.location}` : ''}
                      </p>
                    </div>
                    <p
                      className="shrink-0 text-right font-medium"
                      style={{ fontSize: '12px', color: '#94a3b8' }}
                    >
                      {edu.startDate}
                      {edu.endDate && ` — ${edu.endDate}`}
                    </p>
                  </div>
                  {edu.descriptionHtml && (
                    <div
                      className="mt-1 rich-text-content"
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        lineHeight: '1.5',
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
        return (
          <div key={customSec.id} className="resume-section mb-5">
            <SectionHeading>{customSec.title}</SectionHeading>
            <div
              className="rich-text-content"
              style={{
                fontSize: '13.5px',
                color: '#64748b',
                lineHeight: '1.55',
              }}
              dangerouslySetInnerHTML={{ __html: customSec.contentHtml }}
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="modern-resume-wrapper w-full min-h-full flex text-[13.5px] leading-[1.5] font-sans">
      {/* ============ LEFT SIDEBAR ============ */}
      <div
        className="modern-resume-sidebar shrink-0 text-white p-6"
        style={{
          width: '35%',
          backgroundColor: '#1e293b',
        }}
      >
        <div>
          {personalInfo && (
            <>
              {personalInfo.photoUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={personalInfo.photoUrl}
                    alt=""
                    className="w-22 h-22 rounded-full object-cover border-3 border-white/20"
                  />
                </div>
              )}

              {/* Name & Title */}
              <div className="mb-5">
                <h1
                  className="font-bold tracking-wide text-white leading-tight mb-1"
                  style={{ fontSize: '26px' }}
                >
                  {personalInfo.fullName || 'Your Name'}
                </h1>
                {personalInfo.jobTitle && (
                  <p
                    className="font-medium tracking-wide"
                    style={{ fontSize: '14px', color: '#94a3b8' }}
                  >
                    {personalInfo.jobTitle}
                  </p>
                )}
              </div>

              {/* Contact */}
              {hasContact && (
                <div className="mb-5">
                  <h2
                    className="font-bold uppercase tracking-widest mb-2.5 pb-1"
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      borderBottom: '1px solid rgba(148,163,184,0.3)',
                    }}
                  >
                    Contact
                  </h2>
                  <div className="space-y-2">
                    {personalInfo.email && (
                      <ContactLine icon={<Mail className="w-3.5 h-3.5 shrink-0" />}>
                        {personalInfo.email}
                      </ContactLine>
                    )}
                    {personalInfo.phone && (
                      <ContactLine icon={<Phone className="w-3.5 h-3.5 shrink-0" />}>
                        {personalInfo.phone}
                      </ContactLine>
                    )}
                    {personalInfo.location && (
                      <ContactLine icon={<MapPin className="w-3.5 h-3.5 shrink-0" />}>
                        {personalInfo.location}
                      </ContactLine>
                    )}
                    {personalInfo.website && (
                      <ContactLine icon={<Globe className="w-3.5 h-3.5 shrink-0" />}>
                        {personalInfo.website}
                      </ContactLine>
                    )}
                    {personalInfo.linkedin && (
                      <ContactLine icon={<LinkedinIcon className="w-3.5 h-3.5 shrink-0" />}>
                        {personalInfo.linkedin}
                      </ContactLine>
                    )}
                    {personalInfo.github && (
                      <ContactLine icon={<GithubIcon className="w-3.5 h-3.5 shrink-0" />}>
                        {personalInfo.github}
                      </ContactLine>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============ MAIN CONTENT (Ordered dynamically, skills after summary) ============ */}
      <div className="modern-resume-main flex-1 p-6" style={{ color: '#1e293b' }}>
        {effectiveOrder.map((key) => renderSection(key))}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-bold uppercase tracking-wider mb-2 pb-1"
      style={{
        fontSize: '15px',
        color: '#0f172a',
        borderBottom: '2px solid #6366f1',
      }}
    >
      {children}
    </h2>
  );
}

function ContactLine({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2" style={{ fontSize: '12.5px' }}>
      <span style={{ color: '#94a3b8' }}>{icon}</span>
      <span className="break-all">{children}</span>
    </div>
  );
}
