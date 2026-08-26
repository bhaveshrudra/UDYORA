import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

// Import the generated graphic matching the user's uploaded artwork
import heroBgGraphic from '../assets/images/udyora_hero_bg_1787681305322.jpg';

interface HeroWatermarkProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function HeroWatermark({ containerRef }: HeroWatermarkProps) {
  const shouldReduceMotion = useReducedMotion();
  const letters = ['U', 'D', 'Y', 'O', 'R', 'A'];
  const [activeStep, setActiveStep] = useState(0); // 0 to 6 (0: none, 1: U, 2: UD, ..., 6: UDYORA)
  const [isCycleFading, setIsCycleFading] = useState(false);

  // Subtle parallax effect on scroll
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 90]);

  // Letter-by-letter typing animation cycle
  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveStep(letters.length);
      setIsCycleFading(false);
      return;
    }

    let timer: NodeJS.Timeout;

    if (!isCycleFading) {
      if (activeStep < letters.length) {
        // Step forward letter by letter with smooth timing
        timer = setTimeout(() => {
          setActiveStep((prev) => prev + 1);
        }, 340);
      } else {
        // Full word "UDYORA" is revealed — hold for 3.6 seconds
        timer = setTimeout(() => {
          setIsCycleFading(true);
        }, 3600);
      }
    } else {
      // Fade out back to near transparent, then reset and start typing again
      timer = setTimeout(() => {
        setActiveStep(0);
        setIsCycleFading(false);
      }, 1400);
    }

    return () => clearTimeout(timer);
  }, [activeStep, isCycleFading, shouldReduceMotion, letters.length]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none flex items-center justify-center z-0"
    >
      {/* 1. Underlying subtle uploaded graphic artwork watermark */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : parallaxY }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-full max-w-5xl h-[340px] sm:h-[440px] md:h-[500px] flex items-center justify-center">
          {/* Subtle blurred backplate / glow blending into white canvas */}
          <div className="absolute inset-0 bg-radial from-blue-50/40 via-transparent to-transparent opacity-60 pointer-events-none" />

          <img
            src={heroBgGraphic}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain object-center opacity-[0.035] sm:opacity-[0.045] mix-blend-multiply filter contrast-125 select-none"
            style={{
              maskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 40%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 40%, transparent 95%)',
            }}
          />
        </div>
      </motion.div>

      {/* 2. Primary Animated Letter-by-Letter UDYORA Watermark */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : parallaxY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 flex flex-col items-center justify-center text-center"
      >
        {/* Animated letter track */}
        <div
          className={`flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
            isCycleFading ? 'opacity-10' : 'opacity-100'
          }`}
        >
          {letters.map((letter, index) => {
            const isVisible = index < activeStep;
            return (
              <motion.span
                key={`${letter}-${index}`}
                initial={false}
                animate={
                  shouldReduceMotion
                    ? { opacity: 0.042, y: 0, scale: 1 }
                    : isVisible
                    ? {
                        opacity: 0.045,
                        y: 0,
                        scale: 1,
                      }
                    : {
                        opacity: 0,
                        y: 10,
                        scale: 0.98,
                      }
                }
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="font-mono font-black text-[54px] sm:text-[96px] md:text-[132px] lg:text-[168px] xl:text-[188px] text-blue-950 tracking-[0.08em] sm:tracking-[0.12em] leading-none inline-block origin-center"
              >
                {letter}
              </motion.span>
            );
          })}
        </div>

        {/* Subtitle lettermark echo: "EMPOWERING RURAL ENTREPRENEURS" */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.035 }
              : activeStep >= letters.length && !isCycleFading
              ? { opacity: 0.04, y: 0 }
              : { opacity: 0, y: 4 }
          }
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mt-2 text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.28em] sm:tracking-[0.4em] uppercase text-blue-950 font-sans hidden sm:block"
        >
          Empowering Rural Entrepreneurs
        </motion.div>
      </motion.div>
    </div>
  );
}
