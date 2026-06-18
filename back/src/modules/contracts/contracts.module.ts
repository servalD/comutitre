import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YousignModule } from '../../infrastructure/yousign/yousign.module';
import { CgvuAcceptanceRepository } from './domain/cgvu-acceptance.repository';
import { ContractRepository } from './domain/contract.repository';
import { CgvuAcceptanceOrmEntity } from './infrastructure/cgvu-acceptance.orm-entity';
import { ContractOrmEntity } from './infrastructure/contract.orm-entity';
import { TypeOrmCgvuAcceptanceRepository } from './infrastructure/typeorm-cgvu-acceptance.repository';
import { TypeOrmContractRepository } from './infrastructure/typeorm-contract.repository';
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case';
import { GetContractUseCase } from './application/use-cases/get-contract.use-case';
import { GetSignatureStatusUseCase } from './application/use-cases/get-signature-status.use-case';
import { SignContractUseCase } from './application/use-cases/sign-contract.use-case';
import { ContractsController } from './presentation/contracts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractOrmEntity, CgvuAcceptanceOrmEntity]),
    YousignModule,
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
    SignContractUseCase,
    GetSignatureStatusUseCase,
  ],
  exports: [ContractRepository, CgvuAcceptanceRepository],
})
export class ContractsModule {}
