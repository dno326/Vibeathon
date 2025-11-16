import React from 'react';

interface TagProps {
  label: string;
  onRemove?: () => void;
}

const Tag: React.FC<TagProps> = ({ label, onRemove }) => {
  return (
    // Design intent: Compact pill with subtle elevation and animated remove affordance
    <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 text-sm shadow-sm">
      <span className="font-medium">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="h-5 w-5 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:shadow transition-all duration-200"
          aria-label="Remove tag"
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Tag;

