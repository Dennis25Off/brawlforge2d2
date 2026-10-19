import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Flame } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import { BRAWLERS } from '../data/brawlers';
import { KillFeedEntry } from '../types/game';

interface GameHUDProps {
  engine: GameEngine;
  aliveCount: number;
  playerHp: number;
  playerMaxHp: number;
  playerAmmo: number;
  playerSuperCharge: number;
  powerCubes: number;
  killFeed: KillFeedEntry[];
  poisonPhase: number;
  poisonTimer: number;
  onExitMatch: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  engine,
  aliveCount,
  playerSuperCharge,
  powerCubes,
  killFeed,
  poisonTimer,
  onExitMatch,
}) => {
  const leftTouchRef = useRef<HTMLDivElement>(null);
  const rightTouchRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Multitouch touch identifiers tracking
  const leftTouchIdRef = useRef<number | null>(null);
  const rightTouchIdRef = useRef<number | null>(null);
  const rightTouchStartTime = useRef<number>(0);

  // Left joystick visual state
  const [leftStick, setLeftStick] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0,
  });

  // Right attack joystick visual state
  const [rightStick, setRightStick] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0,
  });

  const playerBrawler = BRAWLERS[engine.player.brawlerId];
  const isSuperReady = playerSuperCharge >= 100;

  // --- DESKTOP KEYBOARD & MOUSE CONTROLS ---
  useEffect(() => {
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      updateKeyboardMovement();

      if (e.key === ' ' || e.key.toLowerCase() === 'r') {
        engine.firePlayerSuper();
      } else if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'q') {
        engine.usePlayerGadget();
      } else if (e.key.toLowerCase() === 'f') {
        engine.firePlayerNormalAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
      updateKeyboardMovement();
    };

    const updateKeyboardMovement = () => {
      let dx = 0;
      let dy = 0;
      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }
      engine.moveVector = { x: dx, y: dy };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = engine.canvas.getBoundingClientRect();
      const screenCenterX = rect.width / 2;
      const screenCenterY = rect.height / 2;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const angle = Math.atan2(mouseY - screenCenterY, mouseX - screenCenterX);
      if (!engine.aimVector.isAiming && !engine.aimVector.isSuperAiming) {
        engine.player.rotation = angle;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      if (e.button === 0) {
        const rect = engine.canvas.getBoundingClientRect();
        const angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
        engine.firePlayerNormalAttack(angle);
      } else if (e.button === 2) {
        const rect = engine.canvas.getBoundingClientRect();
        const angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
        engine.firePlayerSuper(angle);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [engine]);

  // --- NATIVE MULTITOUCH CONTROLS (INDEPENDENT IDENTIFIER TRACKING) ---

  // Global window touch listeners to prevent sticky controls if finger glides off the element
  useEffect(() => {
    const onWindowTouchMove = (e: TouchEvent) => {
      // 1. Process Left Stick if its touch identifier is moving
      if (leftTouchIdRef.current !== null && leftTouchRef.current) {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          if (t.identifier === leftTouchIdRef.current) {
            const rect = leftTouchRef.current.getBoundingClientRect();
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;
            const dx = x - leftStick.startX;
            const dy = y - leftStick.startY;
            const dist = Math.hypot(dx, dy);
            const maxRadius = 50;
            const normDist = Math.min(dist, maxRadius);
            const angle = Math.atan2(dy, dx);

            const clampedX = leftStick.startX + Math.cos(angle) * normDist;
            const clampedY = leftStick.startY + Math.sin(angle) * normDist;

            setLeftStick((prev) => ({ ...prev, currX: clampedX, currY: clampedY }));
            engine.moveVector = {
              x: (Math.cos(angle) * normDist) / maxRadius,
              y: (Math.sin(angle) * normDist) / maxRadius,
            };
            break;
          }
        }
      }

      // 2. Process Right Stick if its touch identifier is moving
      if (rightTouchIdRef.current !== null && rightTouchRef.current) {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i];
          if (t.identifier === rightTouchIdRef.current) {
            const rect = rightTouchRef.current.getBoundingClientRect();
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;
            const dx = x - rightStick.startX;
            const dy = y - rightStick.startY;
            const dist = Math.hypot(dx, dy);
            const maxRadius = 55;
            const normDist = Math.min(dist, maxRadius);
            const angle = Math.atan2(dy, dx);

            const clampedX = rightStick.startX + Math.cos(angle) * normDist;
            const clampedY = rightStick.startY + Math.sin(angle) * normDist;

            setRightStick((prev) => ({ ...prev, currX: clampedX, currY: clampedY }));

            if (dist > 12) {
              engine.aimVector.x = Math.cos(angle);
              engine.aimVector.y = Math.sin(angle);
            }
            break;
          }
        }
      }
    };

    const onWindowTouchEnd = (e: TouchEvent) => {
      // Check if left touch ended
      if (leftTouchIdRef.current !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === leftTouchIdRef.current) {
            leftTouchIdRef.current = null;
            setLeftStick({ active: false, startX: 0, startY: 0, currX: 0, currY: 0 });
            engine.moveVector = { x: 0, y: 0 };
            break;
          }
        }
      }

      // Check if right touch ended
      if (rightTouchIdRef.current !== null) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === rightTouchIdRef.current) {
            rightTouchIdRef.current = null;
            const duration = Date.now() - rightTouchStartTime.current;
            const dx = rightStick.currX - rightStick.startX;
            const dy = rightStick.currY - rightStick.startY;
            const dist = Math.hypot(dx, dy);

            if (dist < 18 || duration < 190) {
              // Quick tap: Auto-aim!
              engine.firePlayerNormalAttack();
            } else {
              // Drag release: Fire in aimed direction!
              const angle = Math.atan2(dy, dx);
              engine.firePlayerNormalAttack(angle);
            }

            setRightStick({ active: false, startX: 0, startY: 0, currX: 0, currY: 0 });
            engine.aimVector.isAiming = false;
            break;
          }
        }
      }
    };

    window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
    window.addEventListener('touchend', onWindowTouchEnd);
    window.addEventListener('touchcancel', onWindowTouchEnd);

    return () => {
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
      window.removeEventListener('touchcancel', onWindowTouchEnd);
    };
  }, [engine, leftStick.startX, leftStick.startY, rightStick.startX, rightStick.startY, rightStick.currX, rightStick.currY]);

  // Touch handlers attached directly to joystick zones
  const handleLeftTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (leftTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    leftTouchIdRef.current = touch.identifier;

    const rect = leftTouchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setLeftStick({ active: true, startX: x, startY: y, currX: x, currY: y });
  };

  const handleRightTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (rightTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    rightTouchIdRef.current = touch.identifier;
    rightTouchStartTime.current = Date.now();

    const rect = rightTouchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setRightStick({ active: true, startX: x, startY: y, currX: x, currY: y });
    engine.aimVector.isAiming = true;
  };

  // Minimap rendering loop
  useEffect(() => {
    let animId: number;
    const renderMinimap = () => {
      const canvas = minimapCanvasRef.current;
      if (canvas && engine) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const mapSize = 2400;
          const scale = canvas.width / mapSize;

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Poison ring
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(
            engine.poisonZone.centerX * scale,
            engine.poisonZone.centerY * scale,
            engine.poisonZone.currentRadius * scale,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // Obstacles
          ctx.fillStyle = '#334155';
          for (const obs of engine.obstacles) {
            ctx.fillRect(obs.x * scale, obs.y * scale, obs.width * scale, obs.height * scale);
          }

          // Brawlers
          for (const b of engine.brawlers) {
            if (!b.isAlive) continue;
            if (b.isPlayer) {
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(b.x * scale, b.y * scale, 3.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (!b.isInBush || engine.player.isInBush) {
              ctx.fillStyle = b.isRemotePlayer ? '#f59e0b' : '#ef4444';
              ctx.beginPath();
              ctx.arc(b.x * scale, b.y * scale, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      animId = requestAnimationFrame(renderMinimap);
    };

    renderMinimap();
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 select-none touch-none overflow-hidden font-['Outfit',sans-serif]">
      {/* TOP BAR: Alive Brawlers, Power Cubes, Poison Storm Banner, Minimap, Exit */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Alive count & Power Cubes */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Alive count pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 border-2 border-slate-700 shadow-xl backdrop-blur-md">
            <span className="text-base sm:text-lg">💀</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">VIVI</span>
              <span className="font-black text-sm sm:text-base text-white font-game leading-tight">
                {aliveCount} <span className="text-[10px] text-slate-400">/ 10</span>
              </span>
            </div>
          </div>

          {/* Power Cubes badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 shadow-xl backdrop-blur-md">
            <span className="text-base sm:text-lg">⚡</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-emerald-400 font-bold uppercase leading-none">CUBI</span>
              <span className="font-black text-sm sm:text-base text-emerald-300 font-game leading-tight">
                {powerCubes}
              </span>
            </div>
          </div>

          {/* Kill Feed (compact) */}
          <div className="hidden md:flex flex-col gap-1 max-w-[190px]">
            {killFeed.slice(-2).map((k) => (
              <div
                key={k.id}
                className="px-2 py-0.5 rounded-lg bg-black/60 text-[10px] text-slate-200 border-l-2 border-red-500 flex items-center gap-1 backdrop-blur-sm"
              >
                <span className="font-bold text-amber-300 truncate max-w-[80px]">{k.killerName}</span>
                <span className="text-red-400">⚡</span>
                <span className="font-bold text-slate-300 truncate max-w-[80px]">{k.victimName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Poison Gas warning banner */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-emerald-900/90 border-2 border-emerald-400 shadow-xl backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span className="font-bold text-[11px] sm:text-xs text-white font-game tracking-wide">
              GAS: <span className="text-yellow-300">{poisonTimer}s</span>
            </span>
          </div>
        </div>

        {/* Right: Minimap and Exit button */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-0.5 shadow-lg backdrop-blur-md">
            <canvas ref={minimapCanvasRef} width={64} height={64} className="rounded-lg block" />
          </div>

          <button
            onClick={onExitMatch}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-900/80 border border-slate-600 text-[11px] font-bold text-slate-200 active:scale-95 transition"
          >
            Esci
          </button>
        </div>
      </div>

      {/* Active Power-Ups Banner */}
      <div className="flex flex-col items-center justify-end w-full pb-1 pointer-events-none">
        <div className="flex items-center gap-2">
          {engine.player.speedBoostTimer > 0 && (
            <div className="px-2.5 py-0.5 rounded-lg bg-sky-950/80 border border-sky-400 text-sky-300 font-black text-[10px] shadow-lg animate-pulse flex items-center gap-1 backdrop-blur-sm">
              <span>⚡ VELOCITÀ</span>
              <span className="text-white bg-sky-600 px-1 rounded text-[9px]">
                {Math.ceil(engine.player.speedBoostTimer)}s
              </span>
            </div>
          )}

          {engine.player.shieldTimer > 0 && (
            <div className="px-2.5 py-0.5 rounded-lg bg-purple-950/80 border border-purple-400 text-purple-300 font-black text-[10px] shadow-lg animate-pulse flex items-center gap-1 backdrop-blur-sm">
              <span>🛡️ SCUDO -70%</span>
              <span className="text-white bg-purple-600 px-1 rounded text-[9px]">
                {Math.ceil(engine.player.shieldTimer)}s
              </span>
            </div>
          )}

          {engine.player.doubleDamageTimer > 0 && (
            <div className="px-2.5 py-0.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 font-black text-[10px] shadow-lg animate-pulse flex items-center gap-1 backdrop-blur-sm">
              <span>💥 DOPPIO DANNO</span>
              <span className="text-white bg-red-600 px-1 rounded text-[9px]">
                {Math.ceil(engine.player.doubleDamageTimer)}s
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar: Left Joystick, Gadget, Super Button, Right Attack Joystick */}
      <div className="flex items-end justify-between w-full pb-1 sm:pb-3">
        {/* Left: Virtual Movement Joystick (Multi-Touch Enabled) */}
        <div
          ref={leftTouchRef}
          onTouchStart={handleLeftTouchStart}
          className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-900/40 border-2 border-slate-700/50 backdrop-blur-xs pointer-events-auto touch-none flex items-center justify-center shrink-0"
        >
          {/* Base Thumbstick ring */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-sky-400/40 bg-sky-500/10 flex items-center justify-center pointer-events-none">
            <span className="text-[9px] text-sky-300 font-bold opacity-60">MUOVI</span>
          </div>

          {/* Active Thumb Knob */}
          {leftStick.active && (
            <div
              className="absolute w-14 h-14 rounded-full bg-sky-500 border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftStick.currX}px`, top: `${leftStick.currY}px` }}
            />
          )}
        </div>

        {/* Center: Gadget and Desktop Key hints */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto pb-1">
          {/* Active Gadget Button (Touch-Safe) */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              engine.usePlayerGadget();
            }}
            onClick={(e) => {
              e.stopPropagation();
              engine.usePlayerGadget();
            }}
            disabled={engine.player.gadgetCharges <= 0}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border-2 shadow-xl transition active:scale-90 ${
              engine.player.gadgetCharges > 0
                ? 'bg-emerald-600 border-emerald-300 text-white hover:bg-emerald-500'
                : 'bg-slate-800 border-slate-600 text-slate-500 opacity-60'
            }`}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[8px] sm:text-[9px] font-black tracking-tighter">
              GADGET ({engine.player.gadgetCharges})
            </span>
          </button>

          {/* Desktop keys reminder (subtle) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 text-[9px] text-slate-300 border border-slate-700">
            <span>WASD: Muovi</span> • <span>Click: Fuoco</span> • <span>Spazio: Super</span>
          </div>
        </div>

        {/* Right: Super Button & Virtual Attack Joystick (Multi-Touch Enabled) */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto shrink-0">
          {/* Super Button (Touch-Safe) */}
          <div className="relative">
            <button
              onTouchStart={(e) => {
                e.stopPropagation();
                if (isSuperReady) engine.firePlayerSuper();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isSuperReady) engine.firePlayerSuper();
              }}
              disabled={!isSuperReady}
              className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center border-3 sm:border-4 shadow-xl transition active:scale-90 ${
                isSuperReady
                  ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-yellow-200 text-slate-950 animate-bounce shadow-yellow-500/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Zap className={`w-6 h-6 sm:w-8 sm:h-8 ${isSuperReady ? 'fill-current text-slate-950' : 'text-slate-500'}`} />
              <span className="text-[8px] sm:text-[10px] font-black">
                {isSuperReady ? 'SUPER!' : `${Math.floor(playerSuperCharge)}%`}
              </span>
            </button>
          </div>

          {/* Right: Virtual Attack Joystick */}
          <div
            ref={rightTouchRef}
            onTouchStart={handleRightTouchStart}
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-slate-900/40 border-2 border-red-900/50 backdrop-blur-xs pointer-events-auto touch-none flex items-center justify-center shrink-0"
          >
            {/* Base Thumbstick ring */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-500/40 bg-red-500/10 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] text-red-300 font-bold opacity-60">ATTACCO</span>
            </div>

            {/* Active Thumb Knob */}
            {rightStick.active && (
              <div
                className="absolute w-14 h-14 rounded-full bg-red-600 border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${rightStick.currX}px`, top: `${rightStick.currY}px` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
