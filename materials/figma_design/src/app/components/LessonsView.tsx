import { Search, Clock, User, Calendar, ChevronRight, Filter, Video, FileText } from 'lucide-react';

interface LessonsViewProps {
  onLessonSelect: (lessonId: string) => void;
}

const upcomingLessons = [
  {
    id: '1',
    title: 'Grammar: Conditionals',
    type: 'Grammar',
    date: '2026-04-20',
    time: '14:00',
    duration: 45,
    teacher: 'Sarah Mitchell',
    status: 'Today',
    color: '#7c6ee6',
    materials: 3
  },
  {
    id: '2',
    title: 'Speaking: Project Proposal',
    type: 'Speaking',
    date: '2026-04-22',
    time: '14:00',
    duration: 55,
    teacher: 'Sarah Mitchell',
    status: 'Upcoming',
    color: '#3b82c4',
    materials: 1
  },
  {
    id: '3',
    title: 'Business Vocabulary — Unit 4',
    type: 'Vocabulary',
    date: '2026-04-23',
    time: '15:00',
    duration: 60,
    teacher: 'John Smith',
    status: 'Upcoming',
    color: '#16a97a',
    materials: 5
  },
  {
    id: '4',
    title: 'Reading Comprehension',
    type: 'Reading',
    date: '2026-04-25',
    time: '10:00',
    duration: 50,
    teacher: 'Sarah Mitchell',
    status: 'Upcoming',
    color: '#2f9fb3',
    materials: 2
  },
  {
    id: '5',
    title: 'Pronunciation Practice',
    type: 'Phonetics',
    date: '2026-04-26',
    time: '16:00',
    duration: 40,
    teacher: 'John Smith',
    status: 'Upcoming',
    color: '#f59c30',
    materials: 4
  }
];

export function LessonsView({ onLessonSelect }: LessonsViewProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(26, 26, 46, 0.06)' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7a7a9a' }} />
            <input
              type="text"
              placeholder="Search lessons, topics, teachers..."
              className="w-[380px] pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                backgroundColor: '#fafafa',
                border: '1.5px solid rgba(26, 26, 46, 0.08)',
                color: '#1a1a2e'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#16a97a';
                e.currentTarget.style.boxShadow = '0 0 0 4px #e8f7f2';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = '#fafafa';
              }}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all" style={{ backgroundColor: '#fafafa', color: '#3d3d55', border: '1.5px solid rgba(26, 26, 46, 0.08)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fafafa';
              e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
            }}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: '#e8f7f2' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#16a97a' }} />
            <span className="text-sm font-medium" style={{ color: '#0c6e52' }}>5 upcoming lessons</span>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, #1a1a2e, #2d2d42)' }}>
            M
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2" style={{ color: '#1a1a2e' }}>My Lessons</h1>
            <p className="text-sm" style={{ color: '#7a7a9a' }}>Your upcoming lessons and learning schedule</p>
          </div>

          <div className="space-y-4">
            {upcomingLessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => onLessonSelect(lesson.id)}
                className="w-full bg-white rounded-2xl p-6 text-left transition-all group relative overflow-hidden"
                style={{
                  border: '1.5px solid rgba(26, 26, 46, 0.08)',
                  boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(26, 26, 46, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = lesson.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 26, 46, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                }}
              >
                {/* Color accent bar */}
                <div className="absolute top-0 left-0 w-1 h-full transition-all group-hover:w-1.5" style={{ backgroundColor: lesson.color }} />

                <div className="flex items-center gap-5 pl-4">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all" style={{ background: `linear-gradient(135deg, ${lesson.color}15, ${lesson.color}08)` }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: lesson.color }}>
                      <span className="text-white text-lg font-bold">{lesson.type[0]}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: '#1a1a2e' }}>{lesson.title}</h3>
                      <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: `${lesson.color}15`, color: lesson.color }}>
                        {lesson.type}
                      </span>
                      {lesson.status === 'Today' && (
                        <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: '#fef3e2', color: '#f59c30' }}>
                          Today
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm" style={{ color: '#7a7a9a' }}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{new Date(lesson.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.time} · {lesson.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{lesson.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{lesson.materials} materials</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all" style={{ backgroundColor: '#e8f7f2' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d1ede4';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#e8f7f2';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Video className="w-4 h-4" style={{ color: '#16a97a' }} />
                    </div>
                    <ChevronRight className="w-6 h-6" style={{ color: lesson.color }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
