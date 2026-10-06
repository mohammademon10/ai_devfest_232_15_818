import React from 'react';
import {
  FileDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';
import { Requirement, MatchEntry, MatchesState, Language, TenderMetadata } from '../types';
import { translations } from '../i18n/translations';
import { calculateDocumentStatus } from '../utils/status';

interface PackageGeneratorProps {
  tender: TenderMetadata;
  requirements: Requirement[];
  matches: MatchesState;
  lang: Language;
  isGenerating: boolean;
  includeIndexPage: boolean;
  onToggleIndexPage: (val: boolean) => void;
  onGenerateClick: () => void;
}

export const PackageGenerator: React.FC<PackageGeneratorProps> = ({
  tender,
  requirements,
  matches,
  lang,
  isGenerating,
  includeIndexPage,
  onToggleIndexPage,
  onGenerateClick,
}) => {
  const t = translations[lang];

  // Evaluate blocking issues
  const blockingIssues: string[] = [];

  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  for (const req of sortedReqs) {
    const match = matches[req.id];
    const statusRes = calculateDocumentStatus(req, match, tender.submission_deadline);
    const title = lang === 'bn' ? req.title_bn : req.title_en;

    if (statusRes.isBlocking) {
      if (statusRes.status === 'MISSING') {
        blockingIssues.push(
          lang === 'bn'
            ? `${req.id} (${title}) অনুপস্থিত — কোনো ফাইল যুক্ত করা হয়নি`
            : `${req.id} ${title} is missing (no file matched)`
        );
      } else if (statusRes.status === 'EXPIRY_NEEDED') {
        blockingIssues.push(
          lang === 'bn'
            ? `${req.id} (${title}) এর জন্য মেয়াদ উত্তীর্ণের তারিখ আবশ্যক`
            : `${req.id} ${title} requires an expiry date`
        );
      } else if (statusRes.status === 'EXPIRED') {
        blockingIssues.push(
          lang === 'bn'
            ? `${req.id} (${title}) এর মেয়াদ (${match?.expiryDate}) জমা দেওয়ার শেষ তারিখের (${tender.submission_deadline}) পূর্বে শেষ হয়েছে`
            : `${req.id} ${title} is expired (${match?.expiryDate} < ${tender.submission_deadline})`
        );
      }
    }
  }

  const isBlocked = blockingIssues.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>{t.generateSectionTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn'
              ? 'সম্মতি যাচাইয়ের পর অফিসিয়াল কভার পেজ ও সার্বজনীন ফুটারসহ চূড়ান্ত প্যাকেজ তৈরি করুন।'
              : 'Construct the official merged PDF package with Cover Page (Rule 6.1) and Universal Footer (Rule 6.3).'}
          </p>
        </div>

        {/* Bonus Option: Table of Contents / Index Toggle */}
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
          <input
            id="indexPageToggle"
            type="checkbox"
            checked={includeIndexPage}
            onChange={(e) => onToggleIndexPage(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="indexPageToggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
            {t.includeIndexPage}
          </label>
        </div>
      </div>

      {/* Blocking Issues Alert Box */}
      {isBlocked ? (
        <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2.5 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{t.blockingSummaryTitle}</span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-900/90 pl-7 list-disc">
            {blockingIssues.map((issue, idx) => (
              <li key={idx} className="font-medium">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-300/80 rounded-xl p-5 flex items-center space-x-3 text-emerald-900">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-semibold">
            {t.packageReady} — <span className="font-mono text-emerald-800">{tender.tender_id}_Package.pdf</span>
          </div>
        </div>
      )}

      {/* Prominent Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {lang === 'bn' ? 'ফাইল ফরম্যাট:' : 'Generated Target:'}
          </span>{' '}
          <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-mono font-bold">
            {tender.tender_id}_Package.pdf
          </code>
        </div>

        <button
          data-testid="generate-package-btn"
          onClick={onGenerateClick}
          disabled={isBlocked || isGenerating}
          className={`w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all duration-200 ${
            isBlocked
              ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
              : isGenerating
              ? 'bg-emerald-700 text-white cursor-wait opacity-90'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 glow-btn cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t.generatingBtn}</span>
            </>
          ) : (
            <>
              <FileDown className="w-5 h-5" />
              <span>{t.generateBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
