import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../infrastructure/config/env.validation';
import { CompanyRegistryPort } from '../application/ports/company-registry.port';
import { CompanyEstablishment } from '../domain/external-api.types';
import { externalFetchSignal } from './external-fetch';

type SireneResponse = {
  etablissement?: {
    siret?: string;
    siren?: string;
    etatAdministratifEtablissement?: string;
    uniteLegale?: {
      denominationUniteLegale?: string;
      nomUniteLegale?: string;
      prenom1UniteLegale?: string;
      statutDiffusionUniteLegale?: string;
    };
    adresseEtablissement?: {
      numeroVoieEtablissement?: string;
      typeVoieEtablissement?: string;
      libelleVoieEtablissement?: string;
      codePostalEtablissement?: string;
      libelleCommuneEtablissement?: string;
    };
  };
};

@Injectable()
export class SireneCompanyRegistryClient extends CompanyRegistryPort {
  constructor(private readonly config: ConfigService<Env, true>) {
    super();
  }

  async findBySiret(siret: string): Promise<CompanyEstablishment | null> {
    const baseUrl = this.config.get('SIRENE_API_BASE_URL', { infer: true });
    const token = this.config.get('SIRENE_API_BEARER_TOKEN', { infer: true });

    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/siret/${siret}`,
      {
        headers: { 'X-INSEE-Api-Key-Integration': token },
        signal: externalFetchSignal(this.config),
      },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Sirene API failed with ${response.status}`,
      );
    }

    const payload = (await response.json()) as SireneResponse;
    const establishment = payload.etablissement;
    if (!establishment?.siret || !establishment.siren) {
      return null;
    }

    const legalUnit = establishment.uniteLegale;
    const address = establishment.adresseEtablissement;
    const isPartialDiffusion = legalUnit?.statutDiffusionUniteLegale === 'P';
    const name =
      legalUnit?.denominationUniteLegale ||
      (isPartialDiffusion
        ? 'Etablissement individuel en diffusion partielle'
        : 'Etablissement individuel');

    return {
      siret: establishment.siret,
      siren: establishment.siren,
      name,
      isActive: establishment.etatAdministratifEtablissement === 'A',
      address: isPartialDiffusion
        ? undefined
        : [
            address?.numeroVoieEtablissement,
            address?.typeVoieEtablissement,
            address?.libelleVoieEtablissement,
            address?.codePostalEtablissement,
            address?.libelleCommuneEtablissement,
          ]
            .filter(Boolean)
            .join(' '),
      source: 'sirene.live',
    };
  }
}
