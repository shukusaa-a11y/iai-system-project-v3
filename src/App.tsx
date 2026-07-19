import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, AlertCircle, Zap } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RightPanel from './components/RightPanel';
import BottomNav from './components/BottomNav';
import TrialBanner from './components/TrialBanner';
import AdModal from './components/AdModal';
import UpgradeModal from './components/UpgradeModal';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import WalletPage from './pages/WalletPage';
import Projects from './pages/Projects';
import Automations from './pages/Automations';
import Settings from './pages/Settings';
import LiveVoice from './pages/LiveVoice';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import type { Page, FeatureId } from './types';

function Shell() {
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { loading, user } = useAuth();
  const { energy, addEnergy, logActivity } = useApp();

  const showTrial = user?.isTrialActive && showTrialBanner && (user.trialStartedAt ?? 0) > 0;
  const insufficientEnergy = energy < 0.01 && !user?.hasActiveSubscription;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-950">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Sparkles className="w-10 h-10 text-accent-500" />
        </motion.div>
      </div>
    );
  }

  function navigate(p: Page) {
    setPage(p);
    if (p === 'chat') setAssistantOpen(false);
  }

  function onFeatureClick(f: FeatureId) {
    if (f === 'assistant') setAssistantOpen(true);
    if (f === 'live') setPage('live');
  }

  async function handleAdReward(reward: number) {
    await addEnergy(reward);
    logActivity('ad', 'Récompense pub', `+${reward}% Énergie`, 0);
  }

  async function handleUpgradePurchase(_packId: string, price: number, totalEnergy: number) {
    await addEnergy(totalEnergy, price);
    logActivity('payment', `Recharge ${totalEnergy}% Énergie`, `${price}$`, 0);
  }

  const trialExpired = user && !user.isTrialActive && !user.hasActiveSubscription && energy < 0.01;

  return (
    <>
      {/* Live Voice full-screen overlay */}
      <AnimatePresence>
        {page === 'live' && <LiveVoice onClose={() => navigate('dashboard')} />}
      </AnimatePresence>

      {/* Main app (hidden when live is active) */}
      {page !== 'live' && (
        <div className="flex h-screen overflow-hidden bg-brand-950">
          <Sidebar current={page} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col min-w-0">
            <AnimatePresence>
              {insufficientEnergy && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-red-600/20 to-red-500/15 border-b border-red-500/30 backdrop-blur-xl"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-300 font-medium flex-1">
                    Solde insuffisant. Rechargez votre compte pour continuer à utiliser l'application.
                  </p>
                  <button onClick={() => navigate('wallet')} className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors">
                    Recharger
                  </button>
                  <button onClick={() => setAdModalOpen(true)} className="text-xs font-semibold text-white px-3 py-1 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 transition-colors flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Regarder une pub
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {showTrial && user?.trialStartedAt && (
              <TrialBanner
                trialStartedAt={user.trialStartedAt}
                imagesUsed={user.trialImagesUsed ?? 0}
                onUpgrade={() => setUpgradeModalOpen(true)}
                onDismiss={() => setShowTrialBanner(false)}
              />
            )}

            <Header onMenu={() => setSidebarOpen(true)} onSearch={setSearch} searchQuery={search} />

            <main className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
                <AnimatePresence mode="wait">
                  <motion.div key={page} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className={page === 'chat' ? 'h-full' : ''}>
                    {page === 'dashboard' && <Dashboard onNavigate={navigate} onFeatureClick={onFeatureClick} onOpenAssistant={() => setAssistantOpen(true)} />}
                    {page === 'chat' && <Chat />}
                    {page === 'wallet' && <WalletPage />}
                    {page === 'projects' && <Projects />}
                    {page === 'automations' && <Automations />}
                    {page === 'settings' && <Settings />}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="hidden lg:block">
                <RightPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
              </div>
            </main>
          </div>

          <div className="lg:hidden">
            <RightPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
          </div>

          <BottomNav
            current={page}
            onNavigate={navigate}
            onPlus={() => navigate('wallet')}
            onAssistant={() => { navigate('chat'); setAssistantOpen(true); }}
            onMenu={() => setSidebarOpen(true)}
          />

          <AdModal open={adModalOpen} onClose={() => setAdModalOpen(false)} onReward={handleAdReward} />

          <UpgradeModal
            open={upgradeModalOpen || !!trialExpired}
            onClose={() => setUpgradeModalOpen(false)}
            onPurchase={handleUpgradePurchase}
            reason={trialExpired ? 'Votre essai gratuit est terminé' : undefined}
          />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </AuthProvider>
  );
}
