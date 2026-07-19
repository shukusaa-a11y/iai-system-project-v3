import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { ActivityEntry } from '../types';
import { useAuth } from './AuthContext';

interface AppState {
  energy: number;
  activities: ActivityEntry[];
}

type AppAction =
  | { type: 'SET_ENERGY'; energy: number }
  | { type: 'ADD_ENERGY'; amount: number }
  | { type: 'DEDUCT_ENERGY'; amount: number }
  | { type: 'ADD_ACTIVITY'; entry: ActivityEntry }
  | { type: 'LOAD_STATE'; state: Partial<AppState> };

const initialState: AppState = { energy: 0, activities: [] };

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ENERGY':
      return { ...state, energy: round4(action.energy) };
    case 'ADD_ENERGY':
      return { ...state, energy: round4(state.energy + action.amount) };
    case 'DEDUCT_ENERGY':
      return { ...state, energy: round4(state.energy - action.amount) };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.entry, ...state.activities].slice(0, 50) };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  addEnergy: (amount: number, usdAmount?: number) => Promise<void>;
  deductEnergy: (amount: number, type?: string) => Promise<void>;
  setEnergy: (e: number) => void;
  logActivity: (type: ActivityEntry['type'], title: string, detail: string, energyUsed?: number) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);
const STORAGE_KEY = (uid: string) => `iai_energy_${uid}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(user.id));
      if (raw) {
        dispatch({ type: 'LOAD_STATE', state: JSON.parse(raw) });
      } else {
        dispatch({ type: 'SET_ENERGY', energy: 1 });
      }
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(state));
  }, [user, state]);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    async addEnergy(amount, _usd = 0) {
      dispatch({ type: 'ADD_ENERGY', amount });
    },
    async deductEnergy(amount, _type = 'depense') {
      dispatch({ type: 'DEDUCT_ENERGY', amount });
    },
    setEnergy: (e) => dispatch({ type: 'SET_ENERGY', energy: e }),
    logActivity: (type, title, detail, energyUsed) =>
      dispatch({
        type: 'ADD_ACTIVITY',
        entry: { id: crypto.randomUUID(), type, title, detail, energyUsed, timestamp: Date.now() },
      }),
  }), [state, user]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
