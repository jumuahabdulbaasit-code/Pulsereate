import React, { useState, useEffect } from 'react';
import { CheckCircle2, Heart, ShieldCheck, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Contact {
  id: string;
  name: string;
  phone?: string;
}

interface CheckInButtonProps {
  onCheckIn: (note?: string) => void;
  lastCheckIn: Date | null;
  isCheckingIn: boolean;
  contacts: Contact[];
  userName?: string;
}

export default function CheckInButton({ onCheckIn, lastCheckIn, isCheckingIn, contacts, userName }: CheckInButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [note, setNote] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  const isToday = lastCheckIn && new Date(lastCheckIn).toDateString() === new Date().toDateString();

  // Default to first contact with a phone number
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      const firstWithPhone = contacts.find(c => c.phone);
      if (firstWithPhone) setSelectedContactId(firstWithPhone.id);
    }
  }, [contacts, selectedContactId]);

  useEffect(() => {
    if (isToday) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isToday]);

  const shareToWhatsApp = (phone?: string, currentNote?: string) => {
    const baseMessage = "Hi! I've just checked in on GoldenCheck. I'm doing great today! ❤️";
    const finalMessage = currentNote ? `${baseMessage}\nNote: ${currentNote}` : baseMessage;
    const encodedMessage = encodeURIComponent(finalMessage);
    const url = phone 
      ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const handleCheckInClick = () => {
    // Trigger WhatsApp immediately to avoid popup blocker
    const selectedContact = contacts.find(c => c.id === selectedContactId);
    if (selectedContact?.phone) {
      shareToWhatsApp(selectedContact.phone, note);
    } else if (contacts.length > 0) {
      // Fallback to generic share if no phone but contacts exist
      shareToWhatsApp(undefined, note);
    }
    
    onCheckIn(note);
    setNote('');
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8 bg-white rounded-[3rem] shadow-sm border border-calm-100 relative overflow-hidden">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-50 bg-green-500/95 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-serif italic">Wonderful!</h3>
                <p className="text-sm text-white/80">Your family has been notified that you are safe.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif italic text-calm-900">
          {userName ? `Hi ${userName}` : 'Daily Check-In'}
        </h2>
        <p className="text-sm text-calm-500 max-w-[240px] mx-auto">
          {isToday 
            ? "You're all set for today! Your family has been notified." 
            : "Tap the heart below to let your family know you're doing great today."}
        </p>
      </div>

      {!isToday && (
        <div className="w-full space-y-6">
          {/* Contact Selector */}
          {contacts.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest text-center">Who to notify?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContactId(contact.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      selectedContactId === contact.id
                        ? "bg-calm-900 text-white border-calm-900 shadow-lg shadow-calm-900/20"
                        : "bg-calm-50 text-calm-500 border-calm-100 hover:bg-calm-100"
                    )}
                  >
                    {contact.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full"
          >
            <input
              type="text"
              placeholder="Add a short note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              className="w-full px-4 py-3 rounded-2xl bg-calm-50 border border-calm-100 text-sm text-calm-700 placeholder:text-calm-400 focus:ring-2 focus:ring-heart-500/20 outline-none transition-all"
            />
          </motion.div>
        </div>
      )}

      <div className="relative">
        {/* Pulse effect when not checked in */}
        {!isToday && !isCheckingIn && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-heart-500 rounded-full blur-2xl"
          />
        )}

        <button
          onClick={handleCheckInClick}
          disabled={isToday || isCheckingIn}
          className={cn(
            "relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl",
            isToday 
              ? "bg-green-500 shadow-green-500/20" 
              : "bg-heart-500 hover:bg-heart-600 shadow-heart-500/30 active:scale-95"
          )}
        >
          {isToday ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center text-white"
            >
              <CheckCircle2 className="w-20 h-20" />
              <span className="text-sm font-bold uppercase tracking-widest mt-2">I'm Safe</span>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-white">
              <Heart className={cn("w-20 h-20 fill-current", isCheckingIn && "animate-pulse")} />
              <span className="text-sm font-bold uppercase tracking-widest mt-2">
                {isCheckingIn ? "Checking..." : "I'm Okay"}
              </span>
            </div>
          )}
        </button>
      </div>

      {isToday && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-4"
        >
          <div className="text-center">
            <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest mb-2">Send Another Update</p>
            <div className="flex flex-wrap justify-center gap-2">
              {contacts.filter(c => c.phone).map(contact => (
                <button
                  key={contact.id}
                  onClick={() => shareToWhatsApp(contact.phone)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-100 transition-all border border-green-100"
                >
                  <MessageCircle className="w-4 h-4" />
                  {contact.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2 px-4 py-2 bg-calm-50 rounded-full border border-calm-100">
        <ShieldCheck className="w-4 h-4 text-calm-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-calm-500">
          {isToday ? "Family Notified" : "Family Waiting"}
        </span>
      </div>
    </div>
  );
}
