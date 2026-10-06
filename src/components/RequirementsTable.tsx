import React from 'react';
import {
  FileCheck2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  Unlink,
  FileText,
  Wand2
} from 'lucide-react';
import { Requirement, UploadedFile, MatchEntry, MatchesState, Language, DocumentStatus } from '../types';
import { translations } from '../i18n/translations';
import { calculateDocumentStatus } from '../utils/status';

interface RequirementsTableProps {
  requirements: Requirement[];
  uploadedFiles: UploadedFile[];
  matches: MatchesState;
  submissionDeadline: string;
  lang: Language;
  onMatchChange: (reqId: string, fileId: string | undefined) => void;
  onExpiryDateChange: (reqId: string, date: string) => void;
  onAutoMatchClick: () => void;
}

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  uploadedFiles,
  matches,
  submissionDeadline,
  lang,
  onMatchChange,
  onExpiryDateChange,
  onAutoMatchClick,
}) => {
  const t = translations[lang];

  // Sort requirements strictly by order
  const sortedRequirements = [...requirements].sort((a, b) => a.order - b.order);

  // File lookup map
  const fileMap = new Map<string, UploadedFile>(uploadedFiles.map(f => [f.id, f]));

  // Find set of all file IDs that are currently matched
  const matchedFileIdToReqId = new Map<string, string>();
  for (const [rId, match] of Object.entries(matches)) {
    if (match?.fileId) {
      matchedFileIdToReqId.set(match.fileId, rId);
    }
  }

  // Find set of hashes of all currently matched files
  const matchedHashes = new Set<string>();
  for (const [_, match] of Object.entries(matches)) {
    if (match?.fileId) {
      const f = fileMap.get(match.fileId);
      if (f) {
        matchedHashes.add(f.hash);
      }
    }
  }

  const renderStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'OK':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.statusOk}</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{t.statusMissing}</span>
          </span>
        );
      case 'EXPIRY_NEEDED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{t.statusExpiryNeeded}</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>{t.statusExpired}</span>
          </span>
        );
      case 'NOT_PROVIDED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.statusNotProvided}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Header Section */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t.requirementsTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.requirementsSubtitle}
          </p>
        </div>

        {/* Auto Match Button */}
        <button
          data-testid="auto-match-btn"
          onClick={onAutoMatchClick}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all shadow-xs"
        >
          <Wand2 className="w-4 h-4 text-emerald-600" />
          <span>{t.autoMatchBtn}</span>
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">{t.tableColSeq}</th>
              <th className="py-3.5 px-4 w-20">{t.tableColReqId}</th>
              <th className="py-3.5 px-4">{t.tableColTitle}</th>
              <th className="py-3.5 px-4 w-28 text-center">{t.tableColType}</th>
              <th className="py-3.5 px-4 w-32 text-center">{t.tableColExpiry}</th>
              <th className="py-3.5 px-4 min-w-[240px]">{t.tableColMatchedFile}</th>
              <th className="py-3.5 px-4 w-44">{t.tableColExpiryDate}</th>
              <th className="py-3.5 px-4 w-40 text-center">{t.tableColStatus}</th>
              <th className="py-3.5 px-3 w-16 text-center">{t.tableColActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedRequirements.map((req) => {
              const match = matches[req.id];
              const matchedFile = match?.fileId ? fileMap.get(match.fileId) : undefined;
              const statusResult = calculateDocumentStatus(req, match, submissionDeadline);
              const title = lang === 'bn' ? req.title_bn : req.title_en;

              return (
                <tr
                  key={req.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    statusResult.isBlocking ? 'bg-red-50/20' : ''
                  }`}
                >
                  {/* Sequence Order */}
                  <td className="py-4 px-4 text-center font-bold text-slate-500">
                    {req.order}
                  </td>

                  {/* Req ID */}
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {req.id}
                    </span>
                  </td>

                  {/* Document Title */}
                  <td className="py-4 px-4 font-medium text-slate-900">
                    <div>
                      <span className="text-sm font-semibold">{title}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                        {lang === 'bn' ? req.title_en : req.title_bn}
                      </p>
                    </div>
                  </td>

                  {/* Mandatory / Optional Badge */}
                  <td className="py-4 px-4 text-center">
                    {req.mandatory ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {t.mandatoryBadge}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {t.optionalBadge}
                      </span>
                    )}
                  </td>

                  {/* Expiry Check Requirement */}
                  <td className="py-4 px-4 text-center">
                    {req.has_expiry ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        <span>{t.hasExpiryBadge}</span>
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-normal text-slate-400">
                        {t.noExpiryBadge}
                      </span>
                    )}
                  </td>

                  {/* Matched File Dropdown (1-to-1 + Duplicate prevention) */}
                  <td className="py-4 px-4">
                    <select
                      value={match?.fileId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        onMatchChange(req.id, val ? val : undefined);
                      }}
                      className={`w-full text-xs rounded-lg border py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                        match?.fileId
                          ? 'border-emerald-400 bg-emerald-50/20 text-slate-900 font-medium'
                          : 'border-slate-300 bg-white text-slate-500'
                      }`}
                    >
                      <option value="">{t.selectFilePlaceholder}</option>
                      {uploadedFiles.map((file) => {
                        // Check if file is already matched to another requirement
                        const matchedElsewhereReqId = matchedFileIdToReqId.get(file.id);
                        const isMatchedElsewhere = matchedElsewhereReqId && matchedElsewhereReqId !== req.id;

                        // Check if file is duplicate of another file that is matched elsewhere
                        const isDuplicateOfMatched =
                          file.isDuplicate &&
                          matchedHashes.has(file.hash) &&
                          (!match?.fileId || fileMap.get(match.fileId)?.hash !== file.hash);

                        const isDisabled = Boolean(isMatchedElsewhere || isDuplicateOfMatched || file.isCorrupt);

                        let label = `${file.name} (${file.pageCount} ${file.pageCount === 1 ? t.page : t.pages})`;
                        if (isMatchedElsewhere) {
                          label += ` [Matched to ${matchedElsewhereReqId}]`;
                        } else if (isDuplicateOfMatched) {
                          label += ` [Duplicate file blocked]`;
                        }

                        return (
                          <option key={file.id} value={file.id} disabled={isDisabled}>
                            {label}
                          </option>
                        );
                      })}
                    </select>

                    {/* Matched file page preview detail */}
                    {matchedFile && (
                      <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500">
                        <FileText className="w-3 h-3 text-emerald-600" />
                        <span>{matchedFile.pageCount} {matchedFile.pageCount === 1 ? t.page : t.pages}</span>
                        {matchedFile.isDuplicate && (
                          <span className="text-amber-600 font-semibold">• Duplicate hash flagged</span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Expiry Date Input (Task 4.4) */}
                  <td className="py-4 px-4">
                    {req.has_expiry ? (
                      <div className="space-y-1">
                        <input
                          type="date"
                          disabled={!match?.fileId}
                          value={match?.expiryDate || ''}
                          onChange={(e) => onExpiryDateChange(req.id, e.target.value)}
                          className={`w-full text-xs rounded-lg border py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors font-mono ${
                            !match?.fileId
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : !match?.expiryDate
                              ? 'border-amber-400 bg-amber-50/30'
                              : match.expiryDate < submissionDeadline
                              ? 'border-red-400 bg-red-50/30 text-red-700 font-bold'
                              : 'border-emerald-400 bg-emerald-50/20 text-emerald-800'
                          }`}
                        />
                        <div className="text-[10px] text-slate-400">
                          {lang === 'bn' ? 'শেষ তারিখ:' : 'Deadline:'} <span className="font-mono">{submissionDeadline}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">—</span>
                    )}
                  </td>

                  {/* Compliance Status Badge (Task 4.5 & Section 5) */}
                  <td className="py-4 px-4 text-center">
                    {renderStatusBadge(statusResult.status)}
                  </td>

                  {/* Unmatch Action Button */}
                  <td className="py-4 px-3 text-center">
                    {match?.fileId && (
                      <button
                        onClick={() => onMatchChange(req.id, undefined)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title={t.unmatch}
                      >
                        <Unlink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
