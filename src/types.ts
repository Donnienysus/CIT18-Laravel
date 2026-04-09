export type UserRole = 'admin' | 'author' | 'reader';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorUid: string;
  authorName: string;
  status: 'draft' | 'published';
  categoryId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string | null;
  content: string;
  createdAt: string;
}
