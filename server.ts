process.env.DISABLE_HMR = 'true';

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// --- MULTIPLAYER DATA STRUCTURES ---

interface QueuedPlayer {
  id: string;
  name: string;
  brawlerId: string;
  trophies: number;
  platform: string;
  joinedAt: number;
  lastPing: number;
  assignedRoomId?: string;
  spawnIndex?: number;
  isBot?: boolean;
}

interface RemotePlayerSync {
  id: string;
  name: string;
  brawlerId: string;
  platform: string;
  x: number;
  y: number;
  rotation: number;
  hp: number;
  maxHp: number;
  ammo: number;
  powerCubes: number;
  isAlive: boolean;
  isMoving: boolean;
  walkCycle?: number;
  hitFlash?: boolean;
  lastUpdate: number;
}

interface ProjectileEvent {
  id: string;
  ownerId: string;
  brawlerId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bulletType: string;
  color: string;
  radius: number;
  damage: number;
  isSuper: boolean;
  piercing?: boolean;
  timestamp: number;
}

interface DamageEvent {
  id: string;
  attackerId: string;
  targetId: string;
  damage: number;
  color?: string;
  timestamp: number;
}

interface KillEvent {
  id: string;
  killerId: string;
  killerName: string;
  killerPlatform?: string;
  victimId: string;
  victimName: string;
  victimPlatform?: string;
  timestamp: number;
}

interface BoxState {
  id: string;
  hp: number;
  isDestroyed: boolean;
}

interface MatchRoom {
  id: string;
  createdAt: number;
  status: 'waiting' | 'countdown' | 'in_game' | 'finished';
  countdownStart?: number;
  gameStartTime?: number;
  mapSeed: number;
  players: QueuedPlayer[];
  deterministicBots: QueuedPlayer[];
  playerStates: Map<string, RemotePlayerSync>;
  botStates: Map<string, any>;
  projectilesQueue: ProjectileEvent[];
  damageQueue: DamageEvent[];
  kills: KillEvent[];
  boxStates: Map<string, BoxState>;
  collectedItems: Set<string>;
}

const BOT_NAME_POOL = [
  'StarShooter_IT',
  'El_Pro_77',
  'ShadowNinja',
  'Phoenix_X',
  'ViperKing',
  'SuperBrawler',
  'ToxicCrow',
  'ApexPredator',
  'GigaChad',
  'GoldenStar',
  'MegaKnight',
  'GhostRider',
];

const BOT_BRAWLER_POOL = ['blaze', 'viper', 'titan', 'raven', 'harmony'];
const BOT_PLATFORM_POOL = ['mobile', 'pc', 'tablet'];

let activeQueue: QueuedPlayer[] = [];
let currentOpenRoom: MatchRoom = createNewRoom();
const activeMatches = new Map<string, MatchRoom>();

function generateDeterministicBots(humanCount: number): QueuedPlayer[] {
  const bots: QueuedPlayer[] = [];
  const needed = Math.max(0, 10 - humanCount);
  for (let i = 0; i < needed; i++) {
    const spawnIndex = humanCount + i;
    const name = BOT_NAME_POOL[i % BOT_NAME_POOL.length];
    const brawlerId = BOT_BRAWLER_POOL[i % BOT_BRAWLER_POOL.length];
    const platform = BOT_PLATFORM_POOL[i % BOT_PLATFORM_POOL.length];
    bots.push({
      id: `bot_synced_${spawnIndex}`,
      name: `${name} [BOT]`,
      brawlerId,
      trophies: 250 + i * 40,
      platform,
      joinedAt: Date.now(),
      lastPing: Date.now(),
      spawnIndex,
      isBot: true,
    });
  }
  return bots;
}

function createNewRoom(customId?: string): MatchRoom {
  const roomCode = customId || `CS-${Math.floor(1000 + Math.random() * 9000)}`;
  const room: MatchRoom = {
    id: roomCode,
    createdAt: Date.now(),
    status: 'waiting',
    mapSeed: 4281,
    players: [],
    deterministicBots: [],
    playerStates: new Map(),
    botStates: new Map(),
    projectilesQueue: [],
    damageQueue: [],
    kills: [],
    boxStates: new Map(),
    collectedItems: new Set(),
  };
  return room;
}

// Cleanup inactive players & expired matches
setInterval(() => {
  const now = Date.now();
  // Clean queue
  activeQueue = activeQueue.filter((p) => now - p.lastPing < 8000);

  // Clean stale matches older than 20 minutes
  for (const [roomId, room] of activeMatches.entries()) {
    if (now - room.createdAt > 20 * 60 * 1000) {
      activeMatches.delete(roomId);
    }
  }
}, 3000);

// --- MATCHMAKING ENDPOINTS ---

