import { BRAWLERS } from '../data/brawlers';
import {
  BrawlerEntity,
  BrawlerId,
  CrossPlayPlatform,
  DamageNumber,
  KillFeedEntry,
  MapObstacle,
  Particle,
  PowerBox,
  PowerCubeDrop,
  Projectile,
} from '../types/game';
import { sound } from '../utils/audio';
import { generateBattleRoyaleMap, MapData } from './mapGenerator';

const BOT_NAMES = [
  'El_Pro_77',
  'StarShooter_IT',
  'ShadowNinja',
  'Phoenix_X',
  'ViperKing',
  'SuperBrawler',
  'ToxicCrow',
  'ApexPredator',
  'GigaChad',
  'DynamiteKid',
  'GoldenStar',
  'MegaKnight',
  'GhostRider',
];

const BOT_PLATFORMS: CrossPlayPlatform[] = ['mobile', 'pc', 'tablet'];

export interface GameEngineCallbacks {
  onGameOver: (placement: number, kills: number, powerCubes: number) => void;
  onAliveChange: (count: number) => void;
  onKillFeed: (entry: KillFeedEntry) => void;
  onPlayerHpChange: (hp: number, maxHp: number, ammo: number, superCharge: number, cubes: number) => void;
  onPoisonPhaseChange: (phase: number, timeToNext: number) => void;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private mapData: MapData;

  public player: BrawlerEntity;
  public brawlers: BrawlerEntity[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];
  public powerBoxes: PowerBox[] = [];
  public powerCubes: PowerCubeDrop[] = [];
  public obstacles: MapObstacle[] = [];

  // Poison Storm Zone
  public poisonZone = {
    centerX: 1200,
    centerY: 1200,
    currentRadius: 1550,
    targetRadius: 1100,
    phase: 1,
    phaseTimer: 30, // seconds until next shrink
    shrinkSpeed: 20, // pixels per second
  };

