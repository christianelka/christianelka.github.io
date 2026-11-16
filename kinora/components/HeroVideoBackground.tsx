"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC =
  "https://res.cloudinary.com/uobghqwu/video/upload/v1793506197/Characters_waving_in_animation_f349ac66_t1.7-8_1080p.mp4";

/**
 * Full-screen hero video background.
 * The supplied waving-characters video is the primary visual asset.
 * A solid green background sits behind it so the hero still reads
 * correctly if the video fails to load or is still buffering.
 */
export default function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Muted + playsInline autoplay is allowed by browsers, but an
    // explicit play() attempt makes it robust on first paint.
    const attempt = video.play();
    if (attempt) {
      attempt.catch(() => {
        // Autoplay was blocked; the video stays paused behind the
        // green fallback and the user can still see the full hero.
      });
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden bg-[#397C50]"
    >
      {!videoFailed && (
        <video
          ref={videoRef}
          className="h-full w-full object-cover object-[center_bottom] max-md:object-[center_82%]"
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          onError={() => setVideoFailed(true)}
        />
      )}
      {/* Subtle green overlay: keeps text readable without hiding the characters. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15, 65, 37, 0.30) 0%, rgba(25, 95, 52, 0.08) 48%, rgba(15, 65, 37, 0.12) 100%)",
        }}
      />
    </div>
  );
}
