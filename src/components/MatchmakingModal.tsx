import React, { useEffect, useRef, useState } from 'react';
import { Shield, Sparkles, X, Globe, Smartphone, Monitor, Tablet, Bot, UserCheck, Clock } from 'lucide-react';
import { BrawlerId, CrossPlayPlatform, LobbyPlayerInfo, PlayerProfile } from '../types/game';
import { BRAWLERS } from '../data/brawlers';
import { sound } from '../utils/audio';

interface MatchmakingModalProps {
  profile: PlayerProfile;
  selectedBrawlerId: BrawlerId;
  onMatchReady: (matchedPlayers: LobbyPlayerInfo[]) => void;
  onCancel: () => void;
}

const SAMPLE_BOT_NAMES = [
  'El_Pro_77 [BOT]',
  'ViperKing [BOT]',
  'SuperBrawler [BOT]',
  'Phoenix_X [BOT]',
  'ToxicRaven [BOT]',
  'TitanLover [BOT]',
  'BlazeSniper [BOT]',
  'ApexPredator [BOT]',
  'GhostRider [BOT]',
  'GigaChad [BOT]',
];

const PLATFORMS: CrossPlayPlatform[] = ['mobile', 'pc', 'tablet'];
const BRAWLER_KEYS: BrawlerId[] = ['blaze', 'viper', 'titan', 'raven', 'harmony'];

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  profile,
  selectedBrawlerId,
  onMatchReady,
  onCancel,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(10);
  const [botFillTriggered, setBotFillTriggered] = useState(false);
  const [players, setPlayers] = useState<LobbyPlayerInfo[]>([
    {
      id: profile.id,
      name: profile.username,
      brawlerId: selectedBrawlerId,
      trophies: profile.trophies,
      platform: profile.platform,
      isBot: false,
    },
  ]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const isMatchStartingRef = useRef(false);
  const currentRoomIdRef = useRef<string>('room_' + Date.now());

  useEffect(() => {
    // 1. Setup local BroadcastChannel for zero-latency inter-tab discovery
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('clash_stars_matchmaking');
      channelRef.current = bc;

      bc.onmessage = (event) => {
        const { type, player } = event.data || {};
        if (type === 'PLAYER_JOIN' && player && player.id !== profile.id) {
          setPlayers((curr) => {
            if (curr.some((p) => p.id === player.id) || curr.length >= 10) return curr;
            sound.playPlayerJoined();
            return [...curr, { ...player, isBot: false }];
          });
        }
      };

      // Broadcast self
      bc.postMessage({
        type: 'PLAYER_JOIN',
        player: {
          id: profile.id,
          name: profile.username,
          brawlerId: selectedBrawlerId,
          trophies: profile.trophies,
          platform: profile.platform,
          isBot: false,
        },
      });
    } catch {
      // BroadcastChannel fallback
    }

    // 2. Register with Server Matchmaking queue
    fetch('/api/matchmaking/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: profile.id,
        name: profile.username,
        brawlerId: selectedBrawlerId,
        trophies: profile.trophies,
        platform: profile.platform,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.roomId) {
          currentRoomIdRef.current = data.roomId;
        }
        if (data?.players && Array.isArray(data.players)) {
          setPlayers((curr) => {
            const merged = [...curr];
            data.players.forEach((p: { id: string; name: string; brawlerId: BrawlerId; trophies: number; platform: CrossPlayPlatform }) => {
              if (!merged.some((m) => m.id === p.id) && merged.length < 10) {
                merged.push({ ...p, isBot: false });
                sound.playPlayerJoined();
              }
            });
            return merged;
          });
        }
      })
      .catch(() => {});

    // Polling interval to check for other real players joining across devices
    const pollInterval = setInterval(() => {
      if (isMatchStartingRef.current) return;
      fetch('/api/matchmaking/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.roomId) {
            currentRoomIdRef.current = data.roomId;
          }
          if (data?.players && Array.isArray(data.players)) {
            setPlayers((curr) => {
              const merged = [...curr];
              data.players.forEach((p: { id: string; name: string; brawlerId: BrawlerId; trophies: number; platform: CrossPlayPlatform }) => {
                if (!merged.some((m) => m.id === p.id) && merged.length < 10) {
                  merged.push({ ...p, isBot: false });
                  sound.playPlayerJoined();
                }
              });
              if (merged.length >= 10 && !isMatchStartingRef.current) {
                startCountdown(merged);
              }
              return merged;
            });
          }
        })
        .catch(() => {});
    }, 1000);

    // 3. 10-Second Strict Countdown Timer for Real Players
    const countdownTimer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          // 10 SECONDS EXPIRED: Fill remaining slots with AI Bots!
          triggerBotFill();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const triggerBotFill = () => {
      setBotFillTriggered(true);
      sound.playCountdown(false);

      setPlayers((current) => {
        if (current.length >= 10) {
          startCountdown(current);
          return current;
        }

        const filled = [...current];
        const needed = 10 - filled.length;

        for (let i = 0; i < needed; i++) {
          const botBrawler = BRAWLER_KEYS[(i + filled.length) % BRAWLER_KEYS.length];
          const botPlatform = PLATFORMS[i % PLATFORMS.length];
          const botName = SAMPLE_BOT_NAMES[i % SAMPLE_BOT_NAMES.length];

          filled.push({
            id: `bot_fill_${i}_${Date.now()}`,
            name: botName,
            brawlerId: botBrawler,
            trophies: Math.max(0, profile.trophies + Math.floor((Math.random() - 0.5) * 60)),
            platform: botPlatform,
            isBot: true,
          });
        }

        startCountdown(filled);
        return filled;
      });
    };

    const startCountdown = (finalRoster: LobbyPlayerInfo[]) => {
      if (isMatchStartingRef.current) return;
      isMatchStartingRef.current = true;
      clearInterval(pollInterval);

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
          const rosterWithRoom = finalRoster.map((p) => ({
            ...p,
            roomId: currentRoomIdRef.current,
          }));
          onMatchReady(rosterWithRoom);
        }
      }, 700);
    };

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownTimer);
      if (channelRef.current) {
        channelRef.current.close();
      }
      fetch('/api/matchmaking/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profile.id }),
      }).catch(() => {});
    };
  }, [profile, selectedBrawlerId, onMatchReady]);

  const renderPlatformIcon = (platform: CrossPlayPlatform) => {
    if (platform === 'pc') return <span title="PC"><Monitor className="w-3.5 h-3.5 text-sky-400" /></span>;
    if (platform === 'tablet') return <span title="Tablet"><Tablet className="w-3.5 h-3.5 text-purple-400" /></span>;
    return <span title="Mobile"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /></span>;
  };

  const realPlayerCount = players.filter((p) => !p.isBot).length;
  const botCount = players.filter((p) => p.isBot).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-4 border-indigo-500 shadow-2xl p-5 sm:p-6 flex flex-col items-center">
        {/* Close Button */}
        {countdown === null && (
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500 text-indigo-300 text-xs font-bold mb-2">
            <Globe className="w-4 h-4 text-sky-400 animate-spin" />
            <span>CROSS-PLAY ATTIVO • SERVER MULTIPLAYER</span>
          </div>

          <h2 className="font-extrabold text-2xl sm:text-3xl text-white font-game tracking-wide">
            {countdown !== null ? (
              <span className="text-amber-400 animate-bounce">SCONTRO IMMINENTE!</span>
            ) : botFillTriggered ? (
              <span className="text-purple-300">COMPLETAMENTO CON I BOT...</span>
            ) : (
              'RICERCA GIOCATORI REALI...'
            )}
          </h2>

          {/* 10-Second Timer Banner */}
          <div className="mt-2 flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950 border-2 border-slate-700 shadow-inner">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-bold">
              {botFillTriggered ? (
                <span className="text-purple-300 font-black">
                  Tempo scaduto (10s): {botCount} Bot aggiunti alla lobby!
                </span>
              ) : (
                <>
                  Attesa persone reali:{' '}
                  <strong className="text-amber-400 text-sm font-game ml-1">
                    {secondsRemaining}s
                  </strong>{' '}
                  <span className="text-[10px] text-slate-400">(poi entrano i bot)</span>
                </>
              )}
            </span>
          </div>

          {/* Players Breakdown */}
          <div className="flex items-center gap-4 mt-2 text-xs font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Reali: {realPlayerCount}
            </span>
            {botCount > 0 && (
              <span className="text-purple-400 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" /> Bot: {botCount}
              </span>
            )}
            <span className="text-slate-400">Totale: {players.length}/10</span>
          </div>
        </div>

        {/* 10 Player Slots Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
          {Array.from({ length: 10 }).map((_, i) => {
            const p = players[i];
            const brawlerDef = p ? BRAWLERS[p.brawlerId] : null;

            return (
              <div
                key={i}
                className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-center border-2 transition-all ${
                  p
                    ? p.isBot
                      ? 'bg-purple-950/40 border-purple-500/80 shadow-md scale-100'
                      : 'bg-emerald-950/40 border-emerald-500 shadow-lg scale-100 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800 border-dashed opacity-50 scale-95'
                }`}
              >
                {p ? (
                  <>
                    {/* Brawler Avatar circle */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-white mb-1.5"
                      style={{ backgroundColor: brawlerDef?.color || '#3b82f6' }}
                    >
                      {brawlerDef?.avatarEmoji}
                    </div>

                    <div className="font-black text-xs text-white truncate max-w-[90px] text-center">
                      {p.name}
                    </div>

                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                      {renderPlatformIcon(p.platform)}
                      <span>{p.trophies} 🏆</span>
                    </div>

                    {/* Real Player vs Bot Badge */}
                    <span
                      className={`mt-1 px-1.5 py-0.2 rounded font-black text-[8px] uppercase tracking-wider ${
                        p.isBot
                          ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                          : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                      }`}
                    >
                      {p.isBot ? '🤖 BOT' : '🟢 REALE'}
                    </span>
                  </>
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center text-slate-600">
                    <span className="text-xl animate-pulse">?</span>
                    <span className="text-[9px] font-bold mt-1 text-slate-500">In attesa...</span>
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
            <p className="text-xs text-slate-300 mt-2 font-semibold">Tutti i 10 combattenti sono pronti!</p>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="px-7 py-2.5 rounded-2xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs border-2 border-red-400 shadow-lg active:scale-95 transition"
          >
            Annulla Matchmaking
          </button>
        )}
      </div>
    </div>
  );
};
