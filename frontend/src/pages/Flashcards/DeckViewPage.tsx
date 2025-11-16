import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { flashcardsApi } from '../../lib/flashcardsApi';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';

const MountainIcon: React.FC<{ filled?: boolean; className?: string }>=({ filled, className })=> (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 20h18l-6-9-3 4-2-3-7 8z" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const FlipCard: React.FC<{ q: string; a: string }>=({ q, a })=>{
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ perspective: 1000 }} className="w-full h-64" onClick={()=>setFlipped(f=>!f)}>
      <div style={{ position:'relative', width:'100%', height:'100%', transition:'transform 0.6s', transformStyle:'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
        <div style={{ position:'absolute', inset:0 as any, backfaceVisibility:'hidden' as any }} className="bg-white rounded-xl shadow p-6 flex items-center justify-center text-xl font-semibold text-gray-800">
          {q}
        </div>
        <div style={{ position:'absolute', inset:0 as any, backfaceVisibility:'hidden' as any, transform:'rotateY(180deg)' }} className="bg-white rounded-xl shadow p-6 flex items-center justify-center text-xl font-semibold text-gray-800">
          {a}
        </div>
      </div>
    </div>
  );
};

const DeckViewPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<any>(null);
  const [votes, setVotes] = useState<{ count: number; user_has_voted: boolean }|null>(null);
  const [comments, setComments] = useState<Array<any>>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true);
      try{
        const d = await flashcardsApi.getDeck(deckId!);
        setDeck(d);
        const [v, c] = await Promise.all([
          flashcardsApi.getVotes(deckId!),
          flashcardsApi.getComments(deckId!),
        ]);
        setVotes(v); setComments(c);
      } finally { setLoading(false); }
    };
    if(deckId) load();
  },[deckId]);

  const toggleVote = async ()=>{
    if(!deckId || !votes) return;
    const updated = votes.user_has_voted ? await flashcardsApi.removeVote(deckId) : await flashcardsApi.addVote(deckId);
    setVotes(updated);
  };

  const postComment = async ()=>{
    if(!deckId || !text.trim()) return;
    await flashcardsApi.addComment(deckId, text.trim());
    setText('');
    const c = await flashcardsApi.getComments(deckId);
    setComments(c);
  };

  const deleteComment = async (commentId: string)=>{
    if(!deckId) return;
    await flashcardsApi.deleteComment(deckId, commentId);
    const c = await flashcardsApi.getComments(deckId);
    setComments(c);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />
      {loading ? (<div className="p-4">Loading…</div>) : !deck ? null : (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              {deck.cls && (
                <button onClick={()=>navigate(`/class/${deck.cls.id}`)} className="mb-2 p-2 hover:bg-gray-100 rounded-lg" aria-label="Back to class">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="text-sm text-gray-500">
                {deck.cls ? <Link to={`/class/${deck.cls.id}`} className="hover:underline">{deck.cls.name}</Link> : 'Class'}
                {' · '}{formatDate(deck.created_at)}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{deck.title}</h1>
            </div>
            {votes && (
              <button onClick={toggleVote} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold border transition-colors ${votes.user_has_voted? 'bg-purple-600 text-white border-transparent':'bg-white text-purple-700 border-purple-600'}`}>
                <MountainIcon filled={votes.user_has_voted} className="h-4 w-4" /> {votes.count}
              </button>
            )}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deck.cards && deck.cards.length>0 ? deck.cards.map((c:any)=> (
              <FlipCard key={c.id} q={c.question} a={c.answer} />
            )) : <div className="text-gray-500">No cards in this deck.</div>}
          </div>

          {/* Comments */}
          <div className="mt-8 bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-3">Comments</h3>
            <div className="flex gap-2 mb-3">
              <input type="text" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Add a comment…" className="flex-1 px-3 py-2 border rounded-lg"/>
              <button onClick={postComment} disabled={!text.trim()} className="px-3 py-2 bg-purple-600 text-white rounded-lg">Post</button>
            </div>
            <div className="space-y-3">
              {comments.length===0 ? (<div className="text-sm text-gray-500">No comments yet.</div>) : comments.map((c)=> (
                <div key={c.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="text-sm text-gray-600 mb-1">
                    {c.author ? (user?.id===c.user_id ? <span>{c.author.first_name} {c.author.last_name}</span> : <Link to={`/user/${c.user_id}`} className="hover:underline">{c.author.first_name} {c.author.last_name}</Link>) : 'User'}
                    {' · '}{formatDate(c.created_at)}
                  </div>
                  <div className="text-gray-800 text-sm whitespace-pre-wrap">{c.text}</div>
                  {user?.id===c.user_id && (
                    <div className="mt-1">
                      <button onClick={()=>deleteComment(c.id)} className="text-xs text-red-600 font-semibold">Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckViewPage;
