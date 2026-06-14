'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen, CalendarDays, Crown, Flame, Pencil,
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
import { Button, type TabsItem } from '../../components/ui';
import {
  buildProfileAchievements,
  getProficiencyLevelById,
  getUserAccountStatusById,
  patchAppearancePrefsForUser,
  siteContent,
  USER_ROLE,
  type ProfileFontSizeMode,
  type ProfileThemeMode,
} from '../../mocks';
import { useActiveUser } from '../../lib/active-user';
import { useOptionalAuth } from '../../lib/auth-context';
import { useAchievementStats } from '../../hooks/use-achievement-stats';
import { useProfileLiveStats } from '../../hooks/use-profile-live-stats';
import { buildProfileHeroAction, formatContactMetaLine } from '../../lib/profile-hero-highlights';
import { formToUpdateInput, profileToForm, type ProfileFormState } from '../../lib/profile-form';
import { useAuthStore } from '../../stores/auth-store';
import { useProfileStore } from '../../stores/profile-store';
import { useAppearanceSettings } from '../providers';
import { getAvatarFallbackInitials } from '../../lib/avatar';
import { AvatarCropModal } from './AvatarCropModal';
import { useProfileNotificationSync } from './use-profile-notification-sync';
import { buildAllAchievements } from './profile-achievement-icons';
import styles from './page.module.scss';

type ProfileTab = 'profile' | 'statistics' | 'notifications' | 'connections' | 'appearance' | 'achievements' | 'account';

