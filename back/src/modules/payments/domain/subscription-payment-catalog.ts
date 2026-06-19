import { Contract } from '../../contracts/domain/contract';

export interface PaymentCatalogEntry {
  amountCents: number;
  currency: string;
  label: string;
}

const DEFAULT_ENTRY: PaymentCatalogEntry = {
  amountCents: 38400,
  currency: 'eur',
  label: 'Forfait imagine R',
};

const CATALOG: Record<string, PaymentCatalogEntry> = {
  imagine_r_junior: {
    amountCents: 38400,
    currency: 'eur',
    label: 'Forfait imagine R Junior',
  },
  imagine_r_scolaire: {
    amountCents: 38400,
    currency: 'eur',
    label: 'Forfait imagine R Scolaire',
  },
  imagine_r_etudiant: {
    amountCents: 42000,
    currency: 'eur',
    label: 'Forfait imagine R Etudiant',
  },
  navigo_annuel: {
    amountCents: 89440,
    currency: 'eur',
    label: 'Forfait Navigo Annuel',
  },
  navigo_annuel_senior: {
    amountCents: 42000,
    currency: 'eur',
    label: 'Forfait Navigo Senior',
  },
  navigo_liberte_plus: {
    amountCents: 0,
    currency: 'eur',
    label: 'Navigo Liberte+',
  },
  tst: {
    amountCents: 0,
    currency: 'eur',
    label: 'Tarification Solidarite Transport',
  },
  amethyste: {
    amountCents: 0,
    currency: 'eur',
    label: 'Forfait Amethyste',
  },
};

export function paymentCatalogEntryForContract(
  contract: Contract,
): PaymentCatalogEntry {
  return CATALOG[contract.productCode] ?? DEFAULT_ENTRY;
}
