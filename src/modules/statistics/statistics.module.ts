import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/modules/member/entities/member.entity';
import { Visit } from 'src/modules/visit/entities/visit.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Visit, Inventory, Payment])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