app.post('/api/matchmaking/join', (req, res) => {
  const { id, name, brawlerId, trophies, platform, requestedRoomId } = req.body;
  if (!id) {
    res.status(400).json({ error: 'Missing player ID' });
    return;
  }

  const now = Date.now();
  let targetRoom: MatchRoom;

  if (requestedRoomId && requestedRoomId.trim()) {
    const reqId = requestedRoomId.trim().toUpperCase();
    let existing = activeMatches.get(reqId);
    if (!existing) {
      existing = createNewRoom(reqId);
      activeMatches.set(reqId, existing);
    }
    targetRoom = existing;
  } else {
    // Quick match room
    if (currentOpenRoom.players.length >= 10 || currentOpenRoom.status === 'in_game') {
      activeMatches.set(currentOpenRoom.id, currentOpenRoom);
      currentOpenRoom = createNewRoom();
    }
    targetRoom = currentOpenRoom;
    activeMatches.set(targetRoom.id, targetRoom);
  }

  let player = targetRoom.players.find((p) => p.id === id);

  if (!player) {
    const spawnIndex = targetRoom.players.length;
    player = {
      id,
      name: name || 'Brawler',
      brawlerId: brawlerId || 'blaze',
      trophies: Number(trophies) || 0,
      platform: platform || 'mobile',
      joinedAt: now,
      lastPing: now,
      assignedRoomId: targetRoom.id,
      spawnIndex,
      isBot: false,
    };
    targetRoom.players.push(player);
    activeQueue.push(player);
  } else {
    player.lastPing = now;
    player.name = name;
    player.brawlerId = brawlerId;
    player.trophies = trophies;
    player.platform = platform;
  }

  // If 2 or more real players join, trigger synchronized countdown
  if (targetRoom.players.length >= 2 && targetRoom.status === 'waiting') {
    targetRoom.status = 'countdown';
    targetRoom.countdownStart = now;
    targetRoom.gameStartTime = now + 4000; // 4s countdown
    targetRoom.deterministicBots = generateDeterministicBots(targetRoom.players.length);
  }

  const countdownRemaining = targetRoom.gameStartTime
    ? Math.max(0, Math.ceil((targetRoom.gameStartTime - now) / 1000))
    : null;

  res.json({
    success: true,
    count: targetRoom.players.length,
    players: targetRoom.players,
    roomId: targetRoom.id,
    spawnIndex: player.spawnIndex,
    status: targetRoom.status,
    countdownRemaining,
    gameStartTime: targetRoom.gameStartTime,
    deterministicBots: targetRoom.deterministicBots,
  });
});

app.post('/api/matchmaking/ping', (req, res) => {
  const { id, roomId } = req.body;
  const now = Date.now();

  let targetRoom = roomId ? activeMatches.get(roomId) : undefined;
  if (!targetRoom) {
    const p = activeQueue.find((q) => q.id === id);
    if (p?.assignedRoomId) {
      targetRoom = activeMatches.get(p.assignedRoomId) || currentOpenRoom;
    } else {
      targetRoom = currentOpenRoom;
    }
  }

  const player = targetRoom.players.find((p) => p.id === id);
  if (player) {
    player.lastPing = now;
  }

  // Auto-start countdown if player has been alone in waiting room for >= 6 seconds
  if (targetRoom.status === 'waiting' && targetRoom.players.length >= 1) {
    const waitTime = now - targetRoom.players[0].joinedAt;
    if (waitTime >= 6000) {
      targetRoom.status = 'countdown';
      targetRoom.countdownStart = now;
      targetRoom.gameStartTime = now + 3500;
      targetRoom.deterministicBots = generateDeterministicBots(targetRoom.players.length);
    }
  }

  // Check if countdown completed
  if (targetRoom.status === 'countdown' && targetRoom.gameStartTime && now >= targetRoom.gameStartTime) {
    targetRoom.status = 'in_game';
  }

  const countdownRemaining = targetRoom.gameStartTime
    ? Math.max(0, Math.ceil((targetRoom.gameStartTime - now) / 1000))
    : null;

  res.json({
    success: true,
    count: targetRoom.players.length,
    players: targetRoom.players,
    roomId: targetRoom.id,
    spawnIndex: player?.spawnIndex ?? 0,
    status: targetRoom.status,
    countdownRemaining,
    gameStartTime: targetRoom.gameStartTime,
    deterministicBots: targetRoom.deterministicBots,
  });
});

app.post('/api/matchmaking/start-now', (req, res) => {
  const { roomId } = req.body;
  const now = Date.now();
  const room = activeMatches.get(roomId) || currentOpenRoom;
  if (room && room.status !== 'in_game') {
    room.status = 'countdown';
    room.countdownStart = now;
    room.gameStartTime = now + 1200; // Immediate 1s countdown
    room.deterministicBots = generateDeterministicBots(room.players.length);
  }
  res.json({ success: true, gameStartTime: room.gameStartTime });
});

app.post('/api/matchmaking/leave', (req, res) => {
  const { id, roomId } = req.body;
  activeQueue = activeQueue.filter((p) => p.id !== id);
  if (roomId) {
    const room = activeMatches.get(roomId);
    if (room) {
      room.players = room.players.filter((p) => p.id !== id);
    }
  }
  currentOpenRoom.players = currentOpenRoom.players.filter((p) => p.id !== id);
  res.json({ success: true });
});

