import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CompleteAdvisoryReport } from '../types';

interface ReportContextType {
  report: CompleteAdvisoryReport | null;
  setReport: (report: CompleteAdvisoryReport | null) => void;
  clearReport: () => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [report, setReport] = useState<CompleteAdvisoryReport | null>(null);

  const clearReport = () => setReport(null);

  return (
    <ReportContext.Provider value={{ report, setReport, clearReport }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};
