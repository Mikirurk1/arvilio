import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { EditLessonModal } from './EditLessonModal';

export function CalendarView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Calendar Section */}
      <div className="flex-1 flex flex-col bg-[#fafafb]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lessons, words, topics..."
              className="w-[280px] text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-gray-600">11 lessons left · 3 planned</span>
            </div>
            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm">
              M
            </div>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="px-6 py-5 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl">Calendar</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <button className="px-3 py-1.5 hover:bg-gray-100 rounded">Month</button>
                <button className="px-3 py-1.5 bg-gray-100 rounded">Week</button>
                <button className="px-3 py-1.5 hover:bg-gray-100 rounded">Student</button>
                <button className="px-3 py-1.5 hover:bg-gray-100 rounded">Teacher</button>
                <button className="px-3 py-1.5 hover:bg-gray-100 rounded">Admin</button>
                <button className="px-3 py-1.5 hover:bg-gray-100 rounded">Super Admin</button>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                Create lesson
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500">Teacher view — all students (2 students)</div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Month & Navigation */}
            <div className="flex items-center justify-center gap-4 py-4 border-b border-gray-200">
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium">April 2026</span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Week Header */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200">
              <div className="p-3 border-r border-gray-200" />
              {['20', '21', '22', '23', '24', '25', '26'].map((day, i) => (
                <div key={i} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                  <div className="text-xs text-gray-500">{daysInWeek[i]}</div>
                  <div className={`text-sm mt-1 ${i === 1 ? 'bg-blue-100 text-blue-600 w-6 h-6 rounded-full mx-auto flex items-center justify-center' : ''}`}>
                    {day}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)]">
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  <div className="p-2 text-xs text-gray-500 text-right pr-3 border-r border-gray-200 bg-gray-50">
                    {hour}:00
                  </div>
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="border-r border-b border-gray-100 last:border-r-0 min-h-[50px] relative hover:bg-blue-50/30 cursor-pointer"
                    >
                      {/* Sample event on Tuesday at 14:00 */}
                      {dayIndex === 1 && hour === 14 && (
                        <div className="absolute inset-1 bg-orange-100 border-l-2 border-orange-400 rounded p-1.5">
                          <div className="text-xs font-medium text-gray-800">Speaking Project Proposal</div>
                          <div className="text-xs text-gray-600">14:00 - 15 min</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-[280px] bg-white border-l border-gray-200 p-5">
        <div className="mb-6">
          <div className="text-sm font-medium mb-3">Monday 20 April</div>
          <div className="space-y-2">
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">GRAMMAR</div>
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">PHONETICS</div>
          </div>
          <div className="mt-3">
            <div className="text-sm mb-2">Grammar: Conditionals</div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <span>⏰ 14:00 (45 min)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>👤 Sarah Mitchell</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-3 px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50"
            >
              Edit lesson
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <EditLessonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
