import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@be/auth';
import { LanguagesService } from '../../application/languages.service';
import { LanguageType } from '@be/graphql';

@Resolver()
@UseGuards(GqlAuthGuard)
export class LanguagesResolver {
  constructor(private readonly languagesService: LanguagesService) {}

  @Query(() => [LanguageType], { name: 'languages' })
  listLanguages() {
    return this.languagesService.listActive();
  }
}
