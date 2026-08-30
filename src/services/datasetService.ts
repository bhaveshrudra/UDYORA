import {
  BusinessCategory,
  CanonicalDatasetRecord,
  DatasetConflictRecord,
  DatasetSourceType,
  DatasetSummary,
  IngestionResult,
  LocationMatchStatus,
  NormalizationIssue,
  RawApplicantRecord,
  RawEntrepreneurRecord,
  RawLoanRecord,
  ValidationStatus
} from '../types/datasetTypes';
import { UserBusinessInput } from '../types';
import { SupportedLanguage } from '../i18n/types';
import { OFFICIAL_LGD_DISTRICTS, OFFICIAL_LGD_STATES } from '../data/lgdHierarchy';

// Default bundled CSV datasets
import {
  APPLICANTS_CSV_RAW as applicantsCsvRaw,
  ENTREPRENEUR_CSV_RAW as entrepreneurCsvRaw,
  LOAN_CSV_RAW as loanCsvRaw
} from '../data/datasets/csvData';

/* =========================================================================
   1. RFC 4180 COMPLIANT CSV PARSER
   ========================================================================= */

export function parseCsvRows(csvContent: string): string[][] {
  if (!csvContent || typeof csvContent !== 'string') return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const content = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '\\' && inQuotes && nextChar === '"') {
      currentField += '"';
      i++;
    } else if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function parseCsvToObjects<T>(csvContent: string): T[] {
  const rows = parseCsvRows(csvContent);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, '_').trim());
  const objects: T[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: any = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] !== undefined ? row[idx] : '';
    });
    objects.push(obj as T);
  }

  return objects;
}

/* =========================================================================
   2. PII MASKING UTILITY
   ========================================================================= */

export function maskPersonName(name?: string): string {
  if (!name || typeof name !== 'string') return 'Applicant';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => {
      if (p.length <= 1) return p;
      return p[0] + '*'.repeat(Math.min(4, p.length - 1));
    })
    .join(' ');
}

/* =========================================================================
   3. CAPITAL & CURRENCY NORMALIZATION
   ========================================================================= */

export function normalizeCurrency(raw: any): { value: number | null; issue?: NormalizationIssue } {
  if (raw === undefined || raw === null || raw === '') {
    return { value: null };
  }

  if (typeof raw === 'number') {
    if (isNaN(raw)) {
      return {
        value: null,
        issue: {
          field: 'currency',
          code: 'MALFORMED_NUMBER',
          message: 'Malformed numeric currency amount.',
          rawValue: raw,
          severity: 'ERROR'
        }
      };
    }
    if (raw < 0) {
      return {
        value: null,
        issue: {
          field: 'currency',
          code: 'NEGATIVE_VALUE',
          message: 'Currency amount cannot be negative.',
          rawValue: raw,
          severity: 'ERROR'
        }
      };
    }
    return { value: Math.round(raw) };
  }

  const str = String(raw).trim().toLowerCase();

  if (str.startsWith('-')) {
    return {
      value: null,
      issue: {
        field: 'currency',
        code: 'NEGATIVE_VALUE',
        message: 'Currency amount cannot be negative.',
        rawValue: raw,
        severity: 'ERROR'
      }
    };
  }

  const cleaned = str.replace(/[₹,]/g, '').trim();

  const lakhMatch = cleaned.match(/^([0-9.]+)\s*(lakh|lakhs|l)$/i);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1]);
    if (!isNaN(num) && num >= 0) {
      return { value: Math.round(num * 100000) };
    }
  }

  const kMatch = cleaned.match(/^([0-9.]+)\s*(k|thousand)$/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1]);
    if (!isNaN(num) && num >= 0) {
      return { value: Math.round(num * 1000) };
    }
  }

  const plainNum = parseFloat(cleaned);
  if (!isNaN(plainNum)) {
    if (plainNum < 0) {
      return {
        value: null,
        issue: {
          field: 'currency',
          code: 'NEGATIVE_VALUE',
          message: 'Currency amount cannot be negative.',
          rawValue: raw,
          severity: 'ERROR'
        }
      };
    }
    return { value: Math.round(plainNum) };
  }

  return {
    value: null,
    issue: {
      field: 'currency',
      code: 'MALFORMED_NUMBER',
      message: `Unable to parse currency amount: ${raw}`,
      rawValue: raw,
      severity: 'ERROR'
    }
  };
}

