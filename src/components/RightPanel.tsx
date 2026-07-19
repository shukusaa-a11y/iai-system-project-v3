import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, FileText, Image, Code2, BarChart3, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { chatCompletion, isOpenAIConfigured, NO_KEY_MESSAGE } from '../lib/openai';
import { computeChatEnergy, formatEnergy } from '../lib/energy';

interface RightPanelProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Résumer un document', icon: FileText },
  { label: 'Générer une image', icon: Image },
  { label: 'Écrire du code', icon: Code2 },
  { label: 'Analyser des données', icon: BarChart3 },
];

export default function RightPanel({ open, onClose }: RightPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const { energy, deductEnergy, logActivity } = useApp();

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    if (!isOpenAIConfigured) {
      setMessages((m) => [...m, { role: 'user', content }, { role: 'assistant', content: NO_KEY_MESSAGE }]);
      return;
    }

    const cost = computeChatEnergy(content.length, 200);
    if (energy < cost || energy < 0.01) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Énergie insuffisante. Rechargez votre compte pour continuer.' }]);
      return;
    }
    setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', content }, { role: 'assistant', content: '...' }]);

    const res = await chatCompletion([
      { role: 'system', content: 'Tu es un assistant IA concis et utile.' },
      { role: 'user', content },
    ]);

    if (!res.error) {
      await deductEnergy(res.tokensUsed || cost, 'chat_output');
      logActivity('chat', 'Assistant IA', content.slice(0, 60), res.tokensUsed || cost);
    }

    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { role: 'assistant', content: res.content };
      return copy;
    });
    setBusy(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30" />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed lg:static top-0 right-0 z-40 h-full w-full sm:w-[380px] lg:w-[380px] flex flex-col bg-brand-900/70 backdrop-blur-2xl border-l border-white/[0.06]"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-sky-500 flex items-center justify-center shadow-glow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Assistant IA</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En ligne
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500/20 to-sky-500/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-accent-400" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Demandez quelque chose à l'IA...</p>
                  {!isOpenAIConfigured && <p className="text-[11px] text-amber-400 mt-3 px-6 leading-relaxed">{NO_KEY_MESSAGE}</p>}
                </div>
              )}
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-gradient-to-br from-accent-600 to-accent-500 text-white' : 'glass text-slate-200'}`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
              {QUICK_ACTIONS.map((q) => {
                const Icon = q.icon;
                return (
                  <button key={q.label} onClick={() => send(q.label)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-800/50 border border-white/[0.06] text-[11px] text-slate-300 hover:border-accent-500/30 hover:bg-brand-800/80 transition-all">
                    <Icon className="w-3 h-3" />
                    {q.label}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Demandez quelque chose à l'IA..." className="input-base flex-1" />
                <button onClick={() => send()} disabled={busy} className="btn-primary p-3 disabled:opacity-50">
                  {busy ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              {energy < 0.01 && <p className="text-[10px] text-red-400 mt-2 text-center">Énergie insuffisante ({formatEnergy(energy)})</p>}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
