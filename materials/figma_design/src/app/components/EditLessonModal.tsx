import { X, Upload, FileText, BookOpen, Pencil, MessageSquare, Calendar, Clock, User, Repeat, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditLessonModal({ isOpen, onClose }: EditLessonModalProps) {
  const [activeTab, setActiveTab] = useState<'plan' | 'notes'>('plan');
  const [materials, setMaterials] = useState([
    { id: 1, name: 'Grammar Rules.pdf', size: '2.3 MB' }
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1a1a2e]/30 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-[720px] max-h-[94vh] overflow-hidden"
        style={{ boxShadow: '0 20px 60px rgba(26, 26, 46, 0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 flex items-start justify-between" style={{ background: 'linear-gradient(to bottom, #ffffff, #fafafa)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16a97a, #0c6e52)' }}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>Edit lesson</h3>
              <p className="text-sm mt-1" style={{ color: '#7a7a9a' }}>Configure lesson details and resources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#7a7a9a', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f7f6f3';
              e.currentTarget.style.color = '#1a1a2e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#7a7a9a';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 py-4 flex gap-3" style={{ backgroundColor: '#fafafa', borderBottom: '1px solid rgba(26, 26, 46, 0.06)' }}>
          <button
            onClick={() => setActiveTab('plan')}
            className="flex-1 px-5 py-3 text-sm font-medium rounded-xl transition-all relative overflow-hidden"
            style={{
              backgroundColor: activeTab === 'plan' ? '#ffffff' : 'transparent',
              color: activeTab === 'plan' ? '#1a1a2e' : '#7a7a9a',
              boxShadow: activeTab === 'plan' ? '0 2px 8px rgba(26, 26, 46, 0.06), inset 0 -2px 0 #16a97a' : 'none'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Планування уроку
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className="flex-1 px-5 py-3 text-sm font-medium rounded-xl transition-all relative overflow-hidden"
            style={{
              backgroundColor: activeTab === 'notes' ? '#ffffff' : 'transparent',
              color: activeTab === 'notes' ? '#1a1a2e' : '#7a7a9a',
              boxShadow: activeTab === 'notes' ? '0 2px 8px rgba(26, 26, 46, 0.06), inset 0 -2px 0 #16a97a' : 'none'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Pencil className="w-4 h-4" />
              Конспект уроку
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(94vh-240px)] px-8 py-6" style={{ backgroundColor: '#fafafa' }}>
          {activeTab === 'plan' ? (
            <div className="space-y-5">
              {/* Title & Type Row */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium mb-2.5" style={{ color: '#3d3d55', letterSpacing: '0.3px' }}>
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    defaultValue="Speaking: Project Proposal"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid rgba(26, 26, 46, 0.1)',
                      color: '#1a1a2e',
                      boxShadow: '0 1px 2px rgba(26, 26, 46, 0.04)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#16a97a';
                      e.currentTarget.style.boxShadow = '0 0 0 4px #e8f7f2, 0 1px 2px rgba(26, 26, 46, 0.04)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.1)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(26, 26, 46, 0.04)';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2.5" style={{ color: '#3d3d55', letterSpacing: '0.3px' }}>
                    Lesson Type
                  </label>
                  <select
                    defaultValue="Speaking"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1.5px solid rgba(26, 26, 46, 0.1)',
                      color: '#1a1a2e',
                      boxShadow: '0 1px 2px rgba(26, 26, 46, 0.04)',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'14\' height=\'8\' viewBox=\'0 0 14 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L7 7L13 1\' stroke=\'%233d3d55\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                      backgroundPosition: 'right 14px center'
                    }}
                  >
                    <option>Speaking</option>
                    <option>Grammar</option>
                    <option>Vocabulary</option>
                    <option>Reading</option>
                  </select>
                </div>
              </div>

              {/* Date & Start Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    defaultValue="2026-04-22"
                    className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(26, 26, 46, 0.08)',
                      color: '#1a1a2e'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82c4';
                      e.currentTarget.style.boxShadow = '0 0 0 3px #e8f0fb';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Start time
                  </label>
                  <input
                    type="time"
                    defaultValue="14:00"
                    className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(26, 26, 46, 0.08)',
                      color: '#1a1a2e'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82c4';
                      e.currentTarget.style.boxShadow = '0 0 0 3px #e8f0fb';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Duration & Recurrence Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    defaultValue="55"
                    className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(26, 26, 46, 0.08)',
                      color: '#1a1a2e'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#7c6ee6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px #eeedfe';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Recurrence
                  </label>
                  <select
                    defaultValue="No repeat"
                    className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(26, 26, 46, 0.08)',
                      color: '#1a1a2e',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%237a7a9a\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option>No repeat</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>

              {/* Status & Заробувано Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Status
                  </label>
                  <select
                    defaultValue="Заплановано"
                    className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(26, 26, 46, 0.08)',
                      color: '#1a1a2e',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%237a7a9a\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option>Заплановано</option>
                    <option>Завершено</option>
                    <option>Скасовано</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Заробувано
                  </label>
                  <select
                    defaultValue="Не заробувано"
                    className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid rgba(26, 26, 46, 0.08)',
                      color: '#1a1a2e',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%237a7a9a\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                      backgroundPosition: 'right 12px center'
                    }}
                  >
                    <option>Не заробувано</option>
                    <option>Заробувано</option>
                  </select>
                </div>
              </div>

              {/* Student */}
              <div>
                <label className="block text-xs mb-2" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Student
                </label>
                <select
                  defaultValue="Mykola Kovalenko"
                  className="w-full px-3 py-2.5 rounded-lg text-sm transition-all outline-none appearance-none bg-no-repeat bg-right"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(26, 26, 46, 0.08)',
                    color: '#1a1a2e',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1.5L6 6.5L11 1.5\' stroke=\'%237a7a9a\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                    backgroundPosition: 'right 12px center'
                  }}
                >
                  <option>Mykola Kovalenko</option>
                  <option>Sarah Mitchell</option>
                  <option>John Smith</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Lesson Plan Section */}
              <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f0fb, #d4e5f7)' }}>
                    <FileText className="w-5 h-5" style={{ color: '#3b82c4' }} />
                  </div>
                  <label className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>
                    Lesson Plan
                  </label>
                </div>
                <textarea
                  placeholder="Enter your detailed lesson plan, learning objectives, and structure..."
                  className="w-full min-h-[120px] px-4 py-3.5 rounded-xl text-sm transition-all outline-none resize-none"
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1.5px solid rgba(26, 26, 46, 0.08)',
                    color: '#1a1a2e',
                    lineHeight: '1.7'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82c4';
                    e.currentTarget.style.boxShadow = '0 0 0 4px #e8f0fb';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  }}
                />
              </div>

              {/* Materials Section */}
              <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eeedfe, #ddd9fc)' }}>
                      <LinkIcon className="w-5 h-5" style={{ color: '#7c6ee6' }} />
                    </div>
                    <label className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>
                      Materials & Resources
                    </label>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all" style={{ color: '#7c6ee6', backgroundColor: '#eeedfe' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd9fc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eeedfe'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {materials.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group" style={{ backgroundColor: '#fafafa', border: '1px solid rgba(26, 26, 46, 0.06)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                      >
                        <FileText className="w-4 h-4" style={{ color: '#7a7a9a' }} />
                        <div className="flex-1">
                          <div className="text-sm" style={{ color: '#1a1a2e' }}>{material.name}</div>
                          <div className="text-xs" style={{ color: '#7a7a9a' }}>{material.size}</div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg" style={{ color: '#e05c7a' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdedf1'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <button className="w-full px-4 py-3.5 border-2 border-dashed rounded-xl text-sm transition-all flex items-center justify-center gap-2" style={{ borderColor: 'rgba(26, 26, 46, 0.15)', color: '#7a7a9a' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7c6ee6';
                    e.currentTarget.style.backgroundColor = '#f9f8ff';
                    e.currentTarget.style.color = '#7c6ee6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.15)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#7a7a9a';
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Upload files or add links
                </button>
              </div>

              {/* Homework Section */}
              <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f7f2, #d1ede4)' }}>
                    <BookOpen className="w-5 h-5" style={{ color: '#16a97a' }} />
                  </div>
                  <label className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>
                    Homework Assignment
                  </label>
                </div>
                <textarea
                  placeholder="Describe the homework tasks, exercises, and due dates..."
                  className="w-full min-h-[100px] px-4 py-3.5 rounded-xl text-sm transition-all outline-none resize-none mb-3"
                  style={{
                    backgroundColor: '#fafafa',
                    border: '1.5px solid rgba(26, 26, 46, 0.08)',
                    color: '#1a1a2e',
                    lineHeight: '1.7'
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
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: '#e8f7f2', color: '#0c6e52', border: '1px solid #a8dece' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1ede4';
                    e.currentTarget.style.borderColor = '#16a97a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#e8f7f2';
                    e.currentTarget.style.borderColor = '#a8dece';
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Attach files
                </button>
              </div>

              {/* Student Response Section */}
              <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fef3e2, #fce7c4)' }}>
                    <MessageSquare className="w-5 h-5" style={{ color: '#f59c30' }} />
                  </div>
                  <label className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>
                    Student Response
                  </label>
                </div>
                <div className="px-4 py-3.5 rounded-xl text-sm" style={{ backgroundColor: '#fef9f2', border: '1.5px solid #fce7c4', color: '#7a7a9a', lineHeight: '1.7' }}>
                  Student's response will appear here after homework submission...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex items-center justify-between" style={{ borderTop: '1px solid rgba(26, 26, 46, 0.06)', background: 'linear-gradient(to top, #fafafa, #ffffff)' }}>
          <button className="text-sm font-medium transition-all px-4 py-2 rounded-lg" style={{ color: '#e05c7a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fdedf1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Delete lesson
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ border: '1.5px solid rgba(26, 26, 46, 0.15)', color: '#3d3d55', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f7f6f3';
                e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.15)';
              }}
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #16a97a, #0c6e52)', boxShadow: '0 4px 12px rgba(22, 169, 122, 0.25)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 169, 122, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 169, 122, 0.25)';
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
