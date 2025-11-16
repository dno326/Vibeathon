import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { notesApi } from '../../lib/notesApi';
import { formatDate } from '../../utils/formatDate';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../hooks/useAuth';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const MountainIcon: React.FC<{ filled?: boolean; className?: string }> = ({ filled, className }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M3 20h18l-6-9-3 4-2-3-7 8z" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

function buildThreads(list: any[]) {
  const byId: Record<string, any> = {};
  const roots: any[] = [];
  list.forEach(c => { byId[c.id] = { ...c, replies: [] }; });
  list.forEach(c => {
    const node = byId[c.id];
    if (c.parent_id && byId[c.parent_id]) {
      byId[c.parent_id].replies.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

const NoteViewPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const location = useLocation() as any;
  const backToFromState: string | undefined = location.state?.backTo;
  const [note, setNote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState<{ count: number; user_has_voted: boolean } | null>(null);
  const [comments, setComments] = useState<Array<any>>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const replyDraftRef = React.useRef<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await notesApi.getNote(noteId!);
        setNote(data);
        const [v, c] = await Promise.all([
          notesApi.getVotes(noteId!),
          notesApi.getComments(noteId!),
        ]);
        setVotes(v);
        setComments(c);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load note');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [noteId]);

  const backHref = backToFromState || (note?.cls?.id ? `/class/${note.cls.id}` : '/notes');
  const backText = backToFromState ? 'Back to My Notes' : (note?.cls?.name ? `Back to ${note.cls.name}` : 'Back to Notes');

  const toggleVote = async () => {
    if (!noteId || !votes) return;
    try {
      const updated = votes.user_has_voted
        ? await notesApi.removeVote(noteId)
        : await notesApi.addVote(noteId);
      setVotes(updated);
    } catch {}
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteId || !commentText.trim()) return;
    try {
      setSubmittingComment(true);
      await notesApi.addComment(noteId, commentText.trim());
      setCommentText('');
      const updated = await notesApi.getComments(noteId);
      setComments(updated);
    } catch (e) {
      // swallow
    } finally {
      setSubmittingComment(false);
    }
  };

  const submitReply = async (parentId: string) => {
    const text = (replyDraftRef.current[parentId] || '').trim();
    if (!noteId || !text) return;
    try {
      setSubmittingComment(true);
      await notesApi.addComment(noteId, text, parentId);
      replyDraftRef.current[parentId] = '';
      setReplyOpenFor(null);
      const updated = await notesApi.getComments(noteId);
      setComments(updated);
    } catch {}
    finally {
      setSubmittingComment(false);
    }
  };

  const Thread: React.FC<{ node: any; depth?: number }> = ({ node, depth = 0 }) => (
    <div className={`border border-gray-100 rounded-lg p-3 ${depth > 0 ? 'ml-4 mt-2' : ''}`}>
      <div className="text-sm text-gray-600 mb-1">
        {node.author ? (
          user?.id && node.user_id === user.id ? (
            <span>{node.author.first_name} {node.author.last_name}</span>
          ) : (
            <Link to={`/user/${node.user_id}`} className="hover:underline">
              {node.author.first_name} {node.author.last_name}
            </Link>
          )
        ) : 'User'}
        {' · '}{formatDate(node.created_at)}
      </div>
      <div className="text-gray-800 text-sm whitespace-pre-wrap">{node.content}</div>
      <div className="mt-2">
        <button type="button" className="text-xs text-primary-700 font-semibold" onClick={() => { setReplyOpenFor(node.id); }}>
          Reply
        </button>
        {user?.id && node.user_id === user.id && (
          <button
            type="button"
            className="ml-3 text-xs text-red-600 font-semibold"
            onClick={async () => {
              if (!noteId) return;
              try {
                await notesApi.deleteComment(noteId, node.id);
                const updated = await notesApi.getComments(noteId);
                setComments(updated);
              } catch {}
            }}
          >
            Delete
          </button>
        )}
      </div>
      {replyOpenFor === node.id && (
        <div className="mt-2 flex gap-2">
          <textarea
            defaultValue={replyDraftRef.current[node.id] || ''}
            onChange={(e) => { replyDraftRef.current[node.id] = e.target.value; }}
            placeholder="Write a reply..."
            rows={3}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y"
            disabled={submittingComment}
          />
          <button
            type="button"
            onClick={() => submitReply(node.id)}
            disabled={submittingComment}
            className="px-3 py-2 bg-primary-700 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            Reply
          </button>
        </div>
      )}
      {node.replies && node.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.replies.map((r: any) => (
            <Thread key={r.id} node={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );

  const threads = buildThreads(comments);

  return (
    <div className="min-h-screen">
      <Navbar />
      <PageContainer>
        <div className="pt-2">
          <Link to={backHref} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium">
            <span className="mr-2">←</span> {backText}
          </Link>
        </div>
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : !note ? null : (
        <div className="p-0 md:p-2">
          <div className="mb-6">
            <div className="text-sm text-gray-500">
              <Link to={`/class/${note.cls?.id || ''}`} className="hover:underline">{note.cls?.name || 'Class'}
              </Link>
              {' · '}
              {note.author ? (
                <Link to={`/user/${note.author.id}`} className="hover:underline">
                  {note.author.first_name} {note.author.last_name}
                </Link>
              ) : (
                'Author'
              )}
              {' · '}
              {formatDate(note.created_at)}
            </div>
            {note.title && (
              <div className="mt-1 text-2xl font-bold text-gray-900 break-words">{note.title}</div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-card border border-white/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Original PDF</h3>
                {votes && (
                  <Button onClick={toggleVote} className="px-3 py-2" variant={votes.user_has_voted ? 'primary' : 'secondary'}>
                    <span className="inline-flex items-center gap-2">
                      <MountainIcon filled={votes.user_has_voted} className="h-4 w-4" /> {votes.count}
                    </span>
                  </Button>
                )}
              </div>
              {note.pdf_url ? (
                <iframe title="pdf" src={note.pdf_url} className="w-full h-[70vh] rounded-md border" />
              ) : (
                <div className="text-gray-500 text-sm">No PDF available.</div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-card border border-white/60 p-4">
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              <div className="prose max-w-none">
                <ReactMarkdown>{note.content || ''}</ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-card border border-white/60 p-4">
            <h3 className="text-lg font-semibold mb-3">Comments</h3>
            <form onSubmit={submitComment} className="flex gap-3 mb-4">
              <Input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                disabled={submittingComment}
              />
              <Button type="submit" disabled={submittingComment || !commentText.trim()} className="px-4">
                Post
              </Button>
            </form>
            <div className="space-y-3">
              {threads.length === 0 ? (
                <div className="text-sm text-gray-500">No comments yet.</div>
              ) : (
                threads.map((root) => (
                  <Thread key={root.id} node={root} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
      </PageContainer>
    </div>
  );
};

export default NoteViewPage;
