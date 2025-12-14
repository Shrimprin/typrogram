'use client';

type VideoPlayerProps = {
  videoSrc: string;
  thumbnailSrc: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  altText?: string;
};

export default function VideoPlayer({ videoSrc, thumbnailSrc, videoRef, altText }: VideoPlayerProps) {
  return (
    <div className="group relative mt-auto">
      <video
        ref={videoRef}
        className="w-full rounded-sm border border-border/20 object-cover"
        muted
        loop
        playsInline
        poster={thumbnailSrc}
        style={{ aspectRatio: '16/9' }}
        aria-label={altText}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
}
