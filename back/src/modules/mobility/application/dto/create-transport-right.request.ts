import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { ProductType } from '../../domain/enums/product-type.enum';

export class CreateTransportRightRequest {
  @IsUUID()
  contractId: string;

  @IsEnum(ProductType)
  productType: ProductType;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validTo: string;
}
