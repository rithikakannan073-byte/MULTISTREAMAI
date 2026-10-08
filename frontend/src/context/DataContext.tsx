import React, { createContext, useContext, useState, useEffect } from 'react';

type DataMode = 'demo' | 'real';

interface DataContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataMode, setDataModeState] = useState<DataMode>('demo');

  useEffect(() => {
    const saved = localStorage.getItem('multistream_data_mode') as DataMode;
    if (saved === 'demo' || saved === 'real') {
      setDataModeState(saved);
    }
  }, []);

  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    localStorage.setItem('multistream_data_mode', mode);
  };

  return (
    <DataContext.Provider value={{ dataMode, setDataMode }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataMode = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useDataMode must be used within DataProvider');
  return context;
};
