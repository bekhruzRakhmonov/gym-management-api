import { Module } from '@nestjs/common';
import { MembershipTypesService } from './membership_types.service';
import { MembershipTypesController } from './membership_types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipType } from './entities/membership_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipType])],
  controllers: [MembershipTypesController],
  providers: [MembershipTypesService],
})
export class MembershipTypesModule {}
