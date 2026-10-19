import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { multiplayer } from '../services/multiplayer';
import { Swords, Users, Bot, Key, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface MatchmakingModalProps {
  onStartMatch: (config: {
    gameMode: '1v1' | 'ffa';
    stageId: string;
    players: Array<{ id: string; name: string; character: any; isBot: boolean }>;
  }) => void;
  onClose: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ onStartMatch, onClose }) => {
  const { playerName, customization } = useGame();
  const [selectedMode, setSelectedMode] = useState<'1v1' | 'ffa'>('1v1');
  const [selectedStage, setSelectedStage] = useState<'celestial_altar' | 'cyber_colosseum'>('celestial_altar');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchSeconds, setSearchSeconds] = useState<number>(0);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [customRoom, setCustomRoom] = useState<{ code: string; isHost: boolean; players: any[] } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // 30 seconds countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchSeconds((prev) => {
          const next = prev + 1;
          // If 30 seconds reached, trigger instant bot match fallback if not already started
          if (next >= 30) {
            setStatusMessage('30 secondi trascorsi: Inizializzazione Bot da combattimento...');
            multiplayer.startInstantBotMatch(selectedMode, { name: playerName, character: customization }, selectedStage);
          }
          return next;
        });
      }, 1000);
    } else {
      setSearchSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isSearching, selectedMode, playerName, customization, selectedStage]);

  // Listen to multiplayer socket events
  useEffect(() => {
    const unsub = multiplayer.addListener((data) => {
      if (data.type === 'MATCH_FOUND') {
        setStatusMessage('Avversario trovato! Preparazione arena...');
      } else if (data.type === 'BOT_MATCH_FILLED') {
        setStatusMessage(data.message || 'Lobby completata con Bot!');
      } else if (data.type === 'MATCH_START') {
        setIsSearching(false);
        onStartMatch({
          gameMode: data.mode || selectedMode,
          stageId: data.stageId || selectedStage,
          players: data.players || [],
        });
      } else if (data.type === 'ROOM_CREATED') {
        setCustomRoom({
          code: data.roomId,
          isHost: data.isHost,
          players: data.players,
        });
        setStatusMessage(`Stanza creata: codice ${data.roomId}`);
      } else if (data.type === 'ROOM_UPDATE') {
        setCustomRoom((prev) => (prev ? { ...prev, players: data.players } : null));
      } else if (data.type === 'ROOM_ERROR') {
        setStatusMessage(data.message);
      }
    });

    return () => unsub();
  }, [onStartMatch, selectedMode, selectedStage]);

  const handleStartSearch = () => {
    setIsSearching(true);
    setStatusMessage('Cercando guerrieri nel reame...');
    multiplayer.joinQueue(selectedMode, { name: playerName, character: customization });
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setStatusMessage('');
    multiplayer.cancelQueue();
  };

  const handleInstantBot = () => {
    setIsSearching(true);
    setStatusMessage('Caricamento partita rapida con Bot...');
    multiplayer.startInstantBotMatch(selectedMode, { name: playerName, character: customization }, selectedStage);
  };

  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    multiplayer.createCustomRoom(code, selectedMode, { name: playerName, character: customization });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    multiplayer.joinCustomRoom(roomCodeInput.trim().toUpperCase(), { name: playerName, character: customization });
  };

  const handleForceStart = () => {
    multiplayer.forceStartRoom();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Swords className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">MATCHMAKING &amp; ARENA</h2>
              <p className="text-xs text-zinc-400">Trova avversari reali o affronta bot da combattimento</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSearching) handleCancelSearch();
              onClose();
            }}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Searching Status Overlay */}
        {isSearching ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-base text-cyan-400">
                {30 - searchSeconds > 0 ? 30 - searchSeconds : 0}s
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Ricerca Avversari in Corso...</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Se nessun giocatore reale si connette entro <strong className="text-cyan-300">30 secondi</strong>, la lobby
                verrà popolata automaticamente con Bot intelligenti!
              </p>
            </div>

            {statusMessage && (
              <div className="px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-xs font-semibold text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleInstantBot}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-2 transition-all active:scale-95"
              >
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Avvia Subito con Bot</span>
              </button>
              <button
                onClick={handleCancelSearch}
                className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-xs font-bold text-rose-300 transition-all active:scale-95"
              >
                Annulla Coda
              </button>
            </div>
          </div>
        ) : customRoom ? (
          /* Custom Private Lobby View */
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 font-semibold uppercase block">Codice Stanza</span>
                <span className="font-mono text-2xl font-black text-cyan-400 tracking-wider">
                  {customRoom.code}
                </span>
              </div>
              <span className="text-xs text-zinc-400">Condividi questo codice con un amico</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300 uppercase">
                Giocatori Connessi ({customRoom.players.length}/{selectedMode === '1v1' ? 2 : 4})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {customRoom.players.map((p, i) => (
                  <div
                    key={p.id || i}
                    className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="text-sm font-bold text-zinc-200">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={handleForceStart}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
              >
                Avvia Partita (Aggiungi Bot Mancanti)
              </button>
              <button
                onClick={() => setCustomRoom(null)}
                className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Esci
              </button>
            </div>
          </div>
        ) : (
          /* Standard Mode Selection View */
          <div className="p-4 md:p-6 space-y-6">
            {/* Mode Selector */}
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                1. Scegli Modalità di Combattimento
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedMode('1v1')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    selectedMode === '1v1'
                      ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Duello 1v1 Classificato</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">3 vite a testa. Scontro competitivo puro per scalare la classifica ELO.</p>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMode('ffa')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    selectedMode === 'ffa'
                      ? 'border-purple-500 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Tutti Contro Tutti (4P FFA)</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">Caos totale a 4 combattenti. Sopravvivi e conquista il trono dell'arena.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Stage Selector */}
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                2. Seleziona Arena
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedStage('celestial_altar')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedStage === 'celestial_altar'
                      ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                  }`}
                >
                  <div className="text-sm font-bold text-white">Altare Celeste</div>
                  <div className="text-xs text-zinc-400">Rovine stellari con piattaforme morbide sospese</div>
                </button>

                <button
                  onClick={() => setSelectedStage('cyber_colosseum')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedStage === 'cyber_colosseum'
                      ? 'border-cyan-500 bg-cyan-950/20 ring-1 ring-cyan-500'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                  }`}
                >
                  <div className="text-sm font-bold text-white">Cyber Colosseo</div>
                  <div className="text-xs text-zinc-400">Arena futuristica con rampe laser ad alto impatto</div>
                </button>
              </div>
            </div>

            {/* Matchmaking Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleStartSearch}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>CERCA PARTITA RAPIDA</span>
              </button>

              <button
                onClick={handleInstantBot}
                className="py-3.5 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Allenamento Bot</span>
              </button>
            </div>

            {/* Custom Room Code Section */}
            <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleCreateRoom}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
              >
                + Crea Stanza Privata con Codice
              </button>

              <form onSubmit={handleJoinRoom} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Codice Stanza (es. X7F9)"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-cyan-500 w-40"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
                >
                  Entra
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
