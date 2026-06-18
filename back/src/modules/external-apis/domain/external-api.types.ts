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
  rawPayload?: any;
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
  numeroAllocataire?: string;
  codePostal?: string;
  ine?: string;
  numeroFiscal?: string;
  referenceAvis?: string;
  nom?: string;
  prenom?: string;
  sexe?: string;
  dateNaissance?: string;
  codeEtablissement?: string;
  anneeScolaire?: string;
}

export interface InternalMobilityCheckInput {
  type: InternalMobilityCheckType;
  scenario?: string;
}