// --- REAL-TIME MULTIPLAYER MATCH STATE SYNCHRONIZATION ---

app.post('/api/match/sync', (req, res) => {
  const {
    roomId,
    playerId,
    name,
    brawlerId,
    platform,
    x,
    y,
    rotation,
    hp,
    maxHp,
    ammo,
    powerCubes,
    isAlive,
    isMoving,
    walkCycle,
    hitFlash,
    newProjectiles,
    damageEvents,
    killEvents,
    destroyedBoxes,
    collectedItems,
    isHost,
    botStates,
  } = req.body;

  if (!roomId || !playerId) {
    res.status(400).json({ error: 'Missing roomId or playerId' });
    return;
  }

  let room = activeMatches.get(roomId);
  if (!room && currentOpenRoom.id === roomId) {
    room = currentOpenRoom;
    activeMatches.set(roomId, room);
  }

  if (!room) {
    room = createNewRoom(roomId);
    room.status = 'in_game';
    activeMatches.set(roomId, room);
  }

  const now = Date.now();

  // 1. Update this player's position & vitals
  room.playerStates.set(playerId, {
    id: playerId,
    name: name || 'Player',
    brawlerId: brawlerId || 'blaze',
    platform: platform || 'mobile',
    x: Number(x) || 0,
    y: Number(y) || 0,
    rotation: Number(rotation) || 0,
    hp: Number(hp) || 0,
    maxHp: Number(maxHp) || 4000,
    ammo: Number(ammo) || 3,
    powerCubes: Number(powerCubes) || 0,
    isAlive: Boolean(isAlive),
    isMoving: Boolean(isMoving),
    walkCycle: Number(walkCycle) || 0,
    hitFlash: Boolean(hitFlash),
    lastUpdate: now,
  });

  // 2. Queue any new projectiles fired
  if (Array.isArray(newProjectiles) && newProjectiles.length > 0) {
    for (const p of newProjectiles) {
      room.projectilesQueue.push({
        ...p,
        ownerId: playerId,
        timestamp: now,
      });
    }
  }

  // 3. Queue damage events dealt
  if (Array.isArray(damageEvents) && damageEvents.length > 0) {
    for (const d of damageEvents) {
      room.damageQueue.push({
        ...d,
        attackerId: playerId,
        timestamp: now,
      });
    }
  }

  // 4. Queue kills
  if (Array.isArray(killEvents) && killEvents.length > 0) {
    for (const k of killEvents) {
      if (!room.kills.some((existing) => existing.id === k.id)) {
        room.kills.push(k);
      }
    }
  }

  // 5. Sync destroyed boxes
  if (Array.isArray(destroyedBoxes) && destroyedBoxes.length > 0) {
    for (const boxId of destroyedBoxes) {
      room.boxStates.set(boxId, { id: boxId, hp: 0, isDestroyed: true });
    }
  }

  // 6. Sync collected items (cubes, powerups)
  if (Array.isArray(collectedItems) && collectedItems.length > 0) {
    for (const itemId of collectedItems) {
      room.collectedItems.add(itemId);
    }
  }

  // 7. Host updates authoritative bot states
  if (isHost && Array.isArray(botStates)) {
    for (const bot of botStates) {
      room.botStates.set(bot.id, {
        ...bot,
        lastUpdate: now,
      });
    }
  }

  // Clean old queued events
  room.projectilesQueue = room.projectilesQueue.filter((p) => now - p.timestamp < 3500);
  room.damageQueue = room.damageQueue.filter((d) => now - d.timestamp < 3500);

  // Gather other players currently in the room
  const otherPlayers: RemotePlayerSync[] = [];
  for (const [id, state] of room.playerStates.entries()) {
    if (id !== playerId && now - state.lastUpdate < 6000) {
      otherPlayers.push(state);
    }
  }

  // Return fresh projectiles from other players
  const remoteProjectiles = room.projectilesQueue.filter(
    (p) => p.ownerId !== playerId && now - p.timestamp < 1200
  );

  // Return damage events directed at this player or damage events in general
  const relevantDamage = room.damageQueue.filter(
    (d) => (d.targetId === playerId || d.targetId.startsWith('bot_')) && now - d.timestamp < 1200
  );

  // Return bot states synced by host (for non-hosts)
  const syncedBots = !isHost ? Array.from(room.botStates.values()) : [];

  res.json({
    success: true,
    serverTime: now,
    otherPlayers,
    remoteProjectiles,
    relevantDamage,
    kills: room.kills.slice(-6),
    destroyedBoxes: Array.from(room.boxStates.keys()),
    collectedItems: Array.from(room.collectedItems),
    syncedBots,
  });
});

// Mount Vite middleware in development
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false, // Disables HMR WebSocket client in preview iframe
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Clash Stars Server running on http://0.0.0.0:${PORT}`);
});
