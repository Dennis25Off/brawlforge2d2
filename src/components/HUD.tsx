import React from 'react';
import { FighterEntity } from '../types/game';
import { HEROES } from '../game/heroes';
import { Volume2, VolumeX, LogOut, Clock, Wifi, Maximize } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface HUDProps {
  fighters: FighterEntity[];
  timeLeftSeconds: number;
  onLeaveMatch: () => void;
  isOnline: boolean;
}

export const HUD: React.FC<HUDProps> = ({ fighters, timeLeftSeconds, onLeaveMatch, isOnline }) => {
  const { isMuted, toggleMute } = useGame();

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        const screenAny = window.screen as any;
        if (screenAny?.orientation?.lock) {
          await screenAny.orientation.lock('landscape');
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Ignore if browser policies prevent automatic orientation lock
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-6 pointer-events-none flex flex-col gap-1.5 md:gap-2 z-20">
      {/* Top Bar: Timer, Connection Status, Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            onClick={onLeaveMatch}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-md active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Esci</span>
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-md active:scale-95"
            title="Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all backdrop-blur-md active:scale-95"
            title="Schermo Intero Orizzontale"
          >
            <Maximize className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Center: Match Clock */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-md shadow-lg">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-sm text-zinc-200 tracking-wider">{timeFormatted}</span>
        </div>

        {/* Right: Net Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium backdrop-blur-md">
            <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-zinc-400 text-[11px]">{isOnline ? 'Online 30ms' : 'Locale'}</span>
          </div>
        </div>
      </div>

      {/* Fighters Cards Grid at top-center */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-1">
        {fighters.map((f) => {
          const hero = HEROES[f.customization.heroId] || HEROES.valiant_knight;
          const isAlive = f.stocks > 0;

          // Color scale for damage
          let dmgColor = 'text-zinc-100';
          let borderGlow = 'border-zinc-800';
          if (f.damagePercent > 140) {
            dmgColor = 'text-rose-500 font-black';
            borderGlow = 'border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
          } else if (f.damagePercent > 90) {
            dmgColor = 'text-amber-400 font-extrabold';
            borderGlow = 'border-amber-500/50';
          } else if (f.damagePercent > 45) {
            dmgColor = 'text-yellow-300 font-bold';
          }

          return (
            <div
              key={f.id}
              className={`flex items-center gap-1.5 sm:gap-2.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-zinc-900/85 border transition-all duration-200 backdrop-blur-md ${borderGlow} ${
                !isAlive ? 'opacity-40 grayscale' : ''
              }`}
            >
              {/* Hero color swatch / icon */}
              <div
                style={{ backgroundColor: hero.primaryColor }}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs text-zinc-950 shadow-inner shrink-0"
              >
                {hero.name.slice(0, 1)}
              </div>

              {/* Info: Name, Stocks, Damage */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-200 truncate max-w-[55px] sm:max-w-[85px]">{f.name}</span>
                  {f.isBot && (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono">
                      BOT
                    </span>
                  )}
                  <span className="hidden sm:inline text-[8px] font-semibold text-amber-400/90 truncate max-w-[60px]">
                    {hero.weaponName.split(' ')[0]}
                  </span>
                </div>

                {/* Stocks Left */}
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
                        i < f.stocks
                          ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                          : 'bg-zinc-800 border border-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Damage Percent */}
              <div className="ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-zinc-800 flex flex-col items-end">
                <span className={`font-mono text-xs sm:text-base md:text-lg leading-none ${dmgColor}`}>
                  {f.damagePercent}
                  <span className="text-[9px] sm:text-xs font-normal opacity-80">%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
