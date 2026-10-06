import React, { useState } from 'react';
import { Sparkles, Key, X, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;
  const t = translations[lang];

  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      sessionStorage.setItem('ai_api_key', apiKey.trim());
      sessionStorage.setItem('ai_provider', provider);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.aiModalTitle}</h3>
              <p className="text-xs text-slate-500">100% In-Browser • Zero Server Storage</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {t.aiModalDesc}
        </p>

        {/* Zero secrets security notice */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start space-x-2.5 text-xs text-emerald-900">
          <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            {lang === 'bn'
              ? 'নিরাপত্তা নিশ্চয়তা: কোনো এপিআই কি কোনো সার্ভারে পাঠানো হয় না। এটি শুধুমাত্র বর্তমান ব্রাউজার সেশনে নিরাপদে সংরক্ষিত থাকে।'
              : 'Security Guarantee: In compliance with Rule 5.8 (Zero Secrets), your key is never transmitted to any third-party server or repository.'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t.aiProvider}</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  provider === 'gemini'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Google Gemini
              </button>
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  provider === 'openai'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                OpenAI (GPT-4o)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t.aiApiKey}</label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                className="w-full text-xs rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {isSaved && <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Saved in session</span>}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.aiClose}
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
