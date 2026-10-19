import React from 'react';
import { useGame } from '../context/GameContext';
import { Swords, User, ShoppingBag, Trophy, Volume2, VolumeX, Smartphone, Coins, Gem, Sparkles } from 'lucide-react';
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
    <header className="w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Swords className="w-5 h-5 text-zinc-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base tracking-wider text-white flex items-center gap-1.5">
              BRAWL<span className="text-cyan-400">FORGE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-mono">
                2D
              </span>
            </span>
            <span className="text-[10px] text-zinc-500 hidden sm:block">Platform Fighter Arena</span>
          </div>
        </div>

        {/* Center Nav Buttons */}
        <nav className="flex items-center gap-1 md:gap-2">
          <button
            onClick={onOpenMatchmaking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>COMBATTI</span>
          </button>

          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Eroi &amp; Skin</span>
            <span className="sm:hidden">Eroi</span>
          </button>

          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Negozio</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Classifica</span>
          </button>
        </nav>

        {/* Right Info: Currency, Level, Controls Toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Currencies */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
            <div className="flex items-center gap-1 font-mono font-bold text-amber-400" title="Monete">
              <Coins className="w-3.5 h-3.5" />
              <span>{stats.coins}</span>
            </div>
            <div className="w-[1px] h-3 bg-zinc-700" />
            <div className="flex items-center gap-1 font-mono font-bold text-cyan-400" title="Gemme">
              <Gem className="w-3.5 h-3.5" />
              <span>{stats.gems}</span>
            </div>
          </div>

          {/* Player Level Badge */}
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
              <span className="truncate max-w-[90px]">{playerName}</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono text-[10px]">
                Lv.{stats.level}
              </span>
            </div>
            <div className="w-20 h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
              <div
                style={{ width: `${xpPercent}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
              />
            </div>
          </div>

          {/* Mobile Gamepad Toggle */}
          <button
            onClick={() => setIsMobileControlsForced((prev) => !prev)}
            className={`p-2 rounded-xl border transition-all text-xs active:scale-95 ${
              isMobileControlsForced
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Attiva/Disattiva Controlli Touch per Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
            title="Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
