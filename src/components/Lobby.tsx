import React, { useState } from 'react';
import {
  Trophy,
  Coins,
  Gem,
  Gift,
  Users,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  Globe,
  Smartphone,
  Monitor,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { BrawlerId, PlayerProfile } from '../types/game';
import { BRAWLERS } from '../data/brawlers';
import { PWAInstallButton } from './PWAInstallButton';
import { sound } from '../utils/audio';

interface LobbyProps {
  profile: PlayerProfile;
  onStartMatchmaking: () => void;
  onOpenBrawlers: () => void;
  onOpenBoxes: () => void;
  onOpenTrophyRoad: () => void;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  profile,
  onStartMatchmaking,
  onOpenBrawlers,
  onOpenBoxes,
  onOpenTrophyRoad,
  onUpdateProfile,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const selectedBrawler = BRAWLERS[profile.selectedBrawler];
  const brawlerProg = profile.brawlers[profile.selectedBrawler] || { level: 1, powerPoints: 0 };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const togglePlatform = () => {
    sound.playClick();
    onUpdateProfile((p) => {
      const nextPlatform = p.platform === 'mobile' ? 'pc' : p.platform === 'pc' ? 'tablet' : 'mobile';
      return { ...p, platform: nextPlatform };
    });
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#070b14] text-white flex flex-col justify-between overflow-hidden select-none p-3 sm:p-5">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.2)_0%,_rgba(11,15,25,0.95)_75%)] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: User Profile, Currencies, PWA and Audio */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 w-full">
        {/* Left: Player Profile & Platform */}
        <div className="flex items-center gap-3">
          {/* Avatar icon */}
          <button
            onClick={togglePlatform}
            title="Cambia Piattaforma Cross-Play"
            className="w-12 h-12 rounded-2xl bg-indigo-600 border-2 border-indigo-400 shadow-lg flex items-center justify-center text-2xl active:scale-95 transition relative"
          >
            {selectedBrawler.avatarEmoji}
            <span className="absolute -bottom-1 -right-1 text-xs">
              {profile.platform === 'pc' ? '💻' : profile.platform === 'tablet' ? '📱' : '📱'}
            </span>
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-white font-game tracking-wide">
                {profile.username}
              </span>
              <button
                onClick={togglePlatform}
                className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-[10px] font-bold text-sky-400 hover:bg-slate-700"
              >
                {profile.platform.toUpperCase()}
              </button>
            </div>

            {/* Trophy road quick badge */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenTrophyRoad();
              }}
              className="flex items-center gap-1.5 mt-0.5 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{profile.trophies} Trofei</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Center/Right: Currencies & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tokens (for Brawl Boxes) */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenBoxes();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border-2 border-sky-500 shadow-md hover:bg-slate-800 transition active:scale-95"
          >
            <span className="text-base">🎟️</span>
            <div className="text-left">
              <div className="text-[9px] text-slate-400 font-bold uppercase leading-none">Gettoni</div>
              <div className="font-extrabold text-xs sm:text-sm text-sky-300 leading-none mt-0.5">
                {profile.tokens} <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
            </div>
          </button>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border-2 border-amber-500 shadow-md">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs sm:text-sm text-amber-300">{profile.coins}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border-2 border-emerald-500 shadow-md">
            <Gem className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-xs sm:text-sm text-emerald-300">{profile.gems}</span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 transition active:scale-95"
            title={isMuted ? 'Riattiva Audio' : 'Disattiva Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          {/* PWA Fullscreen & Install Button */}
          <PWAInstallButton />
        </div>
      </header>

      {/* CENTER STAGE: Selected Brawler Showcase with 3D-style Podium */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-2 sm:my-4">
        {/* Podium Base */}
        <div className="relative flex flex-col items-center">
          {/* Animated Glow Halo */}
          <div
            className="w-56 h-56 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
            style={{ backgroundColor: selectedBrawler.color }}
          />

          {/* Brawler Character Display */}
          <div className="relative -mt-44 flex flex-col items-center">
            {/* Massive cartoon avatar emoji */}
            <div
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center text-7xl sm:text-8xl border-4 border-white shadow-[0_10px_35px_rgba(0,0,0,0.8)] transform transition-transform hover:scale-105 active:scale-95 cursor-pointer animate-float"
              style={{ backgroundColor: selectedBrawler.color }}
              onClick={() => {
                sound.playClick();
                onOpenBrawlers();
              }}
            >
              {selectedBrawler.avatarEmoji}
            </div>

            {/* Stage Pedestal */}
            <div className="w-64 sm:w-72 h-10 rounded-full bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800 border-2 border-indigo-400/60 shadow-2xl -mt-5 flex items-center justify-center">
              <div className="w-48 h-3 rounded-full bg-indigo-500/40 blur-xs" />
            </div>

            {/* Brawler Info Label */}
            <div className="mt-3 flex flex-col items-center text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                {selectedBrawler.role}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white font-game tracking-wider drop-shadow-md">
                {selectedBrawler.name}
              </h1>

              {/* Level & Power Points bar */}
              <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-700 shadow">
                <span className="text-xs font-black text-white">Livello {brawlerProg.level}</span>
                <span className="text-xs text-amber-400 font-bold">⚡ {brawlerProg.powerPoints} Punti</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION BAR: Mode Selection, Casse Quick Access, and GIOCA Button */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        {/* Left Side: Navigation Quick Buttons (Brawlers & Casse) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Brawler Roster Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenBrawlers();
            }}
            className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border-2 border-indigo-400 text-white font-black text-xs sm:text-sm shadow-xl active:scale-95 transition"
          >
            <Users className="w-5 h-5 text-indigo-400" />
            <span>BRAWLER (5)</span>
          </button>

          {/* Casse Shop Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenBoxes();
            }}
            className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border-2 border-amber-400 text-white font-black text-xs sm:text-sm shadow-xl active:scale-95 transition relative"
          >
            <Gift className="w-5 h-5 text-amber-400" />
            <span>CASSE PREMI</span>
            {profile.tokens >= 100 && (
              <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] animate-bounce">
                1 APRIBILE!
              </span>
            )}
          </button>
        </div>

        {/* Center: Mode Info & Cross-Play */}
        <div className="flex flex-col items-center text-center">
          <div className="px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 flex items-center gap-2 shadow">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-white">SOPRAVVIVENZA SOLO</strong>
            <span className="text-[10px] text-emerald-400">• BATTLE ROYALE</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-sky-400" />
            <span>Cross-play Attivo (iOS • Android • PC)</span>
          </div>
        </div>

        {/* Right Side: GIOCA (PLAY) Comic Button */}
        <div className="w-full sm:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              onStartMatchmaking();
            }}
            className="w-full sm:w-60 py-3.5 sm:py-4 rounded-3xl brawl-btn-yellow border-4 border-yellow-200 text-slate-950 font-black font-game text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(234,179,8,0.4)] transition active:scale-95 tracking-wide text-stroke-comic text-white"
          >
            <Play className="w-6 h-6 fill-current text-slate-950" />
            <span className="text-slate-950">GIOCA!</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
