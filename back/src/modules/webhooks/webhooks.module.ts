import { Module } from '@nestjs/common';
import { ContractsModule } from '../contracts/contracts.module';
import { JustificatifsModule } from '../justificatifs/justificatifs.module';
import { YousignWebhookController } from './presentation/yousign-webhook.controller';

@Module({
  imports: [ContractsModule, JustificatifsModule],
  controllers: [YousignWebhookController],
})
export class WebhooksModule {}
