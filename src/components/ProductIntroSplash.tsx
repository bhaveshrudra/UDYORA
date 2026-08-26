import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { BrandLogo } from './BrandLogo';

interface ProductIntroSplashProps {
  onComplete: () => void;
  logoSrc?: string;
}

export function ProductIntroSplash({ onComplete, logoSrc }: ProductIntroSplashProps) {
  const shouldReduceMotion = useReducedMotion();
  const letters = ['U', 'D', 'Y', 'O', 'R', 'A'];
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const [showTagline, setShowTagline] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    // If reduced motion is requested, complete rapidly
    if (shouldReduceMotion) {
      setShowLogo(true);
      setActiveStep(letters.length);
      setShowTagline(true);
      const fastTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 300);
      }, 500);
      return () => clearTimeout(fastTimer);
    }

    let timeout: NodeJS.Timeout;

    if (!showLogo) {
      // Step 1: Reveal logo image/symbol
      timeout = setTimeout(() => {
        setShowLogo(true);
      }, 150);
    } else if (activeStep < letters.length) {
      // Step 2: Reveal letters sequentially
      timeout = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 190);
    } else if (!showTagline) {
      // Step 3: Reveal tagline
      timeout = setTimeout(() => {
        setShowTagline(true);
      }, 180);
    } else if (!isExiting) {
      // Step 4: Hold and smoothly fade out
      timeout = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 550);
      }, 750);
    }

    return () => clearTimeout(timeout);
  }, [showLogo, activeStep, showTagline, isExiting, shouldReduceMotion, onComplete, letters.length]);

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
          <div className="absolute inset-0 bg-radial from-blue-50/60 via-transparent to-transparent opacity-80 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 max-w-xl">
            {/* Step 1: Official Brand Logo Visual Slot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={showLogo ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="mb-1"
            >
              <BrandLogo
                size="lg"
                compact={true}
                logoSrc={logoSrc}
              />
            </motion.div>

            {/* Step 2: Letter-by-Letter Central Logo Title */}
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
                      duration: 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="font-mono font-black text-4xl sm:text-6xl md:text-7xl text-slate-950 tracking-[0.06em] inline-block"
                  >
                    {char}
                  </motion.span>
                );
              })}
            </div>

            {/* Step 3: Tagline Subtitle */}
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
