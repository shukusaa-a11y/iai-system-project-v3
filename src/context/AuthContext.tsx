import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { User } from '../types';
import { TRIAL_DAYS } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; user: User | null }
  | { type: 'SET_LOADING'; loading: boolean };

const initialState: AuthState = { user: null, loading: true };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateTrialImages: (email: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isTrialActive(startedAt: number): boolean {
  return Date.now() - startedAt < TRIAL_DAYS * 24 * 60 * 60 * 1000;
}

function loadTrialState(email: string): { startedAt: number; imagesUsed: number } {
  try {
    const raw = localStorage.getItem(`iai_trial_${email}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const startedAt = Date.now();
  localStorage.setItem(`iai_trial_${email}`, JSON.stringify({ startedAt, imagesUsed: 0 }));
  return { startedAt, imagesUsed: 0 };
}

function saveTrialState(email: string, startedAt: number, imagesUsed: number) {
  localStorage.setItem(`iai_trial_${email}`, JSON.stringify({ startedAt, imagesUsed }));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) handleAuthUser(data.session.user);
        else dispatch({ type: 'SET_USER', user: null });
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) handleAuthUser(session.user);
        else dispatch({ type: 'SET_USER', user: null });
      });

      return () => listener.subscription.unsubscribe();
    } else {
      const trial = loadTrialState('demo@iai-system.com');
      dispatch({
        type: 'SET_USER',
        user: {
          id: 'demo-user',
          email: 'demo@iai-system.com',
          name: 'Utilisateur Démo',
          trialStartedAt: trial.startedAt,
          trialImagesUsed: trial.imagesUsed,
          isTrialActive: isTrialActive(trial.startedAt),
        },
      });
    }
  }, []);

  function handleAuthUser(authUser: { id: string; email?: string; user_metadata?: { name?: string } }) {
    const email = authUser.email ?? '';
    const name = authUser.user_metadata?.name ?? email.split('@')[0];
    const trial = loadTrialState(email);
    dispatch({
      type: 'SET_USER',
      user: {
        id: authUser.id,
        email,
        name,
        trialStartedAt: trial.startedAt,
        trialImagesUsed: trial.imagesUsed,
        isTrialActive: isTrialActive(trial.startedAt),
      },
    });
  }

  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    loading: state.loading,
    async signIn(email, password) {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const trial = loadTrialState(email);
        dispatch({
          type: 'SET_USER',
          user: { id: crypto.randomUUID(), email, name: email.split('@')[0], trialStartedAt: trial.startedAt, trialImagesUsed: trial.imagesUsed, isTrialActive: isTrialActive(trial.startedAt) },
        });
      }
    },
    async signUp(email, password, name) {
      if (supabase) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
      } else {
        const trial = loadTrialState(email);
        dispatch({
          type: 'SET_USER',
          user: { id: crypto.randomUUID(), email, name, trialStartedAt: trial.startedAt, trialImagesUsed: trial.imagesUsed, isTrialActive: isTrialActive(trial.startedAt) },
        });
      }
    },
    async signOut() {
      if (supabase) await supabase.auth.signOut();
      dispatch({ type: 'SET_USER', user: null });
    },
    updateTrialImages(email) {
      const trial = loadTrialState(email);
      const imagesUsed = trial.imagesUsed + 1;
      saveTrialState(email, trial.startedAt, imagesUsed);
      dispatch({
        type: 'SET_USER',
        user: state.user ? { ...state.user, trialImagesUsed: imagesUsed } : state.user,
      });
    },
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { isTrialActive, loadTrialState };
