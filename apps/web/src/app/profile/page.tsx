'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarCheck,
  Crown,
  Flame,
  Gem,
  GraduationCap,
  MessageSquareText,
  Mic,
  Mountain,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  Pencil,
  X,
} from 'lucide-react';
import {
  AccountPanel,
  AchievementsPanel,
  AppearancePanel,
  LinkedAccountsPanel,
  profileLinksToPanel,
  NotificationsPanel,
  ProfileStatisticsPanel,
  ProfileDetailsPanel,
} from './panels';
import { ProfileViewShell } from '../../components/profile/ProfileViewShell';
import type { TabsItem } from '../../components/ui';
import {
  buildProfileAchievements,
  canView,
  getProficiencyLevelById,
  getTimeZoneById,
  getUserAccountStatusById,
  getAppearancePrefsForUser,
  getNotificationPrefsForUser,
  patchAppearancePrefsForUser,
  setNotificationPrefsForUser,
  siteContent,
  USER_ROLE,
  type ProfileFontSizeMode,
  type ProfileThemeMode,
  type UserRoleId,
} from '../../mocks';
import { DEFAULT_NOTIFICATION_PREFS, type ProfileNotificationPrefs } from '@soenglish/shared-types';
import { toast } from '../../features/notifications';
import { useActiveUser } from '../../lib/active-user';
import { useOptionalAuth } from '../../lib/auth-context';
import { useProfileLiveStats } from '../../hooks/use-profile-live-stats';
import { isMyProfileComplete } from '../../lib/profile-complete';
import {
  formToCompletenessInput,
  formToUpdateInput,
  profileToForm,
  type ProfileFormState,
} from '../../lib/profile-form';
import { useAuthStore } from '../../stores/auth-store';
import { useProfileStore } from '../../stores/profile-store';
import { useAppearanceSettings } from '../providers';
import { getAvatarFallbackInitials } from '../../lib/avatar';
import styles from './page.module.scss';

const MIN_CROP_SIZE = 80;
const OUTPUT_AVATAR_SIZE = 512;
const OUTPUT_AVATAR_QUALITY = 0.82;

type CropRect = {
  x: number;
  y: number;
  size: number;
};

type ProfileTab =
  | 'profile'
  | 'statistics'
  | 'notifications'
  | 'connections'
  | 'appearance'
  | 'achievements'
  | 'account';

const emptyProfileForm = (): ProfileFormState => ({
  name: '',
  email: '',
  telegram: '',
  phone: '',
  timezoneId: 1,
  nativeLanguageId: '',
  proficiencyLevelId: 3,
  bio: '',
});

