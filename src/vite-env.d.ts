/// <reference types="vite/client" />

declare module '*.css' {
  const css: string;
  export default css;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: any[];
  }
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
}
