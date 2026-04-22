'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

interface CoinBurstProps {
  visible: boolean;
  onComplete?: () => void;
}

const coinOffsets = [-28, -18, -8, 0, 8, 18, 28];

export default function CoinBurst({ visible, onComplete }: CoinBurstProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      onComplete?.();
    }, 900);
    return () => window.clearTimeout(timer);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          {coinOffsets.map((offset, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
              animate={{
                opacity: [1, 1, 0],
                y: [-5, -90 - index * 6],
                x: [0, offset],
                scale: [1, 1.2, 0.8],
              }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.04 }}
              className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 text-sm font-bold text-navy shadow-[0_12px_30px_rgba(255,215,0,0.25)]"
            >
              ₩
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
