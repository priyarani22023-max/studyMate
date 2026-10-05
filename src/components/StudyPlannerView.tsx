import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  Check,
  Tag,
  BookOpen,
} from 'lucide-react';
import { Habit, ModelConfig, StudentProfile, Task } from '../types';
import { streamChat } from '../services/api';

interface StudyPlannerViewProps {
  tasks: Task[];
  onSaveTasks: (tasks: Task[]) => void;
  habits: Habit[];
  onSaveHabits: (habits: Habit[]) => void;
  onIncrementSessionsCount: () => void;
  modelConfig: ModelConfig;
  studentProfile: StudentProfile;
  darkMode: boolean;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  tasks,
  onSaveTasks,
  habits,
  onSaveHabits,
  onIncrementSessionsCount,
  modelConfig,
  studentProfile,
  darkMode,
}) => {
  // New task form state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newTaskCategory, setNewTaskCategory] = useState<'study' | 'assignment' | 'exam' | 'reading'>('exam');
  const [newTaskTime, setNewTaskTime] = useState('45 mins');
  const [newTaskDue, setNewTaskDue] = useState('Tomorrow');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // AI Day Architect state
  const [syllabusDump, setSyllabusDump] = useState('');
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [scheduleResult, setScheduleResult] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<string[]>([]);

  // Habit state
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const task: Task = {
      id: 'task_' + Date.now(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      timeEstimate: newTaskTime,
      dueDate: newTaskDue,
      createdAt: Date.now(),
    };

    onSaveTasks([task, ...tasks]);
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    onSaveTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    onSaveTasks(tasks.filter((t) => t.id !== taskId));
  };

  const toggleHabit = (habitId: string) => {
    onSaveHabits(
      habits.map((h) => {
        if (h.id === habitId) {
          const newCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: newCompleted,
            streak: newCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const habit: Habit = {
      id: 'h_' + Date.now(),
      title: newHabitTitle.trim(),
      streak: 1,
      completedToday: true,
      iconName: 'Brain',
      category: 'Study Routine',
    };

    onSaveHabits([...habits, habit]);
    setNewHabitTitle('');
    setShowAddHabit(false);
  };

  const handleArchitectSchedule = async () => {
    if (!syllabusDump.trim() || isArchitecting) return;

    setIsArchitecting(true);
    setScheduleResult('');
    setExtractedTasks([]);

    const prompt = `Here are my upcoming college exam dates, assignments, and study goals:
"${syllabusDump}"

As StudyMate AI, generate an optimized, high-yield college study schedule engineered to maximize retention and prevent burnout.
Guidelines:
1. Break study sessions into focused Pomodoro intervals (e.g., 50m deep focus, 10m cognitive break).
2. Prioritize upcoming exams and high-weight assignments first.
3. Schedule active recall and practice problems during peak morning/midday hours.
4. Conclude with a section titled:
--- TASKS_TO_IMPORT ---
Followed by a simple bullet list of clean action tasks extracted from this plan (e.g. "- Review Organic Chem Ch 4 mechanisms (45 mins)").`;

    let accumulated = '';
    await streamChat({
      messages: [{ role: 'user', content: prompt }],
      modelConfig,
      studentProfile,
      modeDescription:
        'You are an executive academic study planner designing a balanced college schedule.',
      onChunk: (chunk) => {
        accumulated += chunk;
        setScheduleResult(accumulated);
      },
      onDone: (full) => {
        setIsArchitecting(false);
        onIncrementSessionsCount();
        const text = full || accumulated;
        if (text.includes('--- TASKS_TO_IMPORT ---')) {
          const parts = text.split('--- TASKS_TO_IMPORT ---');
          const taskSection = parts[1] || '';
          const lines = taskSection
            .split('\n')
            .map((l) => l.replace(/^[-*•\d.]\s*/, '').trim())
            .filter((l) => l.length > 2);
          setExtractedTasks(lines);
        }
      },
      onError: (err) => {
        setIsArchitecting(false);
        setScheduleResult(`Schedule generation error: ${err}`);
      },
    });
  };

  const handleImportExtractedTasks = () => {
    if (extractedTasks.length === 0) return;

    const newTasks: Task[] = extractedTasks.map((t, idx) => ({
      id: 'task_import_' + Date.now() + '_' + idx,
      text: t,
      completed: false,
      priority: 'high',
      category: 'study',
      timeEstimate: '45 mins',
      dueDate: 'This week',
      createdAt: Date.now() + idx,
    }));

    onSaveTasks([...newTasks, ...tasks]);
    setExtractedTasks([]);
    alert(`Imported ${newTasks.length} study tasks into your planner!`);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterCategory === 'all') return true;
    return t.category === filterCategory;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className="text-amber-600 dark:text-amber-400" />
              <span>College Study Planner & Habits</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Structure exam prep, eliminate cramming stress, and maintain daily study momentum.
            </p>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              Completed Today:{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-mono">
                {completedCount} / {tasks.length}
              </strong>
            </span>
          </div>
        </div>

        {/* 1. Daily Study Habits & Streaks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={15} className="text-amber-500" />
              <span>Daily Study Habit Streaks</span>
            </h2>
            <button
              onClick={() => setShowAddHabit(!showAddHabit)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              {showAddHabit ? 'Cancel' : '+ Add Habit'}
            </button>
          </div>

          {showAddHabit && (
            <form onSubmit={handleAddHabit} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-2">
              <input
                type="text"
                placeholder="Habit title (e.g. 50m Deep Focus, Daily Practice Quiz)..."
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700"
              >
                Save
              </button>
            </form>
          )}

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                  habit.completedToday
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                    : darkMode
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {habit.category}
                  </span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {habit.title}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 font-mono font-medium mt-1">
                    <Flame size={12} />
                    <span>{habit.streak} day streak</span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                    habit.completedToday
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 text-transparent'
                  }`}
                >
                  <Check size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. AI Study Schedule Architect */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-gradient-to-br from-amber-50/40 via-indigo-50/30 to-white border-amber-100 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Study Schedule Architect
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Paste your syllabus deadlines, test dates, or messy study goals. StudyMate AI will
            organize them into a structured Pomodoro timeline.
          </p>

          <div className="space-y-3">
            <textarea
              rows={2}
              value={syllabusDump}
              onChange={(e) => setSyllabusDump(e.target.value)}
              placeholder="e.g. Midterm in 4 days on Microeconomics, CS homework due Friday night, need to read 2 chapters of Biology, and practice flashcards..."
              className="w-full px-3.5 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                Optimized with cognitive rest breaks
              </span>
              <button
                onClick={handleArchitectSchedule}
                disabled={!syllabusDump.trim() || isArchitecting}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles size={13} />
                <span>{isArchitecting ? 'Architecting Schedule...' : 'Build Study Schedule'}</span>
              </button>
            </div>
          </div>

          {scheduleResult && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                {scheduleResult}
              </div>

              {extractedTasks.length > 0 && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    Found {extractedTasks.length} study tasks in your plan!
                  </span>
                  <button
                    onClick={handleImportExtractedTasks}
                    className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Import into Study Tasks
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Interactive Study Task List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Study Tasks & Deadlines
            </h2>

            {/* Category Filter */}
            <div className="flex items-center gap-1 text-xs">
              {['all', 'exam', 'reading', 'assignment', 'study'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    filterCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Form */}
          <form
            onSubmit={handleAddTask}
            className={`p-3 rounded-2xl border flex flex-wrap items-center gap-2 ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <input
              type="text"
              placeholder="Add a new study task or review item..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300"
            >
              <option value="exam">Exam Prep</option>
              <option value="reading">Reading</option>
              <option value="assignment">Assignment</option>
              <option value="study">Study</option>
            </select>

            <input
              type="text"
              placeholder="e.g. 45 mins"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-24 px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300"
            />

            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No study tasks in this category. Add a task or use AI Day Architect above!
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                    task.completed
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                      : darkMode
                      ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-indigo-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0`}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-xs sm:text-sm block truncate ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100 font-medium'
                        }`}
                      >
                        {task.text}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="capitalize">{task.category}</span>
                        <span>·</span>
                        {task.timeEstimate && <span>{task.timeEstimate}</span>}
                        {task.dueDate && (
                          <>
                            <span>·</span>
                            <span>Due: {task.dueDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        task.priority === 'high'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
