import { loadStripe, type Stripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

export const isStripeConfigured = Boolean(publishableKey);

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!publishableKey) return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

// TODO: Connecter OpenAI Realtime API ici
// TODO: Remplacer par une Edge Function Supabase pour créer des sessions Stripe Checkout
export async function createCheckoutSession(_priceUSD: number, _energy: number): Promise<string> {
  return '';
}
