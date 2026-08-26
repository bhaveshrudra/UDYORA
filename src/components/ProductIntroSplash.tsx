import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';

interface ProductIntroSplashProps {
  onComplete: () => void;
}

export function ProductIntroSplash({ onComplete }: ProductIntroSplashProps) {
  const shouldReduceMotion = useReducedMotion();
  const letters = ['U', 'D', 'Y', 'O', 'R', 'A'];
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showTagline, setShowTagline] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    // If reduced motion is requested, complete rapidly
    if (shouldReduceMotion) {
      setActiveStep(letters.length);
      setShowTagline(true);
      const fastTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 300);
      }, 500);
      return () => clearTimeout(fastTimer);
    }

    let timeout: NodeJS.Timeout;

    if (activeStep < letters.length) {
      // Reveal letters sequentially
      timeout = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 210);
    } else if (!showTagline) {
      // When UDYORA completes, reveal tagline
      timeout = setTimeout(() => {
        setShowTagline(true);
      }, 180);
    } else if (!isExiting) {
      // Hold for 750ms after tagline is visible, then start exit fade
      timeout = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 550);
      }, 800);
    }

    return () => clearTimeout(timeout);
  }, [activeStep, showTagline, isExiting, shouldReduceMotion, onComplete, letters.length]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="udyora-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white select-none pointer-events-none px-4"
        >
          {/* Subtle Ambient Radial Light */}
          <div className="absolute inset-0 bg-radial from-blue-50/50 via-transparent to-transparent opacity-70 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 max-w-xl">
            {/* Small Brand Icon Accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-xs border border-slate-700 tracking-wider mb-1"
            >
              U
            </motion.div>

            {/* Letter-by-Letter Central Logo Title */}
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              {letters.map((char, index) => {
                const isVisible = index < activeStep;
                return (
                  <motion.span
                    key={`${char}-${index}`}
                    initial={{ opacity: 0, y: 10, scale: 0.94 }}
                    animate={
                      isVisible
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 0, y: 10, scale: 0.94 }
                    }
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="font-mono font-black text-4xl sm:text-6xl md:text-7xl text-slate-950 tracking-[0.06em] inline-block"
                  >
                    {char}
                  </motion.span>
                );
              })}
            </div>

            {/* Tagline Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={showTagline ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-1 pt-1"
            >
              <p className="text-xs sm:text-sm md:text-base font-bold text-slate-700 tracking-wide">
                Hyper-Local Business Intelligence
              </p>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-[0.2em]">
                For Rural Entrepreneurs
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
