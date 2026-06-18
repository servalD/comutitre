import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractRepository } from './domain/contract.repository';
import { DocumentRepository } from './domain/document.repository';
import { MobilityIdentityRepository } from './domain/mobility-identity.repository';
import { RelationshipRepository } from './domain/relationship.repository';
import { SupportRepository } from './domain/support.repository';
import { TimelineEventRepository } from './domain/timeline-event.repository';
import { DefaultPermissionsService } from './application/services/default-permissions.service';
import { MobilityAccessService } from './application/services/mobility-access.service';
import { ProfileCalculatorService } from './application/services/profile-calculator.service';
import { TimelineRecorderService } from './application/services/timeline-recorder.service';
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case';
import { CreateDocumentUseCase } from './application/use-cases/create-document.use-case';
import { CreateMobilityIdentityUseCase } from './application/use-cases/create-mobility-identity.use-case';
import { CreateRelationshipUseCase } from './application/use-cases/create-relationship.use-case';
import { CreateSupportUseCase } from './application/use-cases/create-support.use-case';
import { CloseFoundSupportCaseUseCase } from './application/use-cases/close-found-support-case.use-case';
import { DeclareFoundSupportUseCase } from './application/use-cases/declare-found-support.use-case';
import { GetMobilityIdentityUseCase } from './application/use-cases/get-mobility-identity.use-case';
import { GetTimelineUseCase } from './application/use-cases/get-timeline.use-case';
import { ListContractsUseCase } from './application/use-cases/list-contracts.use-case';
import { ListDocumentsUseCase } from './application/use-cases/list-documents.use-case';
import { ListMyIdentitiesUseCase } from './application/use-cases/list-my-identities.use-case';
import { ListSupportsUseCase } from './application/use-cases/list-supports.use-case';
import { RevokeRelationshipUseCase } from './application/use-cases/revoke-relationship.use-case';
import { ProvisionOwnerMobilityIdentityUseCase } from './application/use-cases/provision-owner-mobility-identity.use-case';
import { UpdateMobilityIdentityUseCase } from './application/use-cases/update-mobility-identity.use-case';
import { ContractOrmEntity } from './infrastructure/contract.orm-entity';
import { DocumentOrmEntity } from './infrastructure/document.orm-entity';
import { MobilityIdentityOrmEntity } from './infrastructure/mobility-identity.orm-entity';
import { RelationshipOrmEntity } from './infrastructure/relationship.orm-entity';
import { SupportOrmEntity } from './infrastructure/support.orm-entity';
import { TimelineEventOrmEntity } from './infrastructure/timeline-event.orm-entity';
import { TypeOrmContractRepository } from './infrastructure/typeorm-contract.repository';
import { TypeOrmDocumentRepository } from './infrastructure/typeorm-document.repository';
import { TypeOrmMobilityIdentityRepository } from './infrastructure/typeorm-mobility-identity.repository';
import { TypeOrmRelationshipRepository } from './infrastructure/typeorm-relationship.repository';
import { TypeOrmSupportRepository } from './infrastructure/typeorm-support.repository';
import { TypeOrmTimelineEventRepository } from './infrastructure/typeorm-timeline-event.repository';
import { MobilityController } from './presentation/mobility.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MobilityIdentityOrmEntity,
      RelationshipOrmEntity,
      ContractOrmEntity,
      DocumentOrmEntity,
      SupportOrmEntity,
      TimelineEventOrmEntity,
    ]),
  ],
  controllers: [MobilityController],
  providers: [
    ProfileCalculatorService,
    DefaultPermissionsService,
    MobilityAccessService,
    TimelineRecorderService,
    {
      provide: MobilityIdentityRepository,
      useClass: TypeOrmMobilityIdentityRepository,
    },
    {
      provide: RelationshipRepository,
      useClass: TypeOrmRelationshipRepository,
    },
    { provide: ContractRepository, useClass: TypeOrmContractRepository },
    { provide: DocumentRepository, useClass: TypeOrmDocumentRepository },
    { provide: SupportRepository, useClass: TypeOrmSupportRepository },
    {
      provide: TimelineEventRepository,
      useClass: TypeOrmTimelineEventRepository,
    },
    CreateMobilityIdentityUseCase,
    GetMobilityIdentityUseCase,
    UpdateMobilityIdentityUseCase,
    ListMyIdentitiesUseCase,
    CreateRelationshipUseCase,
    RevokeRelationshipUseCase,
    CreateContractUseCase,
    ListContractsUseCase,
    CreateDocumentUseCase,
    ListDocumentsUseCase,
    CreateSupportUseCase,
    ListSupportsUseCase,
    DeclareFoundSupportUseCase,
    CloseFoundSupportCaseUseCase,
    GetTimelineUseCase,
    ProvisionOwnerMobilityIdentityUseCase,
  ],
  exports: [ProvisionOwnerMobilityIdentityUseCase],
})
export class MobilityModule {}
