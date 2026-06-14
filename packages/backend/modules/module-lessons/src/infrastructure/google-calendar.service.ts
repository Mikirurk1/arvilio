import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import { PrismaService } from '@be/prisma';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as crypto from 'node:crypto';

export type CreateMeetEventInput = {
  teacherId: string;
  summary: string;
  description?: string;
  /** RFC3339 dateTime, e.g. "2026-05-12T10:00:00". */
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  studentEmail?: string | null;
  studentEmails?: string[];
};

export type CreateMeetEventResult = {
  eventId: string;
  conferenceId: string | null;
  meetUrl: string | null;
};

/** Shown when scheduling a lesson without a teacher Google Calendar connection. */
export const GOOGLE_CALENDAR_REQUIRED_MESSAGE =
  'Cannot save this lesson: connect Google with Calendar access in Profile → Connections (same email as your account), or sign in with Google on the login page.';

function googleServerCredentials(): { clientId: string; clientSecret: string } | null {
  const google = getPlatformIntegrationRuntime().google;
  if (!google.clientId || !google.clientSecret) return null;
  return { clientId: google.clientId, clientSecret: google.clientSecret };
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private readonly prisma: PrismaService) {}

  async assertTeacherCalendarReady(teacherId: string): Promise<void> {
    const credentials = googleServerCredentials();
    if (!credentials) {
      throw new BadRequestException(
        'Google Calendar is not configured on the server. Configure Google OAuth in System → Connections.',
      );
    }
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId: teacherId },
    });
    if (!connection?.refreshToken) {
      throw new BadRequestException(GOOGLE_CALENDAR_REQUIRED_MESSAGE);
    }
  }

  async createMeetEvent(input: CreateMeetEventInput): Promise<CreateMeetEventResult | null> {
    const credentials = googleServerCredentials();
    if (!credentials) {
      this.logger.warn('Google credentials not configured; skipping Meet creation');
      return null;
    }
    const { clientId, clientSecret } = credentials;
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId: input.teacherId },
    });
    if (!connection?.refreshToken) {
      this.logger.warn(
        `Teacher ${input.teacherId} has no Google Calendar connection; skipping Meet creation`,
      );
      return null;
    }
    const auth = new OAuth2Client({ clientId, clientSecret });
    auth.setCredentials({
      access_token: connection.accessToken ?? undefined,
      refresh_token: connection.refreshToken,
      expiry_date: connection.expiresAt?.getTime() ?? undefined,
    });
    auth.on('tokens', async (tokens) => {
      await this.prisma.googleCalendarConnection
        .update({
          where: { userId: input.teacherId },
          data: {
            accessToken: tokens.access_token ?? connection.accessToken,
            refreshToken: tokens.refresh_token ?? connection.refreshToken,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : connection.expiresAt,
          },
        })
        .catch((err) => this.logger.error('Failed to persist refreshed Google tokens', err));
    });

    const calendar = google.calendar({ version: 'v3', auth });
    try {
      const response = await calendar.events.insert({
        calendarId: connection.calendarId ?? 'primary',
        conferenceDataVersion: 1,
        requestBody: {
          summary: input.summary,
          description: input.description,
          start: { dateTime: input.startDateTime, timeZone: input.timezone },
          end: { dateTime: input.endDateTime, timeZone: input.timezone },
          attendees: this.resolveAttendees(input),
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
      });
      const calendarId = connection.calendarId ?? 'primary';
      let data = response.data;
      let meetUrl = this.resolveMeetUrlFromEvent(data);

      if (!meetUrl && data.id) {
        const refreshed = await calendar.events.get({ calendarId, eventId: data.id });
        data = refreshed.data;
        meetUrl = this.resolveMeetUrlFromEvent(data);
      }

      return {
        eventId: data.id ?? '',
        conferenceId: data.conferenceData?.conferenceId ?? null,
        meetUrl,
      };
    } catch (err) {
      this.logger.error('Failed to create Google Calendar event', err as Error);
      return null;
    }
  }

  async getEventMeetUrl(teacherId: string, eventId: string): Promise<string | null> {
    const credentials = googleServerCredentials();
    if (!credentials) return null;
    const { clientId, clientSecret } = credentials;
    if (!clientId || !clientSecret) return null;
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId: teacherId },
    });
    if (!connection?.refreshToken) return null;

    const auth = new OAuth2Client({ clientId, clientSecret });
    auth.setCredentials({
      access_token: connection.accessToken ?? undefined,
      refresh_token: connection.refreshToken,
      expiry_date: connection.expiresAt?.getTime() ?? undefined,
    });
    const calendar = google.calendar({ version: 'v3', auth });
    try {
      const response = await calendar.events.get({
        calendarId: connection.calendarId ?? 'primary',
        eventId,
      });
      return this.resolveMeetUrlFromEvent(response.data);
    } catch (err) {
      this.logger.error('Failed to load Google Calendar event', err as Error);
      return null;
    }
  }

  private resolveAttendees(input: CreateMeetEventInput): Array<{ email: string }> | undefined {
    const emails = [
      ...(input.studentEmails ?? []),
      ...(input.studentEmail ? [input.studentEmail] : []),
    ]
      .map((email) => email?.trim())
      .filter((email): email is string => Boolean(email));
    const unique = [...new Set(emails)];
    return unique.length > 0 ? unique.map((email) => ({ email })) : undefined;
  }

  private resolveMeetUrlFromEvent(
    data: { conferenceData?: { entryPoints?: Array<{ entryPointType?: string | null; uri?: string | null }> | null } | null; hangoutLink?: string | null },
  ): string | null {
    const meetEntry = data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === 'video',
    );
    const uri = meetEntry?.uri?.trim();
    if (uri) return uri;
    const hangout = data.hangoutLink?.trim();
    return hangout || null;
  }

  async updateEvent(
    input: CreateMeetEventInput & { eventId: string },
  ): Promise<void> {
    const credentials = googleServerCredentials();
    if (!credentials) return;
    const { clientId, clientSecret } = credentials;
    if (!clientId || !clientSecret) return;
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId: input.teacherId },
    });
    if (!connection?.refreshToken) {
      this.logger.warn(
        `Teacher ${input.teacherId} has no Google Calendar connection; skipping event update`,
      );
      return;
    }

    const auth = new OAuth2Client({ clientId, clientSecret });
    auth.setCredentials({
      access_token: connection.accessToken ?? undefined,
      refresh_token: connection.refreshToken,
      expiry_date: connection.expiresAt?.getTime() ?? undefined,
    });
    auth.on('tokens', async (tokens) => {
      await this.prisma.googleCalendarConnection
        .update({
          where: { userId: input.teacherId },
          data: {
            accessToken: tokens.access_token ?? connection.accessToken,
            refreshToken: tokens.refresh_token ?? connection.refreshToken,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : connection.expiresAt,
          },
        })
        .catch((err) => this.logger.error('Failed to persist refreshed Google tokens', err));
    });

    const calendar = google.calendar({ version: 'v3', auth });
    try {
      await calendar.events.patch({
        calendarId: connection.calendarId ?? 'primary',
        eventId: input.eventId,
        requestBody: {
          summary: input.summary,
          description: input.description,
          start: { dateTime: input.startDateTime, timeZone: input.timezone },
          end: { dateTime: input.endDateTime, timeZone: input.timezone },
          attendees: this.resolveAttendees(input),
        },
      });
    } catch (err) {
      this.logger.error('Failed to update Google Calendar event', err as Error);
      throw new BadRequestException(
        'Lesson was saved, but Google Calendar could not be updated. Reconnect Google in Profile → Connections and try again.',
      );
    }
  }

  async deleteEvent(teacherId: string, eventId: string): Promise<void> {
    const credentials = googleServerCredentials();
    if (!credentials) return;
    const { clientId, clientSecret } = credentials;
    if (!clientId || !clientSecret) return;
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId: teacherId },
    });
    if (!connection?.refreshToken) return;
    const auth = new OAuth2Client({ clientId, clientSecret });
    auth.setCredentials({
      access_token: connection.accessToken ?? undefined,
      refresh_token: connection.refreshToken,
    });
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events
      .delete({ calendarId: connection.calendarId ?? 'primary', eventId })
      .catch((err) => this.logger.error('Failed to delete Google event', err as Error));
  }
}
