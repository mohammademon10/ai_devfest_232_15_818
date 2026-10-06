import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  TenderMetadata,
  Requirement,
  UploadedFile,
  MatchesState,
  Language,
  SealConfig
} from './types';
import { SAMPLE_REQUIREMENTS_DATA } from './utils/samplePackData';
import { computeSHA256 } from './utils/hasher';
import { calculateDocumentStatus } from './utils/status';
import { generateTenderPackage } from './utils/pdfGenerator';
import { performAutoMatch } from './utils/autoMatcher';
import { exportChecklistToCSV, exportChecklistToXLSX } from './utils/exportChecklist';
import { translations } from './i18n/translations';

// Components
import { Navbar } from './components/Navbar';
import { ExecutiveBanner } from './components/ExecutiveBanner';
import { UploadZone } from './components/UploadZone';
import { RequirementsTable } from './components/RequirementsTable';
import { PackageGenerator } from './components/PackageGenerator';
import { SealModal } from './components/SealModal';
import { AiAssistantModal } from './components/AiAssistantModal';

export const App: React.FC = () => {
  // 1. Core State
  const [lang, setLang] = useState<Language>('en');
  const [tender, setTender] = useState<TenderMetadata>(SAMPLE_REQUIREMENTS_DATA.tender);
  const [requirements, setRequirements] = useState<Requirement[]>(SAMPLE_REQUIREMENTS_DATA.requirements);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [matches, setMatches] = useState<MatchesState>({});
  const [rejectionAlert, setRejectionAlert] = useState<string | null>(null);

  // Bonus / Customization State
  const [includeIndexPage, setIncludeIndexPage] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSealModalOpen, setIsSealModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [sealConfig, setSealConfig] = useState<SealConfig>({
    imageDataUrl: null,
    imageFileName: null,
    targetPages: 'first_and_last',
    customPages: [],
    position: 'bottom-right',
    width: 80,
    height: 80
  });

  const requirementsFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  // Helper to show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // RECOMPUTE DUPLICATES WHEN FILES CHANGE
  // -------------------------------------------------------------
  const updateDuplicateFlags = (filesList: UploadedFile[]): UploadedFile[] => {
    const hashMap = new Map<string, string[]>();
    filesList.forEach(f => {
      const existing = hashMap.get(f.hash) || [];
      existing.push(f.id);
      hashMap.set(f.hash, existing);
    });

    return filesList.map(f => {
      const group = hashMap.get(f.hash) || [];
      const isDup = group.length > 1;
      return {
        ...f,
        isDuplicate: isDup,
        duplicateGroup: isDup ? group.filter(id => id !== f.id) : undefined
      };
    });
  };

  // -------------------------------------------------------------
  // FILE UPLOAD & VALIDATION (Task 4.2 & 4.6)
  // -------------------------------------------------------------
  const handleFilesSelected = async (files: FileList | File[]) => {
    setRejectionAlert(null);
    const newFilesToAdd: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Explicit Rule 4.2 Trap: Reject non-PDF file immediately with clear banner
      const isPdfByName = file.name.toLowerCase().endsWith('.pdf');
      const isPdfByMime = file.type === 'application/pdf';

      if (!isPdfByName && !isPdfByMime) {
        const errorMsg = t.rejectNonPdf.replace('{filename}', file.name);
        setRejectionAlert(errorMsg);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const hash = await computeSHA256(buffer);

        // Attempt to inspect PDF and count pages using pdf-lib
        let pageCount = 1;
        let isCorrupt = false;
        try {
          const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          pageCount = pdfDoc.getPageCount();
        } catch (pdfErr) {
          console.warn(`PDF parse warning for ${file.name}:`, pdfErr);
          isCorrupt = true;
          showToast(t.corruptedPdf.replace('{filename}', file.name));
        }

        const uploadedFile: UploadedFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: file.size,
          pageCount,
          hash,
          isDuplicate: false,
          arrayBuffer: buffer,
          isCorrupt
        };

        newFilesToAdd.push(uploadedFile);
      } catch (err) {
        console.error('File read error:', err);
      }
    }

    if (newFilesToAdd.length > 0) {
      setUploadedFiles(prev => {
        const combined = [...prev, ...newFilesToAdd];
        return updateDuplicateFlags(combined);
      });
      showToast(lang === 'bn' ? `${newFilesToAdd.length}টি ফাইল সফলভাবে আপলোড হয়েছে` : `Uploaded ${newFilesToAdd.length} file(s) successfully`);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = (fileId: string) => {
    // Free matches using this file
    setMatches(prev => {
      const next = { ...prev };
      for (const [rId, m] of Object.entries(next)) {
        if (m.fileId === fileId) {
          next[rId] = { ...m, fileId: undefined };
        }
      }
      return next;
    });

    setUploadedFiles(prev => {
      const remaining = prev.filter(f => f.id !== fileId);
      return updateDuplicateFlags(remaining);
    });
  };

  // -------------------------------------------------------------
  // MATCHING ENGINE (Task 4.3 & 1-to-1 Constraint)
  // -------------------------------------------------------------
  const handleMatchChange = (reqId: string, fileId: string | undefined) => {
    setMatches(prev => {
      const next = { ...prev };

      // If assigning a file, clear any other requirement that had this file (1-to-1 rule)
      if (fileId) {
        for (const [otherReqId, otherMatch] of Object.entries(next)) {
          if (otherMatch.fileId === fileId && otherReqId !== reqId) {
            next[otherReqId] = {
              ...otherMatch,
              fileId: undefined
            };
          }
        }
      }

      next[reqId] = {
        ...next[reqId],
        fileId: fileId
      };

      return next;
    });
  };

  // Expiry date change (Task 4.4)
  const handleExpiryDateChange = (reqId: string, date: string) => {
    setMatches(prev => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        expiryDate: date
      }
    }));
  };

  // -------------------------------------------------------------
  // AUTO-MATCH FILES (Bonus Task 5)
  // -------------------------------------------------------------
  const handleAutoMatch = () => {
    if (uploadedFiles.length === 0) {
      showToast(lang === 'bn' ? 'ম্যাচ করার জন্য কোনো ফাইল আপলোড করা নেই' : 'No uploaded files available to match');
      return;
    }
    const { newMatches, matchedCount } = performAutoMatch(requirements, uploadedFiles, matches);
    setMatches(newMatches);
    showToast(t.autoMatchSuccess.replace('{count}', String(matchedCount)));
  };

  // -------------------------------------------------------------
  // LOAD SAMPLE PACK (1-Click instant test helper)
  // -------------------------------------------------------------
  const handleLoadSamplePack = async () => {
    // Reset matches and load requirements
    setTender(SAMPLE_REQUIREMENTS_DATA.tender);
    setRequirements(SAMPLE_REQUIREMENTS_DATA.requirements);
    setMatches({});
    setRejectionAlert(null);

    // Attempt to load the 10 files from /sample-pack/documents/
    const sampleDocNames = [
      '01_financial_proposal.pdf',
      '02_technical_proposal.pdf',
      '03_tin_certificate.pdf',
      '04_vat_certificate.pdf',
      'bank_solvency.pdf',
      'experience_cert.pdf',
      'experience_cert (1).pdf', // duplicate
      'scan_0042.pdf',
      'trade_license_2025.pdf', // expired
      'trade_license_2026.pdf', // valid
      'company_logo.png' // non-pdf trap
    ];

    const loadedFiles: File[] = [];

    for (const docName of sampleDocNames) {
      try {
        const res = await fetch(`/sample-pack/documents/${docName}`);
        if (res.ok) {
          const blob = await res.blob();
          const file = new File([blob], docName, { type: blob.type });
          loadedFiles.push(file);
        }
      } catch (e) {
        console.warn(`Could not fetch /sample-pack/documents/${docName}:`, e);
      }
    }

    if (loadedFiles.length > 0) {
      await handleFilesSelected(loadedFiles);
      showToast(lang === 'bn' ? 'নমুনা প্যাক সফলভাবে লোড হয়েছে' : 'Sample pack loaded successfully with test traps');
    } else {
      showToast(lang === 'bn' ? 'নমুনা প্রয়োজনীয়তা লোড হয়েছে' : 'Sample tender requirements loaded');
    }
  };

  // Upload custom requirements.json (Task 4.1)
  const handleRequirementsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          if (json.tender && Array.isArray(json.requirements)) {
            setTender(json.tender);
            setRequirements(json.requirements);
            setMatches({});
            showToast(lang === 'bn' ? 'নতুন requirements.json সফলভাবে লোড হয়েছে' : 'Loaded requirements.json successfully');
          } else {
            alert('Invalid requirements.json structure');
          }
        } catch (err) {
          alert('Failed to parse requirements.json');
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset Project
  const handleReset = () => {
    if (window.confirm(t.confirmReset)) {
      setUploadedFiles([]);
      setMatches({});
      setRejectionAlert(null);
      localStorage.removeItem('tender_builder_state');
      showToast(lang === 'bn' ? 'প্রজেক্ট রিসেট সম্পন্ন হয়েছে' : 'Project reset completed');
    }
  };

  // Export State (.json)
  const handleExportProjectState = () => {
    const projectState = {
      tender,
      requirements,
      matches,
      sealConfig,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(projectState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tender.tender_id}_Project_State.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import State (.json)
  const handleImportProjectState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const state = JSON.parse(reader.result as string);
          if (state.tender && state.requirements && state.matches) {
            setTender(state.tender);
            setRequirements(state.requirements);
            setMatches(state.matches);
            if (state.sealConfig) setSealConfig(state.sealConfig);
            showToast('Project state restored successfully');
          }
        } catch (err) {
          alert('Failed to parse project state JSON');
        }
      };
      reader.readAsText(file);
    }
  };

  // -------------------------------------------------------------
  // GENERATE PACKAGE PDF (Task 4.8 & Section 6)
  // -------------------------------------------------------------
  const handleGeneratePackage = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await generateTenderPackage({
        tender,
        requirements,
        uploadedFiles,
        matches,
        includeIndexPage,
        sealConfig
      });

      // Trigger automatic download as <tender_id>_Package.pdf
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tender.tender_id}_Package.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        lang === 'bn'
          ? `প্যাকেজ তৈরি সম্পন্ন: ${tender.tender_id}_Package.pdf ডাউনলোড হয়েছে`
          : `Package generated successfully: ${tender.tender_id}_Package.pdf`
      );
    } catch (err) {
      console.error('Error generating PDF package:', err);
      alert('Failed to generate PDF package. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------
  // STATS CALCULATION
  // -------------------------------------------------------------
  let okCount = 0;
  let blockingCount = 0;

  for (const req of requirements) {
    const match = matches[req.id];
    const res = calculateDocumentStatus(req, match, tender.submission_deadline);
    if (res.status === 'OK') okCount++;
    if (res.isBlocking) blockingCount++;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Hidden file inputs for toolbar */}
      <input
        type="file"
        ref={requirementsFileInputRef}
        onChange={handleRequirementsFileUpload}
        accept=".json,application/json"
        className="hidden"
      />
      <input
        type="file"
        ref={projectFileInputRef}
        onChange={handleImportProjectState}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={() => setLang(prev => (prev === 'en' ? 'bn' : 'en'))}
        onLoadSamplePack={handleLoadSamplePack}
        onUploadRequirementsClick={() => requirementsFileInputRef.current?.click()}
        onReset={handleReset}
        onExportCsv={() =>
          exportChecklistToCSV({
            requirements,
            matches,
            uploadedFiles,
            submissionDeadline: tender.submission_deadline,
            lang
          })
        }
        onExportXlsx={() =>
          exportChecklistToXLSX({
            requirements,
            matches,
            uploadedFiles,
            submissionDeadline: tender.submission_deadline,
            lang
          })
        }
        onOpenSealModal={() => setIsSealModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onExportProject={handleExportProjectState}
        onImportProjectClick={() => projectFileInputRef.current?.click()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Executive Banner (Task 4.1) */}
        <ExecutiveBanner
          tender={tender}
          lang={lang}
          totalRequirements={requirements.length}
          okCount={okCount}
          blockingCount={blockingCount}
        />

        {/* Upload Zone (Task 4.2 & 4.6) */}
        <UploadZone
          files={uploadedFiles}
          lang={lang}
          onFilesSelected={handleFilesSelected}
          onRemoveFile={handleRemoveFile}
          rejectionAlert={rejectionAlert}
          onDismissRejection={() => setRejectionAlert(null)}
        />

        {/* Requirements Checklist Table (Task 4.3, 4.4, 4.5) */}
        <RequirementsTable
          requirements={requirements}
          uploadedFiles={uploadedFiles}
          matches={matches}
          submissionDeadline={tender.submission_deadline}
          lang={lang}
          onMatchChange={handleMatchChange}
          onExpiryDateChange={handleExpiryDateChange}
          onAutoMatchClick={handleAutoMatch}
        />

        {/* Package Generator (Task 4.7 & 4.8) */}
        <PackageGenerator
          tender={tender}
          requirements={requirements}
          matches={matches}
          lang={lang}
          isGenerating={isGenerating}
          includeIndexPage={includeIndexPage}
          onToggleIndexPage={setIncludeIndexPage}
          onGenerateClick={handleGeneratePackage}
        />
      </main>

      {/* Seal Modal (Bonus) */}
      <SealModal
        isOpen={isSealModalOpen}
        onClose={() => setIsSealModalOpen(false)}
        lang={lang}
        sealConfig={sealConfig}
        onUpdateSealConfig={setSealConfig}
      />

      {/* AI Assistant Modal (Bonus) */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{t.systemInfo}</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Client-side only</span>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <span>AI DevFest 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
