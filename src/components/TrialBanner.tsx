import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, X } from 'lucide-react';
import { TRIAL_DAYS, TRIAL_MAX_IMAGES } from '../types';

interface TrialBannerProps {
  trialStartedAt: number;
  imagesUsed: number;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export default function TrialBanner({ trialStartedAt, imagesUsed, onUpgrade, onDismiss }: TrialBannerProps) {
  const elapsed = Date.now() - trialStartedAt;
  const hoursLeft = Math.max(0, TRIAL_DAYS * 24 - Math.floor(elapsed / (60 * 60 * 1000)));
  const daysLeft = Math.max(0, TRIAL_DAYS - Math.floor(elapsed / (24 * 60 * 60 * 1000)));
  const imagesLeft = Math.max(0, TRIAL_MAX_IMAGES - imagesUsed);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-accent-600/15 via-sky-500/10 to-accent-600/15 border-b border-accent-500/20 backdrop-blur-xl"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-sky-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs">
          <span className="text-white font-semibold">Essai gratuit</span>
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {hoursLeft > 24 ? `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}` : `${hoursLeft}h restantes`}
          </span>
          <span className="text-slate-400">{imagesLeft} image{imagesLeft > 1 ? 's' : ''} / {TRIAL_MAX_IMAGES}</span>
          <span className="text-emerald-400 font-medium">1% Énergie offerte</span>
        </div>
        <button onClick={onUpgrade} className="text-xs font-semibold text-accent-400 hover:text-accent-300 transition-colors px-3 py-1 rounded-lg bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/20">
          Passer à l'abonnement
        </button>
        <button onClick={onDismiss} className="text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
