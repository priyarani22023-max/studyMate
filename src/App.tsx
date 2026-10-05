/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppMode,
  Conversation,
  Habit,
  ModelConfig,
  NoteSummary,
  QuizSet,
  StudentProfile,
  StudyMetrics,
  Task,
} from './types';
import { storage } from './services/storage';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AITutorView } from './components/AITutorView';
import { NotesSummarizerView } from './components/NotesSummarizerView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { PrivacyManifestoView } from './components/PrivacyManifestoView';
import { SettingsModal } from './components/SettingsModal';
import { StudentProfileModal } from './components/StudentProfileModal';

export default function App() {
  // Application Mode (Navbar: Home, AI Tutor, Notes, Quiz, Planner, Privacy)
  const [activeMode, setActiveMode] = useState<AppMode>('home');

  // Dark Mode (Light theme as default)
  const [darkMode, setDarkMode] = useState<boolean>(() => storage.getDarkMode());

  // Data States
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    storage.getConversations()
  );
  const [activeConvoId, setActiveConvoId] = useState<string>(() =>
    storage.getActiveConvoId()
  );
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [habits, setHabits] = useState<Habit[]>(() => storage.getHabits());
  const [noteSummaries, setNoteSummaries] = useState<NoteSummary[]>(() =>
    storage.getNoteSummaries()
  );
  const [quizSets, setQuizSets] = useState<QuizSet[]>(() =>
    storage.getQuizSets()
  );
  const [metrics, setMetrics] = useState<StudyMetrics>(() =>
    storage.getMetrics()
  );

  // Student & Model Configuration
  const [modelConfig, setModelConfig] = useState<ModelConfig>(() =>
    storage.getModelConfig()
  );
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() =>
    storage.getStudentProfile()
  );

  // Modals & Mobile Drawer
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    storage.saveDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Metric helpers
  const handleIncrementMetric = (key: keyof StudyMetrics, amount = 1) => {
    const updated = storage.incrementMetric(key, amount);
    setMetrics({ ...updated });
  };

  // Conversation helpers
  const handleSaveConversations = (convos: Conversation[]) => {
    setConversations(convos);
    storage.saveConversations(convos);
  };

  const handleUpdateActiveConvo = (updatedConvo: Conversation) => {
    const updated = conversations.map((c) =>
      c.id === updatedConvo.id ? updatedConvo : c
    );
    handleSaveConversations(updated);
  };

  const handleNewConversation = () => {
    const newConvo: Conversation = {
      id: 'convo_' + Date.now(),
      title: 'New Study Question',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'tutor',
      messages: [
        {
          id: 'msg_welcome_' + Date.now(),
          role: 'assistant',
          content: `Hi ${studentProfile.name}! I'm ready for your questions. What college concept, problem, or lecture topic should we break down?`,
          timestamp: new Date().toISOString(),
          modelUsed: modelConfig.model,
        },
      ],
    };
    const updated = [newConvo, ...conversations];
    handleSaveConversations(updated);
    setActiveConvoId(newConvo.id);
    storage.saveActiveConvoId(newConvo.id);
  };

  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    handleSaveConversations(updated);
    if (activeConvoId === id && updated.length > 0) {
      setActiveConvoId(updated[0].id);
      storage.saveActiveConvoId(updated[0].id);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConvoId(id);
    storage.saveActiveConvoId(id);
  };

  // Study tasks & habits
  const handleSaveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const handleSaveHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    storage.saveHabits(newHabits);
  };

  // Note summaries & quizzes
  const handleSaveNoteSummaries = (newSummaries: NoteSummary[]) => {
    setNoteSummaries(newSummaries);
    storage.saveNoteSummaries(newSummaries);
  };

  const handleSaveQuizSets = (newSets: QuizSet[]) => {
    setQuizSets(newSets);
    storage.saveQuizSets(newSets);
  };

  // Configurations
  const handleSaveModelConfig = (newConfig: ModelConfig) => {
    setModelConfig(newConfig);
    storage.saveModelConfig(newConfig);
  };

  const handleSaveStudentProfile = (newProfile: StudentProfile) => {
    setStudentProfile(newProfile);
    storage.saveStudentProfile(newProfile);
  };

  const handleDataReset = () => {
    setConversations(storage.getConversations());
    setTasks(storage.getTasks());
    setHabits(storage.getHabits());
    setNoteSummaries(storage.getNoteSummaries());
    setQuizSets(storage.getQuizSets());
    setMetrics(storage.getMetrics());
  };

  return (
    <div
      className={`flex h-screen w-full overflow-hidden transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-20 ${
            darkMode ? 'bg-indigo-600' : 'bg-blue-300'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-15 ${
            darkMode ? 'bg-cyan-600' : 'bg-indigo-300'
          }`}
        />
      </div>

      {/* Main Sidebar Navigation */}
      <Navigation
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        modelConfig={modelConfig}
        studentProfile={studentProfile}
        onOpenSettings={() => setShowSettings(true)}
        onOpenProfile={() => setShowProfile(true)}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Study Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <Header
          activeMode={activeMode}
          onToggleMobileNav={() => setIsOpenMobile(!isOpenMobile)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenProfile={() => setShowProfile(true)}
          onNewSession={activeMode === 'tutor' ? handleNewConversation : undefined}
          studentProfile={studentProfile}
          modelConfig={modelConfig}
          darkMode={darkMode}
        />

        {/* Core Section View Routing */}
        <div className="flex-1 flex overflow-hidden">
          {/* 1. Progress Dashboard & Home */}
          {activeMode === 'home' && (
            <DashboardView
              metrics={metrics}
              studentProfile={studentProfile}
              tasks={tasks}
              noteSummaries={noteSummaries}
              quizSets={quizSets}
              onNavigate={(mode) => setActiveMode(mode)}
              darkMode={darkMode}
            />
          )}

          {/* 2. AI Tutor */}
          {activeMode === 'tutor' && (
            <AITutorView
              conversations={conversations}
              activeConvoId={activeConvoId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onUpdateConversation={handleUpdateActiveConvo}
              onIncrementQuestionCount={() => handleIncrementMetric('questionsAsked')}
              modelConfig={modelConfig}
              studentProfile={studentProfile}
              darkMode={darkMode}
            />
          )}

          {/* 3. Notes Summarizer */}
          {activeMode === 'notes' && (
            <NotesSummarizerView
              noteSummaries={noteSummaries}
              onSaveSummaries={handleSaveNoteSummaries}
              onIncrementNotesCount={() => handleIncrementMetric('notesSummarized')}
              modelConfig={modelConfig}
              studentProfile={studentProfile}
              darkMode={darkMode}
            />
          )}

          {/* 4. 5-Question Quiz Generator */}
          {activeMode === 'quiz' && (
            <QuizGeneratorView
              quizSets={quizSets}
              onSaveQuizSets={handleSaveQuizSets}
              onIncrementQuizCount={() => handleIncrementMetric('quizzesCreated')}
              modelConfig={modelConfig}
              studentProfile={studentProfile}
              darkMode={darkMode}
            />
          )}

          {/* 5. Study Planner & Schedule Architect */}
          {activeMode === 'planner' && (
            <StudyPlannerView
              tasks={tasks}
              onSaveTasks={handleSaveTasks}
              habits={habits}
              onSaveHabits={handleSaveHabits}
              onIncrementSessionsCount={() => handleIncrementMetric('studySessions')}
              modelConfig={modelConfig}
              studentProfile={studentProfile}
              darkMode={darkMode}
            />
          )}

          {/* 6. Open-Weights Privacy Manifesto */}
          {activeMode === 'privacy' && (
            <PrivacyManifestoView
              darkMode={darkMode}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={modelConfig}
        onSaveConfig={handleSaveModelConfig}
        darkMode={darkMode}
        onDataReset={handleDataReset}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={studentProfile}
        onSaveProfile={handleSaveStudentProfile}
        darkMode={darkMode}
      />
    </div>
  );
}
