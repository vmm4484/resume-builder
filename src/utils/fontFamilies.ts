export interface FontOption {
  id: string;
  name: string;
  category: 'sans-serif' | 'serif';
  fontFamily: string;
  desc: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'arial',
    name: 'Arial',
    category: 'sans-serif',
    fontFamily: 'Arial, Helvetica, "Nimbus Sans", sans-serif',
    desc: 'Clean, universal, ATS-standard sans-serif',
  },
  {
    id: 'times',
    name: 'Times New Roman',
    category: 'serif',
    fontFamily: '"Times New Roman", Times, "Nimbus Roman", serif',
    desc: 'Classic Ivy League, academic & traditional serif',
  },
  {
    id: 'calibri',
    name: 'Calibri',
    category: 'sans-serif',
    fontFamily: 'Calibri, "Segoe UI", Candara, sans-serif',
    desc: 'Contemporary corporate standard, clean & balanced',
  },
  {
    id: 'georgia',
    name: 'Georgia',
    category: 'serif',
    fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
    desc: 'Distinguished, highly legible executive serif',
  },
  {
    id: 'garamond',
    name: 'Garamond (EB Garamond)',
    category: 'serif',
    fontFamily: '"EB Garamond", Garamond, "Baskerville", "Times New Roman", serif',
    desc: 'Timeless, elegant literature & leadership serif',
  },
  {
    id: 'inter',
    name: 'Inter',
    category: 'sans-serif',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    desc: 'Modern tech, high-density & engineered sans-serif',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    category: 'sans-serif',
    fontFamily: '"Roboto", Arial, sans-serif',
    desc: 'Google neo-grotesque, sharp & geometric',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    category: 'serif',
    fontFamily: '"Merriweather", Georgia, "Times New Roman", serif',
    desc: 'Editorial, warm & pleasant readability serif',
  },
  {
    id: 'lato',
    name: 'Lato',
    category: 'sans-serif',
    fontFamily: '"Lato", "Helvetica Neue", Arial, sans-serif',
    desc: 'Friendly, modern corporate sans-serif',
  },
  {
    id: 'trebuchet',
    name: 'Trebuchet MS',
    category: 'sans-serif',
    fontFamily: '"Trebuchet MS", "Lucida Sans", Arial, sans-serif',
    desc: 'Crisp, open & contemporary sans-serif',
  },
];

/**
 * Returns exact CSS font-family string from font id or CSS string.
 */
export function getFontFamilyCss(fontIdOrCss?: string, fallback?: string): string {
  if (!fontIdOrCss) return fallback || '';
  const match = FONT_OPTIONS.find(
    (f) =>
      f.id === fontIdOrCss ||
      f.name.toLowerCase() === fontIdOrCss.toLowerCase() ||
      f.fontFamily === fontIdOrCss
  );
  return match ? match.fontFamily : fontIdOrCss;
}
