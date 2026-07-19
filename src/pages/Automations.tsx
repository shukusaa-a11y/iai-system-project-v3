import { motion } from 'framer-motion';
import { Zap, Plus, Play, Pause, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  lastRun?: string;
}

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');
  const { logActivity } = useApp();

  function add() {
    if (!name || !trigger || !action) return;
    setAutomations((a) => [...a, { id: crypto.randomUUID(), name, trigger, action, active: false }]);
    logActivity('project', 'Automatisation créée', name, 0);
    setName(''); setTrigger(''); setAction(''); setAdding(false);
  }

  function toggle(id: string) {
    setAutomations((a) => a.map((x) => x.id === id ? { ...x, active: !x.active } : x));
  }

  function remove(id: string) {
    setAutomations((a) => a.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Automatisations</h1>
          <p className="text-sm text-slate-400 mt-1">Workflows programmés et triggers IA</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle
        </button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-2xl p-5 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'automatisation" className="input-base w-full" />
          <input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Trigger (ex: Chaque jour 9h)" className="input-base w-full" />
          <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action IA (ex: Résumer emails)" className="input-base w-full" />
          <div className="flex gap-2">
            <button onClick={add} className="btn-primary px-4 py-2.5 text-sm">Créer</button>
            <button onClick={() => setAdding(false)} className="btn-ghost px-4 py-2.5 text-sm">Annuler</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automations.length === 0 && (
          <div className="col-span-full text-center py-16 glass rounded-2xl">
            <Zap className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Aucune automatisation pour le moment.</p>
            <p className="text-[11px] text-slate-600 mt-1">Cliquez sur « Nouvelle » pour créer un workflow.</p>
          </div>
        )}
        {automations.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.active ? 'bg-emerald-500/15' : 'bg-white/[0.04]'}`}>
                  <Zap className={`w-4 h-4 ${a.active ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{a.name}</p>
                  <p className="text-[11px] text-slate-500">{a.trigger}</p>
                </div>
              </div>
              <button onClick={() => remove(a.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">→ {a.action}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {a.lastRun ?? 'Jamais'}
              </span>
              <button onClick={() => toggle(a.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${a.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] text-slate-400'}`}>
                {a.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {a.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
