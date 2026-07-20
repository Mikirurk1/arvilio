import { mergeTourCopy } from './merge-tour-copy';

describe('mergeTourCopy', () => {
  const steps = [
    { id: 'stu-welcome', title: 'Code title', body: 'Code body', voiceSrc: '/fallback.mp3' },
    { id: 'stu-other', title: 'Other', body: 'Body' },
  ];

  it('overlays CMS title/body/voiceSrc by stepId', () => {
    const merged = mergeTourCopy(steps, {
      trackId: 'student',
      steps: [
        {
          stepId: 'stu-welcome',
          title: 'CMS title',
          body: 'CMS body',
          voiceSrc: 'http://localhost:4410/media/tour-audio/stu-welcome.mp3',
        },
      ],
    });
    expect(merged[0]).toMatchObject({
      id: 'stu-welcome',
      title: 'CMS title',
      body: 'CMS body',
      voiceSrc: 'http://localhost:4410/media/tour-audio/stu-welcome.mp3',
    });
    expect(merged[1]?.title).toBe('Other');
  });

  it('keeps code voiceSrc when CMS has none', () => {
    const merged = mergeTourCopy(steps, {
      trackId: 'student',
      steps: [{ stepId: 'stu-welcome', title: 'CMS', body: 'CMS' }],
    });
    expect(merged[0]?.voiceSrc).toBe('/fallback.mp3');
  });
});
