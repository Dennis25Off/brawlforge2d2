import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { GameCanvas } from './components/GameCanvas';
import { MatchmakingModal } from './components/MatchmakingModal';
import { ShopModal } from './components/ShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CustomizerModal } from './components/CustomizerModal';
import { VictoryModal } from './components/VictoryModal';
import { OrientationPrompt } from './components/OrientationPrompt';
import { HEROES } from './game/heroes';
import {
  Swords,
  Users,
  User,
  Bot,
  Sparkles,
  Trophy,
  Shield,
  Zap,
  Flame,
  Smartphone,
  ChevronRight,
  Target,
  Gift,
  HelpCircle
} from 'lucide-react';

function MainApp() {
  const { customization, playerName, stats, lastMatchResult, completeMatch, clearMatchResult } = useGame();

  const [inGame, setInGame] = useState<boolean>(false);
  const [activeMatchConfig, setActiveMatchConfig] = useState<{
    gameMode: '1v1' | 'ffa';
    stageId: string;
    players: Array<{ id: string; name: string; character: any; isBot: boolean }>;
  } | null>(null);

  // Modals state
  const [showMatchmaking, setShowMatchmaking] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showCustomizer, setShowCustomizer] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const currentHero = HEROES[customization.heroId] || HEROES.valiant_knight;

  const handleStartMatch = (config: {
    gameMode: '1v1' | 'ffa';
    stageId: string;
    players: Array<{ id: string; name: string; character: any; isBot: boolean }>;
  }) => {
    setActiveMatchConfig(config);
    setShowMatchmaking(false);
    setInGame(true);
  };

  const handleMatchEnd = (results: {
    won: boolean;
    placement: number;
    kos: number;
    damageDealt: number;
    opponents: string[];
  }) => {
    completeMatch(results);
  };

  const handlePlayAgain = () => {
    clearMatchResult();
    if (activeMatchConfig) {
      setInGame(false);
      setTimeout(() => {
        setInGame(true);
      }, 100);
    } else {
      setShowMatchmaking(true);
    }
  };

  const handleReturnToLobby = () => {
    clearMatchResult();
    setInGame(false);
    setActiveMatchConfig(null);
  };

  // If in game, render only the full-screen GameCanvas + Game Over modal
  if (inGame && activeMatchConfig) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-black touch-combat-area">
        <OrientationPrompt />
        <GameCanvas
          stageId={activeMatchConfig.stageId}
          gameMode={activeMatchConfig.gameMode}
          matchPlayers={activeMatchConfig.players}
          onMatchEnd={handleMatchEnd}
          onExit={handleReturnToLobby}
        />

        {lastMatchResult && (
          <VictoryModal onPlayAgain={handlePlayAgain} onReturnToLobby={handleReturnToLobby} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <OrientationPrompt />
      {/* Top Navigation */}
      <Navbar
        onOpenMatchmaking={() => setShowMatchmaking(true)}
        onOpenCustomizer={() => setShowCustomizer(true)}
        onOpenShop={() => setShowShop(true)}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />

      {/* Main Hub Body - Mobile-First & Accessible */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-4 sm:gap-6 md:gap-8">
        {/* HERO SHOWCASE CARD (Streamlined for Mobile & Desktop) */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-4 sm:p-6 md:p-8 shadow-2xl">
          {/* Subtle cosmic glow */}
          <div
            style={{ backgroundColor: currentHero.primaryColor }}
            className="absolute -top-20 -right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[110px] opacity-25 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
            {/* Left: Quick Battle Headline & CTAs */}
            <div className="w-full md:max-w-xl text-center md:text-left space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/70 text-[10px] sm:text-xs font-bold text-cyan-300">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>STAGIONE 1 &bull; ARENA ATTIVA</span>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white uppercase leading-tight">
                SCENDI SULLA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">PIATTAFORMA</span>
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto md:mx-0">
                Lotta aerea, attacchi pesanti e salti a parete. Scaglia i tuoi avversari oltre i confini del ring!
              </p>

              {/* Big Touch-Friendly Primary Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-2.5 pt-1.5">
                <button
                  onClick={() => setShowMatchmaking(true)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <Swords className="w-4 h-4" />
                  <span>COMBATTI SUBITO</span>
                </button>

                <button
                  onClick={() => setShowCustomizer(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Personalizza ({currentHero.name})</span>
                </button>
              </div>
            </div>

            {/* Right: Compact Hero Badge */}
            <div
              onClick={() => setShowCustomizer(true)}
              className="cursor-pointer w-full md:w-72 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/90 shadow-xl flex items-center md:flex-col text-left md:text-center gap-3.5 transition-all active:scale-[0.98]"
            >
              <div
                style={{ backgroundColor: customization.skinPalette || currentHero.primaryColor }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl text-zinc-950 shadow-inner shrink-0 border border-white/20"
              >
                {currentHero.name.slice(0, 1)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-black text-white truncate">{currentHero.name}</h3>
                <span className="text-[11px] font-semibold text-cyan-400 block truncate">{currentHero.title}</span>

                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-bold text-zinc-300 capitalize">
                    {currentHero.weaponType}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-bold text-amber-400 truncate">
                    {currentHero.signatureName}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-zinc-600 md:hidden shrink-0" />
            </div>
          </div>
        </div>

        {/* QUICK GAME MODES (Mobile-Optimized Touch Cards) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-black text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Modalità di Gioco</span>
            </h2>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="text-[11px] sm:text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Come Si Gioca</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1v1 DUEL */}
            <div
              onClick={() => setShowMatchmaking(true)}
              className="group cursor-pointer p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 transition-all shadow-md flex items-center sm:flex-col sm:items-start justify-between gap-3 active:scale-[0.98]"
            >
              <div className="flex items-center sm:items-start gap-3 sm:flex-col">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                    Duello 1v1
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                    Sfida 1v1 competitiva con sistema ELO. Bot automatico se nessun avversario.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 sm:self-end" />
            </div>

            {/* 4P FFA */}
            <div
              onClick={() => setShowMatchmaking(true)}
              className="group cursor-pointer p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 transition-all shadow-md flex items-center sm:flex-col sm:items-start justify-between gap-3 active:scale-[0.98]"
            >
              <div className="flex items-center sm:items-start gap-3 sm:flex-col">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                    Rissa 4P
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                    4 guerrieri contemporaneamente nell'arena. Vince chi fa più KO.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 sm:self-end" />
            </div>

            {/* BOT PRACTICE */}
            <div
              onClick={() => setShowMatchmaking(true)}
              className="group cursor-pointer p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 transition-all shadow-md flex items-center sm:flex-col sm:items-start justify-between gap-3 active:scale-[0.98]"
            >
              <div className="flex items-center sm:items-start gap-3 sm:flex-col">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Allenamento Bot
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                    Partita immediata contro l'IA per testare combo, scudo e salti.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 sm:self-end" />
            </div>
          </div>
        </div>

        {/* DAILY QUESTS & ELO PREVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Quick Stats & Leaderboard */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Stato Classificato</span>
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">{stats.elo} ELO</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Vittorie</span>
                  <span className="font-mono text-sm sm:text-base font-black text-emerald-400">{stats.wins}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Sconfitte</span>
                  <span className="font-mono text-sm sm:text-base font-black text-rose-400">{stats.losses}</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">KO Fatti</span>
                  <span className="font-mono text-sm sm:text-base font-black text-amber-400">{stats.kos}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="mt-3 w-full py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Vedi Classifica Top 50</span>
            </button>
          </div>

          {/* Daily Quests */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Missioni Giornaliere</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Reset 12h</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Infliggi 250% danno totale</span>
                  <span className="text-[10px] text-zinc-400">Incontri in qualsiasi modalità</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0 ml-2">+100 Monete</span>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Esegui 2 KO con attacco Smash</span>
                  <span className="text-[10px] text-zinc-400">Carica il colpo pesante</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-cyan-400 shrink-0 ml-2">+10 Gemme</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* HOW TO PLAY MODAL */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span>GUIDA AI COMANDI &amp; MECCANICHE</span>
            </h3>

            <div className="space-y-3 text-xs text-zinc-300 mt-4 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <strong className="text-cyan-400 block mb-0.5">Barriera Anti-Caduta &amp; Knockback KO</strong>
                Non si può cadere nel vuoto! Il fondo dell'arena è protetto da un pavimento titanico anti-caduta.
                I KO avvengono lanciando gli avversari ad alto danno (&gt;100%) oltre i bordi laterali o verso l'alto!
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <strong className="text-amber-400 block mb-0.5">Doppio Salto, Katana &amp; Wall Kick</strong>
                Premi Salto in aria per eseguire il <strong>Doppio Salto</strong> con anello dorato. I salti si ricaricano
                toccando le pareti o atterrando. Prova anche il nuovo guerriero <em>Ren Jinrai</em> con la sua rapida Katana!
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <strong className="text-purple-400 block mb-0.5">Controlli Tastiera</strong>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 mt-1">
                  <li><kbd className="text-white font-mono">A / D</kbd>: Muoviti Sinistra / Destra</li>
                  <li><kbd className="text-white font-mono">Spazio</kbd>: Salto e Doppio Salto</li>
                  <li><kbd className="text-white font-mono">J</kbd>: Colpo Leggero (combo veloci e direzionali)</li>
                  <li><kbd className="text-white font-mono">K</kbd>: Attacco Pesante Smash (tieni premuto per caricare!)</li>
                  <li><kbd className="text-white font-mono">L</kbd>: Speciale Recupero Verso l'Alto</li>
                  <li><kbd className="text-white font-mono">Shift / I</kbd>: Schivata / Dash con invulnerabilità</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
            >
              Chiudi Guida
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODALS */}
      {showMatchmaking && (
        <MatchmakingModal onStartMatch={handleStartMatch} onClose={() => setShowMatchmaking(false)} />
      )}
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showCustomizer && <CustomizerModal onClose={() => setShowCustomizer(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
