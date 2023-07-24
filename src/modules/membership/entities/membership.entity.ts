import { ParentEntity } from 'src/common/entities/parent.entity';
import { Member } from 'src/modules/member/entities/member.entity';
import { MembershipType } from 'src/modules/membership_types/entities/membership_type.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Term } from '../../membership_types/enums/term.enum';
import { Payment } from 'src/modules/payment/entities/payment.entity';

@Entity()
export class Membership extends ParentEntity {
  @ManyToOne(
    () => MembershipType,
    (membership_type: MembershipType) => membership_type.membership,
    {
      onDelete: 'CASCADE',
    },
  )
  membership_type: MembershipType;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date;

  @ManyToOne(() => Member, (member: Member) => member.memberships)
  member: Member;

  @OneToOne(() => Payment, (payment: Payment) => payment.membership)
  @JoinColumn()
  payment: Payment;
}
