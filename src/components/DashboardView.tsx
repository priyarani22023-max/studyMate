import React from 'react';
import {
  HelpCircle,
  FileText,
  CheckSquare,
  Clock,
  ArrowRight,
  Flame,
  ShieldCheck,
  Sparkles,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AppMode, NoteSummary, QuizSet, StudentProfile, StudyMetrics, Task } from '../types';

interface DashboardViewProps {
  metrics: StudyMetrics;
  studentProfile: StudentProfile;
  tasks: Task[];
  noteSummaries: NoteSummary[];
  quizSets: QuizSet[];
  onNavigate: (mode: AppMode) => void;
  darkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  studentProfile,
  tasks,
  noteSummaries,
  quizSets,
  onNavigate,
  darkMode,
}) => {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Welcome Hero Banner */}
        <div
          className={`p-6 md:p-8 rounded-3xl border relative overflow-hidden transition-all ${
            darkMode
              ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800'
              : 'bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border-blue-100 shadow-sm'
          }`}
        >
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Sparkles size={13} />
              <span>Study Smarter. Learn Better.</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome back, {studentProfile.name}! 👋
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your college study hub powered by open-weight AI. Your lectures, notes, and quiz results
              stay private and locally sovereign on your machine.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {studentProfile.major}
              </span>
              <span>·</span>
              <span>{studentProfile.university}</span>
              <span>·</span>
              <span>{studentProfile.year}</span>
            </div>
          </div>
        </div>

        {/* 1. Core Metrics Grid (Questions Asked, Notes Summarized, Quizzes Created, Study Sessions) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Study Performance Metrics
            </h2>
            <span className="text-xs font-mono text-slate-400">Synced to Local Storage</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div
              onClick={() => onNavigate('tutor')}
              className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Questions Asked
                </span>
                <HelpCircle size={18} />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {metrics.questionsAsked}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                <span>Ask AI Tutor</span>
                <ArrowRight size={11} />
              </p>
            </div>

            {/* Metric 2 */}
            <div
              onClick={() => onNavigate('notes')}
              className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Notes Summarized
                </span>
                <FileText size={18} />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {metrics.notesSummarized}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                <span>Paste lecture notes</span>
                <ArrowRight size={11} />
              </p>
            </div>

            {/* Metric 3 */}
            <div
              onClick={() => onNavigate('quiz')}
              className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Quizzes Created
                </span>
                <CheckSquare size={18} />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {metrics.quizzesCreated}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                <span>Take 5-MCQ Quiz</span>
                <ArrowRight size={11} />
              </p>
            </div>

            {/* Metric 4 */}
            <div
              onClick={() => onNavigate('planner')}
              className={`p-5 rounded-2xl border cursor-pointer group transition-all ${
                darkMode
                  ? 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Study Sessions
                </span>
                <Clock size={18} />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {metrics.studySessions}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                <span>View planner</span>
                <ArrowRight size={11} />
              </p>
            </div>
          </div>
        </div>

        {/* 2. Quick Action Launchers */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Quick Study Tools
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('tutor')}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                darkMode
                  ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500 hover:bg-slate-800/40'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <HelpCircle size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ask AI Tutor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  Get clear explanations for difficult college concepts with analogies.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Launch Tutor &rarr;
              </span>
            </button>

            <button
              onClick={() => onNavigate('notes')}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                darkMode
                  ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500 hover:bg-slate-800/40'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <FileText size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Summarize Notes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  Extract concise summaries, high-yield bullet points, and key terms.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Summarize &rarr;
              </span>
            </button>

            <button
              onClick={() => onNavigate('quiz')}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                darkMode
                  ? 'bg-slate-900/40 border-slate-800 hover:border-emerald-500 hover:bg-slate-800/40'
                  : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckSquare size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  5-MCQ Quiz
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  Generate adaptive practice tests with real-time score grading.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Start Quiz &rarr;
              </span>
            </button>

            <button
              onClick={() => onNavigate('planner')}
              className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                darkMode
                  ? 'bg-slate-900/40 border-slate-800 hover:border-amber-500 hover:bg-slate-800/40'
                  : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <CalendarCheck size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Study Planner
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  Organize assignments, exam blocks, and daily study streaks.
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Open Planner &rarr;
              </span>
            </button>
          </div>
        </div>

        {/* 3. Two-Column Activity & Upcoming Study Tasks */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Study Deadlines */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Active Study Tasks ({pendingTasks.length})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('planner')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {task.text}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {task.category} · {task.timeEstimate || '30 mins'}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>{completedTasks.length} tasks completed this semester</span>
              <span className="font-mono text-emerald-500 font-medium">Keep it up!</span>
            </div>
          </div>

          {/* Recent Notes Summaries */}
          <div
            className={`p-5 rounded-3xl border flex flex-col justify-between ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Recent Lecture Summaries
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('notes')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  View Notes
                </button>
              </div>

              <div className="space-y-3 mt-3">
                {noteSummaries.slice(0, 2).map((summary) => (
                  <div
                    key={summary.id}
                    onClick={() => onNavigate('notes')}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs cursor-pointer hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      <span className="truncate">{summary.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {summary.createdAt}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                      {summary.conciseSummary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-emerald-500" />
                <span>Zero telemetry · 100% on-device</span>
              </span>
              <button
                onClick={() => onNavigate('privacy')}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-[11px]"
              >
                Why open-weights?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
