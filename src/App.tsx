import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import PostDetail from './pages/PostDetail';
import AdminDashboard from './pages/AdminDashboard';
import EditPost from './pages/EditPost';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'admin' | 'author' }) {
  const { user, profile, loading, isAdmin, isAuthor } = useAuth();

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div></div>;
  if (!user) return <Navigate to="/login" />;
  
  if (role === 'admin' && !isAdmin) return <Navigate to="/" />;
  if (role === 'author' && !isAuthor) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/post/:id" element={<PostDetail />} />
            
            {/* Author/Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute role="author">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/posts/new" element={
              <ProtectedRoute role="author">
                <EditPost />
              </ProtectedRoute>
            } />
            <Route path="/admin/posts/edit/:id" element={
              <ProtectedRoute role="author">
                <EditPost />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
