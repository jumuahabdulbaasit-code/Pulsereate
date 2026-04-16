import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Users, Bell, MessageCircle, ChevronRight, X, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to GoldenCheck",
    description: "A simple way to let your family know you're safe and well every single day.",
    icon: <Heart className="w-12 h-12 text-heart-500 fill-current" />,
    color: "bg-heart-50"
  },
  {
    title: "Add Your Family",
    description: "Go to the Family tab to add your loved ones. They are the people who care about your daily safety.",
    icon: <Users className="w-12 h-12 text-blue-500" />,
    color: "bg-blue-50"
  },
  {
    title: "Daily Check-In",
    description: "Tap the big heart every morning. It's a small habit that gives your family huge peace of mind.",
    icon: <Bell className="w-12 h-12 text-green-500" />,
    color: "bg-green-50"
  },
  {
    title: "WhatsApp Updates",
    description: "After checking in, you can send a quick WhatsApp message to your family with just one tap.",
    icon: <MessageCircle className="w-12 h-12 text-green-600" />,
    color: "bg-green-50"
  },
  {
    title: "Personalize",
    description: "Go to Settings to set your name and choose a profile picture so your family knows it's you.",
    icon: <User className="w-12 h-12 text-purple-500" />,
    color: "bg-purple-50"
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-calm-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 p-2 text-calm-300 hover:text-calm-500 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6 text-center"
            >
              <div className={`w-24 h-24 ${steps[currentStep].color} rounded-3xl flex items-center justify-center mx-auto`}>
                {steps[currentStep].icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-serif italic text-calm-900">{steps[currentStep].title}</h3>
                <p className="text-sm text-calm-500 leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-8 bg-calm-900" : "w-2 bg-calm-200"
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="w-full bg-calm-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-calm-800 transition-all group"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
