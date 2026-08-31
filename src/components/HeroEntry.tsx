import React, { useEffect, useState, useRef, useCallback } from'react';

/**
 * HeroEntry — UDYORA Signature Full-Screen Entry Animation
 *
 * A dedicated full-screen entry experience that plays on fresh page loads.
 * Shows a clean white screen with the UDYORA letters animating one by one,
 * followed by the tagline, then smoothly transitions out.
 *
 * Flow:
 * White screen → U → UD → UDY → UDYO → UDYOR → UDYORA
 * → hold → tagline → subtitle → transition out → onComplete()
 */

interface HeroEntryProps {
 onComplete: () => void;
}

const LETTERS = ['U','D','Y','O','R','A'] as const;

// Timing constants (ms)
const LETTER_INITIAL_DELAY = 400;
const LETTER_STAGGER = 350;
const HOLD_AFTER_WORD = 1500;
const TAGLINE_FADE_IN = 600;
const SUBTITLE_DELAY = 500;
const HOLD_AFTER_TAGLINE = 1200;
const EXIT_DURATION = 650;

type Phase =
 |'letters' // Animating letters one by one
 |'hold' // Full word visible, holding
 |'tagline' // Tagline fading in
 |'subtitle' // Subtitle fading in
 |'holdFinal' // Holding the complete view
 |'exiting' // Transition out
 |'done'; // Complete

