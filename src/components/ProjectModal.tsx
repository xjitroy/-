import React, { useState, useEffect } from 'react';
import { ProjectRecord, RoadAsset } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<ProjectRecord>) => Promise<void> | void;
  initialData?: ProjectRecord | null;
  roadsList?: RoadAsset[];
}

export const ProjectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  roadsList = []
}) => {
  const [formData, setFormData] = useState<Partial<ProjectRecord>>({
    section: 'Ranaghat Section',
    assetType: 'Road',
    assetName: '',
    projectName: '',
    fy: '2026-2027',
    startCh: '0.00',
    endCh: '5.00',
    length: 5,
    tenderNo: '',
    agency: '',
    tenderedAmt: 0,
    progress: 0,
    stage: 'Planning & Estimate',
    completionDate: '',
    dlp1: '',
    dlp2: '',
    dlpLast: '',
    remarks: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        section: 'Ranaghat Section',
        assetType: 'Road',
        assetName: '',
        projectName: '',
        fy: '2026-2027',
        startCh: '0.00',
        endCh: '5.00',
        length: 5,
        tenderNo: '',
        agency: '',
        tenderedAmt: 0,
        progress: 0,
        stage: 'Planning & Estimate',
        completionDate: '',
        dlp1: '',
        dlp2: '',
        dlpLast: '',
        remarks: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName) {
      alert("প্রকল্পের নাম আবশ্যক!");
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
              {initialData ? 'প্রকল্প তথ্য সম্পাদনা (Edit Project)' : 'নতুন প্রকল্প সংযোজন (New Project)'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">ডাবল কনফার্মেশন সহ ডাটাবেজে সংরক্ষণ</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">অধিক্ষেত্র / সেকশন *</label>
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

            <div>
              <label className="block font-bold text-slate-700 mb-1">আর্থিক বছর (Financial Year)</label>
              <input
                type="text"
                value={formData.fy}
                onChange={(e) => setFormData({ ...formData, fy: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">সংশ্লিষ্ট রোড / অ্যাসেট</label>
            <select
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-medium"
            >
              <option value="">-- রোড নির্বাচন করুন (ঐচ্ছিক) --</option>
              {roadsList.map((r, idx) => (
                <option key={idx} value={r.name}>{r.name} ({r.section})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">প্রকল্পের পূর্ণ নাম *</label>
            <textarea
              required
              rows={2}
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g. Special repair to Ranaghat Aranghata Road from 0.00 to 5.00 Km..."
              className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Chainage</label>
              <input
                type="text"
                value={formData.startCh}
                onChange={(e) => setFormData({ ...formData, startCh: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Chainage</label>
              <input
                type="text"
                value={formData.endCh}
                onChange={(e) => setFormData({ ...formData, endCh: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">দৈর্ঘ্য (Km)</label>
              <input
                type="number"
                step="0.01"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">টেন্ডার / এনআইটি নম্বর</label>
              <input
                type="text"
                value={formData.tenderNo}
                onChange={(e) => setFormData({ ...formData, tenderNo: e.target.value })}
                placeholder="e.g. WBPWD/EE/ND/NIT-08/2026-27"
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">কন্ট্রাক্টর / এজেন্সি</label>
              <input
                type="text"
                value={formData.agency}
                onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                placeholder="e.g. M/S Ghosh Construction"
                className="w-full border border-slate-300 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block font-bold text-slate-700 mb-1">অগ্রগতি (% Progress)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">বর্তমান স্টেজ</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
              >
                <option value="Planning & Estimate">Planning & Estimate</option>
                <option value="Tender Invited">Tender Invited</option>
                <option value="Work Order Issued">Work Order Issued</option>
                <option value="Work in Progress">Work in Progress</option>
                <option value="Completed / DLP Phase">Completed / DLP Phase</option>
                <option value="DLP Expired / Final SD Released">DLP Expired / Final SD</option>
              </select>
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 space-y-2">
            <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
              <i className="fa-solid fa-shield-halved text-purple-600"></i>
              DLP কোয়ার্টার তারিখ (ত্রৈমাসিক পর্যবেক্ষণ ও সিকিউরিটি ডিপোজিট)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-purple-800 font-bold mb-0.5">১ম DLP (1st Quarter)</label>
                <input
                  type="date"
                  value={formData.dlp1 || ''}
                  onChange={(e) => setFormData({ ...formData, dlp1: e.target.value })}
                  className="w-full border border-purple-200 rounded-lg p-1.5 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-purple-800 font-bold mb-0.5">২য় DLP (2nd Quarter)</label>
                <input
                  type="date"
                  value={formData.dlp2 || ''}
                  onChange={(e) => setFormData({ ...formData, dlp2: e.target.value })}
                  className="w-full border border-purple-200 rounded-lg p-1.5 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-purple-800 font-bold mb-0.5">শেষ DLP (Final Quarter)</label>
                <input
                  type="date"
                  value={formData.dlpLast || ''}
                  onChange={(e) => setFormData({ ...formData, dlpLast: e.target.value })}
                  className="w-full border border-purple-200 rounded-lg p-1.5 font-mono text-[11px]"
                />
              </div>
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
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
