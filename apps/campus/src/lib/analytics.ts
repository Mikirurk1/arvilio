'use client';

/**
 * Thin PostHog wrapper (G34).
 *
 * Activates only when NEXT_PUBLIC_POSTHOG_KEY is set — zero-ops otherwise so
 * development and non-analytics deployments are unaffected.
 *
 * All events are tenant-tagged with schoolId to enable per-school funnel analysis.
 * GDPR: consent is gated at the call sites; this module never calls identify/capture
 * unless the caller has confirmed consent is available.
 */

import posthog from 'posthog-js';

const KEY = process.env['NEXT_PUBLIC_POSTHOG_KEY'] ?? '';
const HOST = process.env['NEXT_PUBLIC_POSTHOG_HOST'] ?? 'https://eu.i.posthog.com';

let _initialized = false;

export function initAnalytics(): void {
  if (!KEY || _initialized || typeof window === 'undefined') return;
  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: false,
    autocapture: false,
    persistence: 'localStorage+cookie',
  });
  _initialized = true;
}

/** Link the current PostHog anonymous profile to a known user + school. */
export function identifyUser(userId: string, schoolId: string, role: string): void {
  if (!_initialized) return;
  posthog.identify(userId, { schoolId, role });
  posthog.group('school', schoolId, { schoolId });
}

/** Unlink on logout. */
export function resetAnalytics(): void {
  if (!_initialized) return;
  posthog.reset();
}

// ---------------------------------------------------------------------------
// Activation funnel events (G34)
// ---------------------------------------------------------------------------

export type AnalyticsEvent =
  | { name: 'signup_started' }
  | { name: 'signup_completed'; schoolId: string }
  | { name: 'wizard_step_completed'; step: string; schoolId: string }
  | { name: 'wizard_completed'; schoolId: string }
  | {
      name: 'tour_step_viewed';
      stepIndex: number;
      track?: string;
      role?: string;
      stepId?: string;
    }
  | { name: 'tour_completed'; track?: string; role?: string; stepId?: string }
  | {
      name: 'tour_skipped';
      stepIndex: number;
      track?: string;
      role?: string;
      stepId?: string;
    }
  | {
      name: 'tour_quest_viewed';
      questIndex: number;
      track?: string;
      role?: string;
      questId?: string;
    }
  | {
      name: 'tour_quest_completed';
      questIndex: number;
      track?: string;
      role?: string;
      questId?: string;
    }
  | {
      name: 'tour_quest_skipped';
      questIndex: number;
      track?: string;
      role?: string;
      questId?: string;
    }
  | {
      name: 'tour_chapter_started';
      track?: string;
      role?: string;
      chapterId: string;
    }
  | {
      name: 'tour_chapter_completed';
      track?: string;
      role?: string;
      chapterId: string;
    }
  | {
      name: 'tour_chapter_skipped';
      track?: string;
      role?: string;
      chapterId: string;
    }
  | {
      name: 'tour_chapter_replayed';
      track?: string;
      role?: string;
      chapterId: string;
    }
  | {
      name: 'tour_contextual_opened';
      track?: string;
      role?: string;
      stepId?: string;
    }
  | {
      name: 'tour_contextual_closed';
      track?: string;
      role?: string;
      stepId?: string;
    }
  | {
      name: 'tour_contextual_skipped';
      track?: string;
      role?: string;
      stepId?: string;
    }
  | { name: 'first_lesson_created'; schoolId: string }
  | { name: 'trial_checkout_started'; plan: string; schoolId: string }
  | { name: 'trial_converted'; plan: string; schoolId: string }
  | { name: 'domain_verified'; schoolId: string };

export function track(event: AnalyticsEvent): void {
  if (!_initialized) return;
  const { name, ...props } = event;
  posthog.capture(name, props);
}

export function trackPageview(path: string): void {
  if (!_initialized) return;
  posthog.capture('$pageview', { $current_url: path });
}

export { posthog as _posthog };
