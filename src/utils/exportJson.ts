import type { ResumeProject } from '../types/resume';

/**
 * Export a resume project as a downloadable .json file.
 */
export function exportProjectAsJson(project: ResumeProject): void {
  const dataStr = JSON.stringify(project, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${project.title.replace(/\s+/g, '_')}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
