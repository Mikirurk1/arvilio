import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import type { ProfileNotificationPrefs } from '@pkg/types';
import { DEFAULT_NOTIFICATION_PREFS } from '@pkg/types';
import { toast } from '../../features/notifications';

interface ProfileSliceLike {
  status: string;
  data: { id: string; notificationPrefs?: ProfileNotificationPrefs | null } | null;
}

interface UseProfileNotificationSyncOptions {
  isAuthenticated: boolean;
  activeUserId: string | number;
  profileSlice: ProfileSliceLike;
  updateNotificationPrefs: (prefs: ProfileNotificationPrefs) => Promise<unknown>;
}

export function useProfileNotificationSync({
  isAuthenticated, activeUserId, profileSlice, updateNotificationPrefs,
}: UseProfileNotificationSyncOptions) {
  const [notifications, setNotificationsState] = useState<ProfileNotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [notifSaved, setNotifSaved] = useState(false);
  const hydratedRef = useRef<string | null>(null);
  const savedJsonRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotificationsState(DEFAULT_NOTIFICATION_PREFS);
      savedJsonRef.current = JSON.stringify(DEFAULT_NOTIFICATION_PREFS);
      hydratedRef.current = null;
      return;
    }
    if (profileSlice.status !== 'success' || !profileSlice.data) return;
    if (hydratedRef.current === profileSlice.data.id) return;
    const prefs = profileSlice.data.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS;
    setNotificationsState(prefs);
    savedJsonRef.current = JSON.stringify(prefs);
    hydratedRef.current = profileSlice.data.id;
  }, [activeUserId, isAuthenticated, profileSlice.data, profileSlice.status]);

  useEffect(() => {
    if (!isAuthenticated || profileSlice.status !== 'success') return;
    if (hydratedRef.current === null) return;
    const json = JSON.stringify(notifications);
    if (json === savedJsonRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void (async () => {
        try {
          await updateNotificationPrefs(notifications);
          savedJsonRef.current = json;
          setNotifSaved(true);
          toast.success('Notification preferences saved');
          setTimeout(() => setNotifSaved(false), 2500);
        } catch {
          toast.error('Failed to save notification preferences');
        }
      })();
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [notifications, isAuthenticated, profileSlice.status, updateNotificationPrefs]);

  const setNotifications = useCallback(
    (action: SetStateAction<ProfileNotificationPrefs>) => {
      setNotificationsState((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        if (!isAuthenticated) return next;
        return next;
      });
    },
    [activeUserId, isAuthenticated],
  );

  return { notifications, setNotifications, notifSaved };
}
