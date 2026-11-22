import { Info, Printer, Check, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  resumeTitle: string;
}

export default function PrintDialog({
  open,
  onClose,
  onConfirmPrint,
  resumeTitle,
}: PrintDialogProps) {
  const handlePrint = () => {
    onClose();
    onConfirmPrint();
  };

  return (
    <Modal open={open} onClose={onClose} title="Download Vector PDF" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Intro */}
        <p className="text-xs text-gray-600 leading-relaxed">
          Your resume will be exported as a <strong>100% vector-sharp, ATS-friendly PDF</strong> directly from your browser engine. Text remains selectable and scannable.
        </p>

        {/* Recommended Browser Settings Card */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Recommended Print Settings</span>
          </div>

          <ul className="text-xs text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Destination:</strong> Select <em>&ldquo;Save as PDF&rdquo;</em> or <em>&ldquo;Microsoft Print to PDF&rdquo;</em>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Paper size:</strong> Choose <em>&ldquo;A4&rdquo;</em>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Margins:</strong> Set to <em>&ldquo;None&rdquo;</em> (crucial for exact layout)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Options:</strong> Check <em>&ldquo;Background graphics&rdquo;</em> to preserve template colors &amp; shapes
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700">
            <Printer className="w-3.5 h-3.5" />
            <span>Open Print Dialog</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
