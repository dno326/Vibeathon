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
      className="bg-white rounded-2xl shadow-card hover:shadow-float transition-all duration-250 ease-out-soft p-6 cursor-pointer border border-white/60 hover:border-primary-300 group"
    >
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
          {classData.name}
        </h3>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-medium">Created:</span>
          <span>{formatDate(classData.created_at)}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center text-primary-600 font-semibold text-sm group-hover:text-primary-700">
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
