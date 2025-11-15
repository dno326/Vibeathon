import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Class } from '../../types/classes';
import { formatDate } from '../../utils/formatDate';

interface ClassCardProps {
  classData: Class & { user_role?: string };
}

const ClassCard: React.FC<ClassCardProps> = ({ classData }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/class/${classData.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 cursor-pointer border border-gray-100 hover:border-purple-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
          {classData.name}
        </h3>
        {classData.user_role === 'owner' && (
          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-lg">
            Owner
          </span>
        )}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-medium">Code:</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-purple-600 font-semibold">
            {classData.code}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Created:</span>
          <span>{formatDate(classData.created_at)}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:text-purple-700">
          View Class
          <svg 
            className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
