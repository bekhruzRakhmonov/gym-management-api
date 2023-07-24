import { config } from 'dotenv';
import { Activity } from 'src/modules/activity/entities/activity.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import { Membership } from 'src/modules/membership/entities/membership.entity';
import { MembershipType } from 'src/modules/membership_types/entities/membership_type.entity';
import { PaymentDetail } from 'src/modules/payment/entities/payment-detail.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { ProductType } from 'src/modules/product/entities/product-type.entity';
import { Product } from 'src/modules/product/entities/product.entity';
config();
import { User } from 'src/modules/user/entities/user.entity';
import { Visit } from 'src/modules/visit/entities/visit.entity';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { Subscriber } from '../subscribers/subscriber.event';

export const typeOrmConfig: MysqlConnectionOptions = {
  name: 'default',
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    Activity,
    User,
    Inventory,
    Member,
    Membership,
    MembershipType,
    Product,
    ProductType,
    Visit,
    Payment,
    PaymentDetail,
  ],
  subscribers: [Subscriber],
  logger: 'advanced-console',
  logging: ['error', 'warn'],
  // Setting synchronize: true
  // shouldn't be used in production
  // otherwise you can lose production data.
  synchronize: true,
  connectTimeout: 20000,
};
