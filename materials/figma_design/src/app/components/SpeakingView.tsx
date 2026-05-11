import { Mic, Clock, Plus, UserPlus, Calendar as CalendarIcon, ChevronRight, Eye, X, Volume2, MessageSquare, Award } from 'lucide-react';
import { useState } from 'react';
import { GlobalSearch } from './GlobalSearch';

interface Student {
  id: string;
  name: string;
  avatar: string;
  status?: 'pending' | 'submitted' | 'graded';
  score?: number;
}

interface SpeakingTopic {
  id: string;
  title: string;
  prompt: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  status: 'not-started' | 'recorded' | 'reviewed';
  assignedTo?: Student[];
  dueDate?: string;
  recordingUrl?: string;
  feedback?: string;
  score?: number;
}

const students: Student[] = [
  { id: '1', name: 'Mykola K.', avatar: 'MK', status: 'pending' },
  { id: '2', name: 'Sarah M.', avatar: 'SM', status: 'submitted', score: 87 },
  { id: '3', name: 'John S.', avatar: 'JS', status: 'graded', score: 92 },
  { id: '4', name: 'Anna B.', avatar: 'AB', status: 'pending' },
  { id: '5', name: 'David L.', avatar: 'DL', status: 'submitted', score: 78 }
];

export function SpeakingView() {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [showStatsDrawer, setShowStatsDrawer] = useState<string | null>(null);
  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  const [speakingTopics, setSpeakingTopics] = useState<SpeakingTopic[]>([
    {
      id: '1',
      title: 'Describe your ideal workplace',
      prompt: 'Talk about the perfect working environment in 3-4 sentences. Include details about culture, team, and facilities.',
      duration: 3,
      level: 'intermediate',
      category: 'Business',
      status: 'not-started'
    },
    {
      id: '2',
      title: 'Present a business idea',
      prompt: 'Pitch a new business concept to potential investors. Explain the problem, solution, and target market.',
      duration: 5,
      level: 'advanced',
      category: 'Presentation',
      status: 'recorded',
      assignedTo: [students[1], students[2]],
      dueDate: '2026-04-26',
      recordingUrl: 'recording.mp3',
      score: 85,
      feedback: 'Great structure, work on pronunciation'
    },
    {
      id: '3',
      title: 'Daily routine discussion',
      prompt: 'Describe your typical day from morning to evening. Use present simple tense.',
      duration: 2,
      level: 'beginner',
      category: 'General',
      status: 'reviewed',
      assignedTo: [students[0], students[4]],
      dueDate: '2026-04-22',
      recordingUrl: 'recording2.mp3',
      score: 78,
      feedback: 'Good vocabulary, practice transitions'
    }
  ]);

  const handleAssign = () => {
    if (selectedTopic && selectedStudents.length > 0) {
      const assignedStudents = students.filter(s => selectedStudents.includes(s.id));
      setSpeakingTopics(speakingTopics.map(t =>
        t.id === selectedTopic.id
          ? { ...t, assignedTo: assignedStudents, dueDate }
          : t
      ));

      setShowAssignModal(false);
      setSelectedStudents([]);
      setDueDate('');
      setPersonalNote('');
    }
  };

  const completedSpeaking = speakingTopics.filter(t => t.status === 'reviewed').length;
  const assignedTopics = speakingTopics.filter(t => t.assignedTo && t.assignedTo.length > 0).length;
  const averageScore = Math.round(speakingTopics.filter(t => t.score).reduce((acc, t) => acc + (t.score || 0), 0) / speakingTopics.filter(t => t.score).length);

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
            <h1 className="text-3xl font-semibold mb-1" style={{ color: '#1B3A5C' }}>Speaking Practice</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>Create, assign and review speaking exercises</p>
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
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ede9fe' }}>
                  <Mic className="w-5 h-5" style={{ color: '#7c3aed' }} />
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#9ca3af' }} />
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Completed
              </div>
              <div className="text-3xl font-semibold" style={{ color: '#1B3A5C' }}>{completedSpeaking}/{speakingTopics.length}</div>
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
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                  <UserPlus className="w-5 h-5" style={{ color: '#1B3A5C' }} />
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: '#9ca3af' }} />
              </div>
              <div className="text-xs font-medium mb-1" style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Assigned
              </div>
              <div className="text-3xl font-semibold" style={{ color: '#1B3A5C' }}>{assignedTopics}</div>
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
              <div className="text-3xl font-semibold" style={{ color: '#1B3A5C' }}>0.7h</div>
            </button>
          </div>

          {/* Speaking Topics Grid */}
          <div className="grid grid-cols-2 gap-5">
            {speakingTopics.map((topic) => {
              const statusConfig = {
                'not-started': { bg: '#f3f4f6', text: '#6b7280', label: 'Not Started' },
                'recorded': { bg: '#dbeafe', text: '#1B3A5C', label: 'Recorded' },
                'reviewed': { bg: '#d1fae5', text: '#059669', label: 'Reviewed' }
              };
              const status = statusConfig[topic.status];

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-xl p-6 transition-all"
                  style={{
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1B3A5C' }}>{topic.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                          {topic.category}
                        </span>
                        <span
                          className="text-xs px-2.5 py-1 rounded-md font-medium"
                          style={{
                            backgroundColor: topic.level === 'advanced' ? '#fee2e2' : topic.level === 'intermediate' ? '#fef3c7' : '#d1fae5',
                            color: topic.level === 'advanced' ? '#dc2626' : topic.level === 'intermediate' ? '#f59e0b' : '#10B981'
                          }}
                        >
                          {topic.level}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ backgroundColor: status.bg, color: status.text }}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6b7280' }} />
                      <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>
                        {topic.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Assignment Info */}
                  {topic.assignedTo && topic.assignedTo.length > 0 && !previewAsStudent && (
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: '#6b7280' }}>Assigned to:</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                          Due {new Date(topic.dueDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {topic.assignedTo.slice(0, 3).map((student) => (
                          <div
                            key={student.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
                            style={{ backgroundColor: '#1B3A5C' }}
                            title={student.name}
                          >
                            {student.avatar}
                          </div>
                        ))}
                        {topic.assignedTo.length > 3 && (
                          <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
                            +{topic.assignedTo.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recording Duration */}
                  <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: '#6b7280' }}>
                    <Clock className="w-4 h-4" />
                    <span>{topic.duration} min recording time</span>
                  </div>

                  {/* Waveform & Feedback (for reviewed) */}
                  {topic.status === 'reviewed' && topic.recordingUrl && !previewAsStudent && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                        <Volume2 className="w-4 h-4" style={{ color: '#6b7280' }} />
                        {/* Waveform visualization */}
                        <div className="flex-1 flex items-center gap-0.5 h-8">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-full"
                              style={{
                                backgroundColor: '#1B3A5C',
                                height: `${Math.random() * 100}%`,
                                opacity: 0.6
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      {topic.feedback && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: '#92400e' }}>Teacher Feedback</span>
                            <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>{topic.score}%</span>
                          </div>
                          <p className="text-xs" style={{ color: '#78350f' }}>{topic.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    {!previewAsStudent && (
                      <button
                        onClick={() => {
                          setSelectedTopic(topic);
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
                        background: topic.status === 'reviewed' && !previewAsStudent ? 'linear-gradient(135deg, #1B3A5C, #0f2942)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)'
                      }}
                    >
                      <Mic className="w-4 h-4" />
                      {topic.status === 'reviewed' && !previewAsStudent ? 'Listen Again' : topic.status === 'recorded' ? 'Review Recording' : 'Start Recording'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add New Topic */}
            {!previewAsStudent && (
              <button
                className="bg-white rounded-xl p-6 border-2 border-dashed flex flex-col items-center justify-center min-h-[320px] transition-all"
                style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#ede9fe' }}>
                  <Plus className="w-8 h-8" style={{ color: '#7c3aed' }} />
                </div>
                <span className="text-sm font-medium">Add New Speaking Topic</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedTopic && (
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
                <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{selectedTopic.title}</p>
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
              {showStatsDrawer === 'completed' && 'Completed Speaking'}
              {showStatsDrawer === 'score' && 'Score Breakdown'}
              {showStatsDrawer === 'assigned' && 'Assigned Topics'}
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
                {speakingTopics.filter(t => t.score).map((topic) => (
                  <div key={topic.id} className="p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: '#374151' }}>{topic.title}</span>
                      <span className="text-lg font-semibold" style={{ color: '#10B981' }}>{topic.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#e5e7eb' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: '#10B981',
                          width: `${topic.score}%`
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
