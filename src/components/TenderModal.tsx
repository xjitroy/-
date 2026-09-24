import React, { useState, useEffect } from 'react';
import { TenderRecord } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tender: Partial<TenderRecord>) => Promise<void> | void;
  initialData?: TenderRecord | null;
}

export const TenderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<TenderRecord>>({
    section: 'Ranaghat Section',
    assetType: 'Road',
    projectName: '',
    nitNo: '',
    serialNo: '1',
    tenderAuthority: 'Sub-Divisional Officer, PWRDTE',
    fy: '2026-2027',
    startCh: '0.00',
    endCh: '5.00',
    length: 5,
    estimatedCost: 0,
    tenderedAmt: 0,
    emdAmount: 0,
    completionDays: 30,
    agency: '',
    csStatus: 'Pending',
    woServed: 'No',
    status: 'Tender in Process',
    publishDate: new Date().toISOString().slice(0, 10),
    woDate: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        section: 'Ranaghat Section',
        assetType: 'Road',
        projectName: '',
        nitNo: '',
        serialNo: '1',
        tenderAuthority: 'Sub-Divisional Officer, PWRDTE',
        fy: '2026-2027',
        startCh: '0.00',
        endCh: '5.00',
        length: 5,
        estimatedCost: 0,
        tenderedAmt: 0,
        emdAmount: 0,
        completionDays: 30,
        agency: '',
        csStatus: 'Pending',
        woServed: 'No',
        status: 'Tender in Process',
        publishDate: new Date().toISOString().slice(0, 10),
        woDate: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.nitNo) {
      alert("কাজের নাম এবং NIT নং আবশ্যক!");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              {initialData ? 'টেন্ডার তথ্য সম্পাদনা (Edit Tender)' : 'নতুন টেন্ডার এন্ট্রি (New Tender)'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Tender Notice ও Work Order প্রসেসিং</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">NIT No *</label>
              <input
                type="text"
                required
                value={formData.nitNo}
                onChange={(e) => setFormData({ ...formData, nitNo: e.target.value })}
                placeholder="e.g. 05 of 2026-27"
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Serial No</label>
              <input
                type="text"
                value={formData.serialNo}
                onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">সেকশন *</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
              >
                <option value="Ranaghat Section">Ranaghat Section</option>
                <option value="Aranghata Section">Aranghata Section</option>
                <option value="Chakdaha Section">Chakdaha Section</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">কাজের নাম (Project Name) *</label>
            <textarea
              required
              rows={2}
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g. Thorough repair to Aranghata Duttafulia Road..."
              className="w-full border border-slate-300 rounded-xl p-2.5 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">EMD পরিমাণ (₹)</label>
              <input
                type="number"
                value={formData.emdAmount}
                onChange={(e) => setFormData({ ...formData, emdAmount: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">টেন্ডার মূল্য (₹)</label>
              <input
                type="number"
                value={formData.tenderedAmt}
                onChange={(e) => setFormData({ ...formData, tenderedAmt: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">সময়কাল (দিন)</label>
              <input
                type="number"
                value={formData.completionDays}
                onChange={(e) => setFormData({ ...formData, completionDays: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">নির্বাচিত এজেন্সি (Contractor)</label>
              <input
                type="text"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                placeholder="e.g. M/S Roy Enterprise"
                className="w-full border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Comparative Statement (CS)</label>
              <select
                value={formData.csStatus}
                onChange={(e) => setFormData({ ...formData, csStatus: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Work Order Served?</label>
              <select
                value={formData.woServed}
                onChange={(e) => setFormData({ ...formData, woServed: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
              >
                <option value="No">No (Pending)</option>
                <option value="Yes">Yes (Served - Auto Moves to Ongoing)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Work Order তারিখ</label>
              <input
                type="date"
                value={formData.woDate || ''}
                onChange={(e) => setFormData({ ...formData, woDate: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
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
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold shadow"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
