export type BrawlerId = 'blaze' | 'viper' | 'titan' | 'raven' | 'harmony';

export type CrossPlayPlatform = 'mobile' | 'pc' | 'tablet';

export interface BrawlerDef {
  id: BrawlerId;
  name: string;
  title: string;
  role: 'Tiratore Scelto' | 'Assaltatore' | 'Colosso' | 'Assassino Tossico' | 'Supporto Sonico';
  description: string;
  color: string;
  themeGradient: string;
  badgeColor: string;
  
  // Base stats (at Level 1)
  baseHp: number;
  speed: number; // Pixels per frame / second
  reloadTime: number; // Seconds per bullet
  maxAmmo: number;
  attackRange: number; // In game units
  attackSpread: number; // In radians
  attackDamage: number; // Base damage per projectile
  bulletCount: number; // Number of projectiles per shot
  bulletSpeed: number;
  bulletRadius: number;
  bulletType: 'bullet' | 'shotgun' | 'punch' | 'poison' | 'sonic';
  superChargePerHit: number; // Percentage (e.g. 15%)
  
  // Super
  superName: string;
  superDesc: string;
  superRange: number;
  superRadius: number;
  superDamage: number;
  superType: 'barrage' | 'blast' | 'leap' | 'daggers' | 'heal_wave';

  // Passive (Star Power)
  passiveName: string;
  passiveDesc: string;

  // Active (Gadget - 3 uses per match)
  gadgetName: string;
  gadgetDesc: string;

  // Visuals & Flavor
  avatarEmoji: string;
  quote: string;
}

export interface BrawlerProgression {
  level: number;
  powerPoints: number;
  unlocked: boolean;
  trophies: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  platform: CrossPlayPlatform;
  trophies: number;
  coins: number;
  gems: number;
  tokens: number; // 100 tokens = 1 Brawl Box
  brawlers: Record<BrawlerId, BrawlerProgression>;
  selectedBrawler: BrawlerId;
  stats: {
    matchesPlayed: number;
    victories: number;
    totalKills: number;
    boxesOpened: number;
  };
  claimedTrophyRoad: number[];
}

export interface Projectile {
  id: string;
  ownerId: string;
  isSuper: boolean;
  brawlerId: BrawlerId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  distanceTraveled: number;
  maxDistance: number;
  damage: number;
  radius: number;
  piercing: boolean;
  destroysWalls: boolean;
  color: string;
  bulletType: 'bullet' | 'shotgun' | 'punch' | 'poison' | 'sonic';
  isPoisonous?: boolean;
  isHealingWave?: boolean;
}

export interface PowerBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  isDestroyed: boolean;
  cubesToDrop: number;
}

export interface PowerCubeDrop {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
  life: number; // 0 to 1
  isHeal?: boolean;
}

export interface KillFeedEntry {
  id: string;
  killerName: string;
  victimName: string;
  brawlerId: BrawlerId;
  time: number;
}

export interface MapObstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'stone' | 'wood_box' | 'water' | 'barrel';
  destructible: boolean;
  hp?: number;
}

export interface BushZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BrawlerEntity {
  id: string;
  name: string;
  isPlayer: boolean;
  platform: CrossPlayPlatform;
  brawlerId: BrawlerId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number; // Facing angle in radians
  
  hp: number;
  maxHp: number;
  ammo: number;
  maxAmmo: number;
  ammoProgress: number; // 0 to 1
  superCharge: number; // 0 to 100
  gadgetCharges: number;
  
  powerCubes: number;
  kills: number;
  isAlive: boolean;
  isInBush: boolean;
  
  // Status effects
  poisonTicksLeft: number;
  poisonDamage: number;
  poisonAttackerId: string | null;
  speedBoostTimer: number;
  shieldTimer: number;
  shieldRatio: number;
  bandAidCooldown: number; // Shelly/Viper passive
  isLeaping: boolean;
  leapProgress: number; // 0 to 1
  leapStartX: number;
  leapStartY: number;
  leapTargetX: number;
  leapTargetY: number;

  // Bot AI specific
  aiTargetId: string | null;
  aiState: 'roam' | 'attack_box' | 'hunt' | 'flee' | 'hide';
  aiDecisionTimer: number;
  aiAimAngle: number;
}
