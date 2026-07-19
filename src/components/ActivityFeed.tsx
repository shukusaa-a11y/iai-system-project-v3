import { motion } from 'framer-motion';
import { MessageSquare, Image, Code2, BarChart3, Zap, Search, FolderKanban, Mic } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatEnergy } from '../lib/energy';

const ICONS: Record<string, typeof MessageSquare> = {
  chat: MessageSquare,
  image: Image,
  code: Code2,
  analysis: BarChart3,
  payment: Zap,
  search: Search,
  project: FolderKanban,
  ad: Zap,
  live: Mic,
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  return `il y a ${Math.floor(s / 3600)} h`;
}

export default function ActivityFeed() {
  const { activities } = useApp();

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white tracking-tight">Activité récente</h3>
        <span className="text-[10px] text-slate-500 font-medium">{activities.length} actions</span>
      </div>
      {activities.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
            <Zap className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-xs text-slate-500">Aucune activité pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
          {activities.map((a, i) => {
            const Icon = ICONS[a.type] ?? MessageSquare;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{a.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{a.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  {a.energyUsed !== undefined && a.energyUsed > 0 && <p className="text-[10px] text-red-400">-{formatEnergy(a.energyUsed)}</p>}
                  <p className="text-[10px] text-slate-600">{timeAgo(a.timestamp)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
