import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';
import { User } from '../../users/domain/user';
import { AgentDecisionRequest } from '../application/dto/agent-decision.request';
import { UploadJustificatifRequest } from '../application/dto/upload-justificatif.request';
import { ListJustificatifsUseCase } from '../application/use-cases/list-justificatifs.use-case';
import { RefuseJustificatifUseCase } from '../application/use-cases/refuse-justificatif.use-case';
import { UploadJustificatifUseCase } from '../application/use-cases/upload-justificatif.use-case';
import { ValidateJustificatifUseCase } from '../application/use-cases/validate-justificatif.use-case';
import {
  JustificatifResponse,
  toJustificatifResponse,
} from './justificatif.presenter';

@ApiTags('justificatifs')
@ApiBearerAuth()
@Controller('justificatifs')
export class JustificatifsController {
  constructor(
    private readonly upload: UploadJustificatifUseCase,
    private readonly list: ListJustificatifsUseCase,
    private readonly validate: ValidateJustificatifUseCase,
    private readonly refuse: RefuseJustificatifUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Déposer un justificatif' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ type: JustificatifResponse })
  @UseInterceptors(FileInterceptor('file'))
  async uploadJustificatif(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadJustificatifRequest,
  ): Promise<JustificatifResponse> {
    if (!file) {
      throw new BadRequestException('Fichier requis');
    }

    const justificatif = await this.upload.execute({
      userId: user.id,
      contractId: body.contractId,
      type: body.type,
      fileBuffer: file.buffer,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      firstName: body.firstName,
      lastName: body.lastName,
    });
    return toJustificatifResponse(justificatif);
  }

  @Get()
  @ApiOperation({ summary: "Lister les justificatifs d'un contrat" })
  @ApiOkResponse({ type: JustificatifResponse, isArray: true })
  async findByContract(
    @Query('contractId', ParseUUIDPipe) contractId: string,
  ): Promise<JustificatifResponse[]> {
    const items = await this.list.execute(contractId);
    return items.map(toJustificatifResponse);
  }

  @Get('pending')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "File d'attente agent (admin)" })
  @ApiOkResponse({ type: JustificatifResponse, isArray: true })
  async pending(): Promise<JustificatifResponse[]> {
    const items = await this.list.executePending();
    return items.map(toJustificatifResponse);
  }

  @Patch(':id/validate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Valider un justificatif (agent)' })
  @ApiOkResponse({ type: JustificatifResponse })
  async validateOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: AgentDecisionRequest,
  ): Promise<JustificatifResponse> {
    const result = await this.validate.execute({
      justificatifId: id,
      agentId: user.id,
      motif: body.motif,
    });
    return toJustificatifResponse(result);
  }

  @Patch(':id/refuse')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Refuser un justificatif (agent)' })
  @ApiOkResponse({ type: JustificatifResponse })
  async refuseOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: AgentDecisionRequest,
  ): Promise<JustificatifResponse> {
    const result = await this.refuse.execute({
      justificatifId: id,
      agentId: user.id,
      motif: body.motif ?? '',
    });
    return toJustificatifResponse(result);
  }
}
