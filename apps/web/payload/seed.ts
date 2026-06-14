import config from '../payload.config'

const INITIAL_PAGE_CONTENT = [
  { key: 'login.hero.title', locale: 'uk', value: 'Sign in', scope: 'platform', description: 'Login page main heading' },
  { key: 'login.hero.subtitle', locale: 'uk', value: 'Welcome back. Pick up your lessons, practice, and messages in one place.', scope: 'platform', description: 'Login page subtitle' },
  { key: 'dashboard.welcome.title', locale: 'uk', value: 'Good morning', scope: 'school', description: 'Dashboard greeting' },
  { key: 'practice.hero.title', locale: 'uk', value: 'Practice', scope: 'school', description: 'Practice page heading' },
  { key: 'vocabulary.hero.title', locale: 'uk', value: 'Vocabulary', scope: 'school', description: 'Vocabulary page heading' },
]

const INITIAL_BRANDING = {
  schoolName: 'SoEnglish',
  tagline: 'English Platform',
  primaryColor: '#1a1a2e',
}

function makeRichText(text: string) {
  return {
    root: {
      type: 'root',
      children: [{
        type: 'paragraph',
        children: [{ type: 'text', text, version: 1 }],
        version: 1,
      }],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

async function seed() {
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  console.log('Seeding page content...')
  for (const item of INITIAL_PAGE_CONTENT) {
    const { docs } = await payload.find({
      collection: 'page-content',
      where: { and: [{ key: { equals: item.key } }, { locale: { equals: item.locale } }] },
      limit: 1,
    })
    if (docs.length === 0) {
      await payload.create({
        collection: 'page-content',
        data: { ...item, value: makeRichText(item.value) } as any,
      })
      console.log(`  + ${item.key} [${item.locale}]`)
    } else {
      console.log(`  - ${item.key} [${item.locale}] already exists, skipping`)
    }
  }

  console.log('Seeding globals...')

  await payload.updateGlobal({
    slug: 'dashboard-content',
    data: {
      greeting: 'Good morning',
      subtitle: "Monday, April 20 · You're on a 14-day streak — keep it up!",
      hero: {
        label: 'Continue where you left off',
        title: 'Business Vocabulary — Unit 3',
        subtitle: 'Finance & investment terms · 15 words remaining',
        progressLabel: '62% complete',
      },
    } as any,
  })
  console.log('  + dashboard-content')

  await payload.updateGlobal({
    slug: 'practice-content',
    data: {
      title: 'Practice',
      subtitle: 'Pick an activity: build vocabulary like in the Vocabulary area, or run drills like in the Quiz — all from one place.',
      activities: [
        { id: 'activity-vocab', href: '/practice/vocabulary', title: 'Vocabulary', description: 'Search and organize your words, track new vs known, and flip through flashcards to memorize faster.', icon: 'book-open', tag: 'Words', tagClass: 'tagGreen', stat: '4 new words', accent: 'green', disabled: false },
        { id: 'activity-quiz', href: '/practice/quiz', title: 'Quiz', description: 'Multiple-choice and fill-in questions on grammar and vocabulary with explanations after each answer.', icon: 'target', tag: 'Grammar', tagClass: 'tagBlue', stat: '3 available', accent: 'blue', disabled: false },
        { id: 'activity-speaking', href: '/practice/speaking', title: 'Speaking', description: 'Discussion topics with optional vocabulary prompts, voice recording, and teacher feedback.', icon: 'mic', tag: 'Live', tagClass: 'tagAmber', stat: 'Topics', accent: 'purple', disabled: false },
        { id: 'activity-irregular-verbs', href: '/practice/irregular-verbs', title: 'Irregular verbs', description: 'Browse the full irregular verb table and run a Three Forms Drill on past simple and past participle.', icon: 'repeat', tag: 'Grammar', tagClass: 'tagAmber', stat: 'Drill ready', accent: 'amber', disabled: false },
        { id: 'activity-games', href: '#', title: 'Games', description: 'Learn through mini-games and timed challenges that reinforce vocabulary in context.', icon: 'gamepad-2', tag: 'Soon', tagClass: 'tagMuted', stat: 'Coming soon', accent: 'amber', disabled: true },
        { id: 'activity-challenges', href: '#', title: 'Challenges', description: 'Take weekly learning challenges and compare progress with your own best streaks.', icon: 'trophy', tag: 'Soon', tagClass: 'tagMuted', stat: 'Coming soon', accent: 'rose', disabled: true },
      ],
    } as any,
  })
  console.log('  + practice-content')

  await payload.updateGlobal({
    slug: 'quiz-content',
    data: {
      title: 'Quiz & Practice',
      subtitle: 'Test your grammar and vocabulary knowledge',
    } as any,
  })
  console.log('  + quiz-content')

  await payload.updateGlobal({
    slug: 'calendar-content',
    data: {
      title: 'Calendar',
      seriesConfirm: {
        detachTitle: 'Detach from recurrence?',
        detachBody: 'Moving this lesson to another day will detach it from the series. Other lessons in the series stay on their dates.',
        detachConfirm: 'Detach and move',
        applyAllTitle: 'Change all lessons in series?',
        applyAllBody: 'Are you sure you want to change the time for all scheduled lessons in this series?',
        applyAllConfirm: 'Change all',
        cancel: 'Cancel',
      },
      lessonModal: {
        titleCreate: 'Plan lesson',
        titleEdit: 'Edit lesson',
        subtitle: 'Configure lesson details, status and recurrence.',
        sections: { setup: 'Lesson planning', content: 'Lesson content' },
        fields: {
          title: 'Title', date: 'Date', startTime: 'Start time', duration: 'Duration (min)',
          recurrence: 'Recurrence', status: 'Status', cancelReason: 'Cancel reason',
          credited: 'Credited', weekDays: 'Week days', lessonType: 'Lesson type',
          studentGroup: 'Learning group', students: 'Students', student: 'Student',
          lessonPlan: 'Lesson plan', materials: 'Materials', homework: 'Homework',
          studentResponse: 'Student response', homeworkReview: 'Homework review',
          teacherHomeworkFeedback: 'Teacher feedback',
        },
        options: {
          noRepeat: 'No repeat', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
          planned: 'Planned', completed: 'Completed', cancelled: 'Cancelled',
          studentAbsent: 'Student absent', studentRequestedCancel: 'Student requested cancellation',
          teacherAbsent: 'Teacher absent', credited: 'Credited', notCredited: 'Not credited',
          individualLesson: 'Individual', groupLesson: 'Group',
        },
        hints: { recurrenceFixedOnly: 'Recurrence is available only for students with a fixed schedule.' },
        weekDays: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' },
        materialTypes: { text: 'Text', photo: 'Photo', test: 'Test', file: 'File', presentation: 'Presentation', book: 'Book', board: 'Board' },
        actions: {
          addFile: 'Add file', saveMaterial: 'Save material', cancel: 'Cancel',
          saveLesson: 'Save lesson', updateLesson: 'Update lesson',
          sendChangeRequest: 'Send change request', markHomeworkChecked: 'Mark as checked',
        },
        placeholders: { addText: 'Add text...' },
        messages: {
          blockedUnsafeFiles: 'Blocked unsafe files: {files}. Allowed: docs, slides, tables, text, images, pdf up to {max}MB.',
          rejectedFiles: 'Rejected: {files} (allowed up to {max}MB).',
        },
        aria: {
          sections: 'Lesson modal sections', unlinkSeries: 'Unlink lesson from series',
          deleteSeries: 'Delete all lessons in this series', deleteLesson: 'Delete lesson',
          closeModal: 'Close modal', removeFile: 'Remove file', removeMaterial: 'Remove material',
          closeImagePreview: 'Close image preview',
        },
        homeworkCheckedStatus: 'Checked',
        materialsHint: 'Choose type, fill details and save',
        noMaterials: 'No materials added yet.',
        fallbackMaterialLabel: 'Material',
        imagePreviewAlt: 'Material preview',
      },
    } as any,
  })
  console.log('  + calendar-content')

  await payload.updateGlobal({
    slug: 'profile-content',
    data: {
      title: 'Profile & Settings',
      subtitle: 'Manage your account and preferences',
    } as any,
  })
  console.log('  + profile-content')

  console.log('Seeding branding...')
  const { docs: brandingDocs } = await payload.find({ collection: 'school-branding', limit: 1 })
  if (brandingDocs.length === 0) {
    await payload.create({ collection: 'school-branding', data: INITIAL_BRANDING })
    console.log('  + branding created')
  } else {
    console.log('  - branding already exists, skipping')
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