export default function ProfilePage() {
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = Boolean(auth?.user);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const profileSlice = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const updateNotificationPrefs = useProfileStore((s) => s.updateNotificationPrefs);
  const profileMutating = useProfileStore((s) => s.profileMutating);
  const profileError = useProfileStore((s) => s.profileError);
  const [tab, setTab] = useState<ProfileTab>('profile');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm);
  const [avatarUrl, setAvatarUrl] = useState('');
  const hydratedProfileIdRef = useRef<string | null>(null);
  const oauthCallbackHandledRef = useRef<string | null>(null);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const connectionLinks = useMemo(
    () =>
      profileLinksToPanel(
        isAuthenticated ? profileSlice.data?.linkedAccounts : undefined,
        activeUser.linkedAccounts,
      ),
    [activeUser.linkedAccounts, isAuthenticated, profileSlice.data?.linkedAccounts],
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'connections') setTab('connections');

    const googleLinked = searchParams.get('google_linked') === '1';
    const googleError = searchParams.get('google_link_error');
    const facebookLinked = searchParams.get('facebook_linked') === '1';
    const facebookError = searchParams.get('facebook_link_error');
    const hasOAuthCallback = googleLinked || googleError || facebookLinked || facebookError;
    if (!hasOAuthCallback) return;

    const callbackKey = searchParams.toString();
    if (oauthCallbackHandledRef.current === callbackKey) return;
    oauthCallbackHandledRef.current = callbackKey;

    if (googleLinked) {
      toast.success(
        'Google connected',
        'Calendar and Meet are enabled. You can schedule lessons now.',
      );
      void fetchProfile(true);
      void useAuthStore.getState().refresh();
    } else if (googleError) {
      toast.error('Could not connect Google', googleError);
    }

    if (facebookLinked) {
      toast.success('Facebook connected', 'Your Facebook account is linked to this profile.');
      void fetchProfile(true);
      void useAuthStore.getState().refresh();
    } else if (facebookError) {
      toast.error('Could not connect Facebook', facebookError);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('google_linked');
    nextParams.delete('google_link_error');
    nextParams.delete('facebook_linked');
    nextParams.delete('facebook_link_error');
    const qs = nextParams.toString();
    router.replace(qs ? `/profile?${qs}` : '/profile', { scroll: false });
  }, [fetchProfile, router, searchParams]);

  useEffect(() => {
    if (profileSlice.status !== 'success' || !profileSlice.data) return;
    if (hydratedProfileIdRef.current === profileSlice.data.id) return;
    setForm({
      ...profileToForm(profileSlice.data),
      email: profileSlice.data.email || auth?.user?.email || '',
    });
    setAvatarUrl(profileSlice.data.avatarUrl ?? '');
    hydratedProfileIdRef.current = profileSlice.data.id;
  }, [auth?.user?.email, profileSlice.data, profileSlice.status]);

  const profileLoading =
    profileSlice.status === 'loading' ||
    (profileSlice.status === 'idle' && hydratedProfileIdRef.current === null);

  const handleSaveProfile = useCallback(async () => {
    setSaved(false);
    try {
      await updateProfile(formToUpdateInput(form, { avatarUrl: avatarUrl || null }));
      const updated = useProfileStore.getState().profile.data;
      if (updated) {
        setForm((prev) => ({
          ...profileToForm(updated),
          email: updated.email || prev.email || auth?.user?.email || '',
        }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // saveError in store
    }
  }, [auth?.user?.email, avatarUrl, form, updateProfile]);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState<CropRect>({ x: 40, y: 40, size: 180 });
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; rect: CropRect } | null>(null);
  const [notifications, setNotificationsState] =
    useState<ProfileNotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [notifSaved, setNotifSaved] = useState(false);
  const hydratedNotifProfileIdRef = useRef<string | null>(null);
  const savedNotifJsonRef = useRef<string | null>(null);
  const notifDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, setTheme, fontSize, setFontSize } = useAppearanceSettings();

  useEffect(() => {
    if (!isAuthenticated) {
      const mockPrefs = getNotificationPrefsForUser(activeUser.id);
      setNotificationsState(mockPrefs);
      savedNotifJsonRef.current = JSON.stringify(mockPrefs);
      hydratedNotifProfileIdRef.current = null;
      return;
    }
    if (profileSlice.status !== 'success' || !profileSlice.data) return;
    if (hydratedNotifProfileIdRef.current === profileSlice.data.id) return;
    const prefs = profileSlice.data.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS;
    setNotificationsState(prefs);
    savedNotifJsonRef.current = JSON.stringify(prefs);
    hydratedNotifProfileIdRef.current = profileSlice.data.id;
  }, [activeUser.id, isAuthenticated, profileSlice.data, profileSlice.status]);

  useEffect(() => {
    const appearance = getAppearancePrefsForUser(activeUser.id);
    setTheme(appearance.theme);
    setFontSize(appearance.fontSize);
  }, [activeUser.id, setTheme, setFontSize]);

  useEffect(() => {
    if (!isAuthenticated || profileSlice.status !== 'success') return;
    if (hydratedNotifProfileIdRef.current === null) return;

    const json = JSON.stringify(notifications);
    if (json === savedNotifJsonRef.current) return;

    if (notifDebounceRef.current) clearTimeout(notifDebounceRef.current);
    notifDebounceRef.current = setTimeout(() => {
      void (async () => {
        try {
          await updateNotificationPrefs(notifications);
          savedNotifJsonRef.current = json;
          setNotifSaved(true);
          toast.success('Notification preferences saved');
          setTimeout(() => setNotifSaved(false), 2500);
        } catch {
          toast.error('Failed to save notification preferences');
        }
      })();
    }, 400);
    return () => {
      if (notifDebounceRef.current) clearTimeout(notifDebounceRef.current);
    };
  }, [notifications, isAuthenticated, profileSlice.status, updateNotificationPrefs]);

  useEffect(() => {
    activeUser.avatar = avatarUrl ? { ...activeUser.avatar, url: avatarUrl } : {};
    window.dispatchEvent(
      new CustomEvent('mock-user-avatar-updated', {
        detail: { userId: activeUser.id, avatarUrl },
      }),
    );
  }, [avatarUrl, activeUser]);

  const setNotifications = useCallback(
    (action: SetStateAction<ProfileNotificationPrefs>) => {
      setNotificationsState((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        if (!isAuthenticated) {
          setNotificationPrefsForUser(activeUser.id, next);
        }
        return next;
      });
    },
    [activeUser.id, isAuthenticated],
  );

  const setThemeFromProfile = useCallback(
    (next: ProfileThemeMode) => {
      setTheme(next);
      patchAppearancePrefsForUser(activeUser.id, { theme: next });
    },
    [activeUser.id, setTheme],
  );

  const setFontSizeFromProfile = useCallback(
    (next: ProfileFontSizeMode) => {
      setFontSize(next);
      patchAppearancePrefsForUser(activeUser.id, { fontSize: next });
    },
    [activeUser.id, setFontSize],
  );

  const handleAvatarFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropSource(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }, []);

  const clampCropRect = useCallback((next: CropRect): CropRect => {
    const image = cropImageRef.current;
    if (!image) return next;
    const maxWidth = image.clientWidth;
    const maxHeight = image.clientHeight;
    const maxSize = Math.max(MIN_CROP_SIZE, Math.min(maxWidth, maxHeight));
    const size = Math.max(MIN_CROP_SIZE, Math.min(next.size, maxSize));
    const x = Math.max(0, Math.min(next.x, maxWidth - size));
    const y = Math.max(0, Math.min(next.y, maxHeight - size));
    return { x, y, size };
  }, []);

  useEffect(() => {
    if (!cropSource) return;
    const image = cropImageRef.current;
    if (!image) return;

    const updateFromImageSize = () => {
      const width = image.clientWidth;
      const height = image.clientHeight;
      if (!width || !height) return;
      const baseSize = Math.min(width, height);
      const size = Math.max(MIN_CROP_SIZE, Math.floor(baseSize * 0.62));
      setCropRect({
        x: Math.max(0, Math.round((width - size) / 2)),
        y: Math.max(0, Math.round((height - size) / 2)),
        size,
      });
    };

    if (image.complete) updateFromImageSize();
    image.addEventListener('load', updateFromImageSize);
    return () => image.removeEventListener('load', updateFromImageSize);
  }, [cropSource]);

  useEffect(() => {
    if (!dragMode) return;
    const handlePointerMove = (event: PointerEvent) => {
      const start = dragStartRef.current;
      if (!start) return;
      const dx = event.clientX - start.pointerX;
      const dy = event.clientY - start.pointerY;
      if (dragMode === 'move') {
        setCropRect(clampCropRect({ ...start.rect, x: start.rect.x + dx, y: start.rect.y + dy }));
        return;
      }
      const delta = Math.max(dx, dy);
      setCropRect(clampCropRect({ ...start.rect, size: start.rect.size + delta }));
    };
    const stopDrag = () => {
      setDragMode(null);
      dragStartRef.current = null;
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDrag);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDrag);
    };
  }, [clampCropRect, dragMode]);

  const startDrag = useCallback(
    (mode: 'move' | 'resize', event: ReactPointerEvent) => {
      event.preventDefault();
      dragStartRef.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        rect: cropRect,
      };
      setDragMode(mode);
    },
    [cropRect],
  );

  const applyAvatarCrop = useCallback(async () => {
    const image = cropImageRef.current;
    if (!image || !cropSource) return;
    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;
    const sx = cropRect.x * scaleX;
    const sy = cropRect.y * scaleY;
    const sSize = cropRect.size * Math.min(scaleX, scaleY);

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_AVATAR_SIZE;
    canvas.height = OUTPUT_AVATAR_SIZE;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, sx, sy, sSize, sSize, 0, 0, OUTPUT_AVATAR_SIZE, OUTPUT_AVATAR_SIZE);

    setIsProcessingAvatar(true);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', OUTPUT_AVATAR_QUALITY),
    );
    setIsProcessingAvatar(false);
    if (!blob) return;

    const compressedDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Avatar conversion failed'));
      };
      reader.onerror = () => reject(new Error('Avatar conversion failed'));
      reader.readAsDataURL(blob);
    });

    setAvatarUrl(compressedDataUrl);
    setCropSource(null);
    try {
      await updateProfile(formToUpdateInput(form, { avatarUrl: compressedDataUrl }));
      setAvatarModalOpen(false);
    } catch {
      // profileError in store
    }
  }, [cropRect, cropSource, form, updateProfile]);

  useEffect(() => {
    if (!avatarModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAvatarModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [avatarModalOpen]);

  const { profileStats, loading: liveStatsLoading } = useProfileLiveStats();
  const profileComplete = useMemo(
    () => isMyProfileComplete(formToCompletenessInput(form, avatarUrl || profileSlice.data?.avatarUrl)),
    [avatarUrl, form, profileSlice.data?.avatarUrl],
  );
  const profileAchievements = buildProfileAchievements(profileStats, { profileComplete });

  const heroBadges = (() => {
    const level = getProficiencyLevelById(activeUser.proficiencyLevelId);
    const first = { label: level?.label ?? '—' };
    if (activeUser.role === USER_ROLE.student.id && activeUser.statusId) {
      const st = getUserAccountStatusById(activeUser.statusId);
      if (st?.name === 'active')
        return [first, { label: 'Active learner', variant: 'green' as const }];
      if (st?.name === 'paused')
        return [first, { label: 'Paused', variant: 'neutral' as const }];
      if (st?.name === 'leaved')
        return [first, { label: 'Left program', variant: 'neutral' as const }];
      if (st?.name === 'blocked')
        return [first, { label: 'Blocked', variant: 'neutral' as const }];
    }
    const roleLabel = (r: UserRoleId): string => {
      if (r === USER_ROLE.student.id) return 'Student';
      if (r === USER_ROLE.teacher.id) return 'Teacher';
      if (r === USER_ROLE.admin.id) return 'Admin';
      if (r === USER_ROLE.superAdmin.id) return 'Super admin';
      return 'Member';
    };
    return [first, { label: roleLabel(activeUser.role), variant: 'neutral' as const }];
  })();
  const achievementIconMap = {
    sparkles: <Sparkles size={20} />,
    'graduation-cap': <GraduationCap size={20} />,
    'calendar-check': <CalendarCheck size={20} />,
    flame: <Flame size={20} />,
    'book-open': <BookOpen size={20} />,
    brain: <Brain size={20} />,
    'messages-square': <MessageSquareText size={20} />,
    mic: <Mic size={20} />,
    target: <Target size={20} />,
    'badge-check': <BadgeCheck size={20} />,
    star: <Star size={20} />,
    rocket: <Rocket size={20} />,
    trophy: <Trophy size={20} />,
    crown: <Crown size={20} />,
    mountain: <Mountain size={20} />,
    gem: <Gem size={20} />,
  } as const;
  const allAchievements = profileAchievements.map((achievement) => ({
    icon: achievementIconMap[achievement.icon],
    label: achievement.label,
    description: achievement.description,
    unlocked: achievement.unlocked,
  }));
  const recentUnlockedAchievements = allAchievements.filter((achievement) => achievement.unlocked).slice(-10);

  if (!canView('profile', activeUser.role)) return null;

  return (
    <>
      {avatarModalOpen ? (
        <div className={styles.avatarModalBackdrop} onClick={() => setAvatarModalOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Update avatar"
            className={styles.avatarModal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.avatarModalClose}
              aria-label="Close"
              onClick={() => setAvatarModalOpen(false)}
            >
              <X size={16} />
            </button>
            <div className={styles.avatarModalPreview}>
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={112}
                  height={112}
                  className={styles.avatarModalPreviewImage}
                  unoptimized
                />
              ) : (
                <span>{getAvatarFallbackInitials(form.name)}</span>
              )}
            </div>
            <div className={styles.avatarModalTitle}>Profile avatar</div>
            <div className={styles.avatarModalText}>
              Choose an image, move and scale square crop area, then apply compressed avatar.
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className={styles.avatarFileInput}
              onChange={handleAvatarFileChange}
            />
            {cropSource ? (
              <div className={styles.cropWorkspace}>
                <Image
                  ref={cropImageRef}
                  src={cropSource}
                  alt=""
                  fill
                  className={styles.cropImage}
                  unoptimized
                  sizes="360px"
                />
                <div
                  className={styles.cropRect}
                  style={{
                    width: `${cropRect.size}px`,
                    height: `${cropRect.size}px`,
                    transform: `translate(${cropRect.x}px, ${cropRect.y}px)`,
                  }}
                  onPointerDown={(event) => startDrag('move', event)}
                >
                  <span className={styles.cropRectHint}>Drag</span>
                  <button
                    type="button"
                    className={styles.cropResizeHandle}
                    onPointerDown={(event) => startDrag('resize', event)}
                    aria-label="Resize crop square"
                  />
                </div>
              </div>
            ) : null}
            <div className={styles.avatarModalActions}>
              <button
                type="button"
                className={styles.avatarModalPrimary}
                onClick={() => avatarInputRef.current?.click()}
              >
                Choose image
              </button>
              {cropSource ? (
                <button
                  type="button"
                  className={styles.avatarModalPrimary}
                  disabled={isProcessingAvatar}
                  onClick={() => void applyAvatarCrop()}
                >
                  {isProcessingAvatar ? 'Processing...' : 'Apply crop'}
                </button>
              ) : null}
              {avatarUrl ? (
                <button
                  type="button"
                  className={styles.avatarModalSecondary}
                  onClick={() => setAvatarUrl('')}
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <ProfileViewShell<ProfileTab>
      title={siteContent.profile.title}
      subtitle={`${siteContent.profile.subtitle} · ${activeUser.role}`}
      avatar={
        <button
          type="button"
          className={styles.heroAvatarButton}
          onClick={() => setAvatarModalOpen(true)}
          aria-label="Change avatar"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={72}
              height={72}
              className={styles.heroAvatarImage}
              unoptimized
            />
          ) : (
            <span>{getAvatarFallbackInitials(form.name)}</span>
          )}
          <span className={styles.heroAvatarPencil} aria-hidden>
            <Pencil size={12} />
          </span>
        </button>
      }
      name={form.name}
      meta={`${getProficiencyLevelById(activeUser.proficiencyLevelId)?.code ?? '—'} · ${activeUser.role}`}
      badges={heroBadges}
      stats={[
        {
          value: liveStatsLoading ? '…' : String(profileStats.wordsLearned),
          label: 'Words',
        },
        {
          value: liveStatsLoading ? '…' : String(profileStats.lessonsCompleted),
          label: 'Lessons',
        },
        {
          value: liveStatsLoading ? '…' : '—',
          label: 'Streak',
        },
      ]}
      achievements={recentUnlockedAchievements}
      tab={tab}
      onTabChange={setTab}
      tabs={useMemo(
        (): TabsItem<ProfileTab>[] => [
          {
            value: 'profile',
            label: 'Profile',
            panel: (
              <ProfileDetailsPanel
                form={form}
                setForm={setForm}
                saved={saved}
                saving={profileMutating}
                saveError={profileError}
                loading={profileLoading}
                viewerRole={activeUser.role}
                onSave={handleSaveProfile}
              />
            ),
          },
          {
            value: 'statistics',
            label: 'Statistics',
            panel: <ProfileStatisticsPanel />,
          },
          {
            value: 'notifications',
            label: 'Notifications',
            panel: (
              <NotificationsPanel
                notifications={notifications}
                setNotifications={setNotifications}
                saving={profileMutating}
                saveError={profileError}
                saved={notifSaved}
              />
            ),
          },
          {
            value: 'connections',
            label: 'Connections',
            panel: (
              <LinkedAccountsPanel
                links={connectionLinks}
                canLink={isAuthenticated}
                accountEmail={profileSlice.data?.email ?? auth?.user?.email}
                onConnectionChange={() => {
                  void fetchProfile(true);
                  void useAuthStore.getState().refresh();
                }}
              />
            ),
          },
          {
            value: 'appearance',
            label: 'Appearance',
            panel: (
              <AppearancePanel
                theme={theme}
                setTheme={setThemeFromProfile}
                fontSize={fontSize}
                setFontSize={setFontSizeFromProfile}
              />
            ),
          },
          {
            value: 'achievements',
            label: 'Achievements',
            panel: <AchievementsPanel achievements={allAchievements} />,
          },
          {
            value: 'account',
            label: 'Account',
            panel: <AccountPanel />,
          },
        ],
        [
          activeUser.id,
          auth?.user?.email,
          connectionLinks,
          activeUser.role,
          allAchievements,
          fontSize,
          form,
          handleSaveProfile,
          notifications,
          notifSaved,
          profileComplete,
          profileError,
          profileLoading,
          profileMutating,
          saved,
          setFontSizeFromProfile,
          setNotifications,
          setThemeFromProfile,
          theme,
        ],
      )}
      />
    </>
  );
}
