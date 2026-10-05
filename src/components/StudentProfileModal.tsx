import React, { useState } from 'react';
import { X, User, GraduationCap, Check } from 'lucide-react';
import { StudentProfile } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
  darkMode: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  darkMode,
}) => {
  const [name, setName] = useState(profile.name);
  const [major, setMajor] = useState(profile.major);
  const [university, setUniversity] = useState(profile.university);
  const [year, setYear] = useState(profile.year);
  const [studyGoal, setStudyGoal] = useState(profile.studyGoal);
  const [style, setStyle] = useState<StudentProfile['preferredExplanationStyle']>(
    profile.preferredExplanationStyle
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveProfile({
      name: name.trim() || 'Student',
      major: major.trim() || 'General Studies',
      university: university.trim() || 'University',
      year: year.trim() || 'Undergraduate',
      studyGoal: studyGoal.trim() || 'Ace my classes and build deep understanding',
      preferredExplanationStyle: style,
    });
    onClose();
  };

  const styles: { id: StudentProfile['preferredExplanationStyle']; label: string; desc: string; icon: string }[] = [
    {
      id: 'simple',
      label: 'Simple & Intuitive (ELI5 / Clear)',
      desc: 'Focus on intuitive core mechanics with simple vocabulary and real-world clarity.',
      icon: '💡',
    },
    {
      id: 'exam_prep',
      label: 'Exam & High-Yield Focus',
      desc: 'Highlight testable definitions, formulas, problem patterns, and common exam traps.',
      icon: '🎯',
    },
    {
      id: 'deep_dive',
      label: 'Rigorous Academic Depth',
      desc: 'Deep theoretical and mathematical rigor suitable for upper-division courses.',
      icon: '🔬',
    },
    {
      id: 'analogies',
      label: 'Analogy & Story-Driven',
      desc: 'Ground abstract college theory in memorable physical comparisons and metaphors.',
      icon: '🧩',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 md:p-8 space-y-6 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Student Academic Profile</h2>
              <p className="text-xs text-slate-500">Personalize StudyMate AI to your degree & learning style</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* 1. Student Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. Junior (Year 3)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Major / Degree Program
            </label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Computer Science & Cognitive Psychology"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              University / College
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="e.g. State University"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
            />
          </div>
        </div>

        {/* 2. Primary Study Goal */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Current Academic Focus / Semester Target
          </label>
          <input
            type="text"
            value={studyGoal}
            onChange={(e) => setStudyGoal(e.target.value)}
            placeholder="e.g. Master Data Structures & finish semester with 3.8+ GPA"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
          />
        </div>

        {/* 3. Preferred Explanation Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Preferred Pedagogical Style
          </label>

          <div className="space-y-2">
            {styles.map((item) => {
              const isSelected = style === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setStyle(item.id)}
                  className={`w-full p-3 text-left rounded-2xl border text-xs transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div className="flex-1">
                    <span className="font-bold block leading-tight">{item.label}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                  {isSelected && <Check size={16} className="text-indigo-600 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Save Student Profile
          </button>
        </div>
      </div>
    </div>
  );
};
