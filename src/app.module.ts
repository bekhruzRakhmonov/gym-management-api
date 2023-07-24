import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './common/config/typeorm.config';
import { MemberModule } from './modules/member/member.module';
import { MembershipModule } from './modules/membership/membership.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProductModule } from './modules/product/product.module';
import { MembershipTypesModule } from './modules/membership_types/membership_types.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { VisitModule } from './modules/visit/visit.module';
import { MiddlewareConsumer } from '@nestjs/common/interfaces/middleware';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ActivityModule } from './modules/activity/activity.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './modules/membership/scheduler/scheduler.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'media'),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    AuthModule,
    MemberModule,
    MembershipModule,
    PaymentModule,
    ProductModule,
    MembershipTypesModule,
    InventoryModule,
    VisitModule,
    ActivityModule,
    StatisticsModule,
  ],
  providers: [TasksService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('');
  }
}
