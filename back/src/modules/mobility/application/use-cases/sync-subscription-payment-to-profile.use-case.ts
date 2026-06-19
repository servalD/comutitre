import { Injectable, Logger } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractStatus } from '../../domain/enums/contract-status.enum';
import { ProductType } from '../../domain/enums/product-type.enum';
import { RenewalMode } from '../../domain/enums/renewal-mode.enum';
import { MobilityIdentityRepository } from '../../domain/mobility-identity.repository';
import { RelationshipRepository } from '../../domain/relationship.repository';
import { TimelineRecorderService } from '../services/timeline-recorder.service';

const SUBSCRIPTION_PRODUCT_MAP: Record<string, ProductType> = {
  imagine_r_junior: ProductType.IMAGINE_R_JUNIOR,
  imagine_r_scolaire: ProductType.IMAGINE_R_SCOLAIRE,
  imagine_r_etudiant: ProductType.IMAGINE_R_ETUDIANT,
  navigo_annuel: ProductType.NAVIGO_ANNUEL,
  navigo_annuel_senior: ProductType.NAVIGO_SENIOR,
  navigo_liberte_plus: ProductType.LIBERTE_PLUS,
  tst: ProductType.TST,
  amethyste: ProductType.AMETHYSTE,
};

const DEFAULT_TARIFFS: Partial<Record<ProductType, number>> = {
  [ProductType.IMAGINE_R_JUNIOR]: 384,
  [ProductType.IMAGINE_R_SCOLAIRE]: 384,
  [ProductType.IMAGINE_R_ETUDIANT]: 420,
  [ProductType.NAVIGO_ANNUEL]: 894.4,
};

const PENDING_MOBILITY_STATUSES = new Set<ContractStatus>([
  ContractStatus.DRAFT,
  ContractStatus.PENDING_DOCUMENT,
  ContractStatus.PENDING_PAYMENT,
  ContractStatus.PENDING_PAYER_SIGNATURE,
]);

export interface SyncSubscriptionPaymentParams {
  userId: string;
  holderFirstName: string;
  holderLastName: string;
  productCode: string;
  subscriptionContractId: string;
}

@Injectable()
export class SyncSubscriptionPaymentToProfileUseCase {
  private readonly logger = new Logger(
    SyncSubscriptionPaymentToProfileUseCase.name,
  );

  constructor(
    private readonly relationshipRepository: RelationshipRepository,
    private readonly mobilityIdentityRepository: MobilityIdentityRepository,
    private readonly mobilityContractRepository: ContractRepository,
    private readonly timelineRecorder: TimelineRecorderService,
  ) {}

  async execute(
    params: SyncSubscriptionPaymentParams,
  ): Promise<{ mobilityIdentityId: string | null }> {
    const identity = await this.findHolderIdentity(
      params.userId,
      params.holderFirstName,
      params.holderLastName,
    );
    if (!identity) {
      this.logger.warn(
        `No mobility identity found for holder ${params.holderFirstName} ${params.holderLastName}`,
      );
      return { mobilityIdentityId: null };
    }

    const productType =
      SUBSCRIPTION_PRODUCT_MAP[params.productCode] ??
      ProductType.IMAGINE_R_SCOLAIRE;

    const existing = await this.mobilityContractRepository.findByMobilityIdentityId(
      identity.id,
    );
    const pending = existing.find((c) => PENDING_MOBILITY_STATUSES.has(c.status));

    if (!pending) {
      const validFrom = new Date();
      const validTo = new Date(validFrom);
      validTo.setFullYear(validTo.getFullYear() + 1);

      const contract = await this.mobilityContractRepository.create({
        mobilityIdentityId: identity.id,
        payerAccountId: params.userId,
        productType,
        status: ContractStatus.PENDING_DOCUMENT,
        validFrom,
        validTo,
        renewalMode: RenewalMode.MANUAL,
        currentTariff: DEFAULT_TARIFFS[productType] ?? 384,
        cgvVersionAccepted: '2025-v1',
      });

      await this.timelineRecorder.recordContractCreated(
        identity.id,
        contract.id,
        params.userId,
        {
          productType: contract.productType,
          status: contract.status,
          subscriptionContractId: params.subscriptionContractId,
          source: 'subscription_payment',
        },
      );
    }

    return { mobilityIdentityId: identity.id };
  }

  private async findHolderIdentity(
    userId: string,
    holderFirstName: string,
    holderLastName: string,
  ) {
    const relationships =
      await this.relationshipRepository.findByAccountId(userId);
    const identityIds = [
      ...new Set(relationships.map((rel) => rel.mobilityIdentityId)),
    ];
    if (identityIds.length === 0) return null;

    const identities =
      await this.mobilityIdentityRepository.findByIds(identityIds);
    const firstNorm = holderFirstName.trim().toLowerCase();
    const lastNorm = holderLastName.trim().toLowerCase();

    return (
      identities.find(
        (identity) =>
          identity.firstName.trim().toLowerCase() === firstNorm &&
          identity.lastName.trim().toLowerCase() === lastNorm,
      ) ?? null
    );
  }
}
