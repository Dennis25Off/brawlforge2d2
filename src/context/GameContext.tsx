import React, { createContext, useContext, useEffect, useState } from 'react';
import { HeroId, PlayerCustomization, PlayerStats, CosmeticItem } from '../types/game';
import { HEROES } from '../game/heroes';
import { COSMETIC_ITEMS, LEVEL_MILESTONES } from '../game/cosmetics';
import { audio } from '../game/audio';

interface MatchResultData {
  won: boolean;
  placement: number;
  kos: number;
  damageDealt: number;
  coinsEarned: number;
  gemsEarned: number;
  xpEarned: number;
  opponentNames: string[];
}

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  stats: PlayerStats;
  customization: PlayerCustomization;
  isMuted: boolean;
  toggleMute: () => void;
  selectHero: (heroId: HeroId) => void;
  equipCosmetic: (type: 'skin' | 'weapon' | 'hat' | 'trail' | 'ko_fx', id: string) => void;
  purchaseItem: (item: CosmeticItem) => { success: boolean; message: string };
  completeMatch: (result: { won: boolean; placement: number; kos: number; damageDealt: number; opponents: string[] }) => void;
  lastMatchResult: MatchResultData | null;
  clearMatchResult: () => void;
  isMobileControlsForced: boolean;
  setIsMobileControlsForced: React.Dispatch<React.SetStateAction<boolean>>;
}

const STORAGE_KEY = 'brawlforge_player_profile_v1';

const defaultStats: PlayerStats = {
  level: 1,
  xp: 0,
  coins: 850, // generous starting bonus!
  gems: 50,   // generous starting bonus!
  elo: 1200,
  wins: 0,
  losses: 0,
  kos: 0,
  unlockedItems: ['skin_default', 'wpn_default', 'hat_none', 'trail_fire', 'ko_nova'],
};

const defaultCustomization: PlayerCustomization = {
  heroId: 'valiant_knight',
  skinPalette: '#38bdf8',
  weaponSkin: 'wpn_default',
  hat: 'hat_none',
  trail: 'trail_fire',
  koEffect: 'ko_nova',
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playerName, setPlayerNameState] = useState<string>(() => {
    return localStorage.getItem('brawlforge_player_name') || `Guerriero_${Math.floor(Math.random() * 899 + 100)}`;
  });

  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultStats, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultStats;
  });

  const [customization, setCustomization] = useState<PlayerCustomization>(() => {
    try {
      const saved = localStorage.getItem('brawlforge_customization');
      if (saved) return { ...defaultCustomization, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultCustomization;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastMatchResult, setLastMatchResult] = useState<MatchResultData | null>(null);
  const [isMobileControlsForced, setIsMobileControlsForced] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('brawlforge_customization', JSON.stringify(customization));
  }, [customization]);

  const setPlayerName = (name: string) => {
    const clean = name.trim().slice(0, 16) || 'Guerriero';
    setPlayerNameState(clean);
    localStorage.setItem('brawlforge_player_name', clean);
  };

  const toggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const selectHero = (heroId: HeroId) => {
    const hero = HEROES[heroId];
    if (hero) {
      setCustomization((prev) => ({
        ...prev,
        heroId,
        skinPalette: hero.primaryColor,
      }));
    }
  };

  const equipCosmetic = (type: 'skin' | 'weapon' | 'hat' | 'trail' | 'ko_fx', id: string) => {
    setCustomization((prev) => {
      switch (type) {
        case 'skin': {
          const item = COSMETIC_ITEMS.find((c) => c.id === id);
          return { ...prev, skinPalette: item?.previewColor || HEROES[prev.heroId].primaryColor };
        }
        case 'weapon':
          return { ...prev, weaponSkin: id };
        case 'hat':
          return { ...prev, hat: id.replace('hat_', '') };
        case 'trail':
          return { ...prev, trail: id.replace('trail_', '') };
        case 'ko_fx':
          return { ...prev, koEffect: id.replace('ko_', '') };
        default:
          return prev;
      }
    });
  };

  const purchaseItem = (item: CosmeticItem): { success: boolean; message: string } => {
    if (stats.unlockedItems.includes(item.id)) {
      return { success: false, message: 'Oggetto già sbloccato!' };
    }

    if (item.requiredLevel && stats.level < item.requiredLevel) {
      return { success: false, message: `Richiede Livello ${item.requiredLevel}` };
    }

    const costCoins = item.costCoins || 0;
    const costGems = item.costGems || 0;

    if (stats.coins < costCoins || stats.gems < costGems) {
      return { success: false, message: 'Monete o Gemme insufficienti!' };
    }

    setStats((prev) => ({
      ...prev,
      coins: prev.coins - costCoins,
      gems: prev.gems - costGems,
      unlockedItems: [...prev.unlockedItems, item.id],
    }));

    audio.playCoin();
    equipCosmetic(item.type, item.id);
    return { success: true, message: `${item.name} acquistato ed equipaggiato!` };
  };

  const completeMatch = (result: {
    won: boolean;
    placement: number;
    kos: number;
    damageDealt: number;
    opponents: string[];
  }) => {
    // Reward calculation
    const baseCoins = result.won ? 120 : 45;
    const koCoins = result.kos * 25;
    const coinsEarned = baseCoins + koCoins;

    const gemsEarned = result.won ? (result.placement === 1 ? 5 : 2) : 1;

    const baseXP = result.won ? 200 : 80;
    const koXP = result.kos * 40;
    const damageXP = Math.floor(result.damageDealt * 0.4);
    const xpEarned = baseXP + koXP + damageXP;

    let newTotalXP = stats.xp + xpEarned;
    let currentLevel = stats.level;
    let didLevelUp = false;

    // Check level ups
    for (const milestone of LEVEL_MILESTONES) {
      if (milestone.level > currentLevel && newTotalXP >= milestone.xpReq) {
        currentLevel = milestone.level;
        didLevelUp = true;
      }
    }

    if (didLevelUp) {
      audio.playLevelUp();
    }

    const eloChange = result.won ? 25 : -15;

    setStats((prev) => ({
      ...prev,
      level: currentLevel,
      xp: newTotalXP,
      coins: prev.coins + coinsEarned,
      gems: prev.gems + gemsEarned,
      elo: Math.max(1000, prev.elo + eloChange),
      wins: result.won ? prev.wins + 1 : prev.wins,
      losses: result.won ? prev.losses : prev.losses + 1,
      kos: prev.kos + result.kos,
    }));

    setLastMatchResult({
      ...result,
      coinsEarned,
      gemsEarned,
      xpEarned,
      opponentNames: result.opponents,
    });

    // Sync to global leaderboard on server
    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playerName,
        won: result.won,
        kos: result.kos,
        hero: customization.heroId,
        color: customization.skinPalette,
      }),
    }).catch((e) => console.warn('Could not post to leaderboard', e));
  };

  const clearMatchResult = () => {
    setLastMatchResult(null);
  };

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        stats,
        customization,
        isMuted,
        toggleMute,
        selectHero,
        equipCosmetic,
        purchaseItem,
        completeMatch,
        lastMatchResult,
        clearMatchResult,
        isMobileControlsForced,
        setIsMobileControlsForced,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
