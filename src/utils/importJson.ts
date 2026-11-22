import type { ResumeProject } from '../types/resume';

/**
 * Parse and validate an imported JSON file as a ResumeProject.
 * Returns the parsed project or throws an error.
 */
export function parseResumeJson(jsonString: string): ResumeProject {
  const data = JSON.parse(jsonString);

  // Basic validation
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON: not an object');
  }
  if (!data.mode || !['template', 'canvas'].includes(data.mode)) {
    throw new Error('Invalid resume: missing or invalid "mode" field');
  }
  if (!data.structuredData || typeof data.structuredData !== 'object') {
    throw new Error('Invalid resume: missing "structuredData"');
  }
  if (!data.structuredData.personalInfo) {
    throw new Error('Invalid resume: missing "personalInfo"');
  }

  return data as ResumeProject;
}

/**
 * Read a File object and parse it as a ResumeProject.
 * Returns a promise that resolves with the project.
 */
export function importProjectFromFile(file: File): Promise<ResumeProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const result = evt.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }
        const project = parseResumeJson(result);
        resolve(project);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
