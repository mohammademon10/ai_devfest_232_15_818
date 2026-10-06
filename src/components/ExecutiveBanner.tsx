import React from 'react';
import {
  FileCheck2,
  Calendar,
  Building2,
  UserCheck,
  Hash,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { TenderMetadata, Language } from '../types';
import { translations } from '../i18n/translations';

interface ExecutiveBannerProps {
  tender: TenderMetadata;
  lang: Language;
  totalRequirements: number;
  okCount: number;
  blockingCount: number;
}

export const ExecutiveBanner: React.FC<ExecutiveBannerProps> = ({
  tender,
  lang,
  totalRequirements,
  okCount,
  blockingCount,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-gov-900 text-white rounded-2xl shadow-xl p-6 sm:p-7 border border-slate-700/60 relative overflow-hidden">
      {/* Background subtle decoration */}
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 -mb-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-700/80">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t.executiveBannerTitle}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {tender.tender_id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {tender.title}
            </h1>
          </div>

          {/* Real-time Status Badge in Banner */}
          <div className="flex items-center space-x-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-4 py-3 rounded-xl">
            {blockingCount === 0 ? (
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                    {t.statusSummary}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {okCount} / {totalRequirements} {lang === 'bn' ? 'নথি সম্পন্ন' : 'Verified OK'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                    {t.statusSummary}
                  </div>
                  <div className="text-sm font-medium text-white">
                    {blockingCount} {lang === 'bn' ? 'টি সমস্যা সমাধান প্রয়োজন' : 'Blocking Issue(s)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4 Pillars of Tender Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* Tender ID */}
          <div className="flex items-start space-x-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="p-2 rounded-lg bg-slate-700/60 text-emerald-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {t.tenderId}
              </div>
              <div className="text-sm font-bold text-white mt-0.5 font-mono">
                {tender.tender_id}
              </div>
            </div>
          </div>

          {/* Procuring Entity */}
          <div className="flex items-start space-x-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="p-2 rounded-lg bg-slate-700/60 text-sky-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {t.procuringEntity}
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate max-w-[200px]" title={tender.procuring_entity}>
                {tender.procuring_entity}
              </div>
            </div>
          </div>

          {/* Bidder Name */}
          <div className="flex items-start space-x-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="p-2 rounded-lg bg-slate-700/60 text-teal-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {t.bidderName}
              </div>
              <div className="text-sm font-semibold text-white mt-0.5 truncate max-w-[200px]" title={tender.bidder}>
                {tender.bidder}
              </div>
            </div>
          </div>

          {/* Submission Deadline */}
          <div className="flex items-start space-x-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <div className="p-2 rounded-lg bg-slate-700/60 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {t.submissionDeadline}
              </div>
              <div className="text-sm font-bold text-amber-300 mt-0.5 font-mono">
                {tender.submission_deadline}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
