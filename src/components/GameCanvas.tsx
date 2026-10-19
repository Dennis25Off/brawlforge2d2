import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FighterEntity, GameParticle, HeroId, ProjectileEntity, Stage } from '../types/game';
import { STAGES } from '../game/stages';
import { HEROES } from '../game/heroes';
import { calculateCamera, renderGame } from '../game/render';
import { updateFighterPhysics, resolveHitboxCollision, updateProjectiles } from '../game/physics';
import { computeBotInputs } from '../game/botAI';
import { audio } from '../game/audio';
import { multiplayer } from '../services/multiplayer';
import { MobileControls } from './MobileControls';
import { HUD } from './HUD';
import { useGame } from '../context/GameContext';

interface GameCanvasProps {
  stageId?: string;
  gameMode: '1v1' | 'ffa';
  matchPlayers: Array<{ id: string; name: string; character: any; isBot: boolean }>;
  onMatchEnd: (results: {
    won: boolean;
    placement: number;
    kos: number;
    damageDealt: number;
    opponents: string[];
  }) => void;
  onExit: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stageId = 'celestial_altar',
  gameMode,
  matchPlayers,
  onMatchEnd,
  onExit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { customization, playerName, isMobileControlsForced } = useGame();

  const [fighters, setFighters] = useState<FighterEntity[]>([]);
  const [matchTimeLeft, setMatchTimeLeft] = useState<number>(240); // 4 minutes
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [matchEnded, setMatchEnded] = useState<boolean>(false);

  // Mutable refs for high frequency 60fps loop
  const fightersRef = useRef<FighterEntity[]>([]);
  const particlesRef = useRef<GameParticle[]>([]);
  const projectilesRef = useRef<ProjectileEntity[]>([]);
  const screenShakeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const frameTickRef = useRef<number>(0);
  const stageRef = useRef<Stage>(STAGES[stageId] || STAGES.celestial_altar);