const emptyProfileForm = (): ProfileFormState => ({
  name: '', email: '', telegram: '', phone: '',
  timezoneId: 1, nativeLanguageId: '', proficiencyLevelId: 3, bio: '',
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
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const hydratedProfileIdRef = useRef<string | null>(null);
  const oauthCallbackHandledRef = useRef<string | null>(null);

  useEffect(() => { void fetchProfile(); }, [fetchProfile]);

  const connectionLinks = useMemo(
    () => profileLinksToPanel(isAuthenticated ? profileSlice.data?.linkedAccounts : undefined, activeUser.linkedAccounts),
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
    if (googleLinked) { void fetchProfile(true); void useAuthStore.getState().refresh(); }
    else if (googleError) { /* toast handled by query */ }
    if (facebookLinked) { void fetchProfile(true); void useAuthStore.getState().refresh(); }
    const nextParams = new URLSearchParams(searchParams.toString());
    ['google_linked', 'google_link_error', 'facebook_linked', 'facebook_link_error'].forEach((k) => nextParams.delete(k));
    const qs = nextParams.toString();
    router.replace(qs ? `/profile?${qs}` : '/profile', { scroll: false });
  }, [fetchProfile, router, searchParams]);

  useEffect(() => {
    if (profileSlice.status !== 'success' || !profileSlice.data) return;
    if (hydratedProfileIdRef.current === profileSlice.data.id) return;
    setForm({ ...profileToForm(profileSlice.data), email: profileSlice.data.email || auth?.user?.email || '' });
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
      if (updated) setForm((prev) => ({ ...profileToForm(updated), email: updated.email || prev.email || auth?.user?.email || '' }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* saveError in store */ }
  }, [auth?.user?.email, avatarUrl, form, updateProfile]);

  const handleCropApply = useCallback(async (dataUrl: string) => {
    setAvatarUrl(dataUrl);
    try {
      await updateProfile(formToUpdateInput(form, { avatarUrl: dataUrl }));
      setAvatarModalOpen(false);
    } catch { /* profileError in store */ }
  }, [form, updateProfile]);

  useEffect(() => {
    activeUser.avatar = avatarUrl ? { ...activeUser.avatar, url: avatarUrl } : {};
    window.dispatchEvent(new CustomEvent('mock-user-avatar-updated', { detail: { userId: activeUser.id, avatarUrl } }));
  }, [avatarUrl, activeUser]);

  const { notifications, setNotifications, notifSaved } = useProfileNotificationSync({
    isAuthenticated,
    activeUserId: activeUser.id,
    profileSlice,
    updateNotificationPrefs,
  });

  const { theme, setTheme, fontSize, setFontSize } = useAppearanceSettings();

  const setThemeFromProfile = useCallback((next: ProfileThemeMode) => {
    setTheme(next);
    patchAppearancePrefsForUser(activeUser.id, { theme: next });
  }, [activeUser.id, setTheme]);

  const setFontSizeFromProfile = useCallback((next: ProfileFontSizeMode) => {
    setFontSize(next);
    patchAppearancePrefsForUser(activeUser.id, { fontSize: next });
  }, [activeUser.id, setFontSize]);

  const { stats: profileStats, loading: liveStatsLoading } = useAchievementStats();
  const { lessons: profileLessons, summary: profileSummary, isStudent } = useProfileLiveStats();
  const allAchievements = buildAllAchievements(buildProfileAchievements(profileStats));
  const recentUnlockedAchievements = allAchievements.filter((a) => a.unlocked).slice(-10);

  const roleLabel = (() => {
    const r = activeUser.role;
    if (r === USER_ROLE.student.id) return 'Student';
    if (r === USER_ROLE.teacher.id) return 'Teacher';
    if (r === USER_ROLE.admin.id) return 'Admin';
    if (r === USER_ROLE.superAdmin.id) return 'Super admin';
    return 'Member';
  })();

  const heroBadges = (() => {
    const level = getProficiencyLevelById(activeUser.proficiencyLevelId);
    const first = { label: level?.label ?? '—' };
    if (activeUser.role === USER_ROLE.student.id && activeUser.statusId) {
      const st = getUserAccountStatusById(activeUser.statusId);
      if (st?.name === 'active') return [first, { label: 'Active learner', variant: 'green' as const }];
      if (st?.name === 'paused') return [first, { label: 'Paused', variant: 'neutral' as const }];
      if (st?.name === 'leaved') return [first, { label: 'Left program', variant: 'neutral' as const }];
      if (st?.name === 'blocked') return [first, { label: 'Blocked', variant: 'neutral' as const }];
    }
    return [first, { label: roleLabel, variant: 'neutral' as const }];
  })();

  const heroAction = useMemo(
    () => buildProfileHeroAction({ lessons: profileLessons, reviewCount: profileSummary?.reviewCount, isStudent }),
    [isStudent, profileLessons, profileSummary?.reviewCount],
  );

  const heroMetaExtra = useMemo(() => {
    const email = form.email.trim() || profileSlice.data?.email?.trim() || auth?.user?.email?.trim() || undefined;
    return formatContactMetaLine(email, form.timezoneId);
  }, [auth?.user?.email, form.email, form.timezoneId, profileSlice.data?.email]);

  return (
    <>
      <AvatarCropModal
        open={avatarModalOpen}
        avatarUrl={avatarUrl}
        userName={form.name}
        onClose={() => setAvatarModalOpen(false)}
        onCropApply={handleCropApply}
        onRemove={() => setAvatarUrl('')}
      />
      <ProfileViewShell<ProfileTab>
        title={siteContent.profile.title}
        subtitle={`${siteContent.profile.subtitle} · ${roleLabel}`}
        avatar={
          <Button type="button" variant="ghost" className={styles.heroAvatarButton} onClick={() => setAvatarModalOpen(true)} aria-label="Change avatar">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={104} height={104} className={styles.heroAvatarImage} unoptimized />
            ) : (
              <span>{getAvatarFallbackInitials(form.name)}</span>
            )}
            <span className={styles.heroAvatarPencil} aria-hidden><Pencil size={12} /></span>
          </Button>
        }
        name={form.name}
        meta={`${getProficiencyLevelById(activeUser.proficiencyLevelId)?.code ?? '—'} · ${roleLabel}`}
        metaExtra={heroMetaExtra}
        badges={heroBadges}
        heroAction={heroAction}
        stats={[
          { value: liveStatsLoading ? '…' : String(profileStats.wordsLearned), label: 'Words', icon: <BookOpen size={16} aria-hidden />, iconTone: 'green' as const },
          { value: liveStatsLoading ? '…' : String(profileStats.lessonsCompleted), label: 'Lessons', icon: <CalendarDays size={16} aria-hidden />, iconTone: 'blue' as const },
          { value: liveStatsLoading ? '…' : (profileStats.streakDays > 0 ? String(profileStats.streakDays) : '—'), label: 'Streak', icon: <Flame size={16} aria-hidden />, iconTone: 'amber' as const },
        ]}
        achievements={recentUnlockedAchievements}
        tab={tab}
        onTabChange={setTab}
        tabs={useMemo(
          (): TabsItem<ProfileTab>[] => [
            { value: 'profile', label: 'Profile', panel: <ProfileDetailsPanel form={form} setForm={setForm} saved={saved} saving={profileMutating} saveError={profileError} loading={profileLoading} viewerRole={activeUser.role} onSave={handleSaveProfile} /> },
            { value: 'statistics', label: 'Statistics', panel: <ProfileStatisticsPanel /> },
            { value: 'notifications', label: 'Notifications', panel: <NotificationsPanel notifications={notifications} setNotifications={setNotifications} saving={profileMutating} saveError={profileError} saved={notifSaved} /> },
            { value: 'connections', label: 'Connections', panel: <LinkedAccountsPanel links={connectionLinks} canLink={isAuthenticated} accountEmail={profileSlice.data?.email ?? auth?.user?.email} onConnectionChange={() => { void fetchProfile(true); void useAuthStore.getState().refresh(); }} /> },
            { value: 'appearance', label: 'Appearance', panel: <AppearancePanel theme={theme} setTheme={setThemeFromProfile} fontSize={fontSize} setFontSize={setFontSizeFromProfile} /> },
            { value: 'achievements', label: 'Achievements', panel: <AchievementsPanel achievements={allAchievements} /> },
            { value: 'account', label: 'Account', panel: <AccountPanel /> },
          ],
          [activeUser.id, auth?.user?.email, connectionLinks, activeUser.role, allAchievements, fontSize, form, handleSaveProfile, notifications, notifSaved, profileError, profileLoading, profileMutating, saved, setFontSizeFromProfile, setNotifications, setThemeFromProfile, theme],
        )}
      />
    </>
  );
}
