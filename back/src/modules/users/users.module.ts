import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/typeorm-user.repository';
import { UserRepository } from './domain/user.repository';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { SyncUserUseCase } from './application/use-cases/sync-user.use-case';
import { SetUserRoleUseCase } from './application/use-cases/set-user-role.use-case';
import { UsersController } from './presentation/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    // Bind the port to its TypeORM adapter.
    { provide: UserRepository, useClass: TypeOrmUserRepository },
    GetUsersUseCase,
    SyncUserUseCase,
    SetUserRoleUseCase,
  ],
  // SyncUserUseCase is consumed by the auth layer (global guard).
  exports: [SyncUserUseCase, UserRepository],
})
export class UsersModule {}
