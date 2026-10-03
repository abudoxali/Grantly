'use client';

import * as React from 'react';

export function HeroGeometricBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Base Engineering Technical Grid with Radial Vignette Fade */}
      <div
        className="absolute inset-0 bg-tech-grid opacity-70"
        style={{
          maskImage:
            'radial-gradient(ellipse 75% 65% at 50% 38%, black 15%, rgba(0,0,0,0.4) 60%, transparent 85%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 65% at 50% 38%, black 15%, rgba(0,0,0,0.4) 60%, transparent 85%)',
        }}
      />

      {/* 2. Soft Multilayer Atmospheric Ambient Glows (Light-first, highly legible) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] h-[480px] bg-gradient-to-b from-emerald-200/40 via-teal-100/30 to-transparent blur-[110px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -start-24 w-[420px] h-[420px] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -end-24 w-[380px] h-[380px] bg-amber-100/35 blur-[100px] rounded-full pointer-events-none" />

      {/* 3. Central Orbital Rings & Navigational Compass Geometry */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[860px] h-[860px] pointer-events-none">
        {/* Outer Orbital Ring with slow clockwise rotation */}
        <div className="absolute inset-0 rounded-full border border-dashed border-emerald-400/25 animate-spin-slow">
          {/* Orbiting Satellite 1: Europe Hub */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 border border-emerald-300 shadow-xs text-[10px] font-mono text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>GEO_NODE: DE_52.5°N</span>
          </div>

          {/* Orbiting Satellite 2: UK Hub */}
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          </div>

          {/* Orbiting Satellite 3: East Asia Hub */}
          <div className="absolute -bottom-1.5 left-1/3 w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-blue-600" />
          </div>
        </div>

        {/* Middle Ring: Navigational Degree Marks & Astrolabe Arcs (Counter-clockwise rotation) */}
        <div className="absolute inset-[90px] rounded-full border border-slate-300/40 animate-spin-slow-reverse">
          {/* 4 Cardinal Crosshairs */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-slate-400 font-mono text-[9px] flex items-center justify-center">
            0°
          </div>
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 text-slate-400 font-mono text-[9px] flex items-center justify-center">
            90°
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 text-slate-400 font-mono text-[9px] flex items-center justify-center">
            180°
          </div>
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 text-slate-400 font-mono text-[9px] flex items-center justify-center">
            270°
          </div>

          {/* Subtle tick marks */}
          <div className="absolute top-1/6 right-1/6 w-1 h-1 rounded-full bg-emerald-400/60" />
          <div className="absolute bottom-1/6 left-1/6 w-1 h-1 rounded-full bg-blue-400/60" />
        </div>

        {/* Inner Focused Core Ring with Radiant Pulse */}
        <div className="absolute inset-[200px] rounded-full border border-emerald-400/20 bg-radial from-emerald-50/30 to-transparent animate-pulse-beacon" />
        <div className="absolute inset-[290px] rounded-full border border-slate-200/70" />
      </div>

      {/* 4. Precision SVG Constellation & Animated Pathway Beams */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          {/* Gradient for left pathway beam */}
          <linearGradient id="beam-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.1" />
          </linearGradient>

          {/* Gradient for right pathway beam */}
          <linearGradient id="beam-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
          </linearGradient>

          {/* Crosshair pattern definition */}
          <pattern
            id="crosshairs"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M80 75v10M75 80h10"
              stroke="#64748b"
              strokeWidth="1"
              strokeOpacity="0.25"
            />
          </pattern>
        </defs>

        {/* Coordinate Crosshairs Layer */}
        <rect
          width="100%"
          height="100%"
          fill="url(#crosshairs)"
          style={{
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 80%)',
          }}
        />

        {/* Global Trajectory Pathway 1: North West to Center */}
        <path
          d="M 120 180 Q 320 280, 520 260 T 820 340"
          stroke="url(#beam-grad-left)"
          strokeWidth="1.75"
          className="animate-beam-dash opacity-75"
        />

        {/* Global Trajectory Pathway 2: North East to Center */}
        <path
          d="M 1180 140 Q 980 260, 780 280 T 560 380"
          stroke="url(#beam-grad-right)"
          strokeWidth="1.75"
          className="animate-beam-dash opacity-75"
        />

        {/* Verification Anchor Nodes with pulsing radar beacons */}
        {/* Node 1: Europe */}
        <g transform="translate(180, 210)">
          <circle r="12" fill="#10b981" fillOpacity="0.1" className="animate-ping" />
          <circle r="4" fill="#059669" />
          <circle r="7" stroke="#059669" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* Node 2: Middle East / Hub */}
        <g transform="translate(860, 310)">
          <circle r="14" fill="#2563eb" fillOpacity="0.1" className="animate-ping" />
          <circle r="4.5" fill="#2563eb" />
          <circle r="8" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* Node 3: North America */}
        <g transform="translate(1080, 190)">
          <circle r="10" fill="#10b981" fillOpacity="0.1" />
          <circle r="3.5" fill="#059669" />
          <circle r="6" stroke="#059669" strokeWidth="1" strokeOpacity="0.3" />
        </g>
      </svg>

      {/* 5. Delicate Bottom Transition Line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </div>
  );
}
