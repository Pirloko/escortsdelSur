import { useState, useEffect } from "react";

export interface QuizImageRevealProps {
  imageUrl: string;
  revealed: boolean;
  alt?: string;
  className?: string;
}

export function QuizImageReveal({ imageUrl, revealed, alt = "", className = "" }: QuizImageRevealProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!revealed) setLoaded(false);
  }, [imageUrl, revealed]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full transition-[filter] duration-[800ms] ease-out ${
          revealed ? "blur-0 object-contain" : "blur-[25px] object-cover"
        } ${!loaded ? "opacity-0" : "opacity-100"}`}
        style={{ transitionProperty: "filter" }}
      />
      {!revealed && (
        <div
          className="absolute inset-0 bg-black/95 pointer-events-none"
          aria-hidden
        />
      )}
    </div>
  );
}
