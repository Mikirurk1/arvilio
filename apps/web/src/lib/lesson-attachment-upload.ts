import type { ScheduledLessonDto } from '@pkg/types';
import { API_BASE } from './api';
import { isLessonFileAttachmentRef } from './lesson-file-ref';

export type LessonAttachmentUploadResult = {
  id: string;
  fileName: string;
  ref: string;
  downloadPath: string;
};

export async function uploadLessonAttachment(
  lessonId: string,
  file: File,
): Promise<LessonAttachmentUploadResult> {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(`${API_BASE}/lessons/files/${lessonId}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  if (!response.ok) {
    let message = `Upload failed: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: string | string[] };
          if (parsed.message) {
            message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
          }
        } catch {
          message = text;
        }
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return (await response.json()) as LessonAttachmentUploadResult;
}

export async function uploadPendingLessonFiles(
  lessonId: string,
  lesson: ScheduledLessonDto,
  takePending: (key: string) => File | undefined,
): Promise<ScheduledLessonDto> {
  const materials = await Promise.all(
    (lesson.materials ?? []).map(async (material) => ({
      ...material,
      files: await resolveFiles(
        lessonId,
        'material',
        material.id,
        material.files,
        takePending,
      ),
    })),
  );

  const homeworkFiles = lesson.homework
    ? await resolveFiles(lessonId, 'homework', 'main', lesson.homework.files, takePending)
    : undefined;

  const studentResponseFiles = lesson.studentResponse
    ? await resolveFiles(
        lessonId,
        'response',
        'main',
        lesson.studentResponse.files,
        takePending,
      )
    : undefined;

  return {
    ...lesson,
    materials,
    homework: lesson.homework
      ? { ...lesson.homework, files: homeworkFiles ?? lesson.homework.files }
      : lesson.homework,
    studentResponse: lesson.studentResponse
      ? {
          ...lesson.studentResponse,
          files: studentResponseFiles ?? lesson.studentResponse.files,
        }
      : lesson.studentResponse,
  };
}

async function resolveFiles(
  lessonId: string,
  scope: string,
  containerId: string,
  files: string[],
  takePending: (key: string) => File | undefined,
): Promise<string[]> {
  const next: string[] = [];
  for (const fileRef of files) {
    if (isLessonFileAttachmentRef(fileRef)) {
      next.push(fileRef);
      continue;
    }
    const pendingKey = `${scope}:${containerId}:${fileRef}`;
    const pending = takePending(pendingKey);
    if (!pending) {
      next.push(fileRef);
      continue;
    }
    const uploaded = await uploadLessonAttachment(lessonId, pending);
    next.push(uploaded.ref);
  }
  return next;
}
