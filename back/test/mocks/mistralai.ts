/**
 * Test stub for the ESM-only `@mistralai/mistralai` SDK. The package ships only
 * an ESM build, which Jest (CommonJS) cannot parse. The e2e suites boot the full
 * AppModule but never exercise the RAG flow, so a no-op class is enough to let
 * MistralClient construct without hitting the real SDK.
 */
export class Mistral {
  embeddings = {
    create: () => Promise.reject(new Error('Mistral SDK is stubbed in tests')),
  };
  chat = {
    stream: () => Promise.reject(new Error('Mistral SDK is stubbed in tests')),
  };
  constructor(_opts?: unknown) {
    void _opts;
  }
}
