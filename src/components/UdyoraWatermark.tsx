import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * UDYORA Signature Watermark — Letter-by-Letter Animation
 *
 * Renders 6 individual <span> elements: U D Y O R A
 * Animates them sequentially with 350ms between each letter.
 * Each letter: opacity 0 → 0.06, translateY(10px) → 0, scale(0.97) → 1
 * After full word: hold 2.5s → fade out 1s → wait 1s → restart
 *
 * Zero dependencies on API, language, scroll, agents, or backend.
 * Starts immediately on mount.
 */

const LETTERS = ['U', 'D', 'Y', 'O', 'R', 'A'] as const;
const LETTER_DELAY_MS = 350;
const INITIAL_DELAY_MS = 100;
const HOLD_DURATION_MS = 2500;
const FADE_DURATION_MS = 1000;
const RESTART_PAUSE_MS = 1000;

// The target opacity for each visible letter — visible but not competing with hero text
const LETTER_VISIBLE_OPACITY = 0.07;

export const UdyoraWatermark: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState<'revealing' | 'holding' | 'fading' | 'paused'>('revealing');
  const mountedRef = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      if (mountedRef.current) fn();
    }, ms);
    timersRef.current.push(id);
  }, []);

  const runCycle = useCallback(() => {
    clearAllTimers();
    setVisibleCount(0);
    setPhase('revealing');

    console.log('[UDYORA WATERMARK] ▶ Cycle started');

    // Step through letters: U → UD → UDY → UDYO → UDYOR → UDYORA
    for (let idx = 0; idx < LETTERS.length; idx++) {
      const delay = INITIAL_DELAY_MS + idx * LETTER_DELAY_MS;
      scheduleTimer(() => {
        setVisibleCount(idx + 1);
        console.log(
          `[UDYORA WATERMARK] Letter ${idx + 1}/6: ${LETTERS.slice(0, idx + 1).join('')}`
        );
      }, delay);
    }

    const revealDone = INITIAL_DELAY_MS + (LETTERS.length - 1) * LETTER_DELAY_MS;

    // Mark holding phase (all letters visible)
    scheduleTimer(() => {
      setPhase('holding');
      console.log('[UDYORA WATERMARK] ⏸ Holding full word...');
    }, revealDone);

    // Start fading out
    scheduleTimer(() => {
      setPhase('fading');
      console.log('[UDYORA WATERMARK] ⏬ Fading out...');
    }, revealDone + HOLD_DURATION_MS);

    // Paused (invisible)
    scheduleTimer(() => {
      setPhase('paused');
    }, revealDone + HOLD_DURATION_MS + FADE_DURATION_MS);

    // Restart entire cycle
    scheduleTimer(() => {
      if (mountedRef.current) runCycle();
    }, revealDone + HOLD_DURATION_MS + FADE_DURATION_MS + RESTART_PAUSE_MS);
  }, [clearAllTimers, scheduleTimer]);

  useEffect(() => {
    mountedRef.current = true;
    runCycle();
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine per-letter opacity based on phase
  const getLetterOpacity = (index: number): number => {
    if (phase === 'fading' || phase === 'paused') return 0;
    if (index < visibleCount) return LETTER_VISIBLE_OPACITY;
    return 0;
  };

  const getLetterTransform = (index: number): string => {
    if (index < visibleCount) return 'translateY(0px) scale(1)';
    return 'translateY(10px) scale(0.97)';
  };

  return (
    <div
      data-testid="udyora-watermark"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div
        data-testid="udyora-watermark-letters"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'clamp(100px, 18vw, 280px)',
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          whiteSpace: 'nowrap',
          color: '#0f172a',
        }}
      >
        {LETTERS.map((char, index) => (
          <span
            key={char}
            data-letter={char}
            data-visible={index < visibleCount ? 'true' : 'false'}
            style={{
              display: 'inline-block',
              opacity: getLetterOpacity(index),
              transform: getLetterTransform(index),
              transition:
                phase === 'fading'
                  ? `opacity ${FADE_DURATION_MS}ms ease-in-out, transform ${FADE_DURATION_MS}ms ease-in-out`
                  : 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};
