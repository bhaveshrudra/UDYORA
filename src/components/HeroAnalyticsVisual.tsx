import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import heroBgGraphic from '../assets/images/udyora_hero_bg_1787681305322.jpg';

interface HeroAnalyticsVisualProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export function HeroAnalyticsVisual({ containerRef }: HeroAnalyticsVisualProps) {
  const shouldReduceMotion = useReducedMotion();
  const letters = ['U', 'D', 'Y', 'O', 'R', 'A'];
  const [activeStep, setActiveStep] = useState(0); // 0 to 6
  const [isCycleFading, setIsCycleFading] = useState(false);

  // Parallax layers linked to page scroll
  const { scrollY } = useScroll();
  const deepParallaxY = useTransform(scrollY, [0, 800], [0, 45]);
  const midParallaxY = useTransform(scrollY, [0, 800], [0, 95]);
  const floatParallaxY = useTransform(scrollY, [0, 800], [0, 130]);

  // Letter-by-letter watermark typing cycle
  useEffect(() => {
    if (shouldReduceMotion) {
      setActiveStep(letters.length);
      setIsCycleFading(false);
      return;
    }

    let timer: NodeJS.Timeout;

    if (!isCycleFading) {
      if (activeStep < letters.length) {
        timer = setTimeout(() => {
          setActiveStep((prev) => prev + 1);
        }, 320);
      } else {
        // Complete word "UDYORA" revealed — hold for 2.8 seconds
        timer = setTimeout(() => {
          setIsCycleFading(true);
        }, 2800);
      }
    } else {
      timer = setTimeout(() => {
        setActiveStep(0);
        setIsCycleFading(false);
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [activeStep, isCycleFading, shouldReduceMotion, letters.length]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none flex items-center justify-center z-0"
    >
      {/* =========================================================================
          LAYER 1 (DEEP BACKGROUND): Integrated subtle artwork & radial ambient glow
          ========================================================================= */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : deepParallaxY }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-full max-w-6xl h-[380px] sm:h-[480px] md:h-[560px] flex items-center justify-center">
          {/* Faint soft ambient radial light */}
          <div className="absolute inset-0 bg-radial from-blue-100/35 via-blue-50/15 to-transparent opacity-80 pointer-events-none" />

          {/* Integrated subtle uploaded artwork with breathing float */}
          <motion.img
            src={heroBgGraphic}
            alt=""
            referrerPolicy="no-referrer"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: [-4, 4, -4],
                    opacity: [0.03, 0.045, 0.03],
                  }
            }
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-full h-full object-contain object-center opacity-[0.035] sm:opacity-[0.045] mix-blend-multiply filter contrast-125 select-none"
            style={{
              maskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 35%, transparent 92%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 35%, transparent 92%)',
            }}
          />
        </div>
      </motion.div>

      {/* =========================================================================
          LAYER 2 (BACKGROUND WATERMARK): Animated sequential letter reveal U-D-Y-O-R-A
          ========================================================================= */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : deepParallaxY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 flex flex-col items-center justify-center text-center"
      >
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
                    ? { opacity: 0.038, y: 0, scale: 1 }
                    : isVisible
                    ? {
                        opacity: 0.042,
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
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="font-mono font-black text-[56px] sm:text-[100px] md:text-[140px] lg:text-[172px] xl:text-[192px] text-blue-950 tracking-[0.08em] sm:tracking-[0.12em] leading-none inline-block origin-center"
              >
                {letter}
              </motion.span>
            );
          })}
        </div>

