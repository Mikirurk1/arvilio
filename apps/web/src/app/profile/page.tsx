'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
} from 'react';
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
  NotificationsPanel,
  ProfileStatisticsPanel,
  ProfileDetailsPanel,
} from './panels';
import { ProfileViewShell } from '../../components/profile/ProfileViewShell';
import {
  activeMockUser,
  buildProfileAchievements,
  canView,
  getProficiencyLevelById,
  getProfileStatsForUser,
  getUserAccountStatusById,
  getAppearancePrefsForUser,
  getNotificationPrefsForUser,
  mockProfileForm,
  patchAppearancePrefsForUser,
  setNotificationPrefsForUser,
  siteContent,
  USER_ROLE,
  type ProfileFontSizeMode,
  type ProfileNotificationPrefs,
  type ProfileThemeMode,
  type UserRoleId,
} from '../../mocks';
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

export default function ProfilePage() {
  const [tab, setTab] = useState<
    'profile' | 'statistics' | 'notifications' | 'connections' | 'appearance' | 'achievements' | 'account'
  >('profile');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ ...mockProfileForm });
  const [avatarUrl, setAvatarUrl] = useState(activeMockUser.avatar.url ?? '');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState<CropRect>({ x: 40, y: 40, size: 180 });
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; rect: CropRect } | null>(null);
  const [notifications, setNotificationsState] = useState(() =>
    getNotificationPrefsForUser(activeMockUser.id),
  );
  const { theme, setTheme, fontSize, setFontSize } = useAppearanceSettings();

  useEffect(() => {
    setNotificationsState(getNotificationPrefsForUser(activeMockUser.id));
    setAvatarUrl(activeMockUser.avatar.url ?? '');
    const appearance = getAppearancePrefsForUser(activeMockUser.id);
    setTheme(appearance.theme);
    setFontSize(appearance.fontSize);
  }, [activeMockUser.id, setTheme, setFontSize]);

  useEffect(() => {
    activeMockUser.avatar = avatarUrl ? { ...activeMockUser.avatar, url: avatarUrl } : {};
    window.dispatchEvent(
      new CustomEvent('mock-user-avatar-updated', {
        detail: { userId: activeMockUser.id, avatarUrl },
      }),
    );
  }, [avatarUrl]);

  const setNotifications = useCallback(
    (action: SetStateAction<ProfileNotificationPrefs>) => {
      setNotificationsState((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        setNotificationPrefsForUser(activeMockUser.id, next);
        return next;
      });
    },
    [activeMockUser.id],
  );

  const setThemeFromProfile = useCallback(
    (next: ProfileThemeMode) => {
      setTheme(next);
      patchAppearancePrefsForUser(activeMockUser.id, { theme: next });
    },
    [activeMockUser.id, setTheme],
  );

  const setFontSizeFromProfile = useCallback(
    (next: ProfileFontSizeMode) => {
      setFontSize(next);
      patchAppearancePrefsForUser(activeMockUser.id, { fontSize: next });
    },
    [activeMockUser.id, setFontSize],
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
  }, [cropRect, cropSource]);

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

  const profileStats = getProfileStatsForUser(activeMockUser.id);
  const profileAchievements = buildProfileAchievements(profileStats);

  const heroBadges = (() => {
    const level = getProficiencyLevelById(activeMockUser.proficiencyLevelId);
    const first = { label: level?.label ?? '—' };
    if (activeMockUser.role === USER_ROLE.student.id && activeMockUser.statusId) {
      const st = getUserAccountStatusById(activeMockUser.statusId);
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
    return [first, { label: roleLabel(activeMockUser.role), variant: 'neutral' as const }];
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

  if (!canView('profile', activeMockUser.role)) return null;

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
                <img src={avatarUrl} alt="" width={112} height={112} className={styles.avatarModalPreviewImage} />
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
                <img ref={cropImageRef} src={cropSource} alt="" className={styles.cropImage} />
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
      <ProfileViewShell
      title={siteContent.profile.title}
      subtitle={`${siteContent.profile.subtitle} · ${activeMockUser.role}`}
      avatar={
        <button
          type="button"
          className={styles.heroAvatarButton}
          onClick={() => setAvatarModalOpen(true)}
          aria-label="Change avatar"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" width={72} height={72} className={styles.heroAvatarImage} />
          ) : (
            <span>{getAvatarFallbackInitials(form.name)}</span>
          )}
          <span className={styles.heroAvatarPencil} aria-hidden>
            <Pencil size={12} />
          </span>
        </button>
      }
      name={form.name}
      meta={`${getProficiencyLevelById(activeMockUser.proficiencyLevelId)?.code ?? '—'} · ${activeMockUser.role}`}
      badges={heroBadges}
      stats={[
        { value: String(profileStats.wordsLearned), label: 'Words' },
        { value: String(profileStats.lessonsCompleted), label: 'Lessons' },
        { value: String(profileStats.streakDays), label: 'Streak' },
      ]}
      achievements={recentUnlockedAchievements}
      tab={tab}
      onTabChange={setTab}
      tabs={[
          {
            value: 'profile',
            label: 'Profile',
            panel: (
              <ProfileDetailsPanel
                form={form}
                setForm={setForm}
                saved={saved}
                viewerRole={activeMockUser.role}
                onSave={() => {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2500);
                }}
              />
            ),
          },
          {
            value: 'statistics',
            label: 'Statistics',
            panel: <ProfileStatisticsPanel roleId={activeMockUser.role} userId={activeMockUser.id} />,
          },
          {
            value: 'notifications',
            label: 'Notifications',
            panel: (
              <NotificationsPanel
                notifications={notifications}
                setNotifications={setNotifications}
              />
            ),
          },
          {
            value: 'connections',
            label: 'Connections',
            panel: <LinkedAccountsPanel links={activeMockUser.linkedAccounts} />,
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
      ]}
      />
    </>
  );
}
