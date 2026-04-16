import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Check, Loader2, Upload } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion } from 'motion/react';

const AVATARS = [
  "https://picsum.photos/seed/avatar1/200",
  "https://picsum.photos/seed/avatar2/200",
  "https://picsum.photos/seed/avatar3/200",
  "https://picsum.photos/seed/avatar4/200",
  "https://picsum.photos/seed/avatar5/200",
  "https://picsum.photos/seed/avatar6/200",
];

export default function UserProfileEditor() {
  const [user] = useAuthState(auth);
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.displayName || '');
        setPhotoURL(data.photoURL || AVATARS[0]);
      } else {
        setPhotoURL(AVATARS[0]);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      const profileData = {
        displayName: name,
        photoURL: photoURL,
        uid: user.uid,
        updatedAt: new Date().toISOString()
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, profileData);
      } else {
        await setDoc(docRef, profileData);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB before processing)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image is too large. Please choose a smaller file.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        // Square crop and resize
        const size = Math.min(width, height);
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPhotoURL(dataUrl);
          setMessage({ type: 'success', text: 'Photo ready to save!' });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!user) return null;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-calm-100 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-heart-50 flex items-center justify-center">
          <User className="w-5 h-5 text-heart-500" />
        </div>
        <h2 className="text-2xl font-serif italic text-calm-900">Your Profile</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar Selection */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest">Choose a Profile Picture</p>
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start items-center">
            {AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPhotoURL(url)}
                className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                  photoURL === url ? 'border-heart-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {photoURL === url && (
                  <div className="absolute inset-0 bg-heart-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            ))}

            <div className="flex flex-col items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-16 h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                  photoURL.startsWith('data:') 
                    ? 'border-heart-500 bg-heart-50' 
                    : 'border-calm-200 text-calm-400 hover:border-calm-400 hover:text-calm-600'
                }`}
              >
                {photoURL.startsWith('data:') ? (
                  <img src={photoURL} alt="Custom" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="text-[8px] font-bold uppercase">Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-calm-400 uppercase tracking-widest block">Your Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-6 py-4 bg-calm-50 border border-calm-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-heart-500/20 focus:border-heart-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-calm-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-calm-800 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
          </button>

          {message && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center text-xs font-bold uppercase tracking-widest ${
                message.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {message.text}
            </motion.p>
          )}
        </div>
      </form>
    </div>
  );
}
