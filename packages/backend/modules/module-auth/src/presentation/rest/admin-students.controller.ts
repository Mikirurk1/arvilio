import { Body, Controller, ForbiddenException, Param, Patch, UseGuards } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import type { UpdateAdminStudentRequestDto } from '@pkg/types';
import { StudentsAdminService } from '../../application/students-admin.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../guards/current-user';

@Controller('admin/students')
@UseGuards(AuthGuard)
export class AdminStudentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly studentsAdmin: StudentsAdminService,
  ) {}

  @Patch(':id')
  async update(
    @CurrentUser() userId: string,
    @Param('id') studentId: string,
    @Body() body: UpdateAdminStudentRequestDto,
  ) {
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (
      !actor ||
      (actor.role !== 'SUPER_ADMIN' &&
        actor.role !== 'ADMIN' &&
        actor.role !== 'TEACHER')
    ) {
      throw new ForbiddenException('Only staff can update student settings');
    }
    return this.studentsAdmin.updateStudent(
      { role: actor.role as 'ADMIN' | 'SUPER_ADMIN' | 'TEACHER', id: userId },
      studentId,
      body,
    );
  }
}
