import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export function BackgroundWatermark() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Extremely faint subtle geometric grid background */}
      <svg
        className="absolute inset-0 w-full h-full stroke-slate-200/40 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="gov-grid-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="0.75" />
            <circle cx="0" cy="0" r="0.85" fill="currentColor" className="text-slate-300/80" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gov-grid-pattern)" />
      </svg>

      {/* Very faint floating particle nodes for technological precision */}
      <div className="absolute inset-0">
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, -18, 0],
                  x: [0, 12, 0],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[18%] left-[15%] w-1.5 h-1.5 rounded-full bg-blue-700/10"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, 24, 0],
                  x: [0, -16, 0],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-slate-800/10"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, -20, 0],
                  x: [0, -10, 0],
                }
          }
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute top-[65%] left-[25%] w-1.5 h-1.5 rounded-full bg-blue-700/10"
        />
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, 20, 0],
                  x: [0, 14, 0],
                }
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
          className="absolute top-[80%] right-[15%] w-1.5 h-1.5 rounded-full bg-slate-800/10"
        />
      </div>
    </div>
  );
}
