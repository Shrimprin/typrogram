'use client';

import { useRef } from 'react';

import VideoPlayer from './VideoPlayer';

type FeatureCardProps = {
  step: number;
  title: string;
  description: string;
  videoSrc: string;
  thumbnailSrc: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  textColor: string;
};

export default function FeatureCard({
  step,
  title,
  description,
  videoSrc,
  thumbnailSrc,
  icon,
  borderColor,
  bgColor,
  textColor,
}: FeatureCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleCardHover = (playing: boolean) => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  return (
    <div
      className={`
        group flex flex-col rounded-sm border border-border/50 bg-card/50 p-8 transition-all duration-300
        ${borderColor}
      `}
      onMouseEnter={() => handleCardHover(true)}
      onMouseLeave={() => handleCardHover(false)}
    >
      <div className="mb-6 flex items-center gap-4">
        <div
          className={`
            ${bgColor}
            flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300
          `}
        >
          <span
            className={`
              ${textColor}
              text-xl font-bold
            `}
          >
            {step}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        </div>
      </div>
      <p className="mb-4 text-foreground">{description}</p>
      <VideoPlayer
        videoSrc={videoSrc}
        thumbnailSrc={thumbnailSrc}
        videoRef={videoRef}
        altText={`${title} demonstration video`}
      />
    </div>
  );
}
