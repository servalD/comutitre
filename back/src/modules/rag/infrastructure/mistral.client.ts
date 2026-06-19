import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mistral } from '@mistralai/mistralai';
import { Env } from '../../../infrastructure/config/env.validation';
import { ChatMessage } from '../domain/rag.types';

export interface DocumentAnalysisResult {
  conforme: boolean;
  motif: string;
}

/**
 * Thin wrapper over the official Mistral SDK. Holds the API key server-side and
 * exposes just what the RAG flow needs: batch embeddings and a streamed chat.
 */
@Injectable()
export class MistralClient {
  private readonly client: Mistral | null;
  private readonly chatModel: string;
  private readonly embedModel: string;
  private readonly visionModel: string;

  constructor(config: ConfigService<Env, true>) {
    const apiKey = config.get('MISTRAL_API_KEY', { infer: true });
    const serverURL = config.get('MISTRAL_BASE_URL', { infer: true });
    this.client = apiKey ? new Mistral({ apiKey, serverURL }) : null;
    this.chatModel = config.get('MISTRAL_CHAT_MODEL', { infer: true });
    this.embedModel = config.get('MISTRAL_EMBED_MODEL', { infer: true });
    this.visionModel = config.get('MISTRAL_VISION_MODEL', { infer: true });
  }

  get hasKey(): boolean {
    return this.client !== null;
  }

  private require(): Mistral {
    if (!this.client) {
      throw new Error(
        "L'assistant n'est pas configuré (MISTRAL_API_KEY manquante côté serveur).",
      );
    }
    return this.client;
  }

  /** Embed a batch of texts. Returns one vector per input, in order. */
  async embed(inputs: string[]): Promise<number[][]> {
    const res = await this.require().embeddings.create({
      model: this.embedModel,
      inputs,
    });
    return res.data.map((d) => {
      if (!d.embedding) {
        throw new Error('Embedding vide renvoyé par Mistral');
      }
      return d.embedding;
    });
  }

  /** Analyse a document image with a vision model. Returns structured JSON. */
  async analyzeDocumentImage(
    fileBuffer: Buffer,
    mimeType: string,
    prompt: string,
  ): Promise<DocumentAnalysisResult> {
    const base64 = fileBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const res = await this.require().chat.complete({
      model: this.visionModel,
      temperature: 0.1,
      responseFormat: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', imageUrl: dataUrl },
          ],
        },
      ],
    });

    const raw = res.choices[0]?.message?.content;
    const text =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw
              .map((part) =>
                typeof part === 'string'
                  ? part
                  : 'text' in part && typeof part.text === 'string'
                    ? part.text
                    : '',
              )
              .join('')
          : '';

    try {
      const parsed = JSON.parse(text) as {
        conforme?: boolean;
        motif?: string;
      };
      return {
        conforme: parsed.conforme === true,
        motif: parsed.motif?.trim() || 'Analyse automatique terminée.',
      };
    } catch {
      return {
        conforme: false,
        motif:
          'Réponse IA illisible — merci de déposer un document plus lisible.',
      };
    }
  }

  /** Stream a chat completion, yielding text deltas as they arrive. */
  async *streamChat(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.require().chat.stream({
      model: this.chatModel,
      messages,
      temperature: 0.2,
    });
    for await (const event of stream) {
      const content = event.data.choices[0]?.delta?.content;
      if (typeof content === 'string' && content.length > 0) {
        yield content;
      }
    }
  }
}
