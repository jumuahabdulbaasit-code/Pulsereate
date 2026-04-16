import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, ChevronDown } from 'lucide-react';

interface FAQProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    question: "What is GoldenCheck?",
    answer: "GoldenCheck is a simple daily safety check-in app. It allows you to let your family know you're safe with just one tap, reducing the need for constant 'just checking in' phone calls while maintaining peace of mind."
  },
  {
    question: "Is my data private?",
    answer: "Yes. Your check-in history and contact information are stored securely. Only the family members you explicitly add to your contacts will receive notifications when you check in."
  },
  {
    question: "How do I add family members?",
    answer: "Go to the 'Family' tab in the bottom navigation bar. Tap 'Add New Contact' and enter their name and phone number. You can then select them when checking in to send them a WhatsApp update."
  },
  {
    question: "What happens if I forget to check in?",
    answer: "GoldenCheck is a tool for you to proactively reach out. If you forget, your family won't receive your daily update. We recommend setting a daily alarm on your phone to help you remember."
  },
  {
    question: "Can I use this on my phone?",
    answer: "Absolutely! Open the app link in your phone's browser (Safari or Chrome) and use the 'Add to Home Screen' option to install it just like a regular app."
  },
  {
    question: "Does it cost anything?",
    answer: "No, GoldenCheck is completely free to use. Standard data rates may apply when using WhatsApp or browsing the web."
  }
];

export default function FAQ({ isOpen, onClose }: FAQProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
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
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-serif italic text-calm-900">Common Questions</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-calm-300 hover:text-calm-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-4 custom-scrollbar">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="border border-calm-100 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-calm-50 transition-colors"
                  >
                    <span className="text-sm font-bold text-calm-800 pr-4">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-calm-400 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {openIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="p-5 pt-0 text-xs text-calm-500 leading-relaxed bg-white">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="pt-6">
                <button
                  onClick={onClose}
                  className="w-full bg-calm-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-calm-800 transition-all"
                >
                  Close FAQ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
