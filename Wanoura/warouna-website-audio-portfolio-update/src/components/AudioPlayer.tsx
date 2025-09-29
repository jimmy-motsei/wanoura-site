"use client";
import { useRef, useState } from "react";

type AudioPlayerProps = {
  src: string;
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function AudioPlayer({ src, title, subtitle, className }: AudioPlayerProps){
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const el = audioRef.current;
    if(!el) return;
    if(isPlaying){ el.pause(); } else { el.play(); }
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);
  const onTimeUpdate = () => {
    const el = audioRef.current;
    if(!el) return;
    const pct = (el.currentTime / (el.duration || 1)) * 100;
    setProgress(pct);
  };

  return (
    <div className={`rounded-2xl border border-charcoal p-6 ${className || ""}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {title && <h4 className="text-lg font-semibold truncate">{title}</h4>}
          {subtitle && <p className="text-sm text-ivory/70 truncate">{subtitle}</p>}
        </div>
        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center border ${isPlaying ? "border-gold text-gold" : "border-ivory/30"}`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "►"}
        </button>
      </div>

      <div className="mt-4 h-2 rounded bg-charcoal overflow-hidden">
        <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
      </div>

      <audio
        ref={audioRef}
        src={src}
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        className="hidden"
        controls
      />
    </div>
  );
}
