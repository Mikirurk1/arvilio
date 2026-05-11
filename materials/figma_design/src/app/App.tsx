import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { LessonsView } from './components/LessonsView';
import { LessonDetail } from './components/LessonDetail';
import { ChatView } from './components/ChatView';
import { VocabularyView } from './components/VocabularyView';
import { MaterialsView } from './components/MaterialsView';
import { QuizView } from './components/QuizView';
import { SpeakingView } from './components/SpeakingView';
import { PracticeView } from './components/PracticeView';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'lessons' | 'chat' | 'practice' | 'materials'>('dashboard');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedPracticeActivity, setSelectedPracticeActivity] = useState<'vocabulary' | 'quiz' | 'speaking' | null>(null);

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleBackToLessons = () => {
    setSelectedLessonId(null);
  };

  const handlePracticeActivitySelect = (activity: 'vocabulary' | 'quiz' | 'speaking') => {
    setSelectedPracticeActivity(activity);
  };

  const handleViewChange = (view: 'dashboard' | 'calendar' | 'lessons' | 'chat' | 'practice' | 'materials') => {
    setCurrentView(view);
    if (view !== 'practice') {
      setSelectedPracticeActivity(null);
    }
  };

  return (
    <div className="size-full flex" style={{ backgroundColor: '#f7f6f3' }}>
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <div className="flex-1 flex flex-col">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'lessons' && !selectedLessonId && (
          <LessonsView onLessonSelect={handleLessonSelect} />
        )}
        {currentView === 'lessons' && selectedLessonId && (
          <LessonDetail lessonId={selectedLessonId} onBack={handleBackToLessons} />
        )}
        {currentView === 'chat' && <ChatView />}
        {currentView === 'practice' && !selectedPracticeActivity && (
          <PracticeView onActivitySelect={handlePracticeActivitySelect} />
        )}
        {currentView === 'practice' && selectedPracticeActivity === 'vocabulary' && <VocabularyView />}
        {currentView === 'practice' && selectedPracticeActivity === 'quiz' && <QuizView />}
        {currentView === 'practice' && selectedPracticeActivity === 'speaking' && <SpeakingView />}
        {currentView === 'materials' && <MaterialsView />}
      </div>
    </div>
  );
}
