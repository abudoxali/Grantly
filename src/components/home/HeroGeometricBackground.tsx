'use client';

import * as React from 'react';

export function HeroGeometricBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Subtle, Low-Noise Engineering Blueprint Grid */}
      <div
        className="absolute inset-0 bg-tech-grid opacity-40"
        style={{
          maskImage:
            'radial-gradient(ellipse 70% 50% at 50% 45%, transparent 20%, rgba(0,0,0,0.5) 70%, transparent 95%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 50% at 50% 45%, transparent 20%, rgba(0,0,0,0.5) 70%, transparent 95%)',
        }}
      />

      {/* 2. Soft Ambient Lighting (Clean, Airy, Non-Intrusive) */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-emerald-100/50 via-teal-50/30 to-transparent blur-[120px] rounded-full" />
      <div className="absolute top-1/3 -start-32 w-[350px] h-[350px] bg-blue-100/30 blur-[100px] rounded-full" />
      <div className="absolute top-1/4 -end-32 w-[350px] h-[350px] bg-emerald-100/30 blur-[100px] rounded-full" />

      {/* 3. Outer Concentric Orbital Arcs (Placed strictly on the upper/outer perimeter, never touching the text) */}
      <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] opacity-35 pointer-events-none">
        {/* Outer subtle dashed orbit */}
        <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20 animate-spin-slow" />
        {/* Middle navigational orbit */}
        <div className="absolute inset-[120px] rounded-full border border-slate-300/30 animate-spin-slow-reverse" />
        {/* Inner subtle glow ring */}
        <div className="absolute inset-[240px] rounded-full border border-emerald-400/15" />
      </div>

      {/* 4. Elegant SVG Coordinate Corner Brackets (Framing the hero like a technical map) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {/* Top-Start Corner Bracket */}
        <path
          d="M 40 70 L 40 40 L 70 40"
          stroke="#059669"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Top-End Corner Bracket */}
        <path
          d="M calc(100% - 70px) 40 L calc(100% - 40px) 40 L calc(100% - 40px) 70"
          stroke="#059669"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Subtle Horizontal Horizon Datum Line */}
        <line
          x1="5%"
          y1="90%"
          x2="95%"
          y2="90%"
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
      </svg>

      {/* 5. Clean Bottom Divider Line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </div>
  );
}
