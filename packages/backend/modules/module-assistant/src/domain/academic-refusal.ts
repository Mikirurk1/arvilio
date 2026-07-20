/**
 * Cheap pre-LLM academic-refusal heuristics.
 * When matched, return a fixed refusal without calling the model (saves tokens).
 *
 * Keep patterns narrow: require clear cheat / assignment intent.
 * Do NOT match bare “answer”, “solve”, “переклади”, or “дай відповідь” alone —
 * those block legitimate product questions (materials facts, UI translations).
 *
 * Note: avoid relying on `\b` for Cyrillic — JS word boundaries are ASCII-only.
 */

import type { AssistantRole } from './role-policy';
import {
  academicRefusalForRole,
  jailbreakRefusalForRole,
} from './role-policy';

/** Clear intent to get graded-work answers / keys (all roles). */
const ACADEMIC_PATTERNS: RegExp[] = [
  /\b(quiz|test|homework|assignment|exercise)\b.{0,48}\b(answers?|solutions?|key|keys|cheat)\b/i,
  /\b(answers?|solutions?|key|keys|cheat)\b.{0,48}\b(quiz|test|homework|assignment|exercise)\b/i,
  /\b(what('s| is) the (correct |right )?(answer|solution))\b.{0,40}\b(quiz|test|homework|assignment|exercise|question)\b/i,
  /\b(give me|tell me|show me).{0,40}\b(quiz|test|homework|assignment).{0,20}\b(answers?|solutions?|key)\b/i,
  /\b(fill.?in|complete (this|the) (quiz|test|exercise))\b/i,
  /\bsolve\b.{0,32}\b(my |this |the )?(homework|assignment|exercise|quiz|test)\b/i,
  /\b(homework|assignment|exercise|quiz|test)\b.{0,32}\bsolve\b/i,
  /\b(translate (this |my )?(homework|assignment|exercise|quiz))\b/i,
  /\b(speaking).{0,24}\b(model answer|sample answer)\b/i,
  // Ukrainian — require homework/quiz context (no bare «дай відповідь» / «переклади»)
  /(ключ\s*(до|від)\s*(тест|квіз|завдан|дз|домашк|вправ))/i,
  /(правильн\w*\s*відповід\w*).{0,24}(тест|квіз|дз|домашк|завдан|вправ)/i,
  /(дай\s+відповід\w*).{0,24}(на\s+)?(тест|квіз|дз|домашк|завдан|вправ)/i,
  /(розв'?яжи?\s+(мені\s+)?(це\s+)?(дз|домашк|завдан|вправ|тест|квіз))/i,
  /(відповід[іиь]).{0,24}(на\s+)?(тест|квіз|дз|домашк|завдан|вправ)/i,
  /(тест|квіз|дз|домашк|завдан|вправ).{0,24}(відповід|ключ)/i,
  /(переклади?\s+(це\s+)?(дз|домашк|завдан|вправ|тест|квіз))/i,
];

const JAILBREAK_PATTERNS: RegExp[] = [
  /\b(ignore (all |previous |your )?(instructions|rules|policy))\b/i,
  /\b(you are now|DAN|developer mode|jailbreak)\b/i,
  /\b(system prompt|reveal (your |the )?prompt)\b/i,
  /\b(pretend|roleplay).{0,40}\b(no restrictions|unrestricted)\b/i,
  /(ігноруй|ігнорувати).{0,30}(інструкц|правил)/i,
];

/** @deprecated Prefer refusalMessage(kind, role) — kept for older tests. */
export const ACADEMIC_REFUSAL_MESSAGE = academicRefusalForRole('student');

export const JAILBREAK_REFUSAL_MESSAGE = jailbreakRefusalForRole('student');

export type RefusalKind = 'academic' | 'jailbreak';

export function detectRefusal(
  query: string,
  _role?: AssistantRole,
): RefusalKind | null {
  const text = query.trim();
  if (!text) return null;
  if (JAILBREAK_PATTERNS.some((p) => p.test(text))) return 'jailbreak';
  if (ACADEMIC_PATTERNS.some((p) => p.test(text))) return 'academic';
  return null;
}

export function refusalMessage(
  kind: RefusalKind,
  role: AssistantRole = 'student',
): string {
  return kind === 'jailbreak'
    ? jailbreakRefusalForRole(role)
    : academicRefusalForRole(role);
}
