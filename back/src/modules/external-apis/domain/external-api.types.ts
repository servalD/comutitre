export enum VerificationStatus {
  VERIFIED = 'verified',
  NOT_VERIFIED = 'not_verified',
  NEEDS_DOCUMENT = 'needs_document',
  MANUAL_REVIEW = 'manual_review',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
  UNAVAILABLE = 'unavailable',
}

export enum EligibilityCheckType {
  SCHOOL_STUDENT = 'school_student',
  STUDENT = 'student',
  STUDENT_SCHOLARSHIP = 'student_scholarship',
  FAMILY_QUOTIENT = 'family_quotient',
  SOCIAL_RIGHTS = 'social_rights',
  TAX = 'tax',
}

export enum InternalMobilityCheckType {
  SUPPORT = 'support',
  CONTRACT = 'contract',
  PAYMENT = 'payment',
  DEBT = 'debt',
}

export interface VerificationResult {
  status: VerificationStatus;
  source: string;
  checkedAt: string;
  expiresAt?: string;
  reasonCode?: string;
  userMessage: string;
  backOfficeAction?: string;
}

export interface AddressCandidate {
  label: string;
  score: number;
  postalCode: string;
  city: string;
  cityCode: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  isInIleDeFrance: boolean;
  source: string;
}

export interface GeoCommune {
  code: string;
  name: string;
  postalCodes: string[];
  departmentCode: string;
  regionCode: string;
  isInIleDeFrance: boolean;
  source: string;
}

export interface CompanyEstablishment {
  siret: string;
  siren: string;
  name: string;
  isActive: boolean;
  address?: string;
  source: string;
}

export interface EducationInstitution {
  uai: string;
  name: string;
  city: string;
  departmentCode: string;
  type: string;
  source: string;
}

export interface EligibilityCheckInput {
  type: EligibilityCheckType;
  scenario?: string;
}

export interface InternalMobilityCheckInput {
  type: InternalMobilityCheckType;
  scenario?: string;
}
