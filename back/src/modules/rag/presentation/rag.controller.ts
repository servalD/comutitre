import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../../shared/decorators/public.decorator';
import { ChatRequestDto } from '../application/dto/chat.request';
import { RagService } from '../application/rag.service';
import { RagStreamEvent } from '../domain/rag.types';

@ApiTags('rag')
@Controller('rag')
export class RagController {
  constructor(private readonly rag: RagService) {}

  /**
   * Public so the chatbot also works on unauthenticated screens (login/register).
   * Streams NDJSON: one JSON event per line — `token` deltas, then `done` with
   * sources, or `error` on failure.
   */
  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'Assistant RAG (réponse streamée en NDJSON)' })
  async chat(@Body() dto: ChatRequestDto, @Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const write = (event: RagStreamEvent) =>
      res.write(JSON.stringify(event) + '\n');

    try {
      for await (const event of this.rag.streamAnswer(
        dto.question,
        dto.history ?? [],
        dto.language ?? 'fr',
      )) {
        write(event);
      }
    } catch (err) {
      write({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur interne',
      });
    } finally {
      res.end();
    }
  }
}
