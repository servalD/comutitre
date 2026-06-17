import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../users/domain/user';
import { CreateContractRequest } from '../application/dto/create-contract.request';
import { CreateDocumentRequest } from '../application/dto/create-document.request';
import { CreateMobilityIdentityRequest } from '../application/dto/create-mobility-identity.request';
import { CreateRelationshipRequest } from '../application/dto/create-relationship.request';
import { CreateSupportRequest } from '../application/dto/create-support.request';
import { UpdateMobilityIdentityRequest } from '../application/dto/update-mobility-identity.request';
import { CreateContractUseCase } from '../application/use-cases/create-contract.use-case';
import { CreateDocumentUseCase } from '../application/use-cases/create-document.use-case';
import { CreateMobilityIdentityUseCase } from '../application/use-cases/create-mobility-identity.use-case';
import { CreateRelationshipUseCase } from '../application/use-cases/create-relationship.use-case';
import { CreateSupportUseCase } from '../application/use-cases/create-support.use-case';
import { GetMobilityIdentityUseCase } from '../application/use-cases/get-mobility-identity.use-case';
import { GetTimelineUseCase } from '../application/use-cases/get-timeline.use-case';
import { ListContractsUseCase } from '../application/use-cases/list-contracts.use-case';
import { ListDocumentsUseCase } from '../application/use-cases/list-documents.use-case';
import { ListMyIdentitiesUseCase } from '../application/use-cases/list-my-identities.use-case';
import { ListSupportsUseCase } from '../application/use-cases/list-supports.use-case';
import { RevokeRelationshipUseCase } from '../application/use-cases/revoke-relationship.use-case';
import { UpdateMobilityIdentityUseCase } from '../application/use-cases/update-mobility-identity.use-case';
import {
  ContractResponse,
  DocumentResponse,
  MobilityIdentityResponse,
  MobilityIdentityWithRelationshipsResponse,
  RelationshipResponse,
  SupportResponse,
  TimelineEventResponse,
  toContractResponse,
  toDocumentResponse,
  toMobilityIdentityResponse,
  toRelationshipResponse,
  toSupportResponse,
  toTimelineEventResponse,
} from './mobility.presenter';

@ApiTags('mobility-identities')
@ApiBearerAuth()
@Controller()
export class MobilityController {
  constructor(
    private readonly createMobilityIdentity: CreateMobilityIdentityUseCase,
    private readonly getMobilityIdentity: GetMobilityIdentityUseCase,
    private readonly updateMobilityIdentity: UpdateMobilityIdentityUseCase,
    private readonly listMyIdentities: ListMyIdentitiesUseCase,
    private readonly createRelationship: CreateRelationshipUseCase,
    private readonly revokeRelationship: RevokeRelationshipUseCase,
    private readonly createContract: CreateContractUseCase,
    private readonly listContracts: ListContractsUseCase,
    private readonly createDocument: CreateDocumentUseCase,
    private readonly listDocuments: ListDocumentsUseCase,
    private readonly createSupport: CreateSupportUseCase,
    private readonly listSupports: ListSupportsUseCase,
    private readonly getTimeline: GetTimelineUseCase,
  ) {}

  @Get('users/me/identities')
  @ApiTags('users')
  @ApiOperation({ summary: 'Identités de mobilité liées au compte connecté' })
  @ApiOkResponse({
    type: MobilityIdentityWithRelationshipsResponse,
    isArray: true,
  })
  async myIdentities(
    @CurrentUser() user: User,
  ): Promise<MobilityIdentityWithRelationshipsResponse[]> {
    const items = await this.listMyIdentities.execute(user);
    return items.map((item) => ({
      ...toMobilityIdentityResponse(item.identity),
      relationships: item.relationships.map(toRelationshipResponse),
    }));
  }

  @Post('mobility-identities')
  @ApiOperation({ summary: 'Créer une identité de mobilité' })
  @ApiOkResponse({ type: MobilityIdentityResponse })
  async createIdentity(
    @CurrentUser() user: User,
    @Body() body: CreateMobilityIdentityRequest,
  ): Promise<MobilityIdentityResponse> {
    const identity = await this.createMobilityIdentity.execute(user, body);
    return toMobilityIdentityResponse(identity);
  }

