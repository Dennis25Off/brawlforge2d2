import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, Flame, Coins, Gem, ArrowRight, RotateCcw } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { LEVEL_MILESTONES } from '../game/cosmetics';

interface VictoryModalProps {
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onPlayAgain, onReturnToLobby }) => {
  const { lastMatchResult, stats } = useGame();

  useEffect(() => {
    if (lastMatchResult?.won) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#a855f7', '#facc15', '#10b981'],
      });
    }
  }, [lastMatchResult]);

  if (!lastMatchResult) return null;

  const currentMilestone = LEVEL_MILESTONES.find((m) => m.level === stats.level) || LEVEL_MILESTONES[0];
  const nextMilestone = LEVEL_MILESTONES.find((m) => m.level === stats.level + 1);

  const prevXpReq = currentMilestone.xpReq;
  const nextXpReq = nextMilestone ? nextMilestone.xpReq : currentMilestone.xpReq + 1000;
  const xpInLevel = Math.max(0, stats.xp - prevXpReq);
  const xpNeeded = nextXpReq - prevXpReq;
  const xpProgressPercent = Math.min(100, Math.floor((xpInLevel / xpNeeded) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Victory / Defeat Badge */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl mb-4 ${
            lastMatchResult.won
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-zinc-950 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
              : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          {lastMatchResult.won ? <Trophy className="w-10 h-10 animate-bounce" /> : <Skull className="w-10 h-10" />}
        </div>

        <h2 className="text-3xl font-black text-white tracking-wide uppercase">
          {lastMatchResult.won ? 'VITTORIA SULL\'ARENA!' : 'SCONFITTO IN BATTAGLIA'}
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          {lastMatchResult.won
            ? 'Hai dominato la piattaforma e scalzato tutti i rivali!'
            : 'Non demordere. Affila la lama e scendi di nuovo in campo!'}
        </p>

        {/* Stats Summary Card */}
        <div className="w-full my-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 grid grid-cols-2 gap-3 text-left">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <Skull className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">KO Inflitti</span>
              <span className="font-mono text-base font-black text-white">{lastMatchResult.kos}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">Danno Totale</span>
              <span className="font-mono text-base font-black text-white">{lastMatchResult.damageDealt}%</span>
            </div>
          </div>
        </div>

        {/* Rewards Earned Bar */}
        <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900/40 to-cyan-950/30 border border-zinc-800">
          <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block mb-2">
            Ricompense Ottenute
          </span>
          <div className="flex items-center justify-around">
            <div className="flex items-center gap-1.5 font-mono text-sm font-black text-amber-400">
              <Coins className="w-4 h-4" />
              <span>+{lastMatchResult.coinsEarned} Monete</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-sm font-black text-cyan-400">
              <Gem className="w-4 h-4" />
              <span>+{lastMatchResult.gemsEarned} Gemme</span>
            </div>
            <div className="font-mono text-sm font-black text-purple-400">
              +{lastMatchResult.xpEarned} XP
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-left">
            <div className="flex justify-between text-xs mb-1 font-semibold">
              <span className="text-zinc-300">Livello {stats.level}</span>
              <span className="text-zinc-500 font-mono">{xpProgressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
              <div
                style={{ width: `${xpProgressPercent}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rigioca Subito</span>
          </button>
          <button
            onClick={onReturnToLobby}
            className="px-5 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>Lobby</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
