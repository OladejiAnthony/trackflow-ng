"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = [
  "#10B981", "#F5A623", "#3B82F6", "#EC4899",
  "#8B5CF6", "#EF4444", "#06B6D4", "#FCD34D",
];

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  circle: boolean;
}

export function Confetti({ count = 90 }: { count?: number }) {
  const pieces: Piece[] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id:       i,
        x:        Math.random() * 100,
        color:    COLORS[i % COLORS.length],
        size:     6 + Math.random() * 8,
        delay:    Math.random() * 1.8,
        duration: 2.5 + Math.random() * 2.5,
        rotation: Math.random() * 720 - 360,
        circle:   Math.random() > 0.4,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ top: -20, left: `${p.x}%`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            top:     "110vh",
            opacity: [1, 1, 0.8, 0],
            rotate:  p.rotation,
            scale:   [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            delay:    p.delay,
            ease:     "easeIn",
          }}
          style={{
            position:     "fixed",
            width:        p.size,
            height:       p.size,
            background:   p.color,
            borderRadius: p.circle ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