/* =========================================================================
   4. BUSINESS CATEGORY TAXONOMY NORMALIZATION
   ========================================================================= */

export function normalizeBusinessCategory(raw?: string): {
  category: BusinessCategory;
  raw: string;
  issue?: NormalizationIssue;
} {
  const rawStr = (raw || '').trim();
  const lower = rawStr.toLowerCase();

  if (!lower) {
    return {
      category: 'custom',
      raw: rawStr,
      issue: {
        field: 'businessCategory',
        code: 'MISSING_REQUIRED_FIELD',
        message: 'Business category is empty; defaulted to custom.',
        rawValue: raw,
        severity: 'WARNING'
      }
    };
  }

  if (lower.includes('dairy') || lower.includes('milk') || lower.includes('cow') || lower.includes('buffalo')) {
    return { category: 'dairy', raw: rawStr };
  }
  if (lower.includes('tailor') || lower.includes('garment') || lower.includes('boutique') || lower.includes('embroid') || lower.includes('apparel')) {
    return { category: 'tailoring', raw: rawStr };
  }
  if (lower.includes('kirana') || lower.includes('retail') || lower.includes('grocery') || lower.includes('fmcg') || lower.includes('shop') || lower.includes('store')) {
    return { category: 'retail', raw: rawStr };
  }
  if (lower.includes('poultry') || lower.includes('chicken') || lower.includes('egg') || lower.includes('layer') || lower.includes('broiler')) {
    return { category: 'poultry', raw: rawStr };
  }
  if (lower.includes('food') || lower.includes('flour') || lower.includes('oil') || lower.includes('bakery') || lower.includes('processing') || lower.includes('spice')) {
    return { category: 'food_processing', raw: rawStr };
  }
  if (lower.includes('service') || lower.includes('repair') || lower.includes('mechanic') || lower.includes('salon') || lower.includes('electric')) {
    return { category: 'services', raw: rawStr };
  }
  if (lower.includes('manufactur') || lower.includes('fabricat') || lower.includes('production') || lower.includes('jute') || lower.includes('plastic')) {
    return { category: 'manufacturing', raw: rawStr };
  }

  return {
    category: 'custom',
    raw: rawStr,
    issue: {
      field: 'businessCategory',
      code: 'UNMAPPED_CATEGORY',
      message: `Business category "${rawStr}" unmapped in canonical taxonomy; assigned to custom.`,
      rawValue: raw,
      severity: 'WARNING'
    }
  };
}

/* =========================================================================
   5. LANGUAGE PREFERENCE NORMALIZATION
   ========================================================================= */

export function normalizeLanguagePreference(raw?: string): {
  language: SupportedLanguage;
  raw: string;
  isSupported: boolean;
  issue?: NormalizationIssue;
} {
  const rawStr = (raw || '').trim();
  const lower = rawStr.toLowerCase();

  if (lower === 'en' || lower === 'english' || lower === 'eng') {
    return { language: 'en', raw: rawStr, isSupported: true };
  }
  if (lower === 'hi' || lower === 'hindi' || lower === 'hin') {
    return { language: 'hi', raw: rawStr, isSupported: true };
  }
  if (lower === 'mr' || lower === 'marathi' || lower === 'mar') {
    return { language: 'mr', raw: rawStr, isSupported: true };
  }
  if (lower === 'te' || lower === 'telugu' || lower === 'tel') {
    return { language: 'te', raw: rawStr, isSupported: true };
  }
  if (lower === 'kn' || lower === 'kannada' || lower === 'kan') {
    return { language: 'kn', raw: rawStr, isSupported: true };
  }

  return {
    language: 'en',
    raw: rawStr,
    isSupported: false,
    issue: {
      field: 'preferredLanguage',
      code: 'UNSUPPORTED_LANGUAGE',
      message: `Dataset language "${rawStr || 'None'}" is not supported by UDYORA (en, hi, mr, te, kn). Fallback to en.`,
      rawValue: raw,
      severity: 'WARNING'
    }
  };
}

/* =========================================================================
   6. LOCATION HIERARCHY MATCHING (AGAINST LGD)
   ========================================================================= */

