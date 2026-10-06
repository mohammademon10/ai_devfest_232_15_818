import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Requirement, TenderMetadata, UploadedFile, MatchEntry, SealConfig } from '../types';

export interface GeneratePackageOptions {
  tender: TenderMetadata;
  requirements: Requirement[];
  uploadedFiles: UploadedFile[];
  matches: Record<string, MatchEntry>;
  includeIndexPage?: boolean;
  sealConfig?: SealConfig;
}

export interface IncludedDocInfo {
  seq: number;
  reqId: string;
  title: string;
  filename: string;
  pageCount: number;
  startPage: number;
  fileBuffer: ArrayBuffer;
}

/**
 * Generates the official merged Tender Document Package PDF strictly adhering to Section 6:
 * 1. Page 1: Official Cover Page (in English) with Tender Information & Table of Included Documents.
 * 2. Documents merged sequentially in strict requirement order.
 * 3. Every page stamped with universal footer: "<tender_id> | Page X of Y".
 * 4. Optional PNG Seal / Signature stamping.
 */
export async function generateTenderPackage(options: GeneratePackageOptions): Promise<Uint8Array> {
  const { tender, requirements, uploadedFiles, matches, includeIndexPage = false, sealConfig } = options;

  // 1. Determine list of included documents in strict order
  const fileMap = new Map<string, UploadedFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  // Sort requirements strictly by order
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);

  const includedDocs: IncludedDocInfo[] = [];
  let seq = 1;

  for (const req of sortedReqs) {
    const match = matches[req.id];
    if (match?.fileId && fileMap.has(match.fileId)) {
      const file = fileMap.get(match.fileId)!;
      includedDocs.push({
        seq: seq++,
        reqId: req.id,
        title: req.title_en,
        filename: file.name,
        pageCount: file.pageCount || 1,
        startPage: 0, // Calculated below
        fileBuffer: file.arrayBuffer
      });
    }
  }

  // Calculate starting pages
  // Cover page is Page 1.
  // If index page is enabled, index page is Page 2.
  let currentDocStartPage = 1 + (includeIndexPage ? 1 : 0) + 1;
  for (const doc of includedDocs) {
    doc.startPage = currentDocStartPage;
    currentDocStartPage += doc.pageCount;
  }

  // Create combined PDF document
  const finalPdf = await PDFDocument.create();
  const fontHelvetica = await finalPdf.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await finalPdf.embedFont(StandardFonts.HelveticaBold);

  // -------------------------------------------------------------
  // PAGE 1: COVER PAGE (Strictly in English as per Rule 6.1)
  // Standard Letter / A4 dimensions: 595.28 x 841.89 pt (A4 portrait)
  // -------------------------------------------------------------
  const coverWidth = 595.28;
  const coverHeight = 841.89;
  const coverPage = finalPdf.addPage([coverWidth, coverHeight]);

  const leftMargin = 54; // 0.75 in
  let cursorY = coverHeight - 64;

  // Title: "Tender Document Package"
  coverPage.drawText('Tender Document Package', {
    x: leftMargin,
    y: cursorY,
    size: 24,
    font: fontHelveticaBold,
    color: rgb(0.12, 0.28, 0.65) // Professional GovTech Blue
  });

  cursorY -= 14;

  // Blue accent rule
  coverPage.drawLine({
    start: { x: leftMargin, y: cursorY },
    end: { x: coverWidth - leftMargin, y: cursorY },
    thickness: 2.5,
    color: rgb(0.18, 0.42, 0.90)
  });

  cursorY -= 36;

  // Section Header: "Tender Information"
  coverPage.drawText('Tender Information', {
    x: leftMargin,
    y: cursorY,
    size: 13,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.1, 0.1)
  });

  cursorY -= 22;

  // Format today's date YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const tenderInfoRows = [
    { label: 'Tender ID:', value: tender.tender_id },
    { label: 'Tender Title:', value: tender.title },
    { label: 'Procuring Entity:', value: tender.procuring_entity },
    { label: 'Bidder Name:', value: tender.bidder },
    { label: 'Submission Deadline:', value: tender.submission_deadline },
    { label: 'Package Created Date:', value: todayStr },
  ];

  const labelX = leftMargin + 6;
  const valX = leftMargin + 145;

  for (const row of tenderInfoRows) {
    coverPage.drawText(row.label, {
      x: labelX,
      y: cursorY,
      size: 10,
      font: fontHelveticaBold,
      color: rgb(0.15, 0.15, 0.15)
    });
    coverPage.drawText(row.value, {
      x: valX,
      y: cursorY,
      size: 10,
      font: fontHelvetica,
      color: rgb(0.2, 0.2, 0.2)
    });
    cursorY -= 17;
  }

  cursorY -= 20;

  // Section Header: "Included Documents (in order)"
  coverPage.drawText('Included Documents (in order)', {
    x: leftMargin,
    y: cursorY,
    size: 13,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.1, 0.1)
  });

  cursorY -= 18;

  // Table header background bar
  const tableWidth = coverWidth - (leftMargin * 2);
  coverPage.drawRectangle({
    x: leftMargin,
    y: cursorY - 4,
    width: tableWidth,
    height: 19,
    color: rgb(0.95, 0.96, 0.98)
  });

  // Table columns
  const colSeq = leftMargin + 6;
  const colReqId = leftMargin + 28;
  const colDocTitle = leftMargin + 78;
  const colFilename = leftMargin + 270;
  const colPages = leftMargin + tableWidth - 36;

  coverPage.drawText('#', { x: colSeq, y: cursorY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
  coverPage.drawText('Req ID', { x: colReqId, y: cursorY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
  coverPage.drawText('Document Title', { x: colDocTitle, y: cursorY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
  coverPage.drawText('Matched File', { x: colFilename, y: cursorY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
  coverPage.drawText('Pages', { x: colPages, y: cursorY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });

  cursorY -= 18;

  // Render Table Rows
  for (const doc of includedDocs) {
    coverPage.drawText(String(doc.seq), { x: colSeq, y: cursorY, size: 8.5, font: fontHelvetica, color: rgb(0.25, 0.25, 0.25) });
    coverPage.drawText(doc.reqId, { x: colReqId, y: cursorY, size: 8.5, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
    
    // Truncate long title if needed
    const displayTitle = doc.title.length > 32 ? doc.title.slice(0, 30) + '...' : doc.title;
    coverPage.drawText(displayTitle, { x: colDocTitle, y: cursorY, size: 8.5, font: fontHelvetica, color: rgb(0.2, 0.2, 0.2) });

    // Truncate long filename if needed
    const displayFilename = doc.filename.length > 30 ? doc.filename.slice(0, 28) + '...' : doc.filename;
    coverPage.drawText(displayFilename, { x: colFilename, y: cursorY, size: 8.5, font: fontHelvetica, color: rgb(0.25, 0.25, 0.25) });

    coverPage.drawText(String(doc.pageCount), { x: colPages + 6, y: cursorY, size: 8.5, font: fontHelvetica, color: rgb(0.25, 0.25, 0.25) });

    cursorY -= 16;
  }

  // -------------------------------------------------------------
  // OPTIONAL BONUS: INDEX / TABLE OF CONTENTS PAGE
  // -------------------------------------------------------------
  if (includeIndexPage) {
    const indexPage = finalPdf.addPage([coverWidth, coverHeight]);
    let indexY = coverHeight - 64;

    indexPage.drawText('Table of Contents', {
      x: leftMargin,
      y: indexY,
      size: 20,
      font: fontHelveticaBold,
      color: rgb(0.12, 0.28, 0.65)
    });

    indexY -= 14;
    indexPage.drawLine({
      start: { x: leftMargin, y: indexY },
      end: { x: coverWidth - leftMargin, y: indexY },
      thickness: 1.5,
      color: rgb(0.18, 0.42, 0.90)
    });

    indexY -= 32;

    indexPage.drawRectangle({
      x: leftMargin,
      y: indexY - 4,
      width: tableWidth,
      height: 19,
      color: rgb(0.95, 0.96, 0.98)
    });

    indexPage.drawText('#', { x: colSeq, y: indexY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
    indexPage.drawText('Document Title', { x: colDocTitle, y: indexY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
    indexPage.drawText('Start Page', { x: colFilename, y: indexY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
    indexPage.drawText('Total Pages', { x: colPages - 15, y: indexY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });

    indexY -= 20;

    for (const doc of includedDocs) {
      indexPage.drawText(String(doc.seq), { x: colSeq, y: indexY, size: 9, font: fontHelvetica, color: rgb(0.3, 0.3, 0.3) });
      indexPage.drawText(`${doc.reqId} - ${doc.title}`, { x: colDocTitle, y: indexY, size: 9, font: fontHelveticaBold, color: rgb(0.2, 0.2, 0.2) });
      indexPage.drawText(`Page ${doc.startPage}`, { x: colFilename, y: indexY, size: 9, font: fontHelvetica, color: rgb(0.3, 0.3, 0.3) });
      indexPage.drawText(`${doc.pageCount}`, { x: colPages, y: indexY, size: 9, font: fontHelvetica, color: rgb(0.3, 0.3, 0.3) });
      indexY -= 18;
    }
  }

  // -------------------------------------------------------------
  // SEQUENTIAL DOCUMENT MERGING
  // -------------------------------------------------------------
  for (const doc of includedDocs) {
    try {
      const srcDoc = await PDFDocument.load(doc.fileBuffer);
      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await finalPdf.copyPages(srcDoc, pageIndices);
      for (const page of copiedPages) {
        finalPdf.addPage(page);
      }
    } catch (err) {
      console.error(`Error loading PDF for ${doc.filename}:`, err);
    }
  }

  // -------------------------------------------------------------
  // UNIVERSAL FOOTER ON EVERY PAGE (Including Cover Page)
  // Format: "<tender_id> | Page X of Y"
  // Helvetica 8-9pt, clean, 15-20pt above bottom margin
  // -------------------------------------------------------------
  const totalPages = finalPdf.getPageCount();

  // Load seal image if provided
  let embeddedSealImage: any = null;
  if (sealConfig?.imageDataUrl) {
    try {
      // Decode data URL to bytes
      const base64Data = sealConfig.imageDataUrl.split(',')[1];
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      embeddedSealImage = await finalPdf.embedPng(bytes);
    } catch (err) {
      console.warn('Failed to embed seal PNG:', err);
    }
  }

  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1;
    const page = finalPdf.getPage(i);
    const { width } = page.getSize();

    // Universal footer text
    const footerText = `${tender.tender_id} | Page ${pageNumber} of ${totalPages}`;
    const textWidth = fontHelvetica.widthOfTextAtSize(footerText, 8.5);
    const footerX = (width - textWidth) / 2; // Centered
    const footerY = 16; // 16pt above bottom margin

    page.drawText(footerText, {
      x: footerX,
      y: footerY,
      size: 8.5,
      font: fontHelvetica,
      color: rgb(0.4, 0.45, 0.5)
    });

    // Apply digital seal if configured
    if (embeddedSealImage && sealConfig) {
      let shouldApplySeal = false;
      if (sealConfig.targetPages === 'all') {
        shouldApplySeal = true;
      } else if (sealConfig.targetPages === 'first_and_last') {
        shouldApplySeal = pageNumber === 1 || pageNumber === totalPages;
      }

      if (shouldApplySeal) {
        const sealW = sealConfig.width || 80;
        const sealH = sealConfig.height || 80;
        let sealX = width - sealW - 40;
        let sealY = 32;

        if (sealConfig.position === 'bottom-left') {
          sealX = 40;
          sealY = 32;
        }

        page.drawImage(embeddedSealImage, {
          x: sealX,
          y: sealY,
          width: sealW,
          height: sealH,
          opacity: 0.85
        });
      }
    }
  }

  return await finalPdf.save();
}
