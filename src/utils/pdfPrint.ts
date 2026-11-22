/**
 * Prepares the DOM and triggers high-fidelity browser vector PDF printing.
 * Sets the document title to the resume's title so the PDF automatically saves
 * with the correct file name.
 */
export function triggerPdfPrint(resumeTitle: string, onBeforePrint?: () => void): void {
  const originalTitle = document.title;
  const sanitizedTitle = (resumeTitle || 'Resume').trim();

  if (onBeforePrint) {
    onBeforePrint();
  }

  // Set title so browser defaults PDF save dialog name to this
  document.title = sanitizedTitle;

  // Small delay to allow any pending React re-renders (like deselecting layers)
  setTimeout(() => {
    window.print();
    // Restore document title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }, 100);
}
