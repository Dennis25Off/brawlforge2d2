import React from 'react';
import { useGame } from '../context/GameContext';
import { Swords, User, ShoppingBag, Trophy, Volume2, VolumeX, Smartphone, Coins, Gem } from 'lucide-react';
import { LEVEL_MILESTONES } from '../game/cosmetics';

interface NavbarProps {
  onOpenMatchmaking: () => void;
  onOpenCustomizer: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMatchmaking,
  onOpenCustomizer,
  onOpenShop,
  onOpenLeaderboard,
}) => {
  const { stats, playerName, isMuted, toggleMute, isMobileControlsForced, setIsMobileControlsForced } = useGame();

  const currentMilestone = LEVEL_MILESTONES.find((m) => m.level === stats.level) || LEVEL_MILESTONES[0];
  const nextMilestone = LEVEL_MILESTONES.find((m) => m.level === stats.level + 1);
  const prevXpReq = currentMilestone.xpReq;
  const nextXpReq = nextMilestone ? nextMilestone.xpReq : currentMilestone.xpReq + 1000;
  const xpInLevel = Math.max(0, stats.xp - prevXpReq);
  const xpNeeded = nextXpReq - prevXpReq;
  const xpPercent = Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));

  return (
    <>
      {/* Top Header Bar */}
      <header className="w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo & Brand Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base tracking-wider text-white flex items-center gap-1">
                BRAWL<span className="text-cyan-400">FORGE</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono">
                  2D
                </span>
              </span>
            </div>
          </div>

          {/* Center Nav Buttons (Desktop only - Mobile has bottom bar) */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={onOpenMatchmaking}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>COMBATTI</span>
            </button>

            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Eroi &amp; Skin</span>
            </button>

            <button
              onClick={onOpenShop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Negozio</span>
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Classifica</span>
            </button>
          </nav>

          {/* Right Info: Currency, Level, Audio, Touch */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Currencies (Always visible on mobile & desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1 font-mono font-bold text-amber-400" title="Monete">
                <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{stats.coins}</span>
              </div>
              <div className="w-[1px] h-2.5 bg-zinc-700" />
              <div className="flex items-center gap-1 font-mono font-bold text-cyan-400" title="Gemme">
                <Gem className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{stats.gems}</span>
              </div>
            </div>

            {/* Player Level Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-950/60 border border-purple-800/80 text-[10px] font-mono text-purple-300">
              <span className="font-bold">Lv.{stats.level}</span>
            </div>

            {/* Mobile Controls Toggle */}
            <button
              onClick={() => setIsMobileControlsForced((prev) => !prev)}
              className={`p-2 rounded-xl border transition-all text-xs active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center ${
                isMobileControlsForced
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
              title="Attiva/Disattiva Controlli Touch Virtuali"
              aria-label="Controlli touch per smartphone"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Audio"
              aria-label="Muto/Attiva Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Design Reference) */}
      <nav
        aria-label="Navigazione Mobile"
        style={{
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 8px))',
        }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-xl md:hidden select-none shadow-[0_-10px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
          {/* Combatti (Hero Primary Action) */}
          <button
            onClick={onOpenMatchmaking}
            className="flex flex-col items-center justify-center h-full active:scale-90 transition-transform text-cyan-400 focus:outline-none"
          >
            <div className="w-10 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center mb-1 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Swords className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-white">Combatti</span>
          </button>

          {/* Eroi & Skin */}
          <button
            onClick={onOpenCustomizer}
            className="flex flex-col items-center justify-center h-full active:scale-90 transition-transform text-zinc-400 hover:text-white focus:outline-none"
          >
            <User className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Eroi</span>
          </button>

          {/* Negozio */}
          <button
            onClick={onOpenShop}
            className="flex flex-col items-center justify-center h-full active:scale-90 transition-transform text-zinc-400 hover:text-white focus:outline-none"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Negozio</span>
          </button>

          {/* Classifica */}
          <button
            onClick={onOpenLeaderboard}
            className="flex flex-col items-center justify-center h-full active:scale-90 transition-transform text-zinc-400 hover:text-white focus:outline-none"
          >
            <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
            <span className="text-[10px] font-bold tracking-tight">Classifica</span>
          </button>
        </div>
      </nav>
    </>
  );
};
