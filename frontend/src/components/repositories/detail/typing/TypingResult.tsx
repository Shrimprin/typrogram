'use client';

import type { Stats } from '@/types';

import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';

import { formatTime } from '@/utils/time';
import TypingLine from './TypingLine';

type TypingResultProps = {
  stats: Stats;
  targetTextLines: string[];
  typedTextLines: string[];
};

export default function TypingResult({ stats, targetTextLines, typedTextLines }: TypingResultProps) {
  const { accuracy, elapsedSeconds, totalTypoCount, wpm } = stats;

  useEffect(() => {
    const container = document.querySelector('#typing-result-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const totalCharacters = useMemo(() => {
    return targetTextLines.reduce((total, line) => total + line.length, 0);
  }, [targetTextLines]);

  const statItems = [
    { label: 'WPM', value: wpm.toFixed(1) },
    { label: 'Accuracy', value: `${accuracy} %` },
    { label: 'Characters', value: totalCharacters.toLocaleString() },
    { label: 'Typos', value: totalTypoCount },
    { label: 'Time', value: formatTime(elapsedSeconds) },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] },
  };

  return (
    <div className="h-full overflow-y-auto" id="typing-result-container">
      <div className="flex flex-col gap-4 p-4">
        <motion.h2 className="text-xl font-bold" {...fadeInUp} transition={{ duration: 0.5, delay: 0.1 }}>
          Results
        </motion.h2>

        <motion.dl
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-3
            lg:grid-cols-5
          `}
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
        >
          {statItems.map((item, index) => (
            <motion.div key={index} className="flex flex-col items-center space-y-2 text-secondary" variants={fadeInUp}>
              <dt>{item.label}</dt>
              <dd className="text-2xl font-bold">{item.value}</dd>
            </motion.div>
          ))}
        </motion.dl>

        <motion.div className="border-t" {...fadeIn} transition={{ duration: 0.5, delay: 0.9 }} />

        <motion.h2 className="text-xl font-bold" {...fadeInUp} transition={{ duration: 0.5, delay: 1.1 }}>
          Typed Code
        </motion.h2>

        <motion.div className="rounded-lg border bg-muted/20" {...fadeInUp} transition={{ duration: 0.5, delay: 1.3 }}>
          <div className="overflow-x-auto p-4">
            <div className="min-w-fit">
              <motion.div
                initial="initial"
                animate="animate"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.03,
                      delayChildren: 1.4,
                    },
                  },
                }}
              >
                {targetTextLines.map((targetLine, row) => (
                  <motion.div key={row} variants={fadeIn}>
                    <TypingLine
                      cursorColumn={targetLine.length}
                      isCursorLine={false}
                      isUntypedLine={false}
                      targetTextLine={targetLine}
                      typedText={typedTextLines[row]}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
