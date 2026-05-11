import { ArrowRight, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export function Dashboard() {
  const words = [
    { word: 'Eloquent', definition: 'Fluent and persuasive in speech', category: 'Adjective' },
    { word: 'Leverage', definition: 'Use to maximum advantage', category: 'Verb' },
    { word: 'Concise', definition: 'Clear and brief', category: 'Adjective' },
    { word: 'Ambiguous', definition: 'Open to interpretation', category: 'Adjective' },
    { word: 'Coherent', definition: 'Logical and consistent', category: 'Adjective' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search lessons, words, topics..."
            className="w-[320px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-gray-600">14 day streak</span>
          </div>
          <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">
            M
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl mb-1">
            Good morning, <span className="italic">Mykola</span> 👋
          </h1>
          <p className="text-sm text-gray-500">Monday, April 20 · You've got 14-day streak — keep it up!</p>
        </div>

        {/* Current Lesson Card */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-2">Continue learning</div>
              <h2 className="text-xl mb-1">Business Vocabulary — Unit 3</h2>
              <p className="text-sm text-gray-400">Finance & Investment terms · 15 words remaining</p>
            </div>
            <button className="bg-[#4ade80] hover:bg-[#3cc96a] text-white px-5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <span>60% complete</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-[#4ade80] h-2 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xs text-gray-500 mb-1">Words learned</div>
            <div className="text-2xl mb-1">847</div>
            <div className="text-xs text-green-600">+12 this week</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-xs text-gray-500 mb-1">Study time this week</div>
            <div className="text-2xl mb-1">3.2h</div>
            <div className="text-xs text-green-600">+31 min vs last week</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs text-gray-500 mb-1">Lessons completed</div>
            <div className="text-2xl mb-1">38</div>
            <div className="text-xs text-green-600">5 this week</div>
          </div>
        </div>

        {/* Today's Lessons & Daily Goals */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm">TODAY'S LESSONS</h3>
              <button className="text-sm text-green-600 hover:underline">See all →</button>
            </div>
          </div>
          <div>
            <h3 className="text-sm mb-4">DAILY GOALS</h3>
          </div>
        </div>

        {/* Review Words & Word of the Day */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm">REVIEW WORDS</h3>
              <button className="text-sm text-green-600 hover:underline">All words →</button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {words.map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-medium mb-1">{item.word}</div>
                  <div className="text-xs text-gray-500 mb-2">{item.definition}</div>
                  <div className="text-xs text-gray-400">• {item.category}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm mb-4">WORD OF THE DAY</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h4 className="text-xl mb-2">Eloquent</h4>
              <p className="text-xs text-gray-500 mb-3 italic">/ ˈel.ə.kwənt / · adjective</p>
              <p className="text-sm mb-4">Fluent and persuasive in speaking or writing.</p>
            </div>
          </div>
        </div>

        {/* Level Info */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center">
            M
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">English Level: B2 (Upper-Intermediate)</div>
            <div className="text-xs text-gray-500 mt-1">Set by your teacher</div>
          </div>
        </div>
      </div>
    </div>
  );
}
