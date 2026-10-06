export const translations = {
  en: {
    appTitle: "Tender Document Package Builder",
    appSubtitle: "AI DevFest 2026 — Official Submission Preparation & Compliance Engine",
    govBadge: "Government / Enterprise Ready",
    langToggle: "বাংলা",
    langName: "English",
    
    // Header & Quick Actions
    loadSamplePack: "Load Sample Pack",
    loadRequirementsFile: "Upload requirements.json",
    resetAll: "Reset Project",
    confirmReset: "Are you sure you want to reset all current files and matches?",
    exportProject: "Export State (.json)",
    importProject: "Import State (.json)",
    exportChecklistCsv: "Export Checklist (CSV)",
    exportChecklistXlsx: "Export Checklist (Excel)",
    
    // Executive Banner
    executiveBannerTitle: "Tender Overview",
    tenderId: "Tender ID",
    procuringEntity: "Procuring Entity",
    bidderName: "Bidder Name",
    submissionDeadline: "Submission Deadline",
    tenderTitle: "Tender Title",
    createdDate: "Package Date",
    statusSummary: "Compliance Summary",
    allRequirementsMet: "All mandatory requirements verified and ready for generation",
    blockingRequirementsFound: "Action required before package can be generated",
    
    // Upload Zone
    uploadZoneTitle: "Upload Document PDFs",
    uploadZoneDesc: "Drag & drop PDF files here, or click to browse files (Up to 30 files, max 50 MB total)",
    selectFiles: "Select Files",
    uploadedFilesCount: "Uploaded Files ({count})",
    noFilesUploaded: "No files uploaded yet. Upload document PDFs to match with tender requirements.",
    removeFile: "Remove File",
    pages: "pages",
    page: "page",
    duplicateBadge: "Duplicate File",
    duplicateWarning: "This file has identical content (SHA-256) to another file. Cannot match duplicate files to different requirements.",
    rejectNonPdf: "Rejected non-PDF file: {filename}. Only PDF files are supported.",
    corruptedPdf: "Failed to read PDF file: {filename}. The file may be password-protected or corrupted.",
    
    // Requirements Table
    requirementsTitle: "Document Requirements Checklist",
    requirementsSubtitle: "Match uploaded files to requirements strictly in 1-to-1 manner. Check expiry dates against submission deadline.",
    autoMatchBtn: "Auto-Match Files",
    autoMatchSuccess: "Auto-matched {count} file(s) based on intelligent document recognition.",
    tableColSeq: "#",
    tableColReqId: "Req ID",
    tableColTitle: "Document Title",
    tableColType: "Requirement Type",
    tableColExpiry: "Expiry Check",
    tableColMatchedFile: "Matched PDF File",
    tableColExpiryDate: "Expiry Date (YYYY-MM-DD)",
    tableColStatus: "Compliance Status",
    tableColActions: "Actions",
    
    // Badges & Labels
    mandatoryBadge: "Mandatory",
    optionalBadge: "Optional",
    hasExpiryBadge: "Expiry Required",
    noExpiryBadge: "No Expiry",
    unmatch: "Unmatch",
    selectFilePlaceholder: "-- Select uploaded file --",
    fileAlreadyMatched: "(Already matched elsewhere)",
    fileIsDuplicateBlocked: "(Duplicate of matched file)",
    
    // Document Statuses
    statusMissing: "Missing",
    statusExpiryNeeded: "Expiry date needed",
    statusExpired: "Expired",
    statusNotProvided: "Not provided",
    statusOk: "OK",
    
    // Status descriptions
    statusDescMissing: "Required document with no file matched (Blocks generation).",
    statusDescExpiryNeeded: "Expiry date is required for this document (Blocks generation).",
    statusDescExpired: "Document expires before the submission deadline (Blocks generation).",
    statusDescNotProvided: "Optional document without matched file (Allowed).",
    statusDescOk: "Document verified and compliant with tender rules.",
    
    // Generate Package Section
    generateSectionTitle: "Final Package Construction",
    generateBtn: "Generate & Download Package",
    generatingBtn: "Generating Package PDF...",
    packageReady: "Package verified and ready for generation",
    blockingSummaryTitle: "Cannot generate package due to blocking issue(s):",
    includeIndexPage: "Include Table of Contents / Index Page (Bonus Feature)",
    includeCoverPage: "Include Official Cover Page (Rule 6.1)",
    stampSealBtn: "PNG Seal / Digital Signature (Bonus)",
    aiAssistantBtn: "AI Inspection Assistant (BYOK)",
    
    // Seal Modal
    sealModalTitle: "Digital Seal / Signature Stamper",
    sealModalDesc: "Upload an official company seal or signature (PNG) to stamp onto generated package pages.",
    uploadSealPng: "Select PNG Seal / Signature",
    sealTarget: "Apply Seal To:",
    sealAllPages: "All Pages",
    sealFirstAndLast: "First and Last Pages",
    sealCoverOnly: "Cover Page Only",
    sealPosition: "Placement Position:",
    sealBottomRight: "Bottom Right (Above Footer)",
    sealBottomLeft: "Bottom Left (Above Footer)",
    sealClose: "Save & Close",
    sealRemove: "Remove Seal",
    
    // AI Modal
    aiModalTitle: "AI Document Assistant (BYOK - Bring Your Own Key)",
    aiModalDesc: "Client-side only AI assistant. Enter your Google Gemini or OpenAI API key to automatically parse scanned PDF text and extract validity dates. Your key is stored ONLY in your local browser memory and never sent to any backend.",
    aiProvider: "AI Provider",
    aiApiKey: "API Key",
    aiAnalyzeBtn: "Analyze Matched Documents",
    aiClose: "Close",
    
    // Instructions / Guide
    rulesGuideTitle: "Contest Rules & Submission Checklist",
    rule1Text: "Strict 1-to-1 matching: 1 document gets at most 1 file, 1 file goes to at most 1 document.",
    rule2Text: "Expired documents (expiry < deadline) block package generation.",
    rule3Text: "Same-day expiry (expiry == deadline) is strictly valid (OK).",
    rule4Text: "Exact duplicates are flagged with SHA-256 and cannot be assigned to different items.",
    rule5Text: "Universal footer format: '<tender_id> | Page X of Y' on every page.",
    
    // Footer
    systemInfo: "AI DevFest 2026 Contestant Submission | 100% Client-Side In-Browser Engine | Zero Secrets & Zero Backends",
  },
  bn: {
    appTitle: "দরপত্র নথি প্যাকেজ প্রস্তুতকারক",
    appSubtitle: "এআই ডেভফেস্ট ২০২৬ — অফিসিয়াল দরপত্র জমা ও সম্মতি পরীক্ষণ ইঞ্জিন",
    govBadge: "সরকারি ও কর্পোরেট অনুবর্তী",
    langToggle: "English",
    langName: "বাংলা",
    
    // Header & Quick Actions
    loadSamplePack: "নমুনা প্যাক লোড করুন",
    loadRequirementsFile: "requirements.json আপলোড করুন",
    resetAll: "প্রজেক্ট রিসেট করুন",
    confirmReset: "আপনি কি নিশ্চিত যে সমস্ত ফাইল এবং ম্যাচিং রিসেট করতে চান?",
    exportProject: "স্টেট এক্সপোর্ট (.json)",
    importProject: "স্টেট ইম্পোর্ট (.json)",
    exportChecklistCsv: "চেকলিস্ট এক্সপোর্ট (CSV)",
    exportChecklistXlsx: "চেকলিস্ট এক্সপোর্ট (Excel)",
    
    // Executive Banner
    executiveBannerTitle: "দরপত্রের সংক্ষিপ্ত বিবরণ",
    tenderId: "দরপত্র আইডি",
    procuringEntity: "ক্রয়কারী কর্তৃপক্ষ",
    bidderName: "দরপত্রদাতার নাম",
    submissionDeadline: "জমা দেওয়ার শেষ তারিখ",
    tenderTitle: "দরপত্রের শিরোনাম",
    createdDate: "প্যাকেজ তৈরির তারিখ",
    statusSummary: "অনুবর্তিতা সারসংক্ষেপ",
    allRequirementsMet: "সমস্ত বাধ্যতামূলক শর্তাবলি সফলভাবে যাচাইকৃত ও প্যাকেজ প্রস্তুতের জন্য প্রস্তুত",
    blockingRequirementsFound: "প্যাকেজ তৈরির পূর্বে নিচের অসঙ্গতিগুলো সংশোধন করুন",
    
    // Upload Zone
    uploadZoneTitle: "পিডিএফ ফাইলসমূহ আপলোড করুন",
    uploadZoneDesc: "এখানে পিডিএফ ফাইল ড্র্যাগ ও ড্রপ করুন, অথবা ব্রাউজ করতে ক্লিক করুন (সর্বোচ্চ ৩০টি ফাইল, মোট ৫০ মেগাবাইট)",
    selectFiles: "ফাইল নির্বাচন করুন",
    uploadedFilesCount: "আপলোডকৃত ফাইল ({count}টি)",
    noFilesUploaded: "এখনও কোনো ফাইল আপলোড করা হয়নি। দরপত্রের চাহিদার সাথে মেলাতে পিডিএফ ফাইল আপলোড করুন।",
    removeFile: "ফাইল সরান",
    pages: "পৃষ্ঠা",
    page: "পৃষ্ঠা",
    duplicateBadge: "ডুপ্লিকেট ফাইল",
    duplicateWarning: "এই ফাইলের বিষয়বস্তু (SHA-256) অন্য একটি ফাইলের সাথে হুবহু মিল রয়েছে। ডুপ্লিকেট ফাইল ভিন্ন ভিন্ন নথিতে ব্যবহার নিষিদ্ধ।",
    rejectNonPdf: "নন-পিডিএফ ফাইল প্রত্যাখ্যাত: {filename}। শুধুমাত্র পিডিএফ ফাইল সমর্থিত।",
    corruptedPdf: "পিডিএফ ফাইলটি পড়া যায়নি: {filename}। ফাইলটি পাসওয়ার্ড সুরক্ষিত বা ক্ষতিগ্রস্ত হতে পারে।",
    
    // Requirements Table
    requirementsTitle: "প্রয়োজনীয় নথির চেকলিস্ট",
    requirementsSubtitle: "আপলোডকৃত ফাইলসমূহ ১-থেকে-১ অনুপাতে মেলান। শেষ তারিখের সাথে মেয়াদের সামঞ্জস্য পরীক্ষা করুন।",
    autoMatchBtn: "স্বয়ংক্রিয় ম্যাচিং",
    autoMatchSuccess: "নথি শনাক্তকরণের মাধ্যমে {count}টি ফাইল স্বয়ংক্রিয়ভাবে মেলানো হয়েছে।",
    tableColSeq: "নং",
    tableColReqId: "নথি আইডি",
    tableColTitle: "নথির শিরোনাম",
    tableColType: "নথির ধরন",
    tableColExpiry: "মেয়াদ পরীক্ষা",
    tableColMatchedFile: "সংযুক্ত পিডিএফ ফাইল",
    tableColExpiryDate: "মেয়াদ উত্তীর্ণের তারিখ (YYYY-MM-DD)",
    tableColStatus: "সম্মতি স্ট্যাটাস",
    tableColActions: "পদক্ষেপ",
    
    // Badges & Labels
    mandatoryBadge: "বাধ্যতামূলক",
    optionalBadge: "ঐচ্ছিক",
    hasExpiryBadge: "মেয়াদ আবশ্যক",
    noExpiryBadge: "মেয়াদ মুক্ত",
    unmatch: "বাতিল করুন",
    selectFilePlaceholder: "-- আপলোডকৃত ফাইল নির্বাচন করুন --",
    fileAlreadyMatched: "(ইতিমধ্যে অন্য নথিতে সংযুক্ত)",
    fileIsDuplicateBlocked: "(সংযুক্ত ফাইলের ডুপ্লিকেট)",
    
    // Document Statuses
    statusMissing: "অনুপস্থিত (Missing)",
    statusExpiryNeeded: "মেয়াদ প্রয়োজন (Expiry needed)",
    statusExpired: "মেয়াদোত্তীর্ণ (Expired)",
    statusNotProvided: "দেওয়া হয়নি (Not provided)",
    statusOk: "সঠিক (OK)",
    
    // Status descriptions
    statusDescMissing: "বাধ্যতামূলক নথিতে কোনো ফাইল সংযুক্ত করা হয়নি (প্যাকেজ তৈরিতে বাধা)।",
    statusDescExpiryNeeded: "এই নথির জন্য মেয়াদ উত্তীর্ণের তারিখ আবশ্যক (প্যাকেজ তৈরিতে বাধা)।",
    statusDescExpired: "নথির মেয়াদ জমা দেওয়ার শেষ তারিখের পূর্বে শেষ হয়েছে (প্যাকেজ তৈরিতে বাধা)।",
    statusDescNotProvided: "ঐচ্ছিক নথিতে ফাইল দেওয়া হয়নি (অনুমোদিত)।",
    statusDescOk: "নথিটি যাচাইকৃত এবং দরপত্রের নিয়মের সাথে সম্পূর্ণ সংগতিপূর্ণ।",
    
    // Generate Package Section
    generateSectionTitle: "চূড়ান্ত প্যাকেজ প্রস্তুতকরণ",
    generateBtn: "প্যাকেজ তৈরি ও ডাউনলোড করুন",
    generatingBtn: "প্যাকেজ পিডিএফ তৈরি হচ্ছে...",
    packageReady: "প্যাকেজ যাচাইকৃত এবং তৈরি করার জন্য সম্পূর্ণ প্রস্তুত",
    blockingSummaryTitle: "নিম্নলিখিত সমস্যার কারণে প্যাকেজ তৈরি করা যাচ্ছে না:",
    includeIndexPage: "সূচিপত্র পৃষ্ঠা অন্তর্ভুক্ত করুন (বোনাস সুবিধা)",
    includeCoverPage: "অফিসিয়াল কভার পেজ অন্তর্ভুক্ত করুন (রুল ৬.১)",
    stampSealBtn: "পিএনজি সিল / ডিজিটাল স্বাক্ষর (বোনাস)",
    aiAssistantBtn: "এআই সহকারী (BYOK)",
    
    // Seal Modal
    sealModalTitle: "ডিজিটাল সিল / স্বাক্ষর স্ট্যাম্পার",
    sealModalDesc: "চূড়ান্ত প্যাকেজের পৃষ্ঠাগুলোতে ব্যবহারের জন্য কোম্পানির অফিসিয়াল সিল বা স্বাক্ষর (PNG) যুক্ত করুন।",
    uploadSealPng: "পিএনজি সিল / স্বাক্ষর নির্বাচন করুন",
    sealTarget: "সিল প্রয়োগের ক্ষেত্র:",
    sealAllPages: "সকল পৃষ্ঠায়",
    sealFirstAndLast: "প্রথম ও শেষ পৃষ্ঠায়",
    sealCoverOnly: "শুধুমাত্র কভার পেজে",
    sealPosition: "অবস্থান:",
    sealBottomRight: "নিচে ডানে (ফুটারের উপরে)",
    sealBottomLeft: "নিচে বামে (ফুটারের উপরে)",
    sealClose: "সংরক্ষণ ও বন্ধ করুন",
    sealRemove: "সিল মুছুন",
    
    // AI Modal
    aiModalTitle: "এআই নথি সহকারী (BYOK)",
    aiModalDesc: "ক্লায়েন্ট-সাইড এআই। স্ক্যান করা ফাইলের তথ্য ও তারিখ বের করতে আপনার জেমিনি বা ওপেনএআই এপিআই কি দিন। আপনার কি কেবল ব্রাউজারেই থাকবে, কোনো সার্ভারে যাবে না।",
    aiProvider: "এআই প্রোভাইডার",
    aiApiKey: "এপিআই কি (API Key)",
    aiAnalyzeBtn: "সংযুক্ত নথি বিশ্লেষণ করুন",
    aiClose: "বন্ধ করুন",
    
    // Instructions / Guide
    rulesGuideTitle: "প্রতিযোগিতার নিয়মাবলি ও চেকলিস্ট",
    rule1Text: "কঠোর ১-থেকে-১ ম্যাচিং: একটি নথিতে সর্বোচ্চ একটি ফাইল, এবং একটি ফাইল সর্বোচ্চ একটি নথিতে যুক্ত হবে।",
    rule2Text: "মেয়াদোত্তীর্ণ নথি (মেয়াদ < শেষ তারিখ) প্যাকেজ তৈরি আটকে দেবে।",
    rule3Text: "শেষ তারিখের সমদিনের মেয়াদ (মেয়াদ == শেষ তারিখ) সম্পূর্ণ বৈধ (OK)।",
    rule4Text: "হুবহু ডুপ্লিকেট ফাইল SHA-256 দ্বারা শনাক্ত হবে এবং ভিন্ন নথিতে ব্যবহার করা যাবে না।",
    rule5Text: "প্রতিটি পৃষ্ঠায় সার্বজনীন ফুটার: '<tender_id> | Page X of Y'।",
    
    // Footer
    systemInfo: "এআই ডেভফেস্ট ২০২৬ প্রতিযোগী সাবমিশন | ১০০% ব্রাউজার ক্লায়েন্ট-সাইড ইঞ্জিন | কোনো গোপন কি বা ব্যাকএন্ড নেই",
  }
};
