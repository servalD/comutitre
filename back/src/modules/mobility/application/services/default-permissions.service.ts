import { Injectable } from '@nestjs/common';
import { PermissionSet } from '../../domain/permission-set';
import { RelationshipType } from '../../domain/enums/relationship-type.enum';

@Injectable()
export class DefaultPermissionsService {
  forType(type: RelationshipType): PermissionSet {
    switch (type) {
      case RelationshipType.OWNER:
        return {
          canView: true,
          canEditIdentity: true,
          canSubscribe: true,
          canPay: true,
          canManageDocuments: true,
          canManageSupport: true,
          canTransferOwnership: true,
          canViewHistory: true,
        };
      case RelationshipType.LEGAL_GUARDIAN:
        return {
          canView: true,
          canEditIdentity: true,
          canSubscribe: true,
          canPay: false,
          canManageDocuments: true,
          canManageSupport: true,
          canTransferOwnership: false,
          canViewHistory: true,
        };
      case RelationshipType.PAYER:
        return {
          canView: true,
          canEditIdentity: false,
          canSubscribe: true,
          canPay: true,
          canManageDocuments: false,
          canManageSupport: false,
          canTransferOwnership: false,
          canViewHistory: true,
        };
      case RelationshipType.MANAGER:
        return {
          canView: true,
          canEditIdentity: true,
          canSubscribe: true,
          canPay: false,
          canManageDocuments: true,
          canManageSupport: true,
          canTransferOwnership: false,
          canViewHistory: true,
        };
      case RelationshipType.READ_ONLY:
        return {
          canView: true,
          canEditIdentity: false,
          canSubscribe: false,
          canPay: false,
          canManageDocuments: false,
          canManageSupport: false,
          canTransferOwnership: false,
          canViewHistory: true,
        };
      case RelationshipType.FORMER_GUARDIAN:
        return {
          canView: true,
          canEditIdentity: false,
          canSubscribe: false,
          canPay: false,
          canManageDocuments: false,
          canManageSupport: false,
          canTransferOwnership: false,
          canViewHistory: true,
        };
    }
  }
}
