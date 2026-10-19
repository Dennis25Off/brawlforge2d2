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

interface QueuedPlayer {
  id: string;
  name: string;
  brawlerId: string;
  trophies: number;
  platform: string;
  joinedAt: number;
  lastPing: number;
}

let activeQueue: QueuedPlayer[] = [];

// Cleanup inactive players after 8 seconds of no ping
setInterval(() => {
  const now = Date.now();
  activeQueue = activeQueue.filter((p) => now - p.lastPing < 8000);
}, 2000);

// Join or register in the live matchmaking queue
app.post('/api/matchmaking/join', (req, res) => {
  const { id, name, brawlerId, trophies, platform } = req.body;
  if (!id) {
    res.status(400).json({ error: 'Missing player ID' });
    return;
  }

  const now = Date.now();
  const existingIdx = activeQueue.findIndex((p) => p.id === id);

  if (existingIdx >= 0) {
    activeQueue[existingIdx] = {
      id,
      name,
      brawlerId,
      trophies,
      platform,
      joinedAt: activeQueue[existingIdx].joinedAt,
      lastPing: now,
    };
  } else {
    activeQueue.push({
      id,
      name,
      brawlerId,
      trophies,
      platform,
      joinedAt: now,
      lastPing: now,
    });
  }

  res.json({ success: true, count: activeQueue.length, players: activeQueue });
});

// Keepalive ping while in matchmaking
app.post('/api/matchmaking/ping', (req, res) => {
  const { id } = req.body;
  const now = Date.now();
  const player = activeQueue.find((p) => p.id === id);
  if (player) {
    player.lastPing = now;
  }
  res.json({ success: true, count: activeQueue.length, players: activeQueue });
});

// Leave queue
app.post('/api/matchmaking/leave', (req, res) => {
  const { id } = req.body;
  activeQueue = activeQueue.filter((p) => p.id !== id);
  res.json({ success: true });
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