        {/* Supporting lettermark tagline echo */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.03 }
              : activeStep >= letters.length && !isCycleFading
              ? { opacity: 0.038, y: 0 }
              : { opacity: 0, y: 4 }
          }
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mt-2 text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.3em] sm:tracking-[0.45em] uppercase text-blue-950 font-sans hidden sm:block"
        >
          Hyper-Local Business Intelligence
        </motion.div>
      </motion.div>

      {/* =========================================================================
          LAYER 3 (MIDGROUND): Abstract Business Intelligence & Network Visuals
          ========================================================================= */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : midParallaxY }}
        className="absolute inset-0 w-full h-full flex items-center justify-center"
      >
        <svg
          className="w-full h-full max-w-7xl mx-auto"
          viewBox="0 0 1200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft linear gradient for analytics growth line */}
            <linearGradient id="growthLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#1d4ed8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
            </linearGradient>

            {/* Faint area gradient below growth curve */}
            <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>

            {/* Subtle Grid Pattern */}
            <pattern id="faintAnalyticsGrid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.5" strokeOpacity="0.035" />
              <circle cx="0" cy="0" r="0.75" fill="#3b82f6" fillOpacity="0.06" />
            </pattern>
          </defs>

          {/* 1. Light Geometry Data Grid */}
          <rect width="1200" height="600" fill="url(#faintAnalyticsGrid)" />

          {/* 2. Upward Trending Analytics Curve with Area Fill */}
          <g opacity="0.85">
            {/* Area Fill */}
            <motion.path
              d="M 60 480 Q 240 450, 420 380 T 780 260 T 1140 140 L 1140 520 L 60 520 Z"
              fill="url(#growthAreaGradient)"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      opacity: [0.3, 0.7, 0.3],
                    }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Animated Upward Growth Spline Line */}
            <motion.path
              d="M 60 480 Q 240 450, 420 380 T 780 260 T 1140 140"
              fill="none"
              stroke="url(#growthLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="8 6"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      strokeDashoffset: [0, -140],
                    }
              }
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Secondary Smooth Benchmark Line */}
            <path
              d="M 80 500 C 300 480, 600 360, 1120 200"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
              strokeOpacity="0.12"
              strokeDasharray="4 4"
            />
          </g>

          {/* 3. Subtle Background Analytics Bar Chart (Bottom-Left to Center) */}
          <g opacity="0.6" className="hidden sm:block">
            {[
              { x: 120, h: 45 },
              { x: 145, h: 65 },
              { x: 170, h: 50 },
              { x: 195, h: 80 },
              { x: 220, h: 95 },
              { x: 245, h: 115 },
            ].map((bar, idx) => (
              <rect
                key={idx}
                x={bar.x}
                y={520 - bar.h}
                width={14}
                height={bar.h}
                rx={3}
                fill="#1e3a8a"
                fillOpacity={0.045}
              />
            ))}
          </g>

          {/* 4. Location Intelligence & Geographic Network Nodes */}
          {/* Node 1: Village Hub (Left) */}
          <g transform="translate(240, 220)">
            <motion.g
              initial={{ scale: 0.8, opacity: 0.2 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.15 }
                  : {
                      scale: [0.75, 1.25, 0.75],
                      opacity: [0.2, 0.04, 0.2]
                    }
              }
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <circle
                cx={0}
                cy={0}
                r={24}
                fill="#3b82f6"
                fillOpacity={0.025}
                stroke="#3b82f6"
                strokeWidth={0.75}
                strokeOpacity={0.15}
              />
            </motion.g>
            <circle cx={0} cy={0} r={3.5} fill="#1d4ed8" fillOpacity={0.25} />
            <circle cx={0} cy={0} r={1.5} fill="#ffffff" fillOpacity={0.9} />
          </g>

          {/* Node 2: Weekly Haat / Market Node (Top Right) */}
          <g transform="translate(980, 180)">
            <motion.g
              initial={{ scale: 0.8, opacity: 0.25 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.18 }
                  : {
                      scale: [0.75, 1.25, 0.75],
                      opacity: [0.25, 0.05, 0.25]
                    }
              }
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <circle
                cx={0}
                cy={0}
                r={30}
                fill="#059669"
                fillOpacity={0.02}
                stroke="#059669"
                strokeWidth={0.75}
                strokeOpacity={0.18}
              />
            </motion.g>
            <circle cx={0} cy={0} r={4} fill="#059669" fillOpacity={0.3} />
            <circle cx={0} cy={0} r={1.5} fill="#ffffff" fillOpacity={0.9} />
          </g>

          {/* Node 3: Dairy Cooperative Node (Center Right) */}
          <g transform="translate(760, 320)">
            <motion.g
              initial={{ scale: 0.8, opacity: 0.18 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 0.15 }
                  : {
                      scale: [0.75, 1.3, 0.75],
                      opacity: [0.18, 0.03, 0.18]
                    }
              }
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              <circle
                cx={0}
                cy={0}
                r={20}
                fill="#6366f1"
                fillOpacity={0.03}
                stroke="#6366f1"
                strokeWidth={0.75}
                strokeOpacity={0.15}
              />
            </motion.g>
            <circle cx={0} cy={0} r={3} fill="#6366f1" fillOpacity={0.25} />
            <circle cx={0} cy={0} r={1.2} fill="#ffffff" fillOpacity={0.8} />
          </g>

          {/* Dotted Interconnecting Network Routes */}
          <motion.path
            d="M 240 220 L 480 290 L 760 320 L 980 180"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeOpacity="0.12"
            strokeDasharray="4 6"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    strokeDashoffset: [0, -40],
                  }
            }
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <path
            d="M 240 220 L 320 380 L 760 320"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.75"
            strokeOpacity="0.08"
            strokeDasharray="3 5"
          />

          {/* Small Secondary Network Data Points */}
          <circle cx="480" cy="290" r="2.5" fill="#3b82f6" fillOpacity="0.18" />
          <circle cx="320" cy="380" r="2" fill="#64748b" fillOpacity="0.15" />
          <circle cx="890" cy="420" r="2.5" fill="#059669" fillOpacity="0.15" />
          <circle cx="160" cy="140" r="2" fill="#3b82f6" fillOpacity="0.15" />
          <circle cx="1060" cy="340" r="2.5" fill="#3b82f6" fillOpacity="0.15" />
        </svg>
      </motion.div>

      {/* =========================================================================
          LAYER 4 (FLOAT): Subtle Floating Financial Signals (₹, %, ↗, +, ▲)
          ========================================================================= */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : floatParallaxY }}
        className="absolute inset-0 max-w-6xl mx-auto w-full h-full pointer-events-none"
      >
        {/* Signal 1: ₹ (Rupee Symbol - Top Left) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.05 }
              : {
                  y: [-6, 6, -6],
                  opacity: [0.04, 0.075, 0.04],
                }
          }
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[18%] left-[8%] sm:left-[12%] text-2xl sm:text-3xl font-black text-blue-900 font-mono"
        >
          ₹
        </motion.div>

        {/* Signal 2: % (Percentage / Subsidy Symbol - Bottom Left) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.04 }
              : {
                  y: [5, -7, 5],
                  opacity: [0.035, 0.065, 0.035],
                }
          }
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-[22%] left-[16%] text-xl sm:text-2xl font-bold text-emerald-900 font-mono hidden sm:block"
        >
          %
        </motion.div>

        {/* Signal 3: ↗ (Growth Arrow - Top Right) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.06 }
              : {
                  y: [-8, 4, -8],
                  x: [0, 4, 0],
                  opacity: [0.04, 0.08, 0.04],
                }
          }
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-[20%] right-[10%] sm:right-[14%] text-2xl sm:text-3xl font-bold text-blue-900"
        >
          ↗
        </motion.div>

        {/* Signal 4: + (Additive Metric - Center Right) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.04 }
              : {
                  y: [4, -6, 4],
                  opacity: [0.03, 0.06, 0.03],
                }
          }
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[52%] right-[8%] sm:right-[18%] text-lg sm:text-xl font-bold text-slate-700 font-mono hidden sm:block"
        >
          +
        </motion.div>

        {/* Signal 5: DSCR Indicator (Bottom Right) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? { opacity: 0.04 }
              : {
                  y: [-4, 6, -4],
                  opacity: [0.035, 0.06, 0.035],
                }
          }
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-[20%] right-[12%] text-xs font-mono font-bold tracking-wider text-blue-950 hidden md:block"
        >
          ▲ DSCR 2.3x
        </motion.div>
      </motion.div>
    </div>
  );
}
