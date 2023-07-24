import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/modules/member/entities/member.entity';
import { Payment } from './entities/payment.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { PaymentDetail } from './entities/payment-detail.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Member,
      Product,
      PaymentDetail,
      Inventory,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
