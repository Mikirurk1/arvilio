'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.scss'

type CalEvent = {
  id: string; title: string; type: string; date: string; time: string;
  duration: number; teacherName: string; studentId: string; studentName: string; status: string;
}

type Role = 'student' | 'teacher'
const CURRENT_STUDENT = 'student-1'
const CURRENT_TEACHER = 'teacher-1'

const typeColor: Record<string, string> = {
  grammar: 'blue', vocabulary: 'green', speaking: 'amber', listening: 'purple'
}
const typeLabel: Record<string, string> = {
  grammar: 'Grammar', vocabulary: 'Vocabulary', speaking: 'Speaking', listening: 'Listening'
}
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1 // Mon=0
}
function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [role, setRole] = useState<Role>('student')
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(3) // April
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-04-20')
  const [rescheduleEvt, setRescheduleEvt] = useState<CalEvent | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [view, setView] = useState<'month' | 'week'>('month')

  useEffect(() => { fetch('/data/events.json').then(r => r.json()).then(setEvents) }, [])

  const visibleEvents = events.filter(e => {
    if (role === 'student') return e.studentId === CURRENT_STUDENT
    return true // teacher sees all
  })

  const eventsOnDate = (dateStr: string) => visibleEvents.filter(e => e.date === dateStr)

  const selectedEvents = selectedDate ? eventsOnDate(selectedDate) : []

  const daysCount = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const openReschedule = (evt: CalEvent) => {
    setRescheduleEvt(evt)
    setNewDate(evt.date)
    setNewTime(evt.time)
  }

  const applyReschedule = () => {
    if (!rescheduleEvt || !newDate || !newTime) return
    setEvents(prev => prev.map(e => e.id === rescheduleEvt.id ? { ...e, date: newDate, time: newTime, status: 'pending' } : e))
    setRescheduleEvt(null)
  }

  const cancelEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setRescheduleEvt(null)
  }

  // Week view: 7 days from selected or today
  const weekStart = (() => {
    const base = selectedDate ? new Date(selectedDate) : new Date(year, month, 1)
    const dow = base.getDay() === 0 ? 6 : base.getDay() - 1
    const start = new Date(base)
    start.setDate(base.getDate() - dow)
    return start
  })()

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8-19

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Calendar</h1>
          <p className={styles.pageSub}>
            {role === 'student' ? 'Your personal lesson schedule' : `Teacher view — all students (${[...new Set(events.map(e => e.studentId))].length} students)`}
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${view === 'month' ? styles.viewActive : ''}`} onClick={() => setView('month')}>Month</button>
            <button className={`${styles.viewBtn} ${view === 'week' ? styles.viewActive : ''}`} onClick={() => setView('week')}>Week</button>
          </div>
          <div className={styles.roleToggle}>
            <button className={`${styles.roleBtn} ${role === 'student' ? styles.roleActive : ''}`} onClick={() => setRole('student')}>Student</button>
            <button className={`${styles.roleBtn} ${role === 'teacher' ? styles.roleActive : ''}`} onClick={() => setRole('teacher')}>Teacher</button>
          </div>
        </div>
      </div>

      <div className={styles.calLayout}>
        {/* Main calendar */}
        <div className={styles.calMain}>
          {/* Nav */}
          <div className={styles.calNav}>
            <button className={styles.navBtn} onClick={prevMonth}>←</button>
            <h2 className={styles.calMonthTitle}>{MONTHS[month]} {year}</h2>
            <button className={styles.navBtn} onClick={nextMonth}>→</button>
          </div>

          {view === 'month' && (
            <div className={styles.monthGrid}>
              {DAYS.map(d => <div key={d} className={styles.dayName}>{d}</div>)}
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} className={styles.emptyCell} />)}
              {Array.from({ length: daysCount }, (_, i) => {
                const day = i + 1
                const dateStr = formatDate(year, month, day)
                const dayEvents = eventsOnDate(dateStr)
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === '2026-04-20'
                return (
                  <div
                    key={day}
                    className={`${styles.dayCell} ${isSelected ? styles.dayCellSelected : ''} ${isToday ? styles.dayCellToday : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <span className={styles.dayNum}>{day}</span>
                    <div className={styles.dayDots}>
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className={`${styles.dayDot} ${styles[`dot${typeColor[e.type]?.[0].toUpperCase() + typeColor[e.type]?.slice(1)}`]}`} />
                      ))}
                      {dayEvents.length > 3 && <span className={styles.moreLabel}>+{dayEvents.length - 3}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {view === 'week' && (
            <div className={styles.weekView}>
              <div className={styles.weekHeader}>
                <div className={styles.weekTimeCol} />
                {weekDays.map(d => {
                  const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate())
                  const isToday = dateStr === '2026-04-20'
                  const isSelected = selectedDate === dateStr
                  return (
                    <div key={dateStr}
                      className={`${styles.weekDayHeader} ${isToday ? styles.weekDayToday : ''} ${isSelected ? styles.weekDaySelected : ''}`}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <div className={styles.weekDayName}>{DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}</div>
                      <div className={styles.weekDayNum}>{d.getDate()}</div>
                    </div>
                  )
                })}
              </div>
              <div className={styles.weekBody}>
                {hours.map(hour => (
                  <div key={hour} className={styles.weekRow}>
                    <div className={styles.weekHour}>{hour}:00</div>
                    {weekDays.map(d => {
                      const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate())
                      const slotEvents = eventsOnDate(dateStr).filter(e => parseInt(e.time) === hour)
                      return (
                        <div key={dateStr} className={styles.weekCell}>
                          {slotEvents.map(e => (
                            <div key={e.id}
                              className={`${styles.weekEvt} ${styles[`evt${typeColor[e.type]?.[0].toUpperCase() + typeColor[e.type]?.slice(1)}`]}`}
                              onClick={() => setSelectedDate(dateStr)}
                            >
                              <div className={styles.weekEvtTitle}>{e.title}</div>
                              <div className={styles.weekEvtTime}>{e.time} · 55 min</div>
                              {role === 'student' ? null : <div className={styles.weekEvtStudent}>{e.studentName}</div>}
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar panel */}
        <div className={styles.calSidebar}>
          <div className={styles.sidePanel}>
            <div className={styles.sidePanelTitle}>
              {selectedDate
                ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Select a date'}
            </div>

            {selectedEvents.length === 0 && selectedDate && (
              <div className={styles.noEvents}>No lessons scheduled</div>
            )}

            {selectedEvents.map(e => (
              <div key={e.id} className={`${styles.eventCard} ${styles[`evt${typeColor[e.type]?.[0].toUpperCase() + typeColor[e.type]?.slice(1)}`]}`}>
                <div className={styles.evtHeader}>
                  <span className={`${styles.evtType}`}>{typeLabel[e.type]}</span>
                  <span className={`${styles.evtStatus} ${e.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending}`}>
                    {e.status}
                  </span>
                </div>
                <div className={styles.evtTitle}>{e.title}</div>
                <div className={styles.evtMeta}>
                  <span>🕐 {e.time} – {(() => {
                    const [h, m] = e.time.split(':').map(Number)
                    const end = new Date(0, 0, 0, h, m + 55)
                    return `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`
                  })()} (55 min)</span>
                </div>
                {role === 'teacher' && (
                  <div className={styles.evtStudent}>👤 {e.studentName}</div>
                )}
                {role === 'student' && (
                  <div className={styles.evtTeacher}>👩‍🏫 {e.teacherName}</div>
                )}
                <div className={styles.evtActions}>
                  <button className={styles.rescheduleBtn} onClick={() => openReschedule(e)}>
                    {role === 'teacher' ? 'Reschedule' : 'Request change'}
                  </button>
                  {role === 'teacher' && (
                    <button className={styles.cancelBtn} onClick={() => cancelEvent(e.id)}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming all */}
          <div className={styles.sidePanel} style={{ marginTop: 14 }}>
            <div className={styles.sidePanelTitle}>Upcoming lessons</div>
            {visibleEvents
              .filter(e => e.date >= '2026-04-20')
              .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
              .slice(0, 5)
              .map(e => (
                <div key={e.id} className={styles.upcomingItem} onClick={() => setSelectedDate(e.date)}>
                  <div className={`${styles.upcomingDot} ${styles[`dot${typeColor[e.type]?.[0].toUpperCase() + typeColor[e.type]?.slice(1)}`]}`} />
                  <div className={styles.upcomingInfo}>
                    <div className={styles.upcomingTitle}>{e.title}</div>
                    <div className={styles.upcomingMeta}>
                      {new Date(e.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {e.time}
                      {role === 'teacher' && ` · ${e.studentName}`}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Reschedule modal */}
      {rescheduleEvt && (
        <div className={styles.modalOverlay} onClick={() => setRescheduleEvt(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>
              {role === 'teacher' ? 'Reschedule lesson' : 'Request reschedule'}
            </div>
            <div className={styles.modalLesson}>{rescheduleEvt.title}</div>
            {role === 'teacher' && (
              <div className={styles.modalStudent}>Student: {rescheduleEvt.studentName}</div>
            )}
            <div className={styles.modalFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>New date</label>
                <input type="date" className={styles.fieldInput} value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>New time</label>
                <input type="time" className={styles.fieldInput} value={newTime} onChange={e => setNewTime(e.target.value)} />
              </div>
            </div>
            <div className={styles.modalNote}>Lesson duration is always 55 minutes.</div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setRescheduleEvt(null)}>Cancel</button>
              <button className={styles.modalConfirmBtn} onClick={applyReschedule}>
                {role === 'teacher' ? 'Confirm reschedule' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
