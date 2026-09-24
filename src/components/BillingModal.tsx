import React, { useState, useEffect } from 'react';
import { BillingRecord, ProjectRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Partial<BillingRecord>) => Promise<void> | void;
  initialData?: BillingRecord | null;
  projectsList?: ProjectRecord[];
}

export const BillingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  projectsList = []
}) => {
  const [formData, setFormData] = useState<Partial<BillingRecord>>({
    fy: '2026-2027',
    tenderNo: '',
    projectName: '',
    agency: '',
    billNo: '1st RA Bill',
    amount: 0,
    usedMBs: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Bill Passed'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        fy: '2026-2027',
        tenderNo: '',
        projectName: '',
        agency: '',
        billNo: '1st RA Bill',
        amount: 0,
        usedMBs: '',
        date: new Date().toISOString().slice(0, 10),
        status: 'Bill Passed'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSelectProject = (projectName: string) => {
    const proj = projectsList.find(p => p.projectName === projectName);
    if (proj) {
      setFormData(prev => ({
        ...prev,
        projectName: proj.projectName,
        tenderNo: proj.tenderNo || prev.tenderNo,
        agency: proj.agency || prev.agency,
        section: proj.section
      }));
    } else {
      setFormData(prev => ({ ...prev, projectName }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.billNo || !formData.amount) {
      alert("প্রকল্প, বিল নং এবং টাকার পরিমাণ আবশ্যক!");
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
              {initialData ? 'বিলিং রেকর্ড সম্পাদনা (Edit RA Bill)' : 'নতুন RA বিল যোগ করুন (New Bill)'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Running Account (RA) বিল ও পরিমাপ বহি (MB) হিসাব</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">চলমান প্রকল্প নির্বাচন করুন *</label>
            <select
              value={formData.projectName}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium"
            >
              <option value="">-- চলমান প্রকল্প নির্বাচন করুন --</option>
              {projectsList.map((p, idx) => (
                <option key={idx} value={p.projectName}>
                  {p.projectName} ({p.tenderNo || 'No NIT'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">NIT / Tender No</label>
              <input
                type="text"
                value={formData.tenderNo}
                onChange={(e) => setFormData({ ...formData, tenderNo: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">এজেন্সি / কন্ট্রাক্টর</label>
              <input
                type="text"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">বিল নম্বর *</label>
              <input
                type="text"
                required
                value={formData.billNo}
                onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
                placeholder="e.g. 1st RA Bill / Final Bill"
                className="w-full border border-slate-300 rounded-xl p-2.5 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">টাকার পরিমাণ (₹) *</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">MB নম্বর ও পৃষ্ঠা</label>
              <input
                type="text"
                value={formData.usedMBs}
                onChange={(e) => setFormData({ ...formData, usedMBs: e.target.value })}
                placeholder="e.g. MB-1042, Page 22-26"
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">বিল পাসের তারিখ</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
            >
              <option value="Bill Passed">Bill Passed (পাস হয়েছে)</option>
              <option value="Under Scrutiny">Under Scrutiny (যাচাই চলছে)</option>
              <option value="Submitted to Division">Submitted to Division (ডিভিশনে পাঠানো)</option>
              <option value="Payment Released">Payment Released (পেমেন্ট সম্পন্ন)</option>
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
