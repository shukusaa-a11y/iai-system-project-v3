import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Send, Square, Activity, AlertCircle, Zap } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { chatCompletion, transcribeAudio, isOpenAIConfigured, NO_KEY_MESSAGE } from '../lib/openai';
import { computeLiveEnergy, formatEnergy, energyColor, type AIModel } from '../lib/energy';

interface LiveVoiceProps {
  onClose: () => void;
}

type LiveState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const STATUS_TEXT: Record<LiveState, string> = {
  idle: 'Appuyez pour parler',
  listening: 'Écoute...',
  thinking: 'IA réfléchit...',
  speaking: 'IA répond...',
  error: 'Mauvaise connexion',
};

export default function LiveVoice({ onClose }: LiveVoiceProps) {
  const { energy, deductEnergy, logActivity } = useApp();
  const [state, setState] = useState<LiveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(32).fill(0.05));
  const [, setSessionStart] = useState<number | null>(null);
  const [lastDeduction, setLastDeduction] = useState(0);
  const [complexMode, setComplexMode] = useState(false);
  const model: AIModel = complexMode ? 'gpt-4o' : 'gpt-4o-mini';

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const energyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number>(0);

  const energyBlocked = energy < 1;

  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const startVisualizer = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const bars: number[] = [];
      for (let i = 0; i < 32; i++) {
        const idx = Math.floor((i / 32) * dataArray.length);
        bars.push(Math.max(0.05, (dataArray[idx] ?? 0) / 255));
      }
      setAudioLevels(bars);
      animFrameRef.current = requestAnimationFrame(update);
    };
    update();
  }, []);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        resolve(blob);
      };
      recorder.stop();
    });
  }, []);

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setState('idle');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = 1.05;
    utter.pitch = 1;
    utter.onstart = () => setState('speaking');
    utter.onend = () => setState('idle');
    utter.onerror = () => setState('idle');
    window.speechSynthesis.speak(utter);
  }, []);

  const handleSendAudio = useCallback(async (audioBlob: Blob | null) => {
    if (!audioBlob || audioBlob.size === 0) {
      setState('idle');
      return;
    }

    setState('thinking');
    setErrorMsg('');

    // Transcribe with Whisper
    const { text: transcript, error: transcribeErr } = await transcribeAudio(audioBlob);
    if (transcribeErr || !transcript) {
      setErrorMsg('Transcription échouée');
      setState('error');
      return;
    }

    // Chat completion
    const res = await chatCompletion([
      { role: 'system', content: 'Tu es un assistant vocal IA concis et naturel. Réponds en français, de manière courte et parlée.' },
      { role: 'user', content: transcript },
    ], model);

    if (res.error) {
      setErrorMsg(res.content);
      setState('error');
      return;
    }

    // Speak the response
    speakText(res.content);
  }, [speakText]);

  const startRecording = useCallback(async () => {
    if (energyBlocked) return;
    if (!isOpenAIConfigured) {
      setErrorMsg(NO_KEY_MESSAGE);
      setState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startVisualizer(stream);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start();
      setState('listening');

      if (sessionStartRef.current === 0) {
        sessionStartRef.current = Date.now();
        setSessionStart(Date.now());
      }

      // Energy deduction: 1% per minute
      if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);
      energyIntervalRef.current = setInterval(async () => {
        const cost = computeLiveEnergy(60, model);
        await deductEnergy(cost, 'live');
        setLastDeduction((d) => d + cost);
        logActivity('live', 'Mode Live IA', '1 minute', cost);
      }, 60000);
    } catch {
      setErrorMsg('Microphone inaccessible');
      setState('error');
    }
  }, [energyBlocked, startVisualizer, deductEnergy, logActivity, model]);

  const handleStop = useCallback(() => {
    if (energyIntervalRef.current) {
      clearInterval(energyIntervalRef.current);
      energyIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    cleanupAudio();
    setState('idle');
  }, [cleanupAudio]);

  const handleMicToggle = useCallback(async () => {
    if (state === 'listening') {
      const blob = await stopRecording();
      cleanupAudio();
      await handleSendAudio(blob);
    } else {
      await startRecording();
    }
  }, [state, stopRecording, cleanupAudio, handleSendAudio, startRecording]);

  const handleSend = useCallback(async () => {
    if (state !== 'listening') return;
    const blob = await stopRecording();
    cleanupAudio();
    await handleSendAudio(blob);
  }, [state, stopRecording, cleanupAudio, handleSendAudio]);

  useEffect(() => {
    return () => {
      if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      cleanupAudio();

      // Prorate final energy deduction
      if (sessionStartRef.current > 0) {
        const elapsed = (Date.now() - sessionStartRef.current) / 1000;
        const partialCost = computeLiveEnergy(elapsed, model) - lastDeduction;
        if (partialCost > 0.01) {
          deductEnergy(partialCost, 'live');
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotationDuration = state === 'speaking' ? 4 : state === 'thinking' ? 6 : state === 'listening' ? 8 : 20;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between py-8 px-4"
    >
      {/* Top bar */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          {complexMode && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">4o</span>
          )}
          <button onClick={() => setComplexMode(!complexMode)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${complexMode ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300' : 'bg-white/5 border border-white/[0.08] text-slate-400 hover:bg-white/10'}`} title="Mode Complexe: GPT-4o (2x énergie)">
            {complexMode ? 'Complexe ON' : 'Complexe'}
          </button>
          <span className={`w-2 h-2 rounded-full ${state === 'listening' ? 'bg-red-500 animate-pulse' : state === 'speaking' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-400 font-medium">IAI SYSTEM — Mode Live</span>
        </div>
        <div className="energy-badge">
          <Zap className="w-3.5 h-3.5" />
          <span className={energyColor(energy)}>{formatEnergy(energy)}</span>
        </div>
      </div>

      {/* Central circle with logo */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: rotationDuration, repeat: Infinity, ease: 'linear' }}
          className="relative w-[280px] h-[280px] flex items-center justify-center"
        >
          {/* Glow ring */}
          <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 ${
            state === 'speaking' ? 'bg-accent-500/30 opacity-100' :
            state === 'listening' ? 'bg-red-500/20 opacity-80' :
            state === 'thinking' ? 'bg-amber-500/20 opacity-80' :
            'bg-accent-500/10 opacity-50'
          }`} />
          {/* Outer ring */}
          <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${
            state === 'listening' ? 'border-red-500/40' :
            state === 'speaking' ? 'border-emerald-500/40' :
            state === 'thinking' ? 'border-amber-500/40' :
            'border-white/10'
          }`} />
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border border-white/[0.06]" />
          {/* Logo */}
          <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden bg-black flex items-center justify-center">
            <img
              src="/file_000000005d2c7243b572cb8771032a9b.png"
              alt="IAI SYSTEM"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Status text */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`text-lg font-semibold ${
                state === 'error' ? 'text-red-400' :
                state === 'speaking' ? 'text-emerald-400' :
                state === 'listening' ? 'text-red-400' :
                state === 'thinking' ? 'text-amber-400' :
                'text-slate-300'
              }`}
            >
              {STATUS_TEXT[state]}
            </motion.p>
          </AnimatePresence>
          {errorMsg && (
            <p className="text-xs text-red-400/70 mt-2 max-w-xs">{errorMsg}</p>
          )}
          {energyBlocked && (
            <p className="text-xs text-amber-400 mt-2 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Rechargez votre énergie (1% minimum)
            </p>
          )}
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="w-full max-w-2xl">
        {/* Audio visualizer */}
        <div className="flex items-center justify-center gap-1 h-16 mb-6">
          {audioLevels.map((level, i) => (
            <motion.div
              key={i}
              animate={{ height: `${Math.max(8, level * 60)}px` }}
              transition={{ duration: 0.05 }}
              className={`w-1 rounded-full ${
                state === 'listening' ? 'bg-red-400' :
                state === 'speaking' ? 'bg-emerald-400' :
                state === 'thinking' ? 'bg-amber-400' :
                'bg-slate-700'
              }`}
              style={{ height: '8px' }}
            />
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <Activity className={`w-5 h-5 ${state === 'listening' || state === 'speaking' ? 'text-accent-400' : 'text-slate-600'}`} />
          </div>

          <button
            onClick={handleStop}
            disabled={state === 'idle'}
            className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <Square className="w-5 h-5 text-red-400" />
          </button>

          <button
            onClick={handleSend}
            disabled={state !== 'listening'}
            className="w-14 h-14 rounded-full bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <Send className="w-5 h-5 text-accent-400" />
          </button>

          <button
            onClick={handleMicToggle}
            disabled={energyBlocked}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              state === 'listening'
                ? 'bg-red-500 shadow-glow scale-110'
                : 'bg-gradient-to-br from-accent-500 to-accent-600 hover:shadow-glow'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <Mic className="w-6 h-6 text-white" />
          </button>

          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
