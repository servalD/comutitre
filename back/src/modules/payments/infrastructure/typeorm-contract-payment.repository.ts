import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractPayment } from '../domain/contract-payment';
import { ContractPaymentRepository } from '../domain/contract-payment.repository';
import { ContractPaymentOrmEntity } from './contract-payment.orm-entity';

@Injectable()
export class TypeOrmContractPaymentRepository extends ContractPaymentRepository {
  constructor(
    @InjectRepository(ContractPaymentOrmEntity)
    private readonly orm: Repository<ContractPaymentOrmEntity>,
  ) {
    super();
  }

  async save(payment: ContractPayment): Promise<ContractPayment> {
    const saved = await this.orm.save(this.toOrm(payment));
    return this.toDomain(saved);
  }

  async findByCheckoutSessionId(
    checkoutSessionId: string,
  ): Promise<ContractPayment | null> {
    const entity = await this.orm.findOne({ where: { checkoutSessionId } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByProviderEventId(
    providerEventId: string,
  ): Promise<ContractPayment | null> {
    const entity = await this.orm.findOne({ where: { providerEventId } });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: ContractPaymentOrmEntity): ContractPayment {
    return new ContractPayment(
      entity.id,
      entity.contractId,
      entity.userId,
      entity.provider,
      entity.checkoutSessionId,
      entity.paymentIntentId,
      entity.providerEventId,
      entity.status,
      entity.amountCents,
      entity.currency,
      entity.payMode,
      entity.checkoutUrl,
      entity.paidAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toOrm(payment: ContractPayment): ContractPaymentOrmEntity {
    const entity = new ContractPaymentOrmEntity();
    entity.id = payment.id;
    entity.contractId = payment.contractId;
    entity.userId = payment.userId;
    entity.provider = payment.provider;
    entity.checkoutSessionId = payment.checkoutSessionId;
    entity.paymentIntentId = payment.paymentIntentId;
    entity.providerEventId = payment.providerEventId;
    entity.status = payment.status;
    entity.amountCents = payment.amountCents;
    entity.currency = payment.currency;
    entity.payMode = payment.payMode;
    entity.checkoutUrl = payment.checkoutUrl;
    entity.paidAt = payment.paidAt;
    return entity;
  }
}
