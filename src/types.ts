export type Language = 'en' | 'bn';

export interface TenderMetadata {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface Requirement {
  id: string; // e.g. "R01"
  order: number; // 1, 2, ...
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsData {
  tender: TenderMetadata;
  requirements: Requirement[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number; // in bytes
  pageCount: number;
  hash: string; // SHA-256
  isDuplicate: boolean;
  duplicateGroup?: string[]; // IDs of duplicate files
  arrayBuffer: ArrayBuffer;
  isEncrypted?: boolean;
  isCorrupt?: boolean;
}

export type DocumentStatus =
  | 'OK'
  | 'MISSING'
  | 'EXPIRY_NEEDED'
  | 'EXPIRED'
  | 'NOT_PROVIDED';

export interface MatchEntry {
  fileId?: string;
  expiryDate?: string; // YYYY-MM-DD
}

export type MatchesState = Record<string, MatchEntry>; // key is requirement.id

export interface SealConfig {
  imageDataUrl: string | null;
  imageFileName: string | null;
  targetPages: 'all' | 'first_and_last' | 'custom';
  customPages: number[];
  position: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
  width: number;
  height: number;
}
