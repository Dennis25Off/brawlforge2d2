import React, { useEffect, useState } from 'react';
import { Smartphone, RotateCw, Maximize2, X } from 'lucide-react';

interface OrientationPromptProps {
  onDismiss?: () => void;
}

export const OrientationPrompt: React.FC<OrientationPromptProps> = ({ onDismiss }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;

      // Portrait condition: height > width
      const portrait = window.innerHeight > window.innerWidth;

      // We show the prompt if it's portrait and either a touch device or mobile screen size (< 800px)
      const shouldPrompt = portrait && (isTouch || window.innerWidth <= 768);

      setIsPortrait(shouldPrompt);

      // If user rotated to landscape, reset dismissed status so next portrait triggers it again
      if (!portrait) {
        setIsDismissed(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    const mql = window.matchMedia('(orientation: portrait)');
    const handleMql = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        setIsDismissed(false);
      }
      checkOrientation();
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleMql);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMql);
      }
    };
  }, []);

  const handleRequestLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      // Try to lock orientation to landscape if supported by browser
      const screenAny = window.screen as any;
      if (screenAny?.orientation?.lock) {
        await screenAny.orientation.lock('landscape');
      }
    } catch {
      // Ignored if browser policy blocks fullscreen or orientation lock without explicit user gesture
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  if (!isPortrait || isDismissed) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Suggerimento orientamento schermo"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-xl text-center select-none animate-fadeIn pointer-events-auto"
    >
      <div className="relative max-w-sm w-full p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center">
        {/* Close / Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          title="Continua in verticale"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Phone Graphic */}
        <div className="relative w-32 h-32 flex items-center justify-center my-3">
          {/* Subtle spinning glow ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40 animate-spin" style={{ animationDuration: '10s' }} />
          
          {/* Animated tilting phone */}
          <div className="relative animate-phoneRotate flex items-center justify-center">
            <div className="w-14 h-24 rounded-2xl border-2 border-cyan-400 bg-gradient-to-b from-cyan-950/80 to-zinc-900 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex flex-col items-center justify-between p-1.5">
              <div className="w-3 h-1 bg-cyan-400/80 rounded-full" />
              <div className="w-full flex-1 my-1 rounded-lg bg-zinc-950/80 border border-cyan-500/30 flex items-center justify-center">
                <RotateCw className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="w-2.5 h-2.5 rounded-full border border-cyan-400/80" />
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[11px] font-black text-cyan-300 uppercase tracking-wider mb-2">
          <RotateCw className="w-3 h-3 text-cyan-400" />
          <span>Gira lo Schermo</span>
        </div>

        {/* Title & Desc */}
        <h2 className="text-xl font-black text-white tracking-wide uppercase">
          MODALITÀ ORIZZONTALE
        </h2>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
          Per giocare al meglio con visuale completa dell'arena e controlli touch ergonomici, <strong className="text-cyan-300">ruota il telefono in orizzontale</strong>.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2 mt-5">
          <button
            onClick={handleRequestLandscape}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Schermo Intero Orizzontale</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all active:scale-95"
          >
            Continua in Verticale
          </button>
        </div>
      </div>
    </aside>
  );
};
