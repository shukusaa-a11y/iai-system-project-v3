import { motion } from 'framer-motion';
import { Zap, TrendingUp, Sparkles, Heart, ArrowRight, Mic } from 'lucide-react';
import FeatureGrid from '../components/FeatureGrid';
import ActivityFeed from '../components/ActivityFeed';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatEnergy, energyColor, energyBarColor } from '../lib/energy';
import type { Page, FeatureId } from '../types';

interface DashboardProps {
  onNavigate: (p: Page) => void;
  onFeatureClick: (f: FeatureId) => void;
  onOpenAssistant: () => void;
}

export default function Dashboard({ onNavigate, onFeatureClick, onOpenAssistant }: DashboardProps) {
  const { energy, activities } = useApp();
  const { user } = useAuth();

  const stats = [
    { label: 'Énergie', value: formatEnergy(energy), icon: Zap, color: energyColor(energy), bg: 'from-accent-500/10 to-transparent', showBar: true },
    { label: 'Actions', value: activities.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-transparent', showBar: false },
    { label: 'Assistant IA', value: 'Actif', icon: Sparkles, color: 'text-sky-400', bg: 'from-sky-500/10 to-transparent', showBar: false },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <img src="/file_000000005d2c7243b572cb8771032a9b.png" alt="Logo" className="w-6 h-6 rounded-lg object-cover" />
            <p className="text-xs text-accent-400 font-semibold uppercase tracking-wider">Bienvenue, {user?.name}</p>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-lg">Gérez votre IA, vos projets et votre Énergie en un seul lieu.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`glass rounded-2xl p-5 bg-gradient-to-br ${s.bg} relative overflow-hidden`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="label-xs">{s.label}</p>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
              {s.showBar && (
                <div className="mt-3 h-1 rounded-full bg-brand-950/80 overflow-hidden">
                  <motion.div
                    animate={{ width: `${Math.min(100, energy)}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${energyBarColor(energy)}`}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white tracking-tight">Fonctionnalités</h2>
          <button onClick={onOpenAssistant} className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors">
            Ouvrir l'Assistant IA <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <FeatureGrid onNavigate={onNavigate} onFeatureClick={onFeatureClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed />
        <div className="glass rounded-2xl p-5">
          <h3 className="text-base font-semibold text-white tracking-tight mb-4">Aperçu rapide</h3>
          <div className="space-y-2.5">
            <button onClick={() => onNavigate('live')} className="w-full text-left p-3.5 rounded-xl bg-gradient-to-r from-accent-500/10 to-transparent hover:from-accent-500/15 border border-accent-500/15 hover:border-accent-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Mode Live IA</p>
                    <p className="text-[11px] text-slate-500">Conversation vocale en temps réel</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
            <button onClick={() => onNavigate('chat')} className="w-full text-left p-3.5 rounded-xl bg-brand-850/50 hover:bg-brand-800/50 border border-white/[0.04] hover:border-white/[0.08] transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Lancer une conversation IA</p>
                  <p className="text-[11px] text-slate-500">Chat, génération, analyse</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
            <button onClick={() => onNavigate('wallet')} className="w-full text-left p-3.5 rounded-xl bg-brand-850/50 hover:bg-brand-800/50 border border-white/[0.04] hover:border-white/[0.08] transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Recharger de l'Énergie</p>
                  <p className="text-[11px] text-slate-500">10$ à 100$, bonus +10% inclus</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
            <button onClick={() => onNavigate('automations')} className="w-full text-left p-3.5 rounded-xl bg-brand-850/50 hover:bg-brand-800/50 border border-white/[0.04] hover:border-white/[0.08] transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Créer une automatisation</p>
                  <p className="text-[11px] text-slate-500">Workflows programmés</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 border-rose-500/15">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Heart className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-300 mb-1">Engagement Humanitaire</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              10% de chaque recharge est reversé automatiquement aux associations d'aide humanitaire et de santé mentale. Merci de contribuer au bien-être du monde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
