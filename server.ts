import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = http.createServer(app);

app.use(express.json());

// In-memory Leaderboard
interface LeaderboardEntry {
  id: string;
  name: string;
  elo: number;
  wins: number;
  losses: number;
  kos: number;
  favoriteHero: string;
  avatarColor: string;
}

let leaderboard: LeaderboardEntry[] = [
  { id: 'lb_1', name: 'Valravn_King', elo: 2450, wins: 182, losses: 24, kos: 520, favoriteHero: 'valiant_knight', avatarColor: '#38bdf8' },
  { id: 'lb_2', name: 'CyberShadow', elo: 2310, wins: 154, losses: 38, kos: 432, favoriteHero: 'cyber_ninja', avatarColor: '#a855f7' },
  { id: 'lb_3', name: 'ThunderGrip', elo: 2190, wins: 140, losses: 45, kos: 395, favoriteHero: 'thunder_brawler', avatarColor: '#f59e0b' },
  { id: 'lb_4', name: 'NovaStrike', elo: 2050, wins: 118, losses: 50, kos: 310, favoriteHero: 'shadow_valkyrie', avatarColor: '#ec4899' },
  { id: 'lb_5', name: 'ApexGlitch', elo: 1980, wins: 95, losses: 42, kos: 278, favoriteHero: 'mecha_striker', avatarColor: '#10b981' },
  { id: 'lb_6', name: 'Solaris', elo: 1840, wins: 88, losses: 53, kos: 245, favoriteHero: 'valiant_knight', avatarColor: '#eab308' },
  { id: 'lb_7', name: 'SpecterX', elo: 1720, wins: 76, losses: 61, kos: 198, favoriteHero: 'cyber_ninja', avatarColor: '#6366f1' },
  { id: 'lb_8', name: 'IronClad', elo: 1650, wins: 64, losses: 58, kos: 170, favoriteHero: 'thunder_brawler', avatarColor: '#ef4444' },
];

app.get('/api/leaderboard', (_req, res) => {
  const sorted = [...leaderboard].sort((a, b) => b.elo - a.elo);
  res.json({ success: true, leaderboard: sorted });
});

