import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
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
import { GetContractUseCase } from '../application/use-cases/get-contract.use-case';
import { GetSignatureStatusUseCase } from '../application/use-cases/get-signature-status.use-case';
import { SignContractUseCase } from '../application/use-cases/sign-contract.use-case';

@ApiTags('contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly createContract: CreateContractUseCase,
    private readonly getContract: GetContractUseCase,
    private readonly signContract: SignContractUseCase,
    private readonly getSignatureStatus: GetSignatureStatusUseCase,
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
      holderEmail: c.holderEmail,
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
      payerEmail: contract.payerEmail,
      cgvuVersion: contract.cgvuVersion,
      yousignSignatureLink: contract.yousignSignatureLink,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
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
}