  // Camera
  public camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, shake: 0 };

  // Controls state
  public moveVector = { x: 0, y: 0 };
  public aimVector = { x: 0, y: 0, isAiming: false, isSuperAiming: false };
  public mousePos = { x: 0, y: 0 };

  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private callbacks: GameEngineCallbacks;

  // Natural health regeneration timer for player
  private playerCombatTimer = 0;

  constructor(
    canvas: HTMLCanvasElement,
    playerBrawlerId: BrawlerId,
    playerLevel: number,
    playerUsername: string,
    playerPlatform: CrossPlayPlatform,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.mapData = generateBattleRoyaleMap();
    this.obstacles = [...this.mapData.obstacles];
    this.powerBoxes = [...this.mapData.powerBoxes];

    // Initialize 10 combatants (Player + 9 Bots)
    const shuffledSpawns = [...this.mapData.spawnPoints].sort(() => Math.random() - 0.5);
    const brawlerIds: BrawlerId[] = ['blaze', 'viper', 'titan', 'raven', 'harmony'];

    // 1. Setup Player
    const playerDef = BRAWLERS[playerBrawlerId];
    // Level scaling: +5% HP & Damage per level above 1
    const levelMult = 1 + (playerLevel - 1) * 0.06;
    const playerHp = Math.round(playerDef.baseHp * levelMult);

    this.player = {
      id: 'player',
      name: playerUsername,
      isPlayer: true,
      platform: playerPlatform,
      brawlerId: playerBrawlerId,
      x: shuffledSpawns[0].x,
      y: shuffledSpawns[0].y,
      vx: 0,
      vy: 0,
      radius: 26,
      rotation: 0,
      hp: playerHp,
      maxHp: playerHp,
      ammo: playerDef.maxAmmo,
      maxAmmo: playerDef.maxAmmo,
      ammoProgress: 1,
      superCharge: 0,
      gadgetCharges: 3,
      powerCubes: 0,
      kills: 0,
      isAlive: true,
      isInBush: false,
      poisonTicksLeft: 0,
      poisonDamage: 0,
      poisonAttackerId: null,
      speedBoostTimer: 0,
      shieldTimer: 0,
      shieldRatio: 0,
      bandAidCooldown: 0,
      isLeaping: false,
      leapProgress: 0,
      leapStartX: 0,
      leapStartY: 0,
      leapTargetX: 0,
      leapTargetY: 0,
      aiTargetId: null,
      aiState: 'roam',
      aiDecisionTimer: 0,
      aiAimAngle: 0,
    };
    this.brawlers.push(this.player);

    // 2. Setup 9 Smart Bots
    const botNamesShuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5);
    for (let i = 1; i < 10; i++) {
      const bId = brawlerIds[i % brawlerIds.length];
      const botDef = BRAWLERS[bId];
      const botLevel = Math.floor(Math.random() * 3) + 1;
      const bMult = 1 + (botLevel - 1) * 0.05;
      const botHp = Math.round(botDef.baseHp * bMult);
      const botPlatform = BOT_PLATFORMS[i % BOT_PLATFORMS.length];

      const bot: BrawlerEntity = {
        id: `bot_${i}`,
        name: botNamesShuffled[i % botNamesShuffled.length],
        isPlayer: false,
        platform: botPlatform,
        brawlerId: bId,
        x: shuffledSpawns[i].x,
        y: shuffledSpawns[i].y,
        vx: 0,
        vy: 0,
        radius: 26,
        rotation: Math.random() * Math.PI * 2,
        hp: botHp,
        maxHp: botHp,
        ammo: botDef.maxAmmo,
        maxAmmo: botDef.maxAmmo,
        ammoProgress: 1,
        superCharge: Math.floor(Math.random() * 25),
        gadgetCharges: 3,
        powerCubes: 0,
        kills: 0,
        isAlive: true,
        isInBush: false,
        poisonTicksLeft: 0,
        poisonDamage: 0,
        poisonAttackerId: null,
        speedBoostTimer: 0,
        shieldTimer: 0,
        shieldRatio: 0,
        bandAidCooldown: 0,
        isLeaping: false,
        leapProgress: 0,
        leapStartX: 0,
        leapStartY: 0,
        leapTargetX: 0,
        leapTargetY: 0,
        aiTargetId: null,
        aiState: 'roam',
        aiDecisionTimer: Math.random() * 2,
        aiAimAngle: 0,
      };
      this.brawlers.push(bot);
    }

    // Set initial camera
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.callbacks.onAliveChange(10);
  }

  public start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop(time: number) {
    if (!this.isRunning) return;
    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // cap delta time
    this.lastTime = time;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  // --- UPDATE CYCLE ---
  private update(dt: number) {
    this.updatePoisonZone(dt);
    this.updatePlayerInput(dt);
    this.updateBrawlers(dt);
    this.updateProjectiles(dt);
    this.updatePowerCubes(dt);
    this.updateParticles(dt);
    this.updateDamageNumbers(dt);
    this.updateCamera(dt);

    // Sync HUD callback
    this.callbacks.onPlayerHpChange(
      Math.max(0, Math.round(this.player.hp)),
      this.player.maxHp,
      this.player.ammo,
      Math.min(100, Math.round(this.player.superCharge)),
      this.player.powerCubes
    );
  }

  // Shrinking Poison Storm Zone
  private updatePoisonZone(dt: number) {
    this.poisonZone.phaseTimer -= dt;
    this.callbacks.onPoisonPhaseChange(
      this.poisonZone.phase,
      Math.max(0, Math.ceil(this.poisonZone.phaseTimer))
    );

    if (this.poisonZone.phaseTimer <= 0) {
      this.poisonZone.phase++;
      if (this.poisonZone.phase === 2) {
        this.poisonZone.targetRadius = 750;
        this.poisonZone.phaseTimer = 35;
      } else if (this.poisonZone.phase === 3) {
        this.poisonZone.targetRadius = 400;
        this.poisonZone.phaseTimer = 30;
      } else if (this.poisonZone.phase >= 4) {
        this.poisonZone.targetRadius = 120;
        this.poisonZone.phaseTimer = 40;
      }
    }

    if (this.poisonZone.currentRadius > this.poisonZone.targetRadius) {
      this.poisonZone.currentRadius = Math.max(
        this.poisonZone.targetRadius,
        this.poisonZone.currentRadius - this.poisonZone.shrinkSpeed * dt
      );
    }
  }

  private updatePlayerInput(dt: number) {
    if (!this.player.isAlive || this.player.isLeaping) return;

    const brawlerDef = BRAWLERS[this.player.brawlerId];
    // Passive speed bonus: Blaze has +18% permanent speed
    let speedMult = 1;
    if (this.player.brawlerId === 'blaze') speedMult += 0.18;
    if (this.player.speedBoostTimer > 0) speedMult += 0.45;

    const moveSpeed = brawlerDef.speed * 60 * speedMult;

    if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
      const mag = Math.sqrt(this.moveVector.x * this.moveVector.x + this.moveVector.y * this.moveVector.y);
      const normX = this.moveVector.x / mag;
      const normY = this.moveVector.y / mag;
      const moveDist = Math.min(1, mag) * moveSpeed * dt;

      this.moveEntityWithCollision(this.player, normX * moveDist, normY * moveDist);
      if (!this.aimVector.isAiming && !this.aimVector.isSuperAiming) {
        this.player.rotation = Math.atan2(normY, normX);
      }
    }

    // Aim rotation
    if (this.aimVector.isAiming || this.aimVector.isSuperAiming) {
      this.player.rotation = Math.atan2(this.aimVector.y, this.aimVector.x);
    }
  }

  private updateBrawlers(dt: number) {
    const cx = this.poisonZone.centerX;
    const cy = this.poisonZone.centerY;
    const poisonR = this.poisonZone.currentRadius;

    for (const brawler of this.brawlers) {
      if (!brawler.isAlive) continue;

      const def = BRAWLERS[brawler.brawlerId];

      // Ammo regeneration
      if (brawler.ammo < brawler.maxAmmo) {
        brawler.ammoProgress += dt / def.reloadTime;
        if (brawler.ammoProgress >= 1) {
          brawler.ammo += 1;
          brawler.ammoProgress = brawler.ammo < brawler.maxAmmo ? 0 : 1;
        }
      }

      // Check bush stealth
      brawler.isInBush = this.isInsideBush(brawler.x, brawler.y);

      // Timers
      if (brawler.speedBoostTimer > 0) brawler.speedBoostTimer -= dt;
      if (brawler.shieldTimer > 0) brawler.shieldTimer -= dt;
      if (brawler.bandAidCooldown > 0) brawler.bandAidCooldown -= dt;

      // Poison Tick Damage from Raven's daggers or Titan burn
      if (brawler.poisonTicksLeft > 0) {
        brawler.poisonTicksLeft -= dt;
        if (Math.random() < dt * 4) {
          this.applyDamage(brawler, brawler.poisonDamage, brawler.poisonAttackerId || '', false, '#10b981');
          this.spawnParticles(brawler.x, brawler.y, '#22c55e', 3);
        }
      }

      // Out of Poison Storm zone damage!
      const distFromCenter = Math.hypot(brawler.x - cx, brawler.y - cy);
      if (distFromCenter > poisonR) {
        const poisonDmgPerSec = 1000;
        this.applyDamage(brawler, poisonDmgPerSec * dt, 'gas_storm', false, '#22c55e');
        if (Math.random() < 0.25) {
          this.spawnParticles(brawler.x, brawler.y, '#16a34a', 2);
        }
      }

      // Natural health regen (after 3.5s without taking damage and not attacking)
      if (brawler.isPlayer) {
        this.playerCombatTimer += dt;
        if (this.playerCombatTimer > 3.5 && brawler.hp < brawler.maxHp && distFromCenter <= poisonR && brawler.poisonTicksLeft <= 0) {
          const healAmount = Math.round(brawler.maxHp * 0.13 * dt);
          brawler.hp = Math.min(brawler.maxHp, brawler.hp + healAmount);
        }
      } else {
        // Bot AI behavior
        this.updateBotAI(brawler, dt);
      }

      // Check Leap animation (Titan / Raven Super)
      if (brawler.isLeaping) {
        brawler.leapProgress += dt * 1.6;
        if (brawler.leapProgress >= 1) {
          brawler.isLeaping = false;
          brawler.x = brawler.leapTargetX;
          brawler.y = brawler.leapTargetY;
          this.onLeapLanding(brawler);
        } else {
          // Arc trajectory
          brawler.x = brawler.leapStartX + (brawler.leapTargetX - brawler.leapStartX) * brawler.leapProgress;
          brawler.y = brawler.leapStartY + (brawler.leapTargetY - brawler.leapStartY) * brawler.leapProgress;
        }
      }

      // Passive check: Viper's Band-Aid
      if (brawler.brawlerId === 'viper' && brawler.hp < brawler.maxHp * 0.35 && brawler.bandAidCooldown <= 0) {
        brawler.hp = Math.min(brawler.maxHp, brawler.hp + 2400);
        brawler.bandAidCooldown = 25;
        this.spawnDamageNumber(brawler.x, brawler.y - 30, '+2400', '#22c55e', true);
        this.spawnParticles(brawler.x, brawler.y, '#4ade80', 14);
        sound.playVictory();
      }
    }
  }

  // --- SMART BOT AI ---
  private updateBotAI(bot: BrawlerEntity, dt: number) {
    if (bot.isLeaping || !bot.isAlive) return;

    bot.aiDecisionTimer -= dt;
    const def = BRAWLERS[bot.brawlerId];
    const cx = this.poisonZone.centerX;
    const cy = this.poisonZone.centerY;
    const poisonR = this.poisonZone.currentRadius;

    // 1. If inside or near poison gas, ALWAYS flee to center!
    const distToCenter = Math.hypot(bot.x - cx, bot.y - cy);
    if (distToCenter > poisonR - 100) {
      const angleToCenter = Math.atan2(cy - bot.y, cx - bot.x);
      const moveSpeed = def.speed * 60 * dt;
      this.moveEntityWithCollision(bot, Math.cos(angleToCenter) * moveSpeed, Math.sin(angleToCenter) * moveSpeed);
      bot.rotation = angleToCenter;
      return;
    }

    // 2. Find closest target: enemy brawlers or power boxes
    let closestEnemy: BrawlerEntity | null = null;
    let closestEnemyDist = Infinity;

    for (const other of this.brawlers) {
      if (other.id === bot.id || !other.isAlive) continue;
      // Stealth check: if other is in bush and bot is outside, bot cannot see them!
      if (other.isInBush && !bot.isInBush && Math.hypot(bot.x - other.x, bot.y - other.y) > 85) {
        continue;
      }
      const dist = Math.hypot(bot.x - other.x, bot.y - other.y);
      if (dist < closestEnemyDist) {
        closestEnemyDist = dist;
        closestEnemy = other;
      }
    }

    let closestBox: PowerBox | null = null;
    let closestBoxDist = Infinity;
    for (const box of this.powerBoxes) {
      if (box.isDestroyed) continue;
      const dist = Math.hypot(bot.x - (box.x + box.width / 2), bot.y - (box.y + box.height / 2));
      if (dist < closestBoxDist) {
        closestBoxDist = dist;
        closestBox = box;
      }
    }

    // Decision making
    const shouldHeal = bot.hp < bot.maxHp * 0.45 && closestEnemyDist > 250;
    const moveSpeed = def.speed * 60 * dt;

    if (shouldHeal) {
      // Find nearest bush to hide and recover
      let nearestBush = this.findNearestBush(bot.x, bot.y);
      if (nearestBush && !bot.isInBush) {
        const bx = nearestBush.x + nearestBush.width / 2;
        const by = nearestBush.y + nearestBush.height / 2;
        const angle = Math.atan2(by - bot.y, bx - bot.x);
        this.moveEntityWithCollision(bot, Math.cos(angle) * moveSpeed, Math.sin(angle) * moveSpeed);
        bot.rotation = angle;
      }
      return;
    }

    // Combat or Box farming
    if (closestEnemy && closestEnemyDist < def.attackRange + 100) {
      // Attack enemy
      const angle = Math.atan2(closestEnemy.y - bot.y, closestEnemy.x - bot.x);
      bot.rotation = angle;

      // Distance management: tanks close in, sharpshooters keep distance
      const idealDist = def.role === 'Colosso' ? 80 : def.attackRange * 0.75;
      if (closestEnemyDist > idealDist) {
        this.moveEntityWithCollision(bot, Math.cos(angle) * moveSpeed, Math.sin(angle) * moveSpeed);
      } else if (closestEnemyDist < idealDist * 0.6 && def.role !== 'Colosso') {
        // Back off
        this.moveEntityWithCollision(bot, -Math.cos(angle) * moveSpeed, -Math.sin(angle) * moveSpeed);
      }

      // Fire weapon
      if (bot.superCharge >= 100 && closestEnemyDist < def.superRange) {
        this.executeSuper(bot, angle);
      } else if (bot.ammo >= 1 && closestEnemyDist <= def.attackRange) {
        if (Math.random() < 0.15) {
          this.executeNormalAttack(bot, angle);
        }
      }
    } else if (closestBox && closestBoxDist < 450) {
      // Move toward box and destroy it
      const targetX = closestBox.x + closestBox.width / 2;
      const targetY = closestBox.y + closestBox.height / 2;
      const angle = Math.atan2(targetY - bot.y, targetX - bot.x);
      bot.rotation = angle;

      if (closestBoxDist > def.attackRange * 0.6) {
        this.moveEntityWithCollision(bot, Math.cos(angle) * moveSpeed, Math.sin(angle) * moveSpeed);
      }
      if (bot.ammo >= 1 && closestBoxDist <= def.attackRange) {
        if (Math.random() < 0.18) {
          this.executeNormalAttack(bot, angle);
        }
      }
    } else {
      // Roam towards center safe zone
      const angle = Math.atan2(cy - bot.y, cx - bot.x) + (Math.random() - 0.5) * 0.6;
      this.moveEntityWithCollision(bot, Math.cos(angle) * moveSpeed * 0.7, Math.sin(angle) * moveSpeed * 0.7);
      bot.rotation = angle;
    }
  }

  // --- ATTACKS AND SUPERS ---
  public firePlayerNormalAttack(angle?: number) {
    if (!this.player.isAlive || this.player.isLeaping) return;
    if (this.player.ammo < 1) return;

    let targetAngle = angle;
    if (targetAngle === undefined) {
      // Auto-aim at closest target!
      targetAngle = this.findAutoAimAngle(this.player, false);
    }

    this.executeNormalAttack(this.player, targetAngle);
    this.playerCombatTimer = 0;
  }

  public firePlayerSuper(angle?: number) {
    if (!this.player.isAlive || this.player.isLeaping) return;
    if (this.player.superCharge < 100) return;

    let targetAngle = angle;
    if (targetAngle === undefined) {
      targetAngle = this.findAutoAimAngle(this.player, true);
    }

    this.executeSuper(this.player, targetAngle);
    this.playerCombatTimer = 0;
  }

  public usePlayerGadget() {
    if (!this.player.isAlive || this.player.gadgetCharges <= 0) return;
    this.player.gadgetCharges--;

    const brawlerId = this.player.brawlerId;
    if (brawlerId === 'blaze') {
      // Instantly reload 2 ammo
      this.player.ammo = Math.min(this.player.maxAmmo, this.player.ammo + 2);
      this.spawnParticles(this.player.x, this.player.y, '#f59e0b', 16);
      sound.playPowerCube();
    } else if (brawlerId === 'viper') {
      // Tactical dash
      const dashDist = 200;
      const dx = Math.cos(this.player.rotation) * dashDist;
      const dy = Math.sin(this.player.rotation) * dashDist;
      this.moveEntityWithCollision(this.player, dx, dy);
      this.spawnParticles(this.player.x, this.player.y, '#a855f7', 18);
      sound.playBush();
    } else if (brawlerId === 'titan') {
      // Ground stomp AoE shockwave
      this.spawnParticles(this.player.x, this.player.y, '#3b82f6', 30);
      sound.playExplosion();
      this.camera.shake = 10;
      for (const other of this.brawlers) {
        if (other.id !== this.player.id && other.isAlive) {
          const d = Math.hypot(other.x - this.player.x, other.y - this.player.y);
          if (d < 220) {
            this.applyDamage(other, 800, this.player.id, false, '#3b82f6');
            other.speedBoostTimer = -2.5; // Slow down
          }
        }
      }
    } else if (brawlerId === 'raven') {
      // 50% damage reduction shield
      this.player.shieldTimer = 3.5;
      this.player.shieldRatio = 0.5;
      this.spawnParticles(this.player.x, this.player.y, '#eab308', 20);
      sound.playSuperReady();
    } else if (brawlerId === 'harmony') {
      // Cleanse negative status and heal 1400 HP
      this.player.poisonTicksLeft = 0;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1400);
      this.spawnDamageNumber(this.player.x, this.player.y - 30, '+1400', '#10b981', true);
      this.spawnParticles(this.player.x, this.player.y, '#10b981', 25);
      sound.playVictory();
    }
  }

  private executeNormalAttack(attacker: BrawlerEntity, angle: number) {
    const def = BRAWLERS[attacker.brawlerId];
    attacker.ammo--;
    attacker.rotation = angle;

    // Cube damage bonus: +10% per power cube
    const cubeDamageMult = 1 + attacker.powerCubes * 0.1;
    const baseDamage = Math.round(def.attackDamage * cubeDamageMult);

    sound.playShoot(def.bulletType);

    if (attacker.brawlerId === 'blaze') {
      // 6 rapid bullets fired sequentially
      for (let i = 0; i < def.bulletCount; i++) {
        setTimeout(() => {
          if (!attacker.isAlive) return;
          const bulletSpread = (Math.random() - 0.5) * def.attackSpread;
          const a = angle + bulletSpread;
          this.projectiles.push({
            id: `proj_${Date.now()}_${Math.random()}`,
            ownerId: attacker.id,
            isSuper: false,
            brawlerId: attacker.brawlerId,
            x: attacker.x + Math.cos(a) * 30,
            y: attacker.y + Math.sin(a) * 30,
            vx: Math.cos(a) * def.bulletSpeed,
            vy: Math.sin(a) * def.bulletSpeed,
            distanceTraveled: 0,
            maxDistance: def.attackRange,
            damage: baseDamage,
            radius: def.bulletRadius,
            piercing: false,
            destroysWalls: false,
            color: '#f97316',
            bulletType: 'bullet',
          });
        }, i * 65);
      }
    } else if (attacker.brawlerId === 'viper') {
      // 5 shotgun pellets in a cone
      for (let i = 0; i < def.bulletCount; i++) {
        const spreadOffset = ((i - (def.bulletCount - 1) / 2) / (def.bulletCount - 1)) * def.attackSpread;
        const a = angle + spreadOffset;
        this.projectiles.push({
          id: `proj_${Date.now()}_${Math.random()}`,
          ownerId: attacker.id,
          isSuper: false,
          brawlerId: attacker.brawlerId,
          x: attacker.x + Math.cos(a) * 26,
          y: attacker.y + Math.sin(a) * 26,
          vx: Math.cos(a) * def.bulletSpeed,
          vy: Math.sin(a) * def.bulletSpeed,
          distanceTraveled: 0,
          maxDistance: def.attackRange,
          damage: baseDamage,
          radius: def.bulletRadius,
          piercing: false,
          destroysWalls: false,
          color: '#c084fc',
          bulletType: 'shotgun',
        });
      }
    } else if (attacker.brawlerId === 'titan') {
      // 4 rapid punches
      for (let i = 0; i < def.bulletCount; i++) {
        setTimeout(() => {
          if (!attacker.isAlive) return;
          const a = angle + (Math.random() - 0.5) * def.attackSpread;
          this.projectiles.push({
            id: `proj_${Date.now()}_${Math.random()}`,
            ownerId: attacker.id,
            isSuper: false,
            brawlerId: attacker.brawlerId,
            x: attacker.x + Math.cos(a) * 25,
            y: attacker.y + Math.sin(a) * 25,
            vx: Math.cos(a) * def.bulletSpeed,
            vy: Math.sin(a) * def.bulletSpeed,
            distanceTraveled: 0,
            maxDistance: def.attackRange,
            damage: baseDamage,
            radius: def.bulletRadius,
            piercing: false,
            destroysWalls: false,
            color: '#60a5fa',
            bulletType: 'punch',
          });
        }, i * 80);
      }
    } else if (attacker.brawlerId === 'raven') {
      // 3 poison daggers
      for (let i = 0; i < def.bulletCount; i++) {
        const spreadOffset = ((i - 1) * def.attackSpread) / 2;
        const a = angle + spreadOffset;
        this.projectiles.push({
          id: `proj_${Date.now()}_${Math.random()}`,
          ownerId: attacker.id,
          isSuper: false,
          brawlerId: attacker.brawlerId,
          x: attacker.x + Math.cos(a) * 25,
          y: attacker.y + Math.sin(a) * 25,
          vx: Math.cos(a) * def.bulletSpeed,
          vy: Math.sin(a) * def.bulletSpeed,
          distanceTraveled: 0,
          maxDistance: def.attackRange,
          damage: baseDamage,
          radius: def.bulletRadius,
          piercing: false,
          destroysWalls: false,
          color: '#eab308',
          bulletType: 'poison',
          isPoisonous: true,
        });
      }
    } else if (attacker.brawlerId === 'harmony') {
      // Penetrating wide sonic wave
      this.projectiles.push({
        id: `proj_${Date.now()}_${Math.random()}`,
        ownerId: attacker.id,
        isSuper: false,
        brawlerId: attacker.brawlerId,
        x: attacker.x + Math.cos(angle) * 30,
        y: attacker.y + Math.sin(angle) * 30,
        vx: Math.cos(angle) * def.bulletSpeed,
        vy: Math.sin(angle) * def.bulletSpeed,
        distanceTraveled: 0,
        maxDistance: def.attackRange,
        damage: baseDamage,
        radius: def.bulletRadius,
        piercing: true,
        destroysWalls: false,
        color: '#34d399',
        bulletType: 'sonic',
      });
      // Harmony passive: Da Capo heals on hit
    }
  }

  private executeSuper(attacker: BrawlerEntity, angle: number) {
    const def = BRAWLERS[attacker.brawlerId];
    attacker.superCharge = 0;
    attacker.rotation = angle;
    sound.playSuperCast();

    const cubeDamageMult = 1 + attacker.powerCubes * 0.1;
    const superDamage = Math.round(def.superDamage * cubeDamageMult);

    if (attacker.brawlerId === 'blaze') {
      // Heavy barrage of 12 piercing heavy rounds destroying walls
      this.camera.shake = 8;
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          if (!attacker.isAlive) return;
          const a = angle + (Math.random() - 0.5) * 0.1;
          this.projectiles.push({
            id: `proj_super_${Date.now()}_${Math.random()}`,
            ownerId: attacker.id,
            isSuper: true,
            brawlerId: attacker.brawlerId,
            x: attacker.x + Math.cos(a) * 30,
            y: attacker.y + Math.sin(a) * 30,
            vx: Math.cos(a) * 20,
            vy: Math.sin(a) * 20,
            distanceTraveled: 0,
            maxDistance: def.superRange,
            damage: superDamage,
            radius: def.superRadius,
            piercing: true,
            destroysWalls: true,
            color: '#ef4444',
            bulletType: 'bullet',
          });
        }, i * 50);
      }
    } else if (attacker.brawlerId === 'viper') {
      // Super Calibro: massive blast destroying walls and pushing enemies back
      this.camera.shake = 12;
      for (let i = 0; i < 9; i++) {
        const spread = ((i - 4) / 4) * 0.5;
        const a = angle + spread;
        this.projectiles.push({
          id: `proj_super_${Date.now()}_${Math.random()}`,
          ownerId: attacker.id,
          isSuper: true,
          brawlerId: attacker.brawlerId,
          x: attacker.x + Math.cos(a) * 30,
          y: attacker.y + Math.sin(a) * 30,
          vx: Math.cos(a) * 18,
          vy: Math.sin(a) * 18,
          distanceTraveled: 0,
          maxDistance: def.superRange,
          damage: superDamage,
          radius: def.superRadius,
          piercing: true,
          destroysWalls: true,
          color: '#9333ea',
          bulletType: 'shotgun',
        });
      }
    } else if (attacker.brawlerId === 'titan') {
      // Meteor leap into air and crash
      const leapDist = Math.min(def.superRange, 480);
      attacker.isLeaping = true;
      attacker.leapProgress = 0;
      attacker.leapStartX = attacker.x;
      attacker.leapStartY = attacker.y;
      attacker.leapTargetX = attacker.x + Math.cos(angle) * leapDist;
      attacker.leapTargetY = attacker.y + Math.sin(angle) * leapDist;
      this.spawnParticles(attacker.x, attacker.y, '#3b82f6', 20);
    } else if (attacker.brawlerId === 'raven') {
      // Leap into air launching daggers on takeoff and landing
      this.launchRavenDaggerRing(attacker);
      const leapDist = Math.min(def.superRange, 460);
      attacker.isLeaping = true;
      attacker.leapProgress = 0;
      attacker.leapStartX = attacker.x;
      attacker.leapStartY = attacker.y;
      attacker.leapTargetX = attacker.x + Math.cos(angle) * leapDist;
      attacker.leapTargetY = attacker.y + Math.sin(angle) * leapDist;
    } else if (attacker.brawlerId === 'harmony') {
      // Massive healing symphony wave
      this.camera.shake = 6;
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + 3800);
      this.spawnDamageNumber(attacker.x, attacker.y - 30, '+3800', '#10b981', true);
      this.spawnParticles(attacker.x, attacker.y, '#10b981', 35);
      sound.playVictory();

      // Damaging sound wave forward
      this.projectiles.push({
        id: `proj_super_${Date.now()}`,
        ownerId: attacker.id,
        isSuper: true,
        brawlerId: attacker.brawlerId,
        x: attacker.x + Math.cos(angle) * 30,
        y: attacker.y + Math.sin(angle) * 30,
        vx: Math.cos(angle) * 16,
        vy: Math.sin(angle) * 16,
        distanceTraveled: 0,
        maxDistance: def.superRange,
        damage: superDamage,
        radius: 65,
        piercing: true,
        destroysWalls: false,
        color: '#059669',
        bulletType: 'sonic',
      });
    }
  }

  private launchRavenDaggerRing(brawler: BrawlerEntity) {
    const numDaggers = 12;
    for (let i = 0; i < numDaggers; i++) {
      const a = (i * 2 * Math.PI) / numDaggers;
      this.projectiles.push({
        id: `proj_raven_${Date.now()}_${i}`,
        ownerId: brawler.id,
        isSuper: true,
        brawlerId: 'raven',
        x: brawler.x,
        y: brawler.y,
        vx: Math.cos(a) * 16,
        vy: Math.sin(a) * 16,
        distanceTraveled: 0,
        maxDistance: 380,
        damage: 640,
        radius: 7,
        piercing: false,
        destroysWalls: false,
        color: '#eab308',
        bulletType: 'poison',
        isPoisonous: true,
      });
    }
  }

  private onLeapLanding(brawler: BrawlerEntity) {
    if (brawler.brawlerId === 'titan') {
      this.camera.shake = 16;
      sound.playExplosion();
      this.spawnParticles(brawler.x, brawler.y, '#f97316', 40);

      // Destroy nearby destructible obstacles
      this.destroyWallsInRadius(brawler.x, brawler.y, 140);

      // Damage enemies in landing radius
      const cubeDamageMult = 1 + brawler.powerCubes * 0.1;
      const landingDamage = Math.round(3000 * cubeDamageMult);

      for (const other of this.brawlers) {
        if (other.id !== brawler.id && other.isAlive) {
          const dist = Math.hypot(other.x - brawler.x, other.y - brawler.y);
          if (dist <= 140) {
            this.applyDamage(other, landingDamage, brawler.id, false, '#f97316');
            // Titan Passive: Furia Bruciante (burn effect)
            other.poisonTicksLeft = 4;
            other.poisonDamage = 200;
            other.poisonAttackerId = brawler.id;
          }
        }
      }
    } else if (brawler.brawlerId === 'raven') {
      this.launchRavenDaggerRing(brawler);
      this.spawnParticles(brawler.x, brawler.y, '#eab308', 25);
    }
  }

  // Auto-aim calculation for quick-taps
  private findAutoAimAngle(from: BrawlerEntity, isSuper = false): number {
    let closestTarget: { x: number; y: number } | null = null;
    let closestDist = Infinity;

    // First priority: Enemy Brawlers
    for (const b of this.brawlers) {
      if (b.id === from.id || !b.isAlive) continue;
      // Stealth check
      if (b.isInBush && !from.isInBush && Math.hypot(from.x - b.x, from.y - b.y) > 85) {
        continue;
      }
      const dist = Math.hypot(b.x - from.x, b.y - from.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestTarget = { x: b.x, y: b.y };
      }
    }

    // Second priority (for normal attack): Power Boxes
    if (!closestTarget && !isSuper) {
      for (const box of this.powerBoxes) {
        if (box.isDestroyed) continue;
        const dist = Math.hypot(box.x + box.width / 2 - from.x, box.y + box.height / 2 - from.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestTarget = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        }
      }
    }

    if (closestTarget) {
      return Math.atan2(closestTarget.y - from.y, closestTarget.x - from.x);
    }
    return from.rotation;
  }

  // --- PROJECTILES & COLLISIONS ---
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.distanceTraveled += Math.hypot(p.vx, p.vy);

      // Check max range
      if (p.distanceTraveled >= p.maxDistance) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check wall collision
      let hitWall = false;
      for (let wIdx = this.obstacles.length - 1; wIdx >= 0; wIdx--) {
        const obs = this.obstacles[wIdx];
        if (obs.type === 'water') continue; // Bullets fly over water ponds!

        if (
          p.x + p.radius > obs.x &&
          p.x - p.radius < obs.x + obs.width &&
          p.y + p.radius > obs.y &&
          p.y - p.radius < obs.y + obs.height
        ) {
          // Destroys wall?
          if (p.destroysWalls && obs.destructible) {
            this.spawnParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#78350f', 12);
            this.obstacles.splice(wIdx, 1);
            sound.playExplosion();
          } else if (obs.destructible && obs.hp) {
            obs.hp -= p.damage;
            if (obs.hp <= 0) {
              this.spawnParticles(obs.x + obs.width / 2, obs.y + obs.height / 2, '#78350f', 10);
              this.obstacles.splice(wIdx, 1);
            }
          }

          if (!p.piercing) {
            hitWall = true;
            this.spawnParticles(p.x, p.y, p.color, 4);
            break;
          }
        }
      }

      if (hitWall) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check Power Box collision
      let hitBox = false;
      for (const box of this.powerBoxes) {
        if (box.isDestroyed) continue;
        if (
          p.x + p.radius > box.x &&
          p.x - p.radius < box.x + box.width &&
          p.y + p.radius > box.y &&
          p.y - p.radius < box.y + box.height
        ) {
          box.hp -= p.damage;
          this.spawnDamageNumber(p.x, p.y, `${p.damage}`, '#ffffff');
          this.spawnParticles(p.x, p.y, '#f59e0b', 5);
          sound.playHit();

          if (box.hp <= 0) {
            box.isDestroyed = true;
            this.spawnPowerCubes(box.x + box.width / 2, box.y + box.height / 2, box.cubesToDrop);
            sound.playExplosion();
          }

          // Charge attacker super
          const attacker = this.brawlers.find((b) => b.id === p.ownerId);
          if (attacker && !p.isSuper) {
            const def = BRAWLERS[attacker.brawlerId];
            attacker.superCharge = Math.min(100, attacker.superCharge + def.superChargePerHit * 0.5);
          }

          if (!p.piercing) {
            hitBox = true;
            break;
          }
        }
      }

      if (hitBox) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check Brawler collision
      let hitBrawler = false;
      for (const target of this.brawlers) {
        if (target.id === p.ownerId || !target.isAlive || target.isLeaping) continue;

        const dist = Math.hypot(p.x - target.x, p.y - target.y);
        if (dist <= p.radius + target.radius) {
          // Attacker gets super charge!
          const attacker = this.brawlers.find((b) => b.id === p.ownerId);
          if (attacker && !p.isSuper) {
            const def = BRAWLERS[attacker.brawlerId];
            attacker.superCharge = Math.min(100, attacker.superCharge + def.superChargePerHit);
            if (attacker.superCharge >= 100 && attacker.isPlayer) {
              sound.playSuperReady();
            }
            // Harmony passive: Da Capo heals on hitting enemy!
            if (attacker.brawlerId === 'harmony') {
              attacker.hp = Math.min(attacker.maxHp, attacker.hp + 450);
              this.spawnDamageNumber(attacker.x, attacker.y - 20, '+450', '#10b981', true);
            }
          }

          // Poison dagger passive effect
          if (p.isPoisonous) {
            target.poisonTicksLeft = 4;
            target.poisonDamage = 180;
            target.poisonAttackerId = p.ownerId;
          }

          this.applyDamage(target, p.damage, p.ownerId, p.isSuper, p.color);
          this.spawnParticles(p.x, p.y, p.color, 6);
          sound.playHit();

          if (!p.piercing) {
            hitBrawler = true;
            break;
          }
        }
      }

      if (hitBrawler) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // --- DAMAGE & ELIMINATIONS ---
  private applyDamage(
    target: BrawlerEntity,
    rawDamage: number,
    attackerId: string,
    isSuper = false,
    color = '#ef4444'
  ) {
    if (!target.isAlive) return;

    let finalDamage = Math.round(rawDamage);

    // Shield check
    if (target.shieldTimer > 0) {
      finalDamage = Math.round(finalDamage * (1 - target.shieldRatio));
    }

    target.hp -= finalDamage;
    this.spawnDamageNumber(target.x, target.y - 25, `${finalDamage}`, color);

    if (target.isPlayer) {
      this.playerCombatTimer = 0;
      this.camera.shake = Math.min(12, this.camera.shake + 5);
    }

    // Did brawler die?
    if (target.hp <= 0) {
      target.hp = 0;
      target.isAlive = false;
      this.spawnParticles(target.x, target.y, '#ef4444', 30);
      sound.playElimination();

      // Drop all accumulated power cubes + 2 bonus cubes!
      const cubesToDrop = Math.max(2, target.powerCubes + 1);
      this.spawnPowerCubes(target.x, target.y, cubesToDrop);

      // Crediting killer
      const killer = this.brawlers.find((b) => b.id === attackerId);
      if (killer) {
        killer.kills++;
      }

      const killerName = killer ? killer.name : 'Tempesta Velenosa';
      const killEntry: KillFeedEntry = {
        id: `kill_${Date.now()}_${Math.random()}`,
        killerName,
        victimName: target.name,
        brawlerId: target.brawlerId,
        time: Date.now(),
      };
      this.callbacks.onKillFeed(killEntry);

      // Update alive count
      const aliveCount = this.brawlers.filter((b) => b.isAlive).length;
      this.callbacks.onAliveChange(aliveCount);

      // Check player death or victory
      if (target.isPlayer) {
        const placement = aliveCount + 1;
        this.callbacks.onGameOver(placement, target.kills, target.powerCubes);
      } else if (aliveCount === 1) {
        const winner = this.brawlers.find((b) => b.isAlive);
        if (winner && winner.isPlayer) {
          sound.playVictory();
          this.callbacks.onGameOver(1, winner.kills, winner.powerCubes);
        }
      }
    }
  }

  // --- POWER CUBES ---
  private spawnPowerCubes(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count + Math.random() * 0.5;
      const speed = 2.5 + Math.random() * 2;
      this.powerCubes.push({
        id: `cube_${Date.now()}_${i}_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        collected: false,
      });
    }
  }

  private updatePowerCubes(dt: number) {
    for (let i = this.powerCubes.length - 1; i >= 0; i--) {
      const cube = this.powerCubes[i];
      cube.x += cube.vx;
      cube.y += cube.vy;
      cube.vx *= 0.92;
      cube.vy *= 0.92;

      // Magnetic attraction to nearby living brawlers
      for (const brawler of this.brawlers) {
        if (!brawler.isAlive || brawler.isLeaping) continue;
        const dist = Math.hypot(brawler.x - cube.x, brawler.y - cube.y);
        if (dist < 130) {
          // Attract
          cube.x += ((brawler.x - cube.x) / dist) * 7;
          cube.y += ((brawler.y - cube.y) / dist) * 7;
        }

        if (dist <= brawler.radius + 14) {
          // Collect!
          brawler.powerCubes++;
          brawler.maxHp += 400;
          brawler.hp = Math.min(brawler.maxHp, brawler.hp + 400);

          this.spawnParticles(cube.x, cube.y, '#10b981', 12);
          this.spawnDamageNumber(brawler.x, brawler.y - 35, '+1 CUB', '#10b981', true);
          if (brawler.isPlayer) {
            sound.playPowerCube();
          }

          this.powerCubes.splice(i, 1);
          break;
        }
      }
    }
  }

  // --- PARTICLES & DAMAGE NUMBERS ---
  private spawnParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 2 + Math.random() * 4,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.35,
        alpha: 1,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life += dt;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnDamageNumber(x: number, y: number, text: string, color: string, isHeal = false) {
    this.damageNumbers.push({
      id: `dmg_${Date.now()}_${Math.random()}`,
      x: x + (Math.random() - 0.5) * 20,
      y,
      text,
      color,
      scale: isHeal ? 1.2 : 1.0,
      life: 0,
      isHeal,
    });
  }

  private updateDamageNumbers(dt: number) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.y -= 38 * dt; // Float up
      d.life += dt * 1.6;
      if (d.life >= 1) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  // --- COLLISION HELPERS ---
  private moveEntityWithCollision(entity: BrawlerEntity, dx: number, dy: number) {
    const newX = entity.x + dx;
    const newY = entity.y + dy;

    // Boundary check
    const r = entity.radius;
    const clampedX = Math.max(r + 40, Math.min(this.mapData.width - r - 40, newX));
    const clampedY = Math.max(r + 40, Math.min(this.mapData.height - r - 40, newY));

    // Obstacle collision
    let canMoveX = true;
    let canMoveY = true;

    for (const obs of this.obstacles) {
      if (this.circleIntersectsRect(clampedX, entity.y, r, obs)) canMoveX = false;
      if (this.circleIntersectsRect(entity.x, clampedY, r, obs)) canMoveY = false;
    }

    // Power box collision
    for (const box of this.powerBoxes) {
      if (box.isDestroyed) continue;
      if (this.circleIntersectsRect(clampedX, entity.y, r, box)) canMoveX = false;
      if (this.circleIntersectsRect(entity.x, clampedY, r, box)) canMoveY = false;
    }

    if (canMoveX) entity.x = clampedX;
    if (canMoveY) entity.y = clampedY;
  }

  private circleIntersectsRect(cx: number, cy: number, cr: number, rect: { x: number; y: number; width: number; height: number }) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
    const distX = cx - closestX;
    const distY = cy - closestY;
    return distX * distX + distY * distY < cr * cr;
  }

  private isInsideBush(x: number, y: number): boolean {
    for (const b of this.mapData.bushes) {
      if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
        return true;
      }
    }
    return false;
  }

  private findNearestBush(x: number, y: number) {
    let nearest = null;
    let minDist = Infinity;
    for (const b of this.mapData.bushes) {
      const dist = Math.hypot(b.x + b.width / 2 - x, b.y + b.height / 2 - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = b;
      }
    }
    return nearest;
  }

  private destroyWallsInRadius(x: number, y: number, radius: number) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (!obs.destructible) continue;
      const ox = obs.x + obs.width / 2;
      const oy = obs.y + obs.height / 2;
      if (Math.hypot(ox - x, oy - y) <= radius + 25) {
        this.spawnParticles(ox, oy, '#78350f', 12);
        this.obstacles.splice(i, 1);
      }
    }
  }

  // --- CAMERA ---
  private updateCamera(dt: number) {
    // Smooth camera lerp following player
    this.camera.targetX = this.player.x;
    this.camera.targetY = this.player.y;

    const lerpSpeed = 8;
    this.camera.x += (this.camera.targetX - this.camera.x) * lerpSpeed * dt;
    this.camera.y += (this.camera.targetY - this.camera.y) * lerpSpeed * dt;

    if (this.camera.shake > 0) {
      this.camera.shake -= dt * 25;
      if (this.camera.shake < 0) this.camera.shake = 0;
    }
  }

  // --- RENDERING (60FPS CANVAS 2D WITH ISOMETRIC/2.5D SHADOWS & PERSPECTIVE) ---
  private render() {
    const { ctx, canvas } = this;
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    // Center camera on screen + apply shake
    const shakeX = (Math.random() - 0.5) * this.camera.shake;
    const shakeY = (Math.random() - 0.5) * this.camera.shake;
    ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Draw Ground Tiles & Arena Grid
    this.renderGround(ctx);

    // 2. Draw Bushes (Under layer)
    this.renderBushes(ctx);

    // 3. Draw Power Boxes & Obstacles
    this.renderObstacles(ctx);
    this.renderPowerBoxes(ctx);
    this.renderPowerCubes(ctx);

    // 4. Draw Projectiles
    this.renderProjectiles(ctx);

    // 5. Draw Brawlers (with stealth & visual indicators)
    this.renderBrawlers(ctx);

    // 6. Draw Aiming Indicators (Trajectory arc / line / laser)
    if (this.player.isAlive) {
      this.renderPlayerAimIndicator(ctx);
    }

    // 7. Draw Particles
    this.renderParticles(ctx);

    // 8. Draw Damage Numbers
    this.renderDamageNumbers(ctx);

    // 9. Draw Poison Storm Gas (Vignette & haze over ground outside safe circle)
    this.renderPoisonZone(ctx);

    ctx.restore();
  }

  private renderGround(ctx: CanvasRenderingContext2D) {
    const mapW = this.mapData.width;
    const mapH = this.mapData.height;

    // Ground base color: warm desert arena tone (Brawl Stars Showdown style)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, mapW, mapH);

    // Grid lines for tactical 2.5D perspective
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const tileSize = 80;
    for (let x = 0; x <= mapW; x += tileSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapH);
    }
    for (let y = 0; y <= mapH; y += tileSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(mapW, y);
    }
    ctx.stroke();

    // Map Center Star Emblem
    const cx = mapW / 2;
    const cy = mapH / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    ctx.stroke();
    ctx.restore();
  }

  private renderBushes(ctx: CanvasRenderingContext2D) {
    for (const b of this.mapData.bushes) {
      // Lush cartoon tall grass
      ctx.fillStyle = '#15803d';
      ctx.fillRect(b.x, b.y, b.width, b.height);

      // Grass texture details
      ctx.fillStyle = '#22c55e';
      const step = 20;
      for (let gx = b.x + 5; gx < b.x + b.width - 5; gx += step) {
        for (let gy = b.y + 5; gy < b.y + b.height - 5; gy += step) {
          ctx.beginPath();
          ctx.arc(gx + Math.sin(gx) * 3, gy + Math.cos(gy) * 3, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    for (const obs of this.obstacles) {
      if (obs.type === 'stone') {
        // 2.5D stone block with drop shadow and top bevel
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(obs.x + 4, obs.y + 8, obs.width, obs.height);

        // Stone body
        ctx.fillStyle = '#475569';
        ctx.fillRect(obs.x, obs.y + 6, obs.width, obs.height - 6);

        // Stone top
        ctx.fillStyle = '#64748b';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height - 6);

        // Outline
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      } else if (obs.type === 'wood_box') {
        // Destructible wood crate
        ctx.fillStyle = '#78350f';
        ctx.fillRect(obs.x, obs.y + 6, obs.width, obs.height - 6);

        ctx.fillStyle = '#b45309';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height - 6);

        // Wood planks cross
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.moveTo(obs.x + obs.width, obs.y);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.stroke();
      } else if (obs.type === 'water') {
        // Water pond
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 14);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width * 0.4, obs.y + obs.height * 0.35, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderPowerBoxes(ctx: CanvasRenderingContext2D) {
    for (const box of this.powerBoxes) {
      if (box.isDestroyed) continue;

      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(box.x + box.width / 2, box.y + box.height + 4, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Box body: Iconic blue-gold Power Box
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(box.x, box.y + 6, box.width, box.height - 6);

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(box.x, box.y, box.width, box.height - 6);

      // Golden skull / power emblem on front
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(box.x + box.width / 2, box.y + box.height / 2 - 2, 8, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // HP bar for box
      const hpPct = Math.max(0, box.hp / box.maxHp);
      const barW = box.width + 10;
      const barH = 5;
      const barX = box.x - 5;
      const barY = box.y - 12;

      ctx.fillStyle = '#000000';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, barW * hpPct, barH);
    }
  }

  private renderPowerCubes(ctx: CanvasRenderingContext2D) {
    for (const cube of this.powerCubes) {
      // Glowing green power cube
      ctx.save();
      ctx.translate(cube.x, cube.y);

      // Glow aura
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;

      ctx.fillStyle = '#059669';
      ctx.fillRect(-10, -7, 20, 17);

      ctx.fillStyle = '#34d399';
      ctx.fillRect(-10, -10, 20, 17);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -6, 8, 8);

      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-10, -10, 20, 20);

      ctx.restore();
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      const angle = Math.atan2(p.vy, p.vx);
      ctx.rotate(angle);

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.isSuper ? 16 : 8;

      if (p.bulletType === 'sonic') {
        // Acoustic sonic wave crescent
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, -Math.PI / 3, Math.PI / 3);
        ctx.lineWidth = p.isSuper ? 14 : 8;
        ctx.strokeStyle = p.color;
        ctx.stroke();
      } else if (p.bulletType === 'punch') {
        // Heavy boxing fist
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (p.bulletType === 'poison') {
        // Toxic dagger
        ctx.beginPath();
        ctx.moveTo(p.radius * 2, 0);
        ctx.lineTo(-p.radius, -p.radius);
        ctx.lineTo(-p.radius, p.radius);
        ctx.closePath();
        ctx.fill();
      } else {
        // Standard bullet / shotgun pellet
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.5, p.radius, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(2, 0, p.radius * 0.7, p.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderBrawlers(ctx: CanvasRenderingContext2D) {
    for (const brawler of this.brawlers) {
      if (!brawler.isAlive) continue;

      // Stealth invisibility check:
      // If brawler is an enemy, and inside bush, and player is not close / not inside that bush
      const playerDist = Math.hypot(brawler.x - this.player.x, brawler.y - this.player.y);
      const isHiddenFromPlayer =
        !brawler.isPlayer &&
        brawler.isInBush &&
        (!this.player.isInBush || playerDist > 85);

      if (isHiddenFromPlayer) {
        continue; // Completely stealth invisible!
      }

      ctx.save();

      // If player is inside bush, show player as semi-transparent so they know they are hidden!
      if (brawler.isInBush) {
        ctx.globalAlpha = brawler.isPlayer ? 0.65 : 0.8;
      }

      // Height offset during Super Leap
      let heightOffset = 0;
      if (brawler.isLeaping) {
        // Parabolic arc peak
        heightOffset = Math.sin(brawler.leapProgress * Math.PI) * 120;
      }

      // 1. Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(brawler.x, brawler.y + 6, brawler.radius * 1.1, brawler.radius * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Character Body (Isometric 2.5D tilt)
      const brawlerY = brawler.y - heightOffset;
      const def = BRAWLERS[brawler.brawlerId];

      // Shield Aura
      if (brawler.shieldTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(brawler.x, brawlerY, brawler.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Base circle
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(brawler.x, brawlerY, brawler.radius, 0, Math.PI * 2);
      ctx.fill();

      // Black comic outline
      ctx.strokeStyle = brawler.isPlayer ? '#ffffff' : '#000000';
      ctx.lineWidth = brawler.isPlayer ? 3.5 : 2.5;
      ctx.stroke();

      // Facing Direction & Weapon barrel
      const barrelLen = brawler.radius + 12;
      const bx = brawler.x + Math.cos(brawler.rotation) * barrelLen;
      const by = brawlerY + Math.sin(brawler.rotation) * barrelLen;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(brawler.x, brawlerY);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Avatar Emoji / Character Icon in center
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.avatarEmoji, brawler.x, brawlerY);

      // 3. Name, Platform icon, Health Bar & Power Cubes Badge
      if (!brawler.isLeaping) {
        this.renderBrawlerOverhead(ctx, brawler, brawler.x, brawlerY - brawler.radius - 12);
      }

      ctx.restore();
    }
  }

  private renderBrawlerOverhead(
    ctx: CanvasRenderingContext2D,
    brawler: BrawlerEntity,
    x: number,
    y: number
  ) {
    // Platform icon symbol
    const platformSymbol = brawler.platform === 'pc' ? '💻' : brawler.platform === 'tablet' ? '📱' : '📱';

    // Name & Platform text
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = brawler.isPlayer ? '#67e8f9' : '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    const nameText = `${platformSymbol} ${brawler.name}`;
    ctx.strokeText(nameText, x, y - 10);
    ctx.fillText(nameText, x, y - 10);

    // Health Bar
    const barW = 54;
    const barH = 7;
    const barX = x - barW / 2;
    const barY = y - 4;
    const hpPct = Math.max(0, brawler.hp / brawler.maxHp);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    // Green health bar (or yellow if low, red if critical)
    let hpColor = '#22c55e';
    if (hpPct < 0.3) hpColor = '#ef4444';
    else if (hpPct < 0.6) hpColor = '#eab308';

    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    // Ammo bar indicators (3 small bars under health)
    if (brawler.isPlayer) {
      const ammoSlotW = (barW - 4) / 3;
      const ammoSlotH = 3;
      const ammoY = barY + barH + 2;

      for (let s = 0; s < 3; s++) {
        const slotX = barX + s * (ammoSlotW + 2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(slotX, ammoY, ammoSlotW, ammoSlotH);

        if (s < brawler.ammo) {
          ctx.fillStyle = '#f97316'; // Full ammo slot
          ctx.fillRect(slotX, ammoY, ammoSlotW, ammoSlotH);
        } else if (s === brawler.ammo) {
          ctx.fillStyle = '#fdba74'; // Reloading slot
          ctx.fillRect(slotX, ammoY, ammoSlotW * brawler.ammoProgress, ammoSlotH);
        }
      }
    }

    // Power Cubes badge on left of bar if brawler has power cubes
    if (brawler.powerCubes > 0) {
      const badgeX = barX - 14;
      const badgeY = barY + 3;
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui';
      ctx.fillText(`${brawler.powerCubes}`, badgeX, badgeY + 3);
    }
  }

  // Trajectory aiming reticle for player (attack line/cone/super)
  private renderPlayerAimIndicator(ctx: CanvasRenderingContext2D) {
    if (!this.aimVector.isAiming && !this.aimVector.isSuperAiming) return;

    const p = this.player;
    const def = BRAWLERS[p.brawlerId];
    const isSuper = this.aimVector.isSuperAiming;
    const range = isSuper ? def.superRange : def.attackRange;
    const angle = p.rotation;
    const color = isSuper ? '#eab308' : '#ef4444';

    ctx.save();
    ctx.translate(p.x, p.y);

    if (isSuper && def.superType === 'leap') {
      // Leap target circle
      const targetDist = Math.min(range, Math.hypot(this.aimVector.x, this.aimVector.y) * 4);
      const tx = Math.cos(angle) * targetDist;
      const ty = Math.sin(angle) * targetDist;

      // Dashed flight line
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      // Impact crater target
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.beginPath();
      ctx.arc(tx, ty, def.superRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // Aiming laser beam or shotgun cone
      const spread = def.attackSpread;
      ctx.fillStyle = isSuper ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, range, angle - spread / 2, angle + spread / 2);
      ctx.closePath();
      ctx.fill();

      // Border lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 6]);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderDamageNumbers(ctx: CanvasRenderingContext2D) {
    for (const d of this.damageNumbers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - d.life);
      ctx.font = `bold ${Math.round(18 * d.scale)}px 'Rowdies', 'Outfit', sans-serif`;
      ctx.textAlign = 'center';

      // Outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(d.text, d.x, d.y);

      // Text color
      ctx.fillStyle = d.color;
      ctx.fillText(d.text, d.x, d.y);
      ctx.restore();
    }
  }

  // Poison Storm Zone rendering: toxic green smog outside circle
  private renderPoisonZone(ctx: CanvasRenderingContext2D) {
    const cx = this.poisonZone.centerX;
    const cy = this.poisonZone.centerY;
    const r = this.poisonZone.currentRadius;

    ctx.save();

    // Draw toxic circle perimeter line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Smog particles around border
    ctx.fillStyle = 'rgba(22, 101, 52, 0.35)';
    ctx.beginPath();
    ctx.rect(0, 0, this.mapData.width, this.mapData.height);
    ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.restore();
  }
}
