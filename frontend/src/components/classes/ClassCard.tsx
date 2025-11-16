import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Class } from '../../types/classes';
import { formatDate } from '../../utils/formatDate';
import { studyApi } from '../../lib/studyApi';
import { useEffect, useState } from 'react';

interface ClassCardProps {
  classData: Class & { user_role?: string };
}

const ClassCard: React.FC<ClassCardProps> = ({ classData }) => {
  const navigate = useNavigate();
  const [looking, setLooking] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await studyApi.getStatus(classData.id);
        if (mounted) setLooking(!!res.looking);
      } catch {
        // ignore silently
      }
    };
    load();
    return () => { mounted = false; };
  }, [classData.id]);

  const handleClick = () => {
    navigate(`/class/${classData.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-card hover:shadow-float transition-all duration-250 ease-out-soft p-6 cursor-pointer border border-white/60 hover:border-primary-300 group"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
            {classData.name}
          </h3>
          {looking && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
              Looking for group
            </span>
          )}
        </div>
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            looking ? 'bg-primary-700 text-white' : 'bg-white border border-gray-300 text-gray-800'
          }`}
          onClick={async (e) => {
            e.stopPropagation();
            const next = !looking;
            setLoading(true);
            try {
              const res = await studyApi.setStatus(classData.id, next);
              setLooking(!!res.looking);
            } catch {
              // keep previous state on error
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          title={looking ? 'Turn off “looking”' : 'Set as “looking”'}
          aria-pressed={looking}
        >
          {looking ? 'Turn Off' : "I'm Looking"}
        </button>
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
