import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  LayoutList,
  Plus,
  Trash2,
  X,
  Camera,
  Type,
} from 'lucide-react';
import { useRef } from 'react';
import SectionAccordion from './SectionAccordion';
import RichTextEditor from '../toolbar/RichTextEditor';
import FontSizeControl from './FontSizeControl';
import { useResumeStore } from '../../store/useResumeStore';
import type {
  StructuredExperience,
  StructuredEducation,
} from '../../types/resume';

const genId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/** Shared input styling */
const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow placeholder:text-gray-400';
const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5';

export default function FormEditor() {
  const {
    currentProject,
    updatePersonalInfo,
    updateStructuredData,
    updateSectionTitle,
    updateSectionFontSize,
    resetSectionFontSizes,
    moveSection,
  } = useResumeStore();

  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!currentProject) return null;

  const {
    personalInfo,
    summaryHtml,
    experience,
    education,
    skills,
    customSections,
    sectionTitles,
    sectionOrder,
    sectionFontSizes = {},
  } = currentProject.structuredData;

  // --- Experience helpers ---
  const addExperience = () => {
    const entry: StructuredExperience = {
      id: genId(),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      descriptionHtml: '',
    };
    updateStructuredData({ experience: [...experience, entry] });
  };

  const updateExperience = (
    id: string,
    updates: Partial<StructuredExperience>
  ) => {
    updateStructuredData({
      experience: experience.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  };

  const removeExperience = (id: string) => {
    updateStructuredData({
      experience: experience.filter((e) => e.id !== id),
    });
  };

  // --- Education helpers ---
  const addEducation = () => {
    const entry: StructuredEducation = {
      id: genId(),
      institution: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: '',
      descriptionHtml: '',
    };
    updateStructuredData({ education: [...education, entry] });
  };

  const updateEducation = (
    id: string,
    updates: Partial<StructuredEducation>
  ) => {
    updateStructuredData({
      education: education.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  };

  const removeEducation = (id: string) => {
    updateStructuredData({
      education: education.filter((e) => e.id !== id),
    });
  };

  // --- Skills helpers ---
  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    updateStructuredData({
      skills: [...skills, { id: genId(), name: trimmed }],
    });
  };

  const removeSkill = (id: string) => {
    updateStructuredData({ skills: skills.filter((s) => s.id !== id) });
  };

  // --- Custom Sections helpers ---
  const addCustomSection = () => {
    const newId = genId();
    const currentOrder = sectionOrder && sectionOrder.length > 0
      ? [...sectionOrder]
      : ['summary', 'skills', 'experience', 'education', ...customSections.map((c) => c.id)];

    updateStructuredData({
      customSections: [
        ...customSections,
        { id: newId, title: 'Additional Information', contentHtml: '' },
      ],
      sectionOrder: [...currentOrder, newId],
    });
  };

  const updateCustomSection = (
    id: string,
    updates: Partial<{ title: string; contentHtml: string }>
  ) => {
    updateStructuredData({
      customSections: customSections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const removeCustomSection = (id: string) => {
    const currentOrder = sectionOrder && sectionOrder.length > 0
      ? [...sectionOrder]
      : ['summary', 'skills', 'experience', 'education', ...customSections.map((c) => c.id)];

    updateStructuredData({
      customSections: customSections.filter((s) => s.id !== id),
      sectionOrder: currentOrder.filter((k) => k !== id),
    });
  };

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      updatePersonalInfo({ photoUrl: evt.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Build effective reorderable sections list
  const defaultOrder = [
    'summary',
    'skills',
    'experience',
    'education',
    ...customSections.map((c) => c.id),
  ];

  const effectiveOrder: string[] = [];
  const baseOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  for (const k of baseOrder) {
    if (
      k === 'summary' ||
      k === 'experience' ||
      k === 'education' ||
      k === 'skills' ||
      customSections.some((c) => c.id === k)
    ) {
      if (!effectiveOrder.includes(k)) effectiveOrder.push(k);
    }
  }
  for (const k of defaultOrder) {
    if (!effectiveOrder.includes(k)) effectiveOrder.push(k);
  }

  // Section renderers by key
  const renderMovableSection = (key: string, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < effectiveOrder.length - 1;

    switch (key) {
      case 'summary':
        return (
          <SectionAccordion
            key="summary"
            title={sectionTitles?.summary || 'Professional Summary'}
            icon={<FileText className="w-4 h-4" />}
            defaultOpen
            onMoveUp={() => moveSection('summary', 'up')}
            onMoveDown={() => moveSection('summary', 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onTitleChange={(t) => updateSectionTitle('summary', t)}
          >
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Summary Text</label>
                <RichTextEditor
                  value={summaryHtml}
                  onChange={(html) => updateStructuredData({ summaryHtml: html })}
                  placeholder="Write a brief professional summary or career objective highlighting your key achievements and goals..."
                  minHeight="100px"
                />
              </div>
            </div>
          </SectionAccordion>
        );

      case 'experience':
        return (
          <SectionAccordion
            key="experience"
            title={sectionTitles?.experience || 'Work Experience'}
            icon={<Briefcase className="w-4 h-4" />}
            badge={experience.length > 0 ? `${experience.length}` : undefined}
            defaultOpen
            onMoveUp={() => moveSection('experience', 'up')}
            onMoveDown={() => moveSection('experience', 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onTitleChange={(t) => updateSectionTitle('experience', t)}
          >
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-4 bg-gray-50/80 rounded-lg border border-gray-100 relative group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Experience #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Company</label>
                      <input
                        className={inputClass}
                        placeholder="Google"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, { company: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Job Title</label>
                      <input
                        className={inputClass}
                        placeholder="Senior Software Engineer"
                        value={exp.role}
                        onChange={(e) =>
                          updateExperience(exp.id, { role: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Location</label>
                      <input
                        className={inputClass}
                        placeholder="Mountain View, CA"
                        value={exp.location}
                        onChange={(e) =>
                          updateExperience(exp.id, { location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Start Date</label>
                      <input
                        className={inputClass}
                        placeholder="Jan 2022"
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExperience(exp.id, { startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Date</label>
                      <div className="flex flex-col gap-1">
                        <input
                          className={inputClass}
                          placeholder={exp.current ? 'Present' : 'Dec 2023'}
                          value={exp.current ? 'Present' : exp.endDate}
                          disabled={exp.current}
                          onChange={(e) =>
                            updateExperience(exp.id, { endDate: e.target.value })
                          }
                        />
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                current: e.target.checked,
                                endDate: e.target.checked ? '' : exp.endDate,
                              })
                            }
                            className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-gray-500">Current</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Description &amp; Achievements</label>
                    <RichTextEditor
                      value={exp.descriptionHtml}
                      onChange={(html) =>
                        updateExperience(exp.id, { descriptionHtml: html })
                      }
                      placeholder="Describe your responsibilities, impact, and key technologies..."
                      minHeight="80px"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addExperience}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            </div>
          </SectionAccordion>
        );

      case 'education':
        return (
          <SectionAccordion
            key="education"
            title={sectionTitles?.education || 'Education'}
            icon={<GraduationCap className="w-4 h-4" />}
            badge={education.length > 0 ? `${education.length}` : undefined}
            onMoveUp={() => moveSection('education', 'up')}
            onMoveDown={() => moveSection('education', 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onTitleChange={(t) => updateSectionTitle('education', t)}
          >
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div
                  key={edu.id}
                  className="p-4 bg-gray-50/80 rounded-lg border border-gray-100 relative group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Education #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove education"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Institution</label>
                      <input
                        className={inputClass}
                        placeholder="Stanford University"
                        value={edu.institution}
                        onChange={(e) =>
                          updateEducation(edu.id, { institution: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Degree / Field of Study</label>
                      <input
                        className={inputClass}
                        placeholder="B.S. in Computer Science"
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(edu.id, { degree: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Location</label>
                      <input
                        className={inputClass}
                        placeholder="Stanford, CA"
                        value={edu.location}
                        onChange={(e) =>
                          updateEducation(edu.id, { location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Start Date</label>
                      <input
                        className={inputClass}
                        placeholder="Sep 2018"
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(edu.id, { startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Date</label>
                      <input
                        className={inputClass}
                        placeholder="May 2022"
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEducation(edu.id, { endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Additional Details</label>
                    <RichTextEditor
                      value={edu.descriptionHtml}
                      onChange={(html) =>
                        updateEducation(edu.id, { descriptionHtml: html })
                      }
                      placeholder="Honors, GPA, relevant coursework, thesis..."
                      minHeight="60px"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addEducation}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            </div>
          </SectionAccordion>
        );

      case 'skills':
        return (
          <SectionAccordion
            key="skills"
            title={sectionTitles?.skills || 'Skills & Expertise'}
            icon={<Wrench className="w-4 h-4" />}
            badge={skills.length > 0 ? `${skills.length}` : undefined}
            onMoveUp={() => moveSection('skills', 'up')}
            onMoveDown={() => moveSection('skills', 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onTitleChange={(t) => updateSectionTitle('skills', t)}
          >
            <div className="space-y-3">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium group"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill.id)}
                      className="opacity-60 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add skill input */}
              <input
                className={inputClass}
                placeholder="Type a skill and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
            </div>
          </SectionAccordion>
        );

      default: {
        // Custom section
        const customSec = customSections.find((c) => c.id === key);
        if (!customSec) return null;

        return (
          <SectionAccordion
            key={customSec.id}
            title={customSec.title || 'Custom Section'}
            icon={<LayoutList className="w-4 h-4" />}
            onMoveUp={() => moveSection(customSec.id, 'up')}
            onMoveDown={() => moveSection(customSec.id, 'down')}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onTitleChange={(t) => updateCustomSection(customSec.id, { title: t })}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Section Content</span>
                <button
                  type="button"
                  onClick={() => removeCustomSection(customSec.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Section
                </button>
              </div>
              <RichTextEditor
                value={customSec.contentHtml}
                onChange={(html) =>
                  updateCustomSection(customSec.id, { contentHtml: html })
                }
                placeholder="Write projects, certifications, publications, or any custom content..."
                minHeight="80px"
              />
            </div>
          </SectionAccordion>
        );
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {/* ========= TYPOGRAPHY & FONT SETTINGS (TOP DEDICATED SECTION) ========= */}
      <SectionAccordion
        title="Typography & Font Sizes"
        icon={<Type className="w-4 h-4 text-indigo-600" />}
        defaultOpen
      >
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Change font sizes across your entire resume. Changing <strong className="text-gray-700">All Body Text</strong> or <strong className="text-gray-700">All Section Headings</strong> updates all sections at once. You can directly edit the values by typing or use <span className="font-semibold">- / +</span>.
          </p>

          <div className="bg-slate-50/90 rounded-lg p-3 border border-slate-200/70 space-y-0.5">
            <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Font Controls (All Sections)
              </span>
              {(sectionFontSizes.globalBody ||
                sectionFontSizes.globalHeading ||
                sectionFontSizes.name ||
                sectionFontSizes.contact) && (
                <button
                  type="button"
                  onClick={resetSectionFontSizes}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            <FontSizeControl
              label="All Body Text"
              description="Paragraphs, bullet points, and section text"
              value={sectionFontSizes.globalBody}
              defaultValue={13}
              min={9}
              max={20}
              step={0.5}
              onChange={(size) => updateSectionFontSize('globalBody', size)}
              onReset={() => updateSectionFontSize('globalBody', 13)}
            />

            <FontSizeControl
              label="All Section Headings"
              description="Headings for Summary, Experience, Skills, Education"
              value={sectionFontSizes.globalHeading}
              defaultValue={13.5}
              min={10}
              max={24}
              step={0.5}
              onChange={(size) => updateSectionFontSize('globalHeading', size)}
              onReset={() => updateSectionFontSize('globalHeading', 13.5)}
            />

            <FontSizeControl
              label="Candidate Name"
              description="Full name in header"
              value={sectionFontSizes.name}
              defaultValue={26}
              min={16}
              max={40}
              step={1}
              onChange={(size) => updateSectionFontSize('name', size)}
              onReset={() => updateSectionFontSize('name', 26)}
            />

            <FontSizeControl
              label="Contact & Subtitles"
              description="Job title, email, phone, location"
              value={sectionFontSizes.contact}
              defaultValue={12.5}
              min={9}
              max={18}
              step={0.5}
              onChange={(size) => updateSectionFontSize('contact', size)}
              onReset={() => updateSectionFontSize('contact', 12.5)}
            />
          </div>
        </div>
      </SectionAccordion>

      {/* ========= PERSONAL INFO (Fixed Header) ========= */}
      <SectionAccordion
        title="Personal Information"
        icon={<User className="w-4 h-4" />}
        defaultOpen
      >
        <div className="space-y-4">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors overflow-hidden shrink-0"
            >
              {personalInfo.photoUrl ? (
                <img
                  src={personalInfo.photoUrl}
                  alt="Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Profile Photo</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                >
                  Upload
                </button>
                {personalInfo.photoUrl && (
                  <button
                    type="button"
                    onClick={() => updatePersonalInfo({ photoUrl: undefined })}
                    className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                className={inputClass}
                placeholder="John Doe"
                value={personalInfo.fullName}
                onChange={(e) =>
                  updatePersonalInfo({ fullName: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Job Title</label>
              <input
                className={inputClass}
                placeholder="Software Engineer"
                value={personalInfo.jobTitle}
                onChange={(e) =>
                  updatePersonalInfo({ jobTitle: e.target.value })
                }
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                type="email"
                placeholder="john@example.com"
                value={personalInfo.email}
                onChange={(e) =>
                  updatePersonalInfo({ email: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                type="tel"
                placeholder="+1 234 567 890"
                value={personalInfo.phone}
                onChange={(e) =>
                  updatePersonalInfo({ phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              placeholder="San Francisco, CA"
              value={personalInfo.location}
              onChange={(e) =>
                updatePersonalInfo({ location: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Website</label>
              <input
                className={inputClass}
                placeholder="johndoe.com"
                value={personalInfo.website}
                onChange={(e) =>
                  updatePersonalInfo({ website: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>LinkedIn</label>
              <input
                className={inputClass}
                placeholder="linkedin.com/in/john"
                value={personalInfo.linkedin}
                onChange={(e) =>
                  updatePersonalInfo({ linkedin: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>GitHub</label>
              <input
                className={inputClass}
                placeholder="github.com/john"
                value={personalInfo.github}
                onChange={(e) =>
                  updatePersonalInfo({ github: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </SectionAccordion>

      {/* ========= REORDERABLE & RENAMABLE SECTIONS ========= */}
      {effectiveOrder.map((key, idx) => renderMovableSection(key, idx))}

      {/* ========= ADD CUSTOM SECTION BUTTON ========= */}
      <button
        type="button"
        onClick={addCustomSection}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-all shadow-2xs cursor-pointer mt-2"
      >
        <Plus className="w-4 h-4" />
        Add New Section
      </button>
    </div>
  );
}
