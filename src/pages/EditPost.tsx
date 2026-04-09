import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Post } from '../types';
import { ChevronLeft, Save, Send, Eye, X } from 'lucide-react';

export default function EditPost() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Post;
          setTitle(data.title);
          setContent(data.content);
          setExcerpt(data.excerpt);
          setStatus(data.status);
          setTags(data.tags || []);
        }
        setLoading(false);
      };
      fetchPost();
    }
  }, [id]);

  const handleSave = async (newStatus?: 'draft' | 'published') => {
    if (!user || !title.trim() || !content.trim()) return;
    
    setSaving(true);
    const finalStatus = newStatus || status;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const postData = {
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      status: finalStatus,
      tags,
      authorUid: user.uid,
      authorName: profile?.displayName || 'Anonymous',
      updatedAt: new Date().toISOString(),
      ...(finalStatus === 'published' && !id ? { publishedAt: new Date().toISOString() } : {}),
      ...(finalStatus === 'published' && id && status === 'draft' ? { publishedAt: new Date().toISOString() } : {}),
    };

    try {
      if (id) {
        await updateDoc(doc(db, 'posts', id), postData);
      } else {
        await addDoc(collection(db, 'posts'), {
          ...postData,
          createdAt: new Date().toISOString(),
        });
      }
      navigate('/admin');
    } catch (error) {
      console.error("Error saving post:", error);
    } finally {
      setSaving(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors text-sm font-medium"
          >
            <Save size={18} />
            Save Draft
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            <Send size={18} />
            {id && status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post Title"
          className="w-full text-4xl font-bold tracking-tight text-stone-900 border-none focus:ring-0 placeholder:text-stone-200 outline-none"
        />

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Excerpt (Short Summary)</label>
          <textarea 
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a brief summary..."
            className="w-full p-4 rounded-2xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all resize-none h-20 text-stone-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Content</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your story..."
            className="w-full p-8 rounded-3xl bg-white border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none transition-all min-h-[400px] text-lg text-stone-800 leading-relaxed"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Tags</label>
          <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            {tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-600 text-xs font-bold">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            ))}
            <input 
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add tag and press Enter..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs font-medium outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
