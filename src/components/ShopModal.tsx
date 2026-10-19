import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { COSMETIC_ITEMS } from '../game/cosmetics';
import { CosmeticItem } from '../types/game';
import { Coins, Gem, Sparkles, X, Check, Lock, Gift, Zap } from 'lucide-react';

interface ShopModalProps {
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const { stats, customization, purchaseItem, equipCosmetic } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(() => {
    return localStorage.getItem('brawlforge_daily_claimed') === new Date().toDateString();
  });

  const categories = [
    { id: 'all', label: 'Tutto' },
    { id: 'skin', label: 'Colori & Skin' },
    { id: 'weapon', label: 'Finiture Armi' },
    { id: 'hat', label: 'Copricapi' },
    { id: 'trail', label: 'Scie Dash' },
    { id: 'ko_fx', label: 'Effetti KO' },
  ];

  const filteredItems = COSMETIC_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.type === selectedCategory;
  });

  const handleBuy = (item: CosmeticItem) => {
    const res = purchaseItem(item);
    setFeedbackMsg({ text: res.message, error: !res.success });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleClaimDaily = () => {
    if (dailyClaimed) return;
    localStorage.setItem('brawlforge_daily_claimed', new Date().toDateString());
    setDailyClaimed(true);
    // Add daily coins & gems directly
    stats.coins += 200;
    stats.gems += 15;
    setFeedbackMsg({ text: 'Ricompensa giornaliera riscattata! +200 Monete, +15 Gemme!', error: false });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const isEquipped = (item: CosmeticItem) => {
    switch (item.type) {
      case 'skin':
        return customization.skinPalette === item.previewColor;
      case 'weapon':
        return customization.weaponSkin === item.id;
      case 'hat':
        return customization.hat === item.id.replace('hat_', '');
      case 'trail':
        return customization.trail === item.id.replace('trail_', '');
      case 'ko_fx':
        return customization.koEffect === item.id.replace('ko_', '');
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-lg animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">NEGOZIO DELL'ARENA</h2>
              <p className="text-xs text-zinc-400">Personalizza il tuo guerriero con armature, elmi ed effetti leggendari</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Balances */}
            <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{stats.coins}</span>
              </div>
              <div className="w-[1px] h-4 bg-zinc-700" />
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-cyan-400">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>{stats.gems}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Daily Reward Banner */}
        <div className="px-4 py-2.5 md:px-6 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="text-xs text-zinc-300 font-medium">
              Ricompensa Giornaliera Disponibile: <strong className="text-amber-300">+200 Monete</strong> &amp;{' '}
              <strong className="text-cyan-300">+15 Gemme</strong>
            </span>
          </div>
          <button
            onClick={handleClaimDaily}
            disabled={dailyClaimed}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              dailyClaimed
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95'
            }`}
          >
            {dailyClaimed ? 'Già Riscattato Oggi' : 'Riscatta Subito!'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-4 md:px-6 pt-3 pb-2 overflow-x-auto border-b border-zinc-800/40 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-zinc-100 text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mx-4 md:mx-6 mt-3 p-2.5 rounded-xl text-xs font-bold text-center transition-all ${
              feedbackMsg.error
                ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Item Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filteredItems.map((item) => {
            const unlocked = stats.unlockedItems.includes(item.id);
            const equipped = isEquipped(item);
            const isLockedByLevel = !!item.requiredLevel && stats.level < item.requiredLevel;

            return (
              <div
                key={item.id}
                className={`relative group rounded-xl p-4 flex flex-col justify-between border transition-all duration-200 bg-zinc-900/60 hover:bg-zinc-900 ${
                  equipped
                    ? 'border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div>
                  {/* Top Item Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Color Preview Swatch or Icon */}
                      <div
                        style={{ backgroundColor: item.previewColor || '#64748b' }}
                        className="w-9 h-9 rounded-lg flex items-center justify-center shadow-inner border border-white/20"
                      >
                        <Zap className="w-4 h-4 text-zinc-950" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white">{item.name}</h3>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    {isLockedByLevel && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> Liv. {item.requiredLevel}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">{item.description}</p>
                </div>

                {/* Bottom Action Row */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  {/* Cost Tags */}
                  <div className="flex items-center gap-2">
                    {!unlocked && item.costCoins !== undefined && item.costCoins > 0 && (
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                        <Coins className="w-3.5 h-3.5" />
                        <span>{item.costCoins}</span>
                      </div>
                    )}
                    {!unlocked && item.costGems !== undefined && item.costGems > 0 && (
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-cyan-400">
                        <Gem className="w-3.5 h-3.5" />
                        <span>{item.costGems}</span>
                      </div>
                    )}
                    {!unlocked && item.costCoins === 0 && item.costGems === undefined && (
                      <span className="text-xs font-bold text-emerald-400">Gratis</span>
                    )}
                  </div>

                  {/* Button state */}
                  {equipped ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded-lg border border-cyan-800/60">
                      <Check className="w-3.5 h-3.5" /> In Uso
                    </span>
                  ) : unlocked ? (
                    <button
                      onClick={() => equipCosmetic(item.type, item.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors active:scale-95"
                    >
                      Equipaggia
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={isLockedByLevel}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        isLockedByLevel
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:brightness-110'
                      }`}
                    >
                      Sblocca
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
