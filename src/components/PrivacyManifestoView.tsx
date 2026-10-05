import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Lock,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  HardDrive,
  Users,
  GraduationCap,
} from 'lucide-react';

interface PrivacyManifestoViewProps {
  darkMode: boolean;
  onOpenSettings: () => void;
}

export const PrivacyManifestoView: React.FC<PrivacyManifestoViewProps> = ({
  darkMode,
  onOpenSettings,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const comparisonRows = [
    {
      feature: 'Student Notes & Essays Privacy',
      closed: 'Student notes, essays, and unreleased thesis ideas are transmitted to remote corporate servers and stored in telemetry datalakes.',
      open: 'Runs on open-weight models (Gemma 2, Llama) with 100% on-device local storage. No corporate entity sees or logs your notes.',
    },
    {
      feature: 'Academic Honor & Intellectual Property',
      closed: 'Course assignments and university intellectual property may be indexed and used to train future commercial AI models.',
      open: 'Zero model training on your data. Your research, lab findings, and study outlines remain strictly sovereign.',
    },
    {
      feature: 'Cost & Subscription Limits',
      closed: '$20-$200/month recurring fees with strict hourly rate limits right in the middle of finals week.',
      open: 'Free forever. Open-weight inference can run locally via Ollama with zero token costs and no hourly usage caps.',
    },
    {
      feature: 'Reliability & Offline Capability',
      closed: 'Fails during campus WiFi drops, flight travels, or server outages.',
      open: 'Can execute 100% offline directly on your laptop’s CPU/GPU without an internet connection.',
    },
  ];

  const models = [
    {
      name: 'Gemma 2 (9B / 27B)',
      developer: 'Google DeepMind',
      cmd: 'ollama run gemma2:9b',
      vram: '6GB VRAM (9B) / 16GB (27B)',
      desc: 'Exceptional academic reasoning, math comprehension, and intuitive pedagogical explanations.',
    },
    {
      name: 'Llama 3.2 (3B) / 3.3 (70B)',
      developer: 'Meta AI',
      cmd: 'ollama run llama3.2',
      vram: '2.5GB VRAM (3B) / 40GB (70B)',
      desc: 'Fast, compact, and highly capable for everyday lecture summaries and study planning.',
    },
    {
      name: 'Mistral NeMo (12B)',
      developer: 'Mistral AI',
      cmd: 'ollama run mistral-nemo',
      vram: '8GB VRAM',
      desc: 'Massive 128k context window, perfect for summarizing long university textbooks and papers.',
    },
    {
      name: 'Qwen 2.5 (7B / 14B)',
      developer: 'Alibaba Cloud',
      cmd: 'ollama run qwen2.5:7b',
      vram: '5GB VRAM (7B) / 10GB (14B)',
      desc: 'Top-tier code generation, logic puzzles, and multilingual translation for global students.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <ShieldCheck size={14} />
            <span>Privacy-First Academic Architecture</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Why Open-Weight AI Matters for College Students
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Study tools shouldn't compromise your privacy or harvest your notes. StudyMate AI is
            architected from the ground up to empower students with <strong>open-weight models (like Gemma 2)
            and sovereign local storage</strong>.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div
            className={`p-6 rounded-3xl border flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                1. 100% Student Privacy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your class essays, sensitive research notes, and quiz mistakes remain private to you.
                No third-party data broker monetizes your study habits.
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-3xl border flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Cpu size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                2. Open Weights (Gemma 2)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Built to leverage Google's open-weight Gemma 2 and community models via Ollama. You
                aren't trapped in closed, arbitrary corporate paywalls.
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-3xl border flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                3. Academic Integrity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                StudyMate AI functions as a patient tutor and pedagogical guide, helping you develop
                authentic comprehension rather than passive copy-pasting.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Open-Weights vs. Proprietary Big-Tech Cloud AI
          </h2>

          <div
            className={`rounded-3xl border overflow-hidden ${
              darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                    <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 w-1/4">
                      Aspect
                    </th>
                    <th className="p-4 font-semibold text-rose-600 dark:text-rose-400 w-3/8">
                      Closed Cloud EdTech
                    </th>
                    <th className="p-4 font-semibold text-emerald-600 dark:text-emerald-400 w-3/8">
                      StudyMate AI (Open-Weights)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                        {row.feature}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 leading-relaxed">
                        <div className="flex items-start gap-1.5">
                          <XCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                          <span>{row.closed}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{row.open}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Local Run Quick Guide */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Terminal size={18} className="text-indigo-500" />
              <span>Run Open-Weights Locally on Your Laptop (1-Line Commands)</span>
            </h2>
            <button
              onClick={onOpenSettings}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Configure in App &rarr;
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Install Ollama from <strong className="text-slate-700 dark:text-slate-300">ollama.com</strong>, then copy any command below into your terminal:
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {models.map((m) => (
              <div
                key={m.name}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{m.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.vram}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs border border-slate-800">
                  <span className="truncate mr-2 text-cyan-300">$ {m.cmd}</span>
                  <button
                    onClick={() => copyCommand(m.cmd)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd === m.cmd ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div
          className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            darkMode
              ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-900'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}
        >
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Customize your open-weight study engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Switch between cloud-bridged Gemma 2, local Ollama, or an offline private assistant.
            </p>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shrink-0 shadow-xs"
          >
            Open Engine Settings
          </button>
        </div>
      </div>
    </div>
  );
};
