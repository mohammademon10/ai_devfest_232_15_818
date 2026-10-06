import { Requirement, MatchEntry, DocumentStatus } from '../types';

export interface StatusResult {
  status: DocumentStatus;
  isBlocking: boolean;
  messageKey: string;
}

/**
 * Calculates real-time document compliance status according to Section 5 of the rulebook:
 * 1. "Missing" [Blocks: YES] - Required document, no file matched.
 * 2. "Expiry date needed" [Blocks: YES] - has_expiry = true and a file is matched, but no expiry date entered.
 * 3. "Expired" [Blocks: YES] - The expiry date is before the submission deadline (expiry_date < submission_deadline).
 * 4. "Not provided" [Blocks: NO] - Optional document, no file matched.
 * 5. "OK" [Blocks: NO] - File matched, and (if has_expiry) expiry date is on or after submission deadline.
 * (Note: If document expires on the same day as submission deadline, it is still OK).
 */
export function calculateDocumentStatus(
  req: Requirement,
  match: MatchEntry | undefined,
  submissionDeadline: string
): StatusResult {
  const hasMatchedFile = Boolean(match?.fileId);

  // If no file is matched
  if (!hasMatchedFile) {
    if (req.mandatory) {
      return {
        status: 'MISSING',
        isBlocking: true,
        messageKey: 'statusMissing'
      };
    } else {
      return {
        status: 'NOT_PROVIDED',
        isBlocking: false,
        messageKey: 'statusNotProvided'
      };
    }
  }

  // If file is matched: check expiry if required
  if (req.has_expiry) {
    const expiry = match?.expiryDate?.trim();
    if (!expiry) {
      return {
        status: 'EXPIRY_NEEDED',
        isBlocking: true,
        messageKey: 'statusExpiryNeeded'
      };
    }

    // Compare date strings YYYY-MM-DD lexicographically (or via timestamps)
    // Lexicographical comparison for ISO YYYY-MM-DD is exact and timezone-agnostic
    if (expiry < submissionDeadline) {
      return {
        status: 'EXPIRED',
        isBlocking: true,
        messageKey: 'statusExpired'
      };
    }

    // expiry >= submissionDeadline (including same day)
    return {
      status: 'OK',
      isBlocking: false,
      messageKey: 'statusOk'
    };
  }

  // File is matched and document has no expiry requirement
  return {
    status: 'OK',
    isBlocking: false,
    messageKey: 'statusOk'
  };
}
