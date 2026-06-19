import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { User } from '../../users/domain/user';
import { CreateCheckoutSessionRequest } from '../application/dto/create-checkout-session.request';
import { CreateContractCheckoutSessionUseCase } from '../application/use-cases/create-contract-checkout-session.use-case';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('contracts/:id/payment')
export class PaymentsController {
  constructor(
    private readonly createCheckoutSession: CreateContractCheckoutSessionUseCase,
  ) {}

  @Post('checkout-session')
  @ApiOperation({
    summary: 'Creer une session Stripe Checkout pour payer un contrat',
  })
  @ApiCreatedResponse()
  async createContractCheckoutSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: CreateCheckoutSessionRequest,
  ) {
    return this.createCheckoutSession.execute(id, user.id, body);
  }
}
