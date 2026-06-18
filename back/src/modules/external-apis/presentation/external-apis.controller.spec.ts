import 'reflect-metadata';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';
import { ExternalApisController } from './external-apis.controller';

const handler = (name: string): unknown =>
  Object.getOwnPropertyDescriptor(ExternalApisController.prototype, name)
    ?.value;

describe('ExternalApisController route exposure', () => {
  it('keeps sensitive eligibility and internal mobility checks behind auth', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, ExternalApisController)).toBe(
      undefined,
    );
    expect(
      Reflect.getMetadata(IS_PUBLIC_KEY, handler('checkEligibility')),
    ).toBe(undefined);
    expect(
      Reflect.getMetadata(IS_PUBLIC_KEY, handler('checkInternalMobility')),
    ).toBe(undefined);
  });

  it('keeps only low-sensitivity lookup endpoints public', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, handler('searchAddresses'))).toBe(
      true,
    );
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, handler('findCommunes'))).toBe(
      true,
    );
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        handler('searchEducationInstitutions'),
      ),
    ).toBe(true);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, handler('findCompany'))).toBe(
      undefined,
    );
  });
});