export function matchLocationWithLgd(
  stateRaw?: string,
  districtRaw?: string
): {
  state?: string;
  district?: string;
  lgdStateCode?: number;
  lgdDistrictCode?: number;
  status: LocationMatchStatus;
  issue?: NormalizationIssue;
} {
  const sStr = (stateRaw || '').trim().toLowerCase();
  const dStr = (districtRaw || '').trim().toLowerCase();

  if (!sStr && !dStr) {
    return {
      status: 'REQUIRES_VERIFICATION',
      issue: {
        field: 'location',
        code: 'MISSING_REQUIRED_FIELD',
        message: 'State and district are both missing.',
        severity: 'WARNING'
      }
    };
  }

  const matchedState = OFFICIAL_LGD_STATES.find(
    (s) =>
      s.name.toLowerCase() === sStr ||
      (s.nameMap && s.nameMap.en && s.nameMap.en.toLowerCase() === sStr)
  );

  if (!matchedState) {
    return {
      state: stateRaw,
      district: districtRaw,
      status: 'REQUIRES_VERIFICATION',
      issue: {
        field: 'state',
        code: 'UNMATCHED_LOCATION',
        message: `State "${stateRaw}" does not match LGD state gazette.`,
        rawValue: stateRaw,
        severity: 'WARNING'
      }
    };
  }

  const matchedDistrict = OFFICIAL_LGD_DISTRICTS.find(
    (d) =>
      d.stateCode === matchedState.lgdCode &&
      (d.name.toLowerCase() === dStr || d.name.toLowerCase().includes(dStr) || dStr.includes(d.name.toLowerCase()))
  );

  if (!matchedDistrict) {
    return {
      state: matchedState.name,
      district: districtRaw,
      lgdStateCode: matchedState.lgdCode,
      status: 'REQUIRES_VERIFICATION',
      issue: {
        field: 'district',
        code: 'UNMATCHED_LOCATION',
        message: `District "${districtRaw}" not verified under ${matchedState.name} in LGD.`,
        rawValue: districtRaw,
        severity: 'WARNING'
      }
    };
  }

  return {
    state: matchedState.name,
    district: matchedDistrict.name,
    lgdStateCode: matchedState.lgdCode,
    lgdDistrictCode: matchedDistrict.lgdCode,
    status: 'EXACT'
  };
}

/* =========================================================================
   7. AGE VALIDATION
   ========================================================================= */

export function normalizeAge(raw?: any): { age?: number; issue?: NormalizationIssue } {
  if (raw === undefined || raw === null || raw === '') {
    return {};
  }

  const num = typeof raw === 'number' ? raw : parseInt(String(raw).trim(), 10);
  if (isNaN(num)) {
    return {
      issue: {
        field: 'age',
        code: 'MALFORMED_NUMBER',
        message: `Invalid age value "${raw}".`,
        rawValue: raw,
        severity: 'ERROR'
      }
    };
  }

  if (num < 18 || num > 100) {
    return {
      age: num,
      issue: {
        field: 'age',
        code: 'INVALID_AGE',
        message: `Applicant age ${num} is outside normal working range (18-100).`,
        rawValue: raw,
        severity: 'ERROR'
      }
    };
  }

  return { age: num };
}

/* =========================================================================
   8. DATASET INGESTION ADAPTERS
   ========================================================================= */

