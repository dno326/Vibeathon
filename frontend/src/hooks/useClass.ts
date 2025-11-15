import { useState, useEffect } from 'react';

export const useClass = (classId: string) => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement class data fetching
    setLoading(false);
  }, [classId]);

  return { classData, loading, error };
};

