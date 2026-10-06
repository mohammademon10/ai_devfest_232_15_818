import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  Trash2,
  AlertCircle,
  Copy,
  FileX,
  File
} from 'lucide-react';
import { UploadedFile, Language } from '../types';
import { translations } from '../i18n/translations';
import { formatFileSize } from '../utils/hasher';

interface UploadZoneProps {
  files: UploadedFile[];
  lang: Language;
  onFilesSelected: (files: FileList | File[]) => void;
  onRemoveFile: (fileId: string) => void;
  rejectionAlert: string | null;
  onDismissRejection: () => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  files,
  lang,
  onFilesSelected,
  onRemoveFile,
  rejectionAlert,
  onDismissRejection,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-uploading the same file name works
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span>{t.uploadZoneTitle}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {files.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.uploadZoneDesc}
          </p>
        </div>
      </div>

      {/* Explicit Non-PDF Rejection Alert Banner (Task 4.2 Trap) */}
      {rejectionAlert && (
        <div className="flex items-start justify-between bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-900 transition-all duration-300">
          <div className="flex items-start space-x-3">
            <FileX className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">
                {lang === 'bn' ? 'ফাইল যাচাইকরণ ত্রুটি' : 'File Integrity Validation Alert'}
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                {rejectionAlert}
              </p>
            </div>
          </div>
          <button
            onClick={onDismissRejection}
            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          className="hidden"
          accept=".pdf,application/pdf"
        />

        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-sm font-semibold text-slate-800">
          {lang === 'bn' ? 'ফাইলগুলো এখানে টেনে আনুন বা ক্লিক করে ব্রাউজ করুন' : 'Drag and drop PDF files here, or click to browse'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'bn' ? 'শুধুমাত্র বৈধ .pdf ফাইল সমর্থিত' : 'Strictly .pdf files only (PDF integrity is verified in client memory)'}
        </p>
      </div>

      {/* Uploaded Files Grid / Tray */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>{t.uploadedFilesCount.replace('{count}', String(files.length))}</span>
            <span>{files.reduce((acc, f) => acc + f.pageCount, 0)} {t.pages} total</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
            {files.map(file => (
              <div
                key={file.id}
                className={`relative group rounded-xl p-3 border text-xs flex flex-col justify-between transition-all ${
                  file.isDuplicate
                    ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50'
                    : file.isCorrupt
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex items-start space-x-2 min-w-0">
                    <File className={`w-4 h-4 mt-0.5 shrink-0 ${file.isDuplicate ? 'text-amber-500' : 'text-emerald-600'}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {formatFileSize(file.size)} • {file.pageCount} {file.pageCount === 1 ? t.page : t.pages}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                    title={t.removeFile}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Duplicate File Warning Badge (Task 4.6) */}
                {file.isDuplicate && (
                  <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center space-x-1 text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
                      <Copy className="w-3 h-3" />
                      <span>{t.duplicateBadge}</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-mono" title={`SHA-256: ${file.hash}`}>
                      #{file.hash.slice(0, 8)}
                    </span>
                  </div>
                )}

                {/* Corrupt error badge */}
                {file.isCorrupt && (
                  <div className="mt-2 pt-2 border-t border-red-200 flex items-center space-x-1 text-red-700 font-medium text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    <span>Corrupted PDF</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
