import React from 'react';

export default function TitleBar() {
  return (
    <div 
      className="w-full h-8 bg-[#06070A] border-b border-slate-900 flex items-center justify-center relative select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      id="devsync-custom-titlebar"
    >
      <span className="text-[10px] font-extrabold font-mono tracking-widest text-slate-400 uppercase pointer-events-none">
        DevSync
      </span>
    </div>
  );
}
