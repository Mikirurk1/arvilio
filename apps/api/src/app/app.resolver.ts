import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, {
    description: 'Basic GraphQL health check for the API.',
  })
  health(): string {
    return 'ok';
  }
}
