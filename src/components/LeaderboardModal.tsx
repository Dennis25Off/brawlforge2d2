import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Flame, X, RefreshCw, Crown } from 'lucide-react';
import { HEROES } from '../game/heroes';

interface LeaderboardEntry {
  id: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  kos: number;
  favoriteHero: string;
  avatarColor: string;
}

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const { playerName, stats } = useGame();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && data.leaderboard) {
        setEntries(data.leaderboard);
      }
    } catch (e) {
      console.warn('Leaderboard fetch failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <Trophy className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">CLASSIFICA GLOBALE</h2>
              <p className="text-xs text-zinc-400">I migliori lottatori dell'Arena BrawlForge</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Aggiorna"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current User Card */}
        <div className="px-4 py-3 md:px-6 bg-gradient-to-r from-violet-950/40 to-cyan-950/40 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center font-bold text-cyan-300">
              YOU
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{playerName}</span>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/50">
                  Livello {stats.level}
                </span>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-3 mt-0.5">
                <span>Vittorie: <strong className="text-emerald-400">{stats.wins}</strong></span>
                <span>Sconfitte: <strong className="text-rose-400">{stats.losses}</strong></span>
                <span>KO Totali: <strong className="text-amber-400">{stats.kos}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-zinc-400 uppercase font-semibold">Tuo ELO</div>
            <div className="font-mono text-lg font-black text-amber-400">{stats.elo}</div>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="flex flex-col gap-2">
            {entries.map((player, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const hero = HEROES[player.favoriteHero as keyof typeof HEROES] || HEROES.valiant_knight;

              let rankBadge = (
                <span className="w-7 text-center font-mono text-sm font-bold text-zinc-500">#{rank}</span>
              );

              if (rank === 1) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/20 border border-yellow-500/60 flex items-center justify-center text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                    <Crown className="w-4 h-4" />
                  </div>
                );
              } else if (rank === 2) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-lg bg-slate-300/20 border border-slate-300/60 flex items-center justify-center text-slate-200">
                    <Medal className="w-4 h-4" />
                  </div>
                );
              } else if (rank === 3) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-700/60 flex items-center justify-center text-amber-600">
                    <Medal className="w-4 h-4" />
                  </div>
                );
              }

              const isUser = player.name.toLowerCase() === playerName.toLowerCase();

              return (
                <div
                  key={player.id || index}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isUser
                      ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : isTop3
                      ? 'bg-zinc-900/80 border-zinc-700/80'
                      : 'bg-zinc-900/40 border-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {rankBadge}
                    <div
                      style={{ backgroundColor: player.avatarColor || '#38bdf8' }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-zinc-950"
                    >
                      {hero.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-100">{player.name}</span>
                        {isUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-900/80 text-cyan-300 font-bold">
                            TU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-2">
                        {hero.name} &bull; {player.wins}V - {player.losses}P
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-400">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{player.kos} KO</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-base font-black text-white">{player.elo}</span>
                      <span className="text-[10px] text-zinc-500 block uppercase font-semibold">ELO</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
