import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { Plus, Edit3, Trash2, Eye, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // If admin, see all posts. If author, see only own posts.
    const q = isAdmin 
      ? query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'posts'), where('authorUid', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Dashboard</h1>
          <p className="text-stone-500">Manage your stories and content.</p>
        </div>
        <Link 
          to="/admin/posts/new"
          className="inline-flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors"
        >
          <Plus size={20} />
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Post</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-stone-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 line-clamp-1">{post.title}</p>
                          <p className="text-xs text-stone-500">{post.authorName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {post.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider">
                          <Clock size={12} />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/post/${post.id}`}
                          className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link 
                          to={`/admin/posts/edit/${post.id}`}
                          className="p-2 text-stone-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-500">
                    No posts found. Start writing your first story!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
