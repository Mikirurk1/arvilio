/** OAuth / messenger links for notifications, calendar sync, etc. */

export const LINKED_ACCOUNT_PROVIDERS = ['google', 'facebook', 'telegram', 'zoom'] as const;

export type LinkedAccountProvider = (typeof LINKED_ACCOUNT_PROVIDERS)[number];

export type LinkedAccountLink = {
  provider: LinkedAccountProvider;
  linked: boolean;
  /** Email, handle, or display hint when connected. */
  connectedAs?: string;
  /** Google: Calendar + Meet tokens available for lesson scheduling. */
  calendarConnected?: boolean;
};

export function buildLinkedAccounts(
  partial?: Partial<
    Record<LinkedAccountProvider, { linked: boolean; connectedAs?: string }>
  >,
): LinkedAccountLink[] {
  return LINKED_ACCOUNT_PROVIDERS.map((provider) => ({
    provider,
    linked: partial?.[provider]?.linked ?? false,
    connectedAs: partial?.[provider]?.connectedAs,
  }));
}
