import React, { useRef } from 'react';
import { Stamp, Upload, X, Trash2, Check } from 'lucide-react';
import { SealConfig, Language } from '../types';
import { translations } from '../i18n/translations';

interface SealModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  sealConfig: SealConfig;
  onUpdateSealConfig: (config: SealConfig) => void;
}

export const SealModal: React.FC<SealModalProps> = ({
  isOpen,
  onClose,
  lang,
  sealConfig,
  onUpdateSealConfig,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        alert(lang === 'bn' ? 'শুধুমাত্র পিএনজি (PNG) ফাইল সমর্থিত' : 'Please select a valid PNG image');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateSealConfig({
          ...sealConfig,
          imageDataUrl: reader.result as string,
          imageFileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onUpdateSealConfig({
      ...sealConfig,
      imageDataUrl: null,
      imageFileName: null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.sealModalTitle}</h3>
              <p className="text-xs text-slate-500">{t.sealModalDesc}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Seal PNG */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png"
            className="hidden"
          />

          {sealConfig.imageDataUrl ? (
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-3">
                <img
                  src={sealConfig.imageDataUrl}
                  alt="Seal Preview"
                  className="w-14 h-14 object-contain bg-white rounded-lg border border-purple-200 p-1"
                />
                <div>
                  <p className="text-xs font-bold text-purple-900 truncate max-w-[200px]">
                    {sealConfig.imageFileName}
                  </p>
                  <p className="text-[11px] text-purple-700">PNG Seal Active</p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 text-xs font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.sealRemove}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-2 hover:bg-purple-50/30 transition-all cursor-pointer"
            >
              <Upload className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-semibold text-slate-700">{t.uploadSealPng}</span>
              <span className="text-[11px] text-slate-400">Transparent PNG recommended (max 2 MB)</span>
            </button>
          )}
        </div>

        {/* Target Pages Option */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">{t.sealTarget}</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onUpdateSealConfig({ ...sealConfig, targetPages: 'all' })}
              className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                sealConfig.targetPages === 'all'
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.sealAllPages}
            </button>
            <button
              type="button"
              onClick={() => onUpdateSealConfig({ ...sealConfig, targetPages: 'first_and_last' })}
              className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                sealConfig.targetPages === 'first_and_last'
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.sealFirstAndLast}
            </button>
          </div>
        </div>

        {/* Position Option */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">{t.sealPosition}</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onUpdateSealConfig({ ...sealConfig, position: 'bottom-right' })}
              className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                sealConfig.position === 'bottom-right'
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.sealBottomRight}
            </button>
            <button
              type="button"
              onClick={() => onUpdateSealConfig({ ...sealConfig, position: 'bottom-left' })}
              className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                sealConfig.position === 'bottom-left'
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.sealBottomLeft}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            {t.sealClose}
          </button>
        </div>
      </div>
    </div>
  );
};
