'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.scss'

type Word = {
  id: string; word: string; phonetic: string; pos: string;
  definition: string; example: string; status: 'new' | 'learning' | 'known'; category: string;
}

const statusColor: Record<string, string> = { new: 'blue', learning: 'amber', known: 'green' }
const categories = ['All', 'communication', 'business', 'finance', 'general']

export default function VocabularyPage() {
  const [words, setWords] = useState<Word[]>([])
  const [filter, setFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [mode, setMode] = useState<'list' | 'flashcard'>('list')
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/data/vocabulary.json').then(r => r.json()).then(setWords)
  }, [])

  const filtered = words.filter(w => {
    const catOk = filter === 'All' || w.category === filter
    const statusOk = statusFilter === 'all' || w.status === statusFilter
    const searchOk = !search || w.word.toLowerCase().includes(search.toLowerCase()) || w.definition.toLowerCase().includes(search.toLowerCase())
    return catOk && statusOk && searchOk
  })

  const currentCard = filtered[cardIndex]

  const markStatus = (status: Word['status']) => {
    setWords(prev => prev.map(w => w.id === currentCard.id ? { ...w, status } : w))
    setFlipped(false)
    setTimeout(() => setCardIndex(i => Math.min(i + 1, filtered.length - 1)), 300)
  }

  const stats = {
    new: words.filter(w => w.status === 'new').length,
    learning: words.filter(w => w.status === 'learning').length,
    known: words.filter(w => w.status === 'known').length,
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Vocabulary</h1>
          <p className={styles.pageSub}>{words.length} words in your library</p>
        </div>
        <div className={styles.modeToggle}>
          <button className={`${styles.modeBtn} ${mode === 'list' ? styles.modeActive : ''}`} onClick={() => setMode('list')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            List
          </button>
          <button className={`${styles.modeBtn} ${mode === 'flashcard' ? styles.modeActive : ''}`} onClick={() => { setMode('flashcard'); setCardIndex(0); setFlipped(false) }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5"/></svg>
            Flashcards
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statChip} onClick={() => setStatusFilter('all')}>
          <span className={styles.statNum}>{words.length}</span>
          <span className={styles.statLbl}>Total</span>
        </div>
        <div className={`${styles.statChip} ${styles.statBlue}`} onClick={() => setStatusFilter('new')}>
          <span className={styles.statNum}>{stats.new}</span>
          <span className={styles.statLbl}>New</span>
        </div>
        <div className={`${styles.statChip} ${styles.statAmber}`} onClick={() => setStatusFilter('learning')}>
          <span className={styles.statNum}>{stats.learning}</span>
          <span className={styles.statLbl}>Learning</span>
        </div>
        <div className={`${styles.statChip} ${styles.statGreen}`} onClick={() => setStatusFilter('known')}>
          <span className={styles.statNum}>{stats.known}</span>
          <span className={styles.statLbl}>Known</span>
        </div>
      </div>

      {mode === 'list' && (
        <>
          {/* Filters */}
          <div className={styles.filters}>
            <input
              className={styles.searchInput}
              placeholder="Search words..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className={styles.catFilters}>
              {categories.map(c => (
                <button key={c} className={`${styles.catBtn} ${filter === c ? styles.catActive : ''}`} onClick={() => setFilter(c)}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Word grid */}
          <div className={styles.wordGrid}>
            {filtered.map((w, i) => (
              <div key={w.id} className={styles.wordCard} style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={styles.wcTop}>
                  <div>
                    <div className={styles.wcWord}>{w.word}</div>
                    <div className={styles.wcPhonetic}>{w.phonetic}</div>
                  </div>
                  <span className={`${styles.wcStatus} ${styles[statusColor[w.status]]}`}>{w.status}</span>
                </div>
                <div className={styles.wcPos}>{w.pos}</div>
                <div className={styles.wcDef}>{w.definition}</div>
                <div className={styles.wcExample}>&quot;{w.example}&quot;</div>
                <div className={styles.wcActions}>
                  {(['new', 'learning', 'known'] as const).map(s => (
                    <button
                      key={s}
                      className={`${styles.wcBtn} ${w.status === s ? styles.wcBtnActive : ''}`}
                      onClick={() => setWords(prev => prev.map(word => word.id === w.id ? { ...word, status: s } : word))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className={styles.empty}>No words found. Try a different filter.</div>
          )}
        </>
      )}

      {mode === 'flashcard' && (
        <div className={styles.flashcardMode}>
          <div className={styles.fcProgress}>
            <span>{cardIndex + 1} / {filtered.length}</span>
            <div className={styles.fcBar}>
              <div className={styles.fcBarFill} style={{ width: `${((cardIndex + 1) / filtered.length) * 100}%` }} />
            </div>
          </div>

          {currentCard ? (
            <>
              <div
                className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`}
                onClick={() => setFlipped(f => !f)}
              >
                <div className={styles.fcFront}>
                  <div className={styles.fcHint}>Click to reveal definition</div>
                  <div className={styles.fcWord}>{currentCard.word}</div>
                  <div className={styles.fcPhonetic}>{currentCard.phonetic}</div>
                  <div className={styles.fcCategory}>{currentCard.category} · {currentCard.pos}</div>
                </div>
                <div className={styles.fcBack}>
                  <div className={styles.fcDef}>{currentCard.definition}</div>
                  <div className={styles.fcExample}>&quot;{currentCard.example}&quot;</div>
                </div>
              </div>

              {flipped && (
                <div className={styles.fcButtons}>
                  <button className={`${styles.fcBtn} ${styles.fcBtnRed}`} onClick={() => markStatus('new')}>
                    Still learning
                  </button>
                  <button className={`${styles.fcBtn} ${styles.fcBtnAmber}`} onClick={() => markStatus('learning')}>
                    Almost got it
                  </button>
                  <button className={`${styles.fcBtn} ${styles.fcBtnGreen}`} onClick={() => markStatus('known')}>
                    Know it! ✓
                  </button>
                </div>
              )}

              <div className={styles.fcNav}>
                <button className={styles.fcNavBtn} onClick={() => { setCardIndex(i => Math.max(0, i-1)); setFlipped(false) }} disabled={cardIndex === 0}>← Prev</button>
                <button className={styles.fcNavBtn} onClick={() => { setCardIndex(i => Math.min(filtered.length-1, i+1)); setFlipped(false) }} disabled={cardIndex === filtered.length - 1}>Next →</button>
              </div>
            </>
          ) : (
            <div className={styles.fcComplete}>
              <div className={styles.fcCompleteIcon}>🎉</div>
              <div className={styles.fcCompleteTitle}>All done!</div>
              <div className={styles.fcCompleteSub}>You reviewed all {words.length} words. Great work!</div>
              <button className={styles.fcRestartBtn} onClick={() => { setCardIndex(0); setFlipped(false) }}>Review again</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
