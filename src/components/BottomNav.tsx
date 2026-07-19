import { LayoutDashboard, FolderKanban, Plus, Sparkles, Menu as MenuIcon } from 'lucide-react';
import type { Page } from '../types';

interface BottomNavProps {
  current: Page;
  onNavigate: (p: Page) => void;
  onPlus: () => void;
  onAssistant: () => void;
  onMenu: () => void;
}

export default function BottomNav({ current, onNavigate, onPlus, onAssistant, onMenu }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] bg-brand-900/80 backdrop-blur-2xl border-t border-white/[0.06]">
      <NavButton label="Accueil" active={current === 'dashboard'} onClick={() => onNavigate('dashboard')} icon={LayoutDashboard} />
      <NavButton label="Projets" active={current === 'projects'} onClick={() => onNavigate('projects')} icon={FolderKanban} />
      <button onClick={onPlus} className="flex flex-col items-center justify-center -mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 shadow-glow border-4 border-brand-950">
        <Plus className="w-6 h-6 text-white" />
      </button>
      <NavButton label="Assistant" active={current === 'chat'} onClick={onAssistant} icon={Sparkles} />
      <NavButton label="Menu" active={false} onClick={onMenu} icon={MenuIcon} />
    </nav>
  );
}

function NavButton({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon: typeof LayoutDashboard }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${active ? 'text-accent-400' : 'text-slate-500'}`}>
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
