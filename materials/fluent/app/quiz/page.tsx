'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.scss'

type Question = {
  id: string; type: 'multiple-choice' | 'fill-in';
  question: string; options?: string[]; correct: number | string; explanation: string;
}

type Phase = 'intro' | 'quiz' | 'result'

function estimateMinutes(questions: Question[]): number {
  const seconds = questions.reduce((sum, question) => {
    return sum + (question.type === 'fill-in' ? 60 : 40)
  }, 0)
  return Math.max(1, Math.round(seconds / 60))
}

function buildTopicCards(questions: Question[]) {
  return questions.slice(0, 4).map((question) => ({
    key: question.id,
    title: question.type === 'fill-in' ? 'Fill in the blank' : 'Multiple choice',
    desc: question.question,
    tag: question.type === 'fill-in' ? 'Grammar' : 'Vocabulary',
  }))
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [phase, setPhase] = useState<Phase>('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [fillAnswer, setFillAnswer] = useState('')
  const [showExp, setShowExp] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [score, setScore] = useState(0)

  useEffect(() => { fetch('/data/quiz.json').then(r => r.json()).then(setQuestions) }, [])

  const q = questions[current]
  const estimatedMinutes = estimateMinutes(questions)
  const topicCards = buildTopicCards(questions)

  const checkAnswer = () => {
    if (!q) return
    let correct = false
    if (q.type === 'multiple-choice') {
      correct = selected === q.correct
    } else {
      correct = fillAnswer.trim().toLowerCase() === (q.correct as string).toLowerCase()
    }
    setAnswers(prev => [...prev, correct])
    if (correct) setScore(s => s + 1)
    setShowExp(true)
  }

  const next = () => {
    setSelected(null)
    setFillAnswer('')
    setShowExp(false)
    if (current + 1 >= questions.length) {
      setPhase('result')
    } else {
      setCurrent(c => c + 1)
    }
  }

  const restart = () => {
    setCurrent(0); setSelected(null); setFillAnswer('')
    setShowExp(false); setAnswers([]); setScore(0); setPhase('intro')
  }

  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Quiz &amp; Practice</h1>
        <p className={styles.pageSub}>Test your grammar and vocabulary knowledge</p>
      </div>

      {phase === 'intro' && (
        <div className={styles.intro}>
          <div className={styles.introCard}>
            <div className={styles.introIcon}>Quiz</div>
            <h2 className={styles.introTitle}>Quiz from mock data</h2>
            <p className={styles.introDesc}>
              {questions.length} questions loaded from `/data/quiz.json`.
              Estimated completion time is calculated from question types.
            </p>
            <div className={styles.introMeta}>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>{questions.length}</span>
                <span className={styles.introMetaLbl}>Questions</span>
              </div>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>~{estimatedMinutes}</span>
                <span className={styles.introMetaLbl}>Minutes</span>
              </div>
              <div className={styles.introMetaItem}>
                <span className={styles.introMetaVal}>{topicCards.length}</span>
                <span className={styles.introMetaLbl}>Topics</span>
              </div>
            </div>
            <button className={styles.startBtn} onClick={() => setPhase('quiz')}>Start Quiz →</button>
          </div>

          <div className={styles.topicsGrid}>
            {topicCards.map((t) => (
              <div key={t.key} className={styles.topicCard}>
                <div className={styles.topicIcon}>{t.tag === 'Grammar' ? 'G' : 'V'}</div>
                <div className={styles.topicTitle}>{t.title}</div>
                <div className={styles.topicDesc}>{t.desc}</div>
                <span className={`${styles.topicTag} ${t.tag === 'Grammar' ? styles.tagBlue : styles.tagGreen}`}>{t.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'quiz' && q && (
        <div className={styles.quizArea}>
          {/* Progress bar */}
          <div className={styles.qProgress}>
            <div className={styles.qProgressBar}>
              <div className={styles.qProgressFill} style={{ width: `${((current) / questions.length) * 100}%` }} />
            </div>
            <span className={styles.qProgressLbl}>{current + 1} / {questions.length}</span>
          </div>

          {/* Score indicator */}
          <div className={styles.scoreRow}>
            {answers.map((ok, i) => (
              <div key={i} className={`${styles.scoreDot} ${ok ? styles.scoreDotGreen : styles.scoreDotRed}`} />
            ))}
            {Array.from({ length: questions.length - answers.length }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.scoreDotEmpty} />
            ))}
          </div>

          <div className={styles.questionCard}>
            <div className={styles.qType}>
              {q.type === 'multiple-choice' ? '🎯 Multiple choice' : '✍️ Fill in the blank'}
            </div>
            <h2 className={styles.qText}>{q.question}</h2>

            {q.type === 'multiple-choice' && q.options && (
              <div className={styles.options}>
                {q.options.map((opt, i) => {
                  let cls = styles.option
                  if (showExp) {
                    if (i === q.correct) cls = `${styles.option} ${styles.optionCorrect}`
                    else if (i === selected) cls = `${styles.option} ${styles.optionWrong}`
                  } else if (i === selected) {
                    cls = `${styles.option} ${styles.optionSelected}`
                  }
                  return (
                    <button key={i} className={cls}
                      onClick={() => !showExp && setSelected(i)}
                      disabled={showExp}
                    >
                      <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}

            {q.type === 'fill-in' && (
              <div className={styles.fillArea}>
                <input
                  className={`${styles.fillInput} ${showExp ? (answers[answers.length-1] ? styles.fillCorrect : styles.fillWrong) : ''}`}
                  placeholder="Type your answer here..."
                  value={fillAnswer}
                  onChange={e => !showExp && setFillAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !showExp && fillAnswer && checkAnswer()}
                  disabled={showExp}
                />
                {showExp && !answers[answers.length - 1] && (
                  <div className={styles.fillCorrectAnswer}>Correct: <strong>{q.correct as string}</strong></div>
                )}
              </div>
            )}

            {showExp && (
              <div className={`${styles.explanation} ${answers[answers.length-1] ? styles.expCorrect : styles.expWrong}`}>
                <div className={styles.expIcon}>{answers[answers.length-1] ? '✓ Correct!' : '✗ Not quite'}</div>
                <div className={styles.expText}>{q.explanation}</div>
              </div>
            )}

            <div className={styles.qActions}>
              {!showExp ? (
                <button
                  className={styles.checkBtn}
                  onClick={checkAnswer}
                  disabled={q.type === 'multiple-choice' ? selected === null : !fillAnswer.trim()}
                >
                  Check Answer
                </button>
              ) : (
                <button className={styles.nextBtn} onClick={next}>
                  {current + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className={styles.result}>
          <div className={styles.resultCard}>
            <div className={styles.resultEmoji}>
              {pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📖'}
            </div>
            <h2 className={styles.resultTitle}>
              {pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job!' : 'Keep practicing!'}
            </h2>
            <div className={styles.resultScore}>{score} / {questions.length}</div>
            <div className={styles.resultPct}>{pct}% correct</div>

            <div className={styles.resultStats}>
              <div className={styles.resultStat}>
                <span className={`${styles.resultStatVal} ${styles.green}`}>{score}</span>
                <span className={styles.resultStatLbl}>Correct</span>
              </div>
              <div className={styles.resultStat}>
                <span className={`${styles.resultStatVal} ${styles.rose}`}>{questions.length - score}</span>
                <span className={styles.resultStatLbl}>Wrong</span>
              </div>
              <div className={styles.resultStat}>
                <span className={`${styles.resultStatVal} ${styles.amber}`}>+{score * 10}</span>
                <span className={styles.resultStatLbl}>XP earned</span>
              </div>
            </div>

            <div className={styles.resultAnswers}>
              {questions.map((q, i) => (
                <div key={q.id} className={`${styles.resultAnswer} ${answers[i] ? styles.raCorrect : styles.raWrong}`}>
                  <span className={styles.raIcon}>{answers[i] ? '✓' : '✗'}</span>
                  <span className={styles.raQ}>{q.question.length > 60 ? q.question.slice(0, 60) + '…' : q.question}</span>
                </div>
              ))}
            </div>

            <div className={styles.resultActions}>
              <button className={styles.retryBtn} onClick={restart}>Try again</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
