import React from 'react';
import DeckCard from './DeckCard';

interface Deck {
  id: string;
  title: string;
  count: number;
}

interface DeckListProps {
  decks?: Deck[];
  onOpen?: (deckId: string) => void;
}

const DeckList: React.FC<DeckListProps> = ({ decks = [], onOpen }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((d) => (
        <DeckCard key={d.id} title={d.title} count={d.count} onClick={() => onOpen?.(d.id)} />
      ))}
    </div>
  );
};

export default DeckList;

