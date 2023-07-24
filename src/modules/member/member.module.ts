import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Membership } from 'src/modules/membership/entities/membership.entity';
import { Payment } from '../payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Membership, Payment])],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
