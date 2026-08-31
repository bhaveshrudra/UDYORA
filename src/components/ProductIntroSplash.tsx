import React, { useEffect, useState } from'react';
import { motion, useReducedMotion, AnimatePresence } from'motion/react';
import { BrandLogo } from'./BrandLogo';
import { useLanguage } from'../i18n/LanguageContext';

interface ProductIntroSplashProps {
 onComplete: () => void;
 logoSrc?: string;
}

export function ProductIntroSplash({ onComplete, logoSrc }: ProductIntroSplashProps) {
 const { t } = useLanguage();
 const shouldReduceMotion = useReducedMotion();
 const letters = ['U','D','Y','O','R','A'];
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
 setTimeout(onComplete, 250);
 }, 400);
 return () => clearTimeout(fastTimer);
 }

 let timeout: NodeJS.Timeout;

 if (!showLogo) {
 // Step 1: Reveal logo image/symbol
 timeout = setTimeout(() => {
 setShowLogo(true);
 }, 120);
 } else if (activeStep < letters.length) {
 // Step 2: Reveal letters sequentially
 timeout = setTimeout(() => {
 setActiveStep((prev) => prev + 1);
 }, 160);
 } else if (!showTagline) {
 // Step 3: Reveal tagline in selected language
 timeout = setTimeout(() => {
 setShowTagline(true);
 }, 160);
 } else if (!isExiting) {
 // Step 4: Hold and smoothly fade out
 timeout = setTimeout(() => {
 setIsExiting(true);
 setTimeout(onComplete, 450);
 }, 650);
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
 transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
 onClick={onComplete}
 className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white select-none cursor-pointer px-4"
 title="Tap anywhere to skip"
 >
 {/* Subtle Ambient Radial Light */}
 <div className="absolute inset-0 bg-radial from-blue-50/60 via-transparent to-transparent opacity-80 pointer-events-none" />

 <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 max-w-xl">
 {/* Step 1: Official Brand Logo Visual Slot */}
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={showLogo ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
 transition={{ duration: 0.4, ease:'easeOut' }}
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
 duration: 0.3,
 ease: [0.22, 1, 0.36, 1],
 }}
 className="font-mono font-black text-4xl sm:text-6xl md:text-7xl text-slate-950 tracking-[0.06em] inline-block"
 >
 {char}
 </motion.span>
 );
 })}
 </div>

 {/* Step 3: Tagline Subtitle in Selected Language */}
 <motion.div
 initial={{ opacity: 0, y: 6 }}
 animate={showTagline ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
 transition={{ duration: 0.45, ease:'easeOut' }}
 className="space-y-1 pt-1"
 >
 <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 tracking-wide">
 {t('brand.tagline')}
 </p>
 <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
 Tap anywhere to enter
 </p>
 </motion.div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
