import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MistralModule } from '../../infrastructure/mistral/mistral.module';
import { YousignModule } from '../../infrastructure/yousign/yousign.module';
import { ContractsModule } from '../contracts/contracts.module';
import { ContractDocumentGateService } from './application/services/contract-document-gate.service';
import { JustificatifAiVerificationService } from './application/services/justificatif-ai-verification.service';
import { UploadJustificatifUseCase } from './application/use-cases/upload-justificatif.use-case';
import { ListJustificatifsUseCase } from './application/use-cases/list-justificatifs.use-case';
import { ValidateJustificatifUseCase } from './application/use-cases/validate-justificatif.use-case';
import { RefuseJustificatifUseCase } from './application/use-cases/refuse-justificatif.use-case';
import { JustificatifRepository } from './domain/justificatif.repository';
import { JustificatifOrmEntity } from './infrastructure/justificatif.orm-entity';
import { TypeOrmJustificatifRepository } from './infrastructure/typeorm-justificatif.repository';
import { JustificatifsController } from './presentation/justificatifs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([JustificatifOrmEntity]),
    YousignModule,
    MistralModule,
    forwardRef(() => ContractsModule),
  ],
  controllers: [JustificatifsController],
  providers: [
    {
      provide: JustificatifRepository,
      useClass: TypeOrmJustificatifRepository,
    },
    ContractDocumentGateService,
    JustificatifAiVerificationService,
    UploadJustificatifUseCase,
    ListJustificatifsUseCase,
    ValidateJustificatifUseCase,
    RefuseJustificatifUseCase,
  ],
  exports: [JustificatifRepository, ContractDocumentGateService],
})
export class JustificatifsModule {}
