import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractRepository } from './domain/contract.repository';
import { DocumentRepository } from './domain/document.repository';
import { AnomalyCaseRepository } from './domain/anomaly-case.repository';
import { MobilityIdentityRepository } from './domain/mobility-identity.repository';
import { ProofEventRepository } from './domain/proof-event.repository';
import { RelationshipRepository } from './domain/relationship.repository';
import { SupportRepository } from './domain/support.repository';
import { TimelineEventRepository } from './domain/timeline-event.repository';
import { TransportRightRepository } from './domain/transport-right.repository';
import { ValidationEventRepository } from './domain/validation-event.repository';
import { DefaultPermissionsService } from './application/services/default-permissions.service';
import { IntegrityHashService } from './application/services/integrity-hash.service';
import { MobilityAccessService } from './application/services/mobility-access.service';
import { ProfileCalculatorService } from './application/services/profile-calculator.service';
import { TimelineRecorderService } from './application/services/timeline-recorder.service';
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case';
import { CreateDocumentUseCase } from './application/use-cases/create-document.use-case';
import { CreateMobilityIdentityUseCase } from './application/use-cases/create-mobility-identity.use-case';
import { CreateRelationshipUseCase } from './application/use-cases/create-relationship.use-case';
import { CreateSupportUseCase } from './application/use-cases/create-support.use-case';
import { ActivateSupportUseCase } from './application/use-cases/activate-support.use-case';
import { CloseFoundSupportCaseUseCase } from './application/use-cases/close-found-support-case.use-case';
import { DeclareFoundSupportUseCase } from './application/use-cases/declare-found-support.use-case';
import { GetMobilityIdentityUseCase } from './application/use-cases/get-mobility-identity.use-case';
import { GetTimelineUseCase } from './application/use-cases/get-timeline.use-case';
import { ListOpenAnomaliesUseCase } from './application/use-cases/list-open-anomalies.use-case';
import { ListProofEventsUseCase } from './application/use-cases/list-proof-events.use-case';
import { ListContractsUseCase } from './application/use-cases/list-contracts.use-case';
import { ListDocumentsUseCase } from './application/use-cases/list-documents.use-case';
import { ListMyIdentitiesUseCase } from './application/use-cases/list-my-identities.use-case';
import { ListSupportsUseCase } from './application/use-cases/list-supports.use-case';
import { RegisterTransportRightUseCase } from './application/use-cases/register-transport-right.use-case';
import { ListTransportRightsUseCase } from './application/use-cases/list-transport-rights.use-case';
import { RevokeRelationshipUseCase } from './application/use-cases/revoke-relationship.use-case';
import { ProvisionOwnerMobilityIdentityUseCase } from './application/use-cases/provision-owner-mobility-identity.use-case';
import { ActivateSubscriptionOnProfileUseCase } from './application/use-cases/activate-subscription-on-profile.use-case';
import { SyncSubscriptionPaymentToProfileUseCase } from './application/use-cases/sync-subscription-payment-to-profile.use-case';
import { UpdateMobilityIdentityUseCase } from './application/use-cases/update-mobility-identity.use-case';
import { ValidateJourneyEventUseCase } from './application/use-cases/validate-journey-event.use-case';
import { AnomalyCaseOrmEntity } from './infrastructure/anomaly-case.orm-entity';
import { ContractOrmEntity } from './infrastructure/contract.orm-entity';
import { DocumentOrmEntity } from './infrastructure/document.orm-entity';
import { MobilityIdentityOrmEntity } from './infrastructure/mobility-identity.orm-entity';
import { ProofEventOrmEntity } from './infrastructure/proof-event.orm-entity';
import { RelationshipOrmEntity } from './infrastructure/relationship.orm-entity';
import { SupportOrmEntity } from './infrastructure/support.orm-entity';
import { TimelineEventOrmEntity } from './infrastructure/timeline-event.orm-entity';
import { TransportRightOrmEntity } from './infrastructure/transport-right.orm-entity';
import { ValidationEventOrmEntity } from './infrastructure/validation-event.orm-entity';
import { TypeOrmAnomalyCaseRepository } from './infrastructure/typeorm-anomaly-case.repository';
import { TypeOrmContractRepository } from './infrastructure/typeorm-contract.repository';
import { TypeOrmDocumentRepository } from './infrastructure/typeorm-document.repository';
import { TypeOrmMobilityIdentityRepository } from './infrastructure/typeorm-mobility-identity.repository';
import { TypeOrmProofEventRepository } from './infrastructure/typeorm-proof-event.repository';
import { TypeOrmRelationshipRepository } from './infrastructure/typeorm-relationship.repository';
import { TypeOrmSupportRepository } from './infrastructure/typeorm-support.repository';
import { TypeOrmTimelineEventRepository } from './infrastructure/typeorm-timeline-event.repository';
import { TypeOrmTransportRightRepository } from './infrastructure/typeorm-transport-right.repository';
import { TypeOrmValidationEventRepository } from './infrastructure/typeorm-validation-event.repository';
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
      TransportRightOrmEntity,
      ProofEventOrmEntity,
      ValidationEventOrmEntity,
      AnomalyCaseOrmEntity,
    ]),
  ],
  controllers: [MobilityController],
  providers: [
    ProfileCalculatorService,
    IntegrityHashService,
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
      provide: TransportRightRepository,
      useClass: TypeOrmTransportRightRepository,
    },
    { provide: ProofEventRepository, useClass: TypeOrmProofEventRepository },
    {
      provide: ValidationEventRepository,
      useClass: TypeOrmValidationEventRepository,
    },
    {
      provide: AnomalyCaseRepository,
      useClass: TypeOrmAnomalyCaseRepository,
    },
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
    ActivateSupportUseCase,
    ListSupportsUseCase,
    RegisterTransportRightUseCase,
    ListTransportRightsUseCase,
    ListProofEventsUseCase,
    ListOpenAnomaliesUseCase,
    DeclareFoundSupportUseCase,
    CloseFoundSupportCaseUseCase,
    GetTimelineUseCase,
    ProvisionOwnerMobilityIdentityUseCase,
    ValidateJourneyEventUseCase,
    SyncSubscriptionPaymentToProfileUseCase,
    ActivateSubscriptionOnProfileUseCase,
  ],
  exports: [
    ProvisionOwnerMobilityIdentityUseCase,
    SyncSubscriptionPaymentToProfileUseCase,
    ActivateSubscriptionOnProfileUseCase,
    MobilityIdentityRepository,
    RelationshipRepository,
    DefaultPermissionsService,
    TimelineRecorderService,
  ],
})
export class MobilityModule {}
