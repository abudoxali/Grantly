'use client';

import * as React from 'react';

export function HeroGeometricBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Engineering Technical Grid with Radial Fade */}
      <div
        className="absolute inset-0 bg-tech-grid opacity-75"
        style={{
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, rgba(0,0,0,0.3) 75%, transparent 95%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, rgba(0,0,0,0.3) 75%, transparent 95%)',
        }}
      />

      {/* 2. Soft Multilayer Atmospheric Glows (Rich, modern, luminous) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-b from-emerald-300/30 via-teal-200/20 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -start-28 w-[450px] h-[450px] bg-blue-200/25 blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -end-28 w-[420px] h-[420px] bg-emerald-200/25 blur-[110px] rounded-full pointer-events-none" />

      {/* 3. Central Orbital Rings & Academic Compass System */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[920px] h-[920px] pointer-events-none">
        {/* Outer Orbital Ring (60s slow rotation) */}
        <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 animate-spin-slow">
          {/* Orbiting Satellite Node 1: Europe Hub */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-emerald-400 shadow-md text-[10px] font-mono font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>GEO_NODE: DE_52.5°N</span>
          </div>

          {/* Orbiting Satellite Node 2: UK Hub */}
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-blue-400 shadow-md text-[10px] font-mono font-bold text-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>UK_PORTAL</span>
          </div>

          {/* Orbiting Satellite Node 3: East Asia Hub */}
          <div className="absolute -bottom-2.5 left-1/3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-amber-400 shadow-md text-[10px] font-mono font-bold text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>ASIA_HUB</span>
          </div>
        </div>

        {/* Middle Ring: Navigational Degree Arcs (45s counter-clockwise rotation) */}
        <div className="absolute inset-[110px] rounded-full border border-slate-300/60 animate-spin-slow-reverse">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-slate-100/90 text-slate-500 font-mono text-[9px] font-bold">
            0°N
          </div>
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 px-1.5 py-0.2 rounded bg-slate-100/90 text-slate-500 font-mono text-[9px] font-bold">
            90°E
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-slate-100/90 text-slate-500 font-mono text-[9px] font-bold">
            180°S
          </div>
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 px-1.5 py-0.2 rounded bg-slate-100/90 text-slate-500 font-mono text-[9px] font-bold">
            270°W
          </div>
        </div>

        {/* Inner Glowing Core Ring */}
        <div className="absolute inset-[240px] rounded-full border border-emerald-500/25 bg-radial from-emerald-50/40 to-transparent animate-pulse-beacon" />
        <div className="absolute inset-[330px] rounded-full border border-slate-200" />
      </div>

      {/* 4. Precision Animated Constellation Beams & Vector Crosshairs */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <linearGradient id="beam-left-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="beam-right-grad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
          </linearGradient>

          <pattern
            id="hero-crosshairs"
            width="140"
            height="140"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M70 64v12M64 70h12"
              stroke="#64748b"
              strokeWidth="1.25"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>

        {/* Coordinate Crosshairs Grid */}
        <rect width="100%" height="100%" fill="url(#hero-crosshairs)" opacity="0.7" />

        {/* Dynamic Animated Trajectory 1 */}
        <path
          d="M 80 160 Q 280 260, 480 240 T 780 320"
          stroke="url(#beam-left-grad)"
          strokeWidth="2"
          className="animate-beam-dash"
        />

        {/* Dynamic Animated Trajectory 2 */}
        <path
          d="M 1240 140 Q 1040 260, 840 270 T 580 360"
          stroke="url(#beam-right-grad)"
          strokeWidth="2"
          className="animate-beam-dash"
        />

        {/* Verification Beacons */}
        <g transform="translate(140, 180)">
          <circle r="14" fill="#10b981" fillOpacity="0.15" className="animate-ping" />
          <circle r="5" fill="#059669" />
          <circle r="8" stroke="#059669" strokeWidth="1.5" strokeOpacity="0.5" />
        </g>

        <g transform="translate(1140, 160)">
          <circle r="14" fill="#2563eb" fillOpacity="0.15" className="animate-ping" />
          <circle r="5" fill="#2563eb" />
          <circle r="8" stroke="#2563eb" strokeWidth="1.5" strokeOpacity="0.5" />
        </g>
      </svg>

      {/* 5. Soft Protective Halo behind center text so letters stay crisp and sharp */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[340px] bg-white/70 blur-[50px] rounded-full pointer-events-none" />

      {/* 6. Bottom Horizon Line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </div>
  );
}
