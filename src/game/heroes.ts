import { HeroConfig, HeroId } from '../types/game';

export const HEROES: Record<HeroId, HeroConfig> = {
  // 1. REN JINRAI - MAESTRO DELL'IAIJUTSU (KATANA)
  katana_ronin: {
    id: 'katana_ronin',
    name: 'Ren Jinrai',
    title: 'Maestro dell\'Iaijutsu',
    description: 'Spadaccino errante con Katana Muramasa. Fendenti fulminei, onde taglienti a mezzaluna e contrattacco letale.',
    speed: 1.16,
    weight: 0.98,
    damageMult: 1.05,
    primaryColor: '#e11d48', // Crimson Red
    accentColor: '#facc15',  // Gold
    weaponType: 'katana',
    weaponName: 'Katana Muramasa',
    playstyle: 'Iaijutsu & Fendenti a Velocità del Suono',
    signatureName: 'Morte in un Respiro (Taglio Iai)',
    passiveDesc: 'Affilatezza Muramasa: Colpi a mezzaluna con portata estesa ed estrazione fulminea.',
    specialMoves: {
      neutral: {
        name: 'Vento Tagliente Muramasa',
        desc: 'Fendente aereo che scaglia una lama d\'energia volante a mezzaluna che viaggia su tutto lo schermo.',
        projectile: 'katana_wind',
      },
      side: {
        name: 'Shunpo Blink Strike',
        desc: 'Scatto istantaneo attraverso il bersaglio con un fendente invisibile e taglio ritardato.',
      },
      up: {
        name: 'Balzo della Gru del Tuono',
        desc: 'Vortice ascendente con la katana avvolta da petali di sakura che catapulta in alto e falcia i nemici.',
      },
      down: {
        name: 'Contrattacco Infallibile (Iai Parry)',
        desc: 'Assume la postura Iai: se colpito o a contatto, parata infallibile seguita da un letale fendente critico.',
      },
    },
  },

  // 2. SIR VANCE - CAVALIERE RUNICO (SPADONE & SCUDO)
  valiant_knight: {
    id: 'valiant_knight',
    name: 'Sir Vance',
    title: 'La Spada della Giustizia',
    description: 'Paladino della Luce armato di spadone sacro runico. Elevata stabilità, iper-armatura e baluardo difensivo.',
    speed: 1.0,
    weight: 1.08,
    damageMult: 1.0,
    primaryColor: '#38bdf8', // Neon Sky Blue
    accentColor: '#fbbf24',  // Gold
    weaponType: 'sword',
    weaponName: 'Spadone Runico dell\'Aurora',
    playstyle: 'Tank Pesante, Controllo dello Spazio & Poise',
    signatureName: 'Fendente Solare dell\'Alba',
    passiveDesc: 'Fermezza Sacra: I colpi pesanti e la carica hanno una forte resistenza all\'interruzione.',
    specialMoves: {
      neutral: {
        name: 'Onda di Luce Runica',
        desc: 'Scarica a terra o in aria un maestoso proiettile ad arco dorato sacro che spazza via i nemici.',
        projectile: 'holy_wave',
      },
      side: {
        name: 'Carica dello Scudo Paladino',
        desc: 'Scatta in avanti protetto da uno scudo solare con iper-armatura, travolgendo gli avversari.',
      },
      up: {
        name: 'Spirale Sacra dell\'Ascensione',
        desc: 'Rotazione aerea dello spadone carica di rune celesti che eleva il cavaliere e colpisce a 360°.',
      },
      down: {
        name: 'Aegis del Sole (Bastione Difensivo)',
        desc: 'Erigge una cupola sacra impenetrabile che respinge i nemici con un\'onda d\'urto dorata.',
      },
    },
  },

  // 3. KAGE-09 - CYBER NINJA (DOPPI PUGNALI AL PLASMA)
  cyber_ninja: {
    id: 'cyber_ninja',
    name: 'Kage-09',
    title: 'Spettro del Neo-Tokyo',
    description: 'Agilità fulminea, doppi pugnali al plasma. Combo aeree micidiali, shuriken al neon e mine olografiche.',
    speed: 1.25,
    weight: 0.85,
    damageMult: 0.95,
    primaryColor: '#a855f7', // Cyber Purple
    accentColor: '#06b6d4',  // Cyan
    weaponType: 'daggers',
    weaponName: 'Doppi Pugnali al Plasma X-09',
    playstyle: 'Agilità Estrema, Hit & Run e Shuriken al Neon',
    signatureName: 'Taglio Incrociato X-Slash',
    passiveDesc: 'Cyber-Overclock: Recupero rapido delle schivate ed elevata accelerazione aerea.',
    specialMoves: {
      neutral: {
        name: 'Shuriken Cibernetici Tripli',
        desc: 'Lancia istantaneamente 3 shuriken al plasma neon a ventaglio ad altissima velocità.',
        projectile: 'cyber_shuriken',
      },
      side: {
        name: 'Glitch Dash Tagliente',
        desc: 'Sfreccia in avanti in modalità glitch intangibile, squarciando con entrambi i pugnali al plasma.',
      },
      up: {
        name: 'Teletrasporto Quantico Aereo',
        desc: 'Scompare in una scarica di bit ciano e riappare in alto con un doppio montante laser.',
      },
      down: {
        name: 'Mina Olografica Glitch',
        desc: 'Piazza una trappola digitale olografica che esplode al passaggio dei nemici.',
        projectile: 'proximity_mine',
      },
    },
  },

  // 4. GROM THUNDERFIST - TITANO DELLE TEMPESTE (GUANTI D'ARMI)
  thunder_brawler: {
    id: 'thunder_brawler',
    name: 'Grom Thunderfist',
    title: 'Titano delle Tempeste',
    description: 'Guanti d\'armi carichi di fulmini. Knockback devastante ad alto danno, difficile da scalzare.',
    speed: 0.88,
    weight: 1.3,
    damageMult: 1.2,
    primaryColor: '#f59e0b', // Amber Lightning
    accentColor: '#ef4444',  // Crimson
    weaponType: 'gauntlets',
    weaponName: 'Guanti d\'Armi Sismici Mjolnir',
    playstyle: 'Brawler da Impatto, Knockback Brutale & Tuono',
    signatureName: 'Pugno Fracassa-Montagne',
    passiveDesc: 'Massa Titanica: Peso titanico che rende quasi impossibile essere scaraventato fuori a basso danno.',
    specialMoves: {
      neutral: {
        name: 'Sfera di Fulmini del Titano',
        desc: 'Incanala e scaglia una sfera elettrica crepitante che rotola sul palco e fulmina chi tocca.',
        projectile: 'thunder_orb',
      },
      side: {
        name: 'Pugno Missile del Tuono',
        desc: 'Si lancia in avanti a pugno teso propulso da scariche elettriche, impattando violentemente.',
      },
      up: {
        name: 'Montante dell\'Uragano',
        desc: 'Devastante montante elettrico verso il cielo che trascina l\'avversario nelle nubi temporalesche.',
      },
      down: {
        name: 'Schianto Sismico Elettrico',
        desc: 'Sbatte i guanti d\'armi al suolo scatenando due onde sismiche elettriche a destra e a sinistra.',
      },
    },
  },

  // 5. SHADOW VALKYRIE - FALCE DELL'ABISSO (SCYTHE)
  shadow_valkyrie: {
    id: 'shadow_valkyrie',
    name: 'Valkyria Nyx',
    title: 'Falce del Valhalla',
    description: 'Padrona dell\'aria armata di falce eterea. Controllo gravitazionale dello spazio e spike brutali.',
    speed: 1.08,
    weight: 0.95,
    damageMult: 1.05,
    primaryColor: '#ec4899', // Pink / Magenta
    accentColor: '#8b5cf6',  // Violet
    weaponType: 'scythe',
    weaponName: 'Falce Eterea dell\'Oblio',
    playstyle: 'Controllo aereo a distanza, Gancio & Risucchio di Vuoto',
    signatureName: 'Raffica dell\'Oblio Etereo',
    passiveDesc: 'Ali Eteree: Caduta fluttuante controllata e maggiore manovrabilità aerea.',
    specialMoves: {
      neutral: {
        name: 'Sfera dell\'Oblio Gravitazionale',
        desc: 'Evoca una sfera di vuoto violaceo che fluttua lentamente e risucchia i nemici vicini.',
        projectile: 'void_sphere',
      },
      side: {
        name: 'Mietitura delle Ali d\'Ombra',
        desc: 'Spiega maestose ali scure e plana in avanti uncinando con la falce chiunque trovi sul cammino.',
      },
      up: {
        name: 'Ascesa delle Ali Notturne',
        desc: 'Spiega le ali eteree e sale verso l\'alto falciando in un arco di luna magenta.',
      },
      down: {
        name: 'Vortice dell\'Abisso a 360°',
        desc: 'Fa roteare la falce spettrale attorno a sé formando una barriera di lame oscure che spinge via i nemici.',
      },
    },
  },

  // 6. MECHA STRIKER - ARTIGLIERIA PESANTE & JETPACK (BLASTER/CANNON)
  mecha_striker: {
    id: 'mecha_striker',
    name: 'Apex Cannon',
    title: 'Unità d\'Assalto 7',
    description: 'Cannone protonico, missili esplosivi e jetpack ausiliario. Pressione a distanza, laser e mine.',
    speed: 0.98,
    weight: 1.12,
    damageMult: 1.1,
    primaryColor: '#10b981', // Emerald
    accentColor: '#3b82f6',  // Blue
    weaponType: 'blaster',
    weaponName: 'Cannone Protonico & Jetpack T-700',
    playstyle: 'Zoner Tecnologico, Missili Homing & Fasci Laser',
    signatureName: 'Mega Raggio Annichilatore',
    passiveDesc: 'Jetpack Ausiliario: Propulsione extra nel salto e stabilità contro i rimbalzi orizzontali.',
    specialMoves: {
      neutral: {
        name: 'Missile Protonico Esplosivo',
        desc: 'Lancia un razzo balistico protonico ad alta velocità con scia di fumo che esplode all\'impatto.',
        projectile: 'proton_missile',
      },
      side: {
        name: 'Fascio Laser Protonico Continuo',
        desc: 'Spara un raggio laser continuo ad alta energia che attraversa l\'intero campo di battaglia.',
        projectile: 'laser_beam',
      },
      up: {
        name: 'Sovraccarico Jetpack Rocket',
        desc: 'Attiva i razzi del jetpack sparando fiamme ustionanti verso il basso e volando rapidamente in alto.',
      },
      down: {
        name: 'Mina Protonica da Prossimità',
        desc: 'Installa sul terreno una mina a sensore magnetico che deflagra violentemente quando calpestata.',
        projectile: 'proximity_mine',
      },
    },
  },
};

export const HERO_LIST = Object.values(HEROES);
