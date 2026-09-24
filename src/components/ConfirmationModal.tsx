import React, { useState } from 'react';

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  actionType?: 'delete' | 'update' | 'restore';
  itemName?: string;
  onConfirm: () => void;
  doubleConfirmRequired?: boolean;
}

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  actionType?: 'delete' | 'update' | 'restore';
  itemName?: string;
  doubleConfirmRequired?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  title,
  message,
  actionType = 'update',
  itemName,
  doubleConfirmRequired = true,
  onConfirm,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [typedConfirm, setTypedConfirm] = useState('');

  if (!isOpen) return null;

  const handleFirstStep = () => {
    if (doubleConfirmRequired) {
      setStep(2);
    } else {
      onConfirm();
      handleClose();
    }
  };

  const handleFinalConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setTypedConfirm('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            actionType === 'delete' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
          }`}>
            <i className={`text-xl ${actionType === 'delete' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question'}`}></i>
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">নিরাপত্তা যাচাইকরণ (Double Confirmation)</p>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              {message}
              {itemName && (
                <div className="mt-2 font-bold text-slate-900 bg-white p-2 rounded-lg border font-mono">
                  {itemName}
                </div>
              )}
              {actionType === 'delete' && (
                <p className="mt-2 text-[11px] text-amber-700 font-bold">
                  * এটি স্থায়ীভাবে মুছে যাবে না, অ্যাডমিন ট্র্যাশে (Trash Bin) স্থানান্তরিত হবে।
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleFirstStep}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                  actionType === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <span>এগিয়ে যান</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-xs text-rose-900 leading-relaxed font-medium space-y-2">
              <p className="font-bold">⚠️ নিশ্চিতকরণের দ্বিতীয় ধাপ (Final Confirmation):</p>
              <p>আপনি কি শতভাগ নিশ্চিত? নিশ্চিত করতে নিচে <b>CONFIRM</b> অথবা <b>হ্যাঁ</b> লিখুন:</p>
              <input
                type="text"
                value={typedConfirm}
                onChange={(e) => setTypedConfirm(e.target.value)}
                placeholder="CONFIRM বা হ্যাঁ লিখুন..."
                className="w-full bg-white border border-rose-300 rounded-xl p-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={typedConfirm.trim().toUpperCase() !== 'CONFIRM' && typedConfirm.trim() !== 'হ্যাঁ'}
                onClick={handleFinalConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow"
              >
                চূড়ান্ত নিশ্চিত করুন
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
