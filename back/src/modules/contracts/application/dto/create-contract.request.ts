import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum ProductCode {
  NAVIGO_ANNUEL = 'navigo_annuel',
  NAVIGO_ANNUEL_SENIOR = 'navigo_annuel_senior',
  IMAGINE_R_SCOLAIRE = 'imagine_r_scolaire',
  IMAGINE_R_JUNIOR = 'imagine_r_junior',
  IMAGINE_R_ETUDIANT = 'imagine_r_etudiant',
  NAVIGO_LIBERTE_PLUS = 'navigo_liberte_plus',
  TST = 'tst',
  AMETHYSTE = 'amethyste',
}

export class CreateContractRequest {
  @ApiProperty({ enum: ProductCode })
  @IsEnum(ProductCode)
  productCode: ProductCode;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  holderFirstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  holderLastName: string;

  @ApiProperty()
  @IsEmail()
  holderEmail: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  payerFirstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  payerLastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  payerEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  legalRepEmail?: string;
}
