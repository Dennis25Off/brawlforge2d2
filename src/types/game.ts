export type HeroId = 'valiant_knight' | 'cyber_ninja' | 'thunder_brawler' | 'shadow_valkyrie' | 'mecha_striker' | 'katana_ronin';

export interface HeroConfig {
  id: HeroId;
  name: string;
  title: string;
  description: string;
  speed: number;        // movement speed multiplier (0.8 - 1.25)
  weight: number;       // knockback resistance (higher = heavier)
  damageMult: number;   // attack power
  primaryColor: string;
  accentColor: string;
  weaponType: 'sword' | 'daggers' | 'gauntlets' | 'scythe' | 'blaster' | 'katana';
  weaponName: string;
  playstyle: string;
  signatureName: string;
  passiveDesc: string;
  specialMoves: {
    neutral: { name: string; desc: string; projectile?: string };
    side: { name: string; desc: string; projectile?: string };
    up: { name: string; desc: string; projectile?: string };
    down: { name: string; desc: string; projectile?: string };
  };
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'skin' | 'weapon' | 'hat' | 'trail' | 'ko_fx';
  costCoins?: number;
  costGems?: number;
  requiredLevel?: number;
  description: string;
  icon?: string;
  previewColor?: string;
}

export interface PlayerCustomization {
  heroId: HeroId;
  skinPalette: string;   // hex or palette id
  weaponSkin: string;    // skin id
  hat: string;           // 'none' | 'horns' | 'visor' | 'halo' | 'crown' | 'fox_mask'
  trail: string;         // 'fire' | 'lightning' | 'glitch' | 'sakura' | 'void'
  koEffect: string;      // 'nova' | 'galaxy' | 'pixel' | 'starburst'
}

export interface PlayerStats {
  level: number;
  xp: number;
  coins: number;
  gems: number;
  elo: number;
  wins: number;
  losses: number;
  kos: number;
  unlockedItems: string[];
}

export interface Hitbox {
  id: string;
  ownerId: string;
  ownerHeroId?: HeroId;
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  baseKnockback: number;
  knockbackScaling: number;
  angle: number; // in radians
  duration: number; // frames left
  attackType: string;
}

export interface ProjectileEntity {
  id: string;
  ownerId: string;
  heroId: HeroId;
  type: 'katana_wind' | 'holy_wave' | 'cyber_shuriken' | 'thunder_orb' | 'proton_missile' | 'void_sphere' | 'proximity_mine' | 'laser_beam';
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  baseKnockback: number;
  knockbackScaling: number;
  angle: number;
  color: string;
  life: number;
  maxLife: number;
  piercing?: boolean;
  isMine?: boolean;
  hasDetonated?: boolean;
  rotation?: number;
  rotationSpeed?: number;
}

export interface AttackDefinition {
  name: string;
  startup: number;
  active: number;
  recovery: number;
  damage: number;
  baseKnockback: number;
  knockbackScaling: number;
  angle: number; // radians (0 = right, Math.PI = left, -Math.PI/2 = straight up)
  boxOffset: { x: number; y: number; w: number; h: number };
  isAerial?: boolean;
  isSmash?: boolean;
  isSpecial?: boolean;
  specialSlot?: 'neutral' | 'side' | 'up' | 'down';
  projectileType?: ProjectileEntity['type'];
  slideSpeed?: number;
  effectColor?: string;
  soundType?: 'light' | 'heavy' | 'special' | 'slash' | 'laser' | 'thunder';
}

export type ActionState =
  | 'idle'
  | 'run'
  | 'jump'
  | 'fall'
  | 'fast_fall'
  | 'wall_slide'
  | 'dodge'
  | 'shield'
  | 'attack'
  | 'hitstun'
  | 'respawning'
  | 'ko';

export interface FighterEntity {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  customization: PlayerCustomization;
  // Physics
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  width: number;
  height: number;
  isGrounded: boolean;
  isWallSliding: boolean;
  wallSlideSide: 1 | -1;
  jumpsLeft: number;
  maxJumps: number;
  prevJumpInput?: boolean;
  // Combat
  damagePercent: number; // 0 to 300+ %
  stocks: number;
  actionState: ActionState;
  stateTimer: number;
  activeAttack: AttackDefinition | null;
  attackFrame: number;
  hasHitInCurrentAttack: boolean;
  hitstunTimer: number;
  dodgeCooldown: number;
  invincibleTimer: number;
  shieldHealth: number; // 0 to 100
  isShielding: boolean;
  chargeTime: number;
  isCharging: boolean;
  // Cosmetic trail
  trailPositions: { x: number; y: number; alpha: number }[];
  // Stats in match
  matchKOs: number;
  matchDamageDealt: number;
  emoteTimer: number;
  currentEmote: string | null;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSoft: boolean; // if true, can jump through and drop down
  color?: string;
}

export interface Stage {
  id: string;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  blastZone: { minX: number; maxX: number; minY: number; maxY: number };
  platforms: Platform[];
  spawnPoints: { x: number; y: number }[];
  bgTheme: 'celestial' | 'cyber' | 'molten' | 'void';
}

export interface GameParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'shockwave' | 'feather' | 'ko_ray' | 'lightning';
}
