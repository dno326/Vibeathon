import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { flashcardsApi } from '../../lib/flashcardsApi';
import { classApi } from '../../lib/classApi';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';

const MountainIcon: React.FC<{ className?: string }>=({ className })=> (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 20h18l-6-9-3 4-2-3-7 8z" />
  </svg>
);

const UploadDeckModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreated: () => void }>=({ isOpen, onClose, onCreated })=>{
  const [files, setFiles] = useState<File[]>([]);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [classes, setClasses] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(()=>{ if(isOpen){ classApi.getAllClasses().then(setClasses).catch(()=>{});} },[isOpen]);
  const submit = async (e: React.FormEvent)=>{
    e.preventDefault();
    if(files.length===0 || !classId){ setError('Select files and class'); return; }
    try{ setLoading(true); setError(null); await flashcardsApi.createDeckFromPdfs(files, classId, isPublic, title); onCreated(); onClose(); }
    catch(e:any){ setError(e.response?.data?.error || 'Failed to create deck'); }
    finally{ setLoading(false); }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Deck from PDFs">
      <form onSubmit={submit} className="space-y-4">
        <Input type="text" placeholder="Title (optional)" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <input type="file" accept="application/pdf" multiple onChange={(e)=> setFiles(Array.from(e.target.files || []))} className="w-full" />
        <select value={classId} onChange={(e)=>setClassId(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-soft focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all">
          <option value="">Select class…</option>
          {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isPublic} onChange={(e)=>setIsPublic(e.target.checked)} /> Public (visible to class)</label>
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading || files.length===0 || !classId}>{loading?'Creating…':'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
};

const DeckCard: React.FC<{ deck: any, count?: number }>=({ deck, count })=>{
  const navigate = useNavigate();
  return (
    <div role="button" onClick={()=>navigate(`/deck/${deck.id}`)} className="p-4 bg-white rounded-xl border shadow hover:shadow-md">
      <div className="text-base font-semibold text-gray-900">{deck.title}</div>
      <div className="text-sm text-gray-500 mt-1">{deck.cls?.name || 'Class'}</div>
      <div className="mt-2 inline-flex items-center gap-1 text-primary-700 text-sm">
        <MountainIcon className="h-4 w-4" /> {count ?? 0}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={async (e)=>{ e.stopPropagation(); try{ await flashcardsApi.deleteDeck(deck.id); window.location.reload(); } catch{} }}
          className="text-red-600 hover:text-red-700 text-sm font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const MyFlashcardsPage: React.FC = () => {
  const [decks, setDecks] = useState<Array<any>>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  useEffect(()=>{ flashcardsApi.listMyDecks().then(setDecks).catch(()=>{}); },[]);
  const refresh = async ()=>{ const d = await flashcardsApi.listMyDecks(); setDecks(d); };
  useEffect(()=>{
    let cancelled=false;
    const loadCounts=async()=>{
      try{
        const entries = await Promise.all((decks||[]).map(async(d)=>{ try{ const v=await flashcardsApi.getVotes(d.id); return [d.id, v.count] as const; } catch { return [d.id,0] as const; } }));
        if(!cancelled){ const obj:Record<string,number>={}; entries.forEach(([id,c])=>obj[id]=c); setVoteCounts(obj);} 
      }catch{}
    };
    if(decks.length>0) loadCounts();
    return ()=>{ cancelled=true; };
  },[decks]);
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Flashcards</h1>
          <Button onClick={()=>setOpen(true)}>Create Deck</Button>
        </div>
        {decks.length===0 ? (
          <EmptyState title="No decks yet" message="Create a new deck from PDFs to get started." actionLabel="Create Deck" onAction={()=>setOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(d => <DeckCard key={d.id} deck={d} count={voteCounts[d.id]} />)}
          </div>
        )}
      </PageContainer>
      <UploadDeckModal isOpen={open} onClose={()=>setOpen(false)} onCreated={refresh} />
    </div>
  );
};

export default MyFlashcardsPage;
