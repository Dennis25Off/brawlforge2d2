import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { HERO_LIST, HEROES } from '../game/heroes';
import { COSMETIC_ITEMS } from '../game/cosmetics';
import { HeroId } from '../types/game';
import { X, Check, Shield, Zap, Sparkles, User, Sword } from 'lucide-react';

interface CustomizerModalProps {
  onClose: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({ onClose }) => {
  const { customization, selectHero, equipCosmetic, stats, playerName, setPlayerName } = useGame();
  const [activeTab, setActiveTab] = useState<'heroes' | 'skin' | 'hat' | 'trail' | 'weapon' | 'ko'>('heroes');
  const [editName, setEditName] = useState(playerName);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentHero = HEROES[customization.heroId] || HEROES.valiant_knight;

  // Render animated character preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const renderPreview = () => {
      tick += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 + 10;
      const bobbing = Math.sin(tick) * 3;

      // Subtle shadow beneath
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 38, 28, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw character centered
      ctx.save();
      ctx.translate(centerX, centerY + bobbing);

      const color = customization.skinPalette || currentHero.primaryColor;

      // Flowing Scarf in Wind
      const windOffset = Math.sin(tick * 2) * 5;
      ctx.save();
      ctx.fillStyle = currentHero.accentColor;
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.quadraticCurveTo(-22 + windOffset, -14, -32 + windOffset * 1.3, -8);
      ctx.lineTo(-26 + windOffset * 1.3, -4);
      ctx.quadraticCurveTo(-16 + windOffset, -12, -8, -18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Legs with boots & kneepads
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, 10, 8, 18);
      ctx.fillStyle = color;
      ctx.fillRect(-12, 14, 8, 6); // kneepad
      ctx.fillStyle = '#334155';
      ctx.fillRect(-13, 24, 10, 4); // boot

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 10, 8, 18);
      ctx.fillStyle = color;
      ctx.fillRect(4, 14, 8, 6); // kneepad
      ctx.fillStyle = '#334155';
      ctx.fillRect(3, 24, 10, 4); // boot

