import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../infrastructure/config/env.validation';
import { AddressLookupPort } from './application/ports/address-lookup.port';
import { CompanyRegistryPort } from './application/ports/company-registry.port';
import { EducationRegistryPort } from './application/ports/education-registry.port';
import { EligibilityDataPort } from './application/ports/eligibility-data.port';
import { GeoReferencePort } from './application/ports/geo-reference.port';
import { InternalMobilityPort } from './application/ports/internal-mobility.port';
import { CheckEligibilityUseCase } from './application/use-cases/check-eligibility.use-case';
import { CheckInternalMobilityUseCase } from './application/use-cases/check-internal-mobility.use-case';
import { FindCommunesUseCase } from './application/use-cases/find-communes.use-case';
import { FindCompanyUseCase } from './application/use-cases/find-company.use-case';
import { SearchAddressesUseCase } from './application/use-cases/search-addresses.use-case';
import { SearchEducationInstitutionsUseCase } from './application/use-cases/search-education-institutions.use-case';
import { ApiGeoReferenceClient } from './infrastructure/api-geo-reference.client';
import { GeoplateformeAddressClient } from './infrastructure/geoplateforme-address.client';
import { MockAddressLookupClient } from './infrastructure/mock-address-lookup.client';
import { MockCompanyRegistryClient } from './infrastructure/mock-company-registry.client';
import { MockEducationRegistryClient } from './infrastructure/mock-education-registry.client';
import { MockEligibilityDataClient } from './infrastructure/mock-eligibility-data.client';
import { MockGeoReferenceClient } from './infrastructure/mock-geo-reference.client';
import { MockInternalMobilityClient } from './infrastructure/mock-internal-mobility.client';
import { SireneCompanyRegistryClient } from './infrastructure/sirene-company-registry.client';
import { EducationOpenDataClient } from './infrastructure/education-open-data.client';
import { ExternalApisController } from './presentation/external-apis.controller';

@Module({
  controllers: [ExternalApisController],
  providers: [
    {
      provide: AddressLookupPort,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        config.get('EXTERNAL_API_ADDRESS_MODE', { infer: true }) === 'live'
          ? new GeoplateformeAddressClient(config)
          : new MockAddressLookupClient(),
    },
    {
      provide: GeoReferencePort,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        config.get('EXTERNAL_API_GEO_MODE', { infer: true }) === 'live'
          ? new ApiGeoReferenceClient(config)
          : new MockGeoReferenceClient(),
    },
    {
      provide: CompanyRegistryPort,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        config.get('EXTERNAL_API_COMPANY_MODE', { infer: true }) === 'live'
          ? new SireneCompanyRegistryClient(config)
          : new MockCompanyRegistryClient(),
    },
    {
      provide: EducationRegistryPort,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        config.get('EXTERNAL_API_EDUCATION_MODE', { infer: true }) === 'live'
          ? new EducationOpenDataClient(config)
          : new MockEducationRegistryClient(),
    },
    { provide: EligibilityDataPort, useClass: MockEligibilityDataClient },
    { provide: InternalMobilityPort, useClass: MockInternalMobilityClient },
    SearchAddressesUseCase,
    FindCommunesUseCase,
    FindCompanyUseCase,
    SearchEducationInstitutionsUseCase,
    CheckEligibilityUseCase,
    CheckInternalMobilityUseCase,
  ],
  exports: [
    AddressLookupPort,
    GeoReferencePort,
    CompanyRegistryPort,
    EducationRegistryPort,
    EligibilityDataPort,
    InternalMobilityPort,
  ],
})
export class ExternalApisModule {}
