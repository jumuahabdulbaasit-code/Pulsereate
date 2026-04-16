/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Heart, History, Info, LayoutDashboard, ShieldCheck, Users, Bell, Settings, LogOut, CheckCircle2, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';
import CheckInButton from './components/CheckInButton';
import ContactManager from './components/ContactManager';
import CheckInHistory from './components/CheckInHistory';
import AuthStatus from './components/AuthStatus';
import Onboarding from './components/Onboarding';
import HowItWorks from './components/HowItWorks';
import UserProfileEditor from './components/UserProfileEditor';
import FAQ from './components/FAQ';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth, db, handleFirestoreError, OperationType, signInAnonymously } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  getDoc,
  Timestamp,
  limit
} from 'firebase/firestore';

interface CheckIn {
  id: string;
  uid: string;
  timestamp: Date;
  status: 'ok' | 'missed';
  note?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [profile, setProfile] = useState<{ displayName?: string, photoURL?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'contacts' | 'history' | 'settings'>('home');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  // Auto sign-in anonymously if no user is present
  useEffect(() => {
    if (!loading && !user) {
      signInAnonymously(auth).catch(err => console.error('Auto-login failed', err));
    }
  }, [user, loading]);

  // Check if onboarding should be shown
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('goldencheck-onboarding-seen');
    if (!hasSeenOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem('goldencheck-onboarding-seen', 'true');
    setShowOnboarding(false);
  };

  // Sync Check-ins
  useEffect(() => {
    if (!user) {
      setCheckins([]);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/checkins`), 
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate()
      })) as CheckIn[];
      setCheckins(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/checkins`));

    return () => unsubscribe();
  }, [user]);

  // Sync Contacts
  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/contacts`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      setContacts(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/contacts`));

    return () => unsubscribe();
  }, [user]);

  // Sync Profile
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data());
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    return () => unsubscribe();
  }, [user]);

  const handleCheckIn = async (note?: string) => {
    if (!user) return;
    setIsCheckingIn(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/checkins`), {
        uid: user.uid,
        timestamp: Timestamp.now(),
        status: 'ok',
        ...(note && { note })
      });
      
      // Simulate notification to family
      if (Notification.permission === 'granted') {
        new Notification('GoldenCheck', {
          body: 'Check-in successful! Your family has been notified.',
          icon: '/favicon.ico'
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/checkins`);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const addContact = async (contact: Omit<Contact, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/contacts`), {
        ...contact,
        uid: user.uid
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/contacts`);
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/contacts`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/contacts/${id}`);
    }
  };

  const lastCheckIn = checkins.length > 0 ? checkins[0].timestamp : null;

  return (
    <div className="min-h-screen bg-calm-50 pb-32">
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      </AnimatePresence>

      <HowItWorks isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
      <FAQ isOpen={showFAQ} onClose={() => setShowFAQ(false)} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-calm-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-heart-500 rounded-xl flex items-center justify-center shadow-lg shadow-heart-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-serif italic font-bold text-calm-900">GoldenCheck</h1>
          </div>
          <div className="flex items-center gap-4">
            {profile?.displayName && (
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest leading-none">Welcome back</p>
                <p className="text-xs font-bold text-calm-900">{profile.displayName}</p>
              </div>
            )}
            {profile?.photoURL && (
              <img 
                src={profile.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={() => setShowHowItWorks(true)}
              className="p-2 text-calm-400 hover:text-calm-600 transition-colors"
              title="How it works"
            >
              <Info className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {!user && loading ? (
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-calm-100 flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10 text-heart-500 fill-current animate-pulse" />
            </div>
            <p className="text-xs text-calm-400">Opening GoldenCheck...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <CheckInButton 
                  onCheckIn={handleCheckIn} 
                  lastCheckIn={lastCheckIn}
                  isCheckingIn={isCheckingIn}
                  contacts={contacts}
                  userName={profile?.displayName}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-calm-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <h3 className="font-serif italic text-lg text-calm-900">Contacts</h3>
                    </div>
                    <p className="text-xs text-calm-500">You have {contacts.length} family members set up to be notified.</p>
                    <button 
                      onClick={() => setActiveTab('contacts')}
                      className="text-xs font-bold text-blue-500 uppercase tracking-widest hover:underline"
                    >
                      Manage Contacts
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-calm-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <h3 className="font-serif italic text-lg text-calm-900">Streak</h3>
                    </div>
                    <p className="text-xs text-calm-500">You've checked in consistently for the last few days.</p>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="text-xs font-bold text-green-500 uppercase tracking-widest hover:underline"
                    >
                      View History
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Tip:</strong> Set a daily alarm on your phone to remind you to check in every morning at the same time.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'contacts' && (
              <motion.div key="contacts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <ContactManager contacts={contacts} onAdd={addContact} onDelete={deleteContact} />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <CheckInHistory checkins={checkins} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <UserProfileEditor />

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-calm-100 space-y-6">
                  <h2 className="text-2xl font-serif italic text-calm-900">Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest">App Notifications</p>
                      <div className="flex items-center justify-between p-4 bg-calm-50 rounded-2xl">
                        <div>
                          <p className="font-semibold text-sm text-calm-900">Reminders</p>
                          <p className="text-[10px] text-calm-400">Receive reminders to check in</p>
                        </div>
                        <button 
                          onClick={() => Notification.requestPermission()}
                          className="px-4 py-2 bg-calm-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl"
                        >
                          Enable
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest">Help & Info</p>
                      <button 
                        onClick={() => setShowHowItWorks(true)}
                        className="w-full flex items-center justify-between p-4 bg-calm-50 rounded-2xl hover:bg-calm-100 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Info className="w-4 h-4 text-calm-600" />
                          </div>
                          <p className="font-semibold text-sm text-calm-900">How GoldenCheck Works</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-calm-300" />
                      </button>

                      <button 
                        onClick={() => setShowFAQ(true)}
                        className="w-full flex items-center justify-between p-4 bg-calm-50 rounded-2xl hover:bg-calm-100 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <HelpCircle className="w-4 h-4 text-blue-600" />
                          </div>
                          <p className="font-semibold text-sm text-calm-900">Common Questions (FAQ)</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-calm-300" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest">Install on Phone</p>
                      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                        <p className="text-xs text-blue-700 leading-relaxed">
                          You can use GoldenCheck just like a real app on your phone!
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">1</div>
                            <p className="text-[10px] text-blue-600">Tap the <strong>Share</strong> button in your browser (at the top or bottom).</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">2</div>
                            <p className="text-[10px] text-blue-600">Select <strong>"Add to Home Screen"</strong>.</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">3</div>
                            <p className="text-[10px] text-blue-600">The app icon will now appear on your phone's home screen!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Navigation Bar */}
      {user && (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-calm-900/95 backdrop-blur-xl px-8 py-4 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-10 z-50">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === 'home' ? 'text-white scale-110' : 'text-calm-500 hover:text-calm-300'
            }`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
          </button>
          
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === 'contacts' ? 'text-white scale-110' : 'text-calm-500 hover:text-calm-300'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Family</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === 'history' ? 'text-white scale-110' : 'text-calm-500 hover:text-calm-300'
            }`}
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === 'settings' ? 'text-white scale-110' : 'text-calm-500 hover:text-calm-300'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
          </button>
        </nav>
      )}
    </div>
  );
}
