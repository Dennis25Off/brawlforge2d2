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

      {/* Main Hub Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8">
        {/* HERO SHOWCASE BANNER */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 md:p-10 shadow-2xl">
          {/* Subtle cosmic glow */}
          <div
            style={{ backgroundColor: currentHero.primaryColor }}
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[130px] opacity-20 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>STAGIONE 1 &bull; ARENA MULTIPLAYER ATTIVA</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                SCENDI SULLA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">PIATTAFORMA</span>
              </h1>

              <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                Platform fighter 2D in tempo reale in stile Brawlhalla. Scaglia i tuoi avversari oltre i confini del ring
                con combo aeree, smash e salti a parete.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => setShowMatchmaking(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Swords className="w-5 h-5" />
                  <span>TROVA PARTITA RAPIDA</span>
                </button>

                <button
                  onClick={() => setShowCustomizer(true)}
                  className="px-5 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Personalizza ({currentHero.name})</span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Hero Card Showcase */}
            <div className="w-full md:w-80 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-xl flex flex-col items-center text-center">
              <div
                style={{ backgroundColor: customization.skinPalette || currentHero.primaryColor }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-zinc-950 shadow-inner mb-3 border border-white/20"
              >
                {currentHero.name.slice(0, 1)}
              </div>

              <h3 className="text-lg font-black text-white">{currentHero.name}</h3>
              <span className="text-xs font-semibold text-cyan-400">{currentHero.title}</span>

              <div className="w-full mt-4 pt-3 border-t border-zinc-800 grid grid-cols-2 gap-2 text-xs text-left">
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Arma</span>
                  <span className="font-bold text-zinc-200 capitalize">{currentHero.weaponType}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Firma</span>
                  <span className="font-bold text-amber-400 truncate block">{currentHero.signatureName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK GAME MODES GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Modalità Rapide</span>
            </h2>
            <button
              onClick={() => setShowHowToPlay(true)}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Come Si Gioca</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1v1 DUEL */}
            <div
              onClick={() => setShowMatchmaking(true)}
              className="group cursor-pointer p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 transition-all duration-200 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Swords className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Duello Classificato 1v1
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Sfida un altro giocatore in matchmaking. Se nessuno si collega entro 30s, subentra un Bot
                  automaticamente.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-bold text-cyan-400">
                <span>Inizia Coda</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 4P FFA */}
            <div
              onClick={() => setShowMatchmaking(true)}
              className="group cursor-pointer p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 transition-all duration-200 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Tutti Contro Tutti 4P
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  4 guerrieri contemporaneamente sulla stessa isola. Il combattente con più KO e sopravvissuto vince.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-bold text-purple-400">
                <span>Inizia Rissa</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* BOT PRACTICE */}
            <div
              onClick={() => {
                setShowMatchmaking(true);
              }}
              className="group cursor-pointer p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 transition-all duration-200 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Allenamento Istantaneo Bot
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Lancia subito un incontro offline contro l'intelligenza artificiale per scaldarti e testare combo.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Allenati Ora</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* DAILY QUESTS & ELO PREVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Quests */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Missioni Giornaliere</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Reset in 12h</span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Infliggi 250% di danno totale</span>
                  <span className="text-[11px] text-zinc-400">Completa incontri in qualsiasi modalità</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">+100 Monete</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Esegui 2 KO con attacchi Smash</span>
                  <span className="text-[11px] text-zinc-400">Carica il colpo pesante al momento giusto</span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">+10 Gemme</span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Leaderboard Shortcut */}
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Stato Classificato</span>
                </span>
                <span className="font-mono text-xs font-bold text-amber-400">{stats.elo} ELO</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Vittorie</span>
                  <span className="font-mono text-base font-black text-emerald-400">{stats.wins}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Sconfitte</span>
                  <span className="font-mono text-base font-black text-rose-400">{stats.losses}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">KO Fatti</span>
                  <span className="font-mono text-base font-black text-amber-400">{stats.kos}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Vedi Classifica Globale Top 50</span>
            </button>
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
