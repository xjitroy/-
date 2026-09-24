import React, { useState, useEffect } from 'react';
import { WorkflowItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: Partial<WorkflowItem>) => Promise<void> | void;
  initialData?: WorkflowItem | null;
}

export const WorkflowModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<WorkflowItem>>({
    memoNo: '',
    date: new Date().toISOString().slice(0, 10),
    project: '',
    from: 'Sub-Divisional Officer, Ranaghat Highway Sub-Division',
    to: 'Executive Engineer, Nadia Highway Division',
    subject: '',
    status: 'Pending'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        memoNo: `MEMO-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().slice(0, 10),
        project: 'General Office',
        from: 'Sub-Divisional Officer, Ranaghat Highway Sub-Division',
        to: 'Executive Engineer, Nadia Highway Division',
        subject: '',
        status: 'Pending'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memoNo || !formData.subject) {
      alert("মেমো নম্বর এবং বিষয় আবশ্যক!");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] flex flex-col space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              {initialData ? 'চিঠী-পত্র তথ্য সম্পাদনা (Edit Workflow)' : 'নতুন চিঠী-পত্র অন্তর্ভুক্তি (New Letter)'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">অফিসিয়াল পত্র আদান-প্রদান ট্র্যাকিং</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Memo / Letter No *</label>
              <input
                type="text"
                required
                value={formData.memoNo}
                onChange={(e) => setFormData({ ...formData, memoNo: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">তারিখ *</label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">প্রকল্প / কাজের রেফারেন্স</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              placeholder="e.g. Ranaghat Aranghata Road Repair"
              className="w-full border border-slate-300 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">From (প্রেরক)</label>
              <input
                type="text"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">To (প্রাপক)</label>
              <input
                type="text"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">পত্রের বিষয় (Subject) *</label>
            <textarea
              required
              rows={2}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Submission of 1st & Final Bill with MBs for verification..."
              className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
            >
              <option value="Pending">Pending (অপেক্ষমান)</option>
              <option value="Forwarded">Forwarded (অগ্রবর্তিত)</option>
              <option value="Approved">Approved (অনুমোদিত)</option>
              <option value="Disposed">Disposed (নিষ্পন্ন)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold shadow"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
