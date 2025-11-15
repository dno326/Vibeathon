import { useState, useEffect } from 'react';

export const useSession = (sessionId: string) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement session data fetching
    setLoading(false);
  }, [sessionId]);

  return { session, loading, error };
};

