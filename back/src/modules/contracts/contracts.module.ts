import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YousignModule } from '../../infrastructure/yousign/yousign.module';
import { JustificatifsModule } from '../justificatifs/justificatifs.module';
import { MobilityModule } from '../mobility/mobility.module';
import { CgvuAcceptanceRepository } from './domain/cgvu-acceptance.repository';
import { ContractRepository } from './domain/contract.repository';
import { CgvuAcceptanceOrmEntity } from './infrastructure/cgvu-acceptance.orm-entity';
import { ContractOrmEntity } from './infrastructure/contract.orm-entity';
import { TypeOrmCgvuAcceptanceRepository } from './infrastructure/typeorm-cgvu-acceptance.repository';
import { TypeOrmContractRepository } from './infrastructure/typeorm-contract.repository';
import { ConfirmContractPaymentUseCase } from './application/use-cases/confirm-contract-payment.use-case';
import { ConfirmMockPaymentUseCase } from './application/use-cases/confirm-mock-payment.use-case';
import { ConfirmMockValidationUseCase } from './application/use-cases/confirm-mock-validation.use-case';
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case';
import { GetCgvuPreviewUseCase } from './application/use-cases/get-cgvu-preview.use-case';
import { GetContractDocumentsReadinessUseCase } from './application/use-cases/get-contract-documents-readiness.use-case';
import { GetContractUseCase } from './application/use-cases/get-contract.use-case';
import { GetSignatureStatusUseCase } from './application/use-cases/get-signature-status.use-case';
import { SignContractUseCase } from './application/use-cases/sign-contract.use-case';
import { ContractSignatureSyncService } from './application/services/contract-signature-sync.service';
import { ContractsController } from './presentation/contracts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractOrmEntity, CgvuAcceptanceOrmEntity]),
    YousignModule,
    MobilityModule,
    forwardRef(() => JustificatifsModule),
  ],
  controllers: [ContractsController],
  providers: [
    { provide: ContractRepository, useClass: TypeOrmContractRepository },
    {
      provide: CgvuAcceptanceRepository,
      useClass: TypeOrmCgvuAcceptanceRepository,
    },
    CreateContractUseCase,
    GetContractUseCase,
    GetContractDocumentsReadinessUseCase,
    GetCgvuPreviewUseCase,
    SignContractUseCase,
    GetSignatureStatusUseCase,
    ConfirmContractPaymentUseCase,
    ConfirmMockPaymentUseCase,
    ConfirmMockValidationUseCase,
    ContractSignatureSyncService,
  ],
  exports: [
    ContractRepository,
    CgvuAcceptanceRepository,
    ConfirmContractPaymentUseCase,
  ],
})
export class ContractsModule {}
