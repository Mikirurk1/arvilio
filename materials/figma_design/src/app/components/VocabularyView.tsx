import { Search, Grid, BookOpen as BookOpenIcon } from 'lucide-react';
import { useState } from 'react';

interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  translation: string;
  definition: string;
  example: string;
  status: 'new' | 'learning' | 'known';
  category: string;
  lesson?: string;
}

const vocabularyWords: VocabularyWord[] = [
  {
    id: '1',
    word: 'Eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    partOfSpeech: 'adjective',
    translation: 'красномовний',
    definition: 'Fluent and persuasive in speaking or writing.',
    example: 'She delivered an eloquent speech.',
    status: 'new',
    category: 'Communication',
    lesson: 'Grammar: Conditionals'
  },
  {
    id: '2',
    word: 'Leverage',
    phonetic: '/ˈlev.ər.ɪdʒ/',
    partOfSpeech: 'verb',
    translation: 'використовувати',
    definition: 'Use to maximum advantage.',
    example: 'We need to leverage our resources.',
    status: 'learning',
    category: 'Business',
    lesson: 'Business Vocabulary — Unit 4'
  },
  {
    id: '3',
    word: 'Concise',
    phonetic: '/kənˈsaɪs/',
    partOfSpeech: 'adjective',
    translation: 'стислий',
    definition: 'Clear and brief.',
    example: 'Please be concise in your presentation.',
    status: 'new',
    category: 'Communication',
    lesson: 'Speaking: Project Proposal'
  },
  {
    id: '4',
    word: 'Ambiguous',
    phonetic: '/æmˈbɪɡ.ju.əs/',
    partOfSpeech: 'adjective',
    translation: 'неоднозначний',
    definition: 'Open to more than one interpretation.',
    example: 'The contract forms were ambiguous.',
    status: 'learning',
    category: 'General',
    lesson: 'Grammar: Conditionals'
  }
];

const categories = ['All', 'Communication', 'Business', 'Finance', 'General'];
const lessons = ['All Lessons', 'Grammar: Conditionals', 'Speaking: Project Proposal', 'Business Vocabulary — Unit 4'];

export function VocabularyView() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLesson, setSelectedLesson] = useState('All Lessons');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWords = vocabularyWords.filter(word => {
    const matchesCategory = selectedCategory === 'All' || word.category === selectedCategory;
    const matchesLesson = selectedLesson === 'All Lessons' || word.lesson === selectedLesson;
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLesson && matchesSearch;
  });

  const stats = {
    total: vocabularyWords.length,
    new: vocabularyWords.filter(w => w.status === 'new').length,
    learning: vocabularyWords.filter(w => w.status === 'learning').length,
    known: vocabularyWords.filter(w => w.status === 'known').length
  };

  const changeWordStatus = (wordId: string, newStatus: 'new' | 'learning' | 'known') => {
    // Handle status change
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(26, 26, 46, 0.06)' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7a7a9a' }} />
            <input
              type="text"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[320px] pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
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
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ color: '#3b82c4', backgroundColor: '#e8f0fb' }}>
            <Grid className="w-4 h-4" />
            List
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ color: '#7a7a9a', backgroundColor: 'transparent', border: '1px solid rgba(26, 26, 46, 0.1)' }}>
            <BookOpenIcon className="w-4 h-4" />
            Flashcards
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-6" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold mb-1" style={{ color: '#1a1a2e', fontFamily: 'system-ui, -apple-system, sans-serif' }}>Vocabulary</h1>
            <p className="text-sm" style={{ color: '#7a7a9a' }}>{stats.total} words in your library</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid rgba(26, 26, 46, 0.06)' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
              <div className="text-2xl font-semibold" style={{ color: '#1a1a2e' }}>{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid rgba(26, 26, 46, 0.06)' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New</div>
              <div className="text-2xl font-semibold" style={{ color: '#3b82c4' }}>{stats.new}</div>
            </div>
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid rgba(26, 26, 46, 0.06)' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Learning</div>
              <div className="text-2xl font-semibold" style={{ color: '#f59c30' }}>{stats.learning}</div>
            </div>
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid rgba(26, 26, 46, 0.06)' }}>
              <div className="text-xs mb-1" style={{ color: '#7a7a9a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Known</div>
              <div className="text-2xl font-semibold" style={{ color: '#16a97a' }}>{stats.known}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: '#3d3d55' }}>Category:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedCategory === category ? '#1a1a2e' : '#ffffff',
                    color: selectedCategory === category ? '#ffffff' : '#3d3d55',
                    border: '1px solid rgba(26, 26, 46, 0.08)'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: '#3d3d55' }}>Lesson:</span>
              {lessons.map((lesson) => (
                <button
                  key={lesson}
                  onClick={() => setSelectedLesson(lesson)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedLesson === lesson ? '#16a97a' : '#ffffff',
                    color: selectedLesson === lesson ? '#ffffff' : '#3d3d55',
                    border: selectedLesson === lesson ? '1px solid #16a97a' : '1px solid rgba(26, 26, 46, 0.08)'
                  }}
                >
                  {lesson}
                </button>
              ))}
            </div>
          </div>

          {/* Word Cards */}
          <div className="grid grid-cols-3 gap-5">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                className="bg-white rounded-2xl p-6 transition-all"
                style={{
                  border: '1px solid rgba(26, 26, 46, 0.06)',
                  boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(26, 26, 46, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 26, 46, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Word Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-2xl font-semibold" style={{ color: '#1a1a2e', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {word.word}
                    </h3>
                    {word.status === 'new' && (
                      <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: '#e8f0fb', color: '#3b82c4', textTransform: 'uppercase', fontWeight: '600' }}>
                        New
                      </span>
                    )}
                    {word.status === 'learning' && (
                      <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: '#fef3e2', color: '#f59c30', textTransform: 'uppercase', fontWeight: '600' }}>
                        Learning
                      </span>
                    )}
                  </div>
                  <div className="text-sm mb-1" style={{ color: '#7a7a9a' }}>
                    {word.phonetic} · {word.partOfSpeech}
                  </div>
                  {word.lesson && (
                    <div className="text-xs px-2 py-1 rounded-md inline-block" style={{ backgroundColor: '#e8f7f2', color: '#16a97a' }}>
                      {word.lesson}
                    </div>
                  )}
                </div>

                {/* Definition */}
                <p className="text-sm mb-3 leading-relaxed" style={{ color: '#1a1a2e' }}>
                  {word.definition}
                </p>

                {/* Example */}
                <p className="text-sm italic mb-4 leading-relaxed" style={{ color: '#7a7a9a' }}>
                  "{word.example}"
                </p>

                {/* Status Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeWordStatus(word.id, 'new')}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: word.status === 'new' ? '#1a1a2e' : '#fafafa',
                      color: word.status === 'new' ? '#ffffff' : '#7a7a9a',
                      border: '1px solid rgba(26, 26, 46, 0.08)'
                    }}
                  >
                    New
                  </button>
                  <button
                    onClick={() => changeWordStatus(word.id, 'learning')}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: word.status === 'learning' ? '#f59c30' : '#fafafa',
                      color: word.status === 'learning' ? '#ffffff' : '#7a7a9a',
                      border: '1px solid rgba(26, 26, 46, 0.08)'
                    }}
                  >
                    Learning
                  </button>
                  <button
                    onClick={() => changeWordStatus(word.id, 'known')}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: word.status === 'known' ? '#16a97a' : '#fafafa',
                      color: word.status === 'known' ? '#ffffff' : '#7a7a9a',
                      border: '1px solid rgba(26, 26, 46, 0.08)'
                    }}
                  >
                    Known
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
