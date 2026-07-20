import type { CampusTour } from './campus-cms';

type TourStepCopy = {
  id: string;
  title: string;
  body: string;
  area?: string;
  voiceSrc?: string;
  softSkipLabel?: string;
  requiresAction?: { hint: string };
};

/** Overlay CMS tour titles/bodies/voice onto structural track steps by stepId. */
export function mergeTourCopy<T extends TourStepCopy>(
  steps: T[],
  cmsTour: CampusTour | null | undefined,
): T[] {
  if (!cmsTour?.steps?.length) return steps;
  const byId = new Map(
    cmsTour.steps.map((s) => [s.stepId, s] as const),
  );
  return steps.map((step) => {
    const cms = byId.get(step.id);
    if (!cms) return step;
    const voiceSrc = cms.voiceSrc?.trim() || step.voiceSrc;
    return {
      ...step,
      title: cms.title?.trim() || step.title,
      body: cms.body?.trim() || step.body,
      area: cms.area?.trim() || step.area,
      ...(voiceSrc ? { voiceSrc } : {}),
    };
  });
}
