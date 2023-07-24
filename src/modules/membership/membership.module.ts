import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entities/membership.entity';
import { MembershipType } from 'src/modules/membership_types/entities/membership_type.entity';
import { Member } from '../member/entities/member.entity';
import { Payment } from '../payment/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership, MembershipType, Member, Payment]),
  ],
  controllers: [MembershipController],
  providers: [MembershipService],
})
export class MembershipModule {}
