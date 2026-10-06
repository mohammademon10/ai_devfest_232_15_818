import { Requirement, UploadedFile, MatchesState } from '../types';

interface AutoMatchResult {
  newMatches: MatchesState;
  matchedCount: number;
}

export function performAutoMatch(
  requirements: Requirement[],
  uploadedFiles: UploadedFile[],
  currentMatches: MatchesState
): AutoMatchResult {
  const resultMatches: MatchesState = { ...currentMatches };
  const usedFileIds = new Set<string>();

  // Collect already matched files that are valid
  for (const [_, match] of Object.entries(resultMatches)) {
    if (match.fileId) {
      usedFileIds.add(match.fileId);
    }
  }

  // Pre-filter valid non-duplicate files or only the primary file of each duplicate group
  const availableFiles = uploadedFiles.filter(f => !f.isCorrupt && !f.isEncrypted);

  let matchedCount = 0;

  // Keyword rules mapping requirement ID to filename keywords (ordered by priority)
  const matchingRules: Record<string, { patterns: RegExp[]; defaultExpiry?: string }> = {
    R01: {
      patterns: [/trade.*license.*2026/i, /trade.*license/i],
      defaultExpiry: '2027-06-30'
    },
    R02: {
      patterns: [/tin.*certificate/i, /tin/i]
    },
    R03: {
      patterns: [/vat.*certificate/i, /vat/i]
    },
    R04: {
      patterns: [/bank.*solvency/i, /bank/i],
      defaultExpiry: '2026-12-31'
    },
    R05: {
      patterns: [/experience.*cert/i, /experience/i]
    },
    R06: {
      patterns: [/audited.*financial/i, /audit/i]
    },
    R07: {
      patterns: [/manufacturer.*auth/i, /authorization/i]
    },
    R08: {
      patterns: [/technical.*proposal/i, /technical/i]
    },
    R09: {
      patterns: [/financial.*proposal/i, /financial/i]
    },
    R10: {
      patterns: [/declaration/i, /signed.*declaration/i, /scan_0042/i, /scan/i]
    }
  };

  // Sort requirements strictly by order
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  for (const req of sortedReqs) {
    // If requirement already has a file matched, skip or keep
    if (resultMatches[req.id]?.fileId) {
      continue;
    }

    const rule = matchingRules[req.id];
    if (!rule) continue;

    // Find best candidate among unused files
    let bestFile: UploadedFile | null = null;

    for (const pattern of rule.patterns) {
      const match = availableFiles.find(
        f => !usedFileIds.has(f.id) && pattern.test(f.name)
      );
      if (match) {
        bestFile = match;
        break;
      }
    }

    if (bestFile) {
      usedFileIds.add(bestFile.id);
      resultMatches[req.id] = {
        fileId: bestFile.id,
        expiryDate: resultMatches[req.id]?.expiryDate || (req.has_expiry ? rule.defaultExpiry : undefined)
      };
      matchedCount++;
    }
  }

  return { newMatches: resultMatches, matchedCount };
}
