import type { StructuredResumeData } from '../types/resume';

export const SAMPLE_STRUCTURED_DATA: StructuredResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
  },
  summaryHtml:
    'Results-driven Senior Full Stack Engineer with 7+ years of experience building scalable web applications, distributed systems, and real-time user interfaces. Passionate about clean code, high performance, and exceptional developer experience.',
  experience: [
    {
      id: 'exp-1',
      company: 'TechFlow Systems',
      role: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      startDate: 'Mar 2022',
      endDate: '',
      current: true,
      descriptionHtml:
        'Architected and deployed high-throughput microservices handling 25M+ daily requests with 99.99% uptime. Led a team of 8 engineers and migrated the legacy frontend to modern React with 40% faster initial load time.',
    },
    {
      id: 'exp-2',
      company: 'CloudPulse Technologies',
      role: 'Senior Frontend Developer',
      location: 'Austin, TX',
      startDate: 'Jan 2019',
      endDate: 'Feb 2022',
      current: false,
      descriptionHtml:
        'Developed interactive analytics dashboards using React, TypeScript, and Tailwind CSS. Implemented automated end-to-end testing, reducing regression issues by 65%.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S. in Computer Science',
      location: 'Berkeley, CA',
      startDate: 'Aug 2014',
      endDate: 'May 2018',
      descriptionHtml: 'Dean’s Honor List, Magna Cum Laude. President of Open Source Club.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'TypeScript' },
    { id: 'sk-2', name: 'React' },
    { id: 'sk-3', name: 'Node.js' },
    { id: 'sk-4', name: 'Tailwind CSS' },
    { id: 'sk-5', name: 'Next.js' },
    { id: 'sk-6', name: 'PostgreSQL' },
    { id: 'sk-7', name: 'GraphQL' },
    { id: 'sk-8', name: 'Docker' },
    { id: 'sk-9', name: 'AWS' },
  ],
  customSections: [
    {
      id: 'sec-1',
      title: 'Key Achievements & Certifications',
      contentHtml:
        'AWS Certified Solutions Architect – Professional (2023)\nPublished author of open-source React state management utilities with 150k+ weekly npm downloads.',
    },
  ],
  sectionTitles: {
    summary: 'Professional Summary',
    skills: 'Skills & Expertise',
    experience: 'Work Experience',
    education: 'Education',
  },
  sectionOrder: ['summary', 'skills', 'experience', 'education', 'sec-1'],
};
