import React from 'react';

interface TagProps {
  label: string;
  onRemove?: () => void;
}

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    <span className="tag">
      {label}
      {onRemove && <button onClick={onRemove}>×</button>}
    </span>
  );
};

export default Tag;

