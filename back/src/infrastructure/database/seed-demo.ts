/**
 * Seed script — Démo 1 : Parent + enfant (Imagine R Scolaire)
 *
 * Usage (after running migrations):
 *   pnpm ts-node -r tsconfig-paths/register src/infrastructure/database/seed-demo.ts
 *
 * This creates:
 *  - 1 user  (parent/payeur)
 *  - 1 contract  Imagine R Scolaire (en_attente_de_justificatif)
 *
 * The user can then:
 *  1. Log in with the seeded credentials
 *  2. Navigate to /contrat/<contractId>
 *  3. Upload a pièce d'identité → YouSign pre-qualification
 *  4. Agent validates in /admin/dossiers
 *  5. Click "Signer les CGVU" → YouSign → webhook → contract actif
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './typeorm.config';
import { ContractOrmEntity } from '../../modules/contracts/infrastructure/contract.orm-entity';
import { ContractStatus } from '../../modules/contracts/domain/contract';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const ds = new DataSource({
    ...dataSourceOptions,
    entities: [...(dataSourceOptions.entities as never[]), ContractOrmEntity],
  });

  await ds.initialize();
  console.log('Connected to database');

  const userId = randomUUID();
  const passwordHash = await bcrypt.hash('Demo1234!', 10);

  // Insert parent user
  await ds.query(
    `INSERT INTO users (id, provider, "providerSubject", email, "displayName", roles, "createdAt", "updatedAt", "passwordHash")
     VALUES ($1, 'local', $2, $3, $4, 'USER', now(), now(), $5)
     ON CONFLICT (provider, "providerSubject") DO NOTHING`,
    [
      userId,
      `demo-parent-${userId}`,
      'parent.demo@comutitres.fr',
      'Marie Dupont',
      passwordHash,
    ],
  );

  // Create Imagine R Scolaire contract
  const contractRepo = ds.getRepository(ContractOrmEntity);
  const existing = await contractRepo.findOne({
    where: { userId, productCode: 'imagine_r_scolaire' },
  });

  if (!existing) {
    const contract = contractRepo.create({
      id: randomUUID(),
      userId,
      productCode: 'imagine_r_scolaire',
      status: ContractStatus.EN_ATTENTE_DE_JUSTIFICATIF,
      holderFirstName: 'Lucas',
      holderLastName: 'Dupont',
      holderEmail: 'parent.demo@comutitres.fr',
      payerFirstName: 'Marie',
      payerLastName: 'Dupont',
      payerEmail: 'parent.demo@comutitres.fr',
      cgvuVersion: '2025-v1',
    });
    await contractRepo.save(contract);
    console.log(`✓ Contract created: ${contract.id}`);
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('  Demo credentials:');
    console.log('  Email    : parent.demo@comutitres.fr');
    console.log('  Password : Demo1234!');
    console.log(`  Contract : /contrat/${contract.id}`);
    console.log('═══════════════════════════════════════════════');
  } else {
    console.log(`Contract already exists: ${existing.id}`);
  }

  await ds.destroy();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
