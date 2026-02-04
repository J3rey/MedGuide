import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ScanContextType {
  scannedDrug: string | null;
  setScannedDrug: (drug: string | null) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [scannedDrug, setScannedDrug] = useState<string | null>(null);

  return (
    <ScanContext.Provider value={{ scannedDrug, setScannedDrug }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within ScanProvider');
  }
  return context;
}
