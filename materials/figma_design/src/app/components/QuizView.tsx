import { Play, CheckCircle2, Clock, Award, FileText, Plus, UserPlus, Calendar as CalendarIcon, ChevronRight, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { GlobalSearch } from './GlobalSearch';

interface Student {
  id: string;
  name: string;
  avatar: string;
  status?: 'pending' | 'submitted' | 'graded';
  score?: number;
}

interface Quiz {
  id: string;
  title: string;
  type: 'grammar' | 'vocabulary' | 'listening';
  questions: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  score?: number;
  category: string;
  assignedTo?: Student[];
  dueDate?: string;
}

const students: Student[] = [
  { id: '1', name: 'Mykola K.', avatar: 'MK', status: 'pending' },
  { id: '2', name: 'Sarah M.', avatar: 'SM', status: 'submitted', score: 87 },
  { id: '3', name: 'John S.', avatar: 'JS', status: 'graded', score: 92 },
  { id: '4', name: 'Anna B.', avatar: 'AB', status: 'pending' },
  { id: '5', name: 'David L.', avatar: 'DL', status: 'submitted', score: 78 }
];

export function QuizView() {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [showStatsDrawer, setShowStatsDrawer] = useState<string | null>(null);
  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'Conditional Sentences Test',
      type: 'grammar',
      questions: 15,
      duration: 20,
      difficulty: 'medium',
      completed: true,
      score: 87,
      category: 'Grammar',
      assignedTo: [students[0], students[1], students[2]],
      dueDate: '2026-04-25'
    },
    {
      id: '2',
      title: 'Business Vocabulary Quiz',
      type: 'vocabulary',
      questions: 20,
      duration: 15,
      difficulty: 'hard',
      completed: false,
      category: 'Vocabulary'
    },
    {
      id: '3',
      title: 'Listening Comprehension',
      type: 'listening',
      questions: 10,
      duration: 25,
      difficulty: 'medium',
      completed: true,
      score: 92,
      category: 'Listening',
      assignedTo: [students[3]],
      dueDate: '2026-04-28'
    }
  ]);

  const handleAssign = () => {
    if (selectedQuiz && selectedStudents.length > 0) {
      const assignedStudents = students.filter(s => selectedStudents.includes(s.id));
      setQuizzes(quizzes.map(q =>
        q.id === selectedQuiz.id
          ? { ...q, assignedTo: assignedStudents, dueDate }
          : q
      ));

      setShowAssignModal(false);
      setSelectedStudents([]);
      setDueDate('');
      setPersonalNote('');
    }
  };

  const completedQuizzes = quizzes.filter(q => q.completed).length;
  const averageScore = Math.round(quizzes.filter(q => q.score).reduce((acc, q) => acc + (q.score || 0), 0) / quizzes.filter(q => q.score).length);
  const assignedQuizzes = quizzes.filter(q => q.assignedTo && q.assignedTo.length > 0).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="bg-white px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e7eb' }}>
        <GlobalSearch />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewAsStudent(!previewAsStudent)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: previewAsStudent ? '#1B3A5C' : '#f3f4f6',
              color: previewAsStudent ? '#ffffff' : '#6b7280',
              border: '1px solid #e5e7eb'
            }}
          >
            <Eye className="w-4 h-4" />
            {previewAsStudent ? 'Teacher View' : 'Preview as Student'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold mb-1" style={{ color: '#1B3A5C' }}>Quizzes</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>Create, assign and track quiz progress</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setShowStatsDrawer('completed')}
              className="bg-white rounded-xl p-5 text-left transition-all"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#1B3A5C' }} />
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#9ca3af' }} />
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Completed
              </div>
              <div className="text-3xl font-semibold" style={{ color: '#1B3A5C' }}>{completedQuizzes}/{quizzes.length}</div>
            </button>

            <button
              onClick={() => setShowStatsDrawer('score')}
              className="bg-white rounded-xl p-5 text-left transition-all"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#d1fae5' }}>
                  <Award className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#9ca3af' }} />
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Average Score
              </div>
              <div className="text-3xl font-semibold" style={{ color: '#1B3A5C' }}>{averageScore}%</div>
            </button>

            <button
              onClick={() => setShowStatsDrawer('assigned')}
              className="bg-white rounded-xl p-5 text-left transition-all"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ede9fe' }}>
                  <UserPlus className="w-5 h-5" style={{ color: '#7c3aed' }} />
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#9ca3af' }} />
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Assigned
              </div>
              <div className="text-3xl font-semibold" style={{ color: '#1B3A5C' }}>{assignedQuizzes}</div>
            </button>

            <button
              onClick={() => setShowStatsDrawer('time')}
              className="bg-white rounded-xl p-5 text-left transition-all"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.07)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
                  <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#9ca3af' }} />
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Time
              </div>
              <div className="text-3xl font-semibold" style={{ color: '#1B3A5C' }}>1.8h</div>
            </button>
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-2 gap-5">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl p-6 transition-all"
                style={{
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: '#1B3A5C' }}>{quiz.title}</h3>
                      {quiz.completed && !previewAsStudent && (
                        <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ backgroundColor: '#dbeafe', color: '#1B3A5C' }}>
                        {quiz.category}
                      </span>
                      <span
                        className="text-xs px-2.5 py-1 rounded-md font-medium"
                        style={{
                          backgroundColor: quiz.difficulty === 'hard' ? '#fee2e2' : quiz.difficulty === 'medium' ? '#fef3c7' : '#d1fae5',
                          color: quiz.difficulty === 'hard' ? '#dc2626' : quiz.difficulty === 'medium' ? '#f59e0b' : '#10B981'
                        }}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assignment Info */}
                {quiz.assignedTo && quiz.assignedTo.length > 0 && !previewAsStudent && (
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: '#6b7280' }}>Assigned to:</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                        Due {new Date(quiz.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {quiz.assignedTo.slice(0, 3).map((student) => (
                        <div
                          key={student.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: '#1B3A5C' }}
                          title={student.name}
                        >
                          {student.avatar}
                        </div>
                      ))}
                      {quiz.assignedTo.length > 3 && (
                        <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
                          +{quiz.assignedTo.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span style={{ color: '#6b7280' }}>Status:</span>
                      <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#dbeafe', color: '#1B3A5C' }}>
                        2 Pending
                      </span>
                      <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                        1 Submitted
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: '#6b7280' }}>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>{quiz.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.duration} min</span>
                  </div>
                </div>

                {/* Score */}
                {quiz.completed && quiz.score !== undefined && !previewAsStudent && (
                  <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#d1fae5' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: '#065f46' }}>Average Score</span>
                      <span className="text-2xl font-semibold" style={{ color: '#10B981' }}>{quiz.score}%</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {!previewAsStudent && (
                    <button
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        setShowAssignModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#1B3A5C',
                        border: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign
                    </button>
                  )}
                  <button
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${!previewAsStudent ? '' : 'col-span-2'}`}
                    style={{
                      background: quiz.completed && !previewAsStudent ? 'linear-gradient(135deg, #1B3A5C, #0f2942)' : 'linear-gradient(135deg, #10B981, #059669)',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                    }}
                  >
                    <Play className="w-4 h-4" />
                    {quiz.completed && !previewAsStudent ? 'Review Results' : 'Start Quiz'}
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Quiz */}
            {!previewAsStudent && (
              <button
                className="bg-white rounded-xl p-6 border-2 border-dashed flex flex-col items-center justify-center min-h-[280px] transition-all"
                style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1B3A5C';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#dbeafe' }}>
                  <Plus className="w-8 h-8" style={{ color: '#1B3A5C' }} />
                </div>
                <span className="text-sm font-medium">Create New Quiz</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAssignModal(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-[560px] overflow-hidden"
            style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#1B3A5C' }}>Assign to Students</h3>
                <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{selectedQuiz.title}</p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                style={{ color: '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-5">
              {/* Student Selector */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#374151' }}>Select Students</label>
                <div className="grid grid-cols-2 gap-3">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        if (selectedStudents.includes(student.id)) {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        } else {
                          setSelectedStudents([...selectedStudents, student.id]);
                        }
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
                      style={{
                        backgroundColor: selectedStudents.includes(student.id) ? '#dbeafe' : '#f9fafb',
                        border: selectedStudents.includes(student.id) ? '2px solid #1B3A5C' : '1px solid #e5e7eb'
                      }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white" style={{ backgroundColor: '#1B3A5C' }}>
                        {student.avatar}
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#374151' }}>{student.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Due Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6b7280' }} />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                    style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      color: '#1B3A5C'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B3A5C';
                      e.currentTarget.style.boxShadow = '0 0 0 3px #dbeafe';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Personal Note */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Personal Note (Optional)</label>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Add a note for students..."
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-all"
                  rows={3}
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    color: '#1B3A5C'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B3A5C';
                    e.currentTarget.style.boxShadow = '0 0 0 3px #dbeafe';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedStudents.length === 0 || !dueDate}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                style={{
                  background: selectedStudents.length > 0 && dueDate ? 'linear-gradient(135deg, #10B981, #059669)' : '#d1d5db',
                  boxShadow: selectedStudents.length > 0 && dueDate ? '0 2px 4px rgba(16, 185, 129, 0.2)' : 'none',
                  cursor: selectedStudents.length === 0 || !dueDate ? 'not-allowed' : 'pointer'
                }}
              >
                Assign to {selectedStudents.length || 0} student{selectedStudents.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Drawer */}
      {showStatsDrawer && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col" style={{ borderLeft: '1px solid #e5e7eb' }}>
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#1B3A5C' }}>
              {showStatsDrawer === 'completed' && 'Completed Quizzes'}
              {showStatsDrawer === 'score' && 'Score Breakdown'}
              {showStatsDrawer === 'assigned' && 'Assigned Quizzes'}
              {showStatsDrawer === 'time' && 'Practice Time'}
            </h3>
            <button
              onClick={() => setShowStatsDrawer(null)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
              style={{ color: '#6b7280' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {showStatsDrawer === 'score' && (
              <div className="space-y-4">
                {quizzes.filter(q => q.score).map((quiz) => (
                  <div key={quiz.id} className="p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: '#374151' }}>{quiz.title}</span>
                      <span className="text-lg font-semibold" style={{ color: '#10B981' }}>{quiz.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#e5e7eb' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: '#10B981',
                          width: `${quiz.score}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
