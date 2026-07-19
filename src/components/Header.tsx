import { Search, Bell, Menu, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { formatEnergy, energyColor, energyBarColor } from '../lib/energy';

interface HeaderProps {
  onMenu: () => void;
  onSearch: (q: string) => void;
  searchQuery: string;
}

export default function Header({ onMenu, onSearch, searchQuery }: HeaderProps) {
  const { energy } = useApp();

  return (
    <header className="sticky top-0 z-20 px-4 lg:px-6 py-3.5 flex items-center gap-3 bg-brand-900/50 backdrop-blur-2xl border-b border-white/[0.06]">
      <button onClick={onMenu} className="lg:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5">
        <Menu className="w-5 h-5" />
      </button>
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher dans l'application..."
          className="input-base w-full pl-11"
        />
      </div>
      <div className="flex items-center gap-2.5">
        <div className="energy-badge">
          <Zap className="w-3.5 h-3.5" />
          <span className={energyColor(energy)}>{formatEnergy(energy)}</span>
        </div>
        <div className="hidden sm:block w-24">
          <div className="h-1 rounded-full bg-brand-950/80 overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min(100, energy)}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${energyBarColor(energy)}`}
            />
          </div>
        </div>
      </div>
      <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-slate-300 transition-colors">
        <Bell className="w-[18px] h-[18px]" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
      </button>
    </header>
  );
}
