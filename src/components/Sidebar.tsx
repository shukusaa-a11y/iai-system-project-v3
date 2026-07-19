import { motion } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Wallet, FolderKanban,
  Zap, Settings, LogOut, X, Mic,
} from 'lucide-react';
import type { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatEnergy, energyColor, energyBarColor } from '../lib/energy';

interface SidebarProps {
  current: Page;
  onNavigate: (p: Page) => void;
  open: boolean;
  onClose: () => void;
}

const NAV: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', label: 'Assistant IA', icon: MessageSquare },
  { id: 'live', label: 'Mode Live', icon: Mic },
  { id: 'wallet', label: 'Énergie', icon: Wallet },
  { id: 'projects', label: 'Projets', icon: FolderKanban },
  { id: 'automations', label: 'Automatisations', icon: Zap },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export default function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { energy } = useApp();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed lg:static z-40 h-full w-[260px] flex flex-col bg-brand-900/60 backdrop-blur-2xl border-r border-white/[0.06]"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <img src="/file_000000005d2c7243b572cb8771032a9b.png" alt="IAI System" className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10" />
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-tight">IAI SYSTEM</p>
              <p className="text-[10px] text-slate-500 leading-tight font-medium tracking-widest">PROJECT</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-4 mb-4 p-3 rounded-xl bg-brand-800/40 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="label-xs">Énergie</span>
            <span className={`text-sm font-bold ${energyColor(energy)}`}>{formatEnergy(energy)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-brand-950/80 overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min(100, energy)}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${energyBarColor(energy)}`}
            />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative ${
                  active ? 'text-white bg-accent-500/10 border border-accent-500/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
                {active && <motion.div layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03] transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-brand-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-medium">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button onClick={signOut} className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
