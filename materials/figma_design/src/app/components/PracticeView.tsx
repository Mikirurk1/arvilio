import React from 'react';
import { BookOpen, MessageSquare, Mic, Gamepad2, Trophy, ArrowRight } from 'lucide-react';

interface PracticeViewProps {
  onActivitySelect: (activity: 'vocabulary' | 'quiz' | 'speaking') => void;
}

const practiceActivities = [
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    description: 'Review and learn new words from your lessons',
    icon: BookOpen,
    color: '#16a97a',
    stats: '4 new words',
    gradient: 'linear-gradient(135deg, #16a97a15, #16a97a08)'
  },
  {
    id: 'quiz',
    title: 'Quizzes',
    description: 'Test your knowledge with interactive quizzes',
    icon: MessageSquare,
    color: '#3b82c4',
    stats: '3 available',
    gradient: 'linear-gradient(135deg, #3b82c415, #3b82c408)'
  },
  {
    id: 'speaking',
    title: 'Speaking',
    description: 'Practice speaking with guided exercises',
    icon: Mic,
    color: '#7c6ee6',
    stats: '2 pending',
    gradient: 'linear-gradient(135deg, #7c6ee615, #7c6ee608)'
  },
  {
    id: 'games',
    title: 'Games',
    description: 'Learn through interactive games and challenges',
    icon: Gamepad2,
    color: '#f59c30',
    stats: 'Coming soon',
    gradient: 'linear-gradient(135deg, #f59c3015, #f59c3008)',
    comingSoon: true
  },
  {
    id: 'challenges',
    title: 'Challenges',
    description: 'Take on weekly challenges and compete with others',
    icon: Trophy,
    color: '#e05c7a',
    stats: 'Coming soon',
    gradient: 'linear-gradient(135deg, #e05c7a15, #e05c7a08)',
    comingSoon: true
  }
];

export function PracticeView({ onActivitySelect }: PracticeViewProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(26, 26, 46, 0.06)' }}>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#1a1a2e' }}>Practice</h1>
          <p className="text-sm" style={{ color: '#7a7a9a' }}>Choose an activity to improve your English skills</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d42)' }}>
          M
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            {practiceActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => !activity.comingSoon && onActivitySelect(activity.id as 'vocabulary' | 'quiz' | 'speaking')}
                disabled={activity.comingSoon}
                className="bg-white rounded-2xl p-8 text-left transition-all group relative overflow-hidden"
                style={{
                  border: '1.5px solid rgba(26, 26, 46, 0.08)',
                  boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)',
                  opacity: activity.comingSoon ? 0.6 : 1,
                  cursor: activity.comingSoon ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!activity.comingSoon) {
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(26, 26, 46, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = activity.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!activity.comingSoon) {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 26, 46, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                  }
                }}
              >
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5" style={{ backgroundColor: activity.color }} />

                <div className="flex items-start gap-6 pl-4">
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all" style={{ background: activity.gradient }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: activity.color }}>
                      <activity.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>{activity.title}</h3>
                      {activity.stats && (
                        <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{
                          backgroundColor: activity.comingSoon ? '#f0f0f0' : `${activity.color}15`,
                          color: activity.comingSoon ? '#7a7a9a' : activity.color
                        }}>
                          {activity.stats}
                        </span>
                      )}
                    </div>

                    <p className="text-sm mb-6" style={{ color: '#7a7a9a' }}>
                      {activity.description}
                    </p>

                    {!activity.comingSoon && (
                      <div className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all" style={{ color: activity.color }}>
                        Start practicing
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)' }}>
            <h3 className="text-sm font-medium mb-4" style={{ color: '#7a7a9a' }}>YOUR PROGRESS THIS WEEK</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-semibold mb-1" style={{ color: '#1a1a2e' }}>12</div>
                <div className="text-sm" style={{ color: '#7a7a9a' }}>New words learned</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1" style={{ color: '#1a1a2e' }}>3</div>
                <div className="text-sm" style={{ color: '#7a7a9a' }}>Quizzes completed</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1" style={{ color: '#1a1a2e' }}>2</div>
                <div className="text-sm" style={{ color: '#7a7a9a' }}>Speaking exercises</div>
              </div>
              <div>
                <div className="text-3xl font-semibold mb-1" style={{ color: '#1a1a2e' }}>3.2h</div>
                <div className="text-sm" style={{ color: '#7a7a9a' }}>Time practicing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
