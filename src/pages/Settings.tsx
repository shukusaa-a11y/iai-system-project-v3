import { Settings as SettingsIcon, User, Shield, Palette, Globe, Heart, Check, Zap } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { isOpenAIConfigured } from '../lib/openai';
import { isSerperConfigured } from '../lib/serper';
import { isStripeConfigured } from '../lib/stripe';
import { useApp } from '../context/AppContext';
import { formatEnergy, energyColor } from '../lib/energy';

export default function Settings() {
  const { user } = useAuth();
  const { energy } = useApp();
  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const integrations = [
    { name: 'Supabase Auth & DB', status: isSupabaseConfigured, key: 'VITE_SUPABASE_URL' },
    { name: 'OpenAI API', status: isOpenAIConfigured, key: 'VITE_OPENAI_API_KEY' },
    { name: 'Serper Web Search', status: isSerperConfigured, key: 'VITE_SERPER_API_KEY' },
    { name: 'Stripe Payments', status: isStripeConfigured, key: 'VITE_STRIPE_PUBLISHABLE_KEY' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2.5">
        <SettingsIcon className="w-5 h-5 text-accent-400" />
        <h1 className="text-2xl font-bold text-white tracking-tight">Paramètres</h1>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">Profil</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label-xs block mb-1.5">Nom</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-base w-full" />
          </div>
          <div>
            <label className="label-xs block mb-1.5">Email</label>
            <input value={email} disabled className="input-base w-full opacity-50" />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-850/50 border border-white/[0.06]">
            <Zap className="w-4 h-4 text-accent-400" />
            <span className="text-xs text-slate-400">Énergie disponible</span>
            <span className={`text-sm font-bold ml-auto ${energyColor(energy)}`}>{formatEnergy(energy)}</span>
          </div>
          <button onClick={save} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
            {saved ? <><Check className="w-4 h-4" /> Enregistré</> : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">Intégrations & API</h2>
        </div>
        <div className="space-y-2">
          {integrations.map((it) => (
            <div key={it.key} className="flex items-center justify-between p-3.5 rounded-xl bg-brand-850/50 border border-white/[0.04]">
              <div>
                <p className="text-sm text-white font-medium">{it.name}</p>
                <p className="text-[11px] text-slate-500">{it.key}</p>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${it.status ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {it.status ? 'Configuré' : 'Non configuré'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-3">
          Configurez vos clés dans le fichier <code className="text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded">.env</code> avec le préfixe <code className="text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded">VITE_</code>.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">Consommation d'Énergie</h2>
        </div>
        <ul className="space-y-2.5 text-xs text-slate-400">
          <li className="flex justify-between items-center"><span>Entrée (250k mots, 4o-mini)</span><span className="text-accent-400 font-semibold">0.189%</span></li>
          <li className="flex justify-between items-center"><span>Sortie (200k mots, 4o-mini)</span><span className="text-accent-400 font-semibold">0.378%</span></li>
          <li className="flex justify-between items-center"><span>Génération d'image (4o-mini)</span><span className="text-accent-400 font-semibold">0.25%</span></li>
          <li className="flex justify-between items-center"><span>Génération d'image (4o)</span><span className="text-accent-400 font-semibold">0.50%</span></li>
          <li className="flex justify-between items-center"><span>Mode Live (4o-mini, par minute)</span><span className="text-accent-400 font-semibold">1%</span></li>
          <li className="flex justify-between items-center"><span>Mode Live (4o, par minute)</span><span className="text-accent-400 font-semibold">2%</span></li>
          <li className="flex justify-between items-center"><span>Mode Complexe (4o)</span><span className="text-violet-400 font-semibold">2x énergie</span></li>
          <li className="flex justify-between items-center"><span>Minimum par action</span><span className="text-accent-400 font-semibold">0.01%</span></li>
        </ul>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">Préférences</h2>
        </div>
        <div className="space-y-3">
          {['Notifications par email', "Son de l'assistant", 'Mode sombre', 'Recherche web automatique'].map((p) => (
            <label key={p} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">{p}</span>
              <input type="checkbox" defaultChecked className="w-9 h-5 rounded-full appearance-none bg-brand-700 checked:bg-accent-500 relative cursor-pointer transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-4" />
            </label>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-slate-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">À propos</h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          IAI SYSTEM PROJECT est une plateforme SaaS tout-en-un propulsée par l'IA. Elle combine assistant intelligent, génération de contenu, automatisations et gestion de projets dans une interface unifiée.
        </p>
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/15 flex items-start gap-2.5">
          <Heart className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            10% de chaque recharge est reversé automatiquement aux associations d'aide humanitaire et de santé mentale. Merci de contribuer au bien-être du monde.
          </p>
        </div>
      </div>
    </div>
  );
}
