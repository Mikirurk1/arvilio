import { Controller, Get, UseGuards } from '@nestjs/common';
import { LanguagesService } from '../../application/languages.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('languages')
@UseGuards(AuthGuard)
export class LanguagesController {
  constructor(private readonly languages: LanguagesService) {}

  @Get()
  list() {
    return this.languages.listActive();
  }
}
