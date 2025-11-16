import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    // Design intent: Breathing room with consistent max width and padding
    <div className="page-container">
      {children}
    </div>
  );
};

export default PageContainer;

