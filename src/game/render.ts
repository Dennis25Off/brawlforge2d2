import { FighterEntity, GameParticle, ProjectileEntity, Stage } from '../types/game';
import { HEROES } from './heroes';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export function calculateCamera(
  fighters: FighterEntity[],
  stage: Stage,
  viewportWidth: number,
  viewportHeight: number
): CameraState {
  const activeFighters = fighters.filter((f) => f.stocks > 0 && f.actionState !== 'ko');

  if (activeFighters.length === 0) {
    return { x: stage.width / 2, y: stage.height / 2, zoom: 1 };
  }

  let minX = activeFighters[0].x;
  let maxX = activeFighters[0].x;
  let minY = activeFighters[0].y;
  let maxY = activeFighters[0].y;

  for (const f of activeFighters) {
    minX = Math.min(minX, f.x);
    maxX = Math.max(maxX, f.x);
    minY = Math.min(minY, f.y);
    maxY = Math.max(maxY, f.y);
  }

  // Add padding
  const paddingX = 220;
  const paddingY = 160;
  const boxWidth = Math.max(480, maxX - minX + paddingX * 2);
  const boxHeight = Math.max(320, maxY - minY + paddingY * 2);

  const zoomX = viewportWidth / boxWidth;
  const zoomY = viewportHeight / boxHeight;
  const zoom = Math.min(1.2, Math.max(0.45, Math.min(zoomX, zoomY)));

  const centerX = Math.max(stage.width * 0.2, Math.min(stage.width * 0.8, (minX + maxX) / 2));
  const centerY = Math.max(stage.height * 0.25, Math.min(stage.height * 0.75, (minY + maxY) / 2));

  return { x: centerX, y: centerY, zoom };
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stage: Stage,
  fighters: FighterEntity[],
  particles: GameParticle[],
  projectiles: ProjectileEntity[] = [],
  camera: CameraState,
  screenShake: number
) {
  // Clear canvas
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Screen shake offset
  let shakeX = 0;
  let shakeY = 0;
  if (screenShake > 0) {
    shakeX = (Math.random() - 0.5) * screenShake * 1.5;
    shakeY = (Math.random() - 0.5) * screenShake * 1.5;
  }

  // 1. DRAW PARALLAX BACKGROUND
  drawBackground(ctx, width, height, stage, camera);

  // Apply Camera transform for world elements
  ctx.save();
  ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // 2. DRAW STAGE PLATFORMS
  drawStagePlatforms(ctx, stage);

  // 3. DRAW PARTICLES
  drawParticles(ctx, particles);

  // 4. DRAW PROJECTILES & SPECIAL ENTITIES
  drawProjectiles(ctx, projectiles);

  // 5. DRAW FIGHTERS
  fighters.forEach((fighter) => {
    if (fighter.stocks <= 0 && fighter.actionState === 'ko') return;
    drawFighter(ctx, fighter);
  });

  ctx.restore(); // restore camera transform

  ctx.restore(); // restore root state
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stage: Stage,
  camera: CameraState
) {
  // Deep modern dark gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (stage.bgTheme === 'cyber') {
    bgGrad.addColorStop(0, '#09090b');
    bgGrad.addColorStop(0.5, '#091322');
    bgGrad.addColorStop(1, '#050508');
  } else {
    bgGrad.addColorStop(0, '#090a0f');
    bgGrad.addColorStop(0.5, '#131127');
    bgGrad.addColorStop(1, '#08080c');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Parallax stars and cosmic grid
  ctx.save();
  const parallaxFactor = 0.15;
  const offsetX = -camera.x * parallaxFactor;
  const offsetY = -camera.y * parallaxFactor;

  // Cosmic Nebula Glow
  const radialGlow = ctx.createRadialGradient(
    width / 2 + offsetX,
    height / 2 + offsetY,
    50,
    width / 2 + offsetX,
    height / 2 + offsetY,
    width * 0.7
  );
  if (stage.bgTheme === 'cyber') {
    radialGlow.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
    radialGlow.addColorStop(0.6, 'rgba(168, 85, 247, 0.06)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    radialGlow.addColorStop(0, 'rgba(124, 58, 237, 0.15)');
    radialGlow.addColorStop(0.6, 'rgba(56, 189, 248, 0.07)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // Floating background geometry / grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 80;
  const startX = (offsetX % gridSize) - gridSize;
  const startY = (offsetY % gridSize) - gridSize;

  for (let x = startX; x < width + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = startY; y < height + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawStagePlatforms(ctx: CanvasRenderingContext2D, stage: Stage) {
  for (const plat of stage.platforms) {
    ctx.save();

    if (!plat.isSoft) {
      const isBaseFloor = plat.id.includes('floor') || plat.id.includes('barrier') || plat.id === 'main_ground';

      if (isBaseFloor) {
        // IMPENETRABLE BASE FLOOR - Anti-Fall Energy Barrier
        const grad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.3, '#0b1329');
        grad.addColorStop(1, '#02040a');

        ctx.fillStyle = grad;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        // Anti-Gravity Forcefield Bar
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(plat.x, plat.y - 2, plat.width, 4);

        // Luminous pulse line
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(plat.x, plat.y - 1, plat.width, 1.5);
        ctx.shadowBlur = 0;

        // Energy chevrons across the floor
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 2;
        for (let fx = plat.x + 40; fx < plat.x + plat.width; fx += 100) {
          ctx.beginPath();
          ctx.moveTo(fx, plat.y + 10);
          ctx.lineTo(fx + 20, plat.y + 30);
          ctx.lineTo(fx + 40, plat.y + 10);
          ctx.stroke();
        }
      } else {
        // Floating Fortress Solid Platform
        const grad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(0.3, '#0f172a');
        grad.addColorStop(1, '#020617');

        // Top surface edge glow
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(plat.x, plat.y - 2, plat.width, 3);
        ctx.shadowBlur = 0;

        // Island Body
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, [4, 4, 18, 18]);
        ctx.fill();

        // Platform Border
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Underneath floating crystal runes
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.beginPath();
        ctx.arc(plat.x + plat.width / 2, plat.y + plat.height - 12, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Soft Floating Platform
      const softColor = plat.color || '#38bdf8';
      ctx.shadowColor = softColor;
      ctx.shadowBlur = 12;

      // Glowing top bar
      ctx.fillStyle = softColor;
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
      ctx.fill();

      // Soft platform inner accent
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(plat.x + 8, plat.y + 2, plat.width - 16, 2);

      // Support energy brackets
      ctx.strokeStyle = softColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plat.x + 12, plat.y + plat.height);
      ctx.lineTo(plat.x + 4, plat.y + plat.height + 6);
      ctx.moveTo(plat.x + plat.width - 12, plat.y + plat.height);
      ctx.lineTo(plat.x + plat.width - 4, plat.y + plat.height + 6);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawFighter(ctx: CanvasRenderingContext2D, fighter: FighterEntity) {
  const hero = HEROES[fighter.customization.heroId] || HEROES.valiant_knight;
  const primaryColor = fighter.customization.skinPalette.startsWith('#')
    ? fighter.customization.skinPalette
    : hero.primaryColor;

  ctx.save();
  ctx.translate(fighter.x, fighter.y);
  ctx.scale(fighter.facing, 1);

  // 1. Motion Trail Render
  if (fighter.trailPositions.length > 0) {
    fighter.trailPositions.forEach((pos, i) => {
      ctx.save();
      ctx.translate((pos.x - fighter.x) * fighter.facing, pos.y - fighter.y);
      ctx.globalAlpha = (i / fighter.trailPositions.length) * 0.35;
      drawFighterSilhouette(ctx, primaryColor, fighter.customization.trail);
      ctx.restore();
    });
  }

  // 2. Invincible Shield Bubble (Spawn Protection)
  if (fighter.invincibleTimer > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, fighter.height * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();
    ctx.restore();
  }

  // 3. ACTIVE SHIELD FORCEFIELD (Prevents Stun / Stordimento!)
  if (fighter.actionState === 'shield' || fighter.isShielding) {
    ctx.save();
    const shieldHealth = fighter.shieldHealth !== undefined ? fighter.shieldHealth : 100;
    const healthRatio = Math.max(0.35, shieldHealth / 100);
    const shieldRadius = fighter.height * 0.72 * (0.85 + 0.15 * healthRatio);
    const pulse = Math.sin(Date.now() / 70) * 2.5;

    // Outer Glow Ring
    ctx.strokeStyle = shieldHealth > 35 ? '#38bdf8' : '#f43f5e';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = shieldHealth > 35 ? '#06b6d4' : '#e11d48';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Translucent Bubble
    const shieldGrad = ctx.createRadialGradient(0, 0, shieldRadius * 0.2, 0, 0, shieldRadius);
    shieldGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    shieldGrad.addColorStop(0.7, shieldHealth > 35 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(244, 63, 94, 0.35)');
    shieldGrad.addColorStop(1, shieldHealth > 35 ? 'rgba(6, 182, 212, 0.55)' : 'rgba(225, 29, 72, 0.65)');
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Hexagonal / Lattice Shield Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.4;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      const hx = Math.cos(a + Date.now() / 600) * (shieldRadius * 0.72);
      const hy = Math.sin(a + Date.now() / 600) * (shieldRadius * 0.72);
      ctx.beginPath();
      ctx.arc(hx, hy, shieldRadius * 0.24, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shield Integrity Ring Gauge
    ctx.strokeStyle = shieldHealth > 35 ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, shieldRadius + 8, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (shieldHealth / 100)));
    ctx.stroke();

    ctx.restore();
  }

  // 4. Charging Aura
  if (fighter.isCharging) {
    ctx.save();
    const chargeScale = 1 + (fighter.chargeTime / 35) * 0.3;
    ctx.strokeStyle = hero.accentColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = hero.accentColor;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(0, 0, fighter.height * 0.7 * chargeScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Hitstun Wiggle
  if (fighter.actionState === 'hitstun') {
    ctx.rotate((Math.random() - 0.5) * 0.3);
  }

  // 5. Draw Fighter Body (High Detail Skins)
  // Hero-specific back accessories & wings
  if (hero.id === 'shadow_valkyrie') {
    // Ethereal dark wings fluttering
    const wingFlap = Math.sin(Date.now() / 120) * 8;
    ctx.save();
    ctx.fillStyle = '#4a044e';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 12;
    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.quadraticCurveTo(-26, -34 + wingFlap, -36, -20 + wingFlap);
    ctx.quadraticCurveTo(-28, -6, -8, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right Wing
    ctx.beginPath();
    ctx.moveTo(8, -16);
    ctx.quadraticCurveTo(26, -34 + wingFlap, 36, -20 + wingFlap);
    ctx.quadraticCurveTo(28, -6, 8, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (hero.id === 'mecha_striker') {
    // Jetpack on back with animated flame exhaust
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, -18, 8, 18);
    // Exhaust nozzles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-17, 0, 6, 4);
    // Jet flame when jumping or in air
    if (!fighter.isGrounded || fighter.actionState === 'jump' || fighter.activeAttack?.specialSlot === 'up') {
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-17, 4);
      ctx.lineTo(-14, 14 + Math.random() * 8);
      ctx.lineTo(-11, 4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Flowing Scarf / Cape
  const windOffset = (Math.sin(Date.now() / 90) * 5) - (fighter.vx * 1.5);
  ctx.save();
  ctx.fillStyle = hero.accentColor;
  ctx.beginPath();
  ctx.moveTo(-10, -22);
  ctx.quadraticCurveTo(-22 + windOffset, -14, -30 + windOffset * 1.3, -8);
  ctx.lineTo(-24 + windOffset * 1.3, -4);
  ctx.quadraticCurveTo(-16 + windOffset, -12, -8, -18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Legs with Greaves & Boots
  const legOffset = fighter.actionState === 'run' ? Math.sin(Date.now() / 60) * 8 : 0;
  // Back leg
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-12 + legOffset, 8, 8, 16);
  ctx.fillStyle = primaryColor;
  ctx.fillRect(-12 + legOffset, 12, 8, 6); // kneepad
  ctx.fillStyle = '#334155';
  ctx.fillRect(-13 + legOffset, 20, 10, 4); // boot

  // Front leg
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(4 - legOffset, 8, 8, 16);
  ctx.fillStyle = primaryColor;
  ctx.fillRect(4 - legOffset, 12, 8, 6); // kneepad
  ctx.fillStyle = '#334155';
  ctx.fillRect(3 - legOffset, 20, 10, 4); // boot

  // Torso / Armored Cuirass with Shading
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.roundRect(-14, -16, 28, 26, 6);
  ctx.fill();

  // Armor Plate Inlay & Highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(-12, -14, 6, 20); // highlight strip
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(6, -14, 6, 20); // shadow strip

  // Golden / Steel Belt & Buckle
  ctx.fillStyle = '#334155';
  ctx.fillRect(-14, 6, 28, 5);
  ctx.fillStyle = hero.accentColor;
  ctx.fillRect(-4, 5, 8, 7); // buckle

  // Scabbard / Saya on hip
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-18, 4, 16, 4);
  ctx.fillStyle = hero.accentColor;
  ctx.fillRect(-17, 3, 3, 6); // scabbard fitting

  // Chest Reactor Core with Pulse
  ctx.shadowColor = hero.accentColor;
  ctx.shadowBlur = 8;
  ctx.fillStyle = hero.accentColor;
  ctx.beginPath();
  ctx.arc(0, -5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Shoulder Pauldrons
  ctx.fillStyle = hero.accentColor;
  ctx.beginPath();
  ctx.ellipse(-14, -14, 5, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(14, -14, 5, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head & Helmet/Faceplate
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, -26, 11, 0, Math.PI * 2);
  ctx.fill();

  // Forehead Guard / Headband
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-11, -32, 22, 5);
  ctx.fillStyle = hero.accentColor;
  ctx.fillRect(-3, -33, 6, 6);

  // Visor / Mask Glowing Eyes
  ctx.shadowColor = hero.accentColor;
  ctx.shadowBlur = 6;
  ctx.fillStyle = hero.accentColor;
  ctx.fillRect(2, -28, 7, 4);
  ctx.shadowBlur = 0;

  // 6. Draw Hat / Accessory
  drawAccessory(ctx, fighter.customization.hat, hero.accentColor);

  // 7. Draw Weapon & Attack Swing
  drawWeapon(ctx, fighter, hero);

  ctx.restore();

  // 8. Overhead UI: Damage %, Stock counters, Player Name, Emote Bubble
  drawOverheadHUD(ctx, fighter);
}

function drawFighterSilhouette(ctx: CanvasRenderingContext2D, color: string, trailType: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-14, -16, 28, 26, 6);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -26, 11, 0, Math.PI * 2);
  ctx.fill();

  if (trailType === 'lightning') {
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-15, -20);
    ctx.lineTo(-5, -5);
    ctx.lineTo(15, -15);
    ctx.stroke();
  }
}

function drawAccessory(ctx: CanvasRenderingContext2D, hatId: string, accentColor: string) {
  if (hatId === 'horns') {
    // Viking horns
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-9, -32);
    ctx.quadraticCurveTo(-18, -42, -14, -48);
    ctx.quadraticCurveTo(-10, -42, -6, -34);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(5, -34);
    ctx.quadraticCurveTo(9, -42, 13, -48);
    ctx.quadraticCurveTo(17, -42, 8, -32);
    ctx.fill();
  } else if (hatId === 'visor') {
    // Cyber HUD visor
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(-2, -30, 12, 6);
    ctx.shadowBlur = 0;
  } else if (hatId === 'ronin') {
    // Ronin Straw Hat
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-22, -30);
    ctx.lineTo(0, -42);
    ctx.lineTo(22, -30);
    ctx.closePath();
    ctx.fill();
  } else if (hatId === 'halo') {
    // Angelic Halo
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#fef08a';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(0, -44, 14, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (hatId === 'crown') {
    // Infernal Crown
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-11, -34);
    ctx.lineTo(-8, -45);
    ctx.lineTo(-3, -37);
    ctx.lineTo(0, -47);
    ctx.lineTo(3, -37);
    ctx.lineTo(8, -45);
    ctx.lineTo(11, -34);
    ctx.closePath();
    ctx.fill();
  } else if (hatId === 'fox_mask') {
    // Kitsune mask
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -26, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(6, -28, 4, 2);
  }
}

function drawWeapon(ctx: CanvasRenderingContext2D, fighter: FighterEntity, hero: any) {
  const isAttacking = fighter.actionState === 'attack' && fighter.activeAttack;
  const attackFrame = fighter.attackFrame;

  ctx.save();

  // Attack swing trails / weapon rotation
  let weaponRot = 0.2;
  let weaponX = 14;
  let weaponY = -6;

  if (isAttacking) {
    const progress = Math.min(1, attackFrame / 14);
    weaponRot = -0.8 + progress * 2.8;
    weaponX = 16 + Math.cos(weaponRot) * 12;
    weaponY = -6 + Math.sin(weaponRot) * 12;

    // Glowing weapon slash arc customized per hero archetype!
    const slashColor = fighter.activeAttack?.effectColor || hero.accentColor;
    ctx.save();
    ctx.strokeStyle = slashColor;
    ctx.shadowColor = slashColor;
    ctx.shadowBlur = 16;

    if (hero.weaponType === 'blaster') {
      // Emerald laser beam projection!
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(14, -6);
      ctx.lineTo(75, -6 + Math.sin(weaponRot) * 10);
      ctx.stroke();
      // Beam core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, -6);
      ctx.lineTo(70, -6 + Math.sin(weaponRot) * 10);
      ctx.stroke();
    } else if (hero.weaponType === 'gauntlets') {
      // Thunder punch shockwave ring
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(24, -6, 26 * progress, 0, Math.PI * 2);
      ctx.stroke();
    } else if (hero.weaponType === 'katana') {
      // Razor-sharp crescent iai slash arc
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(6, -6, 42, weaponRot - 0.9, weaponRot + 0.3);
      ctx.stroke();
      // Inner white razor edge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(6, -6, 41, weaponRot - 0.8, weaponRot + 0.2);
      ctx.stroke();
    } else if (hero.weaponType === 'daggers') {
      // Twin cross slashes
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(8, -10, 32, weaponRot - 0.7, weaponRot + 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(8, -4, 28, weaponRot - 0.5, weaponRot + 0.4);
      ctx.stroke();
    } else {
      // Heavy sword / scythe sweeping arc
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(8, -8, 40, weaponRot - 0.8, weaponRot + 0.3);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.translate(weaponX, weaponY);
  ctx.rotate(weaponRot);

  // Draw weapon shape based on type
  if (hero.weaponType === 'katana') {
    // Elegant Curved Katana Muramasa
    // Curved steel blade
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(18, -4, 38, -9);
    ctx.stroke();

    // Wavy Hamon temper line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(3, -1);
    ctx.quadraticCurveTo(18, -5, 36, -10);
    ctx.stroke();

    // Golden Tsuba (guard)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-2, -5, 4, 10);

    // Wrapped Tsuka (hilt)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -2, 10, 4);
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(-10, -2, 2, 4);
    ctx.fillRect(-6, -2, 2, 4);
    // Pommel (kashira)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-14, -3, 3, 6);
  } else if (hero.weaponType === 'sword') {
    // Spadone
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, -4, 30, 7);
    ctx.fillStyle = hero.accentColor;
    ctx.fillRect(4, -2, 20, 3);
    // Hilt
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-6, -8, 6, 15);
  } else if (hero.weaponType === 'daggers') {
    // Plasma twin daggers
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(18, -6);
    ctx.lineTo(24, 0);
    ctx.lineTo(18, 6);
    ctx.closePath();
    ctx.fill();
  } else if (hero.weaponType === 'gauntlets') {
    // Heavy gauntlets
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-4, -8, 18, 16, 4);
    ctx.fill();
  } else if (hero.weaponType === 'scythe') {
    // Scythe
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, -3, 34, 4);
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(28, -2);
    ctx.quadraticCurveTo(38, -22, 16, -30);
    ctx.quadraticCurveTo(28, -16, 26, 2);
    ctx.fill();
  } else {
    // Blaster cannon
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, -6, 22, 10);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(18, -4, 6, 6);
  }

  ctx.restore();
}

function drawOverheadHUD(ctx: CanvasRenderingContext2D, fighter: FighterEntity) {
  ctx.save();
  ctx.translate(fighter.x, fighter.y - fighter.height / 2 - 20);

  // Player Name & Bot Tag - compact & refined for mobile
  ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 3;
  ctx.fillText(fighter.name, 0, -15);

  // Damage Percentage
  let dmgColor = '#ffffff';
  if (fighter.damagePercent > 140) dmgColor = '#ef4444';
  else if (fighter.damagePercent > 90) dmgColor = '#f97316';
  else if (fighter.damagePercent > 45) dmgColor = '#facc15';

  ctx.font = '800 12px "JetBrains Mono", monospace';
  ctx.fillStyle = dmgColor;
  ctx.shadowColor = dmgColor;
  ctx.shadowBlur = 6;
  ctx.fillText(`${fighter.damagePercent}%`, 0, -3);
  ctx.shadowBlur = 0;

  // Stocks left (dots / icons)
  const stockSpacing = 8;
  const startX = -((fighter.stocks - 1) * stockSpacing) / 2;
  for (let s = 0; s < fighter.stocks; s++) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(startX + s * stockSpacing, 8, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Emote Bubble if active
  if (fighter.currentEmote) {
    ctx.fillStyle = '#09090b';
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-16, -54, 32, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '16px serif';
    ctx.fillText(fighter.currentEmote, 0, -34);
  }

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: GameParticle[]) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha * (1 - p.life / p.maxLife));

    if (p.type === 'shockwave') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + (p.life / p.maxLife) * 3), 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'smoke') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + (p.life / p.maxLife) * 1.5), 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Spark
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: ProjectileEntity[]) {
  for (const p of projectiles) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.type === 'katana_wind') {
      // Crescent flying blade
      ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 16;
      ctx.lineWidth = 4;
      ctx.beginPath();
      const dir = p.vx >= 0 ? 1 : -1;
      ctx.arc(0, 0, 24, -Math.PI / 2.3 * dir, Math.PI / 2.3 * dir);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (p.type === 'holy_wave') {
      // Broad golden holy wave
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 6;
      ctx.beginPath();
      const dir = p.vx >= 0 ? 1 : -1;
      ctx.ellipse(0, 0, 10, 28, 0, -Math.PI / 2 * dir, Math.PI / 2 * dir);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (p.type === 'cyber_shuriken') {
      // Spinning 4-pointed neon star
      if (p.rotation !== undefined) ctx.rotate(p.rotation);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(10, 0);
        ctx.lineTo(3, 3);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'thunder_orb') {
      // Crackling lightning sphere
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      // Lightning arcs
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-2, 8);
      ctx.lineTo(10, -4);
      ctx.stroke();
    } else if (p.type === 'proton_missile') {
      // Rocket
      const dir = p.vx >= 0 ? 1 : -1;
      ctx.scale(dir, 1);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-12, -6, 20, 12, 3);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.lineTo(16, 0);
      ctx.lineTo(8, 6);
      ctx.closePath();
      ctx.fill();
      // Thruster flame
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(-20 - Math.random() * 6, 0);
      ctx.lineTo(-12, 4);
      ctx.closePath();
      ctx.fill();
    } else if (p.type === 'void_sphere') {
      // Swirling gravity void
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + Math.sin(p.life / 4) * 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'proximity_mine') {
      // Ground mine
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-12, -4, 24, 10, 4);
      ctx.fill();
      ctx.stroke();
      // Blinking beacon
      ctx.fillStyle = (Math.floor(p.life / 6) % 2 === 0) ? '#ef4444' : '#10b981';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, -1, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'laser_beam') {
      // Long laser beam
      const dir = p.vx >= 0 ? 1 : -1;
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(dir * 280, 0);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(dir * 280, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}

