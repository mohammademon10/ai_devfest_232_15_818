import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateSamplePackage() {
  const reqData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'sample-pack/requirements.json'), 'utf8'));
  const tender = reqData.tender;
  const requirements = reqData.requirements;

  // The 8 matched files after resolving sample-pack traps:
  // R01 -> trade_license_2026.pdf (1 page)
  // R02 -> 03_tin_certificate.pdf (1 page)
  // R03 -> 04_vat_certificate.pdf (1 page)
  // R04 -> bank_solvency.pdf (1 page)
  // R05 -> experience_cert.pdf (2 pages) (not experience_cert (1).pdf which is duplicate)
  // R06 -> optional, not provided
  // R07 -> optional, not provided
  // R08 -> 02_technical_proposal.pdf (6 pages)
  // R09 -> 01_financial_proposal.pdf (2 pages)
  // R10 -> scan_0042.pdf (1 page)

  const docMapping = [
    { reqId: 'R01', filename: 'trade_license_2026.pdf' },
    { reqId: 'R02', filename: '03_tin_certificate.pdf' },
    { reqId: 'R03', filename: '04_vat_certificate.pdf' },
    { reqId: 'R04', filename: 'bank_solvency.pdf' },
    { reqId: 'R05', filename: 'experience_cert.pdf' },
    { reqId: 'R08', filename: '02_technical_proposal.pdf' },
    { reqId: 'R09', filename: '01_financial_proposal.pdf' },
    { reqId: 'R10', filename: 'scan_0042.pdf' }
  ];

  const reqMap = new Map(requirements.map(r => [r.id, r]));

  const includedDocs = [];
  let seq = 1;

  for (const item of docMapping) {
    const req = reqMap.get(item.reqId);
    const filePath = path.join(process.cwd(), 'sample-pack/documents', item.filename);
    const buffer = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(buffer);
    includedDocs.push({
      seq: seq++,
      reqId: req.id,
      title: req.title_en,
      filename: item.filename,
      pageCount: pdf.getPageCount(),
      fileBuffer: buffer
    });
  }

  const finalPdf = await PDFDocument.create();
  const fontHelvetica = await finalPdf.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await finalPdf.embedFont(StandardFonts.HelveticaBold);

  // -------------------------------------------------------------
  // PAGE 1: COVER PAGE (Strictly in English as per Rule 6.1)
  // -------------------------------------------------------------
  const coverWidth = 595.28;
  const coverHeight = 841.89;
  const coverPage = finalPdf.addPage([coverWidth, coverHeight]);

  const leftMargin = 54;
  let cursorY = coverHeight - 64;

  // Title: "Tender Document Package"
  coverPage.drawText('Tender Document Package', {
    x: leftMargin,
    y: cursorY,
    size: 24,
    font: fontHelveticaBold,
    color: rgb(0.12, 0.28, 0.65)
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

  const todayStr = '2026-10-06';

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
    coverPage.drawText(doc.title, { x: colDocTitle, y: cursorY, size: 8.5, font: fontHelvetica, color: rgb(0.2, 0.2, 0.2) });
    coverPage.drawText(doc.filename, { x: colFilename, y: cursorY, size: 8.5, font: fontHelvetica, color: rgb(0.25, 0.25, 0.25) });
    coverPage.drawText(String(doc.pageCount), { x: colPages + 6, y: cursorY, size: 8.5, font: fontHelvetica, color: rgb(0.25, 0.25, 0.25) });
    cursorY -= 16;
  }

  // -------------------------------------------------------------
  // SEQUENTIAL DOCUMENT MERGING
  // -------------------------------------------------------------
  for (const doc of includedDocs) {
    const srcDoc = await PDFDocument.load(doc.fileBuffer);
    const copiedPages = await finalPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of copiedPages) {
      finalPdf.addPage(page);
    }
  }

  // -------------------------------------------------------------
  // UNIVERSAL FOOTER ON EVERY PAGE (Including Cover Page)
  // Format: "<tender_id> | Page X of Y"
  // -------------------------------------------------------------
  const totalPages = finalPdf.getPageCount();
  console.log(`Final total page count: ${totalPages}`);

  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1;
    const page = finalPdf.getPage(i);
    const { width } = page.getSize();

    const footerText = `${tender.tender_id} | Page ${pageNumber} of ${totalPages}`;
    const textWidth = fontHelvetica.widthOfTextAtSize(footerText, 8.5);
    const footerX = (width - textWidth) / 2;
    const footerY = 16;

    page.drawText(footerText, {
      x: footerX,
      y: footerY,
      size: 8.5,
      font: fontHelvetica,
      color: rgb(0.4, 0.45, 0.5)
    });
  }

  const pdfBytes = await finalPdf.save();
  const outputPath = path.join(process.cwd(), 'output', `${tender.tender_id}_Package.pdf`);
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Successfully generated verified package at: ${outputPath}`);
}

generateSamplePackage().catch(err => {
  console.error(err);
  process.exit(1);
});
