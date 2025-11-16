import React from 'react';

const Sidebar: React.FC = () => {
  return (
    // Design intent: Lightweight, breathable sidebar surface with subtle elevation
    <aside className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-20 rounded-2xl bg-white shadow-card border border-white/60 p-5 space-y-4">
        <div className="h-3 w-24 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 opacity-80" />
        <nav className="space-y-2">
          <a className="block px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200" href="/classes">Classes</a>
          <a className="block px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200" href="/notes">Notes</a>
          <a className="block px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200" href="/flashcards">Flashcards</a>
          <a className="block px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200" href="/profile">Profile</a>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;

