'use client';

import * as React from 'react';

export function HeroGeometricBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Engineering Technical Grid with Radial Fade */}
      <div
        className="bg-tech-grid absolute inset-0 hidden opacity-45 sm:block"
        style={{
          maskImage:
            'radial-gradient(ellipse 80% 65% at 50% 38%, black 12%, rgba(0,0,0,0.3) 65%, transparent 92%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 65% at 50% 38%, black 12%, rgba(0,0,0,0.3) 65%, transparent 92%)',
        }}
      />

      {/* 2. Soft Multilayer Atmospheric Glows (Rich, modern, luminous) */}
      <div
        className="absolute -top-44 left-1/2 h-[420px] w-[min(90vw,860px)] -translate-x-1/2 rounded-full blur-[110px]"
        style={{
          background:
            'radial-gradient(ellipse at center, color-mix(in srgb, var(--brand-accent) 12%, transparent), transparent 68%)',
        }}
      />
      <div className="absolute -start-40 top-1/4 hidden h-[340px] w-[340px] rounded-full bg-primary-soft/45 blur-[100px] md:block" />
      <div className="absolute -end-40 top-1/3 hidden h-[320px] w-[320px] rounded-full bg-primary-soft/35 blur-[100px] md:block" />

      {/* 3. Central Orbital Rings & Academic Compass System */}
      <div className="absolute left-1/2 top-[42%] hidden aspect-square w-[min(76vw,850px)] -translate-x-1/2 -translate-y-1/2 xl:block">
        {/* Outer Orbital Ring (60s slow rotation) */}
        <div className="absolute inset-0 rounded-full border border-dashed border-primary/15 animate-spin-slow">
          {/* Orbiting Satellite Node 1: Europe Hub */}
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-accent shadow-sm" />

          {/* Orbiting Satellite Node 2: UK Hub */}
          <span className="absolute end-[14%] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-sm" />

          {/* Orbiting Satellite Node 3: East Asia Hub */}
          <span className="absolute bottom-[12%] start-[22%] h-2 w-2 rounded-full border-2 border-white bg-mauve" />
        </div>

        {/* Middle Ring: Navigational Degree Arcs (45s counter-clockwise rotation) */}
        <div className="absolute inset-[11%] rounded-full border border-primary/10" />

        {/* Inner Glowing Core Ring */}
        <div className="absolute inset-[26%] rounded-full border border-primary/10 bg-primary-soft/10" />
        <div className="absolute inset-[37%] rounded-full border border-border/80" />
      </div>

      {/* 4. Precision Animated Constellation Beams & Vector Crosshairs */}
      <svg
        className="absolute inset-0 hidden h-full w-full opacity-35 lg:block"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <linearGradient id="beam-left-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.04" />
            <stop offset="50%" stopColor="var(--brand-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0.03" />
          </linearGradient>

          <linearGradient id="beam-right-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.03" />
            <stop offset="50%" stopColor="var(--brand-primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0.04" />
          </linearGradient>

          <pattern
            id="hero-crosshairs"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M80 77v6M77 80h6"
              stroke="var(--brand-mauve)"
              strokeWidth="1"
              strokeOpacity="0.15"
            />
          </pattern>
        </defs>

        {/* Coordinate Crosshairs Grid */}
        <rect width="100%" height="100%" fill="url(#hero-crosshairs)" opacity="0.55" />

        {/* Dynamic Animated Trajectory 1 */}
        <path
          d="M 80 180 Q 280 250, 480 240 T 780 320"
          stroke="url(#beam-left-grad)"
          strokeWidth="1.5"
          className="animate-beam-dash"
        />

        {/* Dynamic Animated Trajectory 2 */}
        <path
          d="M 1240 160 Q 1040 250, 840 270 T 580 360"
          stroke="url(#beam-right-grad)"
          strokeWidth="1.5"
          className="animate-beam-dash"
        />

        {/* Verification Beacons */}
        <g transform="translate(140, 180)">
          <circle r="12" fill="var(--brand-accent)" fillOpacity="0.06" />
          <circle r="3.5" fill="var(--brand-primary)" fillOpacity="0.45" />
          <circle r="7" stroke="var(--brand-primary)" strokeWidth="1" strokeOpacity="0.2" />
        </g>

        <g transform="translate(1140, 160)">
          <circle r="12" fill="var(--brand-accent)" fillOpacity="0.06" />
          <circle r="3.5" fill="var(--brand-primary)" fillOpacity="0.45" />
          <circle r="7" stroke="var(--brand-primary)" strokeWidth="1" strokeOpacity="0.2" />
        </g>
      </svg>

      {/* 5. Soft Protective Halo behind center text so letters stay crisp and sharp */}
      <div className="absolute left-1/2 top-[40%] h-[300px] w-[min(90vw,700px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/75 blur-[55px]" />

      {/* 6. Bottom Horizon Line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary-border/70 to-transparent" />
    </div>
  );
}
