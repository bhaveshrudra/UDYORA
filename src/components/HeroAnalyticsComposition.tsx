import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  TrendingUp,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Bot,
  ArrowUpRight
} from 'lucide-react';

export const HeroAnalyticsComposition: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto select-none">
      {/* Ambient Radial Backlight Glow */}
      <div className="absolute -inset-4 bg-radial from-blue-100/60 via-indigo-50/30 to-transparent rounded-3xl blur-2xl pointer-events-none" />

      {/* Decorative Corner Sparkles & Nodes */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-600 shadow-xs pointer-events-none"
      >
        <Sparkles className="w-3.5 h-3.5" />
      </motion.div>

      <div className="relative z-10 space-y-4">
        {/* =========================================================================
            1. MAIN ANALYTICS DASHBOARD CARD
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-5 sm:p-6 space-y-4 relative overflow-hidden"
        >
          {/* Card Top Accent Line with Gradient Animation */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 origin-left"
          />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
                U
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>Enterprise Intelligence Suite</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Hyper-Local Rural Market Analytics
                </p>
              </div>
            </div>

            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Agent Live</span>
            </motion.span>
          </div>

          {/* Mini Revenue / Demand Growth Spline Chart */}
          <div className="space-y-1.5 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Unit Economics & Revenue Curve</span>
              </span>
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="font-mono font-bold text-emerald-700 flex items-center text-[11px]"
              >
                <ArrowUpRight className="w-3 h-3" />
                <span>+28.4% Net Yield</span>
              </motion.span>
            </div>

            {/* SVG Interactive Line Spline with Progressive Stroke Animation */}
            <div className="w-full h-24 pt-1">
              <svg viewBox="0 0 320 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="heroSplineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="heroLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="320" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="320" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Area Fill */}
                <motion.path
                  d="M 10 70 C 60 65, 110 52, 160 38 C 210 24, 260 18, 310 8 L 310 75 L 10 75 Z"
                  fill="url(#heroSplineGrad)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.0, delay: 0.8 }}
                />

                {/* Growth Stroke Line - Draws Smoothly from Left to Right */}
                <motion.path
                  d="M 10 70 C 60 65, 110 52, 160 38 C 210 24, 260 18, 310 8"
                  fill="none"
                  stroke="url(#heroLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 1.3, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Sequential Staggered Data Points Pop */}
                {[
                  { cx: 10, cy: 70, delay: 0.75 },
                  { cx: 110, cy: 52, delay: 1.0 },
                  { cx: 210, cy: 24, delay: 1.25 },
                  { cx: 310, cy: 8, delay: 1.5 }
                ].map((pt, idx) => (
                  <motion.circle
                    key={idx}
                    cx={pt.cx}
                    cy={pt.cy}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.4,
                      delay: shouldReduceMotion ? 0 : pt.delay,
                      type: 'spring',
                      stiffness: 300,
                      damping: 15
                    }}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Metric Capacity Comparison Bars Growing Upward/Across */}
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">Local Catchment Consumption</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="font-bold text-slate-900 font-mono"
              >
                88%
              </motion.span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '88%' }}
                transition={{ duration: shouldReduceMotion ? 0 : 1.0, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-emerald-600 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-600 font-medium">Cooperative Hub Off-take</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="font-bold text-slate-900 font-mono"
              >
                94%
              </motion.span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                transition={{ duration: shouldReduceMotion ? 0 : 1.0, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
          </div>

          {/* Quick Benchmark Footnotes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium"
          >
            <span className="flex items-center gap-1 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>DSCR 2.3x (Bank Viable)</span>
            </span>
            <span className="text-slate-400">10% Promoter Margin</span>
          </motion.div>
        </motion.div>

        {/* =========================================================================
            2. FLOATING CARD: AGENT INTELLIGENCE BUBBLE (TOP RIGHT)
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, x: 24, y: -10 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, x: 0, y: 0 }
              : {
                  opacity: 1,
                  x: 0,
                  y: [0, -6, 0]
                }
          }
          transition={{
            opacity: { duration: 0.6, delay: 1.1 },
            x: { duration: 0.6, delay: 1.1 },
            y: {
              duration: 5.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.7
            }
          }}
          className="absolute -top-6 -right-3 sm:-right-6 bg-slate-900 text-white rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-800 max-w-[240px] space-y-1 z-20"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              <Bot className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
              UDYORA Advisor
            </span>
          </div>
          <p className="text-[11px] text-slate-200 leading-snug font-medium">
            ₹1,00,000 equity supports ₹10,00,000 unit @ ₹19,124/mo EMI.
          </p>
        </motion.div>

        {/* =========================================================================
            3. FLOATING CARD: HYPER-LOCAL CATCHMENT PILL WITH RADAR PULSE (BOTTOM LEFT)
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, x: -24, y: 15 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, x: 0, y: 0 }
              : {
                  opacity: 1,
                  x: 0,
                  y: [0, 6, 0]
                }
          }
          transition={{
            opacity: { duration: 0.6, delay: 1.3 },
            x: { duration: 0.6, delay: 1.3 },
            y: {
              duration: 6.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.9
            }
          }}
          className="absolute -bottom-6 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-slate-200 max-w-[220px] space-y-1 z-20"
        >
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-3.5 w-3.5 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-70" />
              <MapPin className="relative w-3.5 h-3.5 text-blue-700" />
            </div>
            <span className="text-[11px] font-bold text-slate-900">
              Catchment Node
            </span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">
            4.5 km to Dairy Cooperative • Mandi 22 km
          </p>
          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 pt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified APMC Reference</span>
          </div>
        </motion.div>

        {/* =========================================================================
            4. FLOATING CARD: FINANCIAL / SCHEME BADGE (BOTTOM RIGHT)
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 1,
                  scale: [1, 1.04, 1]
                }
          }
          transition={{
            opacity: { duration: 0.5, delay: 1.5 },
            scale: {
              duration: 4.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2.0
            }
          }}
          className="absolute -bottom-3 right-4 bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 z-20"
        >
          <div className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
            <IndianRupee className="w-3 h-3" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-emerald-950 block leading-tight">
              PMEGP Eligible
            </span>
            <span className="text-[9px] font-semibold text-emerald-700">
              Up to 35% Subsidy
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
