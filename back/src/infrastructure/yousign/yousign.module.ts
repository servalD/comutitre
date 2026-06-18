import { Module } from '@nestjs/common';
import { YousignClient } from './yousign.client';
import { CgvuPdfGenerator } from './cgvu-pdf.generator';

@Module({
  providers: [YousignClient, CgvuPdfGenerator],
  exports: [YousignClient, CgvuPdfGenerator],
})
export class YousignModule {}
