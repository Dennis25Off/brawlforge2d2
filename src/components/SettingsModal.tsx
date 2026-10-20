import React, { useState, useEffect } from 'react';
import { Settings, Gamepad2, Volume2, X, Maximize2, Minimize2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton'; // Spostato qui l'import

interface SettingsModalProps {
  onClose: () => void;
  openControls: () => void;
  openAudio: () => void;
}

export function SettingsModal({ onClose, openControls, openAudio }: SettingsModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // Monitora se l'utente cambia lo stato del fullscreen (es. premendo F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Errore attivazione schermo intero: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 text-white p-6 rounded-xl w-85 max-w-sm relative border border-zinc-800 shadow-2xl">
        
        {/* Pulsante di chiusura (X) */}
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Intestazione */}
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-amber-400 animate-[spin_8s_linear_infinite]" />
          <h2 className="text-xl font-bold tracking-wide">Impostazioni</h2>
        </div>

        {/* Lista Opzioni */}
        <div className="flex flex-col gap-3">
          
          {/* Opzione 1: Mappatura Comandi */}
          <button 
            onClick={openControls}
            className="flex items-center justify-between w-full bg-zinc-800/60 hover:bg-zinc-800 p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600 text-left transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Mappatura Comandi</span>
            </div>
            <span className="text-zinc-500 text-xs">WASD & Touch</span>
          </button>

          {/* Opzione 2: Opzioni Audio */}
          <button 
            onClick={openAudio}
            className="flex items-center justify-between w-full bg-zinc-800/60 hover:bg-zinc-800 p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600 text-left transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Opzioni Audio</span>
            </div>
            <span className="text-zinc-500 text-xs">Attiva/Disattiva</span>
          </button>

          {/* Opzione 3: Schermo Intero (Fullscreen) */}
          <button 
            onClick={toggleFullscreen}
            className="flex items-center justify-between w-full bg-zinc-800/60 hover:bg-zinc-800 p-3 rounded-lg border border-zinc-700/50 hover:border-zinc-600 text-left transition-all group"
          >
            <div className="flex items-center gap-2.5">
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Maximize2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="font-medium text-sm">Schermo Intero</span>
            </div>
            <span className="text-zinc-500 text-xs">{isFullscreen ? 'Disattiva' : 'Attiva'}</span>
          </button>

          {/* Opzione 4: Download / Installa App (Rendiamo il tuo componente un elemento della lista) */}
          <div className="w-full *.w-full *.justify-between *.bg-zinc-800\/60 *.hover:bg-zinc-800 *.p-3 *.rounded-lg *.border *.border-zinc-700\/50 *.text-left *.transition-all">
            <PWAInstallButton />
          </div>

        </div>
      </div>
    </div>
  );
}
