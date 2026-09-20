import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Volume2, Keyboard, CheckCircle } from 'lucide-react';

const ScreenReaderModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Screen Reader Access & Accessibility Guide"
      subtitle="ParivarSathi complies with Guidelines for Indian Government Websites (GIGW 3.0) & WCAG 2.1 Level AA."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-sm text-gov-text">
        <section>
          <h4 className="font-bold text-gov-navy flex items-center gap-2 mb-2">
            <Volume2 size={18} className="text-gov-green" /> Compatible Screen Readers
          </h4>
          <p className="text-xs text-gov-text-muted leading-relaxed">
            This portal is fully optimized and tested with the following assistive technologies:
          </p>
          <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <li className="p-2.5 bg-slate-50 border border-gov-border rounded flex items-center gap-2">
              <CheckCircle size={14} className="text-gov-green shrink-0" />
              <span><strong>NonVisual Desktop Access (NVDA)</strong> (Free)</span>
            </li>
            <li className="p-2.5 bg-slate-50 border border-gov-border rounded flex items-center gap-2">
              <CheckCircle size={14} className="text-gov-green shrink-0" />
              <span><strong>JAWS</strong> (Freedom Scientific)</span>
            </li>
            <li className="p-2.5 bg-slate-50 border border-gov-border rounded flex items-center gap-2">
              <CheckCircle size={14} className="text-gov-green shrink-0" />
              <span><strong>Windows Narrator</strong> (Built-in Windows)</span>
            </li>
            <li className="p-2.5 bg-slate-50 border border-gov-border rounded flex items-center gap-2">
              <CheckCircle size={14} className="text-gov-green shrink-0" />
              <span><strong>VoiceOver</strong> (macOS / iOS)</span>
            </li>
          </ul>
        </section>

        <section>
          <h4 className="font-bold text-gov-navy flex items-center gap-2 mb-2">
            <Keyboard size={18} className="text-gov-navy" /> Keyboard Shortcuts & Navigation
          </h4>
          <div className="border border-gov-border rounded overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-gov-navy font-bold">
                <tr>
                  <th className="p-2.5 border-b border-gov-border">Key / Combination</th>
                  <th className="p-2.5 border-b border-gov-border">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gov-border">
                <tr>
                  <td className="p-2.5 font-mono font-bold bg-slate-50">Tab</td>
                  <td className="p-2.5">Moves focus to next interactive element or field</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold bg-slate-50">Shift + Tab</td>
                  <td className="p-2.5">Moves focus to previous interactive element</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold bg-slate-50">Enter / Space</td>
                  <td className="p-2.5">Activates buttons, toggles checkboxes, submits forms</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold bg-slate-50">Escape</td>
                  <td className="p-2.5">Closes open dialog modals and mobile navigation menu</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono font-bold bg-slate-50">Arrow Keys</td>
                  <td className="p-2.5">Navigates within tabs, radio buttons, and table rows</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-blue-50/70 p-3.5 border border-blue-200 rounded text-xs text-gov-navy">
          <p className="font-semibold mb-1">GIGW 3.0 Compliance Assurance</p>
          <p className="text-gov-text-muted">
            All pages include skip links, descriptive aria labels, minimum 4.5:1 color contrast, and font scaling (A- A A+) to assist citizens with visual impairments.
          </p>
        </section>

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Close Accessibility Guide
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScreenReaderModal;
