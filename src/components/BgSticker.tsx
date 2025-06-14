'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundStickers({ rows = 5, cols = 8 }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const cellWidth = screenWidth / cols;
    const cellHeight = screenHeight / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const img = document.createElement('img');
        img.src = '/syl.png';
        img.alt = 'sticker';

        img.style.position = 'absolute';
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.opacity = '0.50';
        img.style.userSelect = 'none';
        img.style.pointerEvents = 'none';

        const x = col * cellWidth + cellWidth / 2 - 30; // center and offset for 60px image
        const y = row * cellHeight + cellHeight / 2 - 30;

        const rotation = Math.random() * 360;

        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.transform = `rotate(${rotation}deg)`;

        container.appendChild(img);
      }
    }
  }, [rows, cols]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
