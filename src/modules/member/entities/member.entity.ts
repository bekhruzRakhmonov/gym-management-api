import { ParentEntity } from 'src/common/entities/parent.entity';
import { Membership } from 'src/modules/membership/entities/membership.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import { Visit } from 'src/modules/visit/entities/visit.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

@Entity()
export class Member extends ParentEntity {
  @Column({ type: 'varchar', length: 255 })
  fullname: string;

  @Column({ type: 'varchar', length: 255 })
  phone: string;

  @Column({ type: 'enum', enum: ['male', 'female'] })
  gender: 'male' | 'female';

  @Column({ type: 'timestamp', nullable: true })
  date_of_birth: Date;

  @OneToMany(() => Membership, (membership: Membership) => membership.member)
  @JoinColumn()
  memberships: Membership[];

  @OneToMany(() => Visit, (visit: Visit) => visit.member)
  visit: Visit[];

  @OneToMany(() => Payment, (payment: Payment) => payment.member)
  payments: Payment[];
}
