import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, LayoutDashboard, PenSquare, BookOpen } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, isAdmin, isAuthor } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                  <BookOpen size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight">Blog Sphere</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
                <Link to="/" className="hover:text-stone-900 transition-colors">Browse</Link>
                {isAuthor && (
                  <Link to="/admin" className="hover:text-stone-900 transition-colors">Dashboard</Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {isAuthor && (
                    <Link 
                      to="/admin/posts/new" 
                      className="hidden sm:flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
                    >
                      <PenSquare size={16} />
                      Write
                    </Link>
                  )}
                  <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold leading-none">{profile?.displayName || 'User'}</p>
                      <p className="text-xs text-stone-500 mt-1 capitalize">{profile?.role}</p>
                    </div>
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full border border-stone-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
                        <User size={16} className="text-stone-500" />
                      </div>
                    )}
                    <button 
                      onClick={handleSignOut}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-stone-200 bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-stone-500 text-sm">© 2026 Blog Sphere. Built for imaginative creators.</p>
        </div>
      </footer>
    </div>
  );
}
