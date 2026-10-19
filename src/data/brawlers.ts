import { BrawlerDef, BrawlerId } from '../types/game';

export const BRAWLERS: Record<BrawlerId, BrawlerDef> = {
  blaze: {
    id: 'blaze',
    name: 'Blaze',
    title: 'Il Pistogliero Rapido',
    role: 'Tiratore Scelto',
    description: 'Spara raffiche precise di proiettili a lunghissima gittata. La sua Super demolisce ripari e nemici.',
    color: '#ef4444',
    themeGradient: 'from-amber-500 via-red-500 to-rose-600',
    badgeColor: '#ef4444',
    
    baseHp: 4200,
    speed: 3.4, // Fast shooter (+ passive increases it further)
    reloadTime: 1.5,
    maxAmmo: 3,
    attackRange: 520,
    attackSpread: 0.08,
    attackDamage: 520, // 6 x 520 = 3120 damage if all hit!
    bulletCount: 6,
    bulletSpeed: 15,
    bulletRadius: 6,
    bulletType: 'bullet',
    superChargePerHit: 9, // ~12 hits to charge Super
    
    superName: 'Raffica Devastante',
    superDesc: 'Scatena 12 colpi pesanti perforanti che distruggono le pareti e trapassano ogni nemico.',
    superRange: 600,
    superRadius: 9,
    superDamage: 640,
    superType: 'barrage',

    passiveName: 'Stivali Celesti',
    passiveDesc: 'Aumenta permanentemente la velocità di movimento del +18%. Nessuno può sfuggirgli.',

    gadgetName: 'Ricarica Rapida',
    gadgetDesc: 'Ricarica istantaneamente 2 barre di munizioni per continuare a fare fuoco a raffica.',

    avatarEmoji: '🤠',
    quote: 'Troppo veloce per voi!',
  },

  viper: {
    id: 'viper',
    name: 'Viper',
    title: 'La Regina del Fucile',
    role: 'Assaltatore',
    description: 'Il suo fucile a pompa devasta a distanza ravvicinata. La sua Super sfonda ogni ostacolo e respinge.',
    color: '#a855f7',
    themeGradient: 'from-purple-500 via-indigo-600 to-blue-700',
    badgeColor: '#a855f7',
    
    baseHp: 5600,
    speed: 3.0,
    reloadTime: 1.6,
    maxAmmo: 3,
    attackRange: 420,
    attackSpread: 0.38, // Wide shotgun spread
    attackDamage: 540, // 5 pellets x 540 = 2700 max close range
    bulletCount: 5,
    bulletSpeed: 13,
    bulletRadius: 7,
    bulletType: 'shotgun',
    superChargePerHit: 12, // Charges quickly at point blank
    
    superName: 'Super Calibro',
    superDesc: 'Un colpo devastante che spazza via coperture, nemici e respinge violentemente all\'indietro.',
    superRange: 460,
    superRadius: 12,
    superDamage: 720,
    superType: 'blast',

    passiveName: 'Cerotto Vitale',
    passiveDesc: 'Quando la vita scende sotto il 35%, rigenera immediatamente 2.400 HP (ricarica 25s).',

    gadgetName: 'Scatto Tattico',
    gadgetDesc: 'Esegue un balzo fulmineo in avanti eludendo il fuoco nemico.',

    avatarEmoji: '💜',
    quote: 'Boom, baby!',
  },

  titan: {
    id: 'titan',
    name: 'Titan',
    title: 'Il Lottatore Supremo',
    role: 'Colosso',
    description: 'Una montagna di muscoli indistruttibile. Salta in alto e atterra con la violenza di un meteorite.',
    color: '#3b82f6',
    themeGradient: 'from-blue-500 via-sky-600 to-cyan-500',
    badgeColor: '#3b82f6',
    
    baseHp: 8600,
    speed: 3.1,
    reloadTime: 1.1,
    maxAmmo: 3,
    attackRange: 260,
    attackSpread: 0.15,
    attackDamage: 680, // 4 punches x 680 = 2720
    bulletCount: 4,
    bulletSpeed: 16,
    bulletRadius: 10,
    bulletType: 'punch',
    superChargePerHit: 16, // charges quickly in melee or when taking damage
    
    superName: 'Meteora Vivente',
    superDesc: 'Salta nei cieli e si schianta al suolo, provocando 3.000 danni ad area e distruggendo ogni riparo.',
    superRange: 550,
    superRadius: 120, // Huge AoE crater
    superDamage: 3000,
    superType: 'leap',

    passiveName: 'Furia Bruciante',
    passiveDesc: 'I colpi della Super e i pugni incendiano i nemici, infliggendo 750 danni da fuoco nel tempo.',

    gadgetName: 'Onda Sismica',
    gadgetDesc: 'Batte i pugni a terra generando un\'onda d\'urto circolare che rallenta i nemici vicini per 3s.',

    avatarEmoji: '🥊',
    quote: 'Nessuno ferma Titan!',
  },

  raven: {
    id: 'raven',
    name: 'Raven',
    title: 'L\'Assassino Tossico',
    role: 'Assassino Tossico',
    description: 'Lancia pugnali impregnati di veleno che bloccano la rigenerazione nemica e ne erodono la vita.',
    color: '#eab308',
    themeGradient: 'from-amber-400 via-yellow-500 to-orange-600',
    badgeColor: '#eab308',
    
    baseHp: 3800,
    speed: 3.5, // Very high natural agility
    reloadTime: 1.3,
    maxAmmo: 3,
    attackRange: 500,
    attackSpread: 0.28,
    attackDamage: 620, // 3 daggers + poison damage over time
    bulletCount: 3,
    bulletSpeed: 17,
    bulletRadius: 5,
    bulletType: 'poison',
    superChargePerHit: 10,
    
    superName: 'Salto del Corvo',
    superDesc: 'Spicca il volo lanciando una tempesta di 14 pugnali sia al decollo che all\'atterraggio.',
    superRange: 520,
    superRadius: 7,
    superDamage: 580,
    superType: 'daggers',

    passiveName: 'Tossina Indebolente',
    passiveDesc: 'Il veleno corrompe i bersagli: i nemici intossicati infliggono il -25% di danni.',

    gadgetName: 'Scudo d\'Ombra',
    gadgetDesc: 'Attiva una barriera piumata che assorbe il 50% di tutti i danni subiti per 3.5 secondi.',

    avatarEmoji: '🦅',
    quote: 'Non senti il bruciore?',
  },

  harmony: {
    id: 'harmony',
    name: 'Harmony',
    title: 'Il Trovatore Sonico',
    role: 'Supporto Sonico',
    description: 'Emette travolgenti onde musicali che attraversano i nemici. La sua Super ripristina istantaneamente la salute.',
    color: '#10b981',
    themeGradient: 'from-emerald-400 via-teal-500 to-green-600',
    badgeColor: '#10b981',
    
    baseHp: 5800,
    speed: 3.0,
    reloadTime: 1.5,
    maxAmmo: 3,
    attackRange: 450,
    attackSpread: 0.55, // Very wide penetrating acoustic cone
    attackDamage: 1100, // Pierces all enemies
    bulletCount: 1,
    bulletSpeed: 12,
    bulletRadius: 28, // Wide sonic crescent
    bulletType: 'sonic',
    superChargePerHit: 22, // ~5 hits to charge full heal super
    
    superName: 'Canto dell\'Anima',
    superDesc: 'Suona un accordo melodico supremo che cura se stesso di ben 3.800 HP e scuote i nemici vicini.',
    superRange: 500,
    superRadius: 36,
    superDamage: 800,
    superType: 'heal_wave',

    passiveName: 'Da Capo',
    passiveDesc: 'Ogni volta che colpisce un nemico con un attacco base, Harmony recupera 450 HP di salute.',

    gadgetName: 'Risonanza Protettiva',
    gadgetDesc: 'Rimuove istantaneamente ogni effetto negativo (veleno/bruciatura) e rigenera 1.200 HP.',

    avatarEmoji: '🎸',
    quote: 'La musica salverà tutti!',
  },
};

export const BRAWLER_LIST = Object.values(BRAWLERS);
