import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import type { PrismaService } from '@be/prisma';
import { escapeTelegramHtml, sendTelegramBotMessage } from '@be/notifications/telegram';
import { webOrigin } from '../shared/oauth-link-redirect';

export type TelegramBotLinkFrom = {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
};

export async function linkTelegramAccount(
  prisma: PrismaService,
  userId: string,
  from: TelegramBotLinkFrom,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new UnauthorizedException();

  const label = from.username
    ? `@${from.username}`
    : [from.first_name, from.last_name].filter(Boolean).join(' ') || String(from.id);

  const ownedByOther = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: { provider: 'TELEGRAM', providerAccountId: String(from.id) },
    },
  });
  if (ownedByOther && ownedByOther.userId !== userId) {
    throw new BadRequestException('This Telegram account is already linked to another user.');
  }

  const existingForUser = await prisma.oAuthAccount.findFirst({
    where: { userId, provider: 'TELEGRAM' },
  });
  if (existingForUser && existingForUser.providerAccountId !== String(from.id)) {
    throw new BadRequestException('Another Telegram account is already linked to your profile.');
  }

  await prisma.oAuthAccount.upsert({
    where: {
      provider_providerAccountId: { provider: 'TELEGRAM', providerAccountId: String(from.id) },
    },
    create: {
      userId,
      provider: 'TELEGRAM',
      providerAccountId: String(from.id),
      providerEmail: label,
    },
    update: {
      userId,
      providerEmail: label,
    },
  });

  if (from.username) {
    const handle = from.username.startsWith('@') ? from.username : `@${from.username}`;
    await prisma.user.update({
      where: { id: userId },
      data: { telegram: handle },
    });
  }

  const appUrl = webOrigin();
  const welcomeHtml =
    `✅ <b>SoEnglish connected</b>\n\n` +
    `Hi ${escapeTelegramHtml(user.displayName)}, you will receive lesson reminders and other alerts here when they are enabled under Profile → Notifications.\n\n` +
    `<a href="${escapeTelegramHtml(appUrl)}">Open SoEnglish</a>`;
  await sendTelegramBotMessage(String(from.id), welcomeHtml, { parseMode: 'HTML' });
}
