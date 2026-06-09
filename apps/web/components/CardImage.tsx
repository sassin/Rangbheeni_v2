"use client";

import { useState } from "react";

export function CardImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="card-img placeholder">Rangbheeni</div>;
  return <div className="card-img"><img src={src} alt={alt} onError={() => setFailed(true)} /></div>;
}
