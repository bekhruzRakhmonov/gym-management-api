import { Module } from '@nestjs/common';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Visit } from './entities/visit.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visit, Member, User])],
  controllers: [VisitController],
  providers: [VisitService],
})
export class VisitModule {}
