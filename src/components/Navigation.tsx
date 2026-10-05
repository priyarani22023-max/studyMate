import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  HelpCircle,
  CalendarCheck,
  ShieldCheck,
  Settings,
  User,
  Sun,
  Moon,
  GraduationCap,
  Cpu,
  Lock,
} from 'lucide-react';
import { AppMode, ModelConfig, StudentProfile } from '../types';

interface NavigationProps {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  modelConfig: ModelConfig;
  studentProfile: StudentProfile;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeMode,
  setActiveMode,
  darkMode,
  setDarkMode,
  modelConfig,
  studentProfile,
  onOpenSettings,
  onOpenProfile,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems = [
    { mode: 'home' as AppMode, label: 'Home', icon: LayoutDashboard, description: 'Progress dashboard' },
    { mode: 'tutor' as AppMode, label: 'AI Tutor', icon: MessageSquare, description: 'Ask questions & concepts' },
    { mode: 'notes' as AppMode, label: 'Notes', icon: FileText, description: 'Summarizer & key terms' },
    { mode: 'quiz' as AppMode, label: 'Quiz', icon: HelpCircle, description: 'Generate 5 MCQs' },
    { mode: 'planner' as AppMode, label: 'Planner', icon: CalendarCheck, description: 'Tasks & study schedule' },
    { mode: 'privacy' as AppMode, label: 'Privacy', icon: ShieldCheck, description: 'Open-weight sovereignty' },
  ];

  const handleNavClick = (mode: AppMode) => {
    setActiveMode(mode);
    setIsOpenMobile(false);
  };

  const getProviderLabel = () => {
    if (modelConfig.provider === 'ollama') return `Ollama (${modelConfig.model})`;
    if (modelConfig.provider === 'gemini') return `Gemma 2 (${modelConfig.model.replace('-it', '')})`;
    if (modelConfig.provider === 'openai_compatible') return `Custom API (${modelConfig.model})`;
    return 'Offline Private';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-all duration-300 border-r ${
          darkMode
            ? 'bg-slate-950/95 border-slate-800 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Zone */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-cyan-300">
                <GraduationCap size={22} className="text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg leading-none">
                  StudyMate AI
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ready" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Study Smarter. Learn Better.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Student Profile Quick Banner */}
        <div className="px-4 pt-4 pb-2">
          <button
            onClick={onOpenProfile}
            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
              darkMode
                ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50'
                : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <User size={15} />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  Student: {studentProfile.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {studentProfile.major}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 shrink-0 ml-1">
              Profile
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => handleNavClick(item.mode)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-medium'
                    : darkMode
                    ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  size={19}
                  className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 shrink-0'}
                />
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-sm block leading-tight">{item.label}</span>
                  <span
                    className={`text-[11px] truncate block ${
                      isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Status & Settings */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
          {/* Active Model Indicator */}
          <button
            onClick={onOpenSettings}
            className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              darkMode
                ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Cpu size={15} className="text-indigo-500 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider leading-none mb-0.5">
                  Open-Weight Engine
                </span>
                <span className="text-xs font-mono font-medium truncate block">
                  {getProviderLabel()}
                </span>
              </div>
            </div>
            <Settings size={15} className="text-slate-400 shrink-0" />
          </button>

          {/* Privacy badge */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock size={12} className="text-emerald-500" />
              <span>Private Local Storage</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Gemma 2</span>
          </div>
        </div>
      </aside>
    </>
  );
};
