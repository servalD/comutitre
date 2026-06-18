import { BadRequestException, Injectable } from '@nestjs/common';
import { EducationRegistryPort } from '../ports/education-registry.port';
import { EducationInstitution } from '../../domain/external-api.types';

@Injectable()
export class SearchEducationInstitutionsUseCase {
  constructor(private readonly educationRegistry: EducationRegistryPort) {}

  execute(params: {
    query: string;
    limit?: number;
  }): Promise<EducationInstitution[]> {
    const query = params.query.trim();
    if (query.length < 2) {
      return Promise.reject(
        new BadRequestException('query must contain at least 2 characters'),
      );
    }

    return this.educationRegistry.search(query, params.limit ?? 5);
  }
}
