import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { flashcardsApi } from '../../lib/flashcardsApi';
import { classApi } from '../../lib/classApi';
import { useNavigate } from 'react-router-dom';

const UploadDeckModal: React.FC<{ isOpen: boolean; onClose: () => void; onCreated: () => void }>=({ isOpen, onClose, onCreated })=>{
  const [files, setFiles] = useState<File[]>([]);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [classes, setClasses] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(()=>{ if(isOpen){ classApi.getAllClasses().then(setClasses).catch(()=>{});} },[isOpen]);
  if(!isOpen) return null;
  const submit = async (e: React.FormEvent)=>{
    e.preventDefault();
    if(files.length===0 || !classId){ setError('Select files and class'); return; }
    try{ setLoading(true); setError(null); await flashcardsApi.createDeckFromPdfs(files, classId, isPublic, title); onCreated(); onClose(); }
    catch(e:any){ setError(e.response?.data?.error || 'Failed to create deck'); }
    finally{ setLoading(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={(e)=>e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Create Deck from PDFs</h2>
        <form onSubmit={submit} className="space-y-3">
          <input type="text" placeholder="Title (optional)" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg"/>
          <input type="file" accept="application/pdf" multiple onChange={(e)=> setFiles(Array.from(e.target.files || []))} className="w-full"/>
          <select value={classId} onChange={(e)=>setClassId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Select class…</option>
            {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2"><input type="checkbox" checked={isPublic} onChange={(e)=>setIsPublic(e.target.checked)} /> Public (visible to class)</label>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={loading || files.length===0 || !classId} className="px-3 py-2 bg-purple-600 text-white rounded-lg">{loading?'Creating…':'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeckCard: React.FC<{ deck: any }>=({ deck })=>{
  const navigate = useNavigate();
  return (
    <div role="button" onClick={()=>navigate(`/deck/${deck.id}`)} className="p-4 bg-white rounded-xl border shadow hover:shadow-md">
      <div className="text-base font-semibold text-gray-900">{deck.title}</div>
      <div className="text-sm text-gray-500 mt-1">{deck.cls?.name || 'Class'}</div>
    </div>
  );
};

const MyFlashcardsPage: React.FC = () => {
  const [decks, setDecks] = useState<Array<any>>([]);
  const [open, setOpen] = useState(false);
  useEffect(()=>{ flashcardsApi.listMyDecks().then(setDecks).catch(()=>{}); },[]);
  const refresh = async ()=>{ const d = await flashcardsApi.listMyDecks(); setDecks(d); };
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Flashcards</h1>
          <button onClick={()=>setOpen(true)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl">Create Deck</button>
        </div>
        {decks.length===0 ? (
          <div className="text-gray-500">No decks yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map(d => <DeckCard key={d.id} deck={d} />)}
          </div>
        )}
      </div>
      <UploadDeckModal isOpen={open} onClose={()=>setOpen(false)} onCreated={refresh} />
    </div>
  );
};

export default MyFlashcardsPage;
