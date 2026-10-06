import React from 'react';
import {
  FileText,
  Globe,
  Upload,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Stamp,
  Sparkles,
  Save,
  FolderOpen
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onLoadSamplePack: () => void;
  onUploadRequirementsClick: () => void;
  onReset: () => void;
  onExportCsv: () => void;
  onExportXlsx: () => void;
  onOpenSealModal: () => void;
  onOpenAiModal: () => void;
  onExportProject: () => void;
  onImportProjectClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onLoadSamplePack,
  onUploadRequirementsClick,
  onReset,
  onExportCsv,
  onExportXlsx,
  onOpenSealModal,
  onOpenAiModal,
  onExportProject,
  onImportProjectClick,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">
                  {t.appTitle}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  GovTech 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle Button */}
            <button
              data-testid="lang-toggle-btn"
              onClick={onToggleLang}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-xs"
              title={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{t.langToggle}</span>
            </button>

            {/* Load Sample Pack (1-click test button) */}
            <button
              data-testid="load-sample-pack-btn"
              onClick={onLoadSamplePack}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{t.loadSamplePack}</span>
            </button>

            {/* Upload requirements.json */}
            <button
              onClick={onUploadRequirementsClick}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{t.loadRequirementsFile}</span>
            </button>

            {/* Checklist Dropdown / Export Buttons */}
            <div className="relative group">
              <button
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 hidden group-hover:block z-50">
                <button
                  onClick={onExportCsv}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.exportChecklistCsv}</span>
                </button>
                <button
                  onClick={onExportXlsx}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.exportChecklistXlsx}</span>
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={onExportProject}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.exportProject}</span>
                </button>
                <button
                  onClick={onImportProjectClick}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>{t.importProject}</span>
                </button>
              </div>
            </div>

            {/* Seal Modal (Bonus) */}
            <button
              onClick={onOpenSealModal}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
              title="Add PNG Seal or Signature"
            >
              <Stamp className="w-4 h-4 text-purple-600" />
              <span className="hidden xl:inline">Seal</span>
            </button>

            {/* AI Assistant (Bonus) */}
            <button
              onClick={onOpenAiModal}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              title="AI Document Inspection Assistant"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="hidden xl:inline">AI Help</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title={t.resetAll}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
