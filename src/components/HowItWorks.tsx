import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Users, Bell, MessageCircle, X, ShieldCheck, Smartphone, Clock } from 'lucide-react';

interface HowItWorksProps {
  isOpen: boolean;
  onClose: () => void;
}

const sections = [
  {
    title: "The Purpose",
    description: "GoldenCheck is designed to provide peace of mind for both you and your family. It's a simple, non-intrusive way to say 'I'm okay' every day without needing to make a long phone call.",
    icon: <Heart className="w-8 h-8 text-heart-500 fill-current" />,
    color: "bg-heart-50"
  },
  {
    title: "How to Use",
    steps: [
      {
        icon: <Users className="w-5 h-5 text-blue-500" />,
        text: "Add your family members in the 'Family' tab with their phone numbers."
      },
      {
        icon: <Bell className="w-5 h-5 text-green-500" />,
        text: "Every morning, tap the big heart button on the Home screen."
      },
      {
        icon: <MessageCircle className="w-5 h-5 text-green-600" />,
        text: "Send a quick WhatsApp update to let them know you're doing great."
      }
    ]
  },
  {
    title: "Tips for Success",
    steps: [
      {
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        text: "Set a daily alarm to remind you to check in at the same time each day."
      },
      {
        icon: <Smartphone className="w-5 h-5 text-purple-500" />,
        text: "Add the app to your phone's home screen for one-tap access."
      },
      {
        icon: <ShieldCheck className="w-5 h-5 text-calm-600" />,
        text: "Your data is private and secure, only shared with the family you choose."
      }
    ]
  }
];

export default function HowItWorks({ isOpen, onClose }: HowItWorksProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-calm-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative z-10 max-h-[85vh] flex flex-col"
          >
            <div className="p-8 border-b border-calm-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-heart-500 rounded-xl flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-serif italic text-calm-900">How GoldenCheck Works</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-calm-300 hover:text-calm-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3">
                    {section.icon && (
                      <div className={`w-12 h-12 ${section.color} rounded-2xl flex items-center justify-center`}>
                        {section.icon}
                      </div>
                    )}
                    <h3 className="text-lg font-serif italic text-calm-800">{section.title}</h3>
                  </div>
                  
                  {section.description && (
                    <p className="text-sm text-calm-500 leading-relaxed pl-1">
                      {section.description}
                    </p>
                  )}

                  {section.steps && (
                    <div className="space-y-3 pl-1">
                      {section.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-4 p-4 bg-calm-50 rounded-2xl border border-calm-100">
                          <div className="mt-0.5 shrink-0">{step.icon}</div>
                          <p className="text-xs text-calm-600 leading-relaxed">{step.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="w-full bg-calm-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-calm-800 transition-all"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { Info } from 'lucide-react';