export function normalizeApplicantDataset(
  csvContent: string = applicantsCsvRaw,
  datasetName: string = 'applicants_eligibility.csv'
): IngestionResult<CanonicalDatasetRecord> {
  const rawRows = parseCsvToObjects<RawApplicantRecord>(csvContent);
  const records: CanonicalDatasetRecord[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Map<string, string>();
  const importedAt = new Date().toISOString();

  const categoryCount: Record<string, number> = {};
  const languageCount: Record<string, number> = {};
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let warningCount = 0;
  let exactLocationCount = 0;

  rawRows.forEach((row, idx) => {
    const issues: NormalizationIssue[] = [];
    const sourceRecordId = row.applicant_id || `APP-UNKNOWN-${idx + 1}`;

    let isDuplicate = false;
    let duplicateOfId: string | undefined;
    if (seenIds.has(sourceRecordId)) {
      isDuplicate = true;
      duplicateCount++;
      issues.push({
        field: 'applicant_id',
        code: 'DUPLICATE_ID',
        message: `Duplicate applicant ID "${sourceRecordId}".`,
        rawValue: sourceRecordId,
        severity: 'WARNING'
      });
    } else {
      seenIds.add(sourceRecordId);
    }

    if (row.full_name && seenNames.has(row.full_name.toLowerCase())) {
      isDuplicate = true;
      duplicateOfId = seenNames.get(row.full_name.toLowerCase());
    } else if (row.full_name) {
      seenNames.set(row.full_name.toLowerCase(), sourceRecordId);
    }

    const ageRes = normalizeAge(row.age);
    if (ageRes.issue) issues.push(ageRes.issue);

    const locRes = matchLocationWithLgd(row.state, row.district);
    if (locRes.issue) issues.push(locRes.issue);
    if (locRes.status === 'EXACT') exactLocationCount++;

    const incomeRes = normalizeCurrency(row.annual_family_income);
    if (incomeRes.issue) issues.push(incomeRes.issue);

    const costRes = normalizeCurrency(row.estimated_project_cost);
    if (costRes.issue) issues.push(costRes.issue);

    const gLower = (row.gender || '').toLowerCase();
    const gender = gLower === 'female' ? 'female' : gLower === 'male' ? 'male' : 'other';

    const hasError = issues.some((i) => i.severity === 'ERROR');
    const hasWarning = issues.some((i) => i.severity === 'WARNING');
    const validationStatus: ValidationStatus = hasError ? 'INVALID' : hasWarning ? 'WARNING' : 'VALID';

    if (validationStatus === 'VALID') validCount++;
    else if (validationStatus === 'INVALID') invalidCount++;
    else warningCount++;

    const canonical: CanonicalDatasetRecord = {
      id: `canon_app_${sourceRecordId}`,
      sourceDataset: datasetName,
      sourceRecordId,
      datasetType: 'APPLICANT',
      dataQuality: 'DEMO',
      importedAt,
      name: row.full_name,
      maskedName: maskPersonName(row.full_name),
      gender,
      age: ageRes.age,
      educationStatus: row.education_level,
      socialCategory: row.social_category,
      specialCategory: row.special_category,
      state: locRes.state,
      district: locRes.district,
      lgdStateCode: locRes.lgdStateCode,
      lgdDistrictCode: locRes.lgdDistrictCode,
      locationMatchStatus: locRes.status,
      annualFamilyIncome: incomeRes.value || undefined,
      estimatedProjectCost: costRes.value || undefined,
      businessCategory: 'custom',
      preferredLanguage: 'en',
      isLanguageSupported: true,
      validationStatus,
      validationIssues: issues,
      isDuplicate,
      duplicateOfId
    };

    records.push(canonical);
  });

  const summary: DatasetSummary = {
    datasetName,
    datasetType: 'APPLICANT',
    totalRecords: records.length,
    validRecords: validCount,
    invalidRecords: invalidCount,
    duplicateRecords: duplicateCount,
    warningRecords: warningCount,
    categoryBreakdown: categoryCount,
    languageBreakdown: languageCount,
    locationMatchRate: records.length > 0 ? Math.round((exactLocationCount / records.length) * 100) : 0,
    dataQuality: 'DEMO',
    importedAt
  };

  return {
    datasetName,
    datasetType: 'APPLICANT',
    records,
    summary,
    rawCount: rawRows.length
  };
}

export function normalizeEntrepreneurDataset(
  csvContent: string = entrepreneurCsvRaw,
  datasetName: string = 'entrepreneur_profiles.csv'
): IngestionResult<CanonicalDatasetRecord> {
  const rawRows = parseCsvToObjects<RawEntrepreneurRecord>(csvContent);
  const records: CanonicalDatasetRecord[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Map<string, string>();
  const importedAt = new Date().toISOString();

  const categoryCount: Record<string, number> = {};
  const languageCount: Record<string, number> = {};
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let warningCount = 0;
  let exactLocationCount = 0;

  rawRows.forEach((row, idx) => {
    const issues: NormalizationIssue[] = [];
    const sourceRecordId = row.entrepreneur_id || `ENT-UNKNOWN-${idx + 1}`;

    let isDuplicate = false;
    let duplicateOfId: string | undefined;
    if (seenIds.has(sourceRecordId)) {
      isDuplicate = true;
      duplicateCount++;
      issues.push({
        field: 'entrepreneur_id',
        code: 'DUPLICATE_ID',
        message: `Duplicate entrepreneur ID "${sourceRecordId}".`,
        rawValue: sourceRecordId,
        severity: 'WARNING'
      });
    } else {
      seenIds.add(sourceRecordId);
    }

    if (row.name && seenNames.has(row.name.toLowerCase())) {
      isDuplicate = true;
      duplicateOfId = seenNames.get(row.name.toLowerCase());
    } else if (row.name) {
      seenNames.set(row.name.toLowerCase(), sourceRecordId);
    }

    const ageRes = normalizeAge(row.age);
    if (ageRes.issue) issues.push(ageRes.issue);

    const locRes = matchLocationWithLgd(row.state, row.district);
    if (locRes.issue) issues.push(locRes.issue);
    if (locRes.status === 'EXACT') exactLocationCount++;

    const capRes = normalizeCurrency(row.available_own_capital);
    if (capRes.issue) issues.push(capRes.issue);

    const catRes = normalizeBusinessCategory(row.business_category || row.business_idea);
    if (catRes.issue) issues.push(catRes.issue);
    categoryCount[catRes.category] = (categoryCount[catRes.category] || 0) + 1;

    const langRes = normalizeLanguagePreference(row.preferred_language);
    if (langRes.issue) issues.push(langRes.issue);
    languageCount[langRes.language] = (languageCount[langRes.language] || 0) + 1;

    const expNum = parseInt(String(row.years_of_experience || '0'), 10);
    const yearsOfExperience = isNaN(expNum) || expNum < 0 ? 0 : expNum;

    const gLower = (row.gender || '').toLowerCase();
    const gender = gLower === 'female' ? 'female' : gLower === 'male' ? 'male' : 'other';

    const hasError = issues.some((i) => i.severity === 'ERROR');
    const hasWarning = issues.some((i) => i.severity === 'WARNING');
    const validationStatus: ValidationStatus = hasError ? 'INVALID' : hasWarning ? 'WARNING' : 'VALID';

    if (validationStatus === 'VALID') validCount++;
    else if (validationStatus === 'INVALID') invalidCount++;
    else warningCount++;

    const canonical: CanonicalDatasetRecord = {
      id: `canon_ent_${sourceRecordId}`,
      sourceDataset: datasetName,
      sourceRecordId,
      datasetType: 'ENTREPRENEUR',
      dataQuality: 'DEMO',
      importedAt,
      name: row.name,
      maskedName: maskPersonName(row.name),
      gender,
      age: ageRes.age,
      state: locRes.state,
      district: locRes.district,
      locationType: (row.location_type?.toLowerCase() as any) || 'rural',
      lgdStateCode: locRes.lgdStateCode,
      lgdDistrictCode: locRes.lgdDistrictCode,
      locationMatchStatus: locRes.status,
      businessIdea: row.business_idea,
      businessCategory: catRes.category,
      rawBusinessCategory: catRes.raw,
      availableOwnCapital: capRes.value || undefined,
      yearsOfExperience,
      preferredLanguage: langRes.language,
      rawLanguage: langRes.raw,
      isLanguageSupported: langRes.isSupported,
      validationStatus,
      validationIssues: issues,
      isDuplicate,
      duplicateOfId
    };

    records.push(canonical);
  });

  const summary: DatasetSummary = {
    datasetName,
    datasetType: 'ENTREPRENEUR',
    totalRecords: records.length,
    validRecords: validCount,
    invalidRecords: invalidCount,
    duplicateRecords: duplicateCount,
    warningRecords: warningCount,
    categoryBreakdown: categoryCount,
    languageBreakdown: languageCount,
    locationMatchRate: records.length > 0 ? Math.round((exactLocationCount / records.length) * 100) : 0,
    dataQuality: 'DEMO',
    importedAt
  };

  return {
    datasetName,
    datasetType: 'ENTREPRENEUR',
    records,
    summary,
    rawCount: rawRows.length
  };
}

export function normalizeLoanDataset(
  csvContent: string = loanCsvRaw,
  datasetName: string = 'loan_applications.csv'
): IngestionResult<CanonicalDatasetRecord> {
  const rawRows = parseCsvToObjects<RawLoanRecord>(csvContent);
  const records: CanonicalDatasetRecord[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Map<string, string>();
  const importedAt = new Date().toISOString();

  const categoryCount: Record<string, number> = {};
  const languageCount: Record<string, number> = {};
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let warningCount = 0;
  let exactLocationCount = 0;

  rawRows.forEach((row, idx) => {
    const issues: NormalizationIssue[] = [];
    const sourceRecordId = row.application_id || `LOAN-UNKNOWN-${idx + 1}`;

    let isDuplicate = false;
    let duplicateOfId: string | undefined;
    if (seenIds.has(sourceRecordId)) {
      isDuplicate = true;
      duplicateCount++;
      issues.push({
        field: 'application_id',
        code: 'DUPLICATE_ID',
        message: `Duplicate loan application ID "${sourceRecordId}".`,
        rawValue: sourceRecordId,
        severity: 'WARNING'
      });
    } else {
      seenIds.add(sourceRecordId);
    }

    if (row.applicant_name && seenNames.has(row.applicant_name.toLowerCase())) {
      isDuplicate = true;
      duplicateOfId = seenNames.get(row.applicant_name.toLowerCase());
    } else if (row.applicant_name) {
      seenNames.set(row.applicant_name.toLowerCase(), sourceRecordId);
    }

    const locRes = matchLocationWithLgd(row.state, row.district);
    if (locRes.issue) issues.push(locRes.issue);
    if (locRes.status === 'EXACT') exactLocationCount++;

    const incRes = normalizeCurrency(row.annual_income);
    if (incRes.issue) issues.push(incRes.issue);

    const costRes = normalizeCurrency(row.estimated_project_cost);
    if (costRes.issue) issues.push(costRes.issue);

    const loanRes = normalizeCurrency(row.requested_loan_amount);
    if (loanRes.issue) issues.push(loanRes.issue);

    const catRes = normalizeBusinessCategory(row.project_type);
    if (catRes.issue) issues.push(catRes.issue);
    categoryCount[catRes.category] = (categoryCount[catRes.category] || 0) + 1;

    const langRes = normalizeLanguagePreference(row.preferred_language);
    if (langRes.issue) issues.push(langRes.issue);
    languageCount[langRes.language] = (languageCount[langRes.language] || 0) + 1;

    const bRaw = (row.bank_account_status || '').trim().toUpperCase();
    const bankAccountStatus =
      bRaw === 'ACTIVE' ? 'ACTIVE' : bRaw === 'INACTIVE' ? 'INACTIVE' : bRaw === 'NONE' ? 'NONE' : 'UNKNOWN';

    const hasError = issues.some((i) => i.severity === 'ERROR');
    const hasWarning = issues.some((i) => i.severity === 'WARNING');
    const validationStatus: ValidationStatus = hasError ? 'INVALID' : hasWarning ? 'WARNING' : 'VALID';

    if (validationStatus === 'VALID') validCount++;
    else if (validationStatus === 'INVALID') invalidCount++;
    else warningCount++;

    const canonical: CanonicalDatasetRecord = {
      id: `canon_loan_${sourceRecordId}`,
      sourceDataset: datasetName,
      sourceRecordId,
      datasetType: 'LOAN',
      dataQuality: 'DEMO',
      importedAt,
      name: row.applicant_name,
      maskedName: maskPersonName(row.applicant_name),
      state: locRes.state,
      district: locRes.district,
      lgdStateCode: locRes.lgdStateCode,
      lgdDistrictCode: locRes.lgdDistrictCode,
      locationMatchStatus: locRes.status,
      annualFamilyIncome: incRes.value || undefined,
      estimatedProjectCost: costRes.value || undefined,
      requestedLoanAmount: loanRes.value || undefined,
      educationStatus: row.education_status,
      businessCategory: catRes.category,
      rawBusinessCategory: catRes.raw,
      bankAccountStatus,
      rawBankAccountStatus: row.bank_account_status,
      preferredLanguage: langRes.language,
      rawLanguage: langRes.raw,
      isLanguageSupported: langRes.isSupported,
      validationStatus,
      validationIssues: issues,
      isDuplicate,
      duplicateOfId
    };

    records.push(canonical);
  });

  const summary: DatasetSummary = {
    datasetName,
    datasetType: 'LOAN',
    totalRecords: records.length,
    validRecords: validCount,
    invalidRecords: invalidCount,
    duplicateRecords: duplicateCount,
    warningRecords: warningCount,
    categoryBreakdown: categoryCount,
    languageBreakdown: languageCount,
    locationMatchRate: records.length > 0 ? Math.round((exactLocationCount / records.length) * 100) : 0,
    dataQuality: 'DEMO',
    importedAt
  };

  return {
    datasetName,
    datasetType: 'LOAN',
    records,
    summary,
    rawCount: rawRows.length
  };
}

/* =========================================================================
   9. CROSS-DATASET CONFLICT RESOLUTION
   ========================================================================= */

export function detectDatasetConflicts(
  applicantResult: IngestionResult<CanonicalDatasetRecord>,
  loanResult: IngestionResult<CanonicalDatasetRecord>
): DatasetConflictRecord[] {
  const conflicts: DatasetConflictRecord[] = [];

  const appMap = new Map<string, CanonicalDatasetRecord>();
  applicantResult.records.forEach((r) => {
    if (r.name) {
      appMap.set(r.name.toLowerCase(), r);
    }
  });

  loanResult.records.forEach((l) => {
    if (!l.name) return;
    const matchedApp = appMap.get(l.name.toLowerCase());
    if (matchedApp) {
      if (
        matchedApp.estimatedProjectCost &&
        l.estimatedProjectCost &&
        matchedApp.estimatedProjectCost !== l.estimatedProjectCost
      ) {
        conflicts.push({
          entityId: matchedApp.name || matchedApp.id,
          fieldName: 'estimatedProjectCost',
          datasetAValue: matchedApp.estimatedProjectCost,
          datasetCValue: l.estimatedProjectCost,
          discrepancyDescription: `Project cost discrepancy for "${matchedApp.name}": Dataset A has ₹${matchedApp.estimatedProjectCost.toLocaleString('en-IN')}, while Dataset C has ₹${l.estimatedProjectCost.toLocaleString('en-IN')}.`,
          resolvedAuthoritativeField: 'Financial Calculator is Authoritative'
        });
      }

      if (
        matchedApp.annualFamilyIncome &&
        l.annualFamilyIncome &&
        matchedApp.annualFamilyIncome !== l.annualFamilyIncome
      ) {
        conflicts.push({
          entityId: matchedApp.name || matchedApp.id,
          fieldName: 'annualFamilyIncome',
          datasetAValue: matchedApp.annualFamilyIncome,
          datasetCValue: l.annualFamilyIncome,
          discrepancyDescription: `Annual income discrepancy for "${matchedApp.name}": Dataset A has ₹${matchedApp.annualFamilyIncome.toLocaleString('en-IN')}, while Dataset C has ₹${l.annualFamilyIncome.toLocaleString('en-IN')}.`,
          resolvedAuthoritativeField: 'Scheme Rule Engine is Authoritative'
        });
      }
    }
  });

  return conflicts;
}

/* =========================================================================
   10. CANONICAL BRIDGE TO USER BUSINESS INPUT
   ========================================================================= */

export function convertDatasetRecordToUserInput(
  record: CanonicalDatasetRecord
): Partial<UserBusinessInput> {
  return {
    locationId: record.district ? `loc_${record.district.toLowerCase().replace(/\s+/g, '_')}` : 'loc_khed_shivapur_pune',
    customLocationText: record.district ? `${record.district}, ${record.state || ''}`.trim() : 'Khed Shivapur, Maharashtra',
    businessCategoryId: record.businessCategory || 'dairy',
    businessIdea: record.businessIdea || `Enterprise in ${record.businessCategory}`,
    availableCapital:
      record.availableOwnCapital ||
      (record.estimatedProjectCost ? Math.round(record.estimatedProjectCost * 0.1) : 100000),
    language: record.preferredLanguage || 'en',
    experienceYears: record.yearsOfExperience || 3,
    beneficiaryCategory: record.socialCategory || (record.specialCategory?.includes('Women') ? 'Women' : 'General'),
    locationAreaType: record.locationType === 'urban' ? 'Urban' : record.locationType === 'semi-urban' ? 'Semi-Urban' : 'Rural'
  };
}

/* =========================================================================
   11. SINGLE ENTRY BUNDLED LOADER
   ========================================================================= */

export function getIngestedDatasets() {
  const applicantResult = normalizeApplicantDataset();
  const entrepreneurResult = normalizeEntrepreneurDataset();
  const loanResult = normalizeLoanDataset();
  const conflicts = detectDatasetConflicts(applicantResult, loanResult);

  return {
    applicant: applicantResult,
    entrepreneur: entrepreneurResult,
    loan: loanResult,
    allRecords: [...applicantResult.records, ...entrepreneurResult.records, ...loanResult.records],
    conflicts
  };
}
