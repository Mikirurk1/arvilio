import { Home, BookOpen, MessageSquare, Calendar, User, GraduationCap, MessageCircle, FolderOpen, Zap } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'calendar' | 'lessons' | 'chat' | 'practice' | 'materials';
  onViewChange: (view: 'dashboard' | 'calendar' | 'lessons' | 'chat' | 'practice' | 'materials') => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="w-[240px] bg-white flex flex-col p-4" style={{ borderRight: '1px solid rgba(26, 26, 46, 0.08)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: '#1a1a2e' }}>
          S
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>SoEnglish</div>
          <div className="text-xs" style={{ color: '#7a7a9a' }}>Language of Future</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: currentView === 'dashboard' ? '#1a1a2e' : 'transparent',
            color: currentView === 'dashboard' ? '#ffffff' : '#3d3d55'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'dashboard') e.currentTarget.style.backgroundColor = '#f7f6f3';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'dashboard') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>

        <button
          onClick={() => onViewChange('practice')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm relative transition-colors"
          style={{
            backgroundColor: currentView === 'practice' ? '#1a1a2e' : 'transparent',
            color: currentView === 'practice' ? '#ffffff' : '#3d3d55'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'practice') e.currentTarget.style.backgroundColor = '#f7f6f3';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'practice') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Zap className="w-4 h-4" />
          Practice
          <span className="ml-auto text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#16a97a' }}>
            6
          </span>
        </button>

        <button
          onClick={() => onViewChange('lessons')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: currentView === 'lessons' ? '#1a1a2e' : 'transparent',
            color: currentView === 'lessons' ? '#ffffff' : '#3d3d55'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'lessons') e.currentTarget.style.backgroundColor = '#f7f6f3';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'lessons') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <GraduationCap className="w-4 h-4" />
          Lessons
        </button>

        <button
          onClick={() => onViewChange('materials')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: currentView === 'materials' ? '#1a1a2e' : 'transparent',
            color: currentView === 'materials' ? '#ffffff' : '#3d3d55'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'materials') e.currentTarget.style.backgroundColor = '#f7f6f3';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'materials') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <FolderOpen className="w-4 h-4" />
          Materials
        </button>

        <button
          onClick={() => onViewChange('calendar')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: currentView === 'calendar' ? '#1a1a2e' : 'transparent',
            color: currentView === 'calendar' ? '#ffffff' : '#3d3d55'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'calendar') e.currentTarget.style.backgroundColor = '#f7f6f3';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'calendar') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Calendar className="w-4 h-4" />
          Calendar
        </button>

        <button
          onClick={() => onViewChange('chat')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: currentView === 'chat' ? '#1a1a2e' : 'transparent',
            color: currentView === 'chat' ? '#ffffff' : '#3d3d55'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'chat') e.currentTarget.style.backgroundColor = '#f7f6f3';
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'chat') e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>

        <div className="h-px my-2" style={{ backgroundColor: 'rgba(26, 26, 46, 0.08)' }} />

        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors" style={{ color: '#3d3d55' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f6f3'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <User className="w-4 h-4" />
          Profile & Settings
        </button>
      </nav>
    </div>
  );
}
