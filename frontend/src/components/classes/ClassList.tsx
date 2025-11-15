import React from 'react';
import ClassCard from './ClassCard';
import { Class } from '../../types/classes';

interface ClassListProps {
  classes: (Class & { user_role?: string })[];
}

const ClassList: React.FC<ClassListProps> = ({ classes }) => {
  if (classes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classData) => (
        <ClassCard key={classData.id} classData={classData} />
      ))}
    </div>
  );
};

export default ClassList;
