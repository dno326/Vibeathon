import { useState, useEffect } from 'react';

export const useDeck = (deckId: string) => {
  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement deck data fetching
    setLoading(false);
  }, [deckId]);

  return { deck, loading, error };
};

