import { Module } from '@nestjs/common';
import { MistralModule } from '../../infrastructure/mistral/mistral.module';
import { RagService } from './application/rag.service';
import { VectorStore } from './infrastructure/vector-store';
import { RagController } from './presentation/rag.controller';

@Module({
  imports: [MistralModule],
  controllers: [RagController],
  providers: [RagService, VectorStore],
})
export class RagModule {}
