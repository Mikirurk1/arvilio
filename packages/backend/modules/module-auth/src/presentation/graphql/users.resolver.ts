import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard } from '@be/auth';
import { StudentsAdminService } from '../../application/students-admin.service';
import { UsersService } from '../../application/users.service';
import { TeacherMessagesService } from '@be/notifications';
import {
  AssignableTeacherType,
  MyProfileType,
  OkResultType,
  SendTeacherMessageInput,
  StudentLanguagesUpdateType,
  StudentSummaryType,
  StudentsPageType,
  TeacherMessageType,
  UpdateAdminStudentInput,
  UpdateMyProfileInput,
  ChangePasswordInput,
} from '@be/graphql';

@Resolver()
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(
    private readonly users: UsersService,
    private readonly studentsAdmin: StudentsAdminService,
    private readonly teacherMessages: TeacherMessagesService,
  ) {}

  @Query(() => [StudentSummaryType], { name: 'students' })
  students(@CurrentGqlUser() userId: string) {
    return this.users.listStudents(userId);
  }

  @Query(() => StudentsPageType, { name: 'studentsPage' })
  studentsPage(
    @CurrentGqlUser() userId: string,
    @Args('cursor', { nullable: true }) cursor?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.users.listStudentsPage(userId, limit ?? 25, cursor);
  }

  @Query(() => [AssignableTeacherType], { name: 'assignableTeachers' })
  assignableTeachers(@CurrentGqlUser() userId: string) {
    return this.users.listAssignableTeachers(userId);
  }

  @Query(() => MyProfileType, { name: 'myProfile' })
  myProfile(@CurrentGqlUser() userId: string) {
    return this.users.getMyProfile(userId);
  }

  @Mutation(() => MyProfileType, { name: 'updateMyProfile' })
  updateMyProfile(
    @CurrentGqlUser() userId: string,
    @Args('input') input: UpdateMyProfileInput,
  ) {
    return this.users.updateMyProfile(userId, {
      displayName: input.displayName,
      timezone: input.timezone,
      avatarUrl: input.avatarUrl,
      proficiencyLevel: input.proficiencyLevel as
        | 'A1'
        | 'A2'
        | 'B1'
        | 'B2'
        | 'C1'
        | 'C2'
        | null
        | undefined,
      phone: input.phone,
      telegram: input.telegram,
      bio: input.bio,
      nativeLanguageId: input.nativeLanguageId,
      notificationPrefs: input.notificationPrefs
        ? {
            lessonReminder: input.notificationPrefs.lessonReminder,
            streakAlert: input.notificationPrefs.streakAlert,
            weeklyReport: input.notificationPrefs.weeklyReport,
            newVocab: input.notificationPrefs.newVocab,
            teacherMessages: input.notificationPrefs.teacherMessages,
          }
        : undefined,
    });
  }

  @Mutation(() => StudentLanguagesUpdateType, { name: 'updateStudentLanguages' })
  updateStudentLanguages(
    @CurrentGqlUser() userId: string,
    @Args('studentId', { type: () => ID }) studentId: string,
    @Args('input') input: UpdateAdminStudentInput,
  ) {
    return this.studentsAdmin.updateStudentLanguages(userId, studentId, {
      nativeLanguageId: input.nativeLanguageId,
      learningLanguageIds: input.learningLanguageIds,
      teacherId: input.teacherId,
      scheduleType: input.scheduleType,
      displayColor: input.displayColor,
    });
  }

  @Mutation(() => TeacherMessageType, { name: 'sendTeacherMessage' })
  sendTeacherMessage(
    @CurrentGqlUser() userId: string,
    @Args('input') input: SendTeacherMessageInput,
  ) {
    return this.teacherMessages.send(userId, {
      studentId: input.studentId,
      body: input.body,
    });
  }

  @Mutation(() => OkResultType, { name: 'changeMyPassword' })
  changeMyPassword(
    @CurrentGqlUser() userId: string,
    @Args('input') input: ChangePasswordInput,
  ) {
    return this.users.changeMyPassword(userId, input);
  }
}
