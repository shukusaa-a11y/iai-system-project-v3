# GUIDE D'HEBERGEMENT IAI SYSTEM PROJECT — V2

## 1. Installation Locale

```bash
npm install
cp .env.example .env
# Remplissez vos clés dans .env
npm run dev
```

## 2. Build pour Production

```bash
npm run build
```

Le dossier `dist/` est prêt pour Vercel, Netlify, Cloudflare Pages, etc.

## 3. Variables d'Environnement

| Variable                     | Requis | Description                        |
|------------------------------|--------|------------------------------------|
| `VITE_OPENAI_API_KEY`        | Oui    | Clé OpenAI (GPT-4o + DALL-E 3)    |
| `VITE_SERPER_API_KEY`        | Non    | Clé Serper (recherche web Google)  |
| `VITE_STRIPE_PUBLISHABLE_KEY`| Non    | Clé publique Stripe (paiements)    |
| `VITE_SUPABASE_URL`          | Non    | URL de votre projet Supabase       |
| `VITE_SUPABASE_ANON_KEY`     | Non    | Clé anon Supabase                  |

## 4. Système d'Énergie (%)

L'**Énergie** est la monnaie interne de la plateforme, affichée en pourcentage.

### Règle de base
> **1$ = 1% d'Énergie de base** (+ 10% bonus sur tous les packs)

### Packs disponibles

| Pack       | Prix  | Énergie base | Bonus  | Total    |
|------------|-------|--------------|--------|----------|
| Starter    | 10$   | 10%          | +1%    | **11%**  |
| Pro        | 20$   | 20%          | +2%    | **22%**  |
| Business   | 50$   | 50%          | +5%    | **55%**  |
| Enterprise | 100$  | 100%         | +10%   | **110%** |

### Consommation par action

| Action                       | Coût         |
|------------------------------|--------------|
| Entrée texte (250 000 mots)  | 0.189%       |
| Sortie texte (200 000 mots)  | 0.378%       |
| Génération d'image (DALL-E)  | 0.1%         |
| Requête courte (< 1 000 car) | ~0.003%      |
| Minimum par action           | 0.01%        |

L'application **bloque toute action** si l'Énergie est inférieure à **0.01%**.

### Essai gratuit 3 jours

Tout nouveau compte reçoit automatiquement :
- **1% d'Énergie gratuite**
- **3 images maximum** sur 3 jours
- Après 3 jours OU si énergie = 0 : modal "Passez à l'abonnement"

### Système de publicité

Si l'Énergie est nulle sans abonnement actif, l'utilisateur peut regarder une pub pour gagner :
- **10 secondes** → +0.01% Énergie
- **15 secondes** → +0.02% Énergie
- **30 secondes** → +0.05% Énergie

Si refus : bandeau rouge permanent en haut de l'écran.

## 5. Configuration Supabase (TODO)

Créez un projet sur [supabase.com](https://supabase.com) et exécutez ce SQL dans le **SQL Editor** :

```sql
-- Table Profils Utilisateurs
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  email text NOT NULL,
  tokens_balance numeric(12,4) DEFAULT 1,
  trial_started_at timestamptz DEFAULT now(),
  trial_images_used integer DEFAULT 0,
  has_active_subscription boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table Transactions
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  amount numeric(10,2) DEFAULT 0,
  tokens numeric(12,4) NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Politiques RLS pour transactions
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger: créer profil automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tokens_balance, trial_started_at)
  VALUES (NEW.id, NEW.email, 1.0, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Puis dans `.env` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 6. Configuration Stripe (TODO)

1. Créer un compte sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Récupérer la **publishable key** dans *Developers → API Keys*
3. Ajouter dans `.env` : `VITE_STRIPE_PUBLISHABLE_KEY=pk_...`
4. Créer une **Edge Function Supabase** `stripe-checkout` pour générer les sessions
5. Configurer un **webhook Stripe** pour créditer l'Énergie après paiement

## 7. Engagement Humanitaire

**10% de chaque recharge** est reversé automatiquement aux associations d'aide humanitaire et de santé mentale.

## 8. Build Android (Capacitor)

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
