import React, { createContext, useState, ReactNode } from 'react';

interface ClassContextType {
  currentClass: any | null;
  setCurrentClass: (classData: any) => void;
}

export const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassProviderProps {
  children: ReactNode;
}

export const ClassProvider: React.FC<ClassProviderProps> = ({ children }) => {
  const [currentClass, setCurrentClass] = useState<any | null>(null);

  return (
    <ClassContext.Provider value={{ currentClass, setCurrentClass }}>
      {children}
    </ClassContext.Provider>
  );
};

