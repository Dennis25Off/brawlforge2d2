// Multiplayer client service for WebSocket real-time communication

type MessageListener = (data: any) => void;

class MultiplayerService {
  private ws: WebSocket | null = null;
  private listeners: Set<MessageListener> = new Set();
  private isConnecting: boolean = false;
  private playerId: string = '';
  private currentRoomId: string | null = null;
  private reconnectTimeout: any = null;

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        console.log('[Multiplayer] Connected to game server');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'WELCOME') {
            this.playerId = data.playerId;
          }
          this.listeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error('[Multiplayer] Failed to parse message', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;
        // Auto-reconnect after 3 seconds
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('[Multiplayer] WebSocket error', err);
      };
    } catch (e) {
      this.isConnecting = false;
      console.warn('[Multiplayer] Could not connect to WS server', e);
    }
  }

  public addListener(listener: MessageListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public joinQueue(mode: '1v1' | 'ffa', profile: { name: string; character: any }) {
    this.send({
      type: 'JOIN_QUEUE',
      mode,
      name: profile.name,
      character: profile.character,
    });
  }

  public cancelQueue() {
    this.send({ type: 'CANCEL_QUEUE' });
  }

  public startInstantBotMatch(mode: '1v1' | 'ffa', profile: { name: string; character: any }, stageId?: string) {
    this.send({
      type: 'INSTANT_BOT_MATCH',
      mode,
      name: profile.name,
      character: profile.character,
      stageId,
    });
  }

  public createCustomRoom(code: string, mode: '1v1' | 'ffa', profile: { name: string; character: any }) {
    this.send({
      type: 'CREATE_CUSTOM_ROOM',
      code,
      mode,
      name: profile.name,
      character: profile.character,
    });
  }

  public joinCustomRoom(code: string, profile: { name: string; character: any }) {
    this.send({
      type: 'JOIN_CUSTOM_ROOM',
      code,
      name: profile.name,
      character: profile.character,
    });
  }

  public forceStartRoom() {
    this.send({ type: 'FORCE_START_ROOM' });
  }

  public sendPlayerSync(state: any) {
    this.send({
      type: 'PLAYER_SYNC',
      state,
    });
  }

  public sendAttackHit(targetId: string, damage: number, knockback: any, attackType: string, position: any) {
    this.send({
      type: 'ATTACK_HIT',
      targetId,
      damage,
      knockback,
      attackType,
      position,
    });
  }

  public sendPlayerKO(victimId: string, killerId: string, remainingStocks: number) {
    this.send({
      type: 'PLAYER_KO',
      victimId,
      killerId,
      remainingStocks,
    });
  }

  public sendEmote(emote: string) {
    this.send({
      type: 'EMOTE',
      emote,
    });
  }

  public getPlayerId(): string {
    return this.playerId;
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const multiplayer = new MultiplayerService();
