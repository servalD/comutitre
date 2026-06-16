import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { Role } from '../../../../shared/enums/role.enum';

export class SetRolesRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
