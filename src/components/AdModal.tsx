import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Loader2, Gift, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AD_REWARDS } from '../types';
import { formatEnergy } from '../lib/energy';

interface AdModalProps {
  open: boolean;
  onClose: () => void;
  onReward: (reward: number) => void;
}

export default function AdModal({ open, onClose, onReward }: AdModalProps) {
  const [selectedAd, setSelectedAd] = useState<number | null>(null);
  const [watching, setWatching] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!watching || countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((c) => {
        if (c <= 1) {
          const reward = AD_REWARDS.find((a) => a.duration === selectedAd)?.reward ?? 0;
          onReward(reward);
          setWatching(false);
          setSelectedAd(null);
          onClose();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [watching, countdown, selectedAd, onReward, onClose]);

  function startAd(duration: number) {
    setSelectedAd(duration);
    setWatching(true);
    setCountdown(duration);
  }

  function close() {
    if (watching) return;
    setSelectedAd(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !watching && close()}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md glass rounded-3xl p-6 z-10"
          >
            {!watching ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-semibold text-white">Gagnez de l'Énergie</h2>
                  </div>
                  <button onClick={close} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Regardez une courte publicité pour recevoir de l'Énergie gratuite instantanément.
                </p>
                <div className="space-y-2.5">
                  {AD_REWARDS.map((ad) => (
                    <button
                      key={ad.duration}
                      onClick={() => startAd(ad.duration)}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-brand-850/60 border border-white/[0.06] hover:border-accent-500/30 hover:bg-brand-800/60 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent-500/10 flex items-center justify-center group-hover:bg-accent-500/20 transition-colors">
                          <Play className="w-4 h-4 text-accent-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-white font-medium">Pub de {ad.label}</p>
                          <p className="text-[11px] text-slate-500">Regarder pour gagner</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-400">+{formatEnergy(ad.reward)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-500/20 to-sky-500/20 animate-glow-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-accent-400 animate-spin" />
                  </div>
                </div>
                <p className="text-sm text-white font-medium mb-1">Publicité en cours...</p>
                <p className="text-2xl font-bold text-accent-400">{countdown}s</p>
                <div className="mt-4 h-1.5 rounded-full bg-brand-850 overflow-hidden max-w-xs mx-auto">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${((selectedAd! - countdown) / selectedAd!) * 100}%` }}
                    className="h-full bg-gradient-to-r from-accent-500 to-sky-400 rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
