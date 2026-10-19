import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap, Skull, Flame, Crosshair } from 'lucide-react';
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
  playerHp,
  playerMaxHp,
  playerAmmo,
  playerSuperCharge,
  powerCubes,
  killFeed,
  poisonTimer,
  onExitMatch,
}) => {
  const leftTouchRef = useRef<HTMLDivElement>(null);
  const rightTouchRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Left joystick visual state
  const [leftStick, setLeftStick] = useState<{ active: boolean; startX: number; startY: number; currX: number; currY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0,
  });

  // Right attack joystick visual state
  const [rightStick, setRightStick] = useState<{ active: boolean; startX: number; startY: number; currX: number; currY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0,
  });

  const playerBrawler = BRAWLERS[engine.player.brawlerId];
  const isSuperReady = playerSuperCharge >= 100;

  // Keyboard controls listener for Desktop users (WASD + Mouse)
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
        // Left click: fire normal attack towards mouse
        const rect = engine.canvas.getBoundingClientRect();
        const angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
        engine.firePlayerNormalAttack(angle);
      } else if (e.button === 2) {
        // Right click: fire super
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

  // Touch controls handlers (Left Movement Joystick)
  const handleLeftTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = leftTouchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setLeftStick({ active: true, startX: x, startY: y, currX: x, currY: y });
  };

  const handleLeftTouchMove = (e: React.TouchEvent) => {
    if (!leftStick.active) return;
    const touch = e.touches[0];
    const rect = leftTouchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const dx = x - leftStick.startX;
    const dy = y - leftStick.startY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 55;
    const normDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = leftStick.startX + Math.cos(angle) * normDist;
    const clampedY = leftStick.startY + Math.sin(angle) * normDist;

    setLeftStick((prev) => ({ ...prev, currX: clampedX, currY: clampedY }));
    engine.moveVector = {
      x: (Math.cos(angle) * normDist) / maxRadius,
      y: (Math.sin(angle) * normDist) / maxRadius,
    };
  };

  const handleLeftTouchEnd = () => {
    setLeftStick({ active: false, startX: 0, startY: 0, currX: 0, currY: 0 });
    engine.moveVector = { x: 0, y: 0 };
  };

  // Touch controls handlers (Right Attack Joystick & Quick Tap Auto-Aim)
  const rightTouchStartTime = useRef(0);
  const handleRightTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = rightTouchRef.current?.getBoundingClientRect();
    if (!rect) return;
    rightTouchStartTime.current = Date.now();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setRightStick({ active: true, startX: x, startY: y, currX: x, currY: y });
    engine.aimVector.isAiming = true;
  };

  const handleRightTouchMove = (e: React.TouchEvent) => {
    if (!rightStick.active) return;
    const touch = e.touches[0];
    const rect = rightTouchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const dx = x - rightStick.startX;
    const dy = y - rightStick.startY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 60;
    const normDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const clampedX = rightStick.startX + Math.cos(angle) * normDist;
    const clampedY = rightStick.startY + Math.sin(angle) * normDist;

    setRightStick((prev) => ({ ...prev, currX: clampedX, currY: clampedY }));

    if (dist > 15) {
      engine.aimVector.x = Math.cos(angle);
      engine.aimVector.y = Math.sin(angle);
    }
  };

  const handleRightTouchEnd = () => {
    const duration = Date.now() - rightTouchStartTime.current;
    const dx = rightStick.currX - rightStick.startX;
    const dy = rightStick.currY - rightStick.startY;
    const dist = Math.hypot(dx, dy);

    if (dist < 20 || duration < 180) {
      // Quick tap: Auto-aim!
      engine.firePlayerNormalAttack();
    } else {
      // Drag release: Fire in aimed direction!
      const angle = Math.atan2(dy, dx);
      engine.firePlayerNormalAttack(angle);
    }

    setRightStick({ active: false, startX: 0, startY: 0, currX: 0, currY: 0 });
    engine.aimVector.isAiming = false;
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
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            engine.poisonZone.centerX * scale,
            engine.poisonZone.centerY * scale,
            engine.poisonZone.currentRadius * scale,
            0,
            Math.PI * 2
          );
          ctx.stroke();

          // Living bots (red dots)
          for (const b of engine.brawlers) {
            if (!b.isAlive || b.isPlayer) continue;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(b.x * scale, b.y * scale, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Player (bright cyan star)
          if (engine.player.isAlive) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(engine.player.x * scale, engine.player.y * scale, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      animId = requestAnimationFrame(renderMinimap);
    };

    animId = requestAnimationFrame(renderMinimap);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  const hpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-3 safe-area-p">
      {/* Top Header Bar: Alive count, Poison timer, Minimap, Killfeed */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Alive count & Power Cubes */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Alive badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border-2 border-slate-700 shadow-xl backdrop-blur-md">
            <Skull className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="font-extrabold text-sm sm:text-base text-white tracking-wider font-game">
              {aliveCount} / 10 <span className="text-xs text-slate-300 font-normal">RIMASTI</span>
            </span>
          </div>

          {/* Power cubes badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 shadow-xl backdrop-blur-md">
            <div className="w-4 h-4 rounded bg-emerald-400 border border-emerald-200 shadow-sm" />
            <span className="font-extrabold text-sm text-emerald-300 font-game">
              {powerCubes} <span className="text-[11px] text-emerald-200 font-normal">POTENZIAMENTI</span>
            </span>
          </div>

          {/* Recent Killfeed */}
          <div className="flex flex-col gap-1 max-w-[240px]">
            {killFeed.slice(-3).map((k) => (
              <div
                key={k.id}
                className="px-2 py-0.5 rounded-lg bg-black/60 text-[11px] text-slate-200 border-l-2 border-red-500 animate-fade-in flex items-center gap-1 backdrop-blur-sm"
              >
                <span className="font-bold text-amber-300 truncate max-w-[85px]">{k.killerName}</span>
                <span className="text-red-400">⚡</span>
                <span className="font-bold text-slate-300 truncate max-w-[85px]">{k.victimName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Poison Gas warning banner */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-emerald-900/90 border-2 border-emerald-400 shadow-2xl backdrop-blur-md">
            <Flame className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span className="font-bold text-xs sm:text-sm text-white font-game tracking-wide">
              GAS TOSSICO: <span className="text-yellow-300">{poisonTimer}s</span>
            </span>
          </div>
        </div>

        {/* Right: Minimap and Exit/Pause button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="rounded-2xl border-2 border-slate-700 bg-slate-900/90 p-1 shadow-xl backdrop-blur-md">
            <canvas ref={minimapCanvasRef} width={80} height={80} className="rounded-xl block" />
          </div>

          <button
            onClick={onExitMatch}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-red-900/80 border border-slate-600 text-xs font-bold text-slate-200 active:scale-95 transition"
          >
            Esci
          </button>
        </div>
      </div>

      {/* Center Screen: Bottom Health, Ammo and Super status */}
      <div className="flex flex-col items-center justify-end w-full pb-2">
        {/* Player Status Display */}
        <div className="flex flex-col items-center gap-1.5 mb-2 pointer-events-auto">
          {/* Health Bar */}
          <div className="relative w-64 sm:w-72 h-8 rounded-full bg-slate-950 border-2 border-black overflow-hidden shadow-2xl">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                hpPct < 30 ? 'bg-red-500' : hpPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${hpPct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-black text-xs sm:text-sm text-white text-stroke-thin">
              {playerHp} / {playerMaxHp} HP
            </div>
          </div>

          {/* Ammo Slots */}
          <div className="flex items-center gap-2 w-64 sm:w-72">
            {[0, 1, 2].map((idx) => {
              const isFilled = idx < playerAmmo;
              return (
                <div
                  key={idx}
                  className="flex-1 h-3 rounded-md bg-slate-950 border border-slate-700 overflow-hidden"
                >
                  <div
                    className={`h-full transition-all duration-75 ${
                      isFilled ? 'bg-amber-400' : 'bg-slate-800'
                    }`}
                    style={{ width: isFilled ? '100%' : '0%' }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar: Left Joystick, Gadget, Super Button, Right Attack Joystick */}
      <div className="flex items-end justify-between w-full pb-2">
        {/* Left: Virtual Movement Joystick */}
        <div
          ref={leftTouchRef}
          onTouchStart={handleLeftTouchStart}
          onTouchMove={handleLeftTouchMove}
          onTouchEnd={handleLeftTouchEnd}
          className="relative w-44 h-44 rounded-full bg-slate-900/40 border-2 border-slate-700/50 backdrop-blur-sm pointer-events-auto touch-none flex items-center justify-center"
        >
          {/* Base Thumbstick ring */}
          <div className="w-20 h-20 rounded-full border-2 border-sky-400/40 bg-sky-500/10 flex items-center justify-center">
            <span className="text-[10px] text-sky-300 font-bold opacity-60">MOVIMENTO</span>
          </div>

          {/* Active Thumb Knob */}
          {leftStick.active && (
            <div
              className="absolute w-16 h-16 rounded-full bg-sky-500 border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftStick.currX}px`, top: `${leftStick.currY}px` }}
            />
          )}
        </div>

        {/* Center: Gadget and Desktop Key hints */}
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          {/* Active Gadget Button */}
          <button
            onClick={() => engine.usePlayerGadget()}
            disabled={engine.player.gadgetCharges <= 0}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl transition active:scale-90 ${
              engine.player.gadgetCharges > 0
                ? 'bg-emerald-600 border-emerald-300 text-white hover:bg-emerald-500'
                : 'bg-slate-800 border-slate-600 text-slate-500 opacity-60'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[9px] font-black tracking-tighter">
              GADGET ({engine.player.gadgetCharges})
            </span>
          </button>

          {/* Desktop keys reminder (subtle) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/60 text-[10px] text-slate-300 border border-slate-700">
            <span>WASD: Muovi</span> • <span>Click: Fuoco</span> • <span>Spazio: Super</span> • <span>E: Gadget</span>
          </div>
        </div>

        {/* Right: Super Button & Virtual Attack Joystick */}
        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Super Button (Glows & pulses yellow when charged 100%) */}
          <div className="relative">
            <button
              onClick={() => engine.firePlayerSuper()}
              disabled={!isSuperReady}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl transition active:scale-90 ${
                isSuperReady
                  ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-yellow-200 text-slate-950 animate-bounce shadow-yellow-500/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Zap className={`w-8 h-8 ${isSuperReady ? 'fill-current text-slate-950' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black">
                {isSuperReady ? 'SUPER!' : `${Math.round(playerSuperCharge)}%`}
              </span>
            </button>
            {isSuperReady && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500" />
              </span>
            )}
          </div>

          {/* Virtual Attack Joystick / Quick Tap Button */}
          <div
            ref={rightTouchRef}
            onTouchStart={handleRightTouchStart}
            onTouchMove={handleRightTouchMove}
            onTouchEnd={handleRightTouchEnd}
            className="relative w-44 h-44 rounded-full bg-slate-900/40 border-2 border-red-500/40 backdrop-blur-sm touch-none flex items-center justify-center"
          >
            {/* Base knob */}
            <div className="w-20 h-20 rounded-full border-2 border-red-500 bg-red-600/30 flex flex-col items-center justify-center text-white">
              <Crosshair className="w-6 h-6 text-red-400 mb-0.5" />
              <span className="text-[9px] font-black tracking-tight">ATTACCO</span>
            </div>

            {/* Active Drag Knob */}
            {rightStick.active && (
              <div
                className="absolute w-16 h-16 rounded-full bg-red-600 border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${rightStick.currX}px`, top: `${rightStick.currY}px` }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
