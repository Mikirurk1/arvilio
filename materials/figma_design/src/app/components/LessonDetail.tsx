import { ArrowLeft, Video, FileText, BookOpen, Plus, Send, ExternalLink, Upload, Download, Clock, User, Calendar, X, Check } from 'lucide-react';
import { useState } from 'react';

interface LessonDetailProps {
  lessonId: string;
  onBack: () => void;
}

const lessonData: Record<string, any> = {
  '1': {
    title: 'Grammar: Conditionals',
    type: 'Grammar',
    date: '2026-04-20',
    time: '14:00',
    duration: 45,
    teacher: 'Sarah Mitchell',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    description: 'Learn and practice all types of conditional sentences in English',
    materials: [
      { id: 1, name: 'Conditionals Reference Sheet.pdf', type: 'PDF' },
      { id: 2, name: 'Practice Exercises', type: 'Link' }
    ],
    vocabularyWords: [
      { word: 'Unless', translation: 'Якщо не', example: 'Unless it rains, we will go to the park.' },
      { word: 'Provided', translation: 'За умови що', example: 'You can borrow my car provided you drive carefully.' }
    ],
    homework: 'Complete exercises 1-5 on page 42. Write 3 conditional sentences for each type.',
    color: '#7c6ee6'
  },
  '2': {
    title: 'Speaking: Project Proposal',
    type: 'Speaking',
    date: '2026-04-22',
    time: '14:00',
    duration: 55,
    teacher: 'Sarah Mitchell',
    meetLink: 'https://meet.google.com/xyz-abcd-efg',
    description: 'Practice presenting project proposals and answering questions',
    materials: [
      { id: 1, name: 'Presentation Template.pptx', type: 'PPT' }
    ],
    vocabularyWords: [],
    homework: '',
    color: '#3b82c4'
  }
};

// Database of available words
const wordDatabase = [
  { word: 'Eloquent', phonetic: '/ˈel.ə.kwənt/', partOfSpeech: 'adjective', translation: 'красномовний', definition: 'Fluent and persuasive in speaking or writing', example: 'She delivered an eloquent speech.' },
  { word: 'Leverage', phonetic: '/ˈlev.ər.ɪdʒ/', partOfSpeech: 'verb', translation: 'використовувати', definition: 'Use to maximum advantage', example: 'We need to leverage our resources.' },
  { word: 'Concise', phonetic: '/kənˈsaɪs/', partOfSpeech: 'adjective', translation: 'стислий', definition: 'Clear and brief', example: 'Please be concise in your presentation.' },
  { word: 'Ambiguous', phonetic: '/æmˈbɪɡ.ju.əs/', partOfSpeech: 'adjective', translation: 'неоднозначний', definition: 'Open to more than one interpretation', example: 'The contract forms were ambiguous.' },
  { word: 'Coherent', phonetic: '/koʊˈhɪr.ənt/', partOfSpeech: 'adjective', translation: 'послідовний', definition: 'Logical and consistent', example: 'Your argument is very coherent.' },
  { word: 'Profound', phonetic: '/prəˈfaʊnd/', partOfSpeech: 'adjective', translation: 'глибокий', definition: 'Very great or intense', example: 'She made a profound impact.' },
  { word: 'Implement', phonetic: '/ˈɪm.plə.ment/', partOfSpeech: 'verb', translation: 'впроваджувати', definition: 'Put into effect', example: 'We will implement the new policy.' }
];

