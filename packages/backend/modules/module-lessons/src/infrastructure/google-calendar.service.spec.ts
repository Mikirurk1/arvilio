import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '@be/prisma';
import {
  GOOGLE_CALENDAR_REQUIRED_MESSAGE,
  GoogleCalendarService,
} from './google-calendar.service';

const mockEventsGet = jest.fn();
const mockEventsInsert = jest.fn();
const mockEventsPatch = jest.fn();
const mockEventsDelete = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    calendar: jest.fn(() => ({
      events: {
        get: (...args: unknown[]) => mockEventsGet(...args),
        insert: (...args: unknown[]) => mockEventsInsert(...args),
        patch: (...args: unknown[]) => mockEventsPatch(...args),
        delete: (...args: unknown[]) => mockEventsDelete(...args),
      },
    })),
  },
}));

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;
  const prisma = {
    googleCalendarConnection: { findUnique: jest.fn(), update: jest.fn() },
  };
  const originalEnv = process.env;
  const connection = {
    refreshToken: 'rt',
    accessToken: 'at',
    expiresAt: new Date('2026-05-20T12:00:00Z'),
    calendarId: 'primary',
  };

  beforeEach(async () => {
    process.env = { ...originalEnv, GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret' };
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [GoogleCalendarService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(GoogleCalendarService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('assertTeacherCalendarReady throws when no connection', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(null);
    await expect(service.assertTeacherCalendarReady('t1')).rejects.toThrow(
      GOOGLE_CALENDAR_REQUIRED_MESSAGE,
    );
  });

  it('assertTeacherCalendarReady throws when Google not configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    await expect(service.assertTeacherCalendarReady('t1')).rejects.toThrow(BadRequestException);
  });

  it('createMeetEvent returns null without credentials', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    const result = await service.createMeetEvent({
      teacherId: 't1',
      summary: 'Lesson',
      startDateTime: '2026-05-20T10:00:00',
      endDateTime: '2026-05-20T11:00:00',
      timezone: 'UTC',
    });
    expect(result).toBeNull();
  });

  it('assertTeacherCalendarReady passes with refresh token', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue({
      refreshToken: 'rt',
      accessToken: 'at',
    });
    await expect(service.assertTeacherCalendarReady('t1')).resolves.toBeUndefined();
  });

  it('createMeetEvent returns null when teacher has no connection', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(null);
    const result = await service.createMeetEvent({
      teacherId: 't1',
      summary: 'Lesson',
      startDateTime: '2026-05-20T10:00:00',
      endDateTime: '2026-05-20T11:00:00',
      timezone: 'UTC',
    });
    expect(result).toBeNull();
  });

  it('createMeetEvent returns meet url from conference entry', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(connection);
    mockEventsInsert.mockResolvedValue({
      data: {
        id: 'evt-1',
        conferenceData: {
          conferenceId: 'conf-1',
          entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/abc-defg-hij' }],
        },
      },
    });

    const result = await service.createMeetEvent({
      teacherId: 't1',
      summary: 'Lesson',
      startDateTime: '2026-05-20T10:00:00',
      endDateTime: '2026-05-20T11:00:00',
      timezone: 'UTC',
      studentEmail: 'student@test.local',
    });
    expect(result).toEqual({
      eventId: 'evt-1',
      conferenceId: 'conf-1',
      meetUrl: 'https://meet.google.com/abc-defg-hij',
    });
  });

  it('createMeetEvent returns null when Google API fails', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(connection);
    mockEventsInsert.mockRejectedValue(new Error('API down'));
    const result = await service.createMeetEvent({
      teacherId: 't1',
      summary: 'Lesson',
      startDateTime: '2026-05-20T10:00:00',
      endDateTime: '2026-05-20T11:00:00',
      timezone: 'UTC',
    });
    expect(result).toBeNull();
  });

  it('getEventMeetUrl returns hangout link', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(connection);
    mockEventsGet.mockResolvedValue({
      data: { hangoutLink: 'https://meet.google.com/xyz' },
    });
    await expect(service.getEventMeetUrl('t1', 'evt-1')).resolves.toBe('https://meet.google.com/xyz');
  });

  it('getEventMeetUrl returns null without connection', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(null);
    await expect(service.getEventMeetUrl('t1', 'evt-1')).resolves.toBeNull();
  });

  it('updateEvent patches calendar event', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(connection);
    mockEventsPatch.mockResolvedValue({});
    await service.updateEvent({
      teacherId: 't1',
      eventId: 'evt-1',
      summary: 'Updated',
      startDateTime: '2026-05-20T10:00:00',
      endDateTime: '2026-05-20T11:00:00',
      timezone: 'UTC',
    });
    expect(mockEventsPatch).toHaveBeenCalled();
  });

  it('updateEvent throws BadRequest when patch fails', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(connection);
    mockEventsPatch.mockRejectedValue(new Error('Forbidden'));
    await expect(
      service.updateEvent({
        teacherId: 't1',
        eventId: 'evt-1',
        summary: 'Updated',
        startDateTime: '2026-05-20T10:00:00',
        endDateTime: '2026-05-20T11:00:00',
        timezone: 'UTC',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deleteEvent calls Google delete', async () => {
    prisma.googleCalendarConnection.findUnique.mockResolvedValue(connection);
    mockEventsDelete.mockResolvedValue({});
    await service.deleteEvent('t1', 'evt-1');
    expect(mockEventsDelete).toHaveBeenCalledWith({
      calendarId: 'primary',
      eventId: 'evt-1',
    });
  });
});
