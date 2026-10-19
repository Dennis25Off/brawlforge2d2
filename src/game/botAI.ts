import { FighterEntity, Stage } from '../types/game';

interface BotInputState {
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
}

export function computeBotInputs(
  bot: FighterEntity,
  opponents: FighterEntity[],
  stage: Stage,
  frameTick: number
): BotInputState {
  const inputs: BotInputState = {
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
  };

  if (bot.actionState === 'ko' || bot.actionState === 'respawning') {
    return inputs;
  }

  // Find primary target (closest alive opponent)
  const aliveOpponents = opponents.filter(
    (o) => o.id !== bot.id && o.stocks > 0 && o.actionState !== 'ko' && o.actionState !== 'respawning'
  );

  if (aliveOpponents.length === 0) {
    // Victory celebration or idle
    if (frameTick % 90 === 0 && !bot.currentEmote) {
      bot.currentEmote = '👑';
      bot.emoteTimer = 60;
    }
    return inputs;
  }

  let target = aliveOpponents[0];
  let minDist = Infinity;
  for (const opp of aliveOpponents) {
    const dist = Math.hypot(opp.x - bot.x, opp.y - bot.y);
    if (dist < minDist) {
      minDist = dist;
      target = opp;
    }
  }

  // Main stage center bounds
  const mainPlat = stage.platforms.find((p) => !p.isSoft) || stage.platforms[0];
  const stageLeft = mainPlat.x;
  const stageRight = mainPlat.x + mainPlat.width;
  const stageCenter = (stageLeft + stageRight) / 2;

  // 1. OFFSTAGE RECOVERY ROUTINE
  const isOffstageLeft = bot.x < stageLeft - 20;
  const isOffstageRight = bot.x > stageRight + 20;
  const isBelowStage = bot.y > mainPlat.y + 40;

  if (isOffstageLeft || isOffstageRight || isBelowStage) {
    // Steer towards stage center
    if (bot.x < stageCenter) inputs.right = true;
    else inputs.left = true;

    // If falling below stage edge, jump or use Up-Special Recovery!
    if (bot.vy > 1) {
      if (bot.jumpsLeft > 0) {
        inputs.jump = true;
      } else if (bot.y > mainPlat.y - 10) {
        inputs.special = true;
        inputs.up = true;
      }
    }

    // If touching wall, jump for wall kick!
    if (bot.isWallSliding) {
      inputs.jump = true;
    }

    return inputs;
  }

  // 2. TARGET TRACKING & MOVEMENT
  const dx = target.x - bot.x;
  const dy = target.y - bot.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // Steer towards target
  if (dx > 35) inputs.right = true;
  else if (dx < -35) inputs.left = true;

  // Vertical navigation (jumping up to soft platform or dropping through)
  if (target.y < bot.y - 60) {
    // Target is above: jump up
    if (bot.isGrounded || bot.jumpsLeft > 0) {
      if (frameTick % 25 === 0) inputs.jump = true;
    }
  } else if (target.y > bot.y + 60 && bot.isGrounded) {
    // Target is below: drop through soft platform
    inputs.down = true;
    inputs.jump = true;
  }

  // 3. DEFENSIVE SHIELD & DODGE (Anti-Stun Guard)
  if (target.actionState === 'attack' && absDx < 85 && absDy < 60) {
    // Shield blocks the attack and prevents stun completely!
    if ((bot.shieldHealth || 100) > 30 && Math.random() < 0.5) {
      inputs.shield = true;
      return inputs;
    } else if (bot.dodgeCooldown <= 0 && Math.random() < 0.6) {
      inputs.dodge = true;
      return inputs;
    }
  }

  // 4. OFFENSIVE ATTACKS & SPECIAL ABILITIES
  if (bot.actionState !== 'attack') {
    // Face target
    if (dx > 0) inputs.right = true;
    else inputs.left = true;

    // A. Ranged Special Attack when at mid-to-long range (projectiles / waves)
    if (absDx >= 90 && absDx < 380 && absDy < 80 && Math.random() < 0.18) {
      inputs.special = true;
      return inputs;
    }

    // B. Mid-range dash in with Side Special
    if (absDx >= 65 && absDx < 160 && absDy < 50 && Math.random() < 0.22) {
      inputs.special = true;
      if (dx > 0) inputs.right = true;
      else inputs.left = true;
      return inputs;
    }

    // C. Close Combat
    if (absDx < 75 && absDy < 60) {
      // Occasional Down Special (counter / shield / mine / seismic slam)
      if (Math.random() < 0.2) {
        inputs.special = true;
        inputs.down = true;
        return inputs;
      }

      // High damage kill-confirm opportunity: Heavy Smash!
      if (target.damagePercent > 80 && Math.random() < 0.45) {
        inputs.heavy = true;
      } else {
        // Light combo / tilt / aerial
        inputs.light = true;
        if (absDy > 25 && target.y < bot.y) {
          inputs.up = true;
        } else if (absDy > 25 && target.y > bot.y) {
          inputs.down = true;
        }
      }
    }
  }

  // Random jump mixup during neutral
  if (bot.isGrounded && Math.random() < 0.02) {
    inputs.jump = true;
  }

  return inputs;
}
