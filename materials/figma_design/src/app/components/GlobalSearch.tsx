import { Search, BookOpen, GraduationCap, FileText, User, Clock, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchResult {
  id: string;
  type: 'lesson' | 'word' | 'material' | 'student';
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  category?: string;
}

interface GlobalSearchProps {
  onNavigate?: (type: string, id: string) => void;
}

const mockData: SearchResult[] = [
  // Lessons
  { id: '1', type: 'lesson', title: 'Grammar: Conditionals', subtitle: 'Sarah Mitchell', description: '14:00 · 45 min', date: '2026-04-20' },
  { id: '2', type: 'lesson', title: 'Speaking: Project Proposal', subtitle: 'Sarah Mitchell', description: '14:00 · 55 min', date: '2026-04-22' },
  { id: '3', type: 'lesson', title: 'Business Vocabulary — Unit 4', subtitle: 'John Smith', description: '15:00 · 60 min', date: '2026-04-23' },

  // Words
  { id: '1', type: 'word', title: 'Eloquent', subtitle: 'adjective', description: 'Fluent and persuasive in speaking or writing', category: 'Communication' },
  { id: '2', type: 'word', title: 'Leverage', subtitle: 'verb', description: 'Use to maximum advantage', category: 'Business' },
  { id: '3', type: 'word', title: 'Concise', subtitle: 'adjective', description: 'Clear and brief', category: 'Communication' },
  { id: '4', type: 'word', title: 'Ambiguous', subtitle: 'adjective', description: 'Open to more than one interpretation', category: 'General' },

  // Materials
  { id: '1', type: 'material', title: 'Grammar Basics Board', subtitle: 'Board', description: 'Miro board with grammar explanations' },
  { id: '2', type: 'material', title: 'Business English Presentation', subtitle: 'Presentation', description: 'Google Slides presentation' },
  { id: '3', type: 'material', title: 'English File Intermediate', subtitle: 'Book', description: 'Student Book & Workbook with audio' },

  // Students
  { id: '1', type: 'student', title: 'Mykola Kovalenko', subtitle: 'Student', description: 'Intermediate level · 12 lessons completed' },
  { id: '2', type: 'student', title: 'Sarah Mitchell', subtitle: 'Teacher', description: 'English & Business courses' },
];

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const filtered = mockData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <GraduationCap className="w-4 h-4" />;
      case 'word': return <BookOpen className="w-4 h-4" />;
      case 'material': return <FileText className="w-4 h-4" />;
      case 'student': return <User className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'lesson': return { bg: '#e8f0fb', text: '#3b82c4' };
      case 'word': return { bg: '#eeedfe', text: '#7c6ee6' };
      case 'material': return { bg: '#e8f7f2', text: '#16a97a' };
      case 'student': return { bg: '#fef3e2', text: '#f59c30' };
      default: return { bg: '#fafafa', text: '#7a7a9a' };
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (onNavigate) {
      onNavigate(result.type, result.id);
    }
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7a7a9a' }} />
        <input
          type="text"
          placeholder="Search lessons, words, materials, students..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-[420px] pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            backgroundColor: '#fafafa',
            border: '1.5px solid rgba(26, 26, 46, 0.08)',
            color: '#1a1a2e'
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = '#16a97a';
            e.currentTarget.style.boxShadow = '0 0 0 4px #e8f7f2';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.backgroundColor = '#fafafa';
          }}
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl overflow-hidden z-50"
          style={{
            border: '1.5px solid rgba(26, 26, 46, 0.08)',
            boxShadow: '0 12px 40px rgba(26, 26, 46, 0.15)',
            maxHeight: '480px',
            overflowY: 'auto'
          }}
        >
          {/* Results by type */}
          {['lesson', 'word', 'material', 'student'].map(type => {
            const typeResults = results.filter(r => r.type === type);
            if (typeResults.length === 0) return null;

            const typeName = type.charAt(0).toUpperCase() + type.slice(1) + 's';

            return (
              <div key={type}>
                <div className="px-4 py-2 text-xs font-semibold" style={{ color: '#7a7a9a', backgroundColor: '#fafafa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {typeName}
                </div>
                {typeResults.map((result, index) => {
                  const color = getColor(result.type);
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="w-full px-4 py-3 flex items-center gap-3 transition-all text-left"
                      style={{ borderBottom: index < typeResults.length - 1 ? '1px solid rgba(26, 26, 46, 0.04)' : 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color.bg, color: color.text }}>
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium truncate" style={{ color: '#1a1a2e' }}>{result.title}</span>
                          {result.category && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: color.bg, color: color.text }}>
                              {result.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: '#7a7a9a' }}>
                          {result.subtitle && <span>{result.subtitle}</span>}
                          {result.subtitle && result.description && <span>·</span>}
                          {result.description && <span>{result.description}</span>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#b4b4cc' }} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl p-8 text-center z-50"
          style={{
            border: '1.5px solid rgba(26, 26, 46, 0.08)',
            boxShadow: '0 12px 40px rgba(26, 26, 46, 0.15)'
          }}
        >
          <Search className="w-12 h-12 mx-auto mb-3" style={{ color: '#b4b4cc' }} />
          <p className="text-sm font-medium mb-1" style={{ color: '#3d3d55' }}>No results found</p>
          <p className="text-xs" style={{ color: '#7a7a9a' }}>Try searching for lessons, vocabulary words, or materials</p>
        </div>
      )}
    </div>
  );
}
