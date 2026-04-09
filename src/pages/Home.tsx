import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { ArrowRight, Clock, Tag as TagIcon } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-stone-900 mb-4">
          Thoughts, stories, your moments.
        </h1>
        <p className="text-xl text-stone-600 leading-relaxed">
          A place to share knowledge and explore the world of writing.
        </p>
      </header>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="group flex flex-col space-y-4">
              <Link to={`/post/${post.id}`} className="block overflow-hidden rounded-2xl aspect-[16/10] bg-stone-200">
                <img 
                  src={`https://picsum.photos/seed/${post.id}/800/500`} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </Link>
              
              <div className="flex items-center gap-3 text-xs font-medium text-stone-500 uppercase tracking-wider">
                <span>{post.authorName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.publishedAt ? formatDate(post.publishedAt) : 'Recently'}
                </span>
              </div>

              <div className="space-y-2">
                <Link to={`/post/${post.id}`}>
                  <h2 className="text-2xl font-bold text-stone-900 group-hover:text-stone-600 transition-colors leading-tight">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-stone-600 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {post.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-tighter">
                    <TagIcon size={10} />
                    {tag}
                  </span>
                ))}
              </div>

              <Link 
                to={`/post/${post.id}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-stone-900 group-hover:translate-x-1 transition-transform"
              >
                Read article
                <ArrowRight size={16} />
              </Link>
            </article>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-stone-100 rounded-3xl border-2 border-dashed border-stone-200">
            <p className="text-stone-500 font-medium">No posts published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
