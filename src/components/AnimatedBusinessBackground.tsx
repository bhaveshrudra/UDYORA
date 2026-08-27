import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import heroBgArtwork from '../assets/images/udyora_hero_bg_1787681305322.jpg';

interface AnimatedBusinessBackgroundProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const AnimatedBusinessBackground: React.FC<AnimatedBusinessBackgroundProps> = ({
  containerRef
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Multi-layer scroll parallax
  const bgArtworkY = useTransform(scrollY, [0, 2500], [0, -180]);
  const watermarkY = useTransform(scrollY, [0, 2500], [0, -100]);
  const networkY = useTransform(scrollY, [0, 3000], [0, -220]);
  const floatIconsY = useTransform(scrollY, [0, 3000], [0, -320]);

  // Watermark sequential letter animation (U -> UD -> UDY -> UDYO -> UDYOR -> UDYORA)
  const letters = ['U', 'D', 'Y', 'O', 'R', 'A'];
  const [activeLetterCount, setActiveLetterCount] = useState<number>(0);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.04);

  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveLetterCount(letters.length);
      setWatermarkOpacity(0.035);
      return;
    }

    let intervalId: NodeJS.Timeout;
    let step = 0;

    const runCycle = () => {
      step = 0;
      setActiveLetterCount(0);
      setWatermarkOpacity(0.042);

      intervalId = setInterval(() => {
        step++;
        if (step <= letters.length) {
          setActiveLetterCount(step);
        } else if (step === letters.length + 1) {
          // Hold for 2.8s
        } else if (step === letters.length + 2) {
          // Fade out
          setWatermarkOpacity(0);
        } else if (step >= letters.length + 3) {
          clearInterval(intervalId);
          setTimeout(runCycle, 600);
        }
      }, 340);
    };

    runCycle();
    return () => clearInterval(intervalId);
  }, [shouldReduceMotion, letters.length]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 print:hidden"
      aria-hidden="true"
    >
      {/* LAYER 1: Deep Ambient Radial Gradient & Subtle Artwork Blend */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : bgArtworkY }}
        className="absolute inset-0 w-full h-full opacity-60"
      >
        {/* Soft Radial Backlights */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[900px] h-[750px] bg-radial from-blue-50/70 via-slate-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[35%] right-[5%] w-[650px] h-[650px] bg-radial from-indigo-50/40 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[65%] left-[5%] w-[700px] h-[700px] bg-radial from-emerald-50/35 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Ambient Integrated Artwork Texture (Radial Masked & Floating) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, -12, 0],
                  scale: [1, 1.015, 1],
                  opacity: [0.03, 0.045, 0.03]
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[800px] bg-no-repeat bg-contain bg-center opacity-[0.035] mix-blend-multiply"
          style={{
            backgroundImage: `url(${heroBgArtwork})`,
            maskImage: 'radial-gradient(ellipse 65% 55% at 50% 45%, black 25%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 45%, black 25%, transparent 75%)'
          }}
        />
      </motion.div>

      {/* LAYER 2: Global Background Watermark with Letter-by-Letter Reveal */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : watermarkY }}
        className="absolute top-24 left-0 right-0 flex justify-center items-center pointer-events-none"
      >
        <div
          className="font-mono font-black text-[120px] sm:text-[200px] md:text-[260px] lg:text-[320px] tracking-[0.14em] text-slate-900 select-none transition-opacity duration-1000 ease-in-out"
          style={{ opacity: watermarkOpacity }}
        >
          {letters.map((letter, idx) => (
            <span
              key={idx}
              className={`inline-block transition-all duration-500 ease-out ${
                idx < activeLetterCount
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              {letter}
            </span>
          ))}
        </div>
      </motion.div>

      {/* LAYER 3: Continuous SVG Data Network, Analytics Curves & Catchment Nodes */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : networkY }}
        className="absolute inset-0 w-full h-full"
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 3200"
        >
          <defs>
            {/* Fine Technical Analytics Grid Pattern */}
            <pattern
              id="fullPageAnalyticsGrid"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="#0f172a"
                strokeWidth="0.75"
                strokeOpacity="0.022"
              />
              <circle cx="64" cy="64" r="1" fill="#1e3a8a" fillOpacity="0.04" />
            </pattern>

            {/* Growth Curve Area Gradients */}
            <linearGradient id="growthAreaGradHero" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="growthAreaGradMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="growthLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="45%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="85%" stopColor="#1d4ed8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Full Grid Overlay */}
          <rect width="100%" height="100%" fill="url(#fullPageAnalyticsGrid)" />

          {/* ========================================================
              HERO SECTION ANALYTICS (Y: 100 - 650)
              ======================================================== */}
          {/* Subtle Upward Growth Spline Curve */}
          <path
            d="M 80 540 C 280 520, 440 460, 640 410 C 840 360, 1020 310, 1360 220 L 1360 620 L 80 620 Z"
            fill="url(#growthAreaGradHero)"
          />
          <motion.path
            d="M 80 540 C 280 520, 440 460, 640 410 C 840 360, 1020 310, 1360 220"
            fill="none"
            stroke="url(#growthLineGrad)"
            strokeWidth="2"
            strokeDasharray="8 6"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    strokeDashoffset: [0, -120]
                  }
            }
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />

          {/* Hero Section Faint Analytics Vertical Bar Charts */}
          {[
            { x: 180, baseH: 80, delay: 0 },
            { x: 205, baseH: 115, delay: 0.8 },
            { x: 230, baseH: 145, delay: 1.6 },
            { x: 1200, baseH: 95, delay: 0.4 },
            { x: 1230, baseH: 135, delay: 1.2 },
            { x: 1260, baseH: 170, delay: 2.0 }
          ].map((bar, idx) => (
            <motion.rect
              key={`hero-bar-${idx}`}
              x={bar.x}
              y={560 - bar.baseH}
              width="14"
              height={bar.baseH}
              rx="4"
              fill="#1e3a8a"
              fillOpacity="0.04"
              animate={
                shouldReduceMotion
                  ? { fillOpacity: 0.04 }
                  : {
                      fillOpacity: [0.03, 0.065, 0.03]
                    }
              }
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: bar.delay
              }}
            />
          ))}

          {/* ========================================================
              CONTINUOUS DATA STREAMING JOURNEY PATH (Hero -> Footer)
              ======================================================== */}
          {/* Main S-Curve Flow: Data -> Location -> Analysis -> Finance -> Risk -> Decision */}
          <path
            d="M 220 380 Q 420 580, 720 740 T 1220 1100 T 260 1600 T 1180 2150 T 520 2700"
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.25"
            strokeDasharray="6 8"
            strokeOpacity="0.18"
          />

          {/* Animated Travelling Pulse 1 along the Primary S-Curve Path */}
          <motion.circle
            cx={220}
            cy={380}
            r="4.5"
            fill="#2563eb"
            fillOpacity="0.45"
            animate={
              shouldReduceMotion
                ? { opacity: 0.3 }
                : {
                    cx: [220, 520, 880, 1220, 780, 260, 680, 1180, 850, 520],
                    cy: [380, 620, 840, 1100, 1380, 1600, 1900, 2150, 2450, 2700],
                    opacity: [0.2, 0.7, 0.3, 0.8, 0.3, 0.7, 0.3, 0.8, 0.3, 0.2]
                  }
            }
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          />

          {/* Animated Travelling Pulse 2 along Secondary Data Trail */}
          <motion.circle
            cx={1220}
            cy={1100}
            r="3.5"
            fill="#059669"
            fillOpacity="0.4"
            animate={
              shouldReduceMotion
                ? { opacity: 0.3 }
                : {
                    cx: [1220, 780, 260, 680, 1180, 850, 520, 220, 520, 880],
                    cy: [1100, 1380, 1600, 1900, 2150, 2450, 2700, 380, 620, 840],
                    opacity: [0.3, 0.7, 0.2, 0.8, 0.3, 0.7, 0.2, 0.6, 0.3, 0.7]
                  }
            }
            transition={{ duration: 28, repeat: Infinity, ease: 'linear', delay: 4 }}
          />

          {/* ========================================================
              INTERACTIVE GEOGRAPHIC CATCHMENT NODES & EXPANDING RINGS
              ======================================================== */}
          {/* Node 1: Village Hub Catchment (Hero Right) */}
          <g transform="translate(1120, 340)">
            <motion.circle
              cx="0"
              cy="0"
              r="34"
              fill="none"
              stroke="#2563eb"
              strokeWidth="1"
              strokeOpacity="0.14"
              animate={shouldReduceMotion ? { opacity: 0.14 } : { scale: [0.85, 1.4, 0.85], opacity: [0.15, 0.03, 0.15] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx="0"
              cy="0"
              r="18"
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.2"
              strokeOpacity="0.22"
              animate={shouldReduceMotion ? { opacity: 0.22 } : { scale: [1, 1.25, 1], opacity: [0.25, 0.08, 0.25] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <circle cx="0" cy="0" r="4.5" fill="#1e3a8a" fillOpacity="0.35" />
          </g>

          {/* Node 2: Dairy Cooperative Catchment (Capabilities Area) */}
          <g transform="translate(180, 960)">
            <motion.circle
              cx="0"
              cy="0"
              r="40"
              fill="none"
              stroke="#059669"
              strokeWidth="1"
              strokeOpacity="0.12"
              animate={shouldReduceMotion ? { opacity: 0.12 } : { scale: [0.9, 1.35, 0.9], opacity: [0.14, 0.02, 0.14] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx="0" cy="0" r="4" fill="#059669" fillOpacity="0.3" />
          </g>

          {/* Node 3: APMC Mandi Node (How It Works Area) */}
          <g transform="translate(1260, 1580)">
            <motion.circle
              cx="0"
              cy="0"
              r="36"
              fill="none"
              stroke="#d97706"
              strokeWidth="1"
              strokeOpacity="0.14"
              animate={shouldReduceMotion ? { opacity: 0.14 } : { scale: [0.88, 1.3, 0.88], opacity: [0.16, 0.03, 0.16] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
            <circle cx="0" cy="0" r="4.5" fill="#d97706" fillOpacity="0.32" />
          </g>

          {/* Node 4: Credit Guarantee Hub (Evidence Principles Area) */}
          <g transform="translate(220, 2240)">
            <motion.circle
              cx="0"
              cy="0"
              r="38"
              fill="none"
              stroke="#2563eb"
              strokeWidth="1"
              strokeOpacity="0.16"
              animate={shouldReduceMotion ? { opacity: 0.16 } : { scale: [0.9, 1.38, 0.9], opacity: [0.18, 0.04, 0.18] }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <circle cx="0" cy="0" r="4.5" fill="#1e3a8a" fillOpacity="0.35" />
          </g>

          {/* ========================================================
              SECTION-SPECIFIC BACKGROUND GRAPHS & INTERCONNECTS
              ======================================================== */}
          {/* Capabilities Area Secondary Curve */}
          <path
            d="M 60 1180 C 380 1140, 720 1260, 1380 1120"
            fill="none"
            stroke="#059669"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.15"
          />

          {/* Evidence Principles Area Wave */}
          <path
            d="M 80 2360 C 440 2280, 880 2420, 1380 2320"
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.2"
            strokeDasharray="5 7"
            strokeOpacity="0.16"
          />
        </svg>
      </motion.div>

      {/* LAYER 4: Floating Micro Financial Signals & Subtle Business Geometry (Hidden on Mobile) */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : floatIconsY }}
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Floating Financial Signals */}
        {[
          { label: '₹', top: '14%', left: '8%', delay: 0, size: 'text-2xl', op: 'opacity-15' },
          { label: '%', top: '22%', right: '12%', delay: 1.2, size: 'text-xl', op: 'opacity-12' },
          { label: '↗', top: '29%', left: '16%', delay: 2.4, size: 'text-2xl', op: 'opacity-16' },
          { label: '+', top: '38%', right: '8%', delay: 0.8, size: 'text-xl', op: 'opacity-15' },
          { label: '▲ DSCR 2.3x', top: '18%', right: '22%', delay: 1.8, size: 'text-[11px] font-mono font-bold', op: 'opacity-20' },
          { label: '₹', top: '48%', left: '10%', delay: 1.5, size: 'text-2xl', op: 'opacity-12' },
          { label: '10% Margin', top: '56%', right: '14%', delay: 2.2, size: 'text-[10px] font-mono font-bold', op: 'opacity-18' },
          { label: '↗', top: '68%', left: '12%', delay: 0.5, size: 'text-2xl', op: 'opacity-14' },
          { label: '%', top: '78%', right: '10%', delay: 1.9, size: 'text-xl', op: 'opacity-12' },
          { label: '✓ Verified', top: '84%', left: '18%', delay: 2.6, size: 'text-[10px] font-mono font-bold', op: 'opacity-20' },
          { label: '₹', top: '92%', right: '15%', delay: 1.1, size: 'text-2xl', op: 'opacity-14' }
        ].map((item, idx) => (
          <motion.div
            key={`float-signal-${idx}`}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [0, -14, 0],
                    opacity: [0.12, 0.22, 0.12]
                  }
            }
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: item.delay
            }}
            className={`absolute font-black text-slate-800 select-none ${item.size} ${item.op}`}
            style={{
              top: item.top,
              left: (item as any).left,
              right: (item as any).right
            }}
          >
            {item.label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
