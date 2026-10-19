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
  lastUpdate: number;
}

interface ProjectileEvent {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bulletType: string;
  color: string;
  radius: number;
  damage: number;
  isSuper: boolean;
  timestamp: number;
}

interface DamageEvent {
  id: string;
  attackerId: string;
  targetId: string;
  damage: number;
  timestamp: number;
}

interface KillEvent {
  id: string;
  killerId: string;
  killerName: string;
  victimId: string;
  victimName: string;
  timestamp: number;
}

interface MatchRoom {
  id: string;
  createdAt: number;
  status: 'waiting' | 'in_game' | 'finished';
  players: QueuedPlayer[];
  playerStates: Map<string, RemotePlayerSync>;
  projectilesQueue: ProjectileEvent[];
  damageQueue: DamageEvent[];
  kills: KillEvent[];
}

let activeQueue: QueuedPlayer[] = [];
let currentOpenRoom: MatchRoom = createNewRoom();
const activeMatches = new Map<string, MatchRoom>();

function createNewRoom(): MatchRoom {
  return {
    id: `cs_room_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
    status: 'waiting',
    players: [],
    playerStates: new Map(),
    projectilesQueue: [],
    damageQueue: [],
    kills: [],
  };
}

// Cleanup inactive players & expired matches
setInterval(() => {
  const now = Date.now();
  // Clean queue
  activeQueue = activeQueue.filter((p) => now - p.lastPing < 8000);

  // Clean stale matches older than 15 minutes
  for (const [roomId, room] of activeMatches.entries()) {
    if (now - room.createdAt > 15 * 60 * 1000) {
      activeMatches.delete(roomId);
    }
  }
}, 3000);

// --- MATCHMAKING ENDPOINTS ---

app.post('/api/matchmaking/join', (req, res) => {
  const { id, name, brawlerId, trophies, platform } = req.body;
  if (!id) {
    res.status(400).json({ error: 'Missing player ID' });
    return;
  }

  const now = Date.now();
  let player = activeQueue.find((p) => p.id === id);

  if (!player) {
    // Assign to current open room
    if (currentOpenRoom.players.length >= 10 || currentOpenRoom.status !== 'waiting') {
      activeMatches.set(currentOpenRoom.id, currentOpenRoom);
      currentOpenRoom = createNewRoom();
    }

    const spawnIndex = currentOpenRoom.players.length;
    player = {
      id,
      name,
      brawlerId,
      trophies,
      platform,
      joinedAt: now,
      lastPing: now,
      assignedRoomId: currentOpenRoom.id,
      spawnIndex,
    };
    activeQueue.push(player);
    currentOpenRoom.players.push(player);
  } else {
    player.lastPing = now;
    player.name = name;
    player.brawlerId = brawlerId;
    player.trophies = trophies;
    player.platform = platform;
  }

  // Find room for this player
  const targetRoom = player.assignedRoomId === currentOpenRoom.id
    ? currentOpenRoom
    : activeMatches.get(player.assignedRoomId || '') || currentOpenRoom;

  res.json({
    success: true,
    count: targetRoom.players.length,
    players: targetRoom.players,
    roomId: targetRoom.id,
    spawnIndex: player.spawnIndex,
  });
});

app.post('/api/matchmaking/ping', (req, res) => {
  const { id } = req.body;
  const now = Date.now();
  const player = activeQueue.find((p) => p.id === id);
  if (player) {
    player.lastPing = now;
  }

  const targetRoom = player?.assignedRoomId
    ? activeMatches.get(player.assignedRoomId) || currentOpenRoom
    : currentOpenRoom;

  res.json({
    success: true,
    count: targetRoom.players.length,
    players: targetRoom.players,
    roomId: targetRoom.id,
    spawnIndex: player?.spawnIndex ?? 0,
  });
});

app.post('/api/matchmaking/leave', (req, res) => {
  const { id } = req.body;
  activeQueue = activeQueue.filter((p) => p.id !== id);
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
    newProjectiles,
    damageEvents,
    killEvents,
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
    // Auto-create room if direct connection
    room = {
      id: roomId,
      createdAt: Date.now(),
      status: 'in_game',
      players: [],
      playerStates: new Map(),
      projectilesQueue: [],
      damageQueue: [],
      kills: [],
    };
    activeMatches.set(roomId, room);
  }

  const now = Date.now();

  // 1. Update this player's authoritative position & vitals
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
    lastUpdate: now,
  });

  // 2. Queue any new projectiles fired by this player
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

  // Clean old queued events older than 4 seconds
  room.projectilesQueue = room.projectilesQueue.filter((p) => now - p.timestamp < 3500);
  room.damageQueue = room.damageQueue.filter((d) => now - d.timestamp < 3500);

  // 5. Gather other players currently in the room
  const otherPlayers: RemotePlayerSync[] = [];
  for (const [id, state] of room.playerStates.entries()) {
    if (id !== playerId && now - state.lastUpdate < 6000) {
      otherPlayers.push(state);
    }
  }

  // Return fresh projectiles from other players
  const remoteProjectiles = room.projectilesQueue.filter(
    (p) => p.ownerId !== playerId && now - p.timestamp < 1000
  );

  // Return damage events directed at this player or from others
  const relevantDamage = room.damageQueue.filter(
    (d) => d.targetId === playerId && now - d.timestamp < 1200
  );

  res.json({
    success: true,
    serverTime: now,
    otherPlayers,
    remoteProjectiles,
    relevantDamage,
    kills: room.kills.slice(-5),
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
