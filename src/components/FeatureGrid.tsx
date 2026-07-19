import { motion } from 'framer-motion';
import {
  Sparkles, FileText, BarChart3, Zap, FolderKanban,
  Plug, Cpu, ShieldCheck, ArrowUpRight, Mic,
} from 'lucide-react';
import type { Page, FeatureId } from '../types';

interface FeatureGridProps {
  onNavigate: (p: Page) => void;
  onFeatureClick: (f: FeatureId) => void;
}

const FEATURES: { id: FeatureId; title: string; desc: string; icon: typeof Sparkles; color: string }[] = [
  { id: 'assistant', title: 'Assistant IA', desc: 'Chat intelligent multi-contexte', icon: Sparkles, color: 'from-sky-500/15 to-blue-600/5' },
  { id: 'live', title: 'Mode Live IA', desc: 'Conversation vocale en temps réel', icon: Mic, color: 'from-accent-500/15 to-accent-600/5' },
  { id: 'content', title: 'Génération de contenu', desc: 'Articles, posts, scripts SEO', icon: FileText, color: 'from-emerald-500/15 to-teal-600/5' },
  { id: 'data', title: 'Analyse de données', desc: 'Insights & visualisations', icon: BarChart3, color: 'from-amber-500/15 to-orange-600/5' },
  { id: 'automation', title: 'Automatisations', desc: 'Workflows & triggers', icon: Zap, color: 'from-violet-500/15 to-purple-600/5' },
  { id: 'projects', title: 'Gestion de projets', desc: 'Kanban, tâches, deadlines', icon: FolderKanban, color: 'from-rose-500/15 to-pink-600/5' },
  { id: 'integrations', title: 'Intégrations', desc: 'APIs & webhooks', icon: Plug, color: 'from-cyan-500/15 to-sky-600/5' },
  { id: 'devices', title: "Contrôle d'appareils", desc: 'IoT & smart home', icon: Cpu, color: 'from-indigo-500/15 to-blue-600/5' },
  { id: 'security', title: 'Sécurité', desc: 'Audit & monitoring', icon: ShieldCheck, color: 'from-red-500/15 to-rose-600/5' },
];

export default function FeatureGrid({ onNavigate, onFeatureClick }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <motion.button
            key={f.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => {
              onFeatureClick(f.id);
              if (f.id === 'assistant') onNavigate('chat');
              if (f.id === 'live') onNavigate('live');
              if (f.id === 'projects') onNavigate('projects');
              if (f.id === 'automation') onNavigate('automations');
            }}
            className={`group relative text-left p-5 rounded-2xl glass card-hover overflow-hidden bg-gradient-to-br ${f.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center backdrop-blur-sm border border-white/[0.08] group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-accent-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
