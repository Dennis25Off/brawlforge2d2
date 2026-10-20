import React from 'react';
import { Settings, Gamepad2, Volume2, X } from 'lucide-react';

// Definizione dei tipi per le Props del Modal
interface SettingsModalProps {
  onClose: () => void;
  openControls: () => void;
  openAudio: () => void;
}

export default function SettingsModal({ onClose, openControls, openAudio }: SettingsModalProps) {
  return (
    /* Sfondo oscurato con sfocatura */
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      
      {/* Contenitore principale */}
      <div className="bg-zinc-900 text-white p-6 rounded-xl w-85 max-w-sm relative border border-zinc-800 shadow-2xl">
        
        {/* Pulsante di chiusura (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          title="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Intestazione con Icona Rotella Animata */}
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-amber-400 animate-[spin_8s_linear_infinite]" />
          <h2 className="text-xl font-bold tracking-wide">Impostazioni</h2>
        </div>

        {/* Lista dei Pulsanti Opzione */}
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
            <span className="text-zinc-500 text-xs group-hover:text-zinc-300 transition-colors">WASD & Touch</span>
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
            <span className="text-zinc-500 text-xs group-hover:text-zinc-300 transition-colors">Volume & Suoni</span>
          </button>

        </div>

      </div>
    </div>
  );
}