export const HeroEntry: React.FC<HeroEntryProps> = ({ onComplete }) => {
 const [visibleCount, setVisibleCount] = useState(0);
 const [phase, setPhase] = useState<Phase>('letters');
 const mountedRef = useRef(true);
 const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

 // Check prefers-reduced-motion
 const prefersReduced = useRef(
 typeof window !=='undefined'
 ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
 : false
 );

 const schedule = useCallback((fn: () => void, ms: number) => {
 const id = setTimeout(() => {
 if (mountedRef.current) fn();
 }, ms);
 timersRef.current.push(id);
 }, []);

 useEffect(() => {
 mountedRef.current = true;

 // Reduced motion: show everything immediately, then exit after a brief pause
 if (prefersReduced.current) {
 setVisibleCount(LETTERS.length);
 setPhase('tagline');
 schedule(() => {
 setPhase('subtitle');
 }, 400);
 schedule(() => {
 setPhase('exiting');
 }, 1500);
 schedule(() => {
 setPhase('done');
 onComplete();
 }, 2200);
 return () => {
 mountedRef.current = false;
 timersRef.current.forEach(clearTimeout);
 };
 }

 let t = 0;

 // Phase 1: Letter-by-letter reveal
 for (let i = 0; i < LETTERS.length; i++) {
 const delay = LETTER_INITIAL_DELAY + i * LETTER_STAGGER;
 schedule(() => setVisibleCount(i + 1), delay);
 t = delay;
 }

 // Phase 2: Hold the complete word
 t += HOLD_AFTER_WORD;
 schedule(() => setPhase('hold'), t - HOLD_AFTER_WORD + 200);
 schedule(() => setPhase('tagline'), t);

 // Phase 3: Tagline visible
 t += TAGLINE_FADE_IN + SUBTITLE_DELAY;
 schedule(() => setPhase('subtitle'), t);

 // Phase 4: Hold final composition
 t += HOLD_AFTER_TAGLINE;
 schedule(() => setPhase('exiting'), t);

 // Phase 5: Exit
 t += EXIT_DURATION;
 schedule(() => {
 setPhase('done');
 onComplete();
 }, t);

 return () => {
 mountedRef.current = false;
 timersRef.current.forEach(clearTimeout);
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Don't render anything after done
 if (phase ==='done') return null;

 const showTagline = phase ==='tagline' || phase ==='subtitle' || phase ==='holdFinal' || phase ==='exiting';
 const showSubtitle = phase ==='subtitle' || phase ==='holdFinal' || phase ==='exiting';
 const isExiting = phase ==='exiting';

 return (
 <div
 style={{
 position:'fixed',
 inset: 0,
 zIndex: 9999,
 backgroundColor:'#ffffff',
 display:'flex',
 flexDirection:'column',
 alignItems:'center',
 justifyContent:'center',
 overflow:'hidden',
 opacity: isExiting ? 0 : 1,
 transform: isExiting ?'translateY(-20px)' :'translateY(0)',
 transition:`opacity ${EXIT_DURATION}ms ease-in-out, transform ${EXIT_DURATION}ms ease-in-out`,
 }}
 >
 {/* Subtle background grid pattern */}
 <div
 style={{
 position:'absolute',
 inset: 0,
 backgroundImage:'radial-gradient(#94a3b8 0.5px, transparent 0.5px)',
 backgroundSize:'24px 24px',
 opacity: 0.04,
 pointerEvents:'none',
 }}
 />

 {/* Very subtle top accent gradient */}
 <div
 style={{
 position:'absolute',
 top: 0,
 left:'50%',
 transform:'translateX(-50%)',
 width:'500px',
 height:'250px',
 background:'radial-gradient(ellipse at center, rgba(37,99,235,0.04) 0%, transparent 70%)',
 pointerEvents:'none',
 }}
 />

 {/* Center content */}
 <div
 style={{
 position:'relative',
 zIndex: 1,
 display:'flex',
 flexDirection:'column',
 alignItems:'center',
 justifyContent:'center',
 padding:'0 24px',
 maxWidth:'100%',
 }}
 >
 {/* UDYORA Logo Mark */}
 <div
 style={{
 width: 48,
 height: 48,
 borderRadius: 14,
 backgroundColor:'#0f172a',
 display:'flex',
 alignItems:'center',
 justifyContent:'center',
 color:'#ffffff',
 fontWeight: 900,
 fontSize: 20,
 marginBottom: 28,
 opacity: visibleCount > 0 ? 1 : 0,
 transform: visibleCount > 0 ?'scale(1)' :'scale(0.8)',
 transition:'opacity 500ms ease-out, transform 500ms ease-out',
 boxShadow:'0 1px 3px rgba(0,0,0,0.1)',
 }}
 >
 U
 </div>

 {/* Letter-by-letter UDYORA */}
 <div
 style={{
 display:'flex',
 alignItems:'center',
 justifyContent:'center',
 whiteSpace:'nowrap',
 }}
 >
 {LETTERS.map((char, index) => {
 const isVisible = index < visibleCount;
 return (
 <span
 key={char}
 data-letter={char}
 style={{
 display:'inline-block',
 fontSize:'clamp(44px, 12vw, 88px)',
 fontWeight: 900,
 color:'#0f172a',
 letterSpacing:'-0.03em',
 lineHeight: 1,
 opacity: isVisible ? 1 : 0,
 transform: isVisible
 ?'translateY(0px) scale(1)'
 :'translateY(15px) scale(0.96)',
 transition:'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
 }}
 >
 {char}
 </span>
 );
 })}
 </div>

 {/* Tagline */}
 <p
 style={{
 marginTop: 20,
 fontSize:'clamp(13px, 2.2vw, 17px)',
 fontWeight: 600,
 color:'#334155',
 textAlign:'center',
 letterSpacing:'-0.01em',
 lineHeight: 1.5,
 maxWidth: 480,
 opacity: showTagline ? 1 : 0,
 transform: showTagline ?'translateY(0px)' :'translateY(10px)',
 transition:`opacity ${TAGLINE_FADE_IN}ms ease-out, transform ${TAGLINE_FADE_IN}ms ease-out`,
 }}
 >
 Hyper-Local Business Intelligence
 <br />
 for Rural Entrepreneurs
 </p>

 {/* Subtitle */}
 <p
 style={{
 marginTop: 12,
 fontSize:'clamp(10px, 1.5vw, 12px)',
 fontWeight: 500,
 color:'#94a3b8',
 textAlign:'center',
 letterSpacing:'0.03em',
 opacity: showSubtitle ? 1 : 0,
 transform: showSubtitle ?'translateY(0px)' :'translateY(8px)',
 transition:'opacity 500ms ease-out, transform 500ms ease-out',
 }}
 >
 Business intelligence &nbsp;•&nbsp; Financial planning &nbsp;•&nbsp; Evidence-backed guidance
 </p>
 </div>
 </div>
 );
};
