import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  KeyObject,
} from 'node:crypto';
import * as jwt from 'jsonwebtoken';
import { Env } from '../../../infrastructure/config/env.validation';

export interface DynamicExternalJwtInput {
  userId: string;
  email: string | null;
  holderId: string;
  identityProvider: string;
}

export interface DynamicExternalJwtResult {
  externalJwt: string;
  externalUserId: string;
  expiresIn: number;
  issuer: string;
  audience: string;
  jwksUrl: string;
}

interface JsonWebKeySet {
  keys: Array<Record<string, unknown>>;
}

@Injectable()
export class DynamicExternalJwtService {
  private readonly privateKey: KeyObject;
  private readonly publicKey: KeyObject;

  constructor(private readonly config: ConfigService<Env, true>) {
    const configuredPrivateKey = (
      this.config.get('DYNAMIC_EXTERNAL_JWT_PRIVATE_KEY', { infer: true }) ?? ''
    )
      .replace(/\\n/g, '\n')
      .trim();
    if (configuredPrivateKey) {
      this.privateKey = createPrivateKey(configuredPrivateKey);
      this.publicKey = createPublicKey(this.privateKey);
      return;
    }

    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  issueForUser(
    input: DynamicExternalJwtInput,
  ): Promise<DynamicExternalJwtResult> {
    const expiresIn = 5 * 60;
    const externalJwt = jwt.sign(
      {
        email: input.email ?? undefined,
        emailVerified: true,
        holder_id: input.holderId,
        identity_provider: input.identityProvider,
      },
      this.privateKey,
      {
        algorithm: 'RS256',
        issuer: this.issuer,
        audience: this.audience,
        subject: input.userId,
        expiresIn,
        keyid: this.kid,
      },
    );

    return Promise.resolve({
      externalJwt,
      externalUserId: input.userId,
      expiresIn,
      issuer: this.issuer,
      audience: this.audience,
      jwksUrl: `${this.issuer}/.well-known/jwks.json`,
    });
  }

  getJwks(): Promise<JsonWebKeySet> {
    return Promise.resolve({
      keys: [
        {
          ...this.publicKey.export({ format: 'jwk' }),
          kid: this.kid,
          use: 'sig',
          alg: 'RS256',
        },
      ],
    });
  }

  private get issuer(): string {
    return this.config.get('DYNAMIC_EXTERNAL_JWT_ISSUER', {
      infer: true,
    });
  }

  private get audience(): string {
    return this.config.get('DYNAMIC_EXTERNAL_JWT_AUDIENCE', {
      infer: true,
    });
  }

  private get kid(): string {
    return this.config.get('DYNAMIC_EXTERNAL_JWT_KID', {
      infer: true,
    });
  }
}
