import React from 'react';

interface DecorativeCollageProps {
  mouseX: number;
  mouseY: number;
  sensitivity?: number;
  visible?: boolean;
}

export const DecorativeCollage: React.FC<DecorativeCollageProps> = ({
  mouseX,
  mouseY,
  sensitivity = 0.5,
  visible = true,
}) => {
  if (!visible) return null;

  // Calculate gentle parallax offsets
  const factor = sensitivity * 14;
  const offsetX1 = mouseX * factor * 0.6;
  const offsetY1 = mouseY * factor * 0.6;
  const offsetX2 = -mouseX * factor * 0.9;
  const offsetY2 = -mouseY * factor * 0.9;
  const offsetX3 = mouseX * factor * 1.2;
  const offsetY3 = mouseY * factor * 1.2;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
      {/* 1. Top Right Comic Speech Bubble Sticker */}
      <div
        className="absolute top-24 right-12 transition-transform duration-300 ease-out hidden xl:block"
        style={{
          transform: `translate3d(${offsetX1}px, ${offsetY1}px, 0) rotate(5deg)`,
        }}
      >
        <div className="relative bg-white border-2 border-slate-900 rounded-2xl px-5 py-3 shadow-comic max-w-[210px]">
          <div className="font-comic text-desk-comicRed text-lg tracking-wider font-bold uppercase leading-none">
            ⚡ POW!
          </div>
          <p className="font-handwritten text-sm text-slate-800 leading-tight mt-1 font-semibold">
            Make today ridiculously creative!
          </p>
          {/* Comic speech bubble tail */}
          <div className="absolute -bottom-2.5 left-6 w-4 h-4 bg-white border-r-2 border-b-2 border-slate-900 transform rotate-45" />
        </div>
      </div>

      {/* 2. Top Left Polaroid Photo */}
      <div
        className="absolute top-28 left-8 transition-transform duration-300 ease-out hidden lg:block"
        style={{
          transform: `translate3d(${offsetX2}px, ${offsetY2}px, 0) rotate(-6deg)`,
        }}
      >
        <div className="bg-white p-2.5 pb-6 border border-slate-800/20 shadow-paperHover rounded-sm w-44">
          {/* Masking tape on polaroid top */}
          <div className="masking-tape h-4 w-20 mx-auto -mt-4 mb-2 rotate-2 opacity-90 rounded-sm" />

          {/* Polaroid inner illustration */}
          <div className="bg-gradient-to-tr from-amber-200 via-rose-300 to-sky-300 h-28 w-full rounded flex flex-col items-center justify-center relative overflow-hidden border border-slate-900/10">
            {/* Geometric comic sunset doodle */}
            <div className="w-12 h-12 rounded-full bg-amber-400 border border-slate-900/40 shadow-inner mb-1" />
            <div className="text-xl">🌊 🗻</div>
            <div className="absolute bottom-0 inset-x-0 h-4 bg-emerald-600/30 backdrop-blur-[1px]" />
          </div>
          <p className="font-handwritten text-xs text-center text-slate-700 mt-2 font-bold tracking-wide">
            Studio Vibes • 2026
          </p>
        </div>
      </div>

      {/* 3. Bottom Left Coffee Ring & Stationery Doodle */}
      <div
        className="absolute bottom-16 left-14 transition-transform duration-300 ease-out opacity-75 hidden md:block"
        style={{
          transform: `translate3d(${offsetX3}px, ${offsetY3}px, 0) rotate(12deg)`,
        }}
      >
        {/* Coffee cup stain SVG */}
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-900/20 fill-none stroke-current stroke-2">
            <circle cx="50" cy="50" r="42" strokeDasharray="18 4 30 8" strokeWidth="2.5" />
            <circle cx="51" cy="49" r="39" strokeWidth="1" opacity="0.6" />
            <path d="M72,30 Q80,25 85,32 Q90,38 80,45" opacity="0.4" strokeWidth="1.5" />
          </svg>
          {/* Wooden pencil sticker */}
          <div className="absolute top-6 left-12 bg-amber-400 border border-slate-900 rounded-sm w-28 h-3.5 shadow-comic -rotate-45 flex items-center px-1">
            <div className="w-2.5 h-full bg-slate-900 -ml-1 rounded-l-sm" />
            <div className="text-[8px] font-mono text-slate-900 font-bold ml-1 tracking-tighter">
              HB #2 COMIC
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Right Colorful Comic Badge / Stamp */}
      <div
        className="absolute bottom-12 right-16 transition-transform duration-300 ease-out hidden lg:block"
        style={{
          transform: `translate3d(${offsetX2}px, ${offsetY2}px, 0) rotate(-4deg)`,
        }}
      >
        <div className="bg-desk-comicYellow border-2 border-slate-900 rounded-full w-24 h-24 p-1 shadow-comic flex flex-col items-center justify-center text-center">
          <span className="text-xl">🚀</span>
          <span className="font-comic text-xs uppercase font-extrabold text-slate-900 tracking-wider">
            LITTLEDESK
          </span>
          <span className="text-[9px] font-bold text-slate-800 -mt-0.5">EST. 2026</span>
        </div>
      </div>
    </div>
  );
};
