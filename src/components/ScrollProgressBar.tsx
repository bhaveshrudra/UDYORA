import React from'react';
import { motion, useScroll, useSpring, useReducedMotion } from'motion/react';

export function ScrollProgressBar() {
 const shouldReduceMotion = useReducedMotion();
 const { scrollYProgress } = useScroll();
 const scaleX = useSpring(scrollYProgress, {
 stiffness: 100,
 damping: 30,
 restDelta: 0.001,
 });

 if (shouldReduceMotion) return null;

 return (
 <motion.div
 id="scroll-progress-bar"
 style={{ scaleX }}
 className="fixed top-0 left-0 right-0 h-[2.5px] bg-blue-700 origin-left z-50 pointer-events-none"
 />
 );
}
