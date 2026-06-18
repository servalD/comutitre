import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { CheckEligibilityRequest } from '../application/dto/check-eligibility.request';
import { CheckInternalMobilityRequest } from '../application/dto/check-internal-mobility.request';
import { FindCommunesRequest } from '../application/dto/find-communes.request';
import { FindCompanyRequest } from '../application/dto/find-company.request';
import { SearchAddressesRequest } from '../application/dto/search-addresses.request';
import { SearchEducationInstitutionsRequest } from '../application/dto/search-education-institutions.request';
import { CheckEligibilityUseCase } from '../application/use-cases/check-eligibility.use-case';
import { CheckInternalMobilityUseCase } from '../application/use-cases/check-internal-mobility.use-case';
import { FindCommunesUseCase } from '../application/use-cases/find-communes.use-case';
import { FindCompanyUseCase } from '../application/use-cases/find-company.use-case';
import { SearchAddressesUseCase } from '../application/use-cases/search-addresses.use-case';
import { SearchEducationInstitutionsUseCase } from '../application/use-cases/search-education-institutions.use-case';
import {
  AddressCandidateResponse,
  CompanyEstablishmentResponse,
  EducationInstitutionResponse,
  GeoCommuneResponse,
  VerificationResultResponse,
} from './external-api.responses';

@ApiTags('external-apis')
@Controller('external-apis')
export class ExternalApisController {
  constructor(
    private readonly searchAddressesUseCase: SearchAddressesUseCase,
    private readonly findCommunesUseCase: FindCommunesUseCase,
    private readonly findCompanyUseCase: FindCompanyUseCase,
    private readonly searchEducationUseCase: SearchEducationInstitutionsUseCase,
    private readonly checkEligibilityUseCase: CheckEligibilityUseCase,
    private readonly checkInternalMobilityUseCase: CheckInternalMobilityUseCase,
  ) {}

  @Public()
  @Get('address/search')
  @ApiOperation({
    summary: 'Autocomplete et normalisation adresse via mock ou Geoplateforme',
  })
  @ApiQuery({ name: 'q', example: '10 rue de Rivoli' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiOkResponse({ type: AddressCandidateResponse, isArray: true })
  searchAddresses(
    @Query() query: SearchAddressesRequest,
  ): Promise<AddressCandidateResponse[]> {
    return this.searchAddressesUseCase.execute({
      query: query.q,
      limit: query.limit,
    });
  }

  @Public()
  @Get('geo/communes')
  @ApiOperation({
    summary: 'Recherche de communes pour rattachement territorial',
  })
  @ApiQuery({ name: 'codePostal', required: false, example: '75001' })
  @ApiQuery({ name: 'nom', required: false, example: 'Paris' })
  @ApiOkResponse({ type: GeoCommuneResponse, isArray: true })
  findCommunes(
    @Query() query: FindCommunesRequest,
  ): Promise<GeoCommuneResponse[]> {
    return this.findCommunesUseCase.execute(query);
  }

  @Get('companies/siret/:siret')
  @ApiOperation({ summary: 'Verification SIRET via mock ou Sirene' })
  @ApiParam({ name: 'siret', example: '55210055400013' })
  @ApiOkResponse({ type: CompanyEstablishmentResponse })
  findCompany(
    @Param() params: FindCompanyRequest,
  ): Promise<CompanyEstablishmentResponse | null> {
    return this.findCompanyUseCase.execute(params.siret);
  }

  @Public()
  @Get('education/institutions')
  @ApiOperation({
    summary: 'Recherche etablissement scolaire ou etudiant par nom/UAI',
  })
  @ApiQuery({ name: 'q', example: 'Universite Paris' })
  @ApiQuery({ name: 'limit', required: false, example: 5 })
  @ApiOkResponse({ type: EducationInstitutionResponse, isArray: true })
  searchEducationInstitutions(
    @Query() query: SearchEducationInstitutionsRequest,
  ): Promise<EducationInstitutionResponse[]> {
    return this.searchEducationUseCase.execute({
      query: query.q,
      limit: query.limit,
    });
  }

  @Post('eligibility/checks')
  @ApiOperation({
    summary:
      'Verification normalisee des droits sensibles simules type API Particulier',
  })
  @ApiBody({ type: CheckEligibilityRequest })
  @ApiOkResponse({ type: VerificationResultResponse })
  checkEligibility(
    @Body() body: CheckEligibilityRequest,
  ): Promise<VerificationResultResponse> {
    return this.checkEligibilityUseCase.execute(body);
  }

  @Post('internal-mobility/checks')
  @ApiOperation({
    summary:
      'Verification simulee des dependances SI internes support, contrat, paiement et impaye',
  })
  @ApiBody({ type: CheckInternalMobilityRequest })
  @ApiOkResponse({ type: VerificationResultResponse })
  checkInternalMobility(
    @Body() body: CheckInternalMobilityRequest,
  ): Promise<VerificationResultResponse> {
    return this.checkInternalMobilityUseCase.execute(body);
  }
}
