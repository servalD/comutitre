import { Global, Module } from '@nestjs/common';
import { MistralClient } from '../../modules/rag/infrastructure/mistral.client';

@Global()
@Module({
  providers: [MistralClient],
  exports: [MistralClient],
})
export class MistralModule {}
