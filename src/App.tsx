/**
 * Clash Stars - Brawl Stars Style Multiplayer & Battle Royale Game
 * Cross-play ready, 5 unique brawlers, shrinking poison storm, chests & progression.
 */

import React, { useState, useEffect } from 'react';
import { loadPlayerProfile, savePlayerProfile } from './utils/storage';
import { BrawlerId, PlayerProfile } from './types/game';
import { Lobby } from './components/Lobby';
import { BattleArena } from './components/BattleArena';
import { MatchmakingModal } from './components/MatchmakingModal';
import { BrawlerSelectModal } from './components/BrawlerSelectModal';
import { BoxesModal } from './components/BoxesModal';
import { TrophyRoadModal } from './components/TrophyRoadModal';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadPlayerProfile());
  const [currentView, setCurrentView] = useState<'lobby' | 'matchmaking' | 'battle'>('lobby');

  // Modals state
  const [showBrawlersModal, setShowBrawlersModal] = useState(false);
  const [showBoxesModal, setShowBoxesModal] = useState(false);
  const [showTrophyRoadModal, setShowTrophyRoadModal] = useState(false);

  // Sync profile to local storage on change
  useEffect(() => {
    savePlayerProfile(profile);
  }, [profile]);

  const updateProfile = (updater: (prev: PlayerProfile) => PlayerProfile) => {
    setProfile((prev) => {
      const next = updater(prev);
      savePlayerProfile(next);
      return next;
    });
  };

  const handleSelectBrawler = (id: BrawlerId) => {
    updateProfile((p) => ({ ...p, selectedBrawler: id }));
  };

  const handleStartMatchmaking = () => {
    setCurrentView('matchmaking');
  };

  const handleMatchReady = () => {
    setCurrentView('battle');
  };

  const handleExitToMenu = () => {
    setCurrentView('lobby');
  };

  const handlePlayAgain = () => {
    setCurrentView('matchmaking');
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#070b14] overflow-hidden select-none touch-none">
      {/* 1. Main Lobby View */}
      {currentView === 'lobby' && (
        <Lobby
          profile={profile}
          onStartMatchmaking={handleStartMatchmaking}
          onOpenBrawlers={() => setShowBrawlersModal(true)}
          onOpenBoxes={() => setShowBoxesModal(true)}
          onOpenTrophyRoad={() => setShowTrophyRoadModal(true)}
          onUpdateProfile={updateProfile}
        />
      )}

      {/* 2. Fast Matchmaking Queue View */}
      {currentView === 'matchmaking' && (
        <>
          <Lobby
            profile={profile}
            onStartMatchmaking={handleStartMatchmaking}
            onOpenBrawlers={() => setShowBrawlersModal(true)}
            onOpenBoxes={() => setShowBoxesModal(true)}
            onOpenTrophyRoad={() => setShowTrophyRoadModal(true)}
            onUpdateProfile={updateProfile}
          />
          <MatchmakingModal
            profile={profile}
            selectedBrawlerId={profile.selectedBrawler}
            onMatchReady={handleMatchReady}
            onCancel={() => setCurrentView('lobby')}
          />
        </>
      )}

      {/* 3. Battle Arena View */}
      {currentView === 'battle' && (
        <BattleArena
          profile={profile}
          selectedBrawlerId={profile.selectedBrawler}
          onUpdateProfile={updateProfile}
          onExitToMenu={handleExitToMenu}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Brawler Selection & Upgrade Modal */}
      {showBrawlersModal && (
        <BrawlerSelectModal
          profile={profile}
          onSelectBrawler={handleSelectBrawler}
          onUpdateProfile={updateProfile}
          onClose={() => setShowBrawlersModal(false)}
        />
      )}

      {/* Brawl Boxes & Unboxing Modal */}
      {showBoxesModal && (
        <BoxesModal
          profile={profile}
          onUpdateProfile={updateProfile}
          onClose={() => setShowBoxesModal(false)}
        />
      )}

      {/* Trophy Road Milestone Modal */}
      {showTrophyRoadModal && (
        <TrophyRoadModal
          profile={profile}
          onUpdateProfile={updateProfile}
          onClose={() => setShowTrophyRoadModal(false)}
        />
      )}
    </div>
  );
}
