import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentGqlUser, GqlAuthGuard, Roles, RolesGuard } from '@be/auth';
import { AuthService } from '../../application/auth.service';
import {
  AdminUserSummaryType,
  CreateAdminUserInput,
  CreateAdminUserPayloadType,
  OkResultType,
} from '@be/graphql';
import { AdminUsersGraphqlService } from '../../application/admin-users-graphql.service';

@Resolver()
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly adminUsersGraphql: AdminUsersGraphqlService,
  ) {}

  @Query(() => [AdminUserSummaryType], { name: 'adminUsers' })
  adminUsers(@CurrentGqlUser() userId: string) {
    return this.adminUsersGraphql.listAdminUserSummaries(userId);
  }

  @Mutation(() => CreateAdminUserPayloadType, { name: 'createAdminUser' })
  async createAdminUser(
    @CurrentGqlUser() userId: string,
    @Args('input') input: CreateAdminUserInput,
  ) {
    const actor = await this.adminUsersGraphql.assertAdmin(userId);
    const { user, welcomeEmailSent } = await this.authService.createUserAsAdmin(actor, {
      email: input.email,
      role: (input.role ?? 'student') as 'student' | 'teacher' | 'admin',
      displayName: input.displayName,
      phone: input.phone,
      telegram: input.telegram,
      bio: input.bio,
      nativeLanguageId: input.nativeLanguageId,
      learningLanguageIds: input.learningLanguageIds,
      timezone: input.timezone,
      proficiencyLevel: input.proficiencyLevel as
        | 'A1'
        | 'A2'
        | 'B1'
        | 'B2'
        | 'C1'
        | 'C2'
        | null
        | undefined,
      status: input.status as 'active' | 'paused' | 'leaved' | 'blocked' | null | undefined,
      teacherId: input.teacherId,
    });
    return {
      welcomeEmailSent,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role.toLowerCase(),
        status: user.status.toLowerCase(),
        proficiencyLevel: user.proficiencyLevel ?? null,
        timezone: user.timezone,
        teacherId: user.teacherId,
        hasPassword: Boolean(user.passwordHash),
        linkedProviders: (user.oauthAccounts ?? []).map((a) => a.provider.toLowerCase()),
      },
    };
  }

  @Mutation(() => OkResultType, { name: 'deleteAdminUser' })
  async deleteAdminUser(
    @CurrentGqlUser() userId: string,
    @Args('id', { type: () => ID }) targetId: string,
  ) {
    const actor = await this.adminUsersGraphql.assertAdmin(userId);
    await this.authService.deleteUserAsAdmin(actor, targetId);
    return { ok: true };
  }
}