export function LessonDetail({ lessonId, onBack }: LessonDetailProps) {
  const lesson = lessonData[lessonId] || lessonData['1'];
  const [searchWord, setSearchWord] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newHomework, setNewHomework] = useState(lesson.homework);
  const [vocabularyList, setVocabularyList] = useState(lesson.vocabularyWords);

  const filteredWords = wordDatabase.filter(w =>
    w.word.toLowerCase().includes(searchWord.toLowerCase())
  );

  const handleSelectWord = (word: typeof wordDatabase[0]) => {
    setVocabularyList([...vocabularyList, {
      word: word.word,
      translation: word.translation,
      example: word.example
    }]);
    setSearchWord('');
    setShowSuggestions(false);
  };

  const handleAddWord = () => {
    if (newWord && newTranslation) {
      setVocabularyList([...vocabularyList, { word: newWord, translation: newTranslation, example: newExample }]);
      setNewWord('');
      setNewTranslation('');
      setNewExample('');
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar with Quick Info */}
      <div className="w-80 bg-white flex flex-col" style={{ borderRight: '1px solid rgba(26, 26, 46, 0.06)' }}>
        <div className="p-6" style={{ borderBottom: '1px solid rgba(26, 26, 46, 0.06)' }}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm mb-5 transition-all px-3 py-2 rounded-lg -ml-3"
            style={{ color: '#7a7a9a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#1a1a2e';
              e.currentTarget.style.backgroundColor = '#f7f6f3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#7a7a9a';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to lessons
          </button>

          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `linear-gradient(135deg, ${lesson.color}, ${lesson.color}cc)` }}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-xl font-semibold mb-2" style={{ color: '#1a1a2e' }}>{lesson.title}</h1>
          <span className="inline-block px-3 py-1 rounded-lg text-xs font-medium mb-4" style={{ backgroundColor: `${lesson.color}15`, color: lesson.color }}>
            {lesson.type}
          </span>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3" style={{ color: '#3d3d55' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f0fb' }}>
                <Calendar className="w-4 h-4" style={{ color: '#3b82c4' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: '#7a7a9a' }}>Date</div>
                <div className="font-medium">{new Date(lesson.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>

            <div className="flex items-center gap-3" style={{ color: '#3d3d55' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#eeedfe' }}>
                <Clock className="w-4 h-4" style={{ color: '#7c6ee6' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: '#7a7a9a' }}>Time & Duration</div>
                <div className="font-medium">{lesson.time} · {lesson.duration} min</div>
              </div>
            </div>

            <div className="flex items-center gap-3" style={{ color: '#3d3d55' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e8f7f2' }}>
                <User className="w-4 h-4" style={{ color: '#16a97a' }} />
              </div>
              <div>
                <div className="text-xs" style={{ color: '#7a7a9a' }}>Teacher</div>
                <div className="font-medium">{lesson.teacher}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 space-y-3">
          <a
            href={lesson.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #16a97a, #0c6e52)', boxShadow: '0 4px 12px rgba(22, 169, 122, 0.25)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 169, 122, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 169, 122, 0.25)';
            }}
          >
            <Video className="w-5 h-5" />
            Join Google Meet
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: '#eeedfe', color: '#7c6ee6', border: '1.5px solid #ddd9fc' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ddd9fc';
              e.currentTarget.style.borderColor = '#7c6ee6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eeedfe';
              e.currentTarget.style.borderColor = '#ddd9fc';
            }}
          >
            <Send className="w-4 h-4" />
            Contact Teacher
          </button>
        </div>

        {/* Description */}
        <div className="p-6 flex-1" style={{ backgroundColor: '#fafafa' }}>
          <h4 className="text-xs font-semibold mb-2" style={{ color: '#3d3d55', letterSpacing: '0.5px' }}>ABOUT THIS LESSON</h4>
          <p className="text-sm leading-relaxed" style={{ color: '#7a7a9a' }}>{lesson.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#fafafa' }}>
        <div className="p-8 max-w-4xl mx-auto space-y-6">


          {/* Materials */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f0fb, #d4e5f7)' }}>
                  <FileText className="w-5 h-5" style={{ color: '#3b82c4' }} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Learning Materials</h3>
              </div>
              <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all" style={{ backgroundColor: '#e8f0fb', color: '#3b82c4' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d4e5f7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f0fb';
                }}
              >
                <Plus className="w-4 h-4" />
                Add Material
              </button>
            </div>

            <div className="space-y-3">
              {lesson.materials.map((material: any) => (
                <div
                  key={material.id}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all group"
                  style={{ backgroundColor: '#fafafa', border: '1.5px solid rgba(26, 26, 46, 0.06)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#3b82c4';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 196, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.06)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#e8f0fb' }}>
                    <FileText className="w-6 h-6" style={{ color: '#3b82c4' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-0.5" style={{ color: '#1a1a2e' }}>{material.name}</div>
                    <span className="text-xs px-2.5 py-1 rounded-md inline-block" style={{ backgroundColor: '#e8f7f2', color: '#16a97a' }}>
                      {material.type}
                    </span>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all" style={{ backgroundColor: '#3b82c4', color: '#ffffff' }}>
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Vocabulary Words */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eeedfe, #ddd9fc)' }}>
                <BookOpen className="w-5 h-5" style={{ color: '#7c6ee6' }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Vocabulary Words</h3>
            </div>

            {/* Search from Database */}
            <div className="mb-5 relative">
              <label className="block text-xs font-medium mb-2" style={{ color: '#3d3d55' }}>Add from vocabulary database</label>
              <input
                type="text"
                placeholder="Type to search words..."
                value={searchWord}
                onChange={(e) => {
                  setSearchWord(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#fafafa',
                  border: '1.5px solid rgba(26, 26, 46, 0.08)',
                  color: '#1a1a2e'
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && searchWord && filteredWords.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl p-2 z-10" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 8px 24px rgba(26, 26, 46, 0.12)', maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredWords.slice(0, 5).map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectWord(word)}
                      className="w-full text-left px-4 py-3 rounded-lg transition-all"
                      style={{ color: '#1a1a2e' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f6f3'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold mb-0.5">{word.word}</div>
                          <div className="text-xs mb-1" style={{ color: '#7a7a9a' }}>
                            {word.phonetic} · {word.partOfSpeech}
                          </div>
                          <div className="text-sm" style={{ color: '#3d3d55' }}>{word.definition}</div>
                        </div>
                        <Plus className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: '#7c6ee6' }} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {vocabularyList.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-5">
                {vocabularyList.map((item: any, index: number) => {
                  const wordData = wordDatabase.find(w => w.word === item.word);
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-5 transition-all group relative"
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
                      {/* Remove button */}
                      <button
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                        style={{ color: '#e05c7a' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdedf1'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Word Header */}
                      <div className="mb-3">
                        <h4 className="text-2xl font-semibold mb-1" style={{ color: '#1a1a2e', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {item.word}
                        </h4>
                        {wordData && (
                          <div className="text-sm mb-1" style={{ color: '#7a7a9a' }}>
                            {wordData.phonetic} · {wordData.partOfSpeech}
                          </div>
                        )}
                        <div className="text-sm font-medium" style={{ color: '#3d3d55' }}>
                          {item.translation}
                        </div>
                      </div>

                      {/* Definition */}
                      {wordData && (
                        <p className="text-sm mb-3 leading-relaxed" style={{ color: '#1a1a2e' }}>
                          {wordData.definition}
                        </p>
                      )}

                      {/* Example */}
                      {item.example && (
                        <p className="text-sm italic leading-relaxed" style={{ color: '#7a7a9a' }}>
                          "{item.example}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Word Form */}
            <div className="p-5 rounded-xl space-y-3" style={{ background: 'linear-gradient(135deg, #f9f8ff, #f3f1ff)', border: '1.5px dashed #7c6ee6' }}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Word"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7c6ee6';
                    e.currentTarget.style.boxShadow = '0 0 0 4px #eeedfe';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <input
                  type="text"
                  placeholder="Translation"
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7c6ee6';
                    e.currentTarget.style.boxShadow = '0 0 0 4px #eeedfe';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <input
                type="text"
                placeholder="Example sentence (optional)"
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ backgroundColor: '#ffffff', border: '1.5px solid rgba(26, 26, 46, 0.08)', color: '#1a1a2e' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7c6ee6';
                  e.currentTarget.style.boxShadow = '0 0 0 4px #eeedfe';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(26, 26, 46, 0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={handleAddWord}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #7c6ee6, #6b5ed4)', boxShadow: '0 4px 12px rgba(124, 110, 230, 0.25)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 110, 230, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 110, 230, 0.25)';
                }}
              >
                <Plus className="w-4 h-4" />
                Add Word
              </button>
            </div>
          </div>

          {/* Homework */}
          <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid rgba(26, 26, 46, 0.08)', boxShadow: '0 2px 8px rgba(26, 26, 46, 0.04)' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f7f2, #d1ede4)' }}>
                <FileText className="w-5 h-5" style={{ color: '#16a97a' }} />
              </div>
              <h3 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Homework Assignment</h3>
            </div>

            <textarea
              value={newHomework}
              onChange={(e) => setNewHomework(e.target.value)}
              placeholder="Describe homework tasks, exercises, and due dates..."
              className="w-full min-h-[120px] px-4 py-3.5 rounded-xl text-sm outline-none resize-none mb-4 transition-all"
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

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ backgroundColor: '#e8f7f2', color: '#0c6e52', border: '1.5px solid #a8dece' }}
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
                Attach Files
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all" style={{ background: 'linear-gradient(135deg, #16a97a, #0c6e52)', boxShadow: '0 4px 12px rgba(22, 169, 122, 0.25)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 169, 122, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 169, 122, 0.25)';
                }}
              >
                <Check className="w-4 h-4" />
                Save Homework
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
