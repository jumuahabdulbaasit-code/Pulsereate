import React from 'react';
import { LogIn, LogOut, User, ShieldCheck } from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function AuthStatus() {
  const [user, loading] = useAuthState(auth);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) return (
    <div className="w-8 h-8 rounded-full bg-calm-100 animate-pulse" />
  );

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-calm-900 leading-none">{user.displayName}</p>
          <p className="text-[10px] text-calm-400 mt-1 flex items-center justify-end gap-1">
            <ShieldCheck className="w-2 h-2" /> Secure
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="relative group"
        >
          <img
            src={user.photoURL || ''}
            alt={user.displayName || ''}
            className="w-10 h-10 rounded-xl border-2 border-white shadow-sm group-hover:opacity-50 transition-all"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <LogOut className="w-4 h-4 text-calm-900" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-calm-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-calm-800 transition-all shadow-lg shadow-calm-900/10"
    >
      <LogIn className="w-4 h-4" /> Sign In
    </button>
  );
}