  // Player inputs state
  const playerInputsRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    light: false,
    heavy: false,
    special: false,
    dodge: false,
    shield: false,
  });

  const localPlayerId = multiplayer.getPlayerId() || 'local_player';

  // Detect touch
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia('(pointer: coarse)').matches ||
          isMobileControlsForced
      );
    };
    checkTouch();

    const onFirstTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', onFirstTouch);
    };
    window.addEventListener('touchstart', onFirstTouch, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onFirstTouch);
    };
  }, [isMobileControlsForced]);

  // Audio start
  useEffect(() => {
    audio.startBattleMusic();
    audio.playGong();
    return () => {
      audio.stopBattleMusic();
    };
  }, []);

  // Initialize Fighters
  useEffect(() => {
    const stage = stageRef.current;
    const initialFighters: FighterEntity[] = [];

    // Ensure local player is included
    const hasLocal = matchPlayers.some((p) => p.id === localPlayerId);
    const allPlayersToSpawn = hasLocal
      ? matchPlayers
      : [
          {
            id: localPlayerId,
            name: playerName,
            character: customization,
            isBot: false,
          },
          ...matchPlayers.filter((p) => p.id !== localPlayerId),
        ];

    allPlayersToSpawn.forEach((p, index) => {
      const spawnPt = stage.spawnPoints[index % stage.spawnPoints.length];
      const heroId = (p.character?.heroId as HeroId) || 'valiant_knight';
      const hero = HEROES[heroId] || HEROES.valiant_knight;

      initialFighters.push({
        id: p.id,
        name: p.name,
        isBot: p.isBot,
        botDifficulty: 'medium',
        customization: {
          heroId,
          skinPalette: p.character?.skinPalette || hero.primaryColor,
          weaponSkin: p.character?.weaponSkin || 'wpn_default',
          hat: p.character?.hat || 'none',
          trail: p.character?.trail || 'fire',
          koEffect: p.character?.koEffect || 'nova',
        },
        x: spawnPt.x,
        y: spawnPt.y,
        vx: 0,
        vy: 0,
        facing: index % 2 === 0 ? 1 : -1,
        width: 38,
        height: 52,
        isGrounded: false,
        isWallSliding: false,
        wallSlideSide: 1,
        jumpsLeft: 2,
        maxJumps: 2,
        prevJumpInput: false,
        damagePercent: 0,
        stocks: 3,
        actionState: 'idle',
        stateTimer: 0,
        activeAttack: null,
        attackFrame: 0,
        hasHitInCurrentAttack: false,
        hitstunTimer: 0,
        dodgeCooldown: 0,
        invincibleTimer: 20, // 0.3s quick spawn shield
        shieldHealth: 100,
        isShielding: false,
        chargeTime: 0,
        isCharging: false,
        trailPositions: [],
        matchKOs: 0,
        matchDamageDealt: 0,
        emoteTimer: 0,
        currentEmote: null,
      });
    });

    fightersRef.current = initialFighters;
    setFighters([...initialFighters]);
  }, [matchPlayers, stageId, localPlayerId, playerName, customization]);

  // Handle remote multiplayer socket messages
  useEffect(() => {
    const unsubscribe = multiplayer.addListener((msg) => {
      if (msg.type === 'PLAYER_SYNC') {
        const remote = fightersRef.current.find((f) => f.id === msg.playerId);
        if (remote && !remote.isBot) {
          // Lerp/smooth position
          remote.x = remote.x * 0.4 + msg.state.x * 0.6;
          remote.y = remote.y * 0.4 + msg.state.y * 0.6;
          remote.vx = msg.state.vx;
          remote.vy = msg.state.vy;
          remote.facing = msg.state.facing;
          remote.actionState = msg.state.actionState;
          remote.damagePercent = msg.state.damagePercent;
          remote.stocks = msg.state.stocks;
        }
      } else if (msg.type === 'ATTACK_HIT') {
        const victim = fightersRef.current.find((f) => f.id === msg.targetId);
        if (victim) {
          victim.damagePercent += msg.damage;
          if (msg.knockback) {
            victim.vx = msg.knockback.vx;
            victim.vy = msg.knockback.vy;
          }
          victim.actionState = 'hitstun';
          victim.hitstunTimer = Math.min(32, Math.max(6, Math.floor(msg.damage * 1.1)));
          audio.playHit(msg.damage, msg.damage > 12);
          screenShakeRef.current = 10;
        }
      } else if (msg.type === 'PLAYER_KO') {
        const victim = fightersRef.current.find((f) => f.id === msg.victimId);
        if (victim) {
          victim.stocks = msg.remainingStocks;
          victim.actionState = 'ko';
          victim.stateTimer = 60;
          audio.playKO();
          screenShakeRef.current = 18;
        }
      } else if (msg.type === 'EMOTE') {
        const fighter = fightersRef.current.find((f) => f.id === msg.playerId);
        if (fighter) {
          fighter.currentEmote = msg.emote;
          fighter.emoteTimer = 75;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid scrolling on space or arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          playerInputsRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          playerInputsRef.current.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
          playerInputsRef.current.up = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          playerInputsRef.current.down = true;
          break;
        case 'Space':
          playerInputsRef.current.jump = true;
          break;
        case 'KeyJ':
          playerInputsRef.current.light = true;
          break;
        case 'KeyK':
          playerInputsRef.current.heavy = true;
          break;
        case 'KeyL':
          playerInputsRef.current.special = true;
          break;
        case 'KeyC':
        case 'KeyB':
          playerInputsRef.current.shield = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyI':
          playerInputsRef.current.dodge = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          playerInputsRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          playerInputsRef.current.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
          playerInputsRef.current.up = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          playerInputsRef.current.down = false;
          break;
        case 'Space':
          playerInputsRef.current.jump = false;
          break;
        case 'KeyJ':
          playerInputsRef.current.light = false;
          break;
        case 'KeyK':
          playerInputsRef.current.heavy = false;
          break;
        case 'KeyL':
          playerInputsRef.current.special = false;
          break;
        case 'KeyC':
        case 'KeyB':
          playerInputsRef.current.shield = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyI':
          playerInputsRef.current.dodge = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const spawnParticle = useCallback((p: Omit<GameParticle, 'id'>) => {
    particlesRef.current.push({
      ...p,
      id: `p_${Math.random()}`,
    });
    if (particlesRef.current.length > 120) {
      particlesRef.current.shift();
    }
  }, []);

  const handlePlaySound = useCallback((soundName: string, payload?: any) => {
    switch (soundName) {
      case 'jump':
        audio.playJump();
        break;
      case 'double_jump':
        audio.playDoubleJump();
        break;
      case 'swing':
        audio.playAttackSwing(payload?.type || 'light');
        break;
      case 'hit':
        audio.playHit(payload?.damage, payload?.isHeavy);
        break;
      case 'shield_block':
        audio.playShieldBlock();
        break;
      case 'shield_open':
        audio.playShieldOpen();
        break;
      case 'ko':
        audio.playKO();
        break;
      case 'dodge':
        audio.playDodge();
        break;
    }
  }, []);

  // Check Game Over Condition
  const checkGameOver = useCallback(() => {
    if (matchEnded) return;

    const aliveFighters = fightersRef.current.filter((f) => f.stocks > 0);
    const localFighter = fightersRef.current.find((f) => f.id === localPlayerId);

    // If only 1 player or team remains alive
    if (aliveFighters.length <= 1) {
      setMatchEnded(true);
      const isWinner = localFighter && localFighter.stocks > 0;
      const placement = isWinner ? 1 : 2;

      const opponents = fightersRef.current.filter((f) => f.id !== localPlayerId).map((f) => f.name);

      setTimeout(() => {
        onMatchEnd({
          won: !!isWinner,
          placement,
          kos: localFighter?.matchKOs || 0,
          damageDealt: localFighter?.matchDamageDealt || 0,
          opponents,
        });
      }, 1200);
    }
  }, [matchEnded, localPlayerId, onMatchEnd]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let timerInterval: any = setInterval(() => {
      setMatchTimeLeft((prev) => {
        if (prev <= 1) {
          checkGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const gameLoop = () => {
      frameTickRef.current++;
      const stage = stageRef.current;
      const allFighters = fightersRef.current;
      const allActiveHitboxes: any[] = [];

      // 1. Process Local Player Physics
      const localFighter = allFighters.find((f) => f.id === localPlayerId);
      if (localFighter) {
        const { hitboxes, koOccurred, spawnedProjectiles } = updateFighterPhysics(
          localFighter,
          playerInputsRef.current,
          stage,
          spawnParticle,
          handlePlaySound
        );
        allActiveHitboxes.push(...hitboxes);
        if (spawnedProjectiles && spawnedProjectiles.length > 0) {
          projectilesRef.current.push(...spawnedProjectiles);
        }

        if (koOccurred) {
          screenShakeRef.current = 18;
          multiplayer.sendPlayerKO(localFighter.id, 'stage', localFighter.stocks);
          checkGameOver();
        }

        // Broadcast sync to multiplayer server every 2 frames
        if (frameTickRef.current % 2 === 0) {
          multiplayer.sendPlayerSync({
            x: Math.round(localFighter.x),
            y: Math.round(localFighter.y),
            vx: localFighter.vx,
            vy: localFighter.vy,
            facing: localFighter.facing,
            actionState: localFighter.actionState,
            damagePercent: localFighter.damagePercent,
            stocks: localFighter.stocks,
          });
        }
      }

      // 2. Process Bots
      allFighters.forEach((fighter) => {
        if (fighter.isBot) {
          const botInputs = computeBotInputs(fighter, allFighters, stage, frameTickRef.current);
          const { hitboxes, koOccurred, spawnedProjectiles } = updateFighterPhysics(
            fighter,
            botInputs,
            stage,
            spawnParticle,
            handlePlaySound
          );
          allActiveHitboxes.push(...hitboxes);
          if (spawnedProjectiles && spawnedProjectiles.length > 0) {
            projectilesRef.current.push(...spawnedProjectiles);
          }

          if (koOccurred) {
            screenShakeRef.current = 14;
            // Attribute KO to last attacker if available
            if (localFighter) {
              localFighter.matchKOs++;
            }
            checkGameOver();
          }
        }
      });

      // 3. Update timers for remote human players (ensures invincibility counts down!)
      for (const f of allFighters) {
        if (f.id !== localPlayerId && !f.isBot) {
          if (f.invincibleTimer > 0) f.invincibleTimer--;
          if (f.dodgeCooldown > 0) f.dodgeCooldown--;
          if (f.hitstunTimer > 0) f.hitstunTimer--;
        }
      }

      // 4. Resolve Hitbox Collisions
      for (const hitbox of allActiveHitboxes) {
        for (const target of allFighters) {
          if (hitbox.ownerId !== target.id) {
            const hasConnected = resolveHitboxCollision(
              hitbox,
              target,
              stage,
              spawnParticle,
              handlePlaySound
            );

            if (hasConnected) {
              screenShakeRef.current = Math.min(20, screenShakeRef.current + 8);

              // Track attacker damage stats
              const attacker = allFighters.find((f) => f.id === hitbox.ownerId);
              if (attacker) {
                attacker.matchDamageDealt += hitbox.damage;
                attacker.hasHitInCurrentAttack = true;
              }

              // Multiplayer broadcast
              if (hitbox.ownerId === localPlayerId) {
                multiplayer.sendAttackHit(
                  target.id,
                  hitbox.damage,
                  { vx: target.vx, vy: target.vy },
                  hitbox.attackType,
                  { x: target.x, y: target.y }
                );
              }
            }
          }
        }
      }

      // 4. Update Projectiles
      projectilesRef.current = updateProjectiles(
        projectilesRef.current,
        allFighters,
        stage,
        spawnParticle,
        handlePlaySound
      );

      // 5. Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 6. Update Screen Shake
      if (screenShakeRef.current > 0) {
        screenShakeRef.current *= 0.88;
        if (screenShakeRef.current < 0.2) screenShakeRef.current = 0;
      }

      // 7. Camera & Render
      const camera = calculateCamera(allFighters, stage, canvas.width, canvas.height);
      renderGame(
        ctx,
        canvas.width,
        canvas.height,
        stage,
        allFighters,
        particlesRef.current,
        projectilesRef.current,
        camera,
        screenShakeRef.current
      );

      // Periodically update HUD React state
      if (frameTickRef.current % 4 === 0) {
        setFighters([...allFighters]);
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Resize canvas to fill viewport
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(timerInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [localPlayerId, spawnParticle, handlePlaySound, checkGameOver]);

  const handleMobileInputUpdate = (inputs: any) => {
    playerInputsRef.current = { ...playerInputsRef.current, ...inputs };
  };

  const handleSendEmote = (emoji: string) => {
    const local = fightersRef.current.find((f) => f.id === localPlayerId);
    if (local) {
      local.currentEmote = emoji;
      local.emoteTimer = 80;
      multiplayer.sendEmote(emoji);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 select-none">
      {/* 2D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top HUD */}
      <HUD
        fighters={fighters}
        timeLeftSeconds={matchTimeLeft}
        onLeaveMatch={onExit}
        isOnline={multiplayer.isConnected()}
      />

      {/* Touch Controls for Mobile */}
      {isTouchDevice && (
        <MobileControls onInputUpdate={handleMobileInputUpdate} onEmote={handleSendEmote} />
      )}

      {/* Keyboard Helper Overlay for Desktop */}
      {!isTouchDevice && (
        <div className="absolute bottom-3 left-4 pointer-events-none hidden md:flex items-center gap-3 text-[11px] text-zinc-400 bg-zinc-900/80 border border-zinc-800/90 px-3.5 py-1.5 rounded-xl backdrop-blur-md shadow-lg">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono">A/D</kbd>{' '}
            Muovi
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono">Space</kbd>{' '}
            Doppio Salto
          </span>
          <span className="text-cyan-400 font-semibold">
            <kbd className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/70 text-cyan-300 font-mono">C</kbd>{' '}
            Scudo (Anti-Stun)
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono">J</kbd>{' '}
            Leggero
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono">K</kbd>{' '}
            Pesante
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono">L</kbd>{' '}
            Special
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono">Shift</kbd>{' '}
            Schiva
          </span>
        </div>
      )}
    </div>
  );
};
