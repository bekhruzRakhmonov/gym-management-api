import { ParentEntity } from 'src/common/entities/parent.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { PaymentDetail } from './payment-detail.entity';
import { Membership } from 'src/modules/membership/entities/membership.entity';

@Entity()
export class Payment extends ParentEntity {
  @Column({ type: 'enum', enum: ['membership', 'products'] })
  for_what: 'membership' | 'products';

  @Column({ type: 'enum', enum: ['unpaid', 'paid'] })
  paid_status: 'unpaid' | 'paid';

  @Column({ type: 'enum', enum: ['credit_card', 'cash'] })
  payment_method: 'credit_card' | 'cash';

  @Column({ type: 'decimal' })
  total: number;

  @ManyToOne(() => Member, (member: Member) => member.payments)
  member: Member;

  @OneToOne(() => Membership, (membership: Membership) => membership.payment)
  membership: Membership;

  @OneToMany(
    () => PaymentDetail,
    (payment_detail: PaymentDetail) => payment_detail.payment,
  )
  @JoinColumn()
  payment_details: PaymentDetail[];
}
