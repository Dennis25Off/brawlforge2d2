import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameHUD } from './GameHUD';
import { GameOverModal } from './GameOverModal';
import { BrawlerId, CrossPlayPlatform, KillFeedEntry, PlayerProfile } from '../types/game';
import { sound } from '../utils/audio';

interface BattleArenaProps {
  profile: PlayerProfile;
  selectedBrawlerId: BrawlerId;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onExitToMenu: () => void;
  onPlayAgain: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  profile,
  selectedBrawlerId,
  onUpdateProfile,
  onExitToMenu,
  onPlayAgain,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // HUD State synced from GameEngine
  const [aliveCount, setAliveCount] = useState(10);
  const [playerHp, setPlayerHp] = useState(4000);
  const [playerMaxHp, setPlayerMaxHp] = useState(4000);
  const [playerAmmo, setPlayerAmmo] = useState(3);
  const [playerSuperCharge, setPlayerSuperCharge] = useState(0);
  const [powerCubes, setPowerCubes] = useState(0);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);
  const [poisonPhase, setPoisonPhase] = useState(1);
  const [poisonTimer, setPoisonTimer] = useState(30);

  // Game over state
  const [gameOverResult, setGameOverResult] = useState<{
    placement: number;
    kills: number;
    powerCubes: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Responsive Canvas Resizing for 60fps rendering
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const brawlerLevel = profile.brawlers[selectedBrawlerId]?.level || 1;

    // Instantiate Engine
    const engine = new GameEngine(
      canvas,
      selectedBrawlerId,
      brawlerLevel,
      profile.username,
      profile.platform,
      {
        onGameOver: (placement, kills, cubes) => {
          setGameOverResult({ placement, kills, powerCubes: cubes });

          // Calculate rewards and update profile
          let trophyDelta = 0;
          let tokensEarned = 8;
          if (placement === 1) {
            trophyDelta = 10;
            tokensEarned = 34;
          } else if (placement === 2) {
            trophyDelta = 8;
            tokensEarned = 26;
          } else if (placement === 3) {
            trophyDelta = 6;
            tokensEarned = 20;
          } else if (placement === 4) {
            trophyDelta = 4;
            tokensEarned = 16;
          } else if (placement === 5) {
            trophyDelta = 2;
            tokensEarned = 12;
          } else if (placement === 6) {
            trophyDelta = 0;
            tokensEarned = 8;
          } else if (placement === 7) {
            trophyDelta = -1;
            tokensEarned = 7;
          } else if (placement === 8) {
            trophyDelta = -2;
            tokensEarned = 6;
          } else {
            trophyDelta = -3;
            tokensEarned = 6;
          }

          onUpdateProfile((prev) => {
            const currentBrawlerProg = prev.brawlers[selectedBrawlerId] || {
              level: 1,
              powerPoints: 0,
              unlocked: true,
              trophies: 0,
            };
            const updatedBrawlerTrophies = Math.max(0, currentBrawlerProg.trophies + trophyDelta);
            const totalTrophies = Math.max(0, prev.trophies + trophyDelta);

            return {
              ...prev,
              trophies: totalTrophies,
              tokens: prev.tokens + tokensEarned,
              brawlers: {
                ...prev.brawlers,
                [selectedBrawlerId]: {
                  ...currentBrawlerProg,
                  trophies: updatedBrawlerTrophies,
                },
              },
              stats: {
                ...prev.stats,
                matchesPlayed: prev.stats.matchesPlayed + 1,
                victories: placement === 1 ? prev.stats.victories + 1 : prev.stats.victories,
                totalKills: prev.stats.totalKills + kills,
              },
            };
          });
        },
        onAliveChange: (count) => {
          setAliveCount(count);
        },
        onKillFeed: (entry) => {
          setKillFeed((feed) => [...feed.slice(-4), entry]);
        },
        onPlayerHpChange: (hp, maxHp, ammo, superCharge, cubes) => {
          setPlayerHp(hp);
          setPlayerMaxHp(maxHp);
          setPlayerAmmo(ammo);
          setPlayerSuperCharge(superCharge);
          setPowerCubes(cubes);
        },
        onPoisonPhaseChange: (phase, timeToNext) => {
          setPoisonPhase(phase);
          setPoisonTimer(timeToNext);
        },
      }
    );

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [profile.username, profile.platform, profile.brawlers, selectedBrawlerId, onUpdateProfile]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#090d16] overflow-hidden select-none touch-none">
      {/* 60FPS Game Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />

      {/* Interactive HUD & Controls */}
      {engineRef.current && (
        <GameHUD
          engine={engineRef.current}
          aliveCount={aliveCount}
          playerHp={playerHp}
          playerMaxHp={playerMaxHp}
          playerAmmo={playerAmmo}
          playerSuperCharge={playerSuperCharge}
          powerCubes={powerCubes}
          killFeed={killFeed}
          poisonPhase={poisonPhase}
          poisonTimer={poisonTimer}
          onExitMatch={() => {
            sound.playClick();
            onExitToMenu();
          }}
        />
      )}

      {/* Game Over / Victory Modal */}
      {gameOverResult && (
        <GameOverModal
          placement={gameOverResult.placement}
          kills={gameOverResult.kills}
          powerCubes={gameOverResult.powerCubes}
          onPlayAgain={onPlayAgain}
          onExitToMenu={onExitToMenu}
        />
      )}
    </div>
  );
};
