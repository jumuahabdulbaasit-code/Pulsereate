import React, { useState } from 'react';
import { UserPlus, Trash2, Mail, Phone, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ContactManagerProps {
  contacts: Contact[];
  onAdd: (contact: Omit<Contact, 'id'>) => void;
  onDelete: (id: string) => void;
}

export default function ContactManager({ contacts, onAdd, onDelete }: ContactManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, email, phone });
    setName('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setConfirmingDelete(null);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-calm-100 space-y-6 relative">
      <AnimatePresence>
        {confirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif italic text-calm-900">Remove Contact?</h3>
                <p className="text-sm text-calm-500">Are you sure you want to remove this family member? They will no longer be notified.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(confirmingDelete)}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  Yes, Remove
                </button>
                <button
                  onClick={() => setConfirmingDelete(null)}
                  className="flex-1 bg-calm-100 text-calm-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-calm-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-serif italic text-calm-900">Family Contacts</h2>
            <p className="text-xs text-calm-500">Who should we notify if you miss a check-in?</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="p-2 bg-calm-900 text-white rounded-xl hover:bg-calm-800 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden bg-calm-50 rounded-2xl p-4 space-y-4 border border-calm-100"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Contact Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-calm-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-calm-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g. +1234567890)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-calm-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-calm-900 text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
                Add Contact
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-white text-calm-500 rounded-xl text-xs font-bold uppercase tracking-widest border border-calm-200">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="p-4 rounded-2xl bg-calm-50 border border-calm-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-calm-400 font-bold">
                {contact.name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm text-calm-900">{contact.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-calm-400">
                  <Mail className="w-3 h-3" /> {contact.email}
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-[10px] text-calm-400">
                    <Phone className="w-3 h-3" /> {contact.phone}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setConfirmingDelete(contact.id)}
              className="p-2 text-calm-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {contacts.length === 0 && !isAdding && (
          <div className="text-center py-8 text-calm-400 font-serif italic border border-dashed border-calm-200 rounded-2xl">
            No contacts added yet.
          </div>
        )}
      </div>
    </div>
  );
}