      // Body / Torso Cuirass
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-16, -18, 32, 30, 6);
      ctx.fill();

      // Armor plate highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(-14, -16, 7, 24);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(7, -16, 7, 24);

      // Belt & Buckle
      ctx.fillStyle = '#334155';
      ctx.fillRect(-16, 7, 32, 5);
      ctx.fillStyle = currentHero.accentColor;
      ctx.fillRect(-4, 6, 8, 7);

      // Scabbard on hip
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-20, 5, 18, 4);
      ctx.fillStyle = currentHero.accentColor;
      ctx.fillRect(-19, 4, 3, 6);

      // Chest Reactor Core
      ctx.shadowColor = currentHero.accentColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = currentHero.accentColor;
      ctx.beginPath();
      ctx.arc(0, -5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Shoulder Pauldrons
      ctx.fillStyle = currentHero.accentColor;
      ctx.beginPath();
      ctx.ellipse(-16, -16, 6, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(16, -16, 6, 9, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, -30, 13, 0, Math.PI * 2);
      ctx.fill();

      // Forehead Guard
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, -37, 24, 6);
      ctx.fillStyle = currentHero.accentColor;
      ctx.fillRect(-3, -38, 6, 7);

      // Glowing Visor / Eyes
      ctx.shadowColor = currentHero.accentColor;
      ctx.shadowBlur = 8;
      ctx.fillStyle = currentHero.accentColor;
      ctx.fillRect(2, -32, 8, 5);
      ctx.shadowBlur = 0;

      // Hat accessory
      if (customization.hat === 'horns') {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-10, -36);
        ctx.quadraticCurveTo(-20, -48, -16, -56);
        ctx.quadraticCurveTo(-12, -48, -7, -38);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(7, -38);
        ctx.quadraticCurveTo(12, -48, 16, -56);
        ctx.quadraticCurveTo(20, -48, 10, -36);
        ctx.fill();
      } else if (customization.hat === 'visor') {
        ctx.fillStyle = currentHero.accentColor;
        ctx.fillRect(-2, -34, 14, 8);
      } else if (customization.hat === 'halo') {
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, -50, 16, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (customization.hat === 'crown') {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-12, -40);
        ctx.lineTo(-9, -52);
        ctx.lineTo(-3, -44);
        ctx.lineTo(0, -56);
        ctx.lineTo(3, -44);
        ctx.lineTo(9, -52);
        ctx.lineTo(12, -40);
        ctx.closePath();
        ctx.fill();
      }

      // Weapon
      ctx.save();
      ctx.translate(20, -8);
      ctx.rotate(0.2);

      if (currentHero.weaponType === 'katana') {
        // Detailed Katana
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(20, -5, 42, -10);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(3, -1);
        ctx.quadraticCurveTo(20, -6, 40, -11);
        ctx.stroke();

        // Tsuba
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-2, -6, 5, 12);

        // Tsuka & wrap
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-14, -2, 12, 4);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(-12, -2, 2, 4);
        ctx.fillRect(-8, -2, 2, 4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-16, -3, 3, 6);
      } else if (currentHero.weaponType === 'sword') {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, -5, 34, 8);
        ctx.fillStyle = currentHero.accentColor;
        ctx.fillRect(4, -3, 24, 4);
      } else if (currentHero.weaponType === 'daggers') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(0, -4, 22, 6);
      } else if (currentHero.weaponType === 'gauntlets') {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(-4, -10, 20, 18, 4);
        ctx.fill();
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, -4, 30, 6);
      }
      ctx.restore();

      ctx.restore();

      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [customization, currentHero]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerName(editName);
  };

  const unlockedSkins = COSMETIC_ITEMS.filter(
    (c) => c.type === 'skin' && stats.unlockedItems.includes(c.id)
  );
  const unlockedHats = COSMETIC_ITEMS.filter(
    (c) => c.type === 'hat' && stats.unlockedItems.includes(c.id)
  );
  const unlockedWeapons = COSMETIC_ITEMS.filter(
    (c) => c.type === 'weapon' && stats.unlockedItems.includes(c.id)
  );
  const unlockedTrails = COSMETIC_ITEMS.filter(
    (c) => c.type === 'trail' && stats.unlockedItems.includes(c.id)
  );
  const unlockedKO = COSMETIC_ITEMS.filter(
    (c) => c.type === 'ko_fx' && stats.unlockedItems.includes(c.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">ARMERIA &amp; PERSONAGGIO</h2>
              <p className="text-xs text-zinc-400">Scegli il tuo archetipo ed equipaggia i tuoi accessori sbloccati</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: 3D-like Preview Card */}
          <div className="md:col-span-5 flex flex-col items-center justify-between p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            {/* Player Name Edit Form */}
            <form onSubmit={handleSaveName} className="w-full flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={16}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Nome Guerriero"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
              >
                Salva
              </button>
            </form>

            {/* Canvas Preview */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Hero Stats Card */}
            <div className="w-full mt-3 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-white block">{currentHero.name}</span>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">{currentHero.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 block">
                    {currentHero.weaponName}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-medium block mt-0.5">{currentHero.playstyle}</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{currentHero.description}</p>

              {/* Passive ability */}
              <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Abilità Passiva</span>
                <p className="text-[10px] text-zinc-300 font-medium mt-0.5 leading-snug">{currentHero.passiveDesc}</p>
              </div>

              {/* Special Moves List */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">Mosse Speciali (Tasto B)</span>
                <div className="space-y-1 text-[10px]">
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <span className="font-bold text-zinc-200">★ Neutrale:</span> <span className="text-cyan-300 font-semibold">{currentHero.specialMoves.neutral.name}</span>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{currentHero.specialMoves.neutral.desc}</p>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <span className="font-bold text-zinc-200">▶ Laterale (Side + B):</span> <span className="text-purple-300 font-semibold">{currentHero.specialMoves.side.name}</span>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{currentHero.specialMoves.side.desc}</p>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <span className="font-bold text-zinc-200">▲ Salto / Recupero (Up + B):</span> <span className="text-emerald-300 font-semibold">{currentHero.specialMoves.up.name}</span>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{currentHero.specialMoves.up.desc}</p>
                  </div>
                  <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                    <span className="font-bold text-zinc-200">▼ Difensiva (Down + B):</span> <span className="text-amber-300 font-semibold">{currentHero.specialMoves.down.name}</span>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{currentHero.specialMoves.down.desc}</p>
                  </div>
                </div>
              </div>

              {/* Stat bars */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-semibold">Velocità Movimento</span>
                  <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${(currentHero.speed / 1.3) * 100}%` }}
                      className="h-full bg-cyan-400"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-semibold">Resistenza (Peso)</span>
                  <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${(currentHero.weight / 1.4) * 100}%` }}
                      className="h-full bg-purple-400"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-semibold">Potenza Attacchi</span>
                  <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${(currentHero.damageMult / 1.3) * 100}%` }}
                      className="h-full bg-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Customization Selector */}
          <div className="md:col-span-7 flex flex-col">
            {/* Customization Subtabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-4 overflow-x-auto no-scrollbar">
              {[
                { id: 'heroes', label: 'Eroi' },
                { id: 'skin', label: 'Colori' },
                { id: 'hat', label: 'Elmi' },
                { id: 'weapon', label: 'Armi' },
                { id: 'trail', label: 'Scie' },
                { id: 'ko', label: 'Effetti KO' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: HEROES */}
            {activeTab === 'heroes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HERO_LIST.map((hero) => {
                  const isSelected = customization.heroId === hero.id;
                  return (
                    <button
                      key={hero.id}
                      onClick={() => selectHero(hero.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500'
                          : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-zinc-100">{hero.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">{hero.title}</span>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {hero.weaponType}
                        </span>
                        <span className="text-[10px] text-amber-400 font-semibold">{hero.signatureName}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: SKINS */}
            {activeTab === 'skin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedSkins.map((item) => {
                  const isEquipped = customization.skinPalette === item.previewColor;
                  return (
                    <button
                      key={item.id}
                      onClick={() => equipCosmetic('skin', item.id)}
                      className={`text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isEquipped
                          ? 'border-cyan-500 bg-cyan-950/20'
                          : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          style={{ backgroundColor: item.previewColor }}
                          className="w-6 h-6 rounded-full border border-white/20"
                        />
                        <span className="text-xs font-bold text-zinc-200">{item.name}</span>
                      </div>
                      {isEquipped && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: HATS */}
            {activeTab === 'hat' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedHats.map((item) => {
                  const isEquipped = customization.hat === item.id.replace('hat_', '');
                  return (
                    <button
                      key={item.id}
                      onClick={() => equipCosmetic('hat', item.id)}
                      className={`text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isEquipped
                          ? 'border-cyan-500 bg-cyan-950/20'
                          : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="text-xs font-bold text-zinc-200">{item.name}</span>
                      {isEquipped && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: WEAPONS */}
            {activeTab === 'weapon' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedWeapons.map((item) => {
                  const isEquipped = customization.weaponSkin === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => equipCosmetic('weapon', item.id)}
                      className={`text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isEquipped
                          ? 'border-cyan-500 bg-cyan-950/20'
                          : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="text-xs font-bold text-zinc-200">{item.name}</span>
                      {isEquipped && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: TRAILS */}
            {activeTab === 'trail' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedTrails.map((item) => {
                  const isEquipped = customization.trail === item.id.replace('trail_', '');
                  return (
                    <button
                      key={item.id}
                      onClick={() => equipCosmetic('trail', item.id)}
                      className={`text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isEquipped
                          ? 'border-cyan-500 bg-cyan-950/20'
                          : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="text-xs font-bold text-zinc-200">{item.name}</span>
                      {isEquipped && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: KO */}
            {activeTab === 'ko' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedKO.map((item) => {
                  const isEquipped = customization.koEffect === item.id.replace('ko_', '');
                  return (
                    <button
                      key={item.id}
                      onClick={() => equipCosmetic('ko_fx', item.id)}
                      className={`text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isEquipped
                          ? 'border-cyan-500 bg-cyan-950/20'
                          : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900'
                      }`}
                    >
                      <span className="text-xs font-bold text-zinc-200">{item.name}</span>
                      {isEquipped && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
