import React from 'react';
import { Menu, Settings, ShieldCheck, UserCheck, Plus, Sparkles } from 'lucide-react';
import { AppMode, ModelConfig, StudentProfile } from '../types';

interface HeaderProps {
  activeMode: AppMode;
  onToggleMobileNav: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onNewSession?: () => void;
  studentProfile: StudentProfile;
  modelConfig: ModelConfig;
  darkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onToggleMobileNav,
  onOpenSettings,
  onOpenProfile,
  onNewSession,
  studentProfile,
  modelConfig,
  darkMode,
}) => {
  const modeLabels: Record<AppMode, string> = {
    home: 'Progress Dashboard & Overview',
    tutor: 'AI Tutor & Concept Explanations',
    notes: 'Lecture Notes Summarizer',
    quiz: '5-Question Quiz Generator',
    planner: 'College Study Planner',
    privacy: 'Open-Weights & Student Privacy',
  };

  return (
    <header
      className={`h-16 px-4 md:px-8 border-b flex items-center justify-between transition-colors z-20 shrink-0 ${
        darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-white/70 border-slate-200'
      } backdrop-blur-md`}
    >
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm truncate">
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {modeLabels[activeMode]}
          </span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">/</span>
          <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
            {studentProfile.name} ({studentProfile.university})
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation / Contextual Trust Markers */}
      <div className="hidden xl:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Local Device Privacy</span>
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        <span className="flex items-center gap-1">
          <Sparkles size={12} className="text-indigo-500" />
          <span>Gemma 2 Architecture</span>
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
          {modelConfig.model}
        </span>
      </div>

      {/* Zone 3: Primary Action buttons */}
      <div className="flex items-center gap-2">
        {onNewSession && activeMode === 'tutor' && (
          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Question</span>
          </button>
        )}

        <button
          onClick={onOpenProfile}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Student Profile"
          aria-label="Student Profile"
        >
          <UserCheck size={18} />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Inference Engine Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
