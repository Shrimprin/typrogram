import type { Stats } from '@/types';

import { formatTime } from '@/utils/time';

type TypingStatsProps = {
  stats: Stats;
};

export default function TypingStats({ stats }: TypingStatsProps) {
  const { accuracy, elapsedSeconds, totalTypoCount, wpm } = stats;

  return (
    <div className="absolute right-4 bottom-4 rounded-lg border bg-background/80 px-3 py-2 text-sm backdrop-blur-sm">
      <div className="flex min-w-[140px] flex-col gap-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Accuracy:</span>
          <span>{accuracy?.toFixed(1) ?? '0.0'}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Typos:</span>
          <span>{totalTypoCount ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">WPM:</span>
          <span>{wpm?.toFixed(1) ?? '0.0'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span>{formatTime(elapsedSeconds ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}
