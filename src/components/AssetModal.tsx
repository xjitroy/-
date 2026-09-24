import React, { useState, useEffect } from 'react';
import { RoadAsset, StructureAsset } from '../types';

interface Props {
  isOpen: boolean;
  category: 'roads' | 'bridges' | 'buildings';
  existingAsset?: RoadAsset | StructureAsset | null;
  onClose: () => void;
  onSaveRoad: (road: RoadAsset) => void;
  onSaveStructure: (structure: StructureAsset) => void;
}

export const AssetModal: React.FC<Props> = ({
  isOpen,
  category,
  existingAsset,
  onClose,
  onSaveRoad,
  onSaveStructure
}) => {
  const [section, setSection] = useState('Ranaghat Section');
  const [name, setName] = useState('');
  const [length, setLength] = useState<number | string>(0);
  const [width, setWidth] = useState('5.5m / 7.0m');
  const [startCh, setStartCh] = useState('0.00');
  const [endCh, setEndCh] = useState('5.00');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (existingAsset) {
      setSection(existingAsset.section || 'Ranaghat Section');
      setName(existingAsset.name || '');
      setLength(existingAsset.length || 0);
      if ('width' in existingAsset) {
        setWidth(existingAsset.width || '5.5m');
        setStartCh(existingAsset.startCh || '0.00');
        setEndCh(existingAsset.endCh || '0.00');
      }
      if ('location' in existingAsset) {
        setLocation(existingAsset.location || '');
      }
    } else {
      setSection('Ranaghat Section');
      setName('');
      setLength(0);
      setWidth('5.5m / 7.0m');
      setStartCh('0.00');
      setEndCh('5.00');
      setLocation('');
    }
  }, [existingAsset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (category === 'roads') {
      const road: RoadAsset = {
        id: existingAsset && 'id' in existingAsset ? existingAsset.id : `RD-${Date.now().toString().slice(-4)}`,
        section,
        name,
        length: Number(length) || 0,
        width,
        startCh,
        endCh
      };
      onSaveRoad(road);
    } else {
      const struct: StructureAsset = {
        id: existingAsset && 'id' in existingAsset ? existingAsset.id : `ST-${Date.now().toString().slice(-4)}`,
        section,
        name,
        type: category === 'bridges' ? 'Bridge' : 'Building',
        length: Number(length) || 0,
        location: location || section
      };
      onSaveStructure(struct);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              {existingAsset ? 'অ্যাসেট তথ্য সম্পাদনা' : 'নতুন অ্যাসেট এন্ট্রি'} ({category === 'roads' ? 'Road' : category === 'bridges' ? 'Bridge' : 'Building'})
            </h3>
            <p className="text-xs text-slate-500 font-medium">রোড ও ইনফ্রাস্ট্রাকচার মাস্টার রেজিস্টার</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">অধিক্ষেত্র / সেকশন *</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 bg-slate-50 font-bold"
            >
              <option value="Ranaghat Section">Ranaghat Section</option>
              <option value="Aranghata Section">Aranghata Section</option>
              <option value="Chakdaha Section">Chakdaha Section</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">অ্যাসেট / সড়কের নাম *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ranaghat Aranghata Road"
              className="w-full border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          {category === 'roads' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">দৈর্ঘ্য (Km) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ক্যারেজওয়ে প্রস্থ (m) *</label>
                  <input
                    type="text"
                    required
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Chainage (Km)</label>
                  <input
                    type="text"
                    value={startCh}
                    onChange={(e) => setStartCh(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Chainage (Km)</label>
                  <input
                    type="text"
                    value={endCh}
                    onChange={(e) => setEndCh(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">লোকেশন / চেইনেজ *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ch. 4.20 Km / Ranaghat Court"
                  className="w-full border border-slate-300 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">স্প্যান / সাইজ (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 font-mono"
                />
              </div>
            </div>
          )}

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
