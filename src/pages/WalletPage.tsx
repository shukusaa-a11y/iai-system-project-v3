import WalletWidget from '../components/WalletWidget';

export default function WalletPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Énergie & Abonnement</h1>
        <p className="text-sm text-slate-400 mt-1">Rechargez votre Énergie en toute simplicité.</p>
      </div>
      <WalletWidget />
    </div>
  );
}
