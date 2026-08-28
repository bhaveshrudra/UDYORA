import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  TrendingUp,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Bot,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

/**
 * HeroAnalyticsComposition — Refined Right-Side Visual for Landing Hero
 *
 * Features:
 * - One unified, balanced business-intelligence composition
 * - Centered main dashboard panel occupying ~80-85% width
 * - 3 tightly attached floating cards (Top-Right Advisor, Bottom-Left Catchment, Bottom-Right Scheme)
 * - Cohesive professional styling, subtle shadows, no clipping or erratic floating
 * - Perfectly vertically centered relative to hero content
 */
export const HeroAnalyticsComposition: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-[480px] lg:max-w-[500px] mx-auto py-6 px-3 sm:px-5 select-none">
      {/* 1. Subtle Ambient Backlight Glow (Tied to composition) */}
      <div className="absolute inset-2 bg-gradient-to-tr from-blue-100/30 via-indigo-50/20 to-emerald-50/20 rounded-3xl blur-2xl pointer-events-none" />

      {/* 2. Single Subtle Connecting Geometry */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30 overflow-visible"
        viewBox="0 0 500 400"
        fill="none"
      >
        <path
          d="M 50 340 C 120 340, 180 300, 260 200 C 340 100, 420 70, 470 60"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {/* 3. Main Dashboard Wrapper */}
      <div className="relative">
        {/* =========================================================================
            MAIN DASHBOARD PANEL (80-85% Visual Core)
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 overflow-hidden"
        >
          {/* Card Top Accent Indicator Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
                U
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>Local Enterprise Assessment</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  Commercial Dairy • Khed Shivapur
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Score: 86 / 100</span>
            </span>
          </div>

          {/* Mini Revenue / Yield Spline Chart */}
          <div className="space-y-1 bg-slate-50/80 rounded-xl p-3 border border-slate-100/90">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Unit Economics & Revenue Curve</span>
              </span>
              <span className="font-mono font-bold text-emerald-700 flex items-center text-[11px]">
                <ArrowUpRight className="w-3 h-3" />
                <span>+28.4% Net Yield</span>
              </span>
            </div>

            {/* SVG Spline Chart */}
            <div className="w-full h-20 pt-0.5">
              <svg viewBox="0 0 320 70" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="heroSplineGradNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="heroLineGradNew" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="60%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="18" x2="320" y2="18" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2="320" y2="45" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Area Fill */}
                <path
                  d="M 10 60 C 60 55, 110 44, 160 32 C 210 20, 260 14, 310 6 L 310 65 L 10 65 Z"
                  fill="url(#heroSplineGradNew)"
                />

                {/* Growth Stroke Line */}
                <motion.path
                  d="M 10 60 C 60 55, 110 44, 160 32 C 210 20, 260 14, 310 6"
                  fill="none"
                  stroke="url(#heroLineGradNew)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Data Points */}
                {[
                  { x: 10, y: 60 },
                  { x: 110, y: 44 },
                  { x: 210, y: 20 },
                  { x: 310, y: 6 }
                ].map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={3}
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth={1.8}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Dual Metrics Row */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div className="bg-slate-50/60 rounded-lg p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-medium block">Promoter Margin (10%)</span>
              <span className="text-xs font-black text-slate-900 font-mono">₹1,00,000</span>
            </div>
            <div className="bg-slate-50/60 rounded-lg p-2 border border-slate-100">
              <span className="text-[10px] text-slate-500 font-medium block">Bank Loan Financing</span>
              <span className="text-xs font-black text-blue-900 font-mono">₹9,00,000</span>
            </div>
          </div>

          {/* Quick Benchmark Footnotes */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>DSCR 2.3x (Viable)</span>
            </span>
            <span className="text-slate-500 font-mono">Est. EMI: ₹19,680/mo</span>
          </div>
        </motion.div>

        {/* =========================================================================
            1. FLOATING CARD: TOP-RIGHT (ADVISOR INSIGHT)
            Partially overlaps top-right of panel, compact & fully visible
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -top-3.5 -right-2 sm:-top-4 sm:-right-4 z-20 bg-slate-900 text-white rounded-xl p-2.5 sm:p-3 shadow-lg border border-slate-800 max-w-[210px] sm:max-w-[230px] space-y-0.5"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
              <Bot className="w-2.5 h-2.5" />
            </div>
            <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider">
              UDYORA Advisor
            </span>
          </div>
          <p className="text-[10px] text-slate-200 leading-snug font-medium">
            ₹1,00,000 equity supports ₹10,00,000 unit with 35% subsidy match.
          </p>
        </motion.div>

        {/* =========================================================================
            2. FLOATING CARD: BOTTOM-LEFT (LOCATION / CATCHMENT NODE)
            Partially overlaps lower-left of panel, aligned to lower third
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -bottom-3.5 -left-2 sm:-bottom-4 sm:-left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 shadow-lg border border-slate-200 max-w-[190px] sm:max-w-[210px] space-y-0.5"
        >
          <div className="flex items-center gap-1.5">
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
              <MapPin className="relative w-3 h-3 text-blue-700" />
            </div>
            <span className="text-[10px] font-bold text-slate-900">
              Catchment Node
            </span>
          </div>
          <p className="text-[9.5px] text-slate-600 font-medium leading-tight">
            4.5 km to Dairy Co-op • Mandi 22 km
          </p>
          <div className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-700 pt-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Verified Census Location</span>
          </div>
        </motion.div>

        {/* =========================================================================
            3. FLOATING CARD: BOTTOM-RIGHT (SCHEME INDICATOR BADGE)
            Close to panel lower-right edge
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -bottom-2 right-2 sm:right-4 z-20 bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1.5 shadow-md flex items-center gap-1.5"
        >
          <div className="w-4 h-4 rounded bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px]">
            <IndianRupee className="w-2.5 h-2.5" />
          </div>
          <div>
            <span className="text-[9.5px] font-extrabold text-emerald-950 block leading-tight">
              PMEGP Eligible
            </span>
            <span className="text-[8.5px] font-semibold text-emerald-700 block leading-none">
              Up to 35% Subsidy
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
