import React, { useState, useEffect } from 'react';
import { SDOfficeFile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: Partial<SDOfficeFile>) => Promise<void> | void;
  initialData?: SDOfficeFile | null;
}

export const SDOfficeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<SDOfficeFile>>({
    memoNo: '',
    date: new Date().toISOString().slice(0, 10),
    subject: '',
    senderReceiver: 'Executive Engineer / Sub-Divisional Officer',
    category: 'General Administration',
    status: 'In Action',
    fileLink: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        memoNo: `SDO/RNG/${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().slice(0, 10),
        subject: '',
        senderReceiver: 'Executive Engineer / Sub-Divisional Officer',
        category: 'General Administration',
        status: 'In Action',
        fileLink: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memoNo || !formData.subject) {
      alert("মেমো নং এবং বিষয় আবশ্যক!");
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
              {initialData ? 'অফিস নথি সম্পাদনা (Edit Document)' : 'নতুন নথি অন্তর্ভুক্তি (New Record)'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Ranaghat Highway Sub-Division রেকর্ড ফাইল</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">মেমো / ফাইল নম্বর *</label>
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
            <label className="block font-bold text-slate-700 mb-1">নথির বিষয় (Subject) *</label>
            <textarea
              required
              rows={2}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Tree felling permission file on Ranaghat Aranghata Road..."
              className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">প্রেরক / প্রাপক</label>
              <input
                type="text"
                value={formData.senderReceiver}
                onChange={(e) => setFormData({ ...formData, senderReceiver: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
              >
                <option value="General Administration">General Administration</option>
                <option value="Tender / Estimate">Tender / Estimate</option>
                <option value="Court / Legal">Court / Legal</option>
                <option value="Establishment / Staff">Establishment / Staff</option>
                <option value="Encroachment / Land">Encroachment / Land</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">স্ট্যাটাস</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
            >
              <option value="In Action">In Action (কার্যক্রম চলছে)</option>
              <option value="Pending">Pending (অপেক্ষমান)</option>
              <option value="Completed">Completed (নিষ্পন্ন)</option>
              <option value="Archived">Archived (সংরক্ষিত)</option>
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
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
