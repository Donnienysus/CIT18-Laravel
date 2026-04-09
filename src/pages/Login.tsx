import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogIn, Github } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 text-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Welcome back</h1>
        <p className="text-stone-500">Sign in to your account to continue</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 text-stone-700 px-6 py-3 rounded-xl font-medium hover:bg-stone-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
          Continue with Google
        </button>
        
        <button 
          disabled
          className="w-full flex items-center justify-center gap-3 bg-stone-900 text-white px-6 py-3 rounded-xl font-medium opacity-50 cursor-not-allowed"
        >
          <Github size={20} />
          Continue with GitHub
        </button>
      </div>

      <p className="text-xs text-stone-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
