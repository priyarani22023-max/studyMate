import React, { useState } from 'react';
import {
  X,
  Cpu,
  ShieldCheck,
  Check,
  RefreshCw,
  HardDrive,
  Download,
  Trash2,
  ExternalLink,
  Activity,
  Sliders,
} from 'lucide-react';
import { ModelConfig, ModelProvider } from '../types';
import { pingServerUrl } from '../services/api';
import { storage } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSaveConfig: (config: ModelConfig) => void;
  darkMode: boolean;
  onDataReset?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  darkMode,
  onDataReset,
}) => {
  const [provider, setProvider] = useState<ModelProvider>(config.provider);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);
  const [model, setModel] = useState(config.model);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [temperature, setTemperature] = useState(config.temperature);

  // Ping test state
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);

    const testUrl = provider === 'ollama' ? baseUrl : provider === 'openai_compatible' ? baseUrl : '/api/status';
    const result = await pingServerUrl(testUrl);
    setPingResult(result);
    setIsPinging(false);
  };

  const handleSave = () => {
    onSaveConfig({
      provider,
      baseUrl: baseUrl.trim(),
      model: model.trim(),
      apiKey: apiKey.trim(),
      temperature,
    });
    onClose();
  };

  const handleExportData = () => {
    const jsonStr = storage.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all conversations, tasks, flashcards, and journal entries? This action cannot be undone.'
      )
    ) {
      storage.clearAllData();
      if (onDataReset) onDataReset();
      onClose();
    }
  };

  const modelPresets: Record<ModelProvider, { name: string; model: string; desc: string }[]> = {
    gemini: [
      { name: 'Gemma 2 (27B Equivalent)', model: 'gemma-2-27b-it', desc: 'Google’s premier open weights, hosted via server bridge' },
      { name: 'Gemini 3.8 Flash (High Speed)', model: 'gemini-3.8-flash', desc: 'Instant reasoning and responsive answers' },
    ],
    ollama: [
      { name: 'Llama 3.2 (3B Compact)', model: 'llama3.2', desc: 'Lightning fast on laptops and standard CPUs' },
      { name: 'Gemma 2 (9B Instruction)', model: 'gemma2:9b', desc: 'Balanced reasoning and natural conversational warmth' },
      { name: 'Mistral NeMo (12B)', model: 'mistral-nemo', desc: 'State-of-the-art context window and instruction following' },
      { name: 'Qwen 2.5 (7B / 14B)', model: 'qwen2.5:7b', desc: 'Superb coding, logic, and multi-turn precision' },
      { name: 'DeepSeek R1 Distill (8B)', model: 'deepseek-r1:8b', desc: 'Open-weights reasoning model with chain-of-thought' },
    ],
    openai_compatible: [
      { name: 'LM Studio / Local vLLM', model: 'local-model', desc: 'Runs against your custom local API server' },
      { name: 'Groq / Together Open-Weights', model: 'llama-3.3-70b-versatile', desc: 'Ultra-low latency open-weight inference' },
    ],
    offline: [
      { name: 'Built-in Companion Engine', model: 'offline-companion-heuristic', desc: 'Zero network or local server required' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 md:p-8 space-y-6 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Inference Engine & Settings</h2>
              <p className="text-xs text-slate-500">Configure your open-weight or local AI provider</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Provider Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            AI Engine Provider
          </label>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'gemini' as ModelProvider, label: 'Gemma / Server Bridge', desc: 'Zero config, high intelligence' },
              { id: 'ollama' as ModelProvider, label: 'Local Ollama', desc: '100% private on your machine' },
              { id: 'openai_compatible' as ModelProvider, label: 'Custom OpenAI / vLLM', desc: 'LM Studio, Groq, Together' },
              { id: 'offline' as ModelProvider, label: 'Offline Assistant', desc: 'No network / local engine' },
            ].map((p) => {
              const isSelected = provider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setProvider(p.id);
                    if (p.id === 'ollama' && !baseUrl.includes('11434')) {
                      setBaseUrl('http://localhost:11434');
                      setModel('llama3.2');
                    }
                    if (p.id === 'gemini') {
                      setModel('gemma-2-27b-it');
                    }
                  }}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{p.label}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{p.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Endpoint Configuration */}
        {provider === 'ollama' && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ollama Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <button
                  onClick={handleTestPing}
                  disabled={isPinging}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Activity size={13} />
                  <span>{isPinging ? 'Pinging...' : 'Ping Port'}</span>
                </button>
              </div>
            </div>

            {pingResult && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
                  pingResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <span>
                  {pingResult.success
                    ? `Connected to Ollama successfully! (${pingResult.latencyMs}ms)`
                    : `Could not reach Ollama: ${pingResult.error || 'Check if ollama serve is running'}`}
                </span>
              </div>
            )}
          </div>
        )}

        {provider === 'openai_compatible' && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <label className="block font-semibold mb-1">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:1234/v1 or https://api.groq.com/openai/v1"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">API Key (Optional for local)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Bearer token (if required)"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        )}

        {/* 3. Model Presets & Custom Model Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Select Model
          </label>

          <div className="space-y-1.5">
            {modelPresets[provider]?.map((preset) => (
              <button
                key={preset.model}
                onClick={() => setModel(preset.model)}
                className={`w-full p-2.5 text-left rounded-xl border text-xs flex items-center justify-between transition-colors ${
                  model === preset.model
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="font-semibold block">{preset.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{preset.model}</span>
                </div>
                {model === preset.model && <Check size={16} className="text-indigo-500" />}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="text-[11px] text-slate-500 block mb-1">
              Or enter custom model tag:
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* 4. Temperature Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Creativity / Temperature
            </span>
            <span className="font-mono text-slate-500">{temperature}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.2"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Precise / Focused</span>
            <span>Balanced</span>
            <span>Creative / Wild</span>
          </div>
        </div>

        {/* 5. Data Privacy & Backup */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <HardDrive size={14} className="text-emerald-500" />
            <span>Local Storage & Data Sovereignty</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            All your conversations, study flashcards, habits, and journals are saved directly in
            your browser's local sandbox.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleExportData}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              <span>Export All Data (JSON)</span>
            </button>
            <button
              onClick={handleClearData}
              className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center gap-1.5 transition-colors ml-auto"
            >
              <Trash2 size={13} />
              <span>Clear Local Data</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
