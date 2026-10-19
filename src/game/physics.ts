import { AttackDefinition, FighterEntity, GameParticle, HeroId, Hitbox, ProjectileEntity, Stage } from '../types/game';
import { HEROES } from './heroes';

// Distinct movesets customized for each hero archetype & weapon
export const HERO_MOVESETS: Record<HeroId, Record<string, AttackDefinition>> = {
  // 1. REN JINRAI - MAESTRO DELLA KATANA MURAMASA
  katana_ronin: {
    neutral_light: {
      name: 'Fendente Rapido Iai',
      startup: 3,
      active: 5,
      recovery: 6,
      damage: 7,
      baseKnockback: 4.8,
      knockbackScaling: 0.38,
      angle: -0.25,
      boxOffset: { x: 24, y: -22, w: 48, h: 32 },
      soundType: 'slash',
      effectColor: '#f43f5e',
    },
    side_light: {
      name: 'Affondo Lampo (Shunpo)',
      startup: 4,
      active: 6,
      recovery: 8,
      damage: 9.5,
      baseKnockback: 6.8,
      knockbackScaling: 0.68,
      angle: -0.22,
      boxOffset: { x: 30, y: -18, w: 60, h: 28 },
      slideSpeed: 8,
      soundType: 'slash',
      effectColor: '#facc15',
    },
    down_light: {
      name: 'Spazzata Iai Rotante',
      startup: 4,
      active: 5,
      recovery: 7,
      damage: 7.5,
      baseKnockback: 7.2,
      knockbackScaling: 0.48,
      angle: -Math.PI / 2.3, // Pop-up vertical launcher
      boxOffset: { x: 20, y: 8, w: 52, h: 24 },
      soundType: 'slash',
      effectColor: '#f43f5e',
    },
    up_light: {
      name: 'Lama Ascendente del Drago',
      startup: 4,
      active: 6,
      recovery: 8,
      damage: 8.5,
      baseKnockback: 8.2,
      knockbackScaling: 0.72,
      angle: -Math.PI / 2.1,
      boxOffset: { x: 4, y: -48, w: 46, h: 52 },
      soundType: 'slash',
      effectColor: '#facc15',
    },
    neutral_air: {
      name: 'Vortice di Sakura Aereo',
      startup: 4,
      active: 8,
      recovery: 7,
      damage: 8,
      baseKnockback: 6.2,
      knockbackScaling: 0.52,
      angle: -0.45,
      boxOffset: { x: -4, y: -12, w: 58, h: 56 },
      isAerial: true,
      soundType: 'slash',
      effectColor: '#f472b6',
    },
    forward_air: {
      name: 'Fendente Iai a Mezzaluna',
      startup: 5,
      active: 7,
      recovery: 9,
      damage: 11,
      baseKnockback: 8.8,
      knockbackScaling: 0.88,
      angle: -0.32,
      boxOffset: { x: 28, y: -16, w: 54, h: 42 },
      isAerial: true,
      soundType: 'slash',
      effectColor: '#f43f5e',
    },
    down_air: {
      name: 'Stoccata del Falco',
      startup: 6,
      active: 8,
      recovery: 10,
      damage: 10.5,
      baseKnockback: 7.8,
      knockbackScaling: 0.68,
      angle: -0.2,
      boxOffset: { x: 2, y: 24, w: 46, h: 46 },
      isAerial: true,
      soundType: 'slash',
      effectColor: '#facc15',
    },
    heavy_smash: {
      name: 'Morte in un Respiro (Taglio Iai)',
      startup: 9,
      active: 12,
      recovery: 18,
      damage: 18,
      baseKnockback: 10.8,
      knockbackScaling: 0.96,
      angle: -0.26,
      boxOffset: { x: 34, y: -22, w: 80, h: 50 },
      isSmash: true,
      slideSpeed: 8,
      soundType: 'slash',
      effectColor: '#e11d48',
    },
    // Specials
    neutral_special: {
      name: 'Vento Tagliente Muramasa',
      startup: 5,
      active: 6,
      recovery: 10,
      damage: 10,
      baseKnockback: 6.8,
      knockbackScaling: 0.58,
      angle: -0.25,
      boxOffset: { x: 26, y: -20, w: 45, h: 32 },
      isSpecial: true,
      specialSlot: 'neutral',
      projectileType: 'katana_wind',
      soundType: 'slash',
      effectColor: '#f43f5e',
    },
    side_special: {
      name: 'Shunpo Blink Strike',
      startup: 3,
      active: 8,
      recovery: 11,
      damage: 10,
      baseKnockback: 7.2,
      knockbackScaling: 0.64,
      angle: -0.28,
      boxOffset: { x: 35, y: -20, w: 75, h: 38 },
      slideSpeed: 14,
      isSpecial: true,
      specialSlot: 'side',
      soundType: 'slash',
      effectColor: '#facc15',
    },
    up_special: {
      name: 'Balzo della Gru del Tuono',
      startup: 4,
      active: 10,
      recovery: 12,
      damage: 10,
      baseKnockback: 8.2,
      knockbackScaling: 0.68,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 2, y: -42, w: 50, h: 54 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'slash',
      effectColor: '#f472b6',
    },
    up_recovery: {
      name: 'Balzo della Gru del Tuono',
      startup: 4,
      active: 10,
      recovery: 12,
      damage: 10,
      baseKnockback: 8.2,
      knockbackScaling: 0.68,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 2, y: -42, w: 50, h: 54 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'slash',
      effectColor: '#f472b6',
    },
    down_special: {
      name: 'Contrattacco Infallibile (Iai Parry)',
      startup: 3,
      active: 14,
      recovery: 12,
      damage: 13,
      baseKnockback: 8.0,
      knockbackScaling: 0.72,
      angle: -0.22,
      boxOffset: { x: 10, y: -24, w: 60, h: 48 },
      isSpecial: true,
      specialSlot: 'down',
      soundType: 'slash',
      effectColor: '#facc15',
    },
  },

  // 2. SIR VANCE - CAVALIERE DELLO SPADONE RUNICO
  valiant_knight: {
    neutral_light: {
      name: 'Fendente Nobile dello Spadone',
      startup: 5,
      active: 7,
      recovery: 8,
      damage: 7.5,
      baseKnockback: 5.2,
      knockbackScaling: 0.42,
      angle: -0.3,
      boxOffset: { x: 24, y: -22, w: 52, h: 38 },
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    side_light: {
      name: 'Carica dello Spadone Runico',
      startup: 6,
      active: 8,
      recovery: 10,
      damage: 9.5,
      baseKnockback: 7.2,
      knockbackScaling: 0.72,
      angle: -0.2,
      boxOffset: { x: 28, y: -18, w: 58, h: 36 },
      slideSpeed: 5.5,
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    down_light: {
      name: 'Terremoto della Lama',
      startup: 5,
      active: 6,
      recovery: 8,
      damage: 7.5,
      baseKnockback: 7.5,
      knockbackScaling: 0.5,
      angle: -Math.PI / 2.3,
      boxOffset: { x: 20, y: 10, w: 52, h: 26 },
      soundType: 'heavy',
      effectColor: '#fbbf24',
    },
    up_light: {
      name: 'Spazzata al Cielo Runica',
      startup: 5,
      active: 7,
      recovery: 9,
      damage: 8.5,
      baseKnockback: 8.5,
      knockbackScaling: 0.75,
      angle: -Math.PI / 2,
      boxOffset: { x: 2, y: -48, w: 46, h: 52 },
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    neutral_air: {
      name: 'Mulino d\'Acciaio',
      startup: 5,
      active: 9,
      recovery: 8,
      damage: 8.5,
      baseKnockback: 6.5,
      knockbackScaling: 0.55,
      angle: -0.5,
      boxOffset: { x: 0, y: -10, w: 56, h: 56 },
      isAerial: true,
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    forward_air: {
      name: 'Fendente Spaccacrani',
      startup: 7,
      active: 8,
      recovery: 11,
      damage: 11.5,
      baseKnockback: 9,
      knockbackScaling: 0.9,
      angle: -0.34,
      boxOffset: { x: 28, y: -16, w: 56, h: 44 },
      isAerial: true,
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    down_air: {
      name: 'Picchiata del Cavaliere',
      startup: 8,
      active: 8,
      recovery: 13,
      damage: 13,
      baseKnockback: 9.8,
      knockbackScaling: 1.0,
      angle: -0.22,
      boxOffset: { x: 0, y: 24, w: 48, h: 46 },
      isAerial: true,
      soundType: 'heavy',
      effectColor: '#fbbf24',
    },
    heavy_smash: {
      name: 'Fendente Solare dell\'Alba',
      startup: 13,
      active: 10,
      recovery: 21,
      damage: 24,
      baseKnockback: 15,
      knockbackScaling: 1.5,
      angle: -0.28,
      boxOffset: { x: 32, y: -22, w: 72, h: 52 },
      isSmash: true,
      slideSpeed: 6.5,
      soundType: 'heavy',
      effectColor: '#fbbf24',
    },
    // Specials
    neutral_special: {
      name: 'Onda di Luce Runica',
      startup: 6,
      active: 7,
      recovery: 12,
      damage: 13,
      baseKnockback: 9.2,
      knockbackScaling: 0.88,
      angle: -0.22,
      boxOffset: { x: 28, y: -20, w: 52, h: 36 },
      isSpecial: true,
      specialSlot: 'neutral',
      projectileType: 'holy_wave',
      soundType: 'heavy',
      effectColor: '#fbbf24',
    },
    side_special: {
      name: 'Carica dello Scudo Paladino',
      startup: 5,
      active: 10,
      recovery: 12,
      damage: 13.5,
      baseKnockback: 11,
      knockbackScaling: 1.1,
      angle: -0.24,
      boxOffset: { x: 32, y: -18, w: 64, h: 42 },
      slideSpeed: 11,
      isSpecial: true,
      specialSlot: 'side',
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    up_special: {
      name: 'Spirale Sacra dell\'Ascensione',
      startup: 5,
      active: 10,
      recovery: 13,
      damage: 12,
      baseKnockback: 9.8,
      knockbackScaling: 0.82,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -42, w: 52, h: 54 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    up_recovery: {
      name: 'Spirale Sacra dell\'Ascensione',
      startup: 5,
      active: 10,
      recovery: 13,
      damage: 12,
      baseKnockback: 9.8,
      knockbackScaling: 0.82,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -42, w: 52, h: 54 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'heavy',
      effectColor: '#38bdf8',
    },
    down_special: {
      name: 'Aegis del Sole (Bastione Difensivo)',
      startup: 4,
      active: 12,
      recovery: 12,
      damage: 11,
      baseKnockback: 12,
      knockbackScaling: 1.2,
      angle: -0.35,
      boxOffset: { x: -20, y: -30, w: 76, h: 60 },
      isSpecial: true,
      specialSlot: 'down',
      soundType: 'heavy',
      effectColor: '#fbbf24',
    },
  },

  // 3. KAGE-09 - CYBER NINJA (DOPPI PUGNALI AL PLASMA)
  cyber_ninja: {
    neutral_light: {
      name: 'Raffica Plasma Tripla',
      startup: 2,
      active: 5,
      recovery: 5,
      damage: 6,
      baseKnockback: 4.2,
      knockbackScaling: 0.32,
      angle: -0.2,
      boxOffset: { x: 22, y: -18, w: 44, h: 28 },
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    side_light: {
      name: 'Scatto Ombra Digitale',
      startup: 3,
      active: 6,
      recovery: 6,
      damage: 8,
      baseKnockback: 6.2,
      knockbackScaling: 0.6,
      angle: -0.18,
      boxOffset: { x: 28, y: -16, w: 52, h: 28 },
      slideSpeed: 9.5,
      soundType: 'light',
      effectColor: '#a855f7',
    },
    down_light: {
      name: 'Scivolata Tagliente',
      startup: 3,
      active: 5,
      recovery: 6,
      damage: 6.8,
      baseKnockback: 6.8,
      knockbackScaling: 0.42,
      angle: -Math.PI / 2.4,
      boxOffset: { x: 18, y: 10, w: 50, h: 22 },
      slideSpeed: 7,
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    up_light: {
      name: 'Doppio Montante al Plasma',
      startup: 3,
      active: 6,
      recovery: 7,
      damage: 7.8,
      baseKnockback: 7.8,
      knockbackScaling: 0.68,
      angle: -Math.PI / 2,
      boxOffset: { x: 0, y: -44, w: 42, h: 48 },
      soundType: 'light',
      effectColor: '#a855f7',
    },
    neutral_air: {
      name: 'Trottola Neon Shuriken',
      startup: 3,
      active: 8,
      recovery: 6,
      damage: 7.2,
      baseKnockback: 5.8,
      knockbackScaling: 0.48,
      angle: -0.45,
      boxOffset: { x: 0, y: -10, w: 54, h: 54 },
      isAerial: true,
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    forward_air: {
      name: 'Taglio Incrociato X-Slash',
      startup: 5,
      active: 7,
      recovery: 8,
      damage: 10,
      baseKnockback: 8.2,
      knockbackScaling: 0.82,
      angle: -0.3,
      boxOffset: { x: 24, y: -14, w: 48, h: 40 },
      isAerial: true,
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    down_air: {
      name: 'Picchiata Pugnali Ombra',
      startup: 6,
      active: 7,
      recovery: 9,
      damage: 11,
      baseKnockback: 9.0,
      knockbackScaling: 0.9,
      angle: -0.22,
      boxOffset: { x: 0, y: 20, w: 44, h: 44 },
      isAerial: true,
      soundType: 'light',
      effectColor: '#a855f7',
    },
    heavy_smash: {
      name: 'Esecuzione Overclock Plasma',
      startup: 8,
      active: 9,
      recovery: 16,
      damage: 20,
      baseKnockback: 13.5,
      knockbackScaling: 1.35,
      angle: -0.24,
      boxOffset: { x: 28, y: -20, w: 64, h: 46 },
      isSmash: true,
      slideSpeed: 8.5,
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    // Specials
    neutral_special: {
      name: 'Shuriken Cibernetici Tripli',
      startup: 3,
      active: 5,
      recovery: 8,
      damage: 6,
      baseKnockback: 5.5,
      knockbackScaling: 0.5,
      angle: -0.2,
      boxOffset: { x: 24, y: -16, w: 44, h: 30 },
      isSpecial: true,
      specialSlot: 'neutral',
      projectileType: 'cyber_shuriken',
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    side_special: {
      name: 'Glitch Dash Tagliente',
      startup: 2,
      active: 7,
      recovery: 9,
      damage: 12,
      baseKnockback: 9.8,
      knockbackScaling: 0.95,
      angle: -0.22,
      boxOffset: { x: 32, y: -18, w: 68, h: 36 },
      slideSpeed: 14,
      isSpecial: true,
      specialSlot: 'side',
      soundType: 'light',
      effectColor: '#a855f7',
    },
    up_special: {
      name: 'Teletrasporto Quantico Aereo',
      startup: 3,
      active: 9,
      recovery: 11,
      damage: 11,
      baseKnockback: 9.2,
      knockbackScaling: 0.78,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -45, w: 46, h: 54 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    up_recovery: {
      name: 'Teletrasporto Quantico Aereo',
      startup: 3,
      active: 9,
      recovery: 11,
      damage: 11,
      baseKnockback: 9.2,
      knockbackScaling: 0.78,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -45, w: 46, h: 54 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'light',
      effectColor: '#06b6d4',
    },
    down_special: {
      name: 'Mina Olografica Glitch',
      startup: 4,
      active: 6,
      recovery: 9,
      damage: 15,
      baseKnockback: 11.5,
      knockbackScaling: 1.15,
      angle: -0.3,
      boxOffset: { x: 14, y: 12, w: 38, h: 24 },
      isSpecial: true,
      specialSlot: 'down',
      projectileType: 'proximity_mine',
      soundType: 'light',
      effectColor: '#a855f7',
    },
  },

  // 4. GROM THUNDERFIST - TITANO DELLE TEMPESTE (GUANTI D'ARMI)
  thunder_brawler: {
    neutral_light: {
      name: 'Jab del Tuono & Gancio',
      startup: 4,
      active: 6,
      recovery: 7,
      damage: 8,
      baseKnockback: 5.6,
      knockbackScaling: 0.44,
      angle: -0.28,
      boxOffset: { x: 22, y: -20, w: 46, h: 34 },
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    side_light: {
      name: 'Avanzata Fulminea con Spallata',
      startup: 5,
      active: 7,
      recovery: 9,
      damage: 10,
      baseKnockback: 7.8,
      knockbackScaling: 0.78,
      angle: -0.22,
      boxOffset: { x: 26, y: -18, w: 56, h: 36 },
      slideSpeed: 6.5,
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    down_light: {
      name: 'Spazzata Elettrica Bassa',
      startup: 4,
      active: 6,
      recovery: 7,
      damage: 8,
      baseKnockback: 7.6,
      knockbackScaling: 0.5,
      angle: -Math.PI / 2.3,
      boxOffset: { x: 20, y: 10, w: 52, h: 24 },
      soundType: 'thunder',
      effectColor: '#ef4444',
    },
    up_light: {
      name: 'Montante del Fulmine',
      startup: 4,
      active: 6,
      recovery: 8,
      damage: 9,
      baseKnockback: 9.0,
      knockbackScaling: 0.8,
      angle: -Math.PI / 2,
      boxOffset: { x: 2, y: -48, w: 46, h: 54 },
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    neutral_air: {
      name: 'Scoppio Elettrico a 360°',
      startup: 4,
      active: 8,
      recovery: 7,
      damage: 8.5,
      baseKnockback: 6.8,
      knockbackScaling: 0.58,
      angle: -0.45,
      boxOffset: { x: 0, y: -12, w: 58, h: 58 },
      isAerial: true,
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    forward_air: {
      name: 'Maglio Tuonante Aereo',
      startup: 7,
      active: 8,
      recovery: 10,
      damage: 12,
      baseKnockback: 9.6,
      knockbackScaling: 0.96,
      angle: -0.3,
      boxOffset: { x: 26, y: -16, w: 54, h: 44 },
      isAerial: true,
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    down_air: {
      name: 'Doppio Pugno Tuono Discendente',
      startup: 8,
      active: 8,
      recovery: 12,
      damage: 13.5,
      baseKnockback: 10.5,
      knockbackScaling: 1.05,
      angle: -0.25,
      boxOffset: { x: 0, y: 22, w: 48, h: 48 },
      isAerial: true,
      soundType: 'thunder',
      effectColor: '#ef4444',
    },
    heavy_smash: {
      name: 'Pugno Fracassa-Montagne',
      startup: 14,
      active: 10,
      recovery: 22,
      damage: 27,
      baseKnockback: 16.5,
      knockbackScaling: 1.6,
      angle: -0.25,
      boxOffset: { x: 32, y: -22, w: 74, h: 52 },
      isSmash: true,
      slideSpeed: 7,
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    // Specials
    neutral_special: {
      name: 'Sfera di Fulmini del Titano',
      startup: 6,
      active: 7,
      recovery: 11,
      damage: 14,
      baseKnockback: 10,
      knockbackScaling: 0.95,
      angle: -0.24,
      boxOffset: { x: 26, y: -18, w: 48, h: 36 },
      isSpecial: true,
      specialSlot: 'neutral',
      projectileType: 'thunder_orb',
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    side_special: {
      name: 'Pugno Missile del Tuono',
      startup: 6,
      active: 9,
      recovery: 13,
      damage: 15,
      baseKnockback: 12.5,
      knockbackScaling: 1.25,
      angle: -0.22,
      boxOffset: { x: 34, y: -20, w: 70, h: 44 },
      slideSpeed: 13,
      isSpecial: true,
      specialSlot: 'side',
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    up_special: {
      name: 'Montante dell\'Uragano',
      startup: 4,
      active: 10,
      recovery: 13,
      damage: 13,
      baseKnockback: 10.5,
      knockbackScaling: 0.88,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -45, w: 52, h: 56 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    up_recovery: {
      name: 'Montante dell\'Uragano',
      startup: 4,
      active: 10,
      recovery: 13,
      damage: 13,
      baseKnockback: 10.5,
      knockbackScaling: 0.88,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -45, w: 52, h: 56 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'thunder',
      effectColor: '#f59e0b',
    },
    down_special: {
      name: 'Schianto Sismico Elettrico',
      startup: 6,
      active: 10,
      recovery: 14,
      damage: 16,
      baseKnockback: 13,
      knockbackScaling: 1.3,
      angle: -Math.PI / 2.3,
      boxOffset: { x: -15, y: 0, w: 70, h: 45 },
      isSpecial: true,
      specialSlot: 'down',
      soundType: 'thunder',
      effectColor: '#ef4444',
    },
  },

  // 5. SHADOW VALKYRIE - FALCE DELL'ABISSO (SCYTHE)
  shadow_valkyrie: {
    neutral_light: {
      name: 'Gancio della Mietitrice',
      startup: 4,
      active: 6,
      recovery: 7,
      damage: 7.5,
      baseKnockback: 5.5,
      knockbackScaling: 0.45,
      angle: -0.28,
      boxOffset: { x: 26, y: -20, w: 52, h: 36 },
      soundType: 'special',
      effectColor: '#ec4899',
    },
    side_light: {
      name: 'Falciata d\'Aura Oscura',
      startup: 5,
      active: 7,
      recovery: 9,
      damage: 9.5,
      baseKnockback: 7.5,
      knockbackScaling: 0.75,
      angle: -0.22,
      boxOffset: { x: 30, y: -18, w: 62, h: 36 },
      slideSpeed: 6,
      soundType: 'special',
      effectColor: '#8b5cf6',
    },
    down_light: {
      name: 'Trappola Spettrale',
      startup: 4,
      active: 6,
      recovery: 8,
      damage: 8,
      baseKnockback: 7.8,
      knockbackScaling: 0.52,
      angle: -Math.PI / 2.3,
      boxOffset: { x: 22, y: 10, w: 54, h: 26 },
      soundType: 'special',
      effectColor: '#ec4899',
    },
    up_light: {
      name: 'Falce Lunare Ascendente',
      startup: 4,
      active: 7,
      recovery: 8,
      damage: 8.8,
      baseKnockback: 8.8,
      knockbackScaling: 0.76,
      angle: -Math.PI / 2,
      boxOffset: { x: 2, y: -48, w: 48, h: 54 },
      soundType: 'special',
      effectColor: '#ec4899',
    },
    neutral_air: {
      name: 'Vortice dell\'Abisso',
      startup: 4,
      active: 8,
      recovery: 8,
      damage: 8.5,
      baseKnockback: 7,
      knockbackScaling: 0.6,
      angle: -0.45,
      boxOffset: { x: 0, y: -12, w: 60, h: 60 },
      isAerial: true,
      soundType: 'special',
      effectColor: '#ec4899',
    },
    forward_air: {
      name: 'Bacio della Morte',
      startup: 6,
      active: 8,
      recovery: 10,
      damage: 11.5,
      baseKnockback: 9.2,
      knockbackScaling: 0.92,
      angle: -0.32,
      boxOffset: { x: 30, y: -16, w: 58, h: 44 },
      isAerial: true,
      soundType: 'special',
      effectColor: '#8b5cf6',
    },
    down_air: {
      name: 'Falciata a Precipizio',
      startup: 7,
      active: 8,
      recovery: 11,
      damage: 12.5,
      baseKnockback: 9.8,
      knockbackScaling: 1.05,
      angle: -0.25,
      boxOffset: { x: 2, y: 24, w: 48, h: 48 },
      isAerial: true,
      soundType: 'special',
      effectColor: '#ec4899',
    },
    heavy_smash: {
      name: 'Raffica dell\'Oblio Etereo',
      startup: 11,
      active: 11,
      recovery: 18,
      damage: 22,
      baseKnockback: 14,
      knockbackScaling: 1.42,
      angle: -0.27,
      boxOffset: { x: 32, y: -20, w: 74, h: 50 },
      isSmash: true,
      slideSpeed: 7,
      soundType: 'special',
      effectColor: '#ec4899',
    },
    // Specials
    neutral_special: {
      name: 'Sfera dell\'Oblio Gravitazionale',
      startup: 5,
      active: 7,
      recovery: 11,
      damage: 11,
      baseKnockback: 8.2,
      knockbackScaling: 0.8,
      angle: -0.26,
      boxOffset: { x: 26, y: -20, w: 46, h: 36 },
      isSpecial: true,
      specialSlot: 'neutral',
      projectileType: 'void_sphere',
      soundType: 'special',
      effectColor: '#ec4899',
    },
    side_special: {
      name: 'Mietitura delle Ali d\'Ombra',
      startup: 4,
      active: 8,
      recovery: 11,
      damage: 13,
      baseKnockback: 10.5,
      knockbackScaling: 1.02,
      angle: -0.22,
      boxOffset: { x: 32, y: -18, w: 66, h: 40 },
      slideSpeed: 10,
      isSpecial: true,
      specialSlot: 'side',
      soundType: 'special',
      effectColor: '#8b5cf6',
    },
    up_special: {
      name: 'Ascesa delle Ali Notturne',
      startup: 4,
      active: 10,
      recovery: 12,
      damage: 11.5,
      baseKnockback: 9.5,
      knockbackScaling: 0.8,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -42, w: 52, h: 52 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'special',
      effectColor: '#8b5cf6',
    },
    up_recovery: {
      name: 'Ascesa delle Ali Notturne',
      startup: 4,
      active: 10,
      recovery: 12,
      damage: 11.5,
      baseKnockback: 9.5,
      knockbackScaling: 0.8,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -42, w: 52, h: 52 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'special',
      effectColor: '#8b5cf6',
    },
    down_special: {
      name: 'Vortice dell\'Abisso a 360°',
      startup: 4,
      active: 12,
      recovery: 12,
      damage: 14,
      baseKnockback: 12,
      knockbackScaling: 1.18,
      angle: -0.32,
      boxOffset: { x: -18, y: -24, w: 76, h: 56 },
      isSpecial: true,
      specialSlot: 'down',
      soundType: 'special',
      effectColor: '#ec4899',
    },
  },

  // 6. MECHA STRIKER - ARTIGLIERIA PESANTE & JETPACK (BLASTER)
  mecha_striker: {
    neutral_light: {
      name: 'Colpo Blaster Istantaneo',
      startup: 3,
      active: 5,
      recovery: 6,
      damage: 7,
      baseKnockback: 4.6,
      knockbackScaling: 0.36,
      angle: -0.2,
      boxOffset: { x: 32, y: -18, w: 58, h: 28 },
      soundType: 'laser',
      effectColor: '#10b981',
    },
    side_light: {
      name: 'Raffica Laser Mobile',
      startup: 4,
      active: 7,
      recovery: 8,
      damage: 9,
      baseKnockback: 6.8,
      knockbackScaling: 0.68,
      angle: -0.18,
      boxOffset: { x: 36, y: -16, w: 66, h: 30 },
      slideSpeed: 6.5,
      soundType: 'laser',
      effectColor: '#10b981',
    },
    down_light: {
      name: 'Mina a Impulso Protonico',
      startup: 4,
      active: 6,
      recovery: 7,
      damage: 7.5,
      baseKnockback: 7.4,
      knockbackScaling: 0.46,
      angle: -Math.PI / 2.3,
      boxOffset: { x: 20, y: 10, w: 52, h: 26 },
      soundType: 'laser',
      effectColor: '#3b82f6',
    },
    up_light: {
      name: 'Flak Protonico Antiaereo',
      startup: 4,
      active: 7,
      recovery: 8,
      damage: 8.5,
      baseKnockback: 8.4,
      knockbackScaling: 0.74,
      angle: -Math.PI / 2,
      boxOffset: { x: 0, y: -52, w: 46, h: 56 },
      soundType: 'laser',
      effectColor: '#10b981',
    },
    neutral_air: {
      name: 'Scarica di Sicurezza Exhaust',
      startup: 4,
      active: 7,
      recovery: 7,
      damage: 7.5,
      baseKnockback: 6.4,
      knockbackScaling: 0.52,
      angle: -0.45,
      boxOffset: { x: 0, y: -10, w: 54, h: 54 },
      isAerial: true,
      soundType: 'laser',
      effectColor: '#3b82f6',
    },
    forward_air: {
      name: 'Cannone d\'Assalto Frontale',
      startup: 5,
      active: 7,
      recovery: 9,
      damage: 11,
      baseKnockback: 8.8,
      knockbackScaling: 0.88,
      angle: -0.3,
      boxOffset: { x: 34, y: -15, w: 60, h: 36 },
      isAerial: true,
      soundType: 'laser',
      effectColor: '#10b981',
    },
    down_air: {
      name: 'Propulsione Jetpack Fuoco',
      startup: 6,
      active: 8,
      recovery: 10,
      damage: 12,
      baseKnockback: 9.4,
      knockbackScaling: 0.95,
      angle: -0.22,
      boxOffset: { x: 0, y: 24, w: 48, h: 46 },
      isAerial: true,
      soundType: 'laser',
      effectColor: '#3b82f6',
    },
    heavy_smash: {
      name: 'Mega Raggio Annichilatore',
      startup: 12,
      active: 12,
      recovery: 20,
      damage: 24,
      baseKnockback: 14.8,
      knockbackScaling: 1.48,
      angle: -0.24,
      boxOffset: { x: 38, y: -24, w: 98, h: 48 },
      isSmash: true,
      soundType: 'laser',
      effectColor: '#10b981',
    },
    // Specials
    neutral_special: {
      name: 'Missile Protonico Esplosivo',
      startup: 4,
      active: 6,
      recovery: 10,
      damage: 16,
      baseKnockback: 11,
      knockbackScaling: 1.1,
      angle: -0.24,
      boxOffset: { x: 30, y: -16, w: 50, h: 32 },
      isSpecial: true,
      specialSlot: 'neutral',
      projectileType: 'proton_missile',
      soundType: 'laser',
      effectColor: '#10b981',
    },
    side_special: {
      name: 'Fascio Laser Protonico Continuo',
      startup: 4,
      active: 10,
      recovery: 14,
      damage: 15,
      baseKnockback: 11.5,
      knockbackScaling: 1.15,
      angle: -0.2,
      boxOffset: { x: 35, y: -18, w: 180, h: 36 },
      isSpecial: true,
      specialSlot: 'side',
      projectileType: 'laser_beam',
      soundType: 'laser',
      effectColor: '#10b981',
    },
    up_special: {
      name: 'Sovraccarico Jetpack Rocket',
      startup: 4,
      active: 10,
      recovery: 12,
      damage: 11,
      baseKnockback: 9.2,
      knockbackScaling: 0.8,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -40, w: 48, h: 52 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'laser',
      effectColor: '#10b981',
    },
    up_recovery: {
      name: 'Sovraccarico Jetpack Rocket',
      startup: 4,
      active: 10,
      recovery: 12,
      damage: 11,
      baseKnockback: 9.2,
      knockbackScaling: 0.8,
      angle: -Math.PI / 2.2,
      boxOffset: { x: 0, y: -40, w: 48, h: 52 },
      isAerial: true,
      isSpecial: true,
      specialSlot: 'up',
      soundType: 'laser',
      effectColor: '#10b981',
    },
    down_special: {
      name: 'Mina Protonica da Prossimità',
      startup: 4,
      active: 6,
      recovery: 9,
      damage: 18,
      baseKnockback: 13,
      knockbackScaling: 1.3,
      angle: -0.3,
      boxOffset: { x: 16, y: 12, w: 38, h: 26 },
      isSpecial: true,
      specialSlot: 'down',
      projectileType: 'proximity_mine',
      soundType: 'laser',
      effectColor: '#3b82f6',
    },
  },
};

export function getHeroAttack(heroId: HeroId, attackKey: string): AttackDefinition {
  const heroMoveset = HERO_MOVESETS[heroId] || HERO_MOVESETS.valiant_knight;
  return heroMoveset[attackKey] || HERO_MOVESETS.valiant_knight[attackKey] || HERO_MOVESETS.valiant_knight.neutral_light;
}

// Fallback legacy reference
export const ATTACKS = HERO_MOVESETS.valiant_knight;

export const PHYSICS_CONSTANTS = {
  GRAVITY: 0.44,
  MAX_FALL_SPEED: 11.5,
  FAST_FALL_SPEED: 17,
  GROUND_ACCEL: 1.1,
  AIR_ACCEL: 0.65,
  GROUND_FRICTION: 0.82,
  AIR_FRICTION: 0.94,
  BASE_SPEED: 5.6,
  JUMP_SPEED: -11.6,
  DOUBLE_JUMP_SPEED: -10.2,
  WALL_SLIDE_SPEED: 2.2,
  DODGE_SPEED: 11,
  DODGE_FRAMES: 18,
};

export function updateFighterPhysics(
  fighter: FighterEntity,
  inputs: {
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
    dropThrough?: boolean;
  },
  stage: Stage,
  onSpawnParticle: (p: Omit<GameParticle, 'id'>) => void,
  onPlaySound: (name: string, payload?: any) => void
): { hitboxes: Hitbox[]; koOccurred: boolean; spawnedProjectiles: ProjectileEntity[] } {
  const hero = HEROES[fighter.customization.heroId] || HEROES.valiant_knight;
  const hitboxes: Hitbox[] = [];
  const spawnedProjectiles: ProjectileEntity[] = [];
  let koOccurred = false;

  // Solid ground level for the stage (Cannot fall under the map!)
  const solidFloor = stage.platforms.find(p => !p.isSoft) || stage.platforms[0];
  const floorY = solidFloor ? solidFloor.y : 660;

  // Handle KO / Respawn timers
  if (fighter.actionState === 'ko') {
    fighter.stateTimer--;
    if (fighter.stateTimer <= 0 && fighter.stocks > 0) {
      // Respawn
      fighter.actionState = 'respawning';
      const spawnIdx = Math.floor(Math.random() * stage.spawnPoints.length);
      fighter.x = stage.spawnPoints[spawnIdx].x;
      fighter.y = stage.spawnPoints[spawnIdx].y;
      fighter.vx = 0;
      fighter.vy = 0;
      fighter.damagePercent = 0;
      fighter.invincibleTimer = 120; // 2 seconds invulnerability
      fighter.stateTimer = 40;
    }
    return { hitboxes, koOccurred: false, spawnedProjectiles };
  }

  if (fighter.actionState === 'respawning') {
    fighter.stateTimer--;
    fighter.vx = 0;
    fighter.vy = 0;
    if (fighter.stateTimer <= 0) {
      fighter.actionState = 'idle';
      fighter.jumpsLeft = fighter.maxJumps;
    }
    return { hitboxes, koOccurred: false, spawnedProjectiles };
  }

  // Timers decrement
  if (fighter.invincibleTimer > 0) fighter.invincibleTimer--;
  if (fighter.dodgeCooldown > 0) fighter.dodgeCooldown--;
  if (fighter.emoteTimer > 0) {
    fighter.emoteTimer--;
    if (fighter.emoteTimer <= 0) fighter.currentEmote = null;
  }

  // Trail buffer for motion blur / effects
  if (Math.abs(fighter.vx) > 3 || Math.abs(fighter.vy) > 4 || fighter.actionState === 'dodge') {
    fighter.trailPositions.push({ x: fighter.x, y: fighter.y, alpha: 0.6 });
    if (fighter.trailPositions.length > 6) fighter.trailPositions.shift();
  } else if (fighter.trailPositions.length > 0) {
    fighter.trailPositions.shift();
  }

  // Shield health initialization & passive regeneration when not shielding
  if (fighter.shieldHealth === undefined) {
    fighter.shieldHealth = 100;
  }
  if (fighter.actionState !== 'shield') {
    fighter.isShielding = false;
    fighter.shieldHealth = Math.min(100, fighter.shieldHealth + 0.35);
  }

  // Jump input edge-detection (prevents instant multi-frame consumption!)
  const jumpJustPressed = !!inputs.jump && !fighter.prevJumpInput;
  fighter.prevJumpInput = !!inputs.jump;

  // 1. HITSTUN HANDLING (Slide on ground, do NOT fall down through platforms!)
  if (fighter.actionState === 'hitstun') {
    fighter.hitstunTimer--;

    // If already on ground, stay grounded and slide back with ground friction!
    if (fighter.isGrounded) {
      fighter.vx *= PHYSICS_CONSTANTS.GROUND_FRICTION;
      fighter.vy = 0;
      fighter.x += fighter.vx;
    } else {
      // In air, apply light gravity and dampening
      fighter.vy += PHYSICS_CONSTANTS.GRAVITY * 0.65;
      fighter.vy = Math.min(fighter.vy, 7); // never let hitstun plunge downwards!
      fighter.x += fighter.vx;
      fighter.y += fighter.vy;
      fighter.vx *= 0.96;
    }

    // Platform collisions during hitstun: catch falling fighters so they never pass through!
    const fighterFeet = fighter.y + fighter.height / 2;
    for (const plat of stage.platforms) {
      const isHoriz = (fighter.x + fighter.width / 2 > plat.x) && (fighter.x - fighter.width / 2 < plat.x + plat.width);
      if (isHoriz && fighter.vy >= 0 && fighterFeet >= plat.y && fighterFeet <= plat.y + 24) {
        fighter.y = plat.y - fighter.height / 2;
        fighter.vy = 0;
        fighter.isGrounded = true;
        fighter.jumpsLeft = fighter.maxJumps;
        break;
      }
    }

    // Smoke trail when flying at high knockback
    if (Math.abs(fighter.vx) > 5 || Math.abs(fighter.vy) > 5) {
      onSpawnParticle({
        x: fighter.x + (Math.random() * 20 - 10),
        y: fighter.y + (Math.random() * 20 - 10),
        vx: -fighter.vx * 0.15,
        vy: -fighter.vy * 0.15,
        color: '#94a3b8',
        size: Math.random() * 5 + 3,
        alpha: 0.7,
        life: 0,
        maxLife: 15,
        type: 'smoke',
      });
    }

    // Impenetrable floor safeguard in hitstun - CANNOT fall under the map!
    if (fighter.y + fighter.height / 2 >= floorY) {
      fighter.y = floorY - fighter.height / 2;
      fighter.vy = 0;
      fighter.isGrounded = true;
      fighter.jumpsLeft = fighter.maxJumps;
      onSpawnParticle({
        x: fighter.x,
        y: floorY,
        vx: 0,
        vy: -2,
        color: '#06b6d4',
        size: 9,
        alpha: 0.9,
        life: 0,
        maxLife: 14,
        type: 'shockwave',
      });
    }

    // Check blast zones (Left, Right, Top only - cannot fall down and die!)
    if (
      fighter.x < stage.blastZone.minX ||
      fighter.x > stage.blastZone.maxX ||
      fighter.y < stage.blastZone.minY
    ) {
      fighter.stocks--;
      fighter.actionState = 'ko';
      fighter.stateTimer = 60;
      onPlaySound('ko');
      return { hitboxes, koOccurred: true, spawnedProjectiles };
    }

    if (fighter.hitstunTimer <= 0) {
      fighter.actionState = fighter.isGrounded ? 'idle' : 'fall';
    }
    return { hitboxes, koOccurred: false, spawnedProjectiles };
  }

  // 2. SHIELD MECHANIC (Protects from all attacks, avoids all stordimento / stun!)
  if (fighter.actionState === 'shield') {
    fighter.isShielding = true;
    fighter.vx *= 0.82;
    fighter.vy = 0;
    fighter.shieldHealth = Math.max(0, fighter.shieldHealth - 0.22);

    // Cancel shield with Jump (Jump out of shield!)
    if (jumpJustPressed) {
      fighter.actionState = 'jump';
      fighter.isShielding = false;
      fighter.vy = PHYSICS_CONSTANTS.JUMP_SPEED;
      fighter.isGrounded = false;
      fighter.jumpsLeft = fighter.maxJumps;
      onPlaySound('jump');
      return { hitboxes, koOccurred: false, spawnedProjectiles };
    }

    // Cancel shield with Attack (Shield-drop attack)
    if (inputs.light || inputs.heavy || inputs.special) {
      fighter.actionState = 'idle';
      fighter.isShielding = false;
    }

    // Drop shield when button is released
    if (!inputs.shield) {
      fighter.actionState = fighter.isGrounded ? 'idle' : 'fall';
      fighter.isShielding = false;
    }

    // Shield Break if held until completely depleted
    if (fighter.shieldHealth <= 0) {
      fighter.actionState = 'hitstun';
      fighter.hitstunTimer = 40;
      fighter.shieldHealth = 40;
      fighter.isShielding = false;
      onPlaySound('hit', { damage: 10, isHeavy: true });
      onSpawnParticle({
        x: fighter.x,
        y: fighter.y,
        vx: 0,
        vy: -2,
        color: '#f43f5e',
        size: 16,
        alpha: 1,
        life: 0,
        maxLife: 20,
        type: 'shockwave',
      });
      return { hitboxes, koOccurred: false, spawnedProjectiles };
    }

    if (fighter.actionState === 'shield') {
      return { hitboxes, koOccurred: false, spawnedProjectiles };
    }
  }

  // Check if Shield trigger
  if (inputs.shield && fighter.actionState !== 'attack') {
    fighter.actionState = 'shield';
    fighter.isShielding = true;
    onPlaySound('shield_open');
    return { hitboxes, koOccurred: false, spawnedProjectiles };
  }

  // 3. DODGE / AIR DASH
  if (fighter.actionState === 'dodge') {
    fighter.stateTimer--;
    fighter.x += fighter.vx;
    fighter.y += fighter.vy;
    fighter.vx *= 0.94;
    fighter.vy *= 0.94;

    onSpawnParticle({
      x: fighter.x,
      y: fighter.y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: '#38bdf8',
      size: 4,
      alpha: 0.5,
      life: 0,
      maxLife: 12,
      type: 'shockwave',
    });

    if (fighter.stateTimer <= 0) {
      fighter.actionState = fighter.isGrounded ? 'idle' : 'fall';
      fighter.dodgeCooldown = fighter.isGrounded ? 45 : 75;
    }
    return { hitboxes, koOccurred: false, spawnedProjectiles };
  }

  // Check if Dodge trigger
  if (inputs.dodge && fighter.dodgeCooldown <= 0 && fighter.actionState !== 'attack') {
    fighter.actionState = 'dodge';
    fighter.stateTimer = PHYSICS_CONSTANTS.DODGE_FRAMES;
    fighter.invincibleTimer = PHYSICS_CONSTANTS.DODGE_FRAMES;
    let dodgeX = 0;
    let dodgeY = 0;
    if (inputs.left) dodgeX = -1;
    if (inputs.right) dodgeX = 1;
    if (inputs.up) dodgeY = -0.7;
    if (inputs.down) dodgeY = 0.7;

    if (dodgeX === 0 && dodgeY === 0) {
      dodgeX = fighter.facing;
    }

    fighter.vx = dodgeX * PHYSICS_CONSTANTS.DODGE_SPEED;
    fighter.vy = dodgeY * PHYSICS_CONSTANTS.DODGE_SPEED * 0.8;
    onPlaySound('dodge');
    return { hitboxes, koOccurred: false, spawnedProjectiles };
  }

  // 4. ATTACK STATE HANDLING & CHARGING
  if (fighter.actionState === 'attack' && fighter.activeAttack) {
    const atk = fighter.activeAttack;

    // Check smash charge
    if (fighter.isCharging) {
      if (inputs.heavy && fighter.chargeTime < 35) {
        fighter.chargeTime++;
        if (fighter.chargeTime % 4 === 0) {
          onSpawnParticle({
            x: fighter.x + (Math.random() * 30 - 15),
            y: fighter.y + (Math.random() * 30 - 15),
            vx: 0,
            vy: -1.5,
            color: hero.accentColor,
            size: Math.random() * 4 + 2,
            alpha: 0.8,
            life: 0,
            maxLife: 14,
            type: 'spark',
          });
        }
        return { hitboxes, koOccurred: false, spawnedProjectiles };
      } else {
        fighter.isCharging = false;
        fighter.attackFrame = atk.startup; // start active swing
        onPlaySound('swing', { type: atk.soundType || 'heavy' });
      }
    }

    fighter.attackFrame++;

    // Generate hitbox and projectiles during active frames
    const isStartupDone = fighter.attackFrame >= atk.startup;
    const isActiveFrames = fighter.attackFrame < atk.startup + atk.active;

    if (isStartupDone && isActiveFrames && !fighter.hasHitInCurrentAttack) {
      const chargeBonus = 1 + (fighter.chargeTime / 35) * 0.45;
      const hbX = fighter.facing === 1
        ? fighter.x + atk.boxOffset.x
        : fighter.x - atk.boxOffset.x - atk.boxOffset.w;
      const hbY = fighter.y + atk.boxOffset.y;

      // Spawn weapon effect particles
      if (atk.effectColor) {
        onSpawnParticle({
          x: hbX + atk.boxOffset.w / 2,
          y: hbY + atk.boxOffset.h / 2,
          vx: fighter.facing * 2.5,
          vy: 0,
          color: atk.effectColor,
          size: atk.isSmash ? 10 : 6,
          alpha: 0.9,
          life: 0,
          maxLife: 12,
          type: atk.isSmash ? 'shockwave' : 'spark',
        });
      }

      hitboxes.push({
        id: `hb_${fighter.id}_${fighter.attackFrame}`,
        ownerId: fighter.id,
        ownerHeroId: fighter.customization.heroId,
        x: hbX,
        y: hbY,
        width: atk.boxOffset.w,
        height: atk.boxOffset.h,
        damage: Math.round(atk.damage * hero.damageMult * chargeBonus),
        baseKnockback: atk.baseKnockback * chargeBonus,
        knockbackScaling: atk.knockbackScaling * chargeBonus,
        angle: fighter.facing === 1 ? atk.angle : Math.PI - atk.angle,
        duration: 2,
        attackType: atk.name,
      });

      // Spawn projectile on first active frame if attack produces one
      if (atk.projectileType && fighter.attackFrame === atk.startup) {
        const projX = fighter.x + fighter.facing * 28;
        const projY = fighter.y - 12;

        if (atk.projectileType === 'cyber_shuriken') {
          // Fire 3 shurikens in a spread!
          [-1.6, 0, 1.6].forEach((spreadVy, idx) => {
            spawnedProjectiles.push({
              id: `proj_${fighter.id}_${Date.now()}_${idx}`,
              ownerId: fighter.id,
              heroId: fighter.customization.heroId,
              type: 'cyber_shuriken',
              name: 'Shuriken Cibernetico',
              x: projX,
              y: projY + spreadVy * 4,
              vx: fighter.facing * 16.5,
              vy: spreadVy,
              width: 22,
              height: 22,
              damage: 6,
              baseKnockback: 6.5,
              knockbackScaling: 0.55,
              angle: -0.22,
              color: '#06b6d4',
              life: 0,
              maxLife: 45,
              rotation: 0,
              rotationSpeed: 0.35,
            });
          });
        } else if (atk.projectileType === 'katana_wind') {
          spawnedProjectiles.push({
            id: `proj_${fighter.id}_${Date.now()}`,
            ownerId: fighter.id,
            heroId: fighter.customization.heroId,
            type: 'katana_wind',
            name: 'Vento Tagliente Muramasa',
            x: projX,
            y: projY,
            vx: fighter.facing * 14.5,
            vy: 0,
            width: 44,
            height: 48,
            damage: 13,
            baseKnockback: 9.8,
            knockbackScaling: 0.88,
            angle: -0.24,
            color: '#f43f5e',
            life: 0,
            maxLife: 50,
            rotation: 0,
            rotationSpeed: 0.05,
          });
        } else if (atk.projectileType === 'holy_wave') {
          spawnedProjectiles.push({
            id: `proj_${fighter.id}_${Date.now()}`,
            ownerId: fighter.id,
            heroId: fighter.customization.heroId,
            type: 'holy_wave',
            name: 'Onda di Luce Runica',
            x: projX,
            y: projY,
            vx: fighter.facing * 11.5,
            vy: 0,
            width: 36,
            height: 60,
            damage: 14,
            baseKnockback: 10.5,
            knockbackScaling: 0.95,
            angle: -0.25,
            color: '#fbbf24',
            life: 0,
            maxLife: 55,
          });
        } else if (atk.projectileType === 'thunder_orb') {
          spawnedProjectiles.push({
            id: `proj_${fighter.id}_${Date.now()}`,
            ownerId: fighter.id,
            heroId: fighter.customization.heroId,
            type: 'thunder_orb',
            name: 'Sfera di Fulmini del Titano',
            x: projX,
            y: projY,
            vx: fighter.facing * 9.5,
            vy: 0.5,
            width: 34,
            height: 34,
            damage: 15,
            baseKnockback: 11.2,
            knockbackScaling: 1.05,
            angle: -0.25,
            color: '#f59e0b',
            life: 0,
            maxLife: 60,
            rotation: 0,
            rotationSpeed: 0.2,
          });
        } else if (atk.projectileType === 'proton_missile') {
          spawnedProjectiles.push({
            id: `proj_${fighter.id}_${Date.now()}`,
            ownerId: fighter.id,
            heroId: fighter.customization.heroId,
            type: 'proton_missile',
            name: 'Missile Protonico',
            x: projX,
            y: projY,
            vx: fighter.facing * 15,
            vy: 0,
            width: 30,
            height: 16,
            damage: 17,
            baseKnockback: 12,
            knockbackScaling: 1.15,
            angle: -0.25,
            color: '#10b981',
            life: 0,
            maxLife: 55,
          });
        } else if (atk.projectileType === 'void_sphere') {
          spawnedProjectiles.push({
            id: `proj_${fighter.id}_${Date.now()}`,
            ownerId: fighter.id,
            heroId: fighter.customization.heroId,
            type: 'void_sphere',
            name: 'Sfera dell\'Oblio',
            x: projX,
            y: projY,
            vx: fighter.facing * 5.2,
            vy: 0,
            width: 46,
            height: 46,
            damage: 12,
            baseKnockback: 9.0,
            knockbackScaling: 0.85,
            angle: -0.28,
            color: '#ec4899',
            life: 0,
            maxLife: 75,
            piercing: true,
          });
        } else if (atk.projectileType === 'proximity_mine') {
          spawnedProjectiles.push({
            id: `proj_${fighter.id}_${Date.now()}`,
            ownerId: fighter.id,
            heroId: fighter.customization.heroId,
            type: 'proximity_mine',
            name: 'Mina Magnetica di Prossimità',
            x: fighter.x,
            y: fighter.y + fighter.height / 2 - 4,
            vx: 0,
            vy: 0,
            width: 26,
            height: 14,
            damage: 18,
            baseKnockback: 13,
            knockbackScaling: 1.25,
            angle: -Math.PI / 2.3,
            color: fighter.customization.heroId === 'cyber_ninja' ? '#a855f7' : '#3b82f6',
            life: 0,
            maxLife: 360, // 6 seconds arm time
            isMine: true,
          });
        }
      }
    }

    // Recover phase done
    if (fighter.attackFrame >= atk.startup + atk.active + atk.recovery) {
      fighter.actionState = fighter.isGrounded ? 'idle' : 'fall';
      fighter.activeAttack = null;
      fighter.attackFrame = 0;
      fighter.hasHitInCurrentAttack = false;
      fighter.chargeTime = 0;
      fighter.isCharging = false;
    }

    // In-air attack gravity dampened slightly
    if (!fighter.isGrounded) {
      fighter.vy += PHYSICS_CONSTANTS.GRAVITY * 0.7;
      fighter.y += fighter.vy;
      fighter.x += fighter.vx;
      fighter.vx *= PHYSICS_CONSTANTS.AIR_FRICTION;
    } else {
      fighter.vx *= PHYSICS_CONSTANTS.GROUND_FRICTION;
      fighter.x += fighter.vx;
    }

    return { hitboxes, koOccurred: false, spawnedProjectiles };
  }

  // 4. ATTACK INPUT INITIATION (Tailored to each hero archetype!)
  if (fighter.actionState !== 'attack') {
    let triggeredAttack: AttackDefinition | null = null;
    let isCharging = false;
    const heroId = fighter.customization.heroId || 'valiant_knight';

    if (inputs.heavy) {
      // Signature Heavy Smash
      triggeredAttack = getHeroAttack(heroId, 'heavy_smash');
      isCharging = true;
    } else if (inputs.special) {
      // Directional Specials: Neutral, Side, Up, Down!
      if (inputs.down) {
        triggeredAttack = getHeroAttack(heroId, 'down_special');
      } else if (inputs.up) {
        triggeredAttack = getHeroAttack(heroId, 'up_special');
        // Hero-specific vertical thrust & mechanics
        if (heroId === 'cyber_ninja') {
          fighter.vy = -13.6; // Quantum Teleport launch
        } else if (heroId === 'katana_ronin') {
          fighter.vy = -13.0; // Soaring Crane leap
        } else if (heroId === 'mecha_striker') {
          fighter.vy = -12.8; // Jetpack rocket thrusters
        } else if (heroId === 'shadow_valkyrie') {
          fighter.vy = -12.4; // Valkyrie wings ascension
        } else if (heroId === 'thunder_brawler') {
          fighter.vy = -12.0; // Electric thunder rocket
        } else {
          fighter.vy = -11.8; // Valiant leap
        }
      } else if (inputs.left || inputs.right) {
        triggeredAttack = getHeroAttack(heroId, 'side_special');
      } else {
        triggeredAttack = getHeroAttack(heroId, 'neutral_special');
      }

      onPlaySound('swing', { type: triggeredAttack.soundType || 'special' });
    } else if (inputs.light) {
      if (fighter.isGrounded) {
        if (inputs.down) triggeredAttack = getHeroAttack(heroId, 'down_light');
        else if (inputs.up) triggeredAttack = getHeroAttack(heroId, 'up_light');
        else if (inputs.left || inputs.right) triggeredAttack = getHeroAttack(heroId, 'side_light');
        else triggeredAttack = getHeroAttack(heroId, 'neutral_light');
      } else {
        // Aerials
        if (inputs.down) triggeredAttack = getHeroAttack(heroId, 'down_air');
        else if (inputs.left || inputs.right) triggeredAttack = getHeroAttack(heroId, 'forward_air');
        else triggeredAttack = getHeroAttack(heroId, 'neutral_air');
      }
      onPlaySound('swing', { type: triggeredAttack.soundType || 'light' });
    }

    if (triggeredAttack) {
      fighter.actionState = 'attack';
      fighter.activeAttack = triggeredAttack;
      fighter.attackFrame = 0;
      fighter.hasHitInCurrentAttack = false;
      fighter.isCharging = isCharging;
      fighter.chargeTime = 0;

      // Unique forward slide speed per attack
      if (triggeredAttack.slideSpeed) {
        fighter.vx = fighter.facing * triggeredAttack.slideSpeed;
      }
      return { hitboxes, koOccurred: false, spawnedProjectiles };
    }
  }

  // 5. STANDARD MOVEMENT & PLATFORMING
  const maxSpeed = PHYSICS_CONSTANTS.BASE_SPEED * hero.speed;

  // Horizontal Movement
  if (inputs.left) {
    fighter.facing = -1;
    if (fighter.isGrounded) {
      fighter.vx = Math.max(-maxSpeed, fighter.vx - PHYSICS_CONSTANTS.GROUND_ACCEL);
      fighter.actionState = 'run';
    } else {
      fighter.vx = Math.max(-maxSpeed, fighter.vx - PHYSICS_CONSTANTS.AIR_ACCEL);
    }
  } else if (inputs.right) {
    fighter.facing = 1;
    if (fighter.isGrounded) {
      fighter.vx = Math.min(maxSpeed, fighter.vx + PHYSICS_CONSTANTS.GROUND_ACCEL);
      fighter.actionState = 'run';
    } else {
      fighter.vx = Math.min(maxSpeed, fighter.vx + PHYSICS_CONSTANTS.AIR_ACCEL);
    }
  } else {
    // Friction
    if (fighter.isGrounded) {
      fighter.vx *= PHYSICS_CONSTANTS.GROUND_FRICTION;
      if (Math.abs(fighter.vx) < 0.2) fighter.vx = 0;
      if (fighter.actionState === 'run') fighter.actionState = 'idle';
    } else {
      fighter.vx *= PHYSICS_CONSTANTS.AIR_FRICTION;
    }
  }

  // Jump Handling (Ground Jump + Double Air Jump on Edge-Trigger)
  if (jumpJustPressed) {
    if (fighter.isGrounded) {
      fighter.vy = PHYSICS_CONSTANTS.JUMP_SPEED;
      fighter.isGrounded = false;
      fighter.jumpsLeft = fighter.maxJumps; // Keep full air jumps available
      fighter.actionState = 'jump';
      onPlaySound('jump');
      onSpawnParticle({
        x: fighter.x,
        y: fighter.y + fighter.height / 2,
        vx: 0,
        vy: 1,
        color: '#38bdf8',
        size: 7,
        alpha: 0.85,
        life: 0,
        maxLife: 10,
        type: 'shockwave',
      });
    } else if (fighter.isWallSliding) {
      // Wall Jump
      fighter.vy = PHYSICS_CONSTANTS.DOUBLE_JUMP_SPEED;
      fighter.vx = -fighter.wallSlideSide * (maxSpeed * 1.15);
      fighter.facing = (-fighter.wallSlideSide as 1 | -1);
      fighter.isWallSliding = false;
      fighter.jumpsLeft = fighter.maxJumps; // refresh air jumps on wall kick!
      fighter.actionState = 'jump';
      onPlaySound('jump');
    } else if (fighter.jumpsLeft > 0) {
      // Double Jump in mid-air
      fighter.vy = PHYSICS_CONSTANTS.DOUBLE_JUMP_SPEED;
      fighter.jumpsLeft--;
      fighter.actionState = 'jump';
      onPlaySound('double_jump');
      onSpawnParticle({
        x: fighter.x,
        y: fighter.y + fighter.height / 2,
        vx: 0,
        vy: 0.8,
        color: '#facc15',
        size: 11,
        alpha: 0.95,
        life: 0,
        maxLife: 14,
        type: 'shockwave',
      });
    }
  }

  // Fast fall on Down input
  if (inputs.down && !fighter.isGrounded && fighter.vy > 0) {
    fighter.vy = Math.min(PHYSICS_CONSTANTS.FAST_FALL_SPEED, fighter.vy + 0.8);
  }

  // Gravity
  if (!fighter.isGrounded) {
    fighter.vy = Math.min(PHYSICS_CONSTANTS.MAX_FALL_SPEED, fighter.vy + PHYSICS_CONSTANTS.GRAVITY);
    if (fighter.vy > 1.5 && fighter.actionState !== 'jump') {
      fighter.actionState = 'fall';
    }
  }

  // Position update
  const prevY = fighter.y;
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;

  // 6. STAGE PLATFORM COLLISIONS
  let groundedThisFrame = false;
  let wallSlidingThisFrame = false;

  const fighterFeet = fighter.y + fighter.height / 2;
  const fighterPrevFeet = prevY + fighter.height / 2;
  const fighterLeft = fighter.x - fighter.width / 2;
  const fighterRight = fighter.x + fighter.width / 2;

  for (const plat of stage.platforms) {
    const platLeft = plat.x;
    const platRight = plat.x + plat.width;
    const platTop = plat.y;
    const platBottom = plat.y + plat.height;

    if (plat.isSoft) {
      // Soft / Pass-through platform
      const wantsDrop = inputs.down && jumpJustPressed;
      const isHorizontallyAligned = fighterRight > platLeft && fighterLeft < platRight;

      if (
        isHorizontallyAligned &&
        fighterPrevFeet <= platTop + 2 &&
        fighterFeet >= platTop &&
        fighter.vy >= 0 &&
        !wantsDrop
      ) {
        fighter.y = platTop - fighter.height / 2;
        fighter.vy = 0;
        fighter.isGrounded = true;
        fighter.jumpsLeft = fighter.maxJumps;
        groundedThisFrame = true;
        break;
      }
    } else {
      // Solid Main Platform
      // 1. Top collision (landing)
      const isHorizontallyAligned = fighterRight > platLeft && fighterLeft < platRight;
      if (isHorizontallyAligned && fighterPrevFeet <= platTop + 10 && fighterFeet >= platTop && fighter.vy >= 0) {
        fighter.y = platTop - fighter.height / 2;
        fighter.vy = 0;
        fighter.isGrounded = true;
        fighter.jumpsLeft = fighter.maxJumps;
        groundedThisFrame = true;
        break;
      }

      // 2. Wall Slide Collision (Left & Right edges)
      if (!groundedThisFrame && fighter.vy > 0) {
        const isVerticallyInWall = fighterFeet > platTop + 5 && fighter.y - fighter.height / 2 < platBottom;

        // Left wall slide
        if (isVerticallyInWall && Math.abs(fighterRight - platLeft) < 10 && inputs.right) {
          fighter.x = platLeft - fighter.width / 2;
          fighter.vy = Math.min(PHYSICS_CONSTANTS.WALL_SLIDE_SPEED, fighter.vy);
          wallSlidingThisFrame = true;
          fighter.wallSlideSide = -1;
          fighter.actionState = 'wall_slide';

          if (Math.random() < 0.3) {
            onSpawnParticle({
              x: platLeft,
              y: fighterFeet - 5,
              vx: -1,
              vy: -1,
              color: '#facc15',
              size: 3,
              alpha: 0.8,
              life: 0,
              maxLife: 8,
              type: 'spark',
            });
          }
        }
        // Right wall slide
        else if (isVerticallyInWall && Math.abs(fighterLeft - platRight) < 10 && inputs.left) {
          fighter.x = platRight + fighter.width / 2;
          fighter.vy = Math.min(PHYSICS_CONSTANTS.WALL_SLIDE_SPEED, fighter.vy);
          wallSlidingThisFrame = true;
          fighter.wallSlideSide = 1;
          fighter.actionState = 'wall_slide';

          if (Math.random() < 0.3) {
            onSpawnParticle({
              x: platRight,
              y: fighterFeet - 5,
              vx: 1,
              vy: -1,
              color: '#facc15',
              size: 3,
              alpha: 0.8,
              life: 0,
              maxLife: 8,
              type: 'spark',
            });
          }
        }
      }
    }
  }

  // IMPENETRABLE SOLID ARENA FLOOR - IMPOSSIBLE TO FALL UNDER THE MAP!
  if (fighterFeet >= floorY) {
    fighter.y = floorY - fighter.height / 2;
    fighter.vy = 0;
    fighter.isGrounded = true;
    fighter.jumpsLeft = fighter.maxJumps;
    groundedThisFrame = true;

    if (fighter.vy > 6) {
      fighter.vy = -4;
      onSpawnParticle({
        x: fighter.x,
        y: floorY,
        vx: 0,
        vy: -2,
        color: '#06b6d4',
        size: 10,
        alpha: 0.9,
        life: 0,
        maxLife: 15,
        type: 'shockwave',
      });
    }
  }

  fighter.isGrounded = groundedThisFrame;
  fighter.isWallSliding = wallSlidingThisFrame;

  // 7. BLAST ZONE KO DETECTION (Sides and Top only)
  if (
    fighter.x < stage.blastZone.minX ||
    fighter.x > stage.blastZone.maxX ||
    fighter.y < stage.blastZone.minY
  ) {
    fighter.stocks--;
    fighter.actionState = 'ko';
    fighter.stateTimer = 60;
    onPlaySound('ko');
    return { hitboxes, koOccurred: true, spawnedProjectiles };
  }

  return { hitboxes, koOccurred: false, spawnedProjectiles };
}

// Projectiles physics & collision resolver
export function updateProjectiles(
  projectiles: ProjectileEntity[],
  fighters: FighterEntity[],
  stage: Stage,
  onSpawnParticle: (p: Omit<GameParticle, 'id'>) => void,
  onPlaySound: (name: string, payload?: any) => void
): ProjectileEntity[] {
  const activeProjectiles: ProjectileEntity[] = [];

  for (const proj of projectiles) {
    proj.life++;

    // Rotation update
    if (proj.rotation !== undefined && proj.rotationSpeed) {
      proj.rotation += proj.rotationSpeed;
    }

    // Special behavior for Void Sphere: gravitational pull
    if (proj.type === 'void_sphere') {
      for (const f of fighters) {
        if (f.id !== proj.ownerId && f.stocks > 0 && f.actionState !== 'ko') {
          const dist = Math.hypot(proj.x - f.x, proj.y - f.y);
          if (dist < 180 && dist > 10) {
            const pullForce = 1.4 * (1 - dist / 180);
            f.x += ((proj.x - f.x) / dist) * pullForce;
            f.y += ((proj.y - f.y) / dist) * pullForce;
          }
        }
      }
    }

    // Proximity mine behavior: stays put on stage
    if (proj.isMine) {
      if (proj.life > 15) { // armed
        for (const f of fighters) {
          if (f.id !== proj.ownerId && f.stocks > 0 && f.actionState !== 'ko') {
            const dist = Math.hypot(proj.x - f.x, proj.y - (f.y + f.height / 2 - 8));
            if (dist < 45) {
              // DETONATE!
              f.damagePercent += proj.damage;
              f.actionState = 'hitstun';
              f.hitstunTimer = 42;
              f.vx = (f.x > proj.x ? 1 : -1) * 12;
              f.vy = -9;

              onPlaySound('hit', { damage: proj.damage, isHeavy: true });
              for (let i = 0; i < 16; i++) {
                onSpawnParticle({
                  x: proj.x,
                  y: proj.y,
                  vx: (Math.random() - 0.5) * 12,
                  vy: (Math.random() - 0.5) * 12,
                  color: proj.color,
                  size: Math.random() * 8 + 4,
                  alpha: 1,
                  life: 0,
                  maxLife: 20,
                  type: 'shockwave',
                });
              }
              proj.hasDetonated = true;
              break;
            }
          }
        }
      }
      if (proj.hasDetonated || proj.life >= proj.maxLife) {
        continue;
      }
      activeProjectiles.push(proj);
      continue;
    }

    // Standard projectile movement
    proj.x += proj.vx;
    proj.y += proj.vy;

    // Movement visual particles
    if (proj.life % 2 === 0) {
      if (proj.type === 'proton_missile') {
        onSpawnParticle({
          x: proj.x - (proj.vx > 0 ? 12 : -12),
          y: proj.y,
          vx: -proj.vx * 0.15,
          vy: (Math.random() - 0.5) * 1.5,
          color: '#cbd5e1',
          size: Math.random() * 4 + 2,
          alpha: 0.8,
          life: 0,
          maxLife: 15,
          type: 'smoke',
        });
      } else if (proj.type === 'katana_wind') {
        onSpawnParticle({
          x: proj.x - (proj.vx > 0 ? 10 : -10),
          y: proj.y + (Math.random() * 20 - 10),
          vx: -proj.vx * 0.08,
          vy: (Math.random() - 0.5) * 1,
          color: '#f472b6',
          size: 3,
          alpha: 0.85,
          life: 0,
          maxLife: 12,
          type: 'spark',
        });
      } else if (proj.type === 'thunder_orb') {
        onSpawnParticle({
          x: proj.x + (Math.random() * 16 - 8),
          y: proj.y + (Math.random() * 16 - 8),
          vx: 0,
          vy: -1,
          color: '#fef08a',
          size: 3.5,
          alpha: 0.9,
          life: 0,
          maxLife: 10,
          type: 'spark',
        });
      }
    }

    // Hit registration against opponents
    let hitSomething = false;
    for (const f of fighters) {
      if (f.id === proj.ownerId || f.stocks <= 0 || f.actionState === 'ko' || f.invincibleTimer > 0) continue;

      const isHoriz = Math.abs(f.x - proj.x) < (proj.width / 2 + f.width / 2);
      const isVert = Math.abs(f.y - proj.y) < (proj.height / 2 + f.height / 2);

      if (isHoriz && isVert) {
        // 1. SHIELD DEFENSE: Completely blocks projectile and PREVENTS ALL STUN!
        if (f.actionState === 'shield' || f.isShielding) {
          f.shieldHealth = Math.max(0, (f.shieldHealth || 100) - proj.damage * 0.85);
          f.hitstunTimer = 0; // Stun is 100% prevented!
          f.actionState = 'shield';
          f.isShielding = true;
          onPlaySound('shield_block');

          // Shield barrier shockwave
          onSpawnParticle({
            x: proj.x,
            y: proj.y,
            vx: -proj.vx * 0.15,
            vy: (Math.random() - 0.5) * 3,
            color: '#38bdf8',
            size: 14,
            alpha: 1,
            life: 0,
            maxLife: 14,
            type: 'shockwave',
          });

          hitSomething = true;
          if (!proj.piercing) break;
          continue;
        }

        // 2. Unshielded Hit confirmed!
        const hero = HEROES[f.customization.heroId] || HEROES.valiant_knight;
        f.damagePercent += proj.damage;
        const totalKb = (proj.baseKnockback + (f.damagePercent * proj.knockbackScaling * 0.12)) / hero.weight;

        const launchAngle = proj.vx > 0 ? proj.angle : Math.PI - proj.angle;
        if (f.isGrounded) {
          f.vx = Math.cos(launchAngle) * totalKb;
          f.vy = 0;
        } else {
          f.vx = Math.cos(launchAngle) * totalKb;
          f.vy = Math.min(-2, Math.sin(launchAngle) * totalKb);
        }

        f.actionState = 'hitstun';
        // Lower stun for Ren Jinrai's katana wind projectile
        if (proj.type === 'katana_wind' || proj.heroId === 'katana_ronin') {
          f.hitstunTimer = Math.min(12, Math.max(4, Math.floor(totalKb * 0.6)));
        } else {
          f.hitstunTimer = Math.min(38, Math.max(6, Math.floor(totalKb * 1.3)));
        }
        f.activeAttack = null;

        onPlaySound('hit', { damage: proj.damage, isHeavy: proj.damage > 12 });

        for (let i = 0; i < 8; i++) {
          onSpawnParticle({
            x: proj.x,
            y: proj.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            color: proj.color,
            size: Math.random() * 4 + 2,
            alpha: 1,
            life: 0,
            maxLife: 14,
            type: 'spark',
          });
        }

        hitSomething = true;
        if (!proj.piercing) break;
      }
    }

    if (hitSomething && !proj.piercing) {
      continue; // Destroyed on impact
    }

    // Blast zone check or expiration
    if (
      proj.life >= proj.maxLife ||
      proj.x < stage.blastZone.minX - 80 ||
      proj.x > stage.blastZone.maxX + 80
    ) {
      continue;
    }

    activeProjectiles.push(proj);
  }

  return activeProjectiles;
}

// Hitbox vs Hurtbox resolver
export function resolveHitboxCollision(
  hitbox: Hitbox,
  target: FighterEntity,
  stage: Stage,
  onSpawnParticle: (p: Omit<GameParticle, 'id'>) => void,
  onPlaySound: (name: string, payload?: any) => void
): boolean {
  if (hitbox.ownerId === target.id) return false;
  if (target.actionState === 'ko' || target.actionState === 'respawning' || target.invincibleTimer > 0) return false;

  const tLeft = target.x - target.width / 2;
  const tRight = target.x + target.width / 2;
  const tTop = target.y - target.height / 2;
  const tBottom = target.y + target.height / 2;

  const hLeft = hitbox.x;
  const hRight = hitbox.x + hitbox.width;
  const hTop = hitbox.y;
  const hBottom = hitbox.y + hitbox.height;

  // Check overlap AABB
  const isOverlapping = tLeft < hRight && tRight > hLeft && tTop < hBottom && tBottom > hTop;

  if (isOverlapping) {
    const hero = HEROES[target.customization.heroId] || HEROES.valiant_knight;

    // 1. SHIELD MECHANIC: BLOCK ATTACK & COMPLETELY AVOID STUN (evita lo stordimento!)
    if (target.actionState === 'shield' || target.isShielding) {
      // Absorb damage on shield
      target.shieldHealth = Math.max(0, (target.shieldHealth || 100) - hitbox.damage * 0.85);

      // Guard pushback along the ground (no vertical flight, no loss of footing)
      const pushDir = Math.cos(hitbox.angle) >= 0 ? 1 : -1;
      target.vx = pushDir * 3.5;
      target.vy = 0;
      target.isGrounded = true;

      // Minor chip damage (10%), but CRITICAL: NO HITSTUN!
      target.damagePercent += Math.round(hitbox.damage * 0.1);
      target.hitstunTimer = 0;
      target.actionState = 'shield';
      target.isShielding = true;

      onPlaySound('shield_block');

      // Barrier deflection shockwave & sparks
      onSpawnParticle({
        x: target.x + (pushDir > 0 ? -14 : 14),
        y: target.y,
        vx: pushDir * -3,
        vy: (Math.random() - 0.5) * 4,
        color: '#38bdf8',
        size: 16,
        alpha: 1,
        life: 0,
        maxLife: 15,
        type: 'shockwave',
      });

      for (let i = 0; i < 7; i++) {
        onSpawnParticle({
          x: target.x,
          y: target.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#facc15',
          size: 4,
          alpha: 1,
          life: 0,
          maxLife: 12,
          type: 'spark',
        });
      }

      return true;
    }

    // 2. UNSHIELDED HIT
    target.damagePercent += hitbox.damage;

    // Knockback calculation
    const base = hitbox.baseKnockback;
    const scaling = hitbox.knockbackScaling;
    const totalKnockback = (base + (target.damagePercent * scaling * 0.13)) / hero.weight;

    const isAntiAirUppercut = hitbox.angle < -Math.PI / 2.8;

    if (target.isGrounded && !isAntiAirUppercut) {
      // KEEP ON GROUND! Do NOT fall down or lose footing!
      const pushDir = Math.cos(hitbox.angle) >= 0 ? 1 : -1;
      target.vx = pushDir * totalKnockback;
      target.vy = 0;
      target.isGrounded = true;
    } else {
      target.vx = Math.cos(hitbox.angle) * totalKnockback;
      target.vy = Math.min(-1.5, Math.sin(hitbox.angle) * totalKnockback);
      target.isGrounded = false;
    }

    // Apply hitstun: Lower stun for Ren Jinrai attacks ("abbassa lo stordimento di ren jinrai")
    target.actionState = 'hitstun';
    if (hitbox.ownerHeroId === 'katana_ronin') {
      // Greatly reduced hitstun (max 14 frames instead of 50!) for fast recovery
      target.hitstunTimer = Math.min(14, Math.max(4, Math.floor(totalKnockback * 0.65)));
    } else {
      target.hitstunTimer = Math.min(38, Math.max(6, Math.floor(totalKnockback * 1.3)));
    }
    target.activeAttack = null;

    const isHeavy = hitbox.damage >= 14 || totalKnockback > 16;
    onPlaySound('hit', { damage: hitbox.damage, isHeavy });

    // Hit sparks
    const sparkCount = isHeavy ? 12 : 6;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isHeavy ? 9 : 5) + 2;
      onSpawnParticle({
        x: target.x,
        y: target.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: isHeavy ? '#f43f5e' : '#facc15',
        size: Math.random() * 4 + 2,
        alpha: 1,
        life: 0,
        maxLife: isHeavy ? 20 : 12,
        type: 'spark',
      });
    }

    // Heavy hit shockwave
    if (isHeavy) {
      onSpawnParticle({
        x: target.x,
        y: target.y,
        vx: 0,
        vy: 0,
        color: '#ffffff',
        size: 15,
        alpha: 0.9,
        life: 0,
        maxLife: 14,
        type: 'shockwave',
      });
    }

    return true;
  }

  return false;
}
