import { Stage } from '../types/game';

export const STAGES: Record<string, Stage> = {
  celestial_altar: {
    id: 'celestial_altar',
    name: 'Santuario Celeste Immensurabile',
    subtitle: 'Rovine cosmiche titaniche con pavimentazione continua anti-caduta',
    width: 1900,
    height: 1000,
    blastZone: {
      minX: -280,
      maxX: 2180,
      minY: -350,
      maxY: 1600, // No bottom blast zone! Solid arena floor catches all fighters
    },
    platforms: [
      // MASSIVE CONTINUOUS SOLID ARENA FLOOR (Cannot fall under the map!)
      {
        id: 'main_ground',
        x: -250,
        y: 660,
        width: 2400,
        height: 140,
        isSoft: false,
        color: '#0f172a',
      },
      // Left Floating Sanctuary Dais
      {
        id: 'left_sanctuary_dais',
        x: 220,
        y: 510,
        width: 320,
        height: 22,
        isSoft: true,
        color: '#38bdf8',
      },
      // Right Floating Sanctuary Dais
      {
        id: 'right_sanctuary_dais',
        x: 1360,
        y: 510,
        width: 320,
        height: 22,
        isSoft: true,
        color: '#38bdf8',
      },
      // Central High Apex Platform
      {
        id: 'center_high_soft',
        x: 720,
        y: 440,
        width: 460,
        height: 20,
        isSoft: true,
        color: '#a855f7',
      },
      // Mid-Air Left Soft Platform
      {
        id: 'left_mid_soft',
        x: 440,
        y: 330,
        width: 220,
        height: 16,
        isSoft: true,
        color: '#facc15',
      },
      // Mid-Air Right Soft Platform
      {
        id: 'right_mid_soft',
        x: 1240,
        y: 330,
        width: 220,
        height: 16,
        isSoft: true,
        color: '#facc15',
      },
      // Extreme Upper Sky Spire
      {
        id: 'sky_spire_soft',
        x: 840,
        y: 220,
        width: 220,
        height: 16,
        isSoft: true,
        color: '#38bdf8',
      },
    ],
    spawnPoints: [
      { x: 650, y: 590 },
      { x: 1250, y: 590 },
      { x: 380, y: 440 },
      { x: 1520, y: 440 },
    ],
    bgTheme: 'celestial',
  },

  cyber_colosseum: {
    id: 'cyber_colosseum',
    name: 'Mega Colosseo Cybernetico 2099',
    subtitle: 'Enorme metropoli olografica su più livelli con pavimentazione continua anti-caduta',
    width: 2000,
    height: 1050,
    blastZone: {
      minX: -300,
      maxX: 2300,
      minY: -350,
      maxY: 1600, // No bottom blast zone! Solid arena floor catches all fighters
    },
    platforms: [
      // FULL-WIDTH SOLID ARENA FLOOR (Cannot fall under the map!)
      {
        id: 'main_ground',
        x: -250,
        y: 660,
        width: 2500,
        height: 140,
        isSoft: false,
        color: '#090d16',
      },
      // Left Wing Platform
      {
        id: 'cyber_left_wing',
        x: 220,
        y: 510,
        width: 320,
        height: 22,
        isSoft: true,
        color: '#06b6d4',
      },
      // Right Wing Platform
      {
        id: 'cyber_right_wing',
        x: 1460,
        y: 510,
        width: 320,
        height: 22,
        isSoft: true,
        color: '#06b6d4',
      },
      // Central Holographic Runway
      {
        id: 'cyber_center_mid_soft',
        x: 720,
        y: 440,
        width: 560,
        height: 20,
        isSoft: true,
        color: '#ec4899',
      },
      // High Sky Soft Platforms
      {
        id: 'cyber_high_sky_left',
        x: 440,
        y: 320,
        width: 240,
        height: 16,
        isSoft: true,
        color: '#a855f7',
      },
      {
        id: 'cyber_high_sky_right',
        x: 1320,
        y: 320,
        width: 240,
        height: 16,
        isSoft: true,
        color: '#a855f7',
      },
      // Apex Cyber Spire
      {
        id: 'cyber_apex_spire',
        x: 880,
        y: 210,
        width: 240,
        height: 16,
        isSoft: true,
        color: '#06b6d4',
      },
    ],
    spawnPoints: [
      { x: 680, y: 590 },
      { x: 1320, y: 590 },
      { x: 380, y: 440 },
      { x: 1620, y: 440 },
    ],
    bgTheme: 'cyber',
  },
};

export const STAGE_LIST = Object.values(STAGES);
