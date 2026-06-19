import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../users/domain/user';
import { CreateContractRequest } from '../application/dto/create-contract.request';
import { CreateContractUseCase } from '../application/use-cases/create-contract.use-case';
import { GetCgvuPreviewUseCase } from '../application/use-cases/get-cgvu-preview.use-case';
import { GetContractDocumentsReadinessUseCase } from '../application/use-cases/get-contract-documents-readiness.use-case';
import { GetContractUseCase } from '../application/use-cases/get-contract.use-case';
import { GetSignatureStatusUseCase } from '../application/use-cases/get-signature-status.use-case';
import { SignContractUseCase } from '../application/use-cases/sign-contract.use-case';
import { ConfirmMockPaymentUseCase } from '../application/use-cases/confirm-mock-payment.use-case';
import { ConfirmMockValidationUseCase } from '../application/use-cases/confirm-mock-validation.use-case';

@ApiTags('contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly createContract: CreateContractUseCase,
    private readonly getContract: GetContractUseCase,
    private readonly getDocumentsReadiness: GetContractDocumentsReadinessUseCase,
    private readonly getCgvuPreview: GetCgvuPreviewUseCase,
    private readonly signContract: SignContractUseCase,
    private readonly getSignatureStatus: GetSignatureStatusUseCase,
    private readonly confirmMockPayment: ConfirmMockPaymentUseCase,
    private readonly confirmMockValidation: ConfirmMockValidationUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau contrat' })
  @ApiCreatedResponse()
  async create(@CurrentUser() user: User, @Body() body: CreateContractRequest) {
    const contract = await this.createContract.execute(user.id, body);
    return {
      id: contract.id,
      status: contract.status,
      productCode: contract.productCode,
      holderFirstName: contract.holderFirstName,
      holderLastName: contract.holderLastName,
      holderEmail: contract.holderEmail,
      payerFirstName: contract.payerFirstName,
      payerLastName: contract.payerLastName,
      payerEmail: contract.payerEmail,
      legalRepEmail: contract.legalRepEmail,
      cgvuVersion: contract.cgvuVersion,
      yousignSignatureLink: contract.yousignSignatureLink,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Mes contrats' })
  @ApiOkResponse()
  async myContracts(@CurrentUser() user: User) {
    const contracts = await this.getContract.executeForUser(user.id);
    return contracts.map((c) => ({
      id: c.id,
      status: c.status,
      productCode: c.productCode,
      holderFirstName: c.holderFirstName,
      holderLastName: c.holderLastName,
      holderEmail: c.holderEmail,
      payerFirstName: c.payerFirstName,
      payerLastName: c.payerLastName,
      payerEmail: c.payerEmail,
      legalRepEmail: c.legalRepEmail,
      cgvuVersion: c.cgvuVersion,
      yousignSignatureLink: c.yousignSignatureLink,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un contrat" })
  @ApiOkResponse()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const contract = await this.getContract.execute(id, user.id);
    return {
      id: contract.id,
      status: contract.status,
      productCode: contract.productCode,
      holderFirstName: contract.holderFirstName,
      holderLastName: contract.holderLastName,
      holderEmail: contract.holderEmail,
      payerFirstName: contract.payerFirstName,
      payerLastName: contract.payerLastName,
      payerEmail: contract.payerEmail,
      legalRepEmail: contract.legalRepEmail,
      cgvuVersion: contract.cgvuVersion,
      yousignSignatureLink: contract.yousignSignatureLink,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }

  @Get(':id/documents/readiness')
  @ApiOperation({
    summary: 'État de complétude des justificatifs requis pour la signature',
  })
  @ApiOkResponse()
  async documentsReadiness(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getDocumentsReadiness.execute(id, user.id);
  }

  @Get(':id/cgvu/preview')
  @ApiOperation({ summary: 'Prévisualiser le PDF CGVU du contrat' })
  async cgvuPreview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const pdf = await this.getCgvuPreview.execute(id, user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="cgvu-${id.slice(0, 8)}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  }

  @Post(':id/signature')
  @ApiOperation({ summary: 'Déclencher la signature YouSign des CGVU' })
  @ApiCreatedResponse()
  async startSignature(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.signContract.execute(id, user.id);
  }

  @Get(':id/signature/status')
  @ApiOperation({
    summary: 'Statut de la procédure YouSign (polling de secours)',
  })
  @ApiOkResponse()
  async signatureStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.getSignatureStatus.execute(id, user.id);
  }

  @Post(':id/payment/confirm')
  @ApiOperation({ summary: 'Confirmer le paiement simulé (hackathon)' })
  @ApiOkResponse()
  async confirmPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.confirmMockPayment.execute(id, user.id);
  }

  @Post(':id/validation/confirm')
  @ApiOperation({ summary: 'Valider le dossier simulé par nos équipes (hackathon)' })
  @ApiOkResponse()
  async confirmValidation(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.confirmMockValidation.execute(id, user.id);
  }
}
