import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post, Comment } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../lib/utils';
import { MessageSquare, Send, Trash2, ChevronLeft, Calendar, User as UserIcon } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      const docRef = doc(db, 'posts', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() } as Post);
      }
      setLoading(false);
    };

    fetchPost();

    const commentsQuery = query(
      collection(db, 'posts', id, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
    });

    return () => unsubComments();
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !id) return;

    try {
      await addDoc(collection(db, 'posts', id, 'comments'), {
        postId: id,
        authorUid: user.uid,
        authorName: profile?.displayName || 'Anonymous',
        authorPhoto: profile?.photoURL || null,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id || !window.confirm('Delete this comment?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id, 'comments', commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div></div>;
  if (!post) return <div className="text-center p-20">Post not found.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <article className="space-y-8">
        <header className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {post.tags?.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                <UserIcon size={20} className="text-stone-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">{post.authorName}</p>
                <p className="text-xs text-stone-500">Author</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                <Calendar size={20} className="text-stone-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">
                  {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                </p>
                <p className="text-xs text-stone-500">Published</p>
              </div>
            </div>
          </div>
        </header>

        <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-stone-100">
          <img 
            src={`https://picsum.photos/seed/${post.id}/1200/675`} 
            alt="" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-stone prose-lg max-w-none">
          {post.content.split('\n').map((para, i) => (
            <p key={i} className="text-stone-700 leading-relaxed mb-6">{para}</p>
          ))}
        </div>
      </article>

      <section className="pt-12 border-t border-stone-200 space-y-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-stone-900" />
          <h2 className="text-2xl font-bold text-stone-900">Comments ({comments.length})</h2>
        </div>

        {user ? (
          <form onSubmit={handleAddComment} className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Join the discussion..."
                className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all resize-none h-24"
              />
            </div>
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="self-end p-4 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </form>
        ) : (
          <div className="p-6 bg-stone-100 rounded-2xl text-center">
            <p className="text-stone-600">
              Please <Link to="/login" className="font-bold text-stone-900 underline">sign in</Link> to leave a comment.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              {comment.authorPhoto ? (
                <img src={comment.authorPhoto} alt="" className="w-10 h-10 rounded-full border border-stone-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                  <UserIcon size={20} className="text-stone-500" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{comment.authorName}</span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  {(isAdmin || user?.uid === comment.authorUid) && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-stone-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-stone-700 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