app.post('/api/leaderboard', (req, res) => {
  const { name, won, kos = 0, hero = 'valiant_knight', color = '#38bdf8' } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name required' });
  }

  const existing = leaderboard.find(p => p.name.toLowerCase() === name.toLowerCase());
  const eloDelta = won ? 25 : -15;

  if (existing) {
    existing.elo = Math.max(1000, existing.elo + eloDelta);
    if (won) existing.wins += 1;
    else existing.losses += 1;
    existing.kos += kos;
    existing.favoriteHero = hero;
    existing.avatarColor = color;
  } else {
    leaderboard.push({
      id: `lb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      elo: Math.max(1000, 1200 + eloDelta),
      wins: won ? 1 : 0,
      losses: won ? 0 : 1,
      kos,
      favoriteHero: hero,
      avatarColor: color,
    });
  }

  // Keep top 50
  leaderboard.sort((a, b) => b.elo - a.elo);
  if (leaderboard.length > 50) {
    leaderboard = leaderboard.slice(0, 50);
  }

  res.json({ success: true, updatedPlayer: existing || leaderboard.find(p => p.name.toLowerCase() === name.toLowerCase()) });
});

// WebSocket Server & Multiplayer Rooms
const wss = new WebSocketServer({ noServer: true });

interface PlayerSession {
  ws: WebSocket;
  id: string;
  name: string;
  character: any;
  roomId?: string;
  ping: number;
}

interface Room {
  id: string;
  mode: '1v1' | 'ffa';
  players: Map<string, PlayerSession>;
  botCount: number;
  createdAt: number;
  gameStarted: boolean;
  stageId: string;
  seed: number;
  countdownTimer?: NodeJS.Timeout;
}

const sessions = new Map<WebSocket, PlayerSession>();
const rooms = new Map<string, Room>();
const matchmakingQueues: {
  '1v1': string[];
  'ffa': string[];
} = {
  '1v1': [],
  'ffa': [],
};

// Handle client messages
function broadcastToRoom(room: Room, message: any, excludeWs?: WebSocket) {
  const data = JSON.stringify(message);
  room.players.forEach(player => {
    if (player.ws !== excludeWs && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(data);
    }
  });
}

function startRoomGame(room: Room) {
  if (room.gameStarted) return;
  room.gameStarted = true;
  if (room.countdownTimer) {
    clearTimeout(room.countdownTimer);
    delete room.countdownTimer;
  }

  const playersList = Array.from(room.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    character: p.character,
    isBot: false,
  }));

  // If room needs bots (e.g., 1v1 needs 2 players total, ffa needs 4)
  const targetPlayers = room.mode === '1v1' ? 2 : 4;
  const neededBots = Math.max(0, targetPlayers - playersList.length);

  const botNames = ['RenJinrai', 'CyberVortex', 'IgnisBrawler', 'KageNinja', 'ValkyriePrime', 'MechaOmega'];
  const botHeroes = ['katana_ronin', 'valiant_knight', 'cyber_ninja', 'thunder_brawler', 'shadow_valkyrie', 'mecha_striker'];
  const botColors = ['#e11d48', '#ec4899', '#f97316', '#06b6d4', '#10b981', '#a855f7'];

  for (let i = 0; i < neededBots; i++) {
    playersList.push({
      id: `bot_${room.id}_${i + 1}`,
      name: botNames[i % botNames.length] + ' [BOT]',
      character: {
        heroId: botHeroes[i % botHeroes.length],
        color: botColors[i % botColors.length],
        weaponSkin: 'default',
        hat: 'horns',
        trail: 'fire',
      },
      isBot: true,
    });
  }

  broadcastToRoom(room, {
    type: 'MATCH_START',
    roomId: room.id,
    mode: room.mode,
    stageId: room.stageId,
    seed: room.seed,
    players: playersList,
    hostId: Array.from(room.players.keys())[0] || 'host',
  });
}

function checkAndFillRoomWithBots(room: Room) {
  if (room.gameStarted) return;
  startRoomGame(room);
}

function handleMatchmaking() {
  // Check 1v1 queue
  while (matchmakingQueues['1v1'].length >= 2) {
    const id1 = matchmakingQueues['1v1'].shift()!;
    const id2 = matchmakingQueues['1v1'].shift()!;
    createMatchedRoom('1v1', [id1, id2]);
  }

  // Check FFA queue
  while (matchmakingQueues['ffa'].length >= 4) {
    const ids = [
      matchmakingQueues['ffa'].shift()!,
      matchmakingQueues['ffa'].shift()!,
      matchmakingQueues['ffa'].shift()!,
      matchmakingQueues['ffa'].shift()!,
    ];
    createMatchedRoom('ffa', ids);
  }
}

function createMatchedRoom(mode: '1v1' | 'ffa', playerIds: string[]) {
  const roomId = 'match_' + Math.random().toString(36).substring(2, 8);
  const room: Room = {
    id: roomId,
    mode,
    players: new Map(),
    botCount: 0,
    createdAt: Date.now(),
    gameStarted: false,
    stageId: mode === '1v1' ? 'celestial_altar' : 'cyber_colosseum',
    seed: Math.floor(Math.random() * 100000),
  };

  rooms.set(roomId, room);

  playerIds.forEach(id => {
    for (const session of sessions.values()) {
      if (session.id === id) {
        session.roomId = roomId;
        room.players.set(id, session);
        session.ws.send(JSON.stringify({
          type: 'MATCH_FOUND',
          roomId,
          mode,
          playersCount: room.players.size,
          targetCount: mode === '1v1' ? 2 : 4,
        }));
      }
    }
  });

  // Short delay to allow screen transition, then start
  setTimeout(() => {
    startRoomGame(room);
  }, 1200);
}

wss.on('connection', (ws) => {
  const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
  const session: PlayerSession = {
    ws,
    id: playerId,
    name: 'Guerriero',
    character: {},
    ping: 0,
  };
  sessions.set(ws, session);

  ws.send(JSON.stringify({
    type: 'WELCOME',
    playerId,
  }));

  ws.on('message', (messageRaw) => {
    try {
      const msg = JSON.parse(messageRaw.toString());

      switch (msg.type) {
        case 'INIT_PROFILE': {
          session.name = msg.name || session.name;
          session.character = msg.character || {};
          break;
        }

        case 'JOIN_QUEUE': {
          const mode: '1v1' | 'ffa' = msg.mode === 'ffa' ? 'ffa' : '1v1';
          session.name = msg.name || session.name;
          session.character = msg.character || {};

          // Remove from previous queues
          matchmakingQueues['1v1'] = matchmakingQueues['1v1'].filter(id => id !== session.id);
          matchmakingQueues['ffa'] = matchmakingQueues['ffa'].filter(id => id !== session.id);

          matchmakingQueues[mode].push(session.id);

          ws.send(JSON.stringify({
            type: 'QUEUE_STATUS',
            status: 'searching',
            mode,
            queuePosition: matchmakingQueues[mode].length,
          }));

          handleMatchmaking();

          // Set a 30s timeout to fill with bot if still in queue!
          setTimeout(() => {
            const idx = matchmakingQueues[mode].indexOf(session.id);
            if (idx !== -1 && ws.readyState === WebSocket.OPEN) {
              matchmakingQueues[mode].splice(idx, 1);
              // Create room with this player and fill the rest with bots!
              const roomId = 'bot_match_' + Math.random().toString(36).substring(2, 8);
              const room: Room = {
                id: roomId,
                mode,
                players: new Map([[session.id, session]]),
                botCount: mode === '1v1' ? 1 : 3,
                createdAt: Date.now(),
                gameStarted: false,
                stageId: 'celestial_altar',
                seed: Math.floor(Math.random() * 100000),
              };
              rooms.set(roomId, room);
              session.roomId = roomId;

              ws.send(JSON.stringify({
                type: 'BOT_MATCH_FILLED',
                roomId,
                message: 'Nessun giocatore trovato in 30s. Aggiunti Bot intelligenti!',
              }));

              setTimeout(() => {
                startRoomGame(room);
              }, 1000);
            }
          }, 30000);
          break;
        }

        case 'INSTANT_BOT_MATCH': {
          // Immediately start a match with bots
          const mode: '1v1' | 'ffa' = msg.mode === 'ffa' ? 'ffa' : '1v1';
          session.name = msg.name || session.name;
          session.character = msg.character || {};

          matchmakingQueues['1v1'] = matchmakingQueues['1v1'].filter(id => id !== session.id);
          matchmakingQueues['ffa'] = matchmakingQueues['ffa'].filter(id => id !== session.id);

          const roomId = 'bot_quick_' + Math.random().toString(36).substring(2, 8);
          const room: Room = {
            id: roomId,
            mode,
            players: new Map([[session.id, session]]),
            botCount: mode === '1v1' ? 1 : 3,
            createdAt: Date.now(),
            gameStarted: false,
            stageId: msg.stageId || 'celestial_altar',
            seed: Math.floor(Math.random() * 100000),
          };
          rooms.set(roomId, room);
          session.roomId = roomId;

          startRoomGame(room);
          break;
        }

        case 'CANCEL_QUEUE': {
          matchmakingQueues['1v1'] = matchmakingQueues['1v1'].filter(id => id !== session.id);
          matchmakingQueues['ffa'] = matchmakingQueues['ffa'].filter(id => id !== session.id);
          ws.send(JSON.stringify({ type: 'QUEUE_STATUS', status: 'cancelled' }));
          break;
        }

        case 'CREATE_CUSTOM_ROOM': {
          const customCode = (msg.code || Math.random().toString(36).substring(2, 6)).toUpperCase();
          const mode: '1v1' | 'ffa' = msg.mode === 'ffa' ? 'ffa' : '1v1';
          session.name = msg.name || session.name;
          session.character = msg.character || {};

          const room: Room = {
            id: customCode,
            mode,
            players: new Map([[session.id, session]]),
            botCount: 0,
            createdAt: Date.now(),
            gameStarted: false,
            stageId: msg.stageId || 'celestial_altar',
            seed: Math.floor(Math.random() * 100000),
          };
          rooms.set(customCode, room);
          session.roomId = customCode;

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            roomId: customCode,
            mode,
            isHost: true,
            players: [{ id: session.id, name: session.name, character: session.character }],
          }));

          // Set 30s auto-fill countdown if requested
          room.countdownTimer = setTimeout(() => {
            if (!room.gameStarted && room.players.size < (room.mode === '1v1' ? 2 : 4)) {
              checkAndFillRoomWithBots(room);
            }
          }, 30000);
          break;
        }

        case 'JOIN_CUSTOM_ROOM': {
          const roomCode = (msg.code || '').toUpperCase();
          const targetRoom = rooms.get(roomCode);

          if (!targetRoom) {
            ws.send(JSON.stringify({ type: 'ROOM_ERROR', message: 'Stanza non trovata o scaduta.' }));
            return;
          }

          const maxPlayers = targetRoom.mode === '1v1' ? 2 : 4;
          if (targetRoom.players.size >= maxPlayers) {
            ws.send(JSON.stringify({ type: 'ROOM_ERROR', message: 'La stanza è piena.' }));
            return;
          }

          session.name = msg.name || session.name;
          session.character = msg.character || {};
          session.roomId = roomCode;
          targetRoom.players.set(session.id, session);

          // Broadcast player joined to room
          const playerList = Array.from(targetRoom.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            character: p.character,
          }));

          broadcastToRoom(targetRoom, {
            type: 'ROOM_UPDATE',
            roomId: roomCode,
            players: playerList,
          });

          // If room full, launch
          if (targetRoom.players.size >= maxPlayers) {
            startRoomGame(targetRoom);
          }
          break;
        }

        case 'FORCE_START_ROOM': {
          if (session.roomId && rooms.has(session.roomId)) {
            const room = rooms.get(session.roomId)!;
            startRoomGame(room);
          }
          break;
        }

        // Gameplay state sync: player movements, attacks, hit registration
        case 'PLAYER_SYNC': {
          if (session.roomId && rooms.has(session.roomId)) {
            const room = rooms.get(session.roomId)!;
            broadcastToRoom(room, {
              type: 'PLAYER_SYNC',
              playerId: session.id,
              state: msg.state,
            }, ws);
          }
          break;
        }

        case 'ATTACK_HIT': {
          if (session.roomId && rooms.has(session.roomId)) {
            const room = rooms.get(session.roomId)!;
            broadcastToRoom(room, {
              type: 'ATTACK_HIT',
              attackerId: session.id,
              targetId: msg.targetId,
              damage: msg.damage,
              knockback: msg.knockback,
              attackType: msg.attackType,
              position: msg.position,
            });
          }
          break;
        }

        case 'PLAYER_KO': {
          if (session.roomId && rooms.has(session.roomId)) {
            const room = rooms.get(session.roomId)!;
            broadcastToRoom(room, {
              type: 'PLAYER_KO',
              victimId: msg.victimId,
              killerId: msg.killerId,
              remainingStocks: msg.remainingStocks,
            });
          }
          break;
        }

        case 'EMOTE': {
          if (session.roomId && rooms.has(session.roomId)) {
            const room = rooms.get(session.roomId)!;
            broadcastToRoom(room, {
              type: 'EMOTE',
              playerId: session.id,
              emote: msg.emote,
            });
          }
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: msg.timestamp }));
          break;
        }
      }
    } catch (err) {
      console.error('Error handling ws message:', err);
    }
  });

  ws.on('close', () => {
    if (session.roomId && rooms.has(session.roomId)) {
      const room = rooms.get(session.roomId)!;
      room.players.delete(session.id);
      if (room.players.size === 0) {
        if (room.countdownTimer) clearTimeout(room.countdownTimer);
        rooms.delete(session.roomId);
      } else {
        broadcastToRoom(room, {
          type: 'PLAYER_LEFT',
          playerId: session.id,
        });
      }
    }

    matchmakingQueues['1v1'] = matchmakingQueues['1v1'].filter(id => id !== session.id);
    matchmakingQueues['ffa'] = matchmakingQueues['ffa'].filter(id => id !== session.id);
    sessions.delete(ws);
  });
});

// Upgrade handling for WebSockets
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/ws' || pathname === '/') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Setup Vite or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`BrawlForge server listening on port ${port}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
