import { motion } from 'framer-motion';
import { Sparkles, Send, FileText, Image, Code2, BarChart3, Loader2, Search, AlertCircle, Zap } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { chatCompletion, generateImage, isOpenAIConfigured, NO_KEY_MESSAGE as OPENAI_NO_KEY } from '../lib/openai';
import { webSearch, isSerperConfigured, NO_KEY_MESSAGE as SERPER_NO_KEY } from '../lib/serper';
import { computeChatEnergy, computeImageEnergy, formatEnergy, type AIModel } from '../lib/energy';
import { TRIAL_MAX_IMAGES } from '../types';
import type { ChatMessage } from '../types';

const QUICK = [
  { label: 'Résumer un document', icon: FileText, prompt: 'Résume ce document en points clés: ' },
  { label: 'Générer une image', icon: Image, prompt: '' },
  { label: 'Écrire du code', icon: Code2, prompt: 'Écris un code pour: ' },
  { label: 'Analyser des données', icon: BarChart3, prompt: 'Analyse ces données: ' },
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [complexMode, setComplexMode] = useState(false);
  const model: AIModel = complexMode ? 'gpt-4o' : 'gpt-4o-mini';
  const [searchResults, setSearchResults] = useState<{ title: string; link: string; snippet: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { energy, deductEnergy, logActivity } = useApp();
  const { user, updateTrialImages } = useAuth();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;

    if (imageMode) {
      if (!isOpenAIConfigured) { addMsg('assistant', OPENAI_NO_KEY); return; }
      const imgCost = computeImageEnergy(model);
      if (energy < imgCost || energy < 0.01) {
        addMsg('assistant', `Énergie insuffisante pour générer une image (${imgCost}%). Rechargez votre compte.`);
        return;
      }
      if (user?.isTrialActive && (user.trialImagesUsed ?? 0) >= TRIAL_MAX_IMAGES) {
        addMsg('assistant', 'Limite d\'images de l\'essai gratuit atteinte (3 max). Passez à l\'abonnement pour continuer.');
        return;
      }
      setBusy(true);
      setInput('');
      addMsg('user', content);
      const res = await generateImage(content, model);
      if (!res.error && res.url) {
        await deductEnergy(imgCost, 'image');
        logActivity('image', 'Génération image', content.slice(0, 50), imgCost);
        if (user) updateTrialImages(user.email);
        addMsg('assistant', `![${content}](${res.url})`);
      } else {
        addMsg('assistant', OPENAI_NO_KEY);
      }
      setBusy(false);
      setImageMode(false);
      return;
    }

    if (searchMode) {
      if (!isSerperConfigured) { addMsg('assistant', SERPER_NO_KEY); return; }
      setBusy(true);
      setInput('');
      addMsg('user', `Recherche: ${content}`);
      const { results, error, message } = await webSearch(content);
      if (error) {
        addMsg('assistant', message ?? 'Erreur lors de la recherche.');
      } else {
        setSearchResults(results);
        logActivity('search', 'Recherche web', content.slice(0, 50), 0);
        addMsg('assistant', `${results.length} résultats trouvés (voir ci-dessous).`);
      }
      setBusy(false);
      setSearchMode(false);
      return;
    }

    if (!isOpenAIConfigured) {
      addMsg('user', content);
      addMsg('assistant', OPENAI_NO_KEY);
      return;
    }
    const cost = computeChatEnergy(content.length, 300, model);
    if (energy < cost || energy < 0.01) {
      addMsg('assistant', 'Énergie insuffisante. Rechargez votre compte.');
      return;
    }
    setBusy(true);
    setInput('');
    addMsg('user', content);
    const res = await chatCompletion([
      { role: 'system', content: 'Tu es un assistant IA expert, concis et utile. Réponds en français.' },
      { role: 'user', content },
    ], model);
    if (!res.error) {
      await deductEnergy(res.tokensUsed || cost, 'chat_output');
      logActivity('chat', 'Assistant IA', content.slice(0, 50), res.tokensUsed || cost);
    }
    addMsg('assistant', res.content, res.tokensUsed);
    setBusy(false);
  }

  function addMsg(role: 'user' | 'assistant', content: string, energyUsed?: number) {
    setMessages((m) => [...m, { id: crypto.randomUUID(), role, content, timestamp: Date.now(), energyUsed }]);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-sky-500 flex items-center justify-center shadow-glow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Assistant IA</h1>
            <p className="text-[10px] text-slate-500">Propulsé par {complexMode ? 'GPT-4o' : 'GPT-4o-mini'}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {complexMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">4o</span>
          )}
          <button onClick={() => setComplexMode(!complexMode)} className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${complexMode ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'border-white/[0.08] text-slate-400 hover:bg-white/5'}`} title="Mode Complexe: GPT-4o (2x énergie)">
            {complexMode ? 'Complexe ON' : 'Complexe'}
          </button>
          <button onClick={() => { setSearchMode(!searchMode); setImageMode(false); }} className={`p-2.5 rounded-xl border transition-all ${searchMode ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'border-white/[0.08] text-slate-400 hover:bg-white/5'}`}>
            <Search className="w-4 h-4" />
          </button>
          <button onClick={() => { setImageMode(!imageMode); setSearchMode(false); }} className={`p-2.5 rounded-xl border transition-all ${imageMode ? 'bg-accent-500/15 border-accent-500/30 text-accent-400' : 'border-white/[0.08] text-slate-400 hover:bg-white/5'}`}>
            <Image className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(!isOpenAIConfigured || !isSerperConfigured) && messages.length === 0 && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-[11px] text-amber-300">
            {!isOpenAIConfigured && <p>{OPENAI_NO_KEY}</p>}
            {!isSerperConfigured && <p className="mt-1">{SERPER_NO_KEY}</p>}
          </div>
        </div>
      )}

      {searchMode && <p className="text-xs text-accent-400 mb-2">Mode recherche web activé (Serper API)</p>}
      {imageMode && <p className="text-xs text-accent-400 mb-2">Mode génération d'image ({computeImageEnergy(model)}% Énergie/image)</p>}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-accent-500/20 to-sky-500/20 flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
              <Sparkles className="w-8 h-8 text-accent-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Assistant IA</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Demandez-moi quelque chose, je suis là pour vous aider à générer, analyser et créer.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-gradient-to-br from-accent-600 to-accent-500 text-white' : 'glass text-slate-200'}`}>
              {m.content.startsWith('![') ? (
                <img src={m.content.match(/\((.*?)\)/)?.[1] ?? ''} alt="generated" className="rounded-xl max-w-full" />
              ) : (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              )}
              {m.energyUsed && (
                <p className="text-[10px] mt-1.5 opacity-50 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> {formatEnergy(m.energyUsed)} consommée
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Résultats de recherche</h3>
            {searchResults.map((r, i) => (
              <a key={i} href={r.link} target="_blank" rel="noreferrer" className="block p-3.5 rounded-xl glass card-hover">
                <p className="text-sm text-accent-400 font-medium">{r.title}</p>
                <p className="text-xs text-slate-400 mt-1">{r.snippet}</p>
                <p className="text-[10px] text-slate-600 mt-1.5">{r.link}</p>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] pt-3">
        <div className="flex gap-1.5 flex-wrap mb-3">
          {QUICK.map((q) => {
            const Icon = q.icon;
            return (
              <button key={q.label} onClick={() => send(q.prompt)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-850/60 border border-white/[0.06] text-[11px] text-slate-300 hover:border-accent-500/30 hover:bg-brand-800/60 transition-all">
                <Icon className="w-3 h-3" />
                {q.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={imageMode ? "Décrivez l'image à générer..." : searchMode ? 'Recherche web...' : 'Demandez quelque chose à l\'IA...'}
            className="input-base flex-1"
          />
          <button onClick={() => send()} disabled={busy} className="btn-primary p-3 disabled:opacity-50">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
