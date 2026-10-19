import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, X, Globe, Smartphone, Monitor, Tablet } from 'lucide-react';
import { BrawlerId, CrossPlayPlatform, PlayerProfile } from '../types/game';
import { BRAWLERS } from '../data/brawlers';
import { sound } from '../utils/audio';

interface MatchmakingModalProps {
  profile: PlayerProfile;
  selectedBrawlerId: BrawlerId;
  onMatchReady: () => void;
  onCancel: () => void;
}

interface MatchPlayer {
  id: string;
  name: string;
  brawlerId: BrawlerId;
  trophies: number;
  platform: CrossPlayPlatform;
  ready: boolean;
}

const SAMPLE_NAMES = [
  'ViperKing_IT',
  'SuperBrawler_99',
  'Phoenix_X',
  'ToxicRaven',
  'TitanLover',
  'BlazeSniper',
  'ApexPredator',
  'GhostRider',
  'ProPlayer_2026',
];

const PLATFORMS: CrossPlayPlatform[] = ['mobile', 'pc', 'tablet'];
const BRAWLER_KEYS: BrawlerId[] = ['blaze', 'viper', 'titan', 'raven', 'harmony'];

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  profile,
  selectedBrawlerId,
  onMatchReady,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [players, setPlayers] = useState<MatchPlayer[]>([
    {
      id: profile.id,
      name: profile.username,
      brawlerId: selectedBrawlerId,
      trophies: profile.trophies,
      platform: profile.platform,
      ready: true,
    },
  ]);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // Fast matchmaking simulation: adds 1-2 players every 300-600ms
    const queueInterval = setInterval(() => {
      setPlayers((current) => {
        if (current.length >= 10) return current;

        const nextIdx = current.length - 1;
        const newPlayer: MatchPlayer = {
          id: `match_bot_${current.length}`,
          name: SAMPLE_NAMES[nextIdx % SAMPLE_NAMES.length] || `Gamer_${Math.floor(Math.random() * 900 + 100)}`,
          brawlerId: BRAWLER_KEYS[Math.floor(Math.random() * BRAWLER_KEYS.length)],
          trophies: Math.max(0, profile.trophies + Math.floor((Math.random() - 0.4) * 80)),
          platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
          ready: true,
        };

        sound.playPlayerJoined();
        const updated = [...current, newPlayer];

        // If filled 10/10, start battle countdown
        if (updated.length === 10) {
          clearInterval(queueInterval);
          startCountdown();
        }

        return updated;
      });
    }, 450);

    const startCountdown = () => {
      let count = 3;
      setCountdown(count);
      sound.playCountdown(false);

      const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          sound.playCountdown(false);
        } else if (count === 0) {
          setCountdown(0);
          sound.playCountdown(true);
        } else {
          clearInterval(countInterval);
          onMatchReady();
        }
      }, 700);
    };

    return () => {
      clearInterval(timer);
      clearInterval(queueInterval);
    };
  }, [profile, selectedBrawlerId, onMatchReady]);

  const renderPlatformIcon = (platform: CrossPlayPlatform) => {
    if (platform === 'pc') return <span title="PC"><Monitor className="w-3.5 h-3.5 text-sky-400" /></span>;
    if (platform === 'tablet') return <span title="Tablet"><Tablet className="w-3.5 h-3.5 text-purple-400" /></span>;
    return <span title="Mobile"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /></span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-4 border-indigo-500 shadow-2xl p-6 flex flex-col items-center">
        {/* Close / Cancel Button */}
        {countdown === null && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500 text-indigo-300 text-xs font-bold mb-2">
            <Globe className="w-4 h-4 text-sky-400 animate-spin" />
            <span>CROSS-PLAY ATTIVO • SERVER GLOBALE</span>
          </div>

          <h2 className="font-extrabold text-2xl sm:text-3xl text-white font-game tracking-wide">
            {countdown !== null ? (
              <span className="text-amber-400 animate-bounce">LA BATTAGLIA INIZIA!</span>
            ) : (
              'CERCA AVVERSARI...'
            )}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Modalità: <strong className="text-white">Sopravvivenza Solo (Battle Royale 10 Giocatori)</strong>
          </p>

          <div className="mt-2 text-sm font-black text-amber-300 bg-black/50 px-3 py-0.5 rounded-lg border border-slate-700">
            Tempo trascorso: {Math.floor(seconds / 60)}:{seconds % 60 < 10 ? '0' : ''}{seconds % 60}
          </div>
        </div>

        {/* 10 Player Slots Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Array.from({ length: 10 }).map((_, i) => {
            const p = players[i];
            const brawlerDef = p ? BRAWLERS[p.brawlerId] : null;

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-center border-2 transition-all ${
                  p
                    ? 'bg-slate-800/90 border-indigo-400 shadow-lg scale-100'
                    : 'bg-slate-950/60 border-slate-800 border-dashed opacity-50 scale-95'
                }`}
              >
                {p ? (
                  <>
                    {/* Brawler Avatar circle */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner border-2 border-white mb-1.5"
                      style={{ backgroundColor: brawlerDef?.color || '#3b82f6' }}
                    >
                      {brawlerDef?.avatarEmoji}
                    </div>

                    <div className="font-black text-xs text-white truncate max-w-[90px]">
                      {p.name}
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                      {renderPlatformIcon(p.platform)}
                      <span>{p.trophies} 🏆</span>
                    </div>

                    <span className="mt-1 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px]">
                      PRONTO
                    </span>
                  </>
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center text-slate-600">
                    <span className="text-xl animate-pulse">?</span>
                    <span className="text-[10px] font-bold mt-1">In attesa...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Countdown Indicator or Cancel Button */}
        {countdown !== null ? (
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black text-amber-400 font-game animate-ping">
              {countdown === 0 ? 'SCONTRO!' : countdown}
            </div>
            <p className="text-xs text-slate-300 mt-2">Caricamento mappa e posizioni di spawn...</p>
          </div>
        ) : (
          <button
            onClick={onCancel}
            className="px-8 py-2.5 rounded-2xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-sm border-2 border-red-400 shadow-lg active:scale-95 transition"
          >
            Annulla Matchmaking
          </button>
        )}
      </div>
    </div>
  );
};
