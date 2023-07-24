import { PartialType } from '@nestjs/swagger';
import { CreateMembershipTypeDto } from './create-membership_type.dto';

export class UpdateMembershipTypeDto extends PartialType(
  CreateMembershipTypeDto,
) {}
