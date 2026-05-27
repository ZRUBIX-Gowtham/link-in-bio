"use client";

import { useEffect, useState } from "react";

export default function ParticlesBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles only on the client to prevent hydration mismatch
    const generated = Array.from({ length: 25 }).map((_, i) => {
      const left = Math.random() * 100; // percentage
      const delay = Math.random() * 15; // seconds
      const duration = 10 + Math.random() * 15; // seconds
      const size = 2 + Math.random() * 4; // px
      return { id: i, left, delay, duration, size };
    });
    setParticles(generated);
  }, []);

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}