  @Get('mobility-identities/:id')
  @ApiOperation({ summary: 'Détail d’une identité de mobilité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: MobilityIdentityResponse })
  async getIdentity(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MobilityIdentityResponse> {
    const identity = await this.getMobilityIdentity.execute(user, id);
    return toMobilityIdentityResponse(identity);
  }

  @Patch('mobility-identities/:id')
  @ApiOperation({ summary: 'Mettre à jour une identité de mobilité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: MobilityIdentityResponse })
  async updateIdentity(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMobilityIdentityRequest,
  ): Promise<MobilityIdentityResponse> {
    const identity = await this.updateMobilityIdentity.execute(user, id, body);
    return toMobilityIdentityResponse(identity);
  }

  @Post('relationships')
  @ApiTags('relationships')
  @ApiOperation({ summary: 'Lier un compte à une identité de mobilité' })
  @ApiOkResponse({ type: RelationshipResponse })
  async linkRelationship(
    @CurrentUser() user: User,
    @Body() body: CreateRelationshipRequest,
  ): Promise<RelationshipResponse> {
    const relationship = await this.createRelationship.execute(user, body);
    return toRelationshipResponse(relationship);
  }

  @Post('relationships/:id/revoke')
  @ApiTags('relationships')
  @ApiOperation({ summary: 'Révoquer une relation compte ↔ identité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: RelationshipResponse })
  async revokeLink(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RelationshipResponse> {
    const relationship = await this.revokeRelationship.execute(user, id);
    return toRelationshipResponse(relationship);
  }

  @Get('mobility-identities/:id/contracts')
  @ApiTags('contracts')
  @ApiOperation({ summary: 'Lister les contrats d’une identité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ContractResponse, isArray: true })
  async getContracts(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ContractResponse[]> {
    const contracts = await this.listContracts.execute(user, id);
    return contracts.map(toContractResponse);
  }

  @Post('mobility-identities/:id/contracts')
  @ApiTags('contracts')
  @ApiOperation({ summary: 'Créer un contrat pour une identité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ContractResponse })
  async addContract(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateContractRequest,
  ): Promise<ContractResponse> {
    const contract = await this.createContract.execute(user, id, body);
    return toContractResponse(contract);
  }

  @Get('mobility-identities/:id/documents')
  @ApiTags('documents')
  @ApiOperation({ summary: 'Lister les justificatifs d’une identité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: DocumentResponse, isArray: true })
  async getDocuments(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResponse[]> {
    const documents = await this.listDocuments.execute(user, id);
    return documents.map(toDocumentResponse);
  }

  @Post('mobility-identities/:id/documents')
  @ApiTags('documents')
  @ApiOperation({ summary: 'Ajouter un justificatif' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: DocumentResponse })
  async addDocument(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateDocumentRequest,
  ): Promise<DocumentResponse> {
    const document = await this.createDocument.execute(user, id, body);
    return toDocumentResponse(document);
  }

  @Get('mobility-identities/:id/supports')
  @ApiTags('supports')
  @ApiOperation({ summary: 'Lister les supports d’une identité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: SupportResponse, isArray: true })
  async getSupports(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SupportResponse[]> {
    const supports = await this.listSupports.execute(user, id);
    return supports.map(toSupportResponse);
  }

  @Post('mobility-identities/:id/supports')
  @ApiTags('supports')
  @ApiOperation({ summary: 'Ajouter un support (carte physique)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: SupportResponse })
  async addSupport(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CreateSupportRequest,
  ): Promise<SupportResponse> {
    const support = await this.createSupport.execute(user, id, body);
    return toSupportResponse(support);
  }

  @Get('mobility-identities/:id/timeline')
  @ApiTags('timeline')
  @ApiOperation({ summary: 'Historique de vie d’une identité' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TimelineEventResponse, isArray: true })
  async getIdentityTimeline(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TimelineEventResponse[]> {
    const events = await this.getTimeline.execute(user, id);
    return events.map(toTimelineEventResponse);
  }
}
