import { LgdIngestionReport } from '../types/lgd';
import { LGD_INGESTION_REPORT } from '../data/lgdHierarchy';

/* =========================================================================
   LGD INGESTION & DATASET VALIDATION REPOSITORY
   ========================================================================= */

const LGD_INGESTION_STORAGE_KEY = 'udyora_lgd_ingestion_report';

export function getLgdIngestionStatus(): LgdIngestionReport {
  if (typeof window === 'undefined') return LGD_INGESTION_REPORT;
  try {
    const raw = localStorage.getItem(LGD_INGESTION_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LGD_INGESTION_STORAGE_KEY, JSON.stringify(LGD_INGESTION_REPORT));
      return LGD_INGESTION_REPORT;
    }
    return JSON.parse(raw) as LgdIngestionReport;
  } catch {
    return LGD_INGESTION_REPORT;
  }
}

export function triggerLgdDataRefresh(): LgdIngestionReport {
  const updatedReport: LgdIngestionReport = {
    ...LGD_INGESTION_REPORT,
    lastSynchronized: new Date().toISOString(),
    validationStatus: 'PASSED'
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LGD_INGESTION_STORAGE_KEY, JSON.stringify(updatedReport));
  }

  return updatedReport;
}
