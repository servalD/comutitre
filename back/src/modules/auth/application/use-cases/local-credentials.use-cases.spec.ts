import { ConflictException } from '@nestjs/common';
import { ProvisionOwnerMobilityIdentityUseCase } from '../../../mobility/application/use-cases/provision-owner-mobility-identity.use-case';
import { AppJwtService } from '../../infrastructure/app-jwt.service';
import { InMemoryUserRepository } from '../../../users/infrastructure/in-memory-user.repository';
import { LoginWithCredentialsUseCase } from './login-with-credentials.use-case';
import { RegisterUseCase } from './register.use-case';

const createUseCases = () => {
  const userRepository = new InMemoryUserRepository();
  const sign = jest.fn((identity: { subject: string }) =>
    Promise.resolve(identity.subject),
  );
  const appJwtService = {
    sign,
  } as unknown as AppJwtService;
  const provisionOwnerIdentity = {
    execute: jest.fn().mockResolvedValue({ id: 'identity-1' }),
  } as unknown as ProvisionOwnerMobilityIdentityUseCase;

  return {
    userRepository,
    sign,
    appJwtService,
    provisionOwnerIdentity,
    registerUseCase: new RegisterUseCase(
      userRepository,
      appJwtService,
      provisionOwnerIdentity,
    ),
    loginUseCase: new LoginWithCredentialsUseCase(
      userRepository,
      appJwtService,
    ),
  };
};

describe('local credentials auth use cases', () => {
  it('stores local account e-mails trimmed and lower-cased', async () => {
    const { registerUseCase, userRepository, sign } = createUseCases();

    const result = await registerUseCase.execute({
      firstName: 'Marie',
      lastName: 'Dupont',
      birthDate: '1990-03-15',
      email: '  Marie.Dupont@Example.FR  ',
      password: 'MotDePasse123!',
    });

    expect(result.accessToken).toBe('marie.dupont@example.fr');
    await expect(
      userRepository.findLocalByEmail('marie.dupont@example.fr'),
    ).resolves.toMatchObject({
      user: {
        email: 'marie.dupont@example.fr',
        providerSubject: 'marie.dupont@example.fr',
      },
    });
    expect(sign).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'marie.dupont@example.fr',
        email: 'marie.dupont@example.fr',
      }),
    );
  });

  it('rejects duplicate local accounts regardless of e-mail case or spaces', async () => {
    const { registerUseCase } = createUseCases();

    await registerUseCase.execute({
      firstName: 'Marie',
      lastName: 'Dupont',
      birthDate: '1990-03-15',
      email: 'marie.dupont@example.fr',
      password: 'MotDePasse123!',
    });

    await expect(
      registerUseCase.execute({
        firstName: 'Marie',
        lastName: 'Dupont',
        birthDate: '1990-03-15',
        email: '  MARIE.DUPONT@EXAMPLE.FR  ',
        password: 'AutreMotDePasse123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with e-mail case and surrounding spaces normalized', async () => {
    const { registerUseCase, loginUseCase } = createUseCases();

    await registerUseCase.execute({
      firstName: 'Marie',
      lastName: 'Dupont',
      birthDate: '1990-03-15',
      email: 'marie.dupont@example.fr',
      password: 'MotDePasse123!',
    });

    await expect(
      loginUseCase.execute({
        email: '  MARIE.DUPONT@EXAMPLE.FR  ',
        password: 'MotDePasse123!',
      }),
    ).resolves.toEqual({ accessToken: 'marie.dupont@example.fr' });
  });
});
