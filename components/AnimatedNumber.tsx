'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({ value, prefix = '', suffix = '', className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 90, damping: 20 });
  const [displayValue, setDisplayValue] = useState(`${prefix}${value.toLocaleString()}${suffix}`);

  useEffect(() => {
    motionValue.set(value);
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(`${prefix}${Math.round(latest).toLocaleString()}${suffix}`);
    });

    return () => unsubscribe();
  }, [value, prefix, suffix, motionValue, springValue]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}
