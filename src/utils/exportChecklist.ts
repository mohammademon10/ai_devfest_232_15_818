import * as XLSX from 'xlsx';
import { Requirement, MatchEntry, UploadedFile, DocumentStatus, Language } from '../types';
import { calculateDocumentStatus } from './status';

export interface ExportChecklistParams {
  requirements: Requirement[];
  matches: Record<string, MatchEntry>;
  uploadedFiles: UploadedFile[];
  submissionDeadline: string;
  lang: Language;
}

export function exportChecklistToCSV(params: ExportChecklistParams): void {
  const { requirements, matches, uploadedFiles, submissionDeadline, lang } = params;
  const fileMap = new Map(uploadedFiles.map(f => [f.id, f]));
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  const headers = [
    'Order',
    'Requirement ID',
    lang === 'bn' ? 'নথির শিরোনাম' : 'Document Title',
    lang === 'bn' ? 'বাধ্যতামূলক/ঐচ্ছিক' : 'Mandatory/Optional',
    lang === 'bn' ? 'সংযুক্ত ফাইল' : 'Matched File',
    lang === 'bn' ? 'পৃষ্ঠা সংখ্যা' : 'Pages',
    lang === 'bn' ? 'মেয়াদ উত্তীর্ণের তারিখ' : 'Expiry Date',
    lang === 'bn' ? 'স্ট্যাটাস' : 'Status'
  ];

  const rows = sortedReqs.map(req => {
    const match = matches[req.id];
    const file = match?.fileId ? fileMap.get(match.fileId) : undefined;
    const statusRes = calculateDocumentStatus(req, match, submissionDeadline);

    return [
      req.order,
      req.id,
      `"${lang === 'bn' ? req.title_bn : req.title_en}"`,
      req.mandatory ? (lang === 'bn' ? 'বাধ্যতামূলক' : 'Mandatory') : (lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'),
      file ? `"${file.name}"` : '—',
      file ? file.pageCount : '—',
      match?.expiryDate || '—',
      statusRes.status
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Tender_Checklist_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportChecklistToXLSX(params: ExportChecklistParams): void {
  const { requirements, matches, uploadedFiles, submissionDeadline, lang } = params;
  const fileMap = new Map(uploadedFiles.map(f => [f.id, f]));
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  const data = sortedReqs.map(req => {
    const match = matches[req.id];
    const file = match?.fileId ? fileMap.get(match.fileId) : undefined;
    const statusRes = calculateDocumentStatus(req, match, submissionDeadline);

    return {
      '#': req.order,
      'Requirement ID': req.id,
      'Document Title': lang === 'bn' ? req.title_bn : req.title_en,
      'Type': req.mandatory ? (lang === 'bn' ? 'বাধ্যতামূলক' : 'Mandatory') : (lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'),
      'Matched File': file ? file.name : '—',
      'Pages': file ? file.pageCount : '—',
      'Expiry Date': match?.expiryDate || '—',
      'Status': statusRes.status
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklist');
  XLSX.writeFile(workbook, `Tender_Checklist_${new Date().toISOString().split('T')[0]}.xlsx`);
}
