import {
  buildSystemPrompt,
  extractNavigate,
  stripNavigateMarker,
} from './system-prompt';

describe('system-prompt helpers', () => {
  it('embeds role policy and retrieved docs', () => {
    const prompt = buildSystemPrompt({
      role: 'student',
      pathname: '/dashboard',
      locale: 'uk',
      retrievedDocs: '[1] Calendar\nOpen /calendar',
    });
    expect(prompt).toContain('User role: student');
    expect(prompt).toContain('ROLE POLICY — student');
    expect(prompt).toContain('/dashboard');
    expect(prompt).toContain('Ukrainian');
    expect(prompt).toContain('Never provide homework');
    expect(prompt).toContain('[1] Calendar');
    expect(prompt).toContain('/payment');
    expect(prompt).not.toContain('/finance');
  });

  it('embeds admin allowlist including finance', () => {
    const prompt = buildSystemPrompt({
      role: 'admin',
      retrievedDocs: '',
    });
    expect(prompt).toContain('ROLE POLICY — school admin');
    expect(prompt).toContain('/finance');
    expect(prompt).toContain('/system');
  });

  it('extracts and strips NAVIGATE markers', () => {
    const raw = 'Open the calendar.\nNAVIGATE: /calendar';
    expect(extractNavigate(raw)).toBe('/calendar');
    expect(stripNavigateMarker(raw)).toBe('Open the calendar.');
    expect(extractNavigate('no link')).toBeNull();
    expect(extractNavigate('NAVIGATE: https://evil.com')).toBeNull();
  });

  it('role-gates NAVIGATE paths', () => {
    const finance = 'See ledgers.\nNAVIGATE: /finance';
    expect(extractNavigate(finance, 'student')).toBeNull();
    expect(extractNavigate(finance, 'teacher')).toBeNull();
    expect(extractNavigate(finance, 'admin')).toBe('/finance');
  });
});
