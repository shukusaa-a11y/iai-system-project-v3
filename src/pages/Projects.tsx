import { motion } from 'framer-motion';
import { FolderKanban, Plus, Calendar, Users } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface Project {
  id: string;
  name: string;
  status: 'En cours' | 'Terminé' | 'En attente';
  progress: number;
  members: number;
  deadline: string;
}

const STATUS_COLORS: Record<Project['status'], string> = {
  'En cours': 'text-accent-400 bg-accent-500/10 border-accent-500/20',
  'Terminé': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'En attente': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const { logActivity } = useApp();

  function add() {
    if (!name) return;
    setProjects((p) => [...p, {
      id: crypto.randomUUID(), name, status: 'En attente', progress: 0, members: 1,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    }]);
    logActivity('project', 'Projet créé', name, 0);
    setName(''); setAdding(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestion de projets</h1>
          <p className="text-sm text-slate-400 mt-1">Suivez l'avancement de vos projets</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouveau projet
        </button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-2xl p-5 flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du projet" className="input-base flex-1" />
          <button onClick={add} className="btn-primary px-4 py-2.5 text-sm">Créer</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 && (
          <div className="col-span-full text-center py-16 glass rounded-2xl">
            <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Aucun projet pour le moment.</p>
            <p className="text-[11px] text-slate-600 mt-1">Cliquez sur « Nouveau projet » pour commencer.</p>
          </div>
        )}
        {projects.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-accent-500/10 flex items-center justify-center">
                  <FolderKanban className="w-4 h-4 text-accent-400" />
                </div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[p.status]}`}>{p.status}</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Progression</span><span>{p.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-950/80 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-accent-500 to-sky-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.members} membres</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.deadline}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
