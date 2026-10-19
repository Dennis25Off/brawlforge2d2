import React, { useRef, useState, useEffect } from 'react';
import { Shield, Zap, Sword, Flame, ArrowUpCircle } from 'lucide-react';

interface MobileControlsProps {
  onInputUpdate: (inputs: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    light: boolean;
    heavy: boolean;
    special: boolean;
    dodge: boolean;
    shield?: boolean;
  }) => void;
  onEmote: (emoji: string) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInputUpdate, onEmote }) => {
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [showEmotePicker, setShowEmotePicker] = useState(false);

  // Current inputs state ref
  const inputsRef = useRef({
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

  const updateInputs = (partial: Partial<typeof inputsRef.current>) => {
    inputsRef.current = { ...inputsRef.current, ...partial };
    onInputUpdate({ ...inputsRef.current });
  };

  // Joystick touch handlers with touch-identifier tracking for multi-touch immunity
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setJoystickActive(true);
    updateJoystickFromTouch(touch);
  };

  const updateJoystickFromTouch = (touch: React.Touch) => {
    if (!joystickContainerRef.current) return;
    const rect = joystickContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const maxRadius = 44;

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: nx, y: ny });

    // Directional thresholds
    const threshold = 13;
    updateInputs({
      left: dx < -threshold,
      right: dx > threshold,
      up: dy < -threshold,
      down: dy > threshold,
    });
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchIdRef.current === null) return;
    const touch = Array.from(e.touches).find((t) => t.identifier === joystickTouchIdRef.current);
    if (!touch) return;
    updateJoystickFromTouch(touch);
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchIdRef.current === null) return;
    const ended = Array.from(e.changedTouches).some((t) => t.identifier === joystickTouchIdRef.current);
    if (ended) {
      joystickTouchIdRef.current = null;
      setJoystickActive(false);
      setJoystickPos({ x: 0, y: 0 });
      updateInputs({
        left: false,
        right: false,
        up: false,
        down: false,
      });
    }
  };

  // Button touch helpers with multi-touch & vibration support
  const bindButton = (key: 'jump' | 'light' | 'heavy' | 'special' | 'dodge' | 'shield') => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.vibrate) {
          try {
            navigator.vibrate(12);
          } catch {
            // Ignore if vibration not allowed
          }
        }
        updateInputs({ [key]: true });
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateInputs({ [key]: false });
      },
      onTouchCancel: (e: React.TouchEvent) => {
        e.preventDefault();
        updateInputs({ [key]: false });
      },
      onMouseDown: (e: React.MouseEvent) => {
        e.preventDefault();
        updateInputs({ [key]: true });
      },
      onMouseUp: (e: React.MouseEvent) => {
        e.preventDefault();
        updateInputs({ [key]: false });
      },
      onMouseLeave: () => {
        updateInputs({ [key]: false });
      },
    };
  };

  const emotes = ['🔥', '👑', '💀', '⚡', '😎', '⚔️'];

  return (
    <div
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 16px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 16px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 12px))',
      }}
      className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between items-end touch-combat-area"
    >
      {/* LEFT: Virtual Analog Joystick */}
      <div className="pointer-events-auto flex flex-col items-center mb-1">
        <div
          ref={joystickContainerRef}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
          className={`relative w-36 h-36 rounded-full border-2 border-zinc-700/70 bg-zinc-950/70 backdrop-blur-md flex items-center justify-center transition-colors touch-none ${
            joystickActive
              ? 'border-cyan-400 bg-zinc-900/90 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              : 'shadow-xl'
          }`}
        >
          {/* Outer direction indicators */}
          <div className="absolute top-1.5 text-[10px] font-bold text-zinc-500">▲</div>
          <div className="absolute bottom-1.5 text-[10px] font-bold text-zinc-500">▼</div>
          <div className="absolute left-1.5 text-[10px] font-bold text-zinc-500">◀</div>
          <div className="absolute right-1.5 text-[10px] font-bold text-zinc-500">▶</div>

          {/* Stick thumb handle */}
          <div
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
              transition: joystickActive ? 'none' : 'transform 0.12s ease-out',
            }}
            className="w-14 h-14 rounded-full border-2 border-cyan-300 bg-gradient-to-tr from-cyan-600 to-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.7)] flex items-center justify-center"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-100/70 shadow-inner" />
          </div>
        </div>

        {/* Emote Trigger Button */}
        <div className="relative mt-2">
          <button
            onClick={() => setShowEmotePicker(!showEmotePicker)}
            className="px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-[11px] font-bold text-zinc-300 backdrop-blur-md active:scale-95 shadow-md flex items-center gap-1"
          >
            <span>💬</span>
            <span>Emote</span>
          </button>

          {showEmotePicker && (
            <div className="absolute bottom-9 left-0 bg-zinc-950/95 border border-zinc-700 p-1.5 rounded-2xl flex gap-1.5 shadow-2xl backdrop-blur-md z-40">
              {emotes.map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    onEmote(em);
                    setShowEmotePicker(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-zinc-800 rounded-xl active:scale-90 transition-transform"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Combat Action Buttons Cluster */}
      <div className="pointer-events-auto relative w-64 h-64 touch-none mb-1">
        {/* SCUDO (Bottom Left - Prevents Stun!) */}
        <button
          {...bindButton('shield')}
          className="absolute bottom-0 left-0 w-[58px] h-[58px] rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 border-2 border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.7)] active:scale-90 flex flex-col items-center justify-center text-white transition-transform"
          aria-label="Scudo anti-stordimento"
        >
          <Shield className="w-5 h-5 fill-cyan-200/40 text-white" />
          <span className="text-[8px] font-black tracking-wider uppercase">SCUDO</span>
        </button>

        {/* JUMP BUTTON (Bottom Center - Emerald) */}
        <button
          {...bindButton('jump')}
          className="absolute bottom-0 left-[70px] w-[66px] h-[66px] rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 border-2 border-emerald-200 shadow-[0_0_22px_rgba(16,185,129,0.6)] active:scale-90 flex flex-col items-center justify-center text-white transition-transform"
          aria-label="Salta e doppio salto"
        >
          <ArrowUpCircle className="w-6 h-6" />
          <span className="text-[9px] font-black tracking-wider uppercase">SALTA</span>
        </button>

        {/* LIGHT ATTACK (Right Center - Blue/Indigo) */}
        <button
          {...bindButton('light')}
          className="absolute bottom-14 right-0 w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 border-2 border-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.6)] active:scale-90 flex flex-col items-center justify-center text-white transition-transform"
          aria-label="Attacco leggero"
        >
          <Sword className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-wider uppercase">LEGGERO</span>
        </button>

        {/* HEAVY SMASH (Top Center - Amber/Orange) */}
        <button
          {...bindButton('heavy')}
          className="absolute top-1 left-[70px] w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.6)] active:scale-90 flex flex-col items-center justify-center text-white transition-transform"
          aria-label="Attacco pesante smash"
        >
          <Flame className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-wider uppercase">PESANTE</span>
        </button>

        {/* SPECIAL / RECOVERY (Top Left - Purple/Pink) */}
        <button
          {...bindButton('special')}
          className="absolute top-7 left-0 w-[54px] h-[54px] rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 border-2 border-pink-200 shadow-[0_0_18px_rgba(236,72,153,0.6)] active:scale-90 flex flex-col items-center justify-center text-white transition-transform"
          aria-label="Attacco speciale recupero"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[8px] font-black tracking-wider uppercase">SPECIAL</span>
        </button>

        {/* DODGE / SCHIVA (Center - Zinc/Slate) */}
        <button
          {...bindButton('dodge')}
          className="absolute bottom-[72px] left-[74px] w-[50px] h-[50px] rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 border-2 border-zinc-300 shadow-md active:scale-90 flex flex-col items-center justify-center text-white transition-transform"
          aria-label="Schivata dash"
        >
          <span className="text-[8px] font-black tracking-wider uppercase">SCHIVA</span>
        </button>
      </div>
    </div>
  );
};
